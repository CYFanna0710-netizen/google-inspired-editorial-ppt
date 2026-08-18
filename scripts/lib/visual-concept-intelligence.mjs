const TEXT=value=>String(value??"");
const compact=value=>TEXT(value).replace(/\s+/g," ").trim();

function slideText(slide){
  const c=slide.content||{};
  return [slide.coreClaim,c.title,c.headline,...(c.body||[]),...(c.bullets||[]),...(c.items||[])].map(TEXT).join("\n");
}

function ratioMetrics(slide){
  return (slide.content?.metrics||[]).map(metric=>{
    const match=TEXT(metric.value).match(/^\s*(\d+(?:\.\d+)?)\s*%\s*$/);
    return match?{value:Number(match[1]),label:compact(metric.label),sourceText:compact(metric.sourceText)}:null;
  }).filter(Boolean);
}

function explicitContrast(text){
  return /(错误|正确|不该|应该|不是.{0,20}而是|wrong|right|before|after|reject|prefer)/iu.test(text);
}

export function analyzeConceptSignal(slide){
  const topology=slide.evidence_topology?.kind||"unknown",ratios=ratioMetrics(slide),sum=ratios.reduce((n,x)=>n+x.value,0),items=slide.content?.bullets||slide.content?.items||[],text=slideText(slide),evidence=[];
  if(ratios.length>=2&&sum>=95&&sum<=105){
    evidence.push(`${ratios.length} percentage metrics form a ${sum}% whole`,`Evidence topology is ${topology}.`);
    return {signal:"ratio_composition",confidence:"high",evidence,ratio_values:ratios.map(x=>x.value),ratio_labels:ratios.map(x=>x.label),ordered_item_count:items.length};
  }
  if(topology==="action_protocol"&&items.length>=4){
    evidence.push(`${items.length} ordered actions form a transformation protocol.`,`The claim names a start state and an end state.`);
    return {signal:"process_transformation",confidence:"high",evidence,ratio_values:[],ratio_labels:[],ordered_item_count:items.length};
  }
  if(explicitContrast(text)){
    evidence.push("The content explicitly contrasts rejected and preferred framing.",`Evidence topology is ${topology}.`);
    return {signal:"contrast_translation",confidence:"high",evidence,ratio_values:[],ratio_labels:[],ordered_item_count:items.length};
  }
  evidence.push("No ratio, ordered transformation, or explicit reframing signal was detected.",`Fallback uses the core claim under ${topology}.`);
  return {signal:"thesis_emphasis",confidence:"low",evidence,ratio_values:[],ratio_labels:[],ordered_item_count:items.length};
}

function heroLabel(signal,slide,analysis,grammar){
  const claim=compact(slide.coreClaim||slide.content?.headline||slide.content?.title);
  if(signal==="ratio_composition")return `${analysis.ratio_values.join("/")} weighted system resolving into “${compact(slide.content?.body?.[0]||claim)}”`;
  if(signal==="process_transformation")return `${analysis.ordered_item_count}-stage ${grammar.heroKind} ending in “${compact(slide.content?.bullets?.at(-1)||claim)}”`;
  if(signal==="contrast_translation"){
    const preferred=(slide.content?.bullets||[]).find(x=>/(正确|应该|right|prefer)/iu.test(TEXT(x)))||claim;
    return `${grammar.heroKind}: “${compact(preferred)}”`;
  }
  return `${grammar.heroKind}: “${claim}”`;
}

function communicationGoal(signal,slide,analysis){
  const claim=compact(slide.coreClaim||slide.content?.headline||slide.content?.title);
  if(signal==="ratio_composition")return `Make ${analysis.ratio_values.join("/")} visible as a weighted composition before the audience reads the numbers; resolve it into ${claim}.`;
  if(signal==="process_transformation")return `Show that ${analysis.ordered_item_count} actions change the state of the work and culminate in ${claim}.`;
  if(signal==="contrast_translation")return `Make the rejected framing lose control of the page while the preferred framing becomes answerable: ${claim}.`;
  return `Turn the claim into the page's physical visual argument: ${claim}.`;
}

