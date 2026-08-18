import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {args,need,readJson,writeJson} from "./lib/common.mjs";

const a=args(),work=path.resolve(need(a,"work")),rendered=path.resolve(a.rendered||path.join(work,"rendered")),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),plan=await readJson(path.join(work,"deck-plan.json")),registry=await readJson(path.join(root,"assets/organic/asset-registry.json")),issues=[],metrics=[];
const assetById=new Map(registry.assets.map(x=>[x.asset_id,x]));
const bboxValid=b=>Array.isArray(b)&&b.length===4&&b.every(Number.isFinite)&&b[0]>=0&&b[1]>=0&&b[2]>=0&&b[3]>=0&&b[0]+b[2]<=1.001&&b[1]+b[3]<=1.001;
const intersection=(x,y)=>Math.max(0,Math.min(x[0]+x[2],y[0]+y[2])-Math.max(x[0],y[0]))*Math.max(0,Math.min(x[1]+x[3],y[1]+y[3])-Math.max(x[1],y[1]));

async function layoutFor(n){try{return await readJson(path.join(rendered,`slide-${n}.layout.json`));}catch{return null;}}
function occupiedShare(layout){
  if(!layout)return null;const cols=40,rows=23,cells=new Uint8Array(cols*rows);
  for(const e of layout.elements||[]){if(!Array.isArray(e.bbox)||/background/i.test(e.name||""))continue;const [x,y,w,h]=e.bbox,x0=Math.max(0,Math.floor(x/1280*cols)),x1=Math.min(cols,Math.ceil((x+w)/1280*cols)),y0=Math.max(0,Math.floor(y/720*rows)),y1=Math.min(rows,Math.ceil((y+h)/720*rows));for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++)cells[yy*cols+xx]=1;}
  return cells.reduce((n,v)=>n+v,0)/cells.length;
}
function priorMetric(slide,metric){return (slide.visual_dna_priors||[]).find(x=>x.metric===metric);}
function warnPrior(slide,metric,value){const p=priorMetric(slide,metric);if(!p||value===null)return;if(value<p.distribution.lower_reference||value>p.distribution.upper_reference)issues.push({severity:"minor",code:"REFERENCE_PRIOR_DEVIATION",slide:slide.outputSlide,metric,value:Number(value.toFixed(3)),priorId:p.id,referenceRange:[p.distribution.lower_reference,p.distribution.upper_reference],note:"advisory_only"});}

let climax=0;
for(const slide of plan.slides||[]){
  const n=slide.outputSlide,motif=slide.motif_decision||{},solution=slide.composition_solution||{},layout=await layoutFor(n),occupied=occupiedShare(layout),whitespace=occupied===null?null:1-occupied;
  if(motif.primary_motif!=="none"){
    if(!motif.semantic_trigger||!motif.visual_role)issues.push({severity:"critical",code:"MOTIF_SEMANTIC_CONTRACT_MISSING",slide:n});
    if(motif.semantic_removal_test?.result!=="pass"||!motif.semantic_removal_test?.weakened_dimension)issues.push({severity:"critical",code:"MOTIF_REMOVAL_TEST_FAILED",slide:n});
  }
  for(const key of ["primary_focal_bbox","secondary_focal_bbox","headline_bbox","evidence_bbox","content_cluster_bbox","intentional_empty_zone_bbox","asset_visible_region"])if(!bboxValid(solution[key]))issues.push({severity:"critical",code:"COMPOSITION_BBOX_INVALID",slide:n,field:key,value:solution[key]});
  if(solution.solver_status!=="feasible")issues.push({severity:"critical",code:"COMPOSITION_NOT_FEASIBLE",slide:n,reason:solution.replan_reason});
  if((slide.design_reasoning?.focal_structure?.secondary||[]).length>4)issues.push({severity:"critical",code:"FOCAL_OVERLOAD",slide:n,count:slide.design_reasoning.focal_structure.secondary.length});
  if(intersection(solution.headline_bbox||[],solution.intentional_empty_zone_bbox||[])>.01)issues.push({severity:"critical",code:"EMPTY_ZONE_NOT_PROTECTED",slide:n});
  if(slide.mode==="gradient"&&!(["chapter_divider","cover"].includes(slide.semanticRole)||slide.page_type==="chapter"))issues.push({severity:"critical",code:"GRADIENT_WITHOUT_SEMANTIC_ROLE",slide:n});
  if(slide.design_reasoning?.energy==="climax")climax++;
  if(slide.asset_selection?.status==="matched"){
    const record=assetById.get(slide.asset_selection.asset_id);if(!record||!String(record.rights?.status||record.rights_status||"").includes("cleared"))issues.push({severity:"critical",code:"ASSET_RIGHTS_NOT_CLEARED",slide:n,asset:slide.asset_selection.asset_id});
  }
  if(whitespace!==null)warnPrior(slide,"whitespace_ratio",whitespace);
  if(motif.primary_motif!=="none")warnPrior(slide,"visible_share",(solution.asset_visible_region?.[2]||0)*(solution.asset_visible_region?.[3]||0));
  metrics.push({slide:n,whitespace_ratio:whitespace===null?null:Number(whitespace.toFixed(3)),motif:motif.primary_motif||"none",energy:slide.design_reasoning?.energy,templateId:slide.templateId});
}
if(climax>Math.ceil((plan.slides?.length||0)/3))issues.push({severity:"critical",code:"CLIMAX_PURITY_VIOLATION",climaxPages:climax,totalPages:plan.slides.length});
for(let i=1;i<(plan.slides||[]).length;i++)if(plan.slides[i-1].design_reasoning?.energy==="climax"&&plan.slides[i].design_reasoning?.energy==="climax")issues.push({severity:"critical",code:"ADJACENT_CLIMAX_PAGES",slides:[i,i+1]});
const critical=issues.filter(x=>x.severity==="critical").length,report={category:"visual-dna",status:critical?"fail":issues.length?"warning":"pass",criticalCount:critical,issues,metrics,policy:{motifAbsencePenalty:false,priorDeviationsAreWarnings:true}};
await writeJson(path.join(work,"qa-visual-dna.json"),report);console.log(`visualDnaIssues=${issues.length} critical=${critical}`);if(critical)process.exitCode=2;
