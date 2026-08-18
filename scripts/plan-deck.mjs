import path from "node:path";
import {args,need,readJson,writeJson} from "./lib/common.mjs";

const a=args();
const inventoryPath=path.resolve(need(a,"inventory"));
const inv=await readJson(inventoryPath);
const out=path.resolve(need(a,"out"));
const assetRoot=path.join(path.dirname(inventoryPath),"assets/ppt/media");
const slides=[];

const familyByTemplate={T01:"F01",T02:"F02",T03:"F03",T04:"F01",T05:"F01",T06:"F01",T07:"F04",T08:"F05",T09:"F06",T10:"F07",T11:"F07",T12:"F06",T13:"F08",T14:"F06",T15:"F05",T16:"F06",T17:"F03",T18:"F08",T19:"F10",T20:"F09",T21:"F08",T22:"F11",T23:"F11"};
const axisByFamily={F01:"left-60",F02:"left-columns-kpi",F03:"shared-top-columns",F04:"left-75",F05:"left-claim-right-evidence",F06:"shared-peer-grid",F07:"left-voice-or-split",F08:"split-52-48",F09:"metric-first",F10:"top-dual-bottom-authority",F11:"left-title-broad-fields"};
const modeByTemplate={T03:"dark",T07:"gradient",T13:"split",T18:"split",T21:"split",T23:"dark"};

function candidates(s){
  const role=s.semanticRole||"explanation",hasChart=(s.charts||[]).length>0,hasTable=(s.tables||[]).length>0,metricCount=(s.metrics||[]).length,quoteCount=(s.quotes||[]).length,bulletCount=(s.bullets||[]).length,bodyCount=(s.bodyBlocks||[]).length;
  if(role==="cover")return ["T01"];
  if(role==="executive_summary")return ["T02","T03"];
  if(role==="chapter_divider")return ["T07"];
  if(role==="closing")return ["T23","T22"];
  if(role==="checklist")return ["T22","T15"];
  if(role==="risk")return quoteCount?["T21","T11"]:["T21","T15"];
  if(role==="case_study")return quoteCount?["T19","T11"]:["T19"];
  if(role==="quote")return bodyCount>1?["T11","T10"]:["T10","T11"];
  if(role==="framework")return ["T09","T16"];
  if(role==="comparison")return hasTable?["T14","T12"]:["T12","T09"];
  if(hasChart)return metricCount>=2?["T18","T13","T17"]:["T13","T18"];
  if(hasTable)return ["T14","T12"];
  if(role==="data_overview"||metricCount>=3)return metricCount>=5?["T17","T03","T14"]:["T17","T08","T20"];
  if(role==="single_kpi"||metricCount===1)return bodyCount>1?["T08","T20","T04"]:["T20","T08","T04"];
  if(bulletCount>=6)return ["T22","T15"];
  if(bulletCount>=3||bodyCount>=3)return ["T15","T04","T16"];
  return ["T04","T08"];
}

function selectTemplate(s){
  const options=candidates(s),recent=slides.slice(-2),rhythmWindow=slides.slice(-3),recentSplit=rhythmWindow.filter(x=>x.mode==="split").length,darkSoFar=slides.filter(x=>["dark","split"].includes(x.mode)).length,ranked=options.map((templateId,priority)=>{
    const repeated=recent.filter(x=>x.templateId===templateId).length;
    const familyRepeated=recent.filter(x=>x.compositionFamily===familyByTemplate[templateId]).length;
    const isDark=["dark","split"].includes(modeByTemplate[templateId]),projectedDarkRatio=(darkSoFar+(isDark?1:0))/(slides.length+1),splitPenalty=modeByTemplate[templateId]==="split"?recentSplit*24:0,overusePenalty=isDark&&projectedDarkRatio>.35?70:0;
    return {templateId,score:100-priority*8-repeated*35-familyRepeated*10-splitPenalty-overusePenalty};
  }).sort((x,y)=>y.score-x.score);
  return {templateId:ranked[0].templateId,confidence:ranked.length===1?"high":ranked[0].score-ranked[1].score>=18?"high":"medium",alternatives:ranked.slice(1).map(x=>x.templateId)};
}

