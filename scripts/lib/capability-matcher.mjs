const flexRank={none:0,low:1,medium:2,high:3,very_high:4,fixed:0};
const expectedFocal=topology=>({single_thesis:"single_primary",summary_plus_kpi:"primary_plus_proof",narrative_transition:"single_primary",final_action:"single_primary",action_protocol:"primary_plus_two_action_fields",objective_action_result_quote:"ordered_multi_focal",authority_testimony:"single_primary",risk_evidence_quote:"primary_plus_warning_authority",three_stage_progression:"three_ordered_peers",ordered_domains:"primary_plus_sequence",comparative_proof:"distributed_peers",three_peer_comparison:"three_equal_peers",statistical_proof:"primary_plus_evidence",narrative_single_chart:"primary_plus_evidence",comparable_metrics:"distributed_metrics",decisive_kpi:"single_primary",methodology_scope:"primary_plus_group",reasoned_narrative:"single_primary"}[topology]||"single_primary");
const gravityCompatible=(supported,gravity)=>supported.includes(gravity)||supported.some(x=>gravity.includes(x)||x.includes(gravity));

export function matchTemplate(capabilityRegistry,{topology,art,motif,solution,previousTemplates=[]}){
  const requestedFocal=expectedFocal(topology.kind),requestedMotif=motif.visual_role||motif.primary_motif||"none",requiredWhitespace=art.energy==="climax"?3:art.whitespace_intention==="authority_pause"?3:art.page_type==="data"?1:2;
  const ranked=capabilityRegistry.templates.map(template=>{
    const topologyMatch=template.supportedEvidenceTopology.includes(topology.kind),gravityMatch=gravityCompatible(template.supportedGravity,art.gravity),focalMatch=template.supportedFocalStructure.includes(requestedFocal)||template.supportedFocalStructure.includes("primary_plus_support"),motifMatch=template.motifCompatibility.includes(requestedMotif)||template.motifCompatibility.includes(motif.primary_motif)||template.motifCompatibility.includes("none"),whiteScore=Math.min(1,(flexRank[template.whitespaceFlexibility]||0)/Math.max(requiredWhitespace,1));
    let score=(topologyMatch?45:0)+(gravityMatch?20:0)+(focalMatch?15:0)+(motifMatch?10:0)+whiteScore*7;
    if(previousTemplates.slice(-2).includes(template.templateId))score-=8;
    if(solution.solver_status!=="feasible")score-=40;
    const reasons=[];if(topologyMatch)reasons.push(`supports ${topology.kind}`);if(gravityMatch)reasons.push(`supports ${art.gravity} gravity`);if(focalMatch)reasons.push(`supports ${requestedFocal}`);if(motifMatch)reasons.push(`compatible with ${requestedMotif}`);
    return {template,score:Number(score.toFixed(2)),topologyMatch,gravityMatch,focalMatch,motifMatch,reasons};
  }).sort((a,b)=>b.score-a.score||a.template.templateId.localeCompare(b.template.templateId));
  const feasible=ranked.filter(x=>x.topologyMatch&&x.gravityMatch&&x.focalMatch);
  const selected=feasible[0]||ranked[0],alternatives=ranked.filter(x=>x!==selected).slice(0,5);
  return {
    selected_primitive:selected.template.templateId,
    execution_family:selected.template.family,
    compatibility_score:selected.score,
    capability_evidence:selected.reasons,
    rejected_alternatives:alternatives.map(x=>({templateId:x.template.templateId,score:x.score,reasons:[!x.topologyMatch?`does not support ${topology.kind}`:null,!x.gravityMatch?`does not support ${art.gravity} gravity`:null,!x.focalMatch?`does not support ${requestedFocal}`:null].filter(Boolean)})),
    required_fit_transform:{coordinate_space:"normalized_canvas",source:"composition_solution",bbox_translation_tolerance:solution.tolerances.bbox_translation,bbox_scale_tolerance:solution.tolerances.bbox_scale},
    match_status:feasible.length?"matched":"needs_composition_replan"
  };
}
