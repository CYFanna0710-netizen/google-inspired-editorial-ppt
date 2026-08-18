const lower=value=>String(value||"").toLowerCase();
const words=slide=>lower([slide.coreClaim,...(slide.content?.body||[]),...(slide.content?.bullets||[])].join(" "));

export function evidenceTopologyFor(slide){
  const role=slide.semanticRole||"explanation",content=slide.content||{},metrics=content.metrics||[],chart=content.chart,table=content.table,text=words(slide);
  if(role==="cover")return {kind:"single_thesis",entities:["headline","subtitle"],relations:[]};
  if(role==="executive_summary")return {kind:"summary_plus_kpi",entities:["headline","summary","kpi"],relations:[["kpi","supports","headline"]]};
  if(role==="chapter_divider")return {kind:"narrative_transition",entities:["section_number","headline"],relations:[["section_number","orients","headline"]]};
  if(role==="closing")return {kind:"final_action",entities:["headline","action"],relations:[["action","resolves","headline"]]};
  if(role==="checklist")return {kind:"action_protocol",entities:["headline","actions"],relations:[["actions","operationalize","headline"]]};
  if(role==="case_study")return {kind:"objective_action_result_quote",entities:["objective","action","result","authority"],relations:[["action","addresses","objective"],["result","proves","action"],["authority","validates","result"]]};
  if(role==="quote")return {kind:"authority_testimony",entities:["quote","attribution"],relations:[["attribution","owns","quote"]]};
  if(role==="risk")return {kind:"risk_evidence_quote",entities:["risk","warning","authority"],relations:[["warning","quantifies","risk"],["authority","interprets","risk"]]};
  if(role==="framework"&&/(maturity|stage|level|阶段|层级)/i.test(text))return {kind:"three_stage_progression",entities:["headline","stages"],relations:[["stages","progress","headline"]]};
  if(role==="framework")return {kind:"ordered_domains",entities:["headline","domains"],relations:[["domains","structure","headline"]]};
  if(role==="comparison")return {kind:table?"comparative_proof":"three_peer_comparison",entities:["headline","peer_evidence"],relations:[["peer_evidence","compares","headline"]]};
  if(chart&&metrics.length>=2)return {kind:"statistical_proof",entities:["headline","metrics","chart","source"],relations:[["chart","proves","headline"],["metrics","annotate","chart"]]};
  if(chart)return {kind:"narrative_single_chart",entities:["headline","narrative","chart","source"],relations:[["chart","proves","headline"]]};
  if(table)return {kind:"comparative_proof",entities:["headline","table","source"],relations:[["table","compares","headline"]]};
  if(metrics.length>=3)return {kind:"comparable_metrics",entities:["headline","metrics"],relations:[["metrics","support","headline"]]};
  if(metrics.length===1)return {kind:"decisive_kpi",entities:["headline","hero_metric","implication"],relations:[["hero_metric","proves","headline"]]};
  if(/method|sample|survey|scope|样本|方法/i.test(text))return {kind:"methodology_scope",entities:["headline","method","scope"],relations:[["scope","qualifies","method"]]};
  return {kind:"reasoned_narrative",entities:["headline","narrative"],relations:[["narrative","explains","headline"]]};
}

function energyFor(slide){
  if(slide.semanticRole==="cover"||slide.page_type==="chapter"||slide.semanticRole==="closing")return "climax";
  if(slide.page_type==="data"||slide.evidence_type==="decisive KPI"||slide.rhythm_position==="visual-climax")return "energetic";
  if(slide.semanticRole==="quote")return "quiet";
  return "moderate";
}

