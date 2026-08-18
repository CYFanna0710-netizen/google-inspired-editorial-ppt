import path from "node:path";
import {fileURLToPath} from "node:url";
import {args,need,readJson,writeJson} from "./lib/common.mjs";

const a=args(),work=path.resolve(need(a,"work")),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),issues=[];

function check(value,schema,loc){
  if(!schema||typeof schema!=="object")return;
  if(schema.type==="object"){
    if(value===null||typeof value!=="object"||Array.isArray(value)){issues.push({severity:"critical",code:"SCHEMA_TYPE",location:loc,expected:"object"});return;}
    for(const key of schema.required||[])if(!(key in value))issues.push({severity:"critical",code:"SCHEMA_REQUIRED",location:`${loc}.${key}`});
    for(const [key,child] of Object.entries(schema.properties||{}))if(key in value)check(value[key],child,`${loc}.${key}`);
  }else if(schema.type==="array"){
    if(!Array.isArray(value)){issues.push({severity:"critical",code:"SCHEMA_TYPE",location:loc,expected:"array"});return;}
    if(schema.minItems!==undefined&&value.length<schema.minItems)issues.push({severity:"critical",code:"SCHEMA_MIN_ITEMS",location:loc,minimum:schema.minItems});
    value.forEach((v,i)=>check(v,schema.items,`${loc}[${i}]`));
  }else if(schema.type==="string"&&typeof value!=="string")issues.push({severity:"critical",code:"SCHEMA_TYPE",location:loc,expected:"string"});
  else if(schema.type==="integer"&&!Number.isInteger(value))issues.push({severity:"critical",code:"SCHEMA_TYPE",location:loc,expected:"integer"});
  else if(schema.type==="number"&&(typeof value!=="number"||!Number.isFinite(value)))issues.push({severity:"critical",code:"SCHEMA_TYPE",location:loc,expected:"number"});
  else if(schema.type==="boolean"&&typeof value!=="boolean")issues.push({severity:"critical",code:"SCHEMA_TYPE",location:loc,expected:"boolean"});
  if(schema.enum&&!schema.enum.includes(value))issues.push({severity:"critical",code:"SCHEMA_ENUM",location:loc,value});
  if(schema.pattern&&typeof value==="string"&&!new RegExp(schema.pattern).test(value))issues.push({severity:"critical",code:"SCHEMA_PATTERN",location:loc,value});
  if(schema.minimum!==undefined&&typeof value==="number"&&value<schema.minimum)issues.push({severity:"critical",code:"SCHEMA_MINIMUM",location:loc,value});
  if(schema.maximum!==undefined&&typeof value==="number"&&value>schema.maximum)issues.push({severity:"critical",code:"SCHEMA_MAXIMUM",location:loc,value});
  if(schema.minLength!==undefined&&typeof value==="string"&&value.length<schema.minLength)issues.push({severity:"critical",code:"SCHEMA_MIN_LENGTH",location:loc});
}

async function validateFile(dataPath,schemaName,location=dataPath){
  try{check(await readJson(dataPath),await readJson(path.join(root,"schemas",schemaName)),location);}
  catch(error){issues.push({severity:"critical",code:"SCHEMA_FILE_ERROR",file:dataPath,message:error.message});}
}

await validateFile(path.join(work,"content-inventory.json"),"content-inventory.schema.json","content-inventory.json");
await validateFile(path.join(work,"deck-plan.json"),"deck-plan.schema.json","deck-plan.json");
let plan=null;
try{plan=await readJson(path.join(work,"deck-plan.json"));}catch{}
if(plan?.plannerVersion?.startsWith("5.")){
  const designSchema=await readJson(path.join(root,"schemas/design-reasoning.schema.json"));
  const compositionSchema=await readJson(path.join(root,"schemas/composition-solution.schema.json"));
  for(const slide of plan.slides||[]){
    check(slide.design_reasoning,designSchema,`deck-plan.json.slides[${slide.outputSlide-1}].design_reasoning`);
    check(slide.composition_solution,compositionSchema,`deck-plan.json.slides[${slide.outputSlide-1}].composition_solution`);
  }
  await validateFile(path.join(work,"visual-dna-trace.json"),"visual-dna-trace.schema.json","visual-dna-trace.json");
  await validateFile(path.join(root,"references/template-capabilities.json"),"template-capabilities.schema.json","references/template-capabilities.json");
  await validateFile(path.join(root,"references/visual-dna-priors.json"),"visual-dna-priors.schema.json","references/visual-dna-priors.json");
  await validateFile(path.join(root,"assets/organic/asset-registry.json"),"organic-asset.schema.json","assets/organic/asset-registry.json");
}
const report={category:"schemas",status:issues.length?"fail":"pass",issues,plannerVersion:plan?.plannerVersion||"unknown"};
await writeJson(path.join(work,"qa-schemas.json"),report);
console.log(`schemaIssues=${issues.length} planner=${report.plannerVersion}`);
if(issues.length)process.exitCode=2;
