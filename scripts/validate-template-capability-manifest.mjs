import path from "node:path";
import {fileURLToPath} from "node:url";
import {args,readJson,writeJson} from "./lib/common.mjs";
import {validateJsonSchema} from "./lib/json-schema-lite.mjs";

const a=args(),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),out=path.resolve(a.out||path.join(root,"..","template-capability-audit","qa-template-capabilities.json"));
const manifest=await readJson(path.join(root,"references/template-capability-manifest.json"));
const manifestSchema=await readJson(path.join(root,"schemas/template-capability-manifest.schema.json"));
const map=await readJson(path.join(root,"references/visual-grammar-template-map.json"));
const mapSchema=await readJson(path.join(root,"schemas/visual-grammar-template-map.schema.json"));
const library=await readJson(path.join(root,"references/visual-grammar-library.json"));
const issues=[...validateJsonSchema(manifest,manifestSchema).issues,...validateJsonSchema(map,mapSchema).issues];
const add=(code,location,message)=>issues.push({severity:"critical",code,location,message});
const expected=Array.from({length:23},(_,index)=>`T${String(index+1).padStart(2,"0")}`),ids=manifest.templates.map(x=>x.template_id);
if(JSON.stringify(ids)!==JSON.stringify(expected))add("TEMPLATE_ORDER","manifest.templates","Templates must be exactly T01-T23 in source-slide order.");
for(const template of manifest.templates)if(template.source_slide!==Number(template.template_id.slice(1)))add("SOURCE_SLIDE","manifest.templates",`${template.template_id} source_slide mismatch.`);
for(const template of manifest.templates)if(template.spatial_capabilities.supports_area_encoding)add("UNSUPPORTED_AREA_ENCODING",template.template_id,"No inspected primitive supports truthful area encoding.");
const libraryIds=library.grammars.map(x=>x.id),mapIds=map.mappings.map(x=>x.visual_grammar_id);
if(JSON.stringify([...mapIds].sort())!==JSON.stringify([...libraryIds].sort()))add("GRAMMAR_COVERAGE","map.mappings","Mapping must cover every grammar exactly once.");
for(const item of map.mappings){
  const buckets=[item.compatible_templates,item.conditionally_compatible_templates,item.incompatible_templates],flat=buckets.flat();
  if(new Set(flat).size!==flat.length)add("MAPPING_DUPLICATE",item.visual_grammar_id,"A template appears in more than one compatibility bucket.");
  if(JSON.stringify([...new Set(flat)].sort())!==JSON.stringify([...expected].sort()))add("MAPPING_COVERAGE",item.visual_grammar_id,"Compatibility buckets must partition all T01-T23.");
}
const ratioMap=map.mappings.find(x=>x.visual_grammar_id==="ratio-proportional-fields");
for(const id of ["T09","T12","T14","T17"])if(ratioMap.compatible_templates.includes(id))add("FALSE_RATIO_COMPATIBILITY",id,"Equal-width primitives cannot be directly compatible with proportional fields.");
const report={category:"template-capability-manifest",status:issues.length?"fail":"pass",issues,counts:{templates:manifest.templates.length,grammars:map.mappings.length,directly_supported_grammars:map.mappings.filter(x=>x.compatible_templates.length).length,area_encoding_templates:manifest.templates.filter(x=>x.spatial_capabilities.supports_area_encoding).length}};
await writeJson(out,report);
console.log(JSON.stringify(report,null,2));
if(report.status!=="pass")process.exitCode=2;
