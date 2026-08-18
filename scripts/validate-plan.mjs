import path from "node:path";
import {args,need,readJson,writeJson} from "./lib/common.mjs";

const a=args(),work=path.resolve(need(a,"work")),plan=await readJson(path.join(work,"deck-plan.json")),inventory=await readJson(path.join(work,"content-inventory.json")),issues=[];
const sourceBySlide=new Map(inventory.slides.map(s=>[s.sourceSlide,s]));
const requiresChart=new Set(["T13","T18"]),requiresCase=new Set(["T19"]),requiresQuote=new Set(["T10"]),requiresChecklist=new Set(["T22"]);
for(const slide of plan.slides){
  const sources=slide.sourceSlides.map(n=>sourceBySlide.get(n)).filter(Boolean),content=slide.content||{};
  if(!slide.compositionFamily||!slide.primaryAxis)issues.push({severity:"critical",code:"GEOMETRY_DECISION_MISSING",slide:slide.outputSlide});
  if(!slide.page_type||!slide.evidence_type||!slide.visual_role||!slide.narrative_role||!slide.headline_type||!slide.visual_asset_strategy||!slide.rhythm_position)issues.push({severity:"critical",code:"PRESENTATION_INTELLIGENCE_FIELDS_MISSING",slide:slide.outputSlide});
  if(slide.headline_type==="insight"&&!slide.headline_evidence)issues.push({severity:"critical",code:"INSIGHT_HEADLINE_WITHOUT_EVIDENCE",slide:slide.outputSlide});
  if(!["cover","chapter_divider","closing"].includes(slide.semanticRole)&&slide.headline_type==="topic")issues.push({severity:"major",code:"TOPIC_HEADLINE_REWRITE_REVIEW",slide:slide.outputSlide,sourceTitle:slide.content?.sourceTitle||""});
  if(slide.planningConfidence==="low")issues.push({severity:"major",code:"LOW_CONFIDENCE_PLAN",slide:slide.outputSlide,alternatives:slide.templateAlternatives||[]});
  if(requiresChart.has(slide.templateId)&&!content.chart)issues.push({severity:"critical",code:"CHART_TEMPLATE_WITHOUT_CHART",slide:slide.outputSlide,templateId:slide.templateId});
  if(requiresCase.has(slide.templateId)&&!(content.objective&&content.action&&(content.outcomes?.length||content.metrics?.length)))issues.push({severity:"critical",code:"CASE_TEMPLATE_WITHOUT_CASE_EVIDENCE",slide:slide.outputSlide});
  if(requiresQuote.has(slide.templateId)&&!content.quote)issues.push({severity:"critical",code:"QUOTE_TEMPLATE_WITHOUT_QUOTE",slide:slide.outputSlide});
  if(requiresChecklist.has(slide.templateId)&&(content.items||[]).length<4)issues.push({severity:"major",code:"CHECKLIST_TOO_SHORT_FOR_TEMPLATE",slide:slide.outputSlide,count:(content.items||[]).length});
  if(slide.templateId==="T07"&&!sources.some(s=>s.semanticRole==="chapter_divider")&&!slide.humanApprovedChapterBoundary)issues.push({severity:"critical",code:"SYNTHETIC_CHAPTER_WITHOUT_APPROVAL",slide:slide.outputSlide,sourceSlides:slide.sourceSlides});
  if(slide.mode==="dark"&&!new Set(["T03","T23"]).has(slide.templateId))issues.push({severity:"major",code:"UNJUSTIFIED_FULL_DARK_PAGE",slide:slide.outputSlide,templateId:slide.templateId});
  if(plan.plannerVersion?.startsWith("5.")){
    if(!slide.design_reasoning||!slide.evidence_topology||!slide.motif_decision||!slide.composition_solution||!slide.template_match||!slide.asset_selection)issues.push({severity:"critical",code:"PLANNER_5_CONTRACT_MISSING",slide:slide.outputSlide});
    if(slide.template_match?.selected_primitive!==slide.templateId)issues.push({severity:"critical",code:"TEMPLATE_MATCH_RENDER_DRIFT",slide:slide.outputSlide,selected:slide.template_match?.selected_primitive,rendered:slide.templateId});
    if(slide.composition_solution?.solver_status!=="feasible")issues.push({severity:"critical",code:"COMPOSITION_REPLAN_REQUIRED",slide:slide.outputSlide});
    if(slide.template_match?.match_status!=="matched")issues.push({severity:"critical",code:"NO_CAPABILITY_MATCH",slide:slide.outputSlide});
  }
}
const report={category:"plan",status:issues.some(x=>x.severity==="critical")?"fail":issues.length?"warning":"pass",issues,plannerVersion:plan.plannerVersion||"missing"};
await writeJson(path.join(work,"qa-plan.json"),report);
console.log(`planIssues=${issues.length}`);
if(report.status==="fail")process.exitCode=2;