function jobFor(role,claim){
  const verbs={cover:"establish the central thesis",executive_summary:"understand the report's principal findings",chapter_divider:"recognize a new argument phase",single_chart:"understand what the chart proves",data_overview:"compare the most important measures",single_kpi:"remember the decisive number",case_study:"see how the claim works in practice",quote:"hear the claim from an accountable authority",risk:"understand the risk and its evidence",checklist:"know what action to take",closing:"know the final call to action",explanation:"understand the claim and why it matters"};
  return `By the end of this page, the audience should ${verbs[role]||verbs.explanation}: ${claim}`;
}

const insightVerbs=/\b(is|are|has|have|shows?|drives?|delivers?|creates?|accelerates?|emerges?|remains?|needs?|outpaces?|converts?|separates?|signals?|continues?|rises?|falls?|fell|shifts?|supports?|generates?|reduces?|improves?|improved|captures?|concentrates?|moderates?|expands?|prices?|requires?|becomes?|gave|ranks?|prioritizes?|find|clarify|fund|exit|track|review|validate|test|confirm|size|could|would|will|must|should|can)\b|正在|已经|成为|推动|带来|高于|低于|增长|下降|决定|证明|显示/i;
function compactHeadline(value){
  const clean=String(value||"").replace(/^[“”"]|[“”"]$/g,"").replace(/^(result|outcome|conclusion)\s*[:：]\s*/i,"").replace(/\s+/g," ").replace(/[.。]\s*$/,"");
  return clean;
}
function headlineFor(s){
  const sourceTitle=(s.title||"").trim(),role=s.semanticRole||"explanation",navigation=["cover","chapter_divider","closing"].includes(role),wordCount=sourceTitle.split(/\s+/).filter(Boolean).length,titleIsInsight=insightVerbs.test(sourceTitle)&&wordCount>=5;
  const blocks=(s.bodyBlocks||[]).map(x=>String(x).trim()).filter(x=>x&&!/^(source|来源|sample|样本)\s*[:：]/i.test(x));
  const resultClaim=blocks.find(x=>/^(result|outcome|conclusion)\s*[:：]/i.test(x));
  const quoteClaim=role==="quote"?s.quotes?.[0]?.text:null;
  const sourceClaim=resultClaim||quoteClaim||blocks.find(x=>x.length>=20&&x.length<=190&&insightVerbs.test(x))||(role==="checklist"?blocks[0]:null);
  if(navigation)return {sourceTitle,headline:sourceTitle,headline_type:"navigation",headline_evidence:sourceTitle,headline_alternatives:[]};
  if(titleIsInsight)return {sourceTitle,headline:compactHeadline(sourceTitle),headline_type:"insight",headline_evidence:sourceTitle,headline_alternatives:[]};
  if(sourceClaim){const headline=compactHeadline(sourceClaim),decisionAlternative=role==="risk"?compactHeadline(sourceClaim):"";return {sourceTitle,headline,headline_type:"insight",headline_evidence:sourceClaim,headline_alternatives:decisionAlternative?[decisionAlternative]:[]};}
  return {sourceTitle,headline:sourceTitle||s.bodyBlocks?.[0]||`Slide ${s.sourceSlide}`,headline_type:"topic",headline_evidence:sourceTitle,headline_alternatives:[],headlineReview:"No complete source claim supports a safe insight rewrite"};
}

