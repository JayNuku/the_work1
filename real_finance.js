const CATS={"Food":"#e8833a","Transport":"#3a8fe8","Data & Airtime":"#8e5be8","Academics":"#0f9d6b","Hostel & Rent":"#c9a227","Personal Care":"#e85b9a","Fun & Social":"#e8504a","Savings":"#4aa3a3","Other":"#8a8a82"};
let S={wk:0,mo:0,items:[]},view="week",off=0;
try{document.documentElement.dataset.theme=localStorage.getItem("allowance-theme")||"light"}catch(e){}
const $=id=>document.getElementById(id);
try{const r=localStorage.getItem("allowance-v1");if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
function save(){try{localStorage.setItem("allowance-v1",JSON.stringify(S))}catch(e){}}
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const money=n=>"GH₵ "+Number(n).toLocaleString("en-GH",{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s).replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
function range(){
  const t=new Date();t.setHours(12,0,0,0);
  if(view==="week"){const m=new Date(t);m.setDate(t.getDate()-((t.getDay()+6)%7)+off*7);const e=new Date(m);e.setDate(m.getDate()+6);return[m,e]}
  const s=new Date(t.getFullYear(),t.getMonth()+off,1,12),e=new Date(t.getFullYear(),t.getMonth()+off+1,0,12);return[s,e];
}
function render(){
  const[s,e]=range(),a=ymd(s),b=ymd(e);
  const fm=d=>d.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  $("lbl").textContent=view==="week"?fm(s)+" – "+fm(e):s.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
  $("vw").classList.toggle("on",view==="week");$("vm").classList.toggle("on",view==="month");
  const its=S.items.filter(i=>i.date>=a&&i.date<=b).sort((x,y)=>y.date.localeCompare(x.date)||y.id-x.id);
  const spent=its.reduce((n,i)=>n+i.amt,0),bud=view==="week"?S.wk:S.mo,left=bud-spent;
  $("sb").textContent=bud?money(bud):"Set above";$("ss").textContent=money(spent);
  $("sl").textContent=bud?money(left):"–";$("sl").className="big"+(bud&&left<0?" bad":"");
  const pct=bud?Math.min(100,spent/bud*100):0;$("pb").style.width=pct+"%";$("pb").style.background=pct>=100?"var(--bad)":"var(--ac)";
  const today=new Date();today.setHours(12,0,0,0);
  let h="";
  if(bud){const days=Math.round((e-s)/864e5)+1;
    if(today>=s&&today<=e){const rem=Math.max(1,Math.round((e-today)/864e5)+1);h=left>0?"You can spend about "+money(left/rem)+" per day for the remaining "+rem+" day"+(rem>1?"s":"")+".":"You’re over budget by "+money(-left)+".";}
    else h=left>=0?"Finished with "+money(left)+" to spare.":"Went over by "+money(-left)+".";}
  else h="Enter your "+view+"ly allowance above to see how much is left.";
  $("hint").textContent=h;

  const tot={};its.forEach(i=>tot[i.cat]=(tot[i.cat]||0)+i.amt);
  const ents=Object.entries(tot).sort((x,y)=>y[1]-x[1]);
  if(!ents.length){$("dn").style.background="var(--track)";$("lg").innerHTML='<span class="mut">No spending in this period yet.</span>'}
  else{let c=0,g=[];ents.forEach(([k,v])=>{const p=v/spent*100;g.push(CATS[k]+" "+c+"% "+(c+p)+"%");c+=p});
    $("dn").style.background="conic-gradient("+g.join(",")+")";
    $("lg").innerHTML=ents.map(([k,v])=>'<div><b style="background:'+CATS[k]+'"></b><span>'+esc(k)+'</span><span>'+money(v)+' · '+Math.round(v/spent*100)+'%</span></div>').join("")}

  const n=Math.round((e-s)/864e5)+1,arr=[];
  for(let k=0;k<n;k++){const d=new Date(s);d.setDate(s.getDate()+k);const key=ymd(d);arr.push({d,v:its.filter(i=>i.date===key).reduce((q,i)=>q+i.amt,0)})}
  const mx=Math.max(1,...arr.map(x=>x.v));
  $("dy").innerHTML=arr.map(x=>'<div title="'+esc(fm(x.d)+": "+money(x.v))+'"><i style="height:'+(x.v/mx*85)+'%"></i><small>'+(n>10?(x.d.getDate()%5===1?x.d.getDate():"&nbsp;"):x.d.toLocaleDateString("en-GB",{weekday:"narrow"}))+'</small></div>').join("");

  $("ls").innerHTML=its.length?its.map(i=>'<div class="item"><span class="dot" style="background:'+CATS[i.cat]+'"></span><div><div>'+esc(i.note||i.cat)+'</div><div class="mut">'+esc(i.cat)+' · '+esc(new Date(i.date+"T12:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"}))+'</div></div><span class="amt">'+money(i.amt)+'</span><button class="x" data-id="'+i.id+'" aria-label="Delete">×</button></div>').join(""):'<span class="mut">Nothing logged for this period.</span>';
}
$("theme").textContent=document.documentElement.dataset.theme==="dark"?"🌙":"☀️";
$("theme").onclick=()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;$("theme").textContent=next==="dark"?"🌙":"☀️";try{localStorage.setItem("allowance-theme",next)}catch(e){}};
$("ct").innerHTML=Object.keys(CATS).map(k=>"<option>"+esc(k)+"</option>").join("");
$("dt").value=ymd(new Date());
$("wk").value=S.wk||"";$("mo").value=S.mo||"";
$("wk").oninput=()=>{S.wk=parseFloat($("wk").value)||0;save();render()};
$("mo").oninput=()=>{S.mo=parseFloat($("mo").value)||0;save();render()};
$("vw").onclick=()=>{view="week";off=0;render()};
$("vm").onclick=()=>{view="month";off=0;render()};
$("pv").onclick=()=>{off--;render()};
$("nx").onclick=()=>{off++;render()};
$("add").onclick=()=>{
  const amt=parseFloat($("am").value);
  if(!(amt>0)){$("am").focus();return}
  S.items.push({id:Date.now(),amt,cat:$("ct").value,date:$("dt").value||ymd(new Date()),note:$("nt").value.trim()});
  $("am").value="";$("nt").value="";save();render();
};
$("ls").onclick=e=>{
  const id=e.target.dataset&&e.target.dataset.id;
  if(id){S.items=S.items.filter(i=>String(i.id)!==id);save();render()}
};
$("csv").onclick=()=>{
  const rows=[
    ["Date","Amount (GH₵)","Category","Note"],
    ...S.items.slice().sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id)
      .map(i=>[i.date,Number(i.amt).toFixed(2),i.cat,i.note||""])
  ];
  const csv=rows.map(row=>row.map(v=>"\""+String(v).replace(/\"/g,'""')+"\"").join(",")).join("\r\n");
  const blob=new Blob(["\uFEFF",csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;
  a.download="allowance-expenses-"+ymd(new Date())+".csv";
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
};
render();