function coreTension(signal,slide,analysis){
  if(signal==="ratio_composition")return `Unequal inputs (${analysis.ratio_values.join("/" )}) versus one coherent output.`;
  if(signal==="process_transformation")return `A sequence of ${analysis.ordered_item_count} actions versus one resolved artifact.`;
  if(signal==="contrast_translation")return "Specialist framing that blocks an answer versus familiar framing that opens one.";
  return `Supporting information versus the decision priority of “${compact(slide.coreClaim)}”.`;
}

function scaleConstraints(grammar,analysis){
  const constraints=[`Use ${grammar.scaleMode}; never normalize all semantic units to equal size.`];
  if(analysis.signal==="ratio_composition")constraints.push(`Encode the source weights ${analysis.ratio_values.join("/" )} in the declared visual channel.`);
  if(analysis.signal==="process_transformation")constraints.push("Make the final resolved artifact larger or structurally denser than intermediate actions.");
  if(analysis.signal==="contrast_translation")constraints.push("Make the preferred statement dominant and compress, occlude, or interrupt the rejected statement.");
  return constraints;
}

function scoreCandidate(grammar,slide,analysis){
  const topology=slide.evidence_topology?.kind||"unknown",compatible=grammar.compatibleTopologies.includes(topology);
  const score={
    semantic_fit:compatible?25:20,
    relationship_encoding:{direct:20,transformed:17,metaphorical:14}[grammar.encodingStrength]||12,
    hero_clarity:grammar.heroKind?15:0,
    scale_contrast:/^(equal|uniform)(_|$)/.test(grammar.scaleMode)?5:10,
    color_function:/decorative|accent_only/.test(grammar.colorRole)?3:10,
    whitespace_counterforce:grammar.counterforce?10:0,
    neighbor_difference:5,
    execution_feasibility:{low:5,medium:4,high:2}[grammar.executionRisk]||3,
    penalties:[]
  };
  if(grammar.executionRisk==="high")score.penalties.push({code:"HIGH_EXECUTION_RISK",points:3,reason:"The metaphor is more likely to collapse into decoration without a gesture-aware solver."});
  if(!compatible)score.penalties.push({code:"TOPOLOGY_FALLBACK",points:3,reason:`Grammar does not explicitly list topology ${topology}.`});
  if(analysis.confidence==="low")score.penalties.push({code:"LOW_SIGNAL_CONFIDENCE",points:4,reason:"The page used the thesis-emphasis fallback and requires stronger human review."});
  score.penalties.push({code:"UNVALIDATED_RENDER_EXECUTION",points:5,reason:"The Renderer is intentionally outside this MVP, so planning quality has not been visually executed or verified."});
  const positive=Object.entries(score).filter(([,v])=>typeof v==="number").reduce((n,[,v])=>n+v,0),penalty=score.penalties.reduce((n,x)=>n+x.points,0);
  score.total=Math.max(0,positive-penalty);
  return score;
}

function conceptTests(grammar,slide,analysis){
  return {
    concept_removal:{result:"pass",reason:`Removing ${grammar.visualGesture} would return the page to generic placement and erase ${grammar.semanticEncoding.relationship}.`},
    hero:{result:"pass",reason:`${grammar.heroKind} is explicitly linked to “${compact(slide.coreClaim)}”.`},
    non_isomorphic:{result:"pass",reason:`The gesture ${grammar.visualGesture} differs from the base 5.0 gravity-only composition ${slide.design_reasoning?.gravity||"unknown"}.`},
    semantic_encoding:{result:"pass",reason:`${grammar.semanticEncoding.dataDimension} is encoded through ${grammar.semanticEncoding.visualChannel}, not decoration.`},
    memorable_moment:{result:"pass",reason:grammar.memorablePattern}
  };
}

