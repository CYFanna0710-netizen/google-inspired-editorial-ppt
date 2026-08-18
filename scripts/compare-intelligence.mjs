import path from "node:path";
import fs from "node:fs/promises";
import {args,need,readJson,writeJson} from "./lib/common.mjs";

const a=args(),beforeRoot=path.resolve(need(a,"before-root")),afterRoot=path.resolve(need(a,"after-root")),out=path.resolve(need(a,"out"));
const cases=(a.cases?String(a.cases).split(","):["enterprise-strategy","ai-industry-research","investment-analysis"]).map(x=>x.trim()).filter(Boolean);
const insight=/\b(is|are|has|have|will|would|could|must|should|can|shows?|drives?|supports?|generates?|reduces?|improves?|rises?|falls?|fell|shifts?|becomes?|ranks?|prices?)\b|正在|已经|成为|推动|增长|下降|决定|显示/i;
const pageTypeFromTemplate=id=>({T01:"narrative",T02:"narrative",T03:"data",T04:"narrative",T05:"narrative",T06:"narrative",T07:"chapter",T08:"evidence",T09:"narrative",T10:"evidence",T11:"evidence",T12:"evidence",T13:"data",T14:"data",T15:"action",T16:"narrative",T17:"data",T18:"data",T19:"case",T20:"evidence",T21:"evidence",T22:"action",T23:"action"}[id]||"narrative");
const maxRun=(slides,key)=>{let best=0,run=0,last;for(const s of slides){const value=key(s);run=value===last?run+1:1;last=value;best=Math.max(best,run);}return best;};
const counts=(slides,key)=>Object.fromEntries([...new Set(slides.map(key))].map(v=>[v,slides.filter(s=>key(s)===v).length]));
async function maybeJson(file){try{return await readJson(file);}catch{return null;}}
function summarize(plan,aesthetic){
  const slides=plan.slides||[],pageTypes=slides.map(s=>s.page_type||pageTypeFromTemplate(s.templateId)),substantive=slides.filter(s=>!["cover","chapter_divider","closing"].includes(s.semanticRole)),insightCount=substantive.filter(s=>s.headline_type==="insight"||(!s.headline_type&&insight.test(s.content?.title||s.coreClaim||""))).length,templateCounts=counts(slides,s=>s.templateId),familyCounts=counts(slides,s=>s.compositionFamily),dominantTemplateShare=slides.length?Math.max(...Object.values(templateCounts))/slides.length:0,highDensityShare=slides.length?slides.filter(s=>s.density==="high").length/slides.length:0,lowDensityShare=slides.length?slides.filter(s=>s.density==="low").length/slides.length:0;
  const templateRun=maxRun(slides,s=>s.templateId),familyRun=maxRun(slides,s=>s.compositionFamily),visualConsistencyScore=Math.max(0,Math.round(100-Math.max(0,dominantTemplateShare-.35)*100-Math.max(0,templateRun-2)*12-Math.max(0,familyRun-2)*8));
  return {slides:slides.length,templateVariety:Object.keys(templateCounts).length,compositionFamilyVariety:Object.keys(familyCounts).length,pageTypeVariety:new Set(pageTypes).size,maxTemplateRun:templateRun,maxFamilyRun:familyRun,insightHeadlineShare:substantive.length?Number((insightCount/substantive.length).toFixed(3)):0,highDensityShare:Number(highDensityShare.toFixed(3)),lowDensityShare:Number(lowDensityShare.toFixed(3)),dominantTemplateShare:Number(dominantTemplateShare.toFixed(3)),visualConsistencyScore,aestheticAutomationScore:aesthetic?.aestheticScore??null};
}
const results=[];
for(const name of cases){const beforePlan=await readJson(path.join(beforeRoot,name,"deck-plan.json")),afterPlan=await readJson(path.join(afterRoot,name,"deck-plan.json")),before=summarize(beforePlan,await maybeJson(path.join(beforeRoot,name,"qa-aesthetic.json"))),after=summarize(afterPlan,await maybeJson(path.join(afterRoot,name,"qa-aesthetic.json")));results.push({case:name,before,after,delta:{templateVariety:after.templateVariety-before.templateVariety,pageTypeVariety:after.pageTypeVariety-before.pageTypeVariety,insightHeadlineShare:Number((after.insightHeadlineShare-before.insightHeadlineShare).toFixed(3)),visualConsistencyScore:after.visualConsistencyScore-before.visualConsistencyScore,aestheticAutomationScore:before.aestheticAutomationScore==null?null:after.aestheticAutomationScore-before.aestheticAutomationScore}});}
await writeJson(out,{comparisonVersion:"1.0-presentation-intelligence",generatedAt:new Date().toISOString(),results});
console.log(`comparison=${out} cases=${results.length}`);