function gravityFor(topology,slide,previous){
  const map={single_thesis:"center_left",summary_plus_kpi:"left_right_rail",narrative_transition:"full_field",final_action:"left",action_protocol:"distributed_two_column",objective_action_result_quote:"distributed_zones",authority_testimony:"center_left",risk_evidence_quote:"left_right",three_stage_progression:"distributed",ordered_domains:"left_right",comparative_proof:"distributed",three_peer_comparison:"distributed",statistical_proof:"split",narrative_single_chart:"split",comparable_metrics:"distributed",decisive_kpi:"left_right",methodology_scope:"split",reasoned_narrative:"upper_left"};
  let gravity=map[topology.kind]||"upper_left";
  if(topology.kind==="authority_testimony"&&previous?.gravity==="center_left")gravity="split";
  if(topology.kind==="reasoned_narrative"&&previous?.gravity==="upper_left")gravity="center_left";
  return gravity;
}

const MASS={
  center_left:{center_of_mass:{x:.42,y:.46,tolerance:{x:.09,y:.09}},quadrant_mass:{upper_left:.35,upper_right:.18,lower_left:.29,lower_right:.18},dominant_zone:"left"},
  upper_left:{center_of_mass:{x:.4,y:.36,tolerance:{x:.08,y:.08}},quadrant_mass:{upper_left:.46,upper_right:.2,lower_left:.2,lower_right:.14},dominant_zone:"upper_left"},
  left_right_rail:{center_of_mass:{x:.53,y:.43,tolerance:{x:.07,y:.08}},quadrant_mass:{upper_left:.32,upper_right:.3,lower_left:.18,lower_right:.2},dominant_zone:"upper_left"},
  left_right:{center_of_mass:{x:.51,y:.47,tolerance:{x:.07,y:.08}},quadrant_mass:{upper_left:.3,upper_right:.27,lower_left:.22,lower_right:.21},dominant_zone:"left"},
  split:{center_of_mass:{x:.56,y:.46,tolerance:{x:.06,y:.08}},quadrant_mass:{upper_left:.25,upper_right:.32,lower_left:.18,lower_right:.25},dominant_zone:"right"},
  distributed:{center_of_mass:{x:.5,y:.47,tolerance:{x:.06,y:.07}},quadrant_mass:{upper_left:.26,upper_right:.25,lower_left:.24,lower_right:.25},dominant_zone:"center"},
  distributed_zones:{center_of_mass:{x:.51,y:.49,tolerance:{x:.06,y:.07}},quadrant_mass:{upper_left:.25,upper_right:.26,lower_left:.24,lower_right:.25},dominant_zone:"center"},
  distributed_two_column:{center_of_mass:{x:.5,y:.5,tolerance:{x:.06,y:.07}},quadrant_mass:{upper_left:.24,upper_right:.24,lower_left:.26,lower_right:.26},dominant_zone:"center"},
  full_field:{center_of_mass:{x:.46,y:.45,tolerance:{x:.12,y:.12}},quadrant_mass:{upper_left:.31,upper_right:.22,lower_left:.27,lower_right:.2},dominant_zone:"center_left"},
  left:{center_of_mass:{x:.39,y:.48,tolerance:{x:.1,y:.1}},quadrant_mass:{upper_left:.34,upper_right:.18,lower_left:.31,lower_right:.17},dominant_zone:"left"}
};

function focalFor(topology){
  const primary={single_thesis:"headline",summary_plus_kpi:"headline",narrative_transition:"headline",final_action:"headline",action_protocol:"headline",objective_action_result_quote:"result",authority_testimony:"quote",risk_evidence_quote:"risk_statement",three_stage_progression:"progression",ordered_domains:"headline",comparative_proof:"comparison",three_peer_comparison:"comparison",statistical_proof:"chart",narrative_single_chart:"headline",comparable_metrics:"metric_system",decisive_kpi:"hero_metric",methodology_scope:"headline",reasoned_narrative:"headline"}[topology.kind]||"headline";
  const secondary=topology.entities.filter(x=>x!==primary).slice(0,2);
  return {primary,secondary};
}

function emptyZoneFor(gravity){
  return {center_left:"right_perimeter",upper_left:"lower_right",left_right_rail:"lower_left",left_right:"center_gutter",split:"lower_left",distributed:"perimeter",distributed_zones:"center_gutters",distributed_two_column:"upper_right_perimeter",full_field:"lower_right",left:"right"}[gravity]||"lower_right";
}

