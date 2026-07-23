import fs from "node:fs/promises";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {args,need,writeJson,classify,density,numericTokens} from "./lib/common.mjs";

const a=args(),input=path.resolve(need(a,"input")),work=path.resolve(need(a,"work"));
await fs.mkdir(work,{recursive:true});
const unzip=(entry,optional=false)=>{const r=spawnSync("unzip",["-p",input,entry],{encoding:"utf8",maxBuffer:80_000_000});if(r.status!==0){if(optional)return "";throw new Error(r.stderr||`Unable to read ${entry}`);}return r.stdout;};
const listResult=spawnSync("unzip",["-Z1",input],{encoding:"utf8",maxBuffer:20_000_000});if(listResult.status!==0)throw new Error(listResult.stderr||`Unreadable PPTX: ${input}`);const entries=listResult.stdout.split(/\r?\n/).filter(Boolean);
const decode=s=>String(s||"").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,"&");
const texts=xml=>[...xml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].map(m=>decode(m[1]).trim()).filter(Boolean);
const relMap=xml=>Object.fromEntries([...xml.matchAll(/<Relationship\b([^>]*)\/?\s*>/g)].map(m=>{const id=m[1].match(/\bId="([^"]+)"/)?.[1],target=m[1].match(/\bTarget="([^"]+)"/)?.[1];return [id,target];}).filter(([id,target])=>id&&target));
const slideEntries=entries.filter(x=>/^ppt\/slides\/slide\d+\.xml$/.test(x)).sort((x,y)=>Number(x.match(/\d+/)[0])-Number(y.match(/\d+/)[0]));
const placeholder=/^(click to edit|date placeholder|footer placeholder|slide number placeholder|text placeholder|title placeholder|picture \d+|textbox \d+|rectangle \d+|‹#›)$/i;
const artifactName=/^(Calibri|Arial|Noto Sans|Microsoft YaHei|Blank)$/i;
const clean=arr=>arr.filter(x=>x&&!placeholder.test(x)&&!artifactName.test(x));
const resolveTarget=(base,target)=>target.startsWith("/")?target.slice(1):path.posix.normalize(path.posix.join(path.posix.dirname(base),target));
const extractQuotes=blocks=>blocks.flatMap(raw=>{const text=String(raw||"").trim(),m=text.match(/[“"]([^”"]{8,})[”"]\s*(?:[—–-]\s*(.+))?$/);if(!m)return[];const attribution=(m[2]||"").trim();return[{text:m[1].trim(),attribution,sourceText:text,needsReview:!attribution}];});

function parseCharts(slideXml,rels){const out=[];for(const m of slideXml.matchAll(/<c:chart\b[^>]*r:id="([^"]+)"/g)){const target=rels[m[1]];if(!target)continue;const entry=resolveTarget("ppt/slides/slide.xml",target),xml=unzip(entry,true);if(!xml)continue;const series=[...xml.matchAll(/<c:ser>([\s\S]*?)<\/c:ser>/g)].map((sm,index)=>{const block=sm[1],name=decode(block.match(/<c:tx>[\s\S]*?<c:v>([\s\S]*?)<\/c:v>/)?.[1]||`Series ${index+1}`),catBlock=block.match(/<c:cat>([\s\S]*?)<\/c:cat>/)?.[1]||"",valBlock=block.match(/<c:val>([\s\S]*?)<\/c:val>/)?.[1]||"",categories=[...catBlock.matchAll(/<c:v>([\s\S]*?)<\/c:v>/g)].map(v=>decode(v[1])),values=[...valBlock.matchAll(/<c:v>([\s\S]*?)<\/c:v>/g)].map(v=>Number(v[1]));return {name,categories,values};});out.push({relationshipId:m[1],entry,type:(xml.match(/<c:(barChart|lineChart|pieChart|doughnutChart|areaChart|scatterChart)/)||[])[1]||"unknown",series,recoverability:"native-xml"});}return out;}

function parseTables(xml){return [...xml.matchAll(/<a:tbl>([\s\S]*?)<\/a:tbl>/g)].map((m,index)=>{const rows=[...m[1].matchAll(/<a:tr\b[^>]*>([\s\S]*?)<\/a:tr>/g)].map(r=>[...r[1].matchAll(/<a:tc\b[^>]*>([\s\S]*?)<\/a:tc>/g)].map(c=>clean(texts(c[1])).join(" ")));return {id:index+1,rows,rowCount:rows.length,columnCount:Math.max(0,...rows.map(r=>r.length)),recoverability:"native-xml"};});}

const slides=[];
for(let index=0;index<slideEntries.length;index++){
  const entry=slideEntries[index],xml=unzip(entry),relsEntry=entry.replace("/slides/","/slides/_rels/")+".rels",relsXml=unzip(relsEntry,true),rels=relMap(relsXml);
  const shapeBlocks=[...xml.matchAll(/<p:sp>([\s\S]*?)<\/p:sp>/g)].map(m=>m[1]);
  const blocks=shapeBlocks.map((block,objectIndex)=>{const ts=clean(texts(block)),placeholderType=block.match(/<p:ph\b[^>]*type="([^"]+)"/)?.[1]||"",name=decode(block.match(/<p:cNvPr\b[^>]*name="([^"]+)"/)?.[1]||"");return {objectIndex:objectIndex+1,name,placeholderType,text:ts.join("\n"),paragraphs:ts};}).filter(x=>x.text&&!placeholder.test(x.text));
  const all=blocks.flatMap(x=>x.paragraphs),pageNumber=String(index+1),withoutPage=all.filter(x=>!( /^\d+$/.test(x)&&Number(x)===index+1));
  const titleBlock=blocks.find(x=>/[c]?trTitle|title/i.test(x.placeholderType))||blocks.find(x=>x.text.length>=3&&x.text.length<=180);
  const title=titleBlock?.text||"",bodyBlocks=[...new Set(withoutPage.filter(x=>x!==title))];
  const bullets=shapeBlocks.flatMap(block=>{const ps=[...block.matchAll(/<a:p>([\s\S]*?)<\/a:p>/g)].map(m=>m[1]);return ps.filter(p=>/<a:(?:buChar|buAutoNum)\b/.test(p)).map(p=>clean(texts(p)).join(" ")).filter(Boolean);});
  const images=[...xml.matchAll(/<a:blip\b[^>]*r:embed="([^"]+)"/g)].map((m,n)=>{const target=rels[m[1]],mediaEntry=target?resolveTarget(entry,target):"";return {id:n+1,relationshipId:m[1],mediaEntry,fileName:path.posix.basename(mediaEntry),altText:"",recoverability:mediaEntry?"native-media":"missing"};});
  const noteRel=Object.entries(rels).find(([,v])=>/notesSlides\//.test(v)),notesXml=noteRel?unzip(resolveTarget(entry,noteRel[1]),true):"",speakerNotes=clean(texts(notesXml)).filter(x=>x!==pageNumber).join("\n");
  const charts=parseCharts(xml,rels),tables=parseTables(xml),joined=[title,...bodyBlocks].join("\n"),sources=bodyBlocks.filter(x=>/(source|来源|资料|出处|https?:\/\/|www\.)/i.test(x)),quotes=extractQuotes(bodyBlocks);
  const metrics=numericTokens(joined).filter(x=>x!==pageNumber).map(value=>({value,sourceText:bodyBlocks.find(t=>t.toLowerCase().includes(value.toLowerCase().replace(/,/g,"")))||"",needsReview:false}));
  slides.push({sourceSlide:index+1,title,bodyBlocks,bullets,metrics,charts,tables,quotes,images,sources,speakerNotes,semanticRole:classify(joined,index,slideEntries.length),density:density(joined,blocks.length+charts.length+tables.length+images.length),pageSize:{widthEmu:Number(xml.match(/<p:sldSz\b[^>]*cx="(\d+)"/)?.[1]||0),heightEmu:Number(xml.match(/<p:sldSz\b[^>]*cy="(\d+)"/)?.[1]||0)},objectInventory:blocks,needsReview:[...images.filter(x=>x.recoverability==="missing").map(x=>`Missing media relationship ${x.relationshipId}`),...quotes.filter(x=>x.needsReview).map(x=>`Verify quote attribution: ${x.text}`)]});
}
const inventory={sourceFile:input,slideCount:slides.length,generatedAt:new Date().toISOString(),parserVersion:"2.0-native-slide-xml",slides};
await writeJson(path.join(work,"content-inventory.json"),inventory);
console.log(`inventory=${path.join(work,"content-inventory.json")} slides=${slides.length} review=${slides.reduce((n,s)=>n+s.needsReview.length,0)}`);
