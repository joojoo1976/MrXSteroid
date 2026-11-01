'use client';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TOOL_CATEGORIES_V7, TOOLS_REGISTRY_V7_252 } from '@/registry/tools.registry.v7.252';

export default function SmartToolsIndex(){
  const router=useRouter();
  const timeoutRef=useRef<NodeJS.Timeout|null>(null);
  const handleCategoryClick=(e:React.MouseEvent,slug:string)=>{
    e.preventDefault();
    if(timeoutRef.current){ clearTimeout(timeoutRef.current); timeoutRef.current=null; router.push(`/categories/${slug}`); }
    else { timeoutRef.current=setTimeout(()=>{ document.getElementById(`category-${slug}`)?.scrollIntoView({behavior:'smooth'}); window.history.pushState(null,'','#category-'+slug); timeoutRef.current=null; },300); }
  };
  return (<div><header>MrX 252 Tools - SmartTools Index</header><nav className="sticky top-0 flex gap-2 p-4 overflow-x-auto bg-white">{TOOL_CATEGORIES_V7.map(cat=>(<a key={cat.id} href={`#category-${cat.id}`} onClick={e=>handleCategoryClick(e,cat.id)} className="px-4 py-2 bg-gray-100 rounded-full">{cat.icon} {cat.nameAr} ({cat.count})</a>))}</nav><main>{TOOL_CATEGORIES_V7.map(cat=>{const tools=TOOLS_REGISTRY_V7_252.filter(t=>t.category===cat.id); return(<section key={cat.id} id={`category-${cat.id}`} className="py-12"><h2>{cat.icon} {cat.nameAr} | {cat.nameEn} ({tools.length})</h2><div className="grid grid-cols-4 gap-4">{tools.map(tool=>(<a key={tool.id} href={tool.navigation.toolPage} className="border p-4 rounded-xl">{tool.nameAr}</a>))}</div></section>);})}</main></div>);
}
