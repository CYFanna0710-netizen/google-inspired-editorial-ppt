import fs from "node:fs/promises";
import path from "node:path";

export async function readJson(p){return JSON.parse(await fs.readFile(p,"utf8"));}
export async function writeJson(p,v){await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p,JSON.stringify(v,null,2));}
export function args(argv=process.argv.slice(2)){const o={};for(let i=0;i<argv.length;i++){if(argv[i].startsWith("--")){const k=argv[i].slice(2);o[k]=argv[i+1]?.startsWith("--")?true:argv[++i]??true;}}return o;}
export function need(o,n){if(!o[n])throw new Error(`Missing --${n}`);return o[n];}
export function numericTokens(value){const normalized=String(value??"").replace(/(?<=\d)\s*[-–—]\s*(?=\d)/g," to "),number="[+-]?(?:[$¥€£]\\s*)?\\d+(?:,\\d{3})*(?:\\.\\d+)?";return (normalized.match(new RegExp(`${number}(?:\\s*(?:%|x|倍|万|亿|k|m|b|年|元|美元|lx|秒|人|页|处|类|张|项|个))(?![a-z])|${number}`,"gi"))||[]).map(x=>x.replace(/\s+/g,"").replace(/[.,]+$/g,"").toLowerCase());}
export function classify(text,index,total){const t=text.toLowerCase();if(index===0)return "cover";if(index===total-1&&/(thank|contact|next|谢谢|联系|行动)/i.test(t))return "closing";if(/chapter|section|第[一二三四五六七八九十0-9]+章/.test(t)&&text.length<120)return "chapter_divider";if(/[“”"].{20,}[“”"]/.test(text)||/(said|表示|认为|指出)/i.test(text))return "quote";if(/risk|challenge|风险|挑战/.test(t))return "risk";if(/case|objective|action|result|案例|成果/.test(t))return "case_study";if(/checklist|next steps|清单|下一步/.test(t))return "checklist";if(/method|sample|survey|方法|样本|范围/.test(t))return "explanation";const nums=numericTokens(text).length;if(nums>=5)return "data_overview";if(nums===1&&text.length<180)return "single_kpi";return "explanation";}
export function density(text,objects=0){const n=String(text).length+objects*30;return n>700?"high":n>260?"medium":"low";}
export async function collectFiles(root){const out=[];for(const e of await fs.readdir(root,{withFileTypes:true})){const p=path.join(root,e.name);if(e.isDirectory())out.push(...await collectFiles(p));else out.push(p);}return out;}