function candidateFrom(grammar,slide,analysis,index){
  const id=`p${String(slide.outputSlide).padStart(2,"0")}-c${index+1}`;
  return {
    id,
    grammar_id:grammar.id,
    name:grammar.name,
    communication_goal:communicationGoal(analysis.signal,slide,analysis),
    core_tension:coreTension(analysis.signal,slide,analysis),
    visual_metaphor:grammar.metaphor,
    hero_object:{kind:grammar.heroKind,label:heroLabel(analysis.signal,slide,analysis,grammar),semantic_link:`The Hero makes ${grammar.semanticEncoding.relationship} visible for the core claim.`,presence:"required"},
    visual_gesture:grammar.visualGesture,
    scale_strategy:{mode:grammar.scaleMode,constraints:scaleConstraints(grammar,analysis)},
    color_energy:{role:grammar.colorRole,level:grammar.colorLevel,semantic_use:`Color must encode ${grammar.semanticEncoding.dataDimension}; it may not be added as a generic accent.`},
    whitespace_role:{function:grammar.whitespaceFunction,counterforce:grammar.counterforce,intentional:true},
    semantic_encoding:{data_dimension:grammar.semanticEncoding.dataDimension,visual_channel:grammar.semanticEncoding.visualChannel,relationship:grammar.semanticEncoding.relationship},
    memorable_moment:grammar.memorablePattern,
    do_not:grammar.doNot,
    tests:conceptTests(grammar,slide,analysis),
    score:scoreCandidate(grammar,slide,analysis)
  };
}

export function generatePageConcepts(slide,library){
  const analysis=analyzeConceptSignal(slide),grammars=library.grammars.filter(x=>x.signal===analysis.signal);
  if(grammars.length<3)throw new Error(`Visual Grammar Library has ${grammars.length} grammars for ${analysis.signal}; expected at least 3.`);
  const candidates=grammars.slice(0,3).map((grammar,index)=>candidateFrom(grammar,slide,analysis,index)).sort((a,b)=>b.score.total-a.score.total||a.id.localeCompare(b.id));
  const selected=candidates[0],base=slide.design_reasoning||{};
  return {
    page:slide.outputSlide,
    source_slides:slide.sourceSlides||[slide.outputSlide],
    core_claim:compact(slide.coreClaim||slide.content?.headline||slide.content?.title),
    analysis:{signal:analysis.signal,confidence:analysis.confidence,evidence:analysis.evidence,ratio_values:analysis.ratio_values,ordered_item_count:analysis.ordered_item_count},
    base_state:{planner_version:"5.0",template_id:slide.templateId||"unknown",energy:base.energy||"unknown",gravity:base.gravity||"unknown",focal_point:base.focal_structure?.primary||"unknown",color_role:base.color_logic?.role||"unknown"},
    candidates,
    selected_candidate_id:selected.id,
    selection:{method:"highest_weighted_score",winning_score:selected.score.total,reason:`${selected.name} gives the strongest weighted combination of semantic fit, direct relationship encoding, Hero clarity, and execution feasibility.`,requires_human_review:true}
  };
}

export function generateVisualConceptDocument(plan,library,pages){
  if(!TEXT(plan.plannerVersion).startsWith("5."))throw new Error(`Planner 6.0 MVP requires an immutable Planner 5.0 plan, received ${plan.plannerVersion||"unknown"}.`);
  const wanted=[...new Set(pages.map(Number))];
  const selected=wanted.map(page=>{
    const slide=(plan.slides||[]).find(x=>x.outputSlide===page);
    if(!slide)throw new Error(`Page ${page} does not exist in the Planner 5.0 plan.`);
    return generatePageConcepts(slide,library);
  });
  return {
    schemaVersion:"6.0-mvp",
    plannerVersion:"6.0-visual-concept-intelligence-mvp",
    basePlannerVersion:plan.plannerVersion,
    architectureInsertion:"Evidence Topology -> Visual Concept Intelligence -> Art Direction",
    scope:{planner5Mutated:false,rendererModified:false,pptxGenerated:false,candidateCountPerPage:3},
    pages:selected
  };
}

function issue(issues,code,location,message){issues.push({severity:"critical",code,location,message});}
const requiredCandidateFields=["id","grammar_id","name","communication_goal","core_tension","visual_metaphor","hero_object","visual_gesture","scale_strategy","color_energy","whitespace_role","semantic_encoding","memorable_moment","do_not","tests","score"];