function pageTypeFor(s){const role=s.semanticRole||"explanation",metrics=(s.metrics||[]).length;if(role==="cover")return "narrative";if(role==="chapter_divider")return "chapter";if(role==="case_study")return "case";if(["checklist","closing"].includes(role))return "action";if((s.charts||[]).length||(s.tables||[]).length||metrics>=3)return "data";if((s.quotes||[]).length||metrics===1)return "evidence";return "narrative";}
function evidenceTypeFor(s,pageType,chart,table,imageCount){const role=s.semanticRole||"explanation";if(role==="cover")return "thesis framing";if(role==="chapter_divider")return "narrative transition";if(role==="closing")return "decision synthesis";if(role==="checklist")return "action protocol";if(role==="case_study")return "operational proof";if(chart)return "statistical proof";if(table)return "comparative proof";if(imageCount)return "sourced visual evidence";if((s.quotes||[]).length)return "authority testimony";if((s.metrics||[]).length===1)return "decisive KPI";if((s.metrics||[]).length)return "comparable metrics";return pageType==="action"?"decision synthesis":"reasoned narrative";}
function plannedDensity(s,pageType){const role=s.semanticRole||"explanation",evidenceObjects=(s.metrics||[]).length+(s.charts||[]).length+(s.tables||[]).length,textBlocks=(s.bodyBlocks||[]).length+(s.bullets||[]).length;if(s.density==="high")return "high";if(["cover","chapter_divider","quote","closing"].includes(role))return "low";if(["data","case","action"].includes(pageType)||evidenceObjects>0||textBlocks>=2)return "medium";return "low";}
function narrativeRoleFor(pageType,role){const map={cover:"establish central thesis",executive_summary:"compress the argument",chapter_divider:"open a new argument phase",single_chart:"prove the claim statistically",data_overview:"compare material evidence",single_kpi:"make one number memorable",case_study:"demonstrate practical proof",quote:"add accountable authority",risk:"surface a decision tension",checklist:"convert insight into action",closing:"resolve with a call to action",explanation:"build the argument"};return map[role]||({data:"build statistical proof",evidence:"substantiate the claim",case:"humanize the proof",action:"direct the decision",chapter:"reset the argument",narrative:"build the argument"}[pageType]);}
function visualDecision(pageType,templateId,hasImages){
  if(pageType==="chapter")return {visual_role:"transition-field",visual_asset_strategy:"continuous-gradient-field"};
  if(pageType==="case")return {visual_role:"authority-anchor",visual_asset_strategy:"case-evidence-fields-and-authority-rail"};
  if(templateId==="T10"||templateId==="T11")return {visual_role:"authority-anchor",visual_asset_strategy:hasImages?"source-portrait-with-attribution":"edge-mesh-with-attribution"};
  if(["T13","T18","T21"].includes(templateId))return {visual_role:"evidence-carrier",visual_asset_strategy:"dark-evidence-panel-with-gradient-marks"};
  if(["T03","T14","T17","T20"].includes(templateId))return {visual_role:"evidence-carrier",visual_asset_strategy:"editable-data-first"};
  if(templateId==="T01")return {visual_role:"atmospheric-anchor",visual_asset_strategy:hasImages?"source-hero-image":"edge-cropped-particle-mesh"};
  if(hasImages)return {visual_role:"evidence-carrier",visual_asset_strategy:"source-evidence-image"};
  if(["T04","T06"].includes(templateId))return {visual_role:"atmospheric-anchor",visual_asset_strategy:"edge-cropped-particle-mesh"};
  return {visual_role:"none",visual_asset_strategy:"neutral-editorial-field"};
}

function caseParts(s){
  const lines=[...(s.bodyBlocks||[]),...(s.bullets||[])].filter(Boolean);
  const joined=lines.join("\n").replace(/customer quote:[\s\S]*$/i,"").trim(),field=(label,next)=>joined.match(new RegExp(`(?:${label})\\s*[:：]\\s*([\\s\\S]*?)(?=\\n?(?:${next})\\s*[:：]|$)`,"i"))?.[1]?.trim()||"";
  let objective=field("objective|goal|目标|目的","action|approach|implementation|result|outcome|行动|做法|实施|成果|结果"),action=field("action|approach|implementation|行动|做法|实施","result|outcome|impact|benefit|成果|结果|收益"),result=field("result|outcome|impact|benefit|成果|结果|收益","$^");
  if(!objective&&!action&&!result){const clauses=joined.split(/(?:\n+|[.;。；]|,\s*)+/).map(x=>x.trim()).filter(Boolean);objective=clauses[0]||lines[0]||"";action=clauses[1]||"";result=clauses.slice(2).join("; ");}
  return {objective,action,outcomes:result?[result]:[]};
}

