import fs from "node:fs/promises";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {args,need,readJson,writeJson} from "./lib/common.mjs";

const a=args(),input=need(a,"input"),work=need(a,"work");
const plan=await readJson(path.join(work,"deck-plan.json"));
const issues=[];
for(const slide of plan.slides||[]){
  const xml=execFileSync("unzip",["-p",input,`ppt/slides/slide${slide.outputSlide}.xml`],{encoding:"utf8"});
  if(["T07","T23"].includes(slide.templateId)&&!xml.includes("<a:gradFill"))issues.push({severity:"critical",code:"ATMOSPHERIC_GRADIENT_MISSING",slide:slide.outputSlide,templateId:slide.templateId});
  if((xml.match(/gradient-segment-/g)||[]).length>1)issues.push({severity:"critical",code:"ADJACENT_SOLID_GRADIENT_SEGMENTS",slide:slide.outputSlide,templateId:slide.templateId});
  if(["T13","T18"].includes(slide.templateId)&&!xml.includes("gradient-data-mark"))issues.push({severity:"critical",code:"GRADIENT_DATA_MARK_MISSING",slide:slide.outputSlide,templateId:slide.templateId});
  if(!["T07","T23"].includes(slide.templateId)&&(xml.match(/diffuse-color-field/g)||[]).length>1)issues.push({severity:"major",code:"DIFFUSION_OVERUSED_ON_ORDINARY_PAGE",slide:slide.outputSlide});
  if(slide.templateId==="T19"&&!/Objective/.test(xml))issues.push({severity:"critical",code:"CASE_PROOF_STRUCTURE_MISSING",slide:slide.outputSlide});
}
const report={category:"style",status:issues.some(x=>x.severity==="critical")?"fail":"pass",issues};
await writeJson(path.join(work,"qa-style.json"),report);
console.log(JSON.stringify(report));
if(report.status==="fail") process.exitCode=2;
