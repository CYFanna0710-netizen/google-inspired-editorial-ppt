import path from "node:path";
import {fileURLToPath} from "node:url";
import {args,need,readJson,writeJson} from "./lib/common.mjs";
import {validateVisualConceptDocument} from "./lib/visual-concept-intelligence.mjs";
import {validateJsonSchema} from "./lib/json-schema-lite.mjs";

const a=args(),input=path.resolve(need(a,"input")),out=path.resolve(a.out||path.join(path.dirname(input),"qa-visual-concepts.json")),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),doc=await readJson(input),library=await readJson(path.join(root,"references/visual-grammar-library.json")),schema=await readJson(path.join(root,"schemas/visual-concept.schema.json")),semantic=validateVisualConceptDocument(doc,library),schemaQa=validateJsonSchema(doc,schema),report={category:"visual-concepts",status:semantic.status==="pass"&&schemaQa.status==="pass"?"pass":"fail",schemaIssues:schemaQa.issues,semanticIssues:semantic.issues,pages:semantic.pages,candidates:semantic.candidates};
await writeJson(out,report);
console.log(`visualConceptSchema=${report.status} pages=${report.pages} candidates=${report.candidates} schemaIssues=${report.schemaIssues.length} semanticIssues=${report.semanticIssues.length}`);
if(report.status!=="pass")process.exitCode=2;
