import path from "node:path";
import {execFileSync} from "node:child_process";
import {args,need,readJson,writeJson} from "./lib/common.mjs";

const a=args(),input=path.resolve(need(a,"input")),work=path.resolve(need(a,"work")),plan=await readJson(path.join(work,"deck-plan.json")),issues=[],metrics=[];
for(const slide of plan.slides||[]){
  const n=slide.outputSlide,xml=execFileSync("unzip",["-p",input,`ppt/slides/slide${n}.xml`],{encoding:"utf8",maxBuffer:20_000_000}),textShapes=(xml.match(/<p:sp>/g)||[]).length,images=(xml.match(/<p:pic>/g)||[]).length,charts=(xml.match(/<c:chart\b/g)||[]).length,graphicFrames=(xml.match(/<p:graphicFrame>/g)||[]).length;
  const layout=await readJson(path.join(work,"rendered",`slide-${n}.layout.json`)),fullSlideImages=(layout.elements||[]).filter(e=>e.kind==="image"&&Array.isArray(e.bbox)&&e.bbox[2]*e.bbox[3]>=1280*720*.9);
  if(fullSlideImages.length&&textShapes===0&&charts===0)issues.push({severity:"critical",code:"WHOLE_SLIDE_RASTERIZATION",slide:n,count:fullSlideImages.length});
  if(textShapes===0)issues.push({severity:"critical",code:"EDITABLE_TEXT_MISSING",slide:n});
  if(slide.content?.chart&&["statistical_proof","narrative_single_chart"].includes(slide.evidence_topology?.kind)&&charts===0)issues.push({severity:"critical",code:"NATIVE_CHART_NOT_PRESERVED",slide:n});
  metrics.push({slide:n,textShapes,images,nativeCharts:charts,graphicFrames,wholeSlideRaster:false});
}
const report={category:"editability",status:issues.length?"fail":"pass",issues,metrics,policy:{wholeSlideRasterization:false,nativeTextRequired:true,nativeChartRequiredWhenPlanned:true}};await writeJson(path.join(work,"qa-editability.json"),report);console.log(`editabilityIssues=${issues.length} slides=${metrics.length}`);if(issues.length)process.exitCode=2;
