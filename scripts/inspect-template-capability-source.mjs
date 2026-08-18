import fs from "node:fs/promises";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {args,need,writeJson} from "./lib/common.mjs";

const a=args(),pptx=path.resolve(need(a,"pptx")),layouts=path.resolve(need(a,"layouts")),out=path.resolve(need(a,"out"));
const unzip=(entry,optional=false)=>{const r=spawnSync("unzip",["-p",pptx,entry],{encoding:"utf8",maxBuffer:80_000_000});if(r.status!==0){if(optional)return"";throw new Error(r.stderr||`Unable to read ${entry}`);}return r.stdout;};
const list=spawnSync("unzip",["-Z1",pptx],{encoding:"utf8",maxBuffer:20_000_000});if(list.status!==0)throw new Error(list.stderr||"Unreadable PPTX.");
const entries=list.stdout.split(/\r?\n/).filter(Boolean),slides=entries.filter(x=>/^ppt\/slides\/slide\d+\.xml$/.test(x)).sort((x,y)=>Number(x.match(/\d+/)[0])-Number(y.match(/\d+/)[0]));
const boxOutside=([x,y,w,h],[fw,fh])=>x<0||y<0||x+w>fw||y+h>fh;
const intersect=(a,b)=>{const x=Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0])),y=Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]));return x*y;};
const fonts=new Set(),colors=new Set(),slideAudits=[];

for(let index=0;index<slides.length;index++){
  const n=index+1,entry=slides[index],xml=unzip(entry),layout=JSON.parse(await fs.readFile(path.join(layouts,`source-slide-${String(n).padStart(2,"0")}.layout.json`),"utf8")),frame=[layout.slide.frame.width,layout.slide.frame.height],elements=layout.elements||[],textElements=elements.filter(x=>typeof x.text==="string"&&x.text.trim()),nativeShapes=elements.filter(x=>x.kind==="shape"),images=elements.filter(x=>x.kind==="image"),fontSizes=[],localFonts=new Set(),localColors=new Set();
  for(const element of elements){
    if(element.fillColor)localColors.add(element.fillColor);
    for(const paragraph of element.paragraphs||[]){
      if(paragraph.resolvedTextStyle?.fontSize)fontSizes.push(paragraph.resolvedTextStyle.fontSize);
      if(paragraph.resolvedTextStyle?.color)localColors.add(paragraph.resolvedTextStyle.color);
      for(const run of paragraph.runs||[]){if(run.fontSize)fontSizes.push(run.fontSize);if(run.typeface)localFonts.add(run.typeface);if(run.color)localColors.add(run.color);}
    }
    const typeface=element.resolvedTextStyle?.typeface;if(typeface&&!typeface.startsWith("+"))localFonts.add(typeface);
  }
  for(const font of localFonts)fonts.add(font);for(const color of localColors)colors.add(color);
  const outOfBounds=elements.filter(x=>boxOutside(x.bbox,frame)).map(x=>({id:x.id,aid:x.aid,kind:x.kind,name:x.name||"",bbox:x.bbox,intent:x.kind==="image"||x.name==="diffuse-color-field"?"likely_intentional_edge_crop":"review"}));
  const textOverlaps=[];for(let i=0;i<textElements.length;i++)for(let j=i+1;j<textElements.length;j++){const area=intersect(textElements[i].bbox,textElements[j].bbox);if(area>1)textOverlaps.push({a:textElements[i].id,b:textElements[j].id,area:Math.round(area*100)/100});}
  const placeholderBlocks=[...xml.matchAll(/<p:sp>([\s\S]*?)<\/p:sp>/g)].map(m=>m[1]).filter(block=>/<p:ph\b/.test(block)),emptyPlaceholders=placeholderBlocks.filter(block=>![...block.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].some(m=>m[1].trim()));
  const xmlFonts=[...xml.matchAll(/typeface="([^"]+)"/g)].map(m=>m[1]).filter(x=>x&&!x.startsWith("+"));for(const f of xmlFonts){fonts.add(f);localFonts.add(f);}
  const inherited=(layout.inheritedLayers||[]).map(layer=>({scope:layer.scope,id:layer.id,name:layer.name,type:layer.type,element_count:(layer.elements||[]).length}));
  slideAudits.push({
    template_id:`T${String(n).padStart(2,"0")}`,
    source_slide:n,
    slide_size_px:{width:frame[0],height:frame[1]},
    inheritance:{layout_id:layout.slide.layoutId,layout_name:layout.slide.layoutName,layout_type:layout.slide.layoutType,master_id:layout.slide.masterLayoutId,master_name:layout.slide.masterLayoutName,inherited_layers:inherited,inherited_element_count:inherited.reduce((sum,x)=>sum+x.element_count,0)},
    objects:{total:elements.length,native_shapes:nativeShapes.length,native_text_shapes:textElements.length,native_non_text_shapes:nativeShapes.filter(x=>!x.text?.trim()).length,images:images.length,groups:(xml.match(/<p:grpSp>/g)||[]).length,connectors:(xml.match(/<p:cxnSp>/g)||[]).length,charts:(xml.match(/<c:chart\b/g)||[]).length,tables:(xml.match(/<a:tbl>/g)||[]).length,gradient_fills:(xml.match(/<a:gradFill\b/g)||[]).length,rounded_rectangles:nativeShapes.filter(x=>x.geometry==="roundRect").length},
    editability:{native_text:true,native_shapes:true,images:images.map(x=>({id:x.id,asset_id:x.asset?.assetId||x.fillImage?.assetId||"unknown",content_type:x.contentType||x.asset?.contentType||"unknown",editable_as_image_object:true,internal_pixels_or_paths_editable:false})),chart_data_editable:(xml.match(/<c:chart\b/g)||[]).length>0,table_cells_editable:(xml.match(/<a:tbl>/g)||[]).length>0},
    typography:{fonts:[...localFonts].sort(),minimum_font_size:fontSizes.length?Math.min(...fontSizes):null,maximum_font_size:fontSizes.length?Math.max(...fontSizes):null,font_sizes:[...new Set(fontSizes)].sort((x,y)=>x-y)},
    colors:[...localColors].sort(),
    page_number_objects:elements.filter(x=>x.name==="page-number").map(x=>({id:x.id,bbox:x.bbox,text:x.text})),
    placeholders:{count:placeholderBlocks.length,empty:emptyPlaceholders.length},
    geometry_qa:{out_of_bounds:outOfBounds,text_overlaps:textOverlaps},
    element_inventory:elements.map(x=>({id:x.id,aid:x.aid,kind:x.kind,name:x.name||"",bbox:x.bbox,geometry:x.geometry||null,text:x.text||"",fill_color:x.fillColor||null,asset_id:x.asset?.assetId||x.fillImage?.assetId||null}))
  });
}

