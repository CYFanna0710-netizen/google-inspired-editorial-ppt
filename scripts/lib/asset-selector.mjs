import path from "node:path";

const edgeCompatible=(preferred,requested)=>preferred.includes(requested)||preferred.some(x=>x.includes(requested)||requested.includes(x));
const familyCompatible=(assetFamily,queryFamily)=>assetFamily===queryFamily||(queryFamily==="particle_cloth"&&assetFamily==="fluid_ribbon");

export function assetQueryFor(slide,motif,solution){
  if(motif.primary_motif==="none"||new Set(["full_field_spectrum","closing_arc"]).has(motif.primary_motif))return {status:"none",reason:"motif_does_not_require_organic_asset"};
  return {status:"requested",family:motif.family,palette:motif.palette,visual_role:motif.visual_role,preferred_entry:solution.edge_entry,crop_behavior:motif.visual_role==="hero"?"hero_crop":"aggressive",required_alpha:false,minimum_resolution:[1200,800],semantic_trigger:motif.semantic_trigger,composition_target:{asset_anchor:solution.asset_anchor,asset_visible_region:solution.asset_visible_region},required_background:"#F8F9FA"};
}

export function selectOrganicAsset(registry,query,skillRoot){
  if(query.status!=="requested")return {status:"none",asset_id:null,reason:query.reason||"intentional_absence"};
  const ranked=(registry.assets||[]).map(asset=>{
    const rights=asset.rights_status.startsWith("cleared")&&asset.trademark_check.startsWith("pass"),resolution=asset.resolution[0]>=query.minimum_resolution[0]&&asset.resolution[1]>=query.minimum_resolution[1],family=familyCompatible(asset.family,query.family),palette=asset.palette===query.palette||asset.section_compatibility.includes(query.palette),role=asset.preferred_role.includes(query.visual_role),edge=edgeCompatible(asset.preferred_entry_edge,query.preferred_entry),background=!query.required_background||asset.background===query.required_background;
    const score=(rights?25:-100)+(resolution?10:-30)+(family?25:0)+(palette?12:0)+(role?15:0)+(edge?10:0)+(background?3:-20)+(query.visual_role==="hero"&&asset.hero_capability?8:0);
    return {asset,score,checks:{rights,resolution,family,palette,role,edge,background}};
  }).sort((a,b)=>b.score-a.score);
  const selected=ranked.find(x=>x.checks.rights&&x.checks.resolution&&x.checks.family&&x.checks.role&&x.checks.background);
  if(!selected)return {status:"none",asset_id:null,reason:"no_asset_satisfies_rights_semantics_role_resolution_and_background_contract",rejected:ranked.slice(0,4).map(x=>({asset_id:x.asset.asset_id,score:x.score,checks:x.checks}))};
  return {status:"matched",asset_id:selected.asset.asset_id,file_ref:selected.asset.file_ref,absolute_path:path.resolve(skillRoot,selected.asset.file_ref),matched_on:Object.entries(selected.checks).filter(([,ok])=>ok).map(([key])=>key),score:selected.score,rights_status:selected.asset.rights_status,trademark_check:selected.asset.trademark_check,mass_profile:selected.asset.mass_profile,focal_region:selected.asset.focal_region,safe_crop_regions:selected.asset.safe_crop_regions,background:selected.asset.background,reason:`Matched ${query.family}, ${query.visual_role}, ${query.palette}, and ${query.preferred_entry} composition requirements`};
}
