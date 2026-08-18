import path from "node:path";
import {execFileSync} from "node:child_process";
import {args,need,readJson,writeJson} from "./lib/common.mjs";

const a=args(),work=path.resolve(need(a,"work")),input=a.input?path.resolve(a.input):null,plan=await readJson(path.join(work,"deck-plan.json")),slides=plan.slides||[],issues=[];
const countBy=key=>Object.fromEntries([...new Set(slides.map(key))].map(value=>[value,slides.filter(x=>key(x)===value).length]));
const templateCounts=countBy(x=>x.templateId),familyCounts=countBy(x=>x.compositionFamily),strategyCounts=countBy(x=>x.visual_asset_strategy),maxShare=counts=>slides.length?Math.max(0,...Object.values(counts))/slides.length:0;
if(slides.length>=8&&maxShare(templateCounts)>.45)issues.push({severity:"major",code:"OVER_TEMPLATED_SINGLE_LAYOUT",share:Number(maxShare(templateCounts).toFixed(3)),counts:templateCounts});
if(slides.length>=8&&Object.keys(familyCounts).length<3)issues.push({severity:"major",code:"INSUFFICIENT_COMPOSITION_VARIETY",families:Object.keys(familyCounts)});

const highShare=slides.length?slides.filter(x=>x.density==="high").length/slides.length:0,lowShare=slides.length?slides.filter(x=>x.density==="low").length/slides.length:0,ordinary=slides.filter(x=>x.page_type!=="chapter"),decorative=ordinary.filter(x=>["edge-cropped-particle-mesh","continuous-gradient-field"].includes(x.visual_asset_strategy));
if(highShare>.45)issues.push({severity:"major",code:"INFORMATION_DENSITY_TOO_HIGH",share:Number(highShare.toFixed(3))});
if(slides.length>=10&&lowShare<.1)issues.push({severity:"major",code:"INSUFFICIENT_VISUAL_BREATHING",share:Number(lowShare.toFixed(3))});
if(slides.length>=10&&lowShare>.5)issues.push({severity:"major",code:"INFORMATION_DENSITY_TOO_LOW",share:Number(lowShare.toFixed(3))});
if(ordinary.length&&decorative.length/ordinary.length>.4)issues.push({severity:"major",code:"DECORATION_OVERUSED",share:Number((decorative.length/ordinary.length).toFixed(3))});

const substantive=slides.filter(x=>!["cover","chapter_divider","closing"].includes(x.semanticRole)),topicHeadlines=substantive.filter(x=>x.headline_type==="topic");
if(substantive.length&&topicHeadlines.length/substantive.length>.25)issues.push({severity:"major",code:"TOPIC_HEADLINES_OVERUSED",share:Number((topicHeadlines.length/substantive.length).toFixed(3)),slides:topicHeadlines.map(x=>x.outputSlide)});
if(!slides.some(x=>x.visual_role==="visual-climax"||x.page_type==="chapter"))issues.push({severity:"major",code:"VISUAL_CLIMAX_MISSING"});

for(let i=0;i<slides.length-2;i++){
  const trio=slides.slice(i,i+3);
  if(trio.every(x=>x.compositionFamily===trio[0].compositionFamily))issues.push({severity:"major",code:"CONSECUTIVE_FAMILY_STASIS",slides:[i+1,i+2,i+3],family:trio[0].compositionFamily});
  if(trio[0].visual_asset_strategy!=="intentional-no-motif"&&trio.every(x=>x.visual_asset_strategy===trio[0].visual_asset_strategy))issues.push({severity:"major",code:"CONSECUTIVE_VISUAL_STASIS",slides:[i+1,i+2,i+3],strategy:trio[0].visual_asset_strategy});
}

if(input){for(const slide of slides){const xml=execFileSync("unzip",["-p",input,`ppt/slides/slide${slide.outputSlide}.xml`],{encoding:"utf8"}),decorativeCount=(xml.match(/mesh|diffuse-color-field|continuous-gradient/gi)||[]).length;if(slide.page_type!=="chapter"&&decorativeCount>5)issues.push({severity:"major",code:"EXCESS_DECORATIVE_OBJECTS",slide:slide.outputSlide,count:decorativeCount});}}

const majorCount=issues.filter(x=>x.severity==="major").length,minorCount=issues.filter(x=>x.severity==="minor").length,aestheticScore=Math.max(0,100-majorCount*8-minorCount*3);
const report={category:"aesthetic",status:issues.length?"warning":"pass",issues,aestheticScore,metrics:{templateCounts,familyCounts,strategyCounts,highDensityShare:Number(highShare.toFixed(3)),lowDensityShare:Number(lowShare.toFixed(3)),topicHeadlineShare:substantive.length?Number((topicHeadlines.length/substantive.length).toFixed(3)):0}};
await writeJson(path.join(work,"qa-aesthetic.json"),report);
console.log(JSON.stringify({aestheticScore,issues:issues.length}));
if(majorCount)process.exitCode=1;