export function artDirectionFor(slide,topology,{previous=null}={}){
  const energy=energyFor(slide),gravity=gravityFor(topology,slide,previous),mass=structuredClone(MASS[gravity]||MASS.upper_left),focal=focalFor(topology),empty=emptyZoneFor(gravity),needsCounterweight=["center_left","upper_left","left"].includes(gravity)&&!["statistical_proof","comparable_metrics"].includes(topology.kind);
  mass.counterweight={required:needsCounterweight,source:needsCounterweight?"organic_asset_candidate":"typography_or_evidence",target_zone:gravity.includes("left")||gravity==="upper_left"?"lower_right":"opposing_quadrant",intended_effect:needsCounterweight?"stabilize_primary_mass_without_closing_empty_zone":"evidence_system_resolves_balance"};
  const reading=[focal.primary,...focal.secondary,...topology.entities.filter(x=>![focal.primary,...focal.secondary].includes(x))].slice(0,4);
  return {
    audience_effect:slide.communicationJob||`Understand ${slide.coreClaim}`,
    energy,
    focal_structure:focal,
    reading_path:reading,
    gravity,
    visual_mass_intent:mass,
    intentional_empty_zone:{preferred_zone:empty,functions:energy==="climax"?["focus","pause","memory"]:["focus","hierarchy","visual_balance"]},
    whitespace_intention:energy==="climax"?"landmark_pause":slide.semanticRole==="quote"?"authority_pause":slide.page_type==="data"?"evidence_perimeter":"editorial_breathing",
    tension:energy==="energetic"?"moderate_high":energy==="climax"?"high":"moderate",
    color_logic:{role:slide.page_type==="chapter"?"chapter_signal":slide.page_type==="data"?"evidence_encoding":"neutral_canvas",full_field_allowed:slide.page_type==="chapter"||slide.semanticRole==="closing"},
    container_logic:{need:["comparative_proof","three_stage_progression","objective_action_result_quote","action_protocol"].includes(topology.kind)?"semantic_grouping":"none_or_minimal",expose:["headline","hero_metric","quote"]},
    neighbor_difference:[...new Set([previous?.gravity===gravity?"gravity":"energy",previous?.energy===energy?"dominant_object":"density","motif_family"])]
  };
}

function semanticTrigger(slide){
  const text=words(slide);
  if(/security|risk|threat|vulnerability|安全|风险|威胁/.test(text))return {trigger:"network_risk_and_complexity",family:"neural_sphere",palette:"chapter_cool"};
  if(/transition|change|shift|adapt|maturity|journey|转型|变化|阶段|迁移/.test(text))return {trigger:"transition_and_adaptability",family:"fluid_ribbon",palette:"chapter_cool"};
  if(/growth|value|roi|revenue|market|productivity|增长|价值|收益|效率/.test(text))return {trigger:"value_creation_and_growth",family:"particle_cloth",palette:"chapter_warm"};
  if(/agent|network|intelligence|system|ai|智能|系统|网络/.test(text))return {trigger:"distributed_intelligence",family:"particle_cloth",palette:"chapter_cool"};
  return null;
}

