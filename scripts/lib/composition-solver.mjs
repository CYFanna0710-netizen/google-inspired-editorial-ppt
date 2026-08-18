const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const box=(left,top,width,height)=>[left,top,width,height].map(v=>Number(v.toFixed(3)));

const LAYOUTS={
  center_left:{headline:box(.055,.16,.55,.34),evidence:box(.07,.54,.42,.2),secondary:box(.67,.2,.23,.18),cluster:box(.055,.14,.88,.7),empty:box(.54,.55,.23,.28),asset:box(.57,.42,.43,.58)},
  upper_left:{headline:box(.045,.07,.58,.22),evidence:box(.045,.34,.49,.36),secondary:box(.62,.18,.27,.18),cluster:box(.045,.07,.88,.7),empty:box(.58,.48,.3,.3),asset:box(.62,.45,.38,.55)},
  left_right_rail:{headline:box(.04,.065,.6,.16),evidence:box(.72,.2,.22,.43),secondary:box(.72,.2,.22,.18),cluster:box(.04,.065,.9,.64),empty:box(.43,.48,.24,.26),asset:box(.0,.0,.32,.25)},
  left_right:{headline:box(.04,.065,.42,.18),evidence:box(.54,.18,.4,.5),secondary:box(.56,.2,.34,.2),cluster:box(.04,.065,.9,.67),empty:box(.43,.52,.1,.22),asset:box(.68,.62,.32,.38)},
  split:{headline:box(.04,.065,.43,.16),evidence:box(.5,0,.5,1),secondary:box(.04,.34,.4,.2),cluster:box(.04,.065,.92,.82),empty:box(.04,.63,.37,.23),asset:box(.72,.55,.28,.45)},
  distributed:{headline:box(.04,.06,.75,.16),evidence:box(.04,.27,.92,.55),secondary:box(.69,.06,.24,.14),cluster:box(.04,.06,.92,.76),empty:box(.78,.78,.16,.12),asset:box(.72,.0,.28,.28)},
  distributed_zones:{headline:box(.04,.055,.66,.15),evidence:box(.04,.25,.92,.48),secondary:box(.04,.76,.84,.13),cluster:box(.04,.055,.92,.84),empty:box(.9,.76,.06,.13),asset:box(.72,.62,.28,.38)},
  distributed_two_column:{headline:box(.04,.055,.7,.16),evidence:box(.04,.29,.92,.58),secondary:box(.52,.29,.44,.58),cluster:box(.04,.055,.92,.81),empty:box(.78,.06,.18,.13),asset:box(.73,.0,.27,.27)},
  full_field:{headline:box(.04,.22,.74,.43),evidence:box(0,0,0,0),secondary:box(.04,.07,.12,.08),cluster:box(.04,.07,.78,.58),empty:box(.76,.63,.2,.24),asset:box(0,0,0,0)},
  left:{headline:box(.045,.19,.58,.3),evidence:box(.045,.7,.42,.1),secondary:box(.05,.54,.48,.1),cluster:box(.045,.19,.88,.62),empty:box(.65,.18,.28,.34),asset:box(.75,.42,.25,.58)}
};

function textLoad(slide){const c=slide.content||{},parts=[slide.coreClaim,...(c.body||[]),...(c.bullets||[]),c.quote,c.objective,c.action,...(c.outcomes||[])].filter(Boolean);return {characters:parts.join(" ").length,blocks:parts.length,items:(c.items||[]).length,sourceLines:(c.sources||[]).length};}

export function solveComposition(slide,art,motif){
  const layout=structuredClone(LAYOUTS[art.gravity]||LAYOUTS.upper_left),load=textLoad(slide),headlineCapacity=Math.max(42,Math.round(layout.headline[2]*layout.headline[3]*1200)),evidenceCapacity=Math.max(160,Math.round(layout.evidence[2]*layout.evidence[3]*2400));
  const infeasible=String(slide.coreClaim||"").length>headlineCapacity||load.characters>evidenceCapacity+headlineCapacity+900||load.sourceLines>10;
  const hasAsset=motif.primary_motif!=="none"&&!new Set(["full_field_spectrum","closing_arc"]).has(motif.primary_motif),assetVisible=hasAsset?layout.asset:box(0,0,0,0),edge=hasAsset?(motif.preferred_entry||art.visual_mass_intent.counterweight.target_zone||"none"):"none";
  const dominant=slide.page_type==="chapter"?.58:slide.semanticRole==="cover"?.48:slide.evidence_type==="decisive KPI"?.44:slide.page_type==="data"?.36:slide.semanticRole==="quote"?.4:.32;
  return {
    coordinate_space:"normalized_canvas",
    primary_focal_bbox:layout.headline,
    secondary_focal_bbox:layout.secondary,
    headline_bbox:layout.headline,
    evidence_bbox:layout.evidence,
    content_cluster_bbox:layout.cluster,
    intentional_empty_zone_bbox:layout.empty,
    asset_anchor:{edge,point:edge.includes("right")?[1,edge.includes("top")?0:1]:edge.includes("left")?[0,edge.includes("top")?0:1]:[.5,.5]},
    asset_visible_region:assetVisible,
    dominant_object_scale:dominant,
    edge_entry:edge,
    overlap_behavior:{mode:hasAsset?"composition_field_only":"none",forbidden_targets:["headline","body","source","intentional_empty_zone"]},
    relative_spacing_relationships:[
      {subject:"headline_bbox",relation:art.gravity==="split"?"left_of":"precedes",object:"evidence_bbox",preferred_gap:.045,tolerance:.02},
      {subject:"intentional_empty_zone_bbox",relation:"protected_from",object:"evidence_bbox"},
      {subject:"asset_visible_region",relation:"outside",object:"intentional_empty_zone_bbox"}
    ],
    tolerances:{bbox_translation:.025,bbox_scale:.06,minimum_source_height:.025},
    capacity_assessment:{...load,headlineCapacity,evidenceCapacity},
    solver_status:infeasible?"needs_content_replan":"feasible",
    replan_reason:infeasible?"Content footprint cannot satisfy hierarchy, citations, editability, and whitespace intention at approved text sizes":null
  };
}

export function normalizedToPixels(value,{width=1280,height=720}={}){
  if(!Array.isArray(value)||value.length<4)return {left:0,top:0,width:0,height:0};
  return {left:Math.round(clamp(value[0],0,1)*width),top:Math.round(clamp(value[1],0,1)*height),width:Math.round(clamp(value[2],0,1)*width),height:Math.round(clamp(value[3],0,1)*height)};
}
