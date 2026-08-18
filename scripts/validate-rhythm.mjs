import path from "node:path";
import {args,need,readJson,writeJson} from "./lib/common.mjs";

const a=args(),work=need(a,"work"),plan=await readJson(path.join(work,"deck-plan.json")),s=plan.slides,issues=[];
const runs=(key,predicate=()=>true)=>{const out=[];let start=0;for(let i=1;i<=s.length;i++){if(i<s.length&&key(s[i])===key(s[start])&&predicate(s[i]))continue;if(i-start>1)out.push({start:start+1,end:i,length:i-start,value:key(s[start])});start=i;}return out;};

for(const run of runs(x=>x.templateId))if(run.length>2)issues.push({severity:"major",code:"TEMPLATE_RUN_OVER_TWO",...run});
for(const run of runs(x=>x.page_type,x=>x.page_type==="narrative"))if(run.value==="narrative"&&run.length>3)issues.push({severity:"major",code:"TEXT_PAGE_RUN_OVER_THREE",...run});
for(const run of runs(x=>x.visual_asset_strategy))if(run.length>2&&run.value!=="intentional-no-motif")issues.push({severity:"major",code:"VISUAL_STRATEGY_REPEATED",...run});
for(let i=0;i<s.length-2;i++)if(s.slice(i,i+3).every(x=>x.density==="high"))issues.push({severity:"major",code:"THREE_HIGH_DENSITY",slides:[i+1,i+2,i+3]});

const dark=s.filter(x=>["dark","split"].includes(x.mode)).length,darkRatio=s.length?dark/s.length:0,dataPages=s.filter(x=>x.page_type==="data").length;
if(darkRatio>.35)issues.push({severity:"major",code:"DARK_AREA_OVERUSED",ratio:Number(darkRatio.toFixed(3)),maximum:0.35});
if(s.length>=10&&dataPages>=5&&dark===0)issues.push({severity:"major",code:"NO_DARK_EVIDENCE_PAGE",dataPages});
for(let i=0;i<s.length;i+=5){const window=s.slice(i,i+5);if(window.length>=4&&!window.some(x=>x.density==="low"||["chapter","case","action"].includes(x.page_type)||x.rhythm_position==="visual-climax"))issues.push({severity:"major",code:"NO_BREATHING_SILHOUETTE",range:[i+1,i+window.length]});}
for(const x of s)if(x.planningConfidence==="low")issues.push({severity:"major",code:"LOW_CONFIDENCE_PLAN_REVIEW",slide:x.outputSlide,alternatives:x.templateAlternatives||[]});

const hasClimax=s.some(x=>x.rhythm_position==="visual-climax"||x.page_type==="chapter"),hasStrongData=s.some(x=>x.page_type==="data"||["statistical proof","comparative proof","decisive KPI","comparable metrics"].includes(x.evidence_type)),hasSynthesis=s.some(x=>["synthesis","action","closing"].includes(x.rhythm_position)||x.page_type==="action");
if(!hasClimax)issues.push({severity:"major",code:"VISUAL_CLIMAX_MISSING"});
if(s.length<=10&&!hasStrongData)issues.push({severity:"major",code:"SHORT_DECK_STRONG_DATA_MISSING"});
if(s.length<=10&&!hasSynthesis)issues.push({severity:"major",code:"SHORT_DECK_SYNTHESIS_MISSING"});

const pageTypeCounts=Object.fromEntries(["narrative","data","evidence","case","chapter","action"].map(type=>[type,s.filter(x=>x.page_type===type).length])),pageTypeShares=Object.fromEntries(Object.entries(pageTypeCounts).map(([k,v])=>[k,s.length?Number((v/s.length).toFixed(3)):0]));
for(const [type,share] of Object.entries(pageTypeShares))if(s.length>=8&&share>.55)issues.push({severity:"major",code:"PAGE_TYPE_DOMINATES_DECK",pageType:type,share});
const report={category:"rhythm",status:issues.length?"warning":"pass",issues,slideCount:s.length,darkRatio:Number(darkRatio.toFixed(3)),pageTypeCounts,pageTypeShares,hasClimax,hasStrongData,hasSynthesis};
await writeJson(path.join(work,"qa-rhythm.json"),report);
console.log(`slides=${s.length} issues=${issues.length} darkRatio=${darkRatio.toFixed(3)}`);
if(issues.length)process.exitCode=1;