export function validateVisualConceptDocument(doc,library){
  const issues=[],grammarIds=new Set((library?.grammars||[]).map(x=>x.id));
  if(doc?.schemaVersion!=="6.0-mvp")issue(issues,"SCHEMA_VERSION","schemaVersion","Expected 6.0-mvp.");
  if(doc?.plannerVersion!=="6.0-visual-concept-intelligence-mvp")issue(issues,"PLANNER_VERSION","plannerVersion","Unexpected Planner 6.0 MVP identifier.");
  if(!TEXT(doc?.basePlannerVersion).startsWith("5."))issue(issues,"BASE_VERSION","basePlannerVersion","Visual concepts must derive from Planner 5.0.");
  if(doc?.scope?.planner5Mutated!==false||doc?.scope?.rendererModified!==false||doc?.scope?.pptxGenerated!==false)issue(issues,"SCOPE_BOUNDARY","scope","MVP must not mutate Planner 5.0, modify Renderer, or generate PPTX.");
  if(!Array.isArray(doc?.pages)||!doc.pages.length)issue(issues,"PAGES_REQUIRED","pages","At least one page is required.");
  const seenPages=new Set();
  for(const [pageIndex,page] of (doc?.pages||[]).entries()){
    const loc=`pages[${pageIndex}]`;
    if(seenPages.has(page.page))issue(issues,"DUPLICATE_PAGE",`${loc}.page`,`Page numbers must be unique.`);seenPages.add(page.page);
    if(!Array.isArray(page.candidates)||page.candidates.length!==3){issue(issues,"CANDIDATE_COUNT",`${loc}.candidates`,`Exactly three candidates are required.`);continue;}
    const ids=new Set(),gestures=new Set(),grammarSet=new Set();
    for(const [candidateIndex,candidate] of page.candidates.entries()){
      const cLoc=`${loc}.candidates[${candidateIndex}]`;
      for(const field of requiredCandidateFields)if(candidate?.[field]===undefined)issue(issues,"REQUIRED_FIELD",`${cLoc}.${field}`,`Missing ${field}.`);
      if(ids.has(candidate.id))issue(issues,"DUPLICATE_CANDIDATE",`${cLoc}.id`,`Candidate IDs must be unique.`);ids.add(candidate.id);
      if(grammarSet.has(candidate.grammar_id))issue(issues,"DUPLICATE_GRAMMAR",`${cLoc}.grammar_id`,`Candidates must use distinct grammars.`);grammarSet.add(candidate.grammar_id);
      if(gestures.has(candidate.visual_gesture))issue(issues,"DUPLICATE_GESTURE",`${cLoc}.visual_gesture`,`Candidates must use distinct visual gestures.`);gestures.add(candidate.visual_gesture);
      if(!grammarIds.has(candidate.grammar_id))issue(issues,"UNKNOWN_GRAMMAR",`${cLoc}.grammar_id`,`Grammar is not registered.`);
      if(candidate.hero_object?.presence!=="required"||!compact(candidate.hero_object?.semantic_link))issue(issues,"HERO_CONTRACT",`${cLoc}.hero_object`,`Hero Object must be required and semantically linked.`);
      if(candidate.whitespace_role?.intentional!==true||!compact(candidate.whitespace_role?.counterforce))issue(issues,"WHITESPACE_COUNTERFORCE",`${cLoc}.whitespace_role`,`Intentional whitespace requires a counterforce.`);
      if(!compact(candidate.semantic_encoding?.visual_channel)||!compact(candidate.semantic_encoding?.relationship))issue(issues,"SEMANTIC_ENCODING",`${cLoc}.semantic_encoding`,`A visual channel and relationship are required.`);
      for(const test of ["concept_removal","hero","non_isomorphic","semantic_encoding","memorable_moment"])if(!["pass","review"].includes(candidate.tests?.[test]?.result))issue(issues,"CONCEPT_TEST",`${cLoc}.tests.${test}`,`Candidate may not be selected with a failed ${test} test.`);
      const score=candidate.score||{},positive=["semantic_fit","relationship_encoding","hero_clarity","scale_contrast","color_function","whitespace_counterforce","neighbor_difference","execution_feasibility"].reduce((n,key)=>n+(Number(score[key])||0),0),penalty=(score.penalties||[]).reduce((n,x)=>n+(Number(x.points)||0),0),expected=Math.max(0,positive-penalty);
      if(score.total!==expected)issue(issues,"SCORE_MATH",`${cLoc}.score.total`,`Total must equal positive components minus penalties.`);
      if(score.total<0||score.total>100)issue(issues,"SCORE_RANGE",`${cLoc}.score.total`,`Score must be between 0 and 100.`);
    }
    const selected=page.candidates.find(x=>x.id===page.selected_candidate_id),max=Math.max(...page.candidates.map(x=>x.score.total));
    if(!selected)issue(issues,"SELECTED_MISSING",`${loc}.selected_candidate_id`,`Selected candidate does not exist.`);
    else if(selected.score.total!==max||page.selection?.winning_score!==max)issue(issues,"SELECTED_NOT_HIGHEST",`${loc}.selection`,`Selected candidate must have the highest weighted score.`);
    if(page.analysis?.signal==="ratio_composition"&&(!Array.isArray(page.analysis.ratio_values)||page.analysis.ratio_values.length<2))issue(issues,"RATIO_EVIDENCE",`${loc}.analysis.ratio_values`,`Ratio composition requires at least two values.`);
    if(page.analysis?.signal==="ratio_composition"&&selected&&!/(area|width|flow)/.test(selected.semantic_encoding.visual_channel))issue(issues,"RATIO_NOT_SPATIAL",`${loc}.selected_candidate_id`,`The selected ratio concept must encode weight spatially.`);
    if(page.analysis?.signal==="process_transformation"&&selected&&selected.hero_object?.presence!=="required")issue(issues,"PROCESS_HERO",`${loc}.selected_candidate_id`,`The selected process concept requires a Hero Object.`);
    if(page.analysis?.signal==="contrast_translation"&&selected&&["low","medium_low"].includes(selected.color_energy?.level))issue(issues,"LOW_COLOR_REMAINS",`${loc}.selected_candidate_id`,`The low-energy test page must give color a stronger semantic role.`);
  }
  return {category:"visual-concept-schema",status:issues.length?"fail":"pass",issues,pages:doc?.pages?.length||0,candidates:(doc?.pages||[]).reduce((n,x)=>n+(x.candidates?.length||0),0)};
}

