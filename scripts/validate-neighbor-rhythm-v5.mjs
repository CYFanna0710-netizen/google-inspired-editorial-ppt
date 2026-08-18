import path from "node:path";
import {args,need,readJson,writeJson} from "./lib/common.mjs";

const a=args(),work=path.resolve(need(a,"work")),plan=await readJson(path.join(work,"deck-plan.json")),issues=[],pairs=[];
const signature=s=>({primitive:s.templateId,family:s.compositionFamily,topology:s.evidence_topology?.kind,gravity:s.design_reasoning?.gravity,energy:s.design_reasoning?.energy,motif:s.motif_decision?.family||"none",empty:s.design_reasoning?.intentional_empty_zone?.preferred_zone,mode:s.mode});
const similarity=(x,y)=>{const keys=Object.keys(x),same=keys.filter(k=>x[k]===y[k]).length;return same/keys.length;};
for(let i=1;i<(plan.slides||[]).length;i++){const prev=signature(plan.slides[i-1]),current=signature(plan.slides[i]),score=similarity(prev,current);pairs.push({slides:[i,i+1],similarity:Number(score.toFixed(3)),changed:Object.keys(prev).filter(k=>prev[k]!==current[k])});if(score>=.75)issues.push({severity:"minor",code:"NEIGHBOR_COMPOSITION_SIMILARITY",slides:[i,i+1],similarity:Number(score.toFixed(3)),note:"multi_feature_warning"});}
for(let i=2;i<(plan.slides||[]).length;i++){const a1=signature(plan.slides[i-2]),b=signature(plan.slides[i-1]),c=signature(plan.slides[i]);if(similarity(a1,b)>=.75&&similarity(b,c)>=.75)issues.push({severity:"major",code:"THREE_PAGE_VISUAL_STASIS",slides:[i-1,i,i+1]});}
const climax=(plan.slides||[]).filter(s=>s.design_reasoning?.energy==="climax").length;if(!climax)issues.push({severity:"major",code:"NO_VISUAL_CLIMAX"});
const report={category:"neighbor-rhythm",status:issues.length?"warning":"pass",issues,pairs,method:"8-feature neighbor comparison; template alone never determines similarity"};await writeJson(path.join(work,"qa-neighbor-rhythm.json"),report);console.log(`neighborIssues=${issues.length}`);
