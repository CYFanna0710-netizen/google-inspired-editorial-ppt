import path from "node:path";
import {fileURLToPath} from "node:url";
import {spawnSync} from "node:child_process";
import {args,need,readJson,writeJson} from "./lib/common.mjs";
import {evidenceTopologyFor,artDirectionFor,motifDecisionFor,visualTraceFor} from "./lib/visual-intelligence.mjs";
import {resolveVisualDnaPriors,priorRefs} from "./lib/prior-resolver.mjs";
import {solveComposition} from "./lib/composition-solver.mjs";
import {matchTemplate} from "./lib/capability-matcher.mjs";
import {assetQueryFor,selectOrganicAsset} from "./lib/asset-selector.mjs";

const a=args(),inventoryPath=path.resolve(need(a,"inventory")),out=path.resolve(need(a,"out")),work=path.dirname(out),skillRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),basePath=path.join(work,"deck-plan-v4-base.json");
const baseRun=spawnSync(process.execPath,[path.join(skillRoot,"scripts/plan-deck.mjs"),"--inventory",inventoryPath,"--out",basePath],{encoding:"utf8",maxBuffer:20_000_000});
if(baseRun.stdout)process.stdout.write(baseRun.stdout);if(baseRun.stderr)process.stderr.write(baseRun.stderr);if(baseRun.status!==0)throw new Error(`Planner 4.0 compatibility pass failed (${baseRun.status})`);

const base=await readJson(basePath),priors=await readJson(path.join(skillRoot,"references/visual-dna-priors.json")),capabilities=await readJson(path.join(skillRoot,"references/template-capabilities.json")),assets=await readJson(path.join(skillRoot,"assets/organic/asset-registry.json"));
const slides=[],traces=[];
for(const sourceSlide of base.slides){
  const topology=evidenceTopologyFor(sourceSlide),previous=slides.at(-1)?.design_reasoning||null,art=artDirectionFor(sourceSlide,topology,{previous}),previousMotif=slides.at(-1)?.motif_decision||{primary_motif:"none"},motif=motifDecisionFor(sourceSlide,topology,art,{previousMotif}),context={page_role:sourceSlide.page_type,evidence_type:sourceSlide.evidence_type,motif_role:motif.visual_role||"none",motif_family:motif.family||"none"},resolvedPriors=resolveVisualDnaPriors(priors,context),solution=solveComposition(sourceSlide,art,motif),templateMatch=matchTemplate(capabilities,{topology,art,motif,solution,previousTemplates:slides.map(x=>x.templateId)}),assetQuery=assetQueryFor(sourceSlide,motif,solution),assetSelection=selectOrganicAsset(assets,assetQuery,skillRoot),templateId=templateMatch.selected_primitive,capability=capabilities.templates.find(x=>x.templateId===templateId);
  const mode=templateId==="T07"?"gradient":["T03","T23"].includes(templateId)?"dark":["T13","T18","T21"].includes(templateId)?"split":"light",selectedAssets=[...(sourceSlide.assets||[])];if(assetSelection.status==="matched")selectedAssets.push(assetSelection.absolute_path);
  const slide={...sourceSlide,evidence_topology:topology,design_reasoning:art,visual_dna_prior_refs:priorRefs(resolvedPriors),visual_dna_priors:resolvedPriors,motif_decision:motif,composition_solution:solution,template_match:templateMatch,asset_query:assetQuery,asset_selection:assetSelection,templateId,compositionFamily:capability.family,primaryAxis:art.gravity,templateAlternatives:templateMatch.rejected_alternatives.map(x=>x.templateId),planningConfidence:solution.solver_status==="feasible"&&templateMatch.match_status==="matched"?(templateMatch.compatibility_score>=85?"high":"medium"):"low",visual_role:motif.primary_motif==="none"?sourceSlide.visual_role:motif.visual_role,visual_asset_strategy:assetSelection.status==="matched"?`registered-organic-asset:${assetSelection.asset_id}`:motif.primary_motif==="none"?"intentional-no-motif":motif.primary_motif,assets:selectedAssets,mode};
  slides.push(slide);traces.push(visualTraceFor(slide));
}

const plan={...base,plannerVersion:"5.0-design-reasoning-visual-dna",schemaVersion:"5.0",architecture:["Narrative Intelligence","Evidence Topology","Art Direction Engine","Visual DNA","Motif Engine","Composition Solver","Template Capability Matching","Organic / Visual Asset Selection","Renderer","Structural QA","Visual DNA QA","Neighbor / Rhythm QA"],slides};
await writeJson(out,plan);
await writeJson(path.join(work,"visual-dna-trace.json"),{plannerVersion:plan.plannerVersion,sourceFile:plan.sourceFile,pages:traces});
await writeJson(path.join(work,"content-map.json"),{sourceFile:plan.sourceFile,plannerVersion:plan.plannerVersion,map:slides.map(s=>({outputSlide:s.outputSlide,sourceSlides:s.sourceSlides,narrative_job:s.narrative_role,audience_effect:s.design_reasoning.audience_effect,evidence_topology:s.evidence_topology.kind,energy:s.design_reasoning.energy,gravity:s.design_reasoning.gravity,motif:s.motif_decision.primary_motif,templateId:s.templateId,compositionFamily:s.compositionFamily,templateScore:s.template_match.compatibility_score,asset:s.asset_selection.asset_id||"none",solverStatus:s.composition_solution.solver_status,retainedEvidence:s.retainedEvidence,removedOrCondensed:s.removedOrCondensed}))});
console.log(`plan=${out} slides=${slides.length} planner=5.0 motifs=${slides.filter(s=>s.motif_decision.primary_motif!=="none").length} organicAssets=${slides.filter(s=>s.asset_selection.status==="matched").length} replans=${slides.filter(s=>s.composition_solution.solver_status!=="feasible").length}`);
