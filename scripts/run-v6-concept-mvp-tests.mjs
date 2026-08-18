import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import {fileURLToPath} from "node:url";
import {args,need,readJson,writeJson} from "./lib/common.mjs";
import {comparePlanner5And6,generateVisualConceptDocument,validateVisualConceptDocument} from "./lib/visual-concept-intelligence.mjs";
import {validateJsonSchema} from "./lib/json-schema-lite.mjs";

const a=args(),planPath=path.resolve(need(a,"plan")),out=path.resolve(need(a,"out")),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),pages=[2,5,9];
await fs.mkdir(out,{recursive:true});

async function hash(file){return crypto.createHash("sha256").update(await fs.readFile(file)).digest("hex");}
function record(name,fn,tests){
  try{fn();tests.push({name,status:"pass"});}
  catch(error){tests.push({name,status:"fail",message:error.message});}
}

const protectedFiles={
  planner5Entry:path.join(root,"scripts/plan-deck-v5.mjs"),
  renderer5:path.join(root,"scripts/build-deck-v5.mjs"),
  compositionSolver:path.join(root,"scripts/lib/composition-solver.mjs"),
  sourcePlan:planPath
};
const before=Object.fromEntries(await Promise.all(Object.entries(protectedFiles).map(async([key,file])=>[key,await hash(file)])));
const plan=await readJson(planPath),library=await readJson(path.join(root,"references/visual-grammar-library.json")),schema=await readJson(path.join(root,"schemas/visual-concept.schema.json"));
const doc=generateVisualConceptDocument(plan,library,pages),secondPass=generateVisualConceptDocument(plan,library,pages),semanticQa=validateVisualConceptDocument(doc,library),schemaQa=validateJsonSchema(doc,schema),qa={category:"visual-concepts",status:semanticQa.status==="pass"&&schemaQa.status==="pass"?"pass":"fail",schemaIssues:schemaQa.issues,semanticIssues:semanticQa.issues,pages:semanticQa.pages,candidates:semanticQa.candidates},comparison=comparePlanner5And6(plan,doc),tests=[];

record("library JSON and schema JSON parse",()=>{assert.equal(schema.title,"Planner 6.0 Visual Concept Intelligence MVP");assert.equal(library.libraryVersion,"6.0-mvp-1");},tests);
record("score weights total 100",()=>assert.equal(Object.values(library.scoreWeights).reduce((n,x)=>n+x,0),100),tests);
record("library grammar IDs unique",()=>assert.equal(new Set(library.grammars.map(x=>x.id)).size,library.grammars.length),tests);
record("each MVP signal has three grammars",()=>{for(const signal of ["ratio_composition","process_transformation","contrast_translation","thesis_emphasis"])assert.ok(library.grammars.filter(x=>x.signal===signal).length>=3,signal);},tests);
record("generation deterministic",()=>assert.deepEqual(doc,secondPass),tests);
record("only pages 2, 5, and 9 generated",()=>assert.deepEqual(doc.pages.map(x=>x.page),pages),tests);
record("exactly three distinct candidates per page",()=>{for(const page of doc.pages){assert.equal(page.candidates.length,3);assert.equal(new Set(page.candidates.map(x=>x.grammar_id)).size,3);assert.equal(new Set(page.candidates.map(x=>x.visual_gesture)).size,3);}},tests);
record("JSON Schema validator passes",()=>assert.equal(schemaQa.status,"pass",JSON.stringify(schemaQa.issues)),tests);
record("semantic validator passes",()=>assert.equal(semanticQa.status,"pass",JSON.stringify(semanticQa.issues)),tests);
record("page 9 detects ratio composition",()=>{const page=doc.pages.find(x=>x.page===9),winner=page.candidates.find(x=>x.id===page.selected_candidate_id);assert.deepEqual(page.analysis.ratio_values,[60,25,15]);assert.equal(page.analysis.signal,"ratio_composition");assert.match(winner.semantic_encoding.visual_channel,/area|width|flow/);assert.ok(winner.scale_strategy.constraints.some(x=>x.includes("60/25/15")));},tests);
record("page 5 restores a semantic Hero Object",()=>{const page=doc.pages.find(x=>x.page===5),winner=page.candidates.find(x=>x.id===page.selected_candidate_id);assert.equal(page.analysis.signal,"process_transformation");assert.equal(winner.hero_object.presence,"required");assert.equal(winner.tests.hero.result,"pass");assert.notEqual(winner.visual_gesture,"place");},tests);
record("page 2 gives color a semantic role",()=>{const page=doc.pages.find(x=>x.page===2),winner=page.candidates.find(x=>x.id===page.selected_candidate_id);assert.equal(page.analysis.signal,"contrast_translation");assert.ok(["medium","medium_high","high"].includes(winner.color_energy.level));assert.doesNotMatch(winner.color_energy.role,/decorative|accent_only/);},tests);
record("selected candidate is highest score",()=>{for(const page of doc.pages){const winner=page.candidates.find(x=>x.id===page.selected_candidate_id);assert.equal(winner.score.total,Math.max(...page.candidates.map(x=>x.score.total)));}},tests);
record("negative validation catches broken Hero contract",()=>{const broken=structuredClone(doc);delete broken.pages[0].candidates[0].hero_object.semantic_link;const negative=validateVisualConceptDocument(broken,library);assert.equal(negative.status,"fail");assert.ok(negative.issues.some(x=>x.code==="HERO_CONTRACT"));},tests);
record("scope declares no Renderer or PPTX work",()=>{assert.equal(doc.scope.rendererModified,false);assert.equal(doc.scope.pptxGenerated,false);assert.equal(comparison.invariant.rendererModified,false);},tests);

await writeJson(path.join(out,"visual-concepts.json"),doc);
await writeJson(path.join(out,"qa-visual-concepts.json"),qa);
await writeJson(path.join(out,"planner-5-vs-6-concept-comparison.json"),comparison);
const after=Object.fromEntries(await Promise.all(Object.entries(protectedFiles).map(async([key,file])=>[key,await hash(file)])));
record("Planner 5.0 and Renderer protected files unchanged",()=>assert.deepEqual(after,before),tests);
const outputFiles=await fs.readdir(out);
record("test output contains no PPTX",()=>assert.equal(outputFiles.some(x=>x.toLowerCase().endsWith(".pptx")),false),tests);

const report={
  testSuite:"planner-6.0-visual-concept-intelligence-mvp",
  status:tests.every(x=>x.status==="pass")?"pass":"fail",
  tests,
  totals:{passed:tests.filter(x=>x.status==="pass").length,failed:tests.filter(x=>x.status==="fail").length},
  protectedFileHashes:{before,after},
  pages,
  candidates:doc.pages.reduce((n,x)=>n+x.candidates.length,0)
};
await writeJson(path.join(out,"test-report.json"),report);
await writeJson(path.join(out,"review-node.json"),{
  status:"awaiting-human-review",
  implemented:["Visual Grammar Library","Visual Concept Schema","three-candidate generator","weighted scoring and selection","semantic validator","Planner 5.0 versus 6.0 concept comparison"],
  testedPages:[{page:9,reason:"60/25/15 ratio encoding"},{page:5,reason:"Hero Object missing"},{page:2,reason:"low color energy and weak visual tension"}],
  unresolved:comparison.unresolved,
  nextGate:"Human review of the three selected concepts before any Composition Solver or Renderer integration."
});
console.log(JSON.stringify({status:report.status,passed:report.totals.passed,failed:report.totals.failed,pages:report.pages,candidates:report.candidates,rendererModified:false,pptxGenerated:false},null,2));
if(report.status!=="pass")process.exitCode=2;