export function motifDecisionFor(slide,topology,art,{previousMotif=null}={}){
  if(slide.page_type==="chapter")return {primary_motif:"full_field_spectrum",semantic_trigger:"chapter_transition",visual_role:"chapter_signal",family:"spectrum",palette:"active_chapter_spectrum",placement_rationale:"A chapter transition requires a deck-level memory landmark.",semantic_removal_test:{result:"pass",weakened_dimension:"chapter_identity",explanation:"Removing the spectrum would erase the chapter reset."}};
  if(slide.semanticRole==="closing")return {primary_motif:"closing_arc",semantic_trigger:"narrative_closure",visual_role:"action_signal",family:"spectrum_arc",palette:"chapter_cool",placement_rationale:"A cropped arc resolves the deck toward the final action.",semantic_removal_test:{result:"pass",weakened_dimension:"closure",explanation:"Removing the arc weakens convergence and action direction."}};
  const trigger=semanticTrigger(slide),dense=["statistical_proof","comparable_metrics","comparative_proof","multi_category_matrix"].includes(topology.kind),hasSourceImage=(slide.content?.images||[]).length>0;
  if(slide.semanticRole==="cover"&&!hasSourceImage)return {primary_motif:"organic_hero",semantic_trigger:trigger?.trigger||"central_thesis",visual_role:"hero",family:trigger?.family||"particle_cloth",palette:trigger?.palette||"chapter_warm",preferred_entry:"bottom_right",placement_rationale:"The cover needs one original visual actor opposite the thesis.",semantic_removal_test:{result:"pass",weakened_dimension:"opening_visual_identity",explanation:"Removing the asset leaves an unbalanced opening thesis."}};
  if(hasSourceImage||dense)return {primary_motif:"none",reason:hasSourceImage?"source_visual_already_carries_evidence":"evidence_density_resolves_hierarchy_without_decoration"};
  if(slide.semanticRole==="quote"&&art.visual_mass_intent.counterweight.required&&previousMotif?.primary_motif==="none")return {primary_motif:"organic_counterweight",semantic_trigger:trigger?.trigger||"authority_balance",visual_role:"edge_counterweight",family:trigger?.family||"neural_sphere",palette:trigger?.palette||"chapter_cool",preferred_entry:"right",placement_rationale:"The asset balances a short exposed authority statement without becoming evidence.",semantic_removal_test:{result:"pass",weakened_dimension:"visual_balance",explanation:"Removal leaves the quote mass unresolved on one side."}};
  if(trigger&&art.visual_mass_intent.counterweight.required&&previousMotif?.family!==trigger.family)return {primary_motif:"organic_support",semantic_trigger:trigger.trigger,visual_role:"supporting",family:trigger.family,palette:trigger.palette,preferred_entry:art.gravity.includes("left")||art.gravity==="upper_left"?"bottom_right":"bottom_left",placement_rationale:"The semantic form counterbalances the primary cluster and reinforces the claim.",semantic_removal_test:{result:"pass",weakened_dimension:"meaning_and_balance",explanation:"Removal weakens both the concept metaphor and the two-dimensional balance."}};
  if(topology.kind==="decisive_kpi"&&trigger)return {primary_motif:"organic_support",semantic_trigger:trigger.trigger,visual_role:"supporting",family:trigger.family,palette:trigger.palette,preferred_entry:"bottom_right",placement_rationale:"A restrained form supports the hero metric without becoming a second focal point.",semantic_removal_test:{result:"pass",weakened_dimension:"metric_counterweight",explanation:"Removal leaves the hero number visually isolated from the canvas."}};
  return {primary_motif:"none",reason:"typography_and_evidence_already_resolve_hierarchy_balance_and_rhythm"};
}

export function visualTraceFor(slide){
  const d=slide.design_reasoning||{},m=slide.motif_decision||{},c=slide.composition_solution||{},t=slide.template_match||{},a=slide.asset_selection||{};
  return {page:slide.outputSlide,narrative_job:slide.narrative_role,audience_effect:d.audience_effect,evidence_topology:slide.evidence_topology,art_direction:{energy:d.energy,gravity:d.gravity,focal_point:d.focal_structure?.primary,empty_zone:d.intentional_empty_zone?.preferred_zone,mass_strategy:d.visual_mass_intent},motif:{selected:m.primary_motif,semantic_reason:m.semantic_trigger||m.reason,removal_test:m.semantic_removal_test||{result:"not_applicable"}},composition:{dominant_object:c.dominant_object_scale,counterweight:d.visual_mass_intent?.counterweight,whitespace_strategy:d.whitespace_intention,solver_status:c.solver_status},template:{primitive:t.selected_primitive,capability_reason:t.capability_evidence,score:t.compatibility_score},asset:{selected:a.asset_id||"none",reason:a.reason||a.matched_on||"intentional_absence"},neighbor_difference:d.neighbor_difference||[]};
}
