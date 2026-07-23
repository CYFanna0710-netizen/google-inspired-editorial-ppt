import fs from "node:fs/promises";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {args,need,numericTokens,writeJson} from "./lib/common.mjs";

const a=args();
const source=path.resolve(need(a,"source"));
const output=path.resolve(need(a,"output"));
const out=path.resolve(need(a,"out"));
const notesPath=a.notes?path.resolve(a.notes):null;
const notes=notesPath?JSON.parse(await fs.readFile(notesPath,"utf8")):{items:[]};

const listSlides=file=>{
  const r=spawnSync("unzip",["-Z1",file],{encoding:"utf8",maxBuffer:20_000_000});
  if(r.status!==0)throw new Error(r.stderr||`Unreadable PPTX: ${file}`);
  return r.stdout.split(/\r?\n/).filter(x=>/^ppt\/slides\/slide\d+\.xml$/.test(x)).sort((x,y)=>Number(x.match(/\d+/)[0])-Number(y.match(/\d+/)[0]));
};
const readEntry=(file,entry)=>{
  const r=spawnSync("unzip",["-p",file,entry],{encoding:"utf8",maxBuffer:80_000_000});
  if(r.status!==0)throw new Error(r.stderr||`Cannot read ${entry}`);return r.stdout;
};
const decode=s=>String(s||"").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,"&");
const texts=xml=>[...xml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].map(m=>decode(m[1]).trim()).filter(Boolean);
const normalize=s=>String(s||"").normalize("NFKC").toLowerCase().replace(/[\s\u00a0]+/g,"").replace(/[，。；：、,.!?！？;:'“”‘’()（）\[\]【】<>《》·•—–_-]/g,"");
const ignored=/^(?:\d+|‹#›|clicktoedit.*|dateplaceholder.*|footerplaceholder.*|slidenumberplaceholder.*)$/i;

const sourceSlides=listSlides(source),outputSlides=listSlides(output);
const excluded=new Map();
for(const item of notes.items||[]){const n=normalize(item.text);if(!n)continue;const s=Number(item.slide);if(!excluded.has(s))excluded.set(s,new Set());excluded.get(s).add(n);}

const issues=[];
if(sourceSlides.length!==outputSlides.length)issues.push({severity:"critical",code:"SLIDE_COUNT_CHANGED",source:sourceSlides.length,output:outputSlides.length});
const count=Math.min(sourceSlides.length,outputSlides.length);
for(let i=0;i<count;i++){
  const sTexts=texts(readEntry(source,sourceSlides[i]));
  const oTexts=texts(readEntry(output,outputSlides[i]));
  const outputJoined=normalize(oTexts.join(""));
  const sourceAudience=sTexts.map(t=>({raw:t,n:normalize(t)})).filter(x=>x.n.length>1&&!ignored.test(x.n)&&!excluded.get(i+1)?.has(x.n));
  for(const item of sourceAudience){
    if(!outputJoined.includes(item.n))issues.push({severity:"critical",code:"VISIBLE_TEXT_MISSING",slide:i+1,text:item.raw});
  }
  const srcNums=new Set(sourceAudience.flatMap(x=>numericTokens(x.raw)));
  const outNums=new Set(oTexts.flatMap(x=>numericTokens(x)));
  for(const value of srcNums)if(!outNums.has(value))issues.push({severity:"critical",code:"NUMBER_MISSING",slide:i+1,value});
}

const report={category:"visual_preservation",status:issues.some(x=>x.severity==="critical")?"fail":"pass",sourceSlides:sourceSlides.length,outputSlides:outputSlides.length,issues};
await writeJson(out,report);
console.log(JSON.stringify({status:report.status,issues:issues.length,out}));
if(report.status==="fail")process.exitCode=2;
