const templateById=(manifest,id)=>manifest.templates.find(template=>template.template_id===id);

export function buildPage9RatioRequest(){
  return {
    page:9,
    communication_goal:"Show that three inputs contribute 60%, 25%, and 15% to one combined result without visually averaging their importance.",
    semantic_relationship:"part_to_whole",
    visual_action:"measure_and_combine",
    visual_concept:"ratio-proportional-fields",
    required_capabilities:{
      hero_object:"proportional_field_system",
      scale_mode:"direct_proportion",
      data_encoding:{dimension:"weight",channel:"area_width",values:[60,25,15]},
      spatial:["supports_area_encoding","supports_partition","supports_fusion"],
      color_role:"data_encoding",
      editable_objects_required:true
    }
  };
}

export function matchTemplateCapabilities(request,manifest,mappingDocument){
  const mapping=mappingDocument.mappings.find(item=>item.visual_grammar_id===request.visual_concept);
  if(!mapping)throw new Error(`No template mapping for ${request.visual_concept}.`);
  const listed=[...mapping.compatible_templates,...mapping.conditionally_compatible_templates];
  const candidateTemplates=listed.map(id=>{
    const template=templateById(manifest,id);
    const missing=[];
    for(const capability of request.required_capabilities.spatial){if(!template.spatial_capabilities[capability])missing.push(capability);}
    if(!template.hero_object_capabilities.includes(request.required_capabilities.hero_object))missing.push(`hero_object:${request.required_capabilities.hero_object}`);
    return {template_id:id,mapping_status:mapping.compatible_templates.includes(id)?"compatible":"conditional",missing_capabilities:missing};
  });
  const rejectedTemplates=[];
  for(const template of manifest.templates){
    const candidate=candidateTemplates.find(item=>item.template_id===template.template_id);
    const reasons=[];
    if(candidate?.missing_capabilities.length)reasons.push(...candidate.missing_capabilities.map(item=>`missing ${item}`));
    if(["T09","T12","T14","T17"].includes(template.template_id))reasons.push("equal-width structure would falsely encode 60/25/15 as equal weights");
    if(["T13","T18"].includes(template.template_id))reasons.push("supports independent bar-length mapping only; it does not support part-to-whole area partition or fusion");
    if(mapping.incompatible_templates.includes(template.template_id))reasons.push("visual grammar mapping marks the primitive incompatible");
    if(reasons.length)rejectedTemplates.push({template_id:template.template_id,reasons:[...new Set(reasons)]});
  }
  const viable=candidateTemplates.filter(candidate=>candidate.missing_capabilities.length===0);
  return {
    communication_goal:request.communication_goal,
    semantic_relationship:request.semantic_relationship,
    visual_action:request.visual_action,
    visual_concept:request.visual_concept,
    required_capabilities:request.required_capabilities,
    candidate_templates:candidateTemplates,
    rejected_templates:rejectedTemplates.map(item=>item.template_id),
    rejection_reasons:Object.fromEntries(rejectedTemplates.map(item=>[item.template_id,item.reasons])),
    selected_template:viable[0]?.template_id||null,
    renderer_capability_gap:viable.length?null:{
      status:"gap",
      missing:["editable data-bound 60/25/15 area partition","semantic fusion into one combined Hero Object"],
      decision:"Do not substitute equal-width columns or independent bars. Preserve the visual concept and defer execution until the Renderer has a truthful proportional-field primitive."
    }
  };
}
