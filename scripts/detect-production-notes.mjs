import path from "node:path";
import {args,need,readJson,writeJson} from "./lib/common.mjs";

const a=args();
const inventory=await readJson(path.resolve(need(a,"inventory")));
const out=path.resolve(need(a,"out"));

const highPatterns=[
  [/\b(?:todo|tbd|fixme)\b/i,"explicit TODO marker"],
  [/(?:这里|此处|这一页).{0,12}(?:放|插入|替换|补|加).{0,18}(?:图|图片|截图|视频|录屏|案例|内容)/i,"placement instruction"],
  [/(?:放|插入|替换|补|加).{0,12}(?:截图|录屏|图片占位|视频占位)/i,"asset instruction"],
  [/(?:待补|待定|待确认|待替换|占位|placeholder)/i,"unresolved placeholder"],
  [/(?:(?:这里|此处|这一页|这页|这个位置|请|需要|待).{0,12}|(?:重新|重做|替换成).{0,8})(?:生成|重做|重新生成).{0,18}(?:图片|图像|效果图|案例|视频)/i,"generation instruction"],
  [/(?:(?:我觉得|我们觉得).{0,30}(?:这里|这页|放|换|重复|不确定|截图|录屏|怎么表达)|没想好要怎么表达|这里.{0,10}不确定|这个.{0,10}没想好|建议截图|对话截图|聊天录屏)/i,"editor discussion"],
];
const mediumPatterns=[
  [/(?:图片|截图|视频|案例).{0,16}(?:需要|建议|可以).{0,12}(?:换|补|重做|调整)/i,"possible production request"],
  [/(?:这一页|这里|这个位置|版式).{0,24}(?:觉得|建议|考虑)/i,"possible editor comment"],
  [/(?:image prompt|insert image|replace image|screenshot here)/i,"English production instruction"],
];

const norm=s=>String(s||"").replace(/\s+/g," ").trim();
const seen=new Set(),items=[];
for(const slide of inventory.slides||[]){
  const candidates=[
    ["title",slide.title],
    ...(slide.bodyBlocks||[]).map(x=>["body",x]),
    ["speakerNotes",slide.speakerNotes],
    ...(slide.objectInventory||[]).map(x=>["object",x.text]),
  ];
  for(const [location,raw] of candidates){
    const text=norm(raw); if(!text)continue;
    const key=`${slide.sourceSlide}|${text}`; if(seen.has(key))continue;
    let hit=highPatterns.find(([re])=>re.test(text)),confidence="high";
    if(!hit){hit=mediumPatterns.find(([re])=>re.test(text));confidence="medium";}
    if(!hit)continue;
    seen.add(key);
    items.push({slide:slide.sourceSlide,location,text,confidence,reason:hit[1],action:"review_then_hide_or_replace"});
  }
}

const report={
  category:"production_notes",
  status:items.some(x=>x.confidence==="high")?"review":"pass",
  sourceFile:inventory.sourceFile,
  candidateCount:items.length,
  items,
};
await writeJson(out,report);
console.log(JSON.stringify({status:report.status,candidates:items.length,out}));
