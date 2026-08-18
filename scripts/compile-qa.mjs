import fs from "node:fs/promises";
import path from "node:path";
import {args,need,readJson,writeJson} from "./lib/common.mjs";

const a=args(),work=need(a,"work"),out=need(a,"out"),base=["schemas","plan","content","layout","fonts","images","rhythm","style","aesthetic"],optional=["editability","visual-dna","neighbor-rhythm"],checks=[];
for(const n of base){try{checks.push(await readJson(path.join(work,`qa-${n}.json`)));}catch{checks.push({category:n,status:"fail",issues:[{severity:"critical",code:"QA_RESULT_MISSING"}]});}}
for(const n of optional){try{await fs.access(path.join(work,`qa-${n}.json`));checks.push(await readJson(path.join(work,`qa-${n}.json`)));}catch{}}
const all=checks.flatMap(x=>x.issues||[]),criticalCount=all.filter(x=>x.severity==="critical").length,majorCount=all.filter(x=>x.severity==="major").length,minorCount=all.filter(x=>x.severity==="minor").length,report={status:criticalCount?"fail":"pass",criticalCount,majorCount,minorCount,generatedAt:new Date().toISOString(),checks};
await writeJson(out,report);console.log(JSON.stringify({status:report.status,criticalCount,majorCount,minorCount}));if(criticalCount)process.exitCode=2;