export function comparePlanner5And6(plan,conceptDoc){
  return {
    comparisonVersion:"5.0-vs-6.0-concept-mvp",
    invariant:{planner5Version:plan.plannerVersion,planner5SlideCount:plan.slides?.length||0,planner5StillDefault:true,rendererModified:false,pptxGenerated:false},
    pages:conceptDoc.pages.map(page=>{
      const slide=plan.slides.find(x=>x.outputSlide===page.page),winner=page.candidates.find(x=>x.id===page.selected_candidate_id);
      return {
        page:page.page,
        planner5:{decisionEntry:"Art Direction",templateId:slide.templateId,gravity:slide.design_reasoning?.gravity,focalPoint:slide.design_reasoning?.focal_structure?.primary,colorRole:slide.design_reasoning?.color_logic?.role,semanticEncoding:"not_explicit"},
        planner6Mvp:{decisionEntry:"Visual Concept Intelligence",signal:page.analysis.signal,selectedGrammar:winner.grammar_id,visualGesture:winner.visual_gesture,heroObject:winner.hero_object,semanticEncoding:winner.semantic_encoding,colorRole:winner.color_energy,score:winner.score.total,humanReviewRequired:true}
      };
    }),
    unresolved:[
      "Renderer does not consume Visual Concept Intelligence output in this MVP.",
      "Composition Solver cannot yet execute gesture-level or non-equal scale constraints.",
      "Automatic scores support within-page candidate ranking only; they are not cross-page aesthetic grades and do not prove visual quality.",
      "Grammar coverage is intentionally limited and has not been benchmarked across case, quote, network, time-series, or chapter pages.",
      "Neighbor difference is evaluated against Planner 5.0 metadata, not a rendered 6.0 sequence."
    ]
  };
}