for(const s of inv.slides){
  const decision=selectTemplate(s),imagePaths=(s.images||[]).filter(x=>x.fileName).map(x=>path.join(assetRoot,x.fileName));
  const chart=s.charts?.[0],table=s.tables?.[0],series=chart?.series?.[0],data=series?.categories?.map((label,n)=>({label,value:series.values[n]}))||[];
  const chartMetrics=data.map(x=>({value:String(x.value),label:x.label,source:"native chart"}));
  const headlineDecision=headlineFor(s),claim=headlineDecision.headline,page_type=pageTypeFor(s),evidence_type=evidenceTypeFor(s,page_type,chart,table,imagePaths.length);
  let templateId=decision.templateId;if(chart&&claim.length>56&&["T13","T18"].includes(templateId))templateId="T17";const family=familyByTemplate[templateId],visual=visualDecision(page_type,templateId,imagePaths.length>0),caseData=s.semanticRole==="case_study"?caseParts(s):{objective:"",action:"",outcomes:[]};
  const content={title:claim,headline:claim,sourceTitle:headlineDecision.sourceTitle,body:s.bodyBlocks,bullets:s.bullets,items:s.bullets.length?s.bullets:s.bodyBlocks,metrics:templateId==="T17"&&chartMetrics.length?chartMetrics:s.metrics,quotes:s.quotes,quote:s.quotes?.[0]?.text||"",attribution:s.quotes?.[0]?.attribution||"",sources:s.sources,chart,data,table,images:imagePaths,imageLayout:imagePaths.length>1?"pair-bottom":imagePaths.length?"hero-right":undefined,case:s.semanticRole==="case_study"?s.bodyBlocks.join("\n"):"",objective:caseData.objective,action:caseData.action,outcomes:caseData.outcomes};
  slides.push({outputSlide:slides.length+1,sourceSlides:[s.sourceSlide],purpose:s.semanticRole||"explanation",communicationJob:jobFor(s.semanticRole,claim),coreClaim:claim,semanticRole:s.semanticRole||"explanation",page_type,evidence_type,visual_role:visual.visual_role,narrative_role:narrativeRoleFor(page_type,s.semanticRole),headline_type:headlineDecision.headline_type,headline_evidence:headlineDecision.headline_evidence,headline_alternatives:headlineDecision.headline_alternatives,headlineReview:headlineDecision.headlineReview,visual_asset_strategy:visual.visual_asset_strategy,rhythm_position:"unassigned",evidenceType:evidence_type,compositionFamily:family,primaryAxis:axisByFamily[family],templateId,templateAlternatives:decision.alternatives,planningConfidence:decision.confidence,content,retainedEvidence:[...s.metrics,...s.sources,...s.quotes,...s.charts,...s.tables],removedOrCondensed:[],assets:imagePaths,density:plannedDensity(s,page_type),mode:modeByTemplate[templateId]||"light"});
}

function climaxScore(s){return s.page_type==="chapter"?100:s.evidence_type==="statistical proof"?85:s.page_type==="data"?75:s.evidence_type==="decisive KPI"?68:s.page_type==="case"?55:s.page_type==="evidence"?45:0;}
const climax=slides.filter(s=>s.outputSlide>1&&s.page_type!=="action").sort((x,y)=>climaxScore(y)-climaxScore(x))[0];
if(climax&&climaxScore(climax)>0){
  climax.visual_role="visual-climax";
  if(!slides.some(s=>s.page_type==="chapter")&&climax.page_type==="data"&&(climax.content?.metrics||[]).length>=2){climax.templateId="T03";climax.compositionFamily=familyByTemplate.T03;climax.primaryAxis=axisByFamily[familyByTemplate.T03];climax.mode=modeByTemplate.T03;climax.visual_asset_strategy="dark-statistical-climax";}
}
for(let i=0;i<slides.length;i++){const s=slides[i],progress=(i+1)/slides.length;if(i===0)s.rhythm_position="opening";else if(s===climax)s.rhythm_position="visual-climax";else if(s.page_type==="chapter")s.rhythm_position="midpoint-reset";else if(i===slides.length-1&&s.page_type==="action")s.rhythm_position="closing";else if(s.page_type==="action")s.rhythm_position="action";else if(progress<=.3)s.rhythm_position="early-argument";else if(progress<=.58)s.rhythm_position="evidence-build";else if(progress<=.82)s.rhythm_position="proof";else s.rhythm_position="synthesis";}

await writeJson(out,{title:slides[0]?.coreClaim||path.basename(inv.sourceFile),sourceFile:inv.sourceFile,plannerVersion:"4.0-presentation-intelligence",slides});
await writeJson(path.join(path.dirname(out),"content-map.json"),{sourceFile:inv.sourceFile,map:slides.map(s=>({outputSlide:s.outputSlide,sourceSlides:s.sourceSlides,templateId:s.templateId,compositionFamily:s.compositionFamily,page_type:s.page_type,narrative_role:s.narrative_role,headline_type:s.headline_type,planningConfidence:s.planningConfidence,retainedEvidence:s.retainedEvidence,removedOrCondensed:s.removedOrCondensed}))});
console.log(`plan=${out} slides=${slides.length} sourceSlides=${inv.slideCount} lowConfidence=${slides.filter(s=>s.planningConfidence==="low").length}`);