const masterEntries=entries.filter(x=>/^ppt\/slideMasters\/slideMaster\d+\.xml$/.test(x)),layoutEntries=entries.filter(x=>/^ppt\/slideLayouts\/slideLayout\d+\.xml$/.test(x)),embeddedFonts=entries.filter(x=>/^ppt\/fonts\//.test(x));
const packageAudit={
  source_pptx:pptx,
  sha256:spawnSync("shasum",["-a","256",pptx],{encoding:"utf8"}).stdout.trim().split(/\s+/)[0],
  slide_count:slides.length,
  slide_masters:masterEntries.map(entry=>({entry,shape_count:(unzip(entry).match(/<p:sp>/g)||[]).length,placeholder_count:(unzip(entry).match(/<p:ph\b/g)||[]).length})),
  slide_layouts:layoutEntries.map(entry=>({entry,shape_count:(unzip(entry).match(/<p:sp>/g)||[]).length,placeholder_count:(unzip(entry).match(/<p:ph\b/g)||[]).length})),
  embedded_fonts:embeddedFonts,
  declared_fonts:[...fonts].sort(),
  observed_colors:[...colors].sort(),
  media_entries:entries.filter(x=>/^ppt\/media\//.test(x)),
  charts:entries.filter(x=>/^ppt\/charts\/chart\d+\.xml$/.test(x)),
  all_slide_objects_are_local:slideAudits.every(x=>x.inheritance.inherited_element_count===0),
  total_empty_placeholders:slideAudits.reduce((sum,x)=>sum+x.placeholders.empty,0),
  total_text_overlaps:slideAudits.reduce((sum,x)=>sum+x.geometry_qa.text_overlaps.length,0),
  out_of_bounds_objects:slideAudits.flatMap(x=>x.geometry_qa.out_of_bounds.map(o=>({slide:x.source_slide,...o})))
};
await writeJson(out,{auditVersion:"template-source-1.0",package:packageAudit,slides:slideAudits});
console.log(`templateAudit=${out} slides=${slideAudits.length} masters=${masterEntries.length} layouts=${layoutEntries.length} emptyPlaceholders=${packageAudit.total_empty_placeholders} textOverlaps=${packageAudit.total_text_overlaps} outOfBounds=${packageAudit.out_of_bounds_objects.length}`);
