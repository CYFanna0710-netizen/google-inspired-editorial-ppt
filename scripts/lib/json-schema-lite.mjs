const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const typeOf=value=>Array.isArray(value)?"array":value===null?"null":typeof value;

function resolveRef(root,ref){
  if(!ref.startsWith("#/"))throw new Error(`Only local JSON Schema references are supported: ${ref}`);
  return ref.slice(2).split("/").reduce((node,part)=>node?.[part.replace(/~1/g,"/").replace(/~0/g,"~")],root);
}

export function validateJsonSchema(value,schema){
  const issues=[];
  function add(location,keyword,message){issues.push({severity:"critical",code:"JSON_SCHEMA",location,keyword,message});}
  function walk(current,rule,location){
    if(!rule||typeof rule!=="object")return;
    if(rule.$ref){const resolved=resolveRef(schema,rule.$ref);if(!resolved){add(location,"$ref",`Unresolved reference ${rule.$ref}.`);return;}walk(current,resolved,location);return;}
    if(Object.hasOwn(rule,"const")&&!same(current,rule.const))add(location,"const",`Expected constant ${JSON.stringify(rule.const)}.`);
    if(rule.enum&&!rule.enum.some(x=>same(x,current)))add(location,"enum",`Value is not in ${JSON.stringify(rule.enum)}.`);
    if(rule.type){
      const actual=typeOf(current),valid=rule.type==="integer"?Number.isInteger(current):rule.type==="number"?typeof current==="number"&&Number.isFinite(current):actual===rule.type;
      if(!valid){add(location,"type",`Expected ${rule.type}, received ${actual}.`);return;}
    }
    if(rule.type==="object"){
      for(const key of rule.required||[])if(!Object.hasOwn(current,key))add(`${location}.${key}`,"required",`Missing required property ${key}.`);
      for(const [key,child] of Object.entries(rule.properties||{}))if(Object.hasOwn(current,key))walk(current[key],child,`${location}.${key}`);
      if(rule.additionalProperties===false){const allowed=new Set(Object.keys(rule.properties||{}));for(const key of Object.keys(current))if(!allowed.has(key))add(`${location}.${key}`,"additionalProperties",`Property ${key} is not allowed.`);}
    }
    if(rule.type==="array"){
      if(rule.minItems!==undefined&&current.length<rule.minItems)add(location,"minItems",`Expected at least ${rule.minItems} items.`);
      if(rule.maxItems!==undefined&&current.length>rule.maxItems)add(location,"maxItems",`Expected at most ${rule.maxItems} items.`);
      if(rule.items)current.forEach((item,index)=>walk(item,rule.items,`${location}[${index}]`));
    }
    if(rule.type==="string"){
      if(rule.minLength!==undefined&&current.length<rule.minLength)add(location,"minLength",`Expected at least ${rule.minLength} characters.`);
      if(rule.pattern&&!new RegExp(rule.pattern).test(current))add(location,"pattern",`Value does not match ${rule.pattern}.`);
    }
    if(rule.type==="number"||rule.type==="integer"){
      if(rule.minimum!==undefined&&current<rule.minimum)add(location,"minimum",`Value is below ${rule.minimum}.`);
      if(rule.maximum!==undefined&&current>rule.maximum)add(location,"maximum",`Value is above ${rule.maximum}.`);
    }
  }
  walk(value,schema,"$");
  return {status:issues.length?"fail":"pass",issues};
}
