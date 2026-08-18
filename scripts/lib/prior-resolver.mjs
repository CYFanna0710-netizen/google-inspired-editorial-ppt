function matches(conditions,context){return Object.entries(conditions||{}).every(([key,value])=>context[key]===value);}
function fallbackRank(prior,context,metric){
  if(prior.metric!==metric||!matches(prior.conditions,context))return -1;
  const keys=Object.keys(prior.conditions||{});
  if(keys.includes("page_role")&&keys.includes("motif_role"))return 50;
  if(keys.includes("motif_role"))return 40;
  if(keys.includes("motif_family"))return 30;
  if(keys.includes("page_role"))return 25;
  return 10;
}
export function resolveVisualDnaPriors(registry,context){
  const metrics=["whitespace_ratio","neutral_canvas_share","container_count",...(context.motif_role&&context.motif_role!=="none"?["crop_ratio","visible_share"]:[])],resolved=[];
  for(const metric of metrics){
    const ranked=(registry.priors||[]).map(prior=>({prior,rank:fallbackRank(prior,context,metric)})).filter(x=>x.rank>=0).sort((a,b)=>b.rank-a.rank||b.prior.sample.n-a.prior.sample.n);
    if(ranked[0])resolved.push({...ranked[0].prior,resolution:{rank:ranked[0].rank,context}});
  }
  return resolved;
}
export function priorRefs(resolved){return resolved.map(x=>x.id);}
export function priorByMetric(resolved,metric){return resolved.find(x=>x.metric===metric)||null;}
