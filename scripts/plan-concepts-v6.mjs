import path from "node:path";
import {fileURLToPath} from "node:url";
import {args,need,readJson,writeJson} from "./lib/common.mjs";
import {generateVisualConceptDocument,validateVisualConceptDocument} from "./lib/visual-concept-intelligence.mjs";
import {validateJsonSchema} from "./lib/json-schema-lite.mjs";

const a=args(),planPath=path.resolve(need(a,"plan")),out=path.resolve(need(a,"out")),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),pages=String(need(a,"pages")).split(",").map(x=>Number(x.trim())).filter(Number.isInteger);
if(!pages.length)throw new Error("--pages must contain at least one comma-separated page number.");
const plan=await readJson(planPath),library=await readJson(path.join(root,"references/visual-grammar-library.json")),schema=await readJson(path.join(root,"schemas/visual-concept.schema.json")),doc=generateVisualConceptDocument(plan,library,pages),semantic=validateVisualConceptDocument(doc,library),schemaQa=validateJsonSchema(doc,schema),qa={category:"visual-concepts",status:semantic.status==="pass"&&schemaQa.status==="pass"?"pass":"fail",schemaIssues:schemaQa.issues,semanticIssues:semantic.issues,pages:semantic.pages,candidates:semantic.candidates};
await writeJson(out,doc);
await writeJson(path.join(path.dirname(out),"qa-visual-concepts.json"),qa);
console.log(`conceptPlan=${out} pages=${doc.pages.length} candidates=${doc.pages.length*3} schema=${qa.status} renderer=unchanged pptx=not-generated`);
if(qa.status!=="pass")process.exitCode=2;
