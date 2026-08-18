import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import {fileURLToPath} from "node:url";
import {args,readJson,writeJson} from "./lib/common.mjs";
import {validateJsonSchema} from "./lib/json-schema-lite.mjs";
import {buildPage9RatioRequest,matchTemplateCapabilities} from "./lib/template-capability-matcher-v6.mjs";

const a=args(),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),out=path.resolve(a.out||path.join(root,"..","template-capability-audit"));
await fs.mkdir(out,{recursive:true});
const files={
  planner5:path.join(root,"scripts/plan-deck-v5.mjs"),
  renderer:path.join(root,"scripts/build-deck-v5.mjs"),
  compositionSolver:path.join(root,"scripts/lib/composition-solver.mjs"),
  sourceTemplate:path.join(root,"assets/templates/base-template-23p-capability-source.pptx")
};
const hash=async file=>crypto.createHash("sha256").update(await fs.readFile(file)).digest("hex"),before=Object.fromEntries(await Promise.all(Object.entries(files).map(async([key,file])=>[key,await hash(file)])));
const manifest=await readJson(path.join(root,"references/template-capability-manifest.json")),map=await readJson(path.join(root,"references/visual-grammar-template-map.json")),library=await readJson(path.join(root,"references/visual-grammar-library.json"));
const manifestSchema=await readJson(path.join(root,"schemas/template-capability-manifest.schema.json")),mapSchema=await readJson(path.join(root,"schemas/visual-grammar-template-map.schema.json"));
const tests=[],record=(name,fn)=>{try{fn();tests.push({name,status:"pass"});}catch(error){tests.push({name,status:"fail",message:error.message});}};
record("manifest JSON Schema passes",()=>assert.equal(validateJsonSchema(manifest,manifestSchema).status,"pass"));
record("mapping JSON Schema passes",()=>assert.equal(validateJsonSchema(map,mapSchema).status,"pass"));
record("manifest contains ordered T01-T23",()=>assert.deepEqual(manifest.templates.map(x=>x.template_id),Array.from({length:23},(_,i)=>`T${String(i+1).padStart(2,"0")}`)));
record("source template hash matches manifest",()=>assert.equal(before.sourceTemplate,manifest.source_template.sha256));
record("no primitive claims truthful area encoding",()=>assert.equal(manifest.templates.some(x=>x.spatial_capabilities.supports_area_encoding),false));
record("mapping covers all 12 Visual Grammars",()=>assert.deepEqual([...map.mappings.map(x=>x.visual_grammar_id)].sort(),[...library.grammars.map(x=>x.id)].sort()));
record("each grammar partitions all T01-T23",()=>{for(const item of map.mappings){const flat=[...item.compatible_templates,...item.conditionally_compatible_templates,...item.incompatible_templates];assert.equal(flat.length,23,item.visual_grammar_id);assert.equal(new Set(flat).size,23,item.visual_grammar_id);}});
const page9=matchTemplateCapabilities(buildPage9RatioRequest(),manifest,map);
record("page 9 preserves concept-first decision order",()=>assert.deepEqual(Object.keys(page9).slice(0,5),["communication_goal","semantic_relationship","visual_action","visual_concept","required_capabilities"]));
record("page 9 rejects every current primitive",()=>{assert.equal(page9.selected_template,null);assert.equal(page9.rejected_templates.length,23);assert.equal(page9.renderer_capability_gap.status,"gap");});
record("page 9 rejects equal-width substitutes",()=>{for(const id of ["T09","T12","T14","T17"])assert.match(page9.rejection_reasons[id].join(" "),/equal-width/);});
record("page 9 distinguishes bar length from part-to-whole area",()=>{for(const id of ["T13","T18"])assert.match(page9.rejection_reasons[id].join(" "),/bar-length/);});
await writeJson(path.join(out,"page-09-60-25-15-template-match.json"),page9);
const after=Object.fromEntries(await Promise.all(Object.entries(files).map(async([key,file])=>[key,await hash(file)])));
record("Planner 5.0, Renderer, Composition Solver, and copied source are unchanged during tests",()=>assert.deepEqual(after,before));
const report={testSuite:"template-capability-manifest-6.0-mvp-1",status:tests.every(x=>x.status==="pass")?"pass":"fail",tests,totals:{passed:tests.filter(x=>x.status==="pass").length,failed:tests.filter(x=>x.status==="fail").length},protectedFileHashes:{before,after},scope:{planner5Modified:false,rendererModified:false,fullDeckGenerated:false}};
await writeJson(path.join(out,"template-capability-test-report.json"),report);
console.log(JSON.stringify({status:report.status,passed:report.totals.passed,failed:report.totals.failed,page9Selection:page9.selected_template,capabilityGap:page9.renderer_capability_gap?.status},null,2));
if(report.status!=="pass")process.exitCode=2;
