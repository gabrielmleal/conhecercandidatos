(function(){
const D=window.DADOS;
const root=document.getElementById('px');
const q=s=>root.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TEMAS={},SUBS={},CURTO={},GOV={};
Object.entries(D.temas).forEach(([k,v])=>{TEMAS[k]=v.nome;CURTO[k]=v.curto;GOV[k]=v.governo;SUBS[k]=v.subtemas;});
const MAND={l1:['Lula 1','2003–2006'],l2:['Lula 2','2007–2010'],l3:['Lula 3','2023–2026'],b:['Bolsonaro','2019–2022']};
const MS={L:['l1','l2','l3'],F:['b']};
const WHO={F:'Flávio',L:'Lula',BR:'Brasil'};
const TIPO={pos:['Positivo','var(--dot-pos)','✓'],neg:['Problema','var(--dot-neg)','!'],pol:['Polêmico','var(--dot-mid)','≈'],ctx:['Contexto','var(--dot-info)','i'],pro:['Promessa','var(--dot-neu)','→']};
const TERMS=D.termos;
function mandOf(c,d,t){if(!t||c==='BR'||!GOV[t])return null;const y=+d.slice(0,4);if(c==='L')return y<=2006?'l1':y<=2010?'l2':y>=2023?'l3':null;return y>=2019&&y<=2022?'b':null;}
const F=D.fatos.map(f=>({...f,m:mandOf(f.c,f.d,f.t)})).sort((a,b)=>a.d.localeCompare(b.d));
const st={c:'all',t:'',v:'mapa',sort:'tema',mk:true,diff:false,dq:'',lista:false};
let stack=[],quem=null,onEv=null;
const sgn=v=>(v>0?'+':v<0?'−':'')+Math.abs(v).toFixed(1).replace('.',',');
function band(v){const r=Math.round(v*10)/10;if(r<=-2.5)return['Muito negativo','n',52];if(r<=-0.5)return['Negativo','n',24];if(r<0.5)return['Equilibrado','z',18];if(r<2.5)return['Positivo','p',24];return['Muito positivo','p',52];}
function bandCol(v,n){if(!n)return 'color-mix(in oklab,var(--m-neu) 6%,var(--m-s1))';const b=band(v),c=b[1]==='n'?'var(--m-neg)':b[1]==='p'?'var(--m-pos)':'var(--m-neu)';return `color-mix(in oklab,${c} ${b[2]}%,var(--m-s1))`;}
function score(c,t,s){
  const fs=F.filter(f=>f.c===c&&f.t===t&&(!s||f.s===s)&&f.w!==0);
  if(!GOV[t]){const tot=fs.reduce((a,f)=>a+f.w,0);return {avg:tot,n:fs.length,tot:0,per:{},ms:[],gov:false};}
  const fsm=fs.filter(f=>f.m);const per={};fsm.forEach(f=>{per[f.m]=(per[f.m]||0)+f.w;});
  const ms=MS[c];const got=ms.filter(m=>m in per);const avg=got.length?got.reduce((a,m)=>a+per[m],0)/got.length:0;
  return {avg,n:got.length,tot:ms.length,per,ms,gov:true};
}
function rich(s){return esc(s).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,k,d)=>{const key=k.toLowerCase();return TERMS[key]?`<button class="pxterm" data-term="${esc(key)}">${d||k}</button>`:(d||k);});}
function plain(s){return String(s).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,k,d)=>d||k);}
function ev(name,det){if(onEv)onEv(name,det);}
function say(t){q('#pxSR').textContent=t;}
function cands(){return st.c==='all'?['F','L']:[st.c];}
function mes(d){const M=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];return (d.length>7?+d.slice(8,10)+'/':'')+M[+d.slice(5,7)-1]+'/'+d.slice(0,4);}
function quando(iso){const d=new Date(iso);return d.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}).replace(/\./g,'');}
function norm(s){return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
function notaTxt(sc){return sc.n?sgn(sc.avg):'sem fatos';}

function vMapa(){
  const cs=cands();const ts=Object.keys(TEMAS);
  const tools=`<div class="pxtools"><button data-lista="0" aria-pressed="${!st.lista}">Ver em gráfico</button><button data-lista="1" aria-pressed="${st.lista}">Ver em lista</button></div>`;
  if(st.lista)return tools+cs.map(c=>`<h2 class="pxh">${WHO[c]}</h2>`+ts.map(t=>{const sc=score(c,t);return `<button class="pxrow" data-open="tema:${c}:${t}"><span><b>${TEMAS[t]}</b><small>${sc.n?band(sc.avg)[0]+(sc.gov?`, ${sc.n} de ${sc.tot} mandato${sc.tot>1?'s':''} com fatos`:''):'Sem fatos'}</small></span><span>${notaTxt(sc)}</span></button>`;}).join('')).join('');
  const N=ts.length,cx=180,cy=170,R=122;
  const pos=ts.map((t,i)=>{const a=-Math.PI/2+i*2*Math.PI/N;return [cx+R*Math.cos(a),cy+R*Math.sin(a),a];});
  const svg=c=>`<svg viewBox="-56 0 472 345" role="group" aria-label="Mapa de ${WHO[c]}: ${N} temas">${pos.map(p=>`<line x1="${cx}" y1="${cy}" x2="${p[0].toFixed(1)}" y2="${p[1].toFixed(1)}" stroke="var(--m-line2)"/>`).join('')}<circle cx="${cx}" cy="${cy}" r="24" fill="var(--m-ink)"/><text x="${cx}" y="${cy+6}" text-anchor="middle" fill="var(--m-bg)" font-weight="700" font-size="17">${c}</text>${ts.map((t,i)=>{const sc=score(c,t);const on=st.t===t;const [x,y,a]=pos[i];const lx=x+Math.cos(a)*28,ly=y+Math.sin(a)*28+5;const anc=Math.abs(Math.cos(a))<.3?'middle':Math.cos(a)>0?'start':'end';return `<g class="pxn" tabindex="0" role="button" data-open="tema:${c}:${t}" aria-label="${TEMAS[t]}: ${sc.n?band(sc.avg)[0]+', '+sgn(sc.avg):'sem fatos'}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${on?19:16}" fill="${bandCol(sc.avg,sc.n)}" stroke="${on?'var(--m-ink)':'var(--m-line2)'}" stroke-width="${on?3:1.5}" ${sc.n?'':'stroke-dasharray="3 3"'}/><text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anc}" font-size="15" font-weight="700" fill="var(--m-ink)">${esc(CURTO[t])}</text></g>`;}).join('')}</svg>`;
  return tools+`<p class="pxh">${st.c==='all'?'Os dois mapas. Toque num tema.':'Toque num tema para ver o resumo.'}</p><div class="pxconst ${cs.length>1?'two':''}">${cs.map(c=>`<div>${svg(c)}<p>${WHO[c]}</p></div>`).join('')}</div><p class="pxh" style="margin-top:10px">A cor mostra a faixa da nota. Tracejado: sem fatos.</p>`;
}
function vCmp(){
  let ts=Object.keys(TEMAS);if(st.t)ts=[st.t];
  const rows=ts.map(t=>{const f=score('F',t),l=score('L',t);return {t,f,l,gap:f.n&&l.n?Math.abs(f.avg-l.avg):-1};});
  if(st.sort==='gap')rows.sort((a,b)=>b.gap-a.gap);
  const x=v=>((Math.max(-6,Math.min(6,v))+6)/12*100).toFixed(1)+'%';
  const tools=`<div class="pxtools"><button data-sort="tema" aria-pressed="${st.sort==='tema'}">Por tema</button><button data-sort="gap" aria-pressed="${st.sort==='gap'}">Maior diferença</button><button data-lista="${st.lista?0:1}" aria-pressed="${st.lista}">Ver em tabela</button></div>`;
  if(st.lista)return tools+`<table class="pxtable"><caption class="pxh">Nota de cada tema</caption><tr><th scope="col">Tema</th><th scope="col">Flávio</th><th scope="col">Lula</th></tr>${rows.map(r=>`<tr><th scope="row"><button class="pxterm" data-open="cmp:${r.t}">${TEMAS[r.t]}</button></th><td>${notaTxt(r.f)}</td><td>${notaTxt(r.l)}</td></tr>`).join('')}</table>`;
  return tools+`<div class="pxcmp" aria-hidden="true"><span>● Flávio</span><span style="text-align:right">○ Lula</span></div>`+rows.map(r=>`<button class="pxcrow" id="cmp-${r.t}" data-open="cmp:${r.t}" aria-label="${TEMAS[r.t]}: Flávio ${notaTxt(r.f)}, Lula ${notaTxt(r.l)}"><b>${TEMAS[r.t]}</b><span class="pxtrack" aria-hidden="true"><i class="F${r.f.n?'':' nf'}" style="--x:${x(r.f.avg)}">F</i><i class="L${r.l.n?'':' nf'}" style="--x:${x(r.l.avg)}">L</i></span><small><span>Flávio ${notaTxt(r.f)}</span><span>Lula ${notaTxt(r.l)}</span></small></button>`).join('')+(st.t?`<p class="pxh">Mostrando só ${TEMAS[st.t]}. Mude o tema no topo para ver todos.</p>`:'');
}
const PER=[['2003–2010: Lula 1 e 2, contam para Lula',2003,2010,0],['2011–2018: Dilma e Temer, não entram na nota',2011,2018,1],['2019–2022: Bolsonaro, conta para Flávio',2019,2022,0],['2023–2026: Lula 3, conta para Lula',2023,2026,0]];
function vTempo(){
  const cs=cands();
  const it=F.filter(f=>(f.c==='BR'||cs.includes(f.c))&&(!st.t||f.t===st.t)&&(!st.mk||f.mk>0));
  let h=`<div class="pxtools"><button data-mk="1" aria-pressed="${st.mk}">Só marcos</button><button data-mk="0" aria-pressed="${!st.mk}">Tudo</button></div><div class="pxchips" aria-label="Pular para o ano">${[2003,2011,2019,2023].map(y=>`<button data-year="${y}">${y}</button>`).join('')}</div>`;
  PER.forEach((p,i)=>{const its=it.filter(f=>{const y=+f.d.slice(0,4);return y>=p[1]&&y<=p[2];});h+=`<div class="pxgrp"><h2 class="pxper${p[3]?' out':''}" id="per-${i}">${p[0]}</h2><ul class="pxtl">${its.length?its.map(f=>`<li class="mk${f.mk}"><button class="pxrow" id="tl-${f.id}" data-open="fato:${f.id}"><span><small>${mes(f.d)}</small>${esc(f.tit)}</span><span class="pxwho ${f.c}">${f.c==='BR'?'Brasil':f.c}</span></button></li>`).join(''):`<li><p class="pxh" style="padding:8px 0">Nada neste período com os filtros atuais.</p></li>`}</ul></div>`;});
  return h;
}
function achados(){
  const qn=norm(st.dq);
  const ks=Object.keys(TERMS).sort((a,b)=>TERMS[a][0].localeCompare(TERMS[b][0],'pt')).filter(k=>!qn||norm(TERMS[k][0]).includes(qn)||norm(TERMS[k][1]).includes(qn));
  const fs=qn.length>2?F.filter(f=>norm(f.tit+' '+plain(f.txt)).includes(qn)).slice(0,20):[];
  return (ks.length?ks.map(k=>`<button class="pxrow" data-term="${esc(k)}"><span><b>${esc(TERMS[k][0])}</b><small>${esc(plain(TERMS[k][1]))}</small></span></button>`).join(''):'<p class="pxh">Nenhuma palavra encontrada.</p>')+(fs.length?`<h2 class="pxh">Fatos com "${esc(st.dq)}"</h2>`+fs.map(factRow).join(''):'');
}
function vDic(){
  const top=['inflação','cpi','dívida pública'].filter(k=>TERMS[k]);
  return `<input class="pxsearch" id="pxDq" type="search" placeholder="Buscar palavra ou fato (aceita sem acento)" value="${esc(st.dq)}" aria-label="Buscar no dicionário e nos fatos"><p class="pxh">Mais procuradas</p><div class="pxchips">${top.map(k=>`<button data-term="${esc(k)}">${esc(TERMS[k][0])}</button>`).join('')}</div><div id="pxDl" aria-live="polite">${achados()}</div>`;
}
function render(){
  const b=q('#pxBody');b.innerHTML=st.v==='mapa'?vMapa():st.v==='cmp'?vCmp():st.v==='tempo'?vTempo():vDic();b.scrollTop=0;
  root.querySelectorAll('.pxnav button').forEach(x=>x.setAttribute('aria-current',x.dataset.v===st.v?'true':'false'));
  root.querySelectorAll('.pxseg button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.c===st.c?'true':'false'));
  q('#pxTema').value=st.t;
  const di=q('#pxDq');if(di)di.addEventListener('input',e=>{st.dq=e.target.value;q('#pxDl').innerHTML=achados();});
}

function trail(o){const c=o.c?WHO[o.c]:'';if(o.k==='tema')return `${c} › ${TEMAS[o.t]}`;if(o.k==='sub')return `${c} › ${TEMAS[o.t]} › ${SUBS[o.t][o.s]}`;if(o.k==='fato'){const f=F.find(x=>x.id===o.id);return f.c==='BR'?'Linha do tempo › Brasil':`${WHO[f.c]} › ${f.t?TEMAS[f.t]:'Fato'} › Fato`;}if(o.k==='term')return `Dicionário › ${TERMS[o.key][0]}`;if(o.k==='ajuda')return 'Como usar o site';if(o.k==='acesso')return 'Acessibilidade';if(o.k==='cmp')return `Comparar › ${TEMAS[o.t]}`;return '';}
function go3(t,c,fid){const other=c==='F'?'Lula':'Flávio';return `<div class="pxgo"><span>Levar para</span><button data-go3="tempo:${t||''}:${c||'all'}:${fid||''}">Ver no tempo</button>${t?`<button data-go3="cmp:${t}:all:">Comparar${c?' com '+other:''}</button>`:''}${t&&c?`<button data-go3="mapa:${t}:${c}:">Ver no mapa</button>`:''}</div>`;}
function factRow(f){const tp=TIPO[f.tipo];return `<button class="pxrow" data-open="fato:${f.id}"><span class="pxdot" style="background:${tp[1]}" aria-hidden="true">${tp[2]}</span><span style="flex:1"><b>${esc(f.tit)}</b><small>${tp[0]}, ${mes(f.d)}${f.c==='BR'?'':f.w?', '+(f.w>0?'+':'−')+Math.abs(f.w)+' na nota':', vale zero'}</small></span></button>`;}
function mands(sc,c){return sc.gov?`<div class="pxmands">${sc.ms.map(m=>{const has=m in sc.per;const v=has?sc.per[m]:0;return `<div><span>${MAND[m][0]}</span><span class="pxbar${has?'':' nf'}" aria-hidden="true"><i style="--x:${((Math.max(-6,Math.min(6,v))+6)/12*100).toFixed(1)}%"></i></span><span>${has?sgn(v):'sem fatos'}</span></div>`;}).join('')}</div>`:'';}
function erro(f){return `mailto:contato@conhecercandidatos.com.br?subject=${encodeURIComponent('Apontar erro: '+f.id)}&body=${encodeURIComponent('Fato: '+f.tit+'\nO que está errado:\n')}`;}
function sheetHTML(o){
  if(o.k==='tema'||o.k==='sub'){const sc=score(o.c,o.t,o.s);const fs=F.filter(f=>f.c===o.c&&f.t===o.t&&(!o.s||f.s===o.s));const b=sc.n?band(sc.avg):['Sem fatos'];
    const pos=fs.filter(f=>f.w>0).length,neg=fs.filter(f=>f.w<0).length,zero=fs.filter(f=>!f.w).length;
    const nome=o.s?SUBS[o.t][o.s]:TEMAS[o.t];
    return `<h2 tabindex="-1">${esc(nome)}</h2><div class="pxbig"><b>${sc.n?sgn(sc.avg):'—'}</b><span>${b[0]}</span></div>${sc.gov?`<span class="pxtag">${sc.n} de ${sc.tot} mandato${sc.tot>1?'s':''} com fatos</span>`:'<span class="pxtag">Soma dos fatos</span>'}<p>${fs.length?`${WHO[o.c]} tem ${fs.length} fato${fs.length>1?'s':''} aqui: ${pos} positivo${pos!==1?'s':''}, ${neg} problema${neg!==1?'s':''}${zero?` e ${zero} que vale${zero>1?'m':''} zero`:''}.`:'Ainda não há fatos aqui. O robô dá prioridade a essa lacuna.'}</p>${mands(sc)}${o.k==='tema'?`<h3 class="pxh">Subtemas</h3>${Object.entries(SUBS[o.t]).map(([sid,sn])=>{const ss=score(o.c,o.t,sid);return `<button class="pxrow" data-open="sub:${o.c}:${o.t}:${sid}"><span>${esc(sn)}</span><small>${notaTxt(ss)}</small></button>`;}).join('')}`:''}<h3 class="pxh" style="margin-top:8px">Fatos${o.k==='tema'?' mais fortes':''}</h3>${fs.slice().sort((a,b)=>Math.abs(b.w)-Math.abs(a.w)).slice(0,o.k==='tema'?7:99).map(factRow).join('')||'<p class="pxh">Nenhum.</p>'}${go3(o.t,o.c)}`;}
  if(o.k==='fato'){const f=F.find(x=>x.id===o.id);const tp=TIPO[f.tipo];
    return `<p class="pxh">${mes(f.d)}${f.m?', '+MAND[f.m][0]:''}</p><h2 tabindex="-1">${esc(f.tit)}</h2><span class="pxtag" style="border-color:${tp[1]}">${tp[2]} ${tp[0]}</span>${f.c!=='BR'?`<span class="pxtag">${f.w?(f.w>0?'+':'−')+Math.abs(f.w)+' na nota':'Vale zero'}</span>`:'<span class="pxtag">Marco do Brasil</span>'}<p>${rich(f.txt)}</p><p class="pxfonte">Fonte oficial: <a href="${esc(f.link)}" rel="noopener" target="_blank">${esc(f.orgao)}${f.doc?', '+esc(f.doc):''}</a>${f.fontes.length?'<br>Também: '+f.fontes.map(x=>`<a href="${esc(x[1])}" rel="noopener" target="_blank">${esc(x[0])}</a>`).join(', '):''}</p><p class="pxh">Conferido em ${esc(f.conf)}. Feito com IA, pode conter erros.</p>${go3(f.t,f.c==='BR'?null:f.c,f.id)}<div class="pxgo"><a href="${erro(f)}">Apontar erro</a><a href="fato/${f.id}.html">Página do fato</a></div>`;}
  if(o.k==='ajuda')return HELP();
  if(o.k==='acesso')return ACESSO();
  if(o.k==='term'){const t=TERMS[o.key];const used=F.filter(f=>f.txt.toLowerCase().includes('[['+o.key+']]')||f.txt.toLowerCase().includes('[['+o.key+'|'));
    return `<p class="pxh">Dicionário</p><h2 tabindex="-1">${esc(t[0])}</h2><p>${rich(t[1])}</p><h3 class="pxh">Onde aparece</h3>${used.length?used.map(factRow).join(''):'<p class="pxh">Ainda em nenhum fato.</p>'}`;}
  if(o.k==='cmp'){const f=score('F',o.t),l=score('L',o.t);
    const rows=Object.entries(SUBS[o.t]).map(([sid,sn])=>{const a=score('F',o.t,sid),b=score('L',o.t,sid);return {sn,a,b,same:(!a.n&&!b.n)||(a.n&&b.n&&band(a.avg)[0]===band(b.avg)[0])};}).filter(r=>!st.diff||!r.same);
    return `<h2 tabindex="-1">${TEMAS[o.t]}</h2><table class="pxtable"><tr><th></th><th scope="col">Flávio</th><th scope="col">Lula</th></tr><tr><th scope="row">Nota</th><td><b>${f.n?sgn(f.avg):'—'}</b><br>${f.n?band(f.avg)[0]:'Sem fatos'}</td><td><b>${l.n?sgn(l.avg):'—'}</b><br>${l.n?band(l.avg)[0]:'Sem fatos'}</td></tr>${f.gov?`<tr><th scope="row">Mandatos com fatos</th><td>${f.n} de ${f.tot}</td><td>${l.n} de ${l.tot}</td></tr>`:''}</table>${f.gov?`<h3 class="pxh">Nota de cada mandato</h3>${mands(f)}${mands(l)}`:''}<div class="pxtools" style="margin-top:8px"><button data-diff="0" aria-pressed="${!st.diff}">Todos os subtemas</button><button data-diff="1" aria-pressed="${st.diff}">Só diferenças</button></div><table class="pxtable"><tr><th scope="col">Subtema</th><th scope="col">Flávio</th><th scope="col">Lula</th></tr>${rows.map(r=>`<tr><th scope="row">${esc(r.sn)}</th><td>${notaTxt(r.a)}</td><td>${notaTxt(r.b)}</td></tr>`).join('')||'<tr><td colspan="3">Nenhuma diferença.</td></tr>'}</table>${go3(o.t,null)}`;}
  return '';
}
function showSheet(){const sh=q('#pxSheet');if(!stack.length){const ab=!sh.hidden;sh.hidden=true;q('#pxScrim').hidden=true;if(ab&&quem&&document.contains(quem))quem.focus({preventScroll:true});return;}const o=stack[stack.length-1];q('#pxShB').innerHTML=sheetHTML(o);q('#pxTrail').textContent=trail(o);q('#pxBack').hidden=stack.length<2;sh.hidden=false;q('#pxScrim').hidden=false;q('#pxShB').scrollTop=0;const h=q('#pxShB h2');if(h)h.focus({preventScroll:true});}
function open(spec,push){const p=spec.split(':');let o;
  if(p[0]==='tema')o={k:'tema',c:p[1],t:p[2]};else if(p[0]==='sub')o={k:'sub',c:p[1],t:p[2],s:p[3]};else if(p[0]==='fato')o={k:'fato',id:p[1]};else if(p[0]==='term')o={k:'term',key:p.slice(1).join(':')};else if(p[0]==='cmp')o={k:'cmp',t:p[1]};else if(p[0]==='ajuda')o={k:'ajuda'};else if(p[0]==='acesso')o={k:'acesso'};
  if(!push){stack=[];quem=document.activeElement;}stack.push(o);showSheet();
  ev(o.k==='term'?'abrir_palavra':'abrir_'+o.k,o.k==='fato'?o.id:o.t);
}
function closeAll(){stack=[];showSheet();}
function setView(v,why){st.v=v;render();say(`Mostrando ${v==='mapa'?'o mapa':v==='cmp'?'a comparação':v==='tempo'?'a linha do tempo':'o dicionário'}${st.t?' de '+TEMAS[st.t]:''}.`);if(why!=='silent')ev('vista',v);}
function go3act(spec){const [v,t,c,fid]=spec.split(':');closeAll();if(t)st.t=t;if(c)st.c=c;if(v==='tempo'&&fid){const f=F.find(x=>x.id===fid);if(!f.mk)st.mk=false;}ev('levar_para',v);setView(v,'silent');
  const target=v==='tempo'&&fid?q('#tl-'+fid):v==='cmp'&&t?q('#cmp-'+t):null;if(target){target.scrollIntoView({block:'center'});target.classList.add('flash');setTimeout(()=>target.classList.remove('flash'),1500);target.focus({preventScroll:true});}}

const PREF={escala:1,contraste:false,facil:false};
function lerPref(){try{Object.assign(PREF,JSON.parse(localStorage.getItem('cc-acesso')||'{}'));}catch(e){}aplicar();}
function aplicar(){const h=document.documentElement;h.style.setProperty('--escala',PREF.escala);h.toggleAttribute('data-contraste',!!PREF.contraste);h.toggleAttribute('data-facil',!!PREF.facil);try{localStorage.setItem('cc-acesso',JSON.stringify(PREF));}catch(e){}}
function ACESSO(){const fala='speechSynthesis' in window;return `<h2 tabindex="-1">Acessibilidade</h2><p>Escolha como prefere ler. A escolha fica guardada só neste aparelho.</p><div class="pxopc"><div><p class="pxh">Tamanho da letra</p><div class="pxtools"><button data-escala="0.9" aria-pressed="${PREF.escala==0.9}">A−</button><button data-escala="1" aria-pressed="${PREF.escala==1}">A</button><button data-escala="1.2" aria-pressed="${PREF.escala==1.2}">A+</button><button data-escala="1.4" aria-pressed="${PREF.escala==1.4}">A++</button></div></div><button data-pref="contraste" aria-pressed="${!!PREF.contraste}">Alto contraste<span>${PREF.contraste?'Ligado':'Desligado'}</span></button><button data-pref="facil" aria-pressed="${!!PREF.facil}">Leitura fácil: letra maior e mais espaço<span>${PREF.facil?'Ligado':'Desligado'}</span></button><button data-lista="${st.lista?0:1}" aria-pressed="${st.lista}">Ver em lista no lugar dos gráficos<span>${st.lista?'Ligado':'Desligado'}</span></button>${fala?'<button data-ouvir="1">Ouvir esta tela<span>Lê em voz alta</span></button>':''}<button data-libras="1">Tradução em Libras (VLibras)<span>Abre o tradutor do governo</span></button></div>`;}
function ouvir(){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(q('#pxBody').innerText.slice(0,4000));u.lang='pt-BR';u.rate=.9;speechSynthesis.speak(u);}catch(e){}}
function libras(){if(window.VLibras){toast('O botão de Libras está no canto da tela.');return;}const w=document.createElement('div');w.setAttribute('vw','');w.className='enabled';w.innerHTML='<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';document.body.appendChild(w);const s=document.createElement('script');s.src='https://vlibras.gov.br/app/vlibras-plugin.js';s.onload=()=>{new window.VLibras.Widget('https://vlibras.gov.br/app');toast('Toque no botão azul de Libras, no canto da tela.');};document.body.appendChild(s);}

root.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-open]');if(!t||!root.contains(t))return;
  if(t.dataset.tut){closeAll();tOpen(0);return;}
  if(t.dataset.term){open('term:'+t.dataset.term,!!t.closest('#pxSheet'));return;}
  if(t.dataset.open){open(t.dataset.open,!!t.closest('#pxSheet'));return;}
  if(t.dataset.go3){go3act(t.dataset.go3);return;}
  if(t.dataset.v){closeAll();setView(t.dataset.v);return;}
  if(t.dataset.c){st.c=t.dataset.c;render();ev('filtro','candidato');say('Candidato: '+(st.c==='all'?'os dois':WHO[st.c]));return;}
  if(t.dataset.sort){st.sort=t.dataset.sort;render();return;}
  if(t.dataset.lista!==undefined){st.lista=t.dataset.lista==='1';render();if(stack.length)showSheet();return;}
  if(t.dataset.mk!==undefined){st.mk=t.dataset.mk==='1';render();return;}
  if(t.dataset.diff!==undefined){st.diff=t.dataset.diff==='1';showSheet();return;}
  if(t.dataset.escala){PREF.escala=+t.dataset.escala;aplicar();showSheet();return;}
  if(t.dataset.pref){PREF[t.dataset.pref]=!PREF[t.dataset.pref];aplicar();showSheet();return;}
  if(t.dataset.ouvir){closeAll();ouvir();return;}
  if(t.dataset.libras){closeAll();libras();return;}
  if(t.dataset.year){const y=+t.dataset.year;const i=PER.findIndex(p=>y>=p[1]&&y<=p[2]);const el=q('#per-'+i);if(el)el.scrollIntoView({block:'start'});return;}
  if(t.id==='pxBack'){stack.pop();showSheet();ev('voltar');return;}
  if(t.id==='pxClose'){closeAll();ev('fechar');return;}
});
root.addEventListener('keydown',e=>{const g=e.target.closest('.pxn');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open(g.dataset.open,false);}if(e.key==='Escape'&&stack.length){closeAll();}});
q('#pxScrim').addEventListener('click',()=>{closeAll();ev('fechar');});
q('#pxTema').innerHTML='<option value="">Todos os temas</option>'+Object.keys(TEMAS).map(t=>`<option value="${t}">${TEMAS[t]}</option>`).join('');
q('#pxTema').addEventListener('change',e=>{st.t=e.target.value;render();ev('filtro','tema');say(st.t?'Tema: '+TEMAS[st.t]:'Todos os temas');});
q('#pxConf').textContent='Conferido em '+quando(D.conferido);

const svgI=p=>`<svg class="ico" viewBox="0 0 24 24">${p}</svg>`;
const HP='<path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>';
q('#tHand').innerHTML=`<g class="halo">${HP}</g><g class="line">${HP}</g>`;
const IC={top:svgI('<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>'),map:svgI('<circle cx="12" cy="12" r="3"/><circle cx="12" cy="3.5" r="1.5"/><circle cx="20" cy="17" r="1.5"/><circle cx="4" cy="17" r="1.5"/><path d="M12 9V5M14.6 13.5l4 2.5M9.4 13.5l-4 2.5"/>'),doc:svgI('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h8"/><path d="M8 17h5"/>'),word:svgI('<text x="3" y="15" font-size="12" font-weight="700" fill="currentColor" stroke="none">Aa</text><path d="M3 20h18" stroke-dasharray="1.5 2.5"/>'),go:svgI('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),grid:svgI('<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>'),back:svgI('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>')};
function HELP(){return `<h2 tabindex="-1">Como usar o site</h2><p>A página funciona igual em todas as telas.</p><button class="tnext" data-tut="1" style="width:100%;margin:2px 0 10px">Ver o passeio de 5 passos</button>${[
 [IC.top,'Escolha quem ver','Lá em cima: os dois candidatos ou só um, e um tema. A escolha vale para todas as telas.'],
 [IC.map,'Cada círculo é um tema','A cor mostra a nota: verde é bom, laranja é ruim, cinza é empate. Tracejado quer dizer sem fatos.'],
 [IC.doc,'Resumo e fatos','Toque num tema para ver a nota, quantos mandatos têm fatos e os fatos mais fortes. Cada fato mostra quando aconteceu, quanto vale e de onde veio.'],
 [IC.word,'Palavra com pontinhos','Toque nela para ver o que quer dizer.'],
 [IC.go,'Levar para','No fim de cada fato, abre o mesmo assunto em outra tela.'],
 [IC.grid,'Os 4 botões de baixo','Mapa mostra os temas de cada candidato. Comparar põe os dois lado a lado. Linha do tempo mostra os fatos por ano. Dicionário explica as palavras difíceis e busca fatos.'],
 [IC.back,'Voltar','Lá em cima, Voltar desfaz um passo de cada vez.']
].map(r=>`<div class="hrow"><span class="hic">${r[0]}</span><span><b>${r[1]}</b><small>${r[2]}</small></span></div>`).join('')}<h3 class="pxh" style="margin-top:10px">Cores e símbolos</h3><div class="hcols">${Object.values(TIPO).map(tp=>`<span><span class="pxdot" style="background:${tp[1]}" aria-hidden="true">${tp[2]}</span>${tp[0]}</span>`).join('')}</div><p class="pxh">A cor sempre vem com símbolo e palavra. Nenhuma cor é de um candidato.</p>`;}
let lado='F';const pickC=()=>st.c!=='all'?st.c:lado;
const toMapa=()=>{closeAll();if(st.v!=='mapa')setView('mapa','silent');};
function temaCom(c){return Object.keys(TEMAS).find(t=>F.some(f=>f.c===c&&f.t===t))||Object.keys(TEMAS)[0];}
const TS=[
 {t:'Bem-vindo!',x:'Este site mostra fatos sobre os dois candidatos, cada um com a fonte de onde veio. Em 5 passos você aprende a usar a página. Pode tocar à vontade: nada aqui se estraga.',prep:toMapa},
 {t:'Escolha quem ver',x:'Aqui em cima você escolhe: os dois, só Flávio ou só Lula. A escolha vale para todas as telas. Toque em "Os dois".',sel:'.pxctx',hand:'.pxseg button[data-c="all"]',m:n=>n==='filtro',ok:'Isso! A escolha fica valendo em todas as telas.',prep:toMapa},
 {t:'Cada círculo é um tema',x:'A cor mostra a nota: verde é bom, laranja é ruim, cinza é empate. Tracejado quer dizer sem fatos. Toque em qualquer círculo.',sel:'.pxconst',cls:'tour-temas',m:n=>n==='abrir_tema',ok:'Isso! Abriu o resumo do tema.',prep(){st.lista=false;toMapa();render();}},
 {t:'O resumo do tema',x:'No alto, a nota e quantos mandatos têm fatos. Embaixo, os fatos mais fortes. Toque num fato.',sel:'#pxSheet',hand:'#pxShB .pxrow[data-open^="fato"]',m:n=>n==='abrir_fato',ok:'Isso! Cada fato mostra de onde veio.',prep(){const o=stack[stack.length-1];if(!o||(o.k!=='tema'&&o.k!=='sub')){const c=pickC();open('tema:'+c+':'+temaCom(c),false);}}},
 {t:'Entender e seguir',x:'Palavra com pontinhos embaixo tem explicação: toque nela. Em "Levar para", o mesmo assunto abre em outra tela.',sel:'#pxSheet',hand:'#pxShB .pxterm, #pxShB .pxgo button',m:n=>n==='abrir_palavra'||n==='levar_para',ok:'Isso! Para desfazer um passo, toque em Voltar, lá em cima.',prep(){const o=stack[stack.length-1];if(!o||o.k!=='fato'||!q('#pxShB .pxterm')){const c=o&&o.k==='fato'?F.find(x=>x.id===o.id).c:pickC();const f=F.find(x=>x.c===c&&x.t&&/\[\[/.test(x.txt))||F.find(x=>x.c===c&&x.t)||F[0];open('fato:'+f.id,stack.length>0);}}},
 {t:'Quatro jeitos de ver',x:'Os 4 botões de baixo mostram os mesmos fatos de jeitos diferentes: Mapa, Comparar, Linha do tempo e Dicionário. Toque em Comparar.',sel:'.pxnav',hand:'.pxnav button[data-v="cmp"]',m:n=>n==='vista',ok:'Pronto! Se esquecer algo, toque em "Como usar", lá em cima.',prep(){closeAll();}}
];
const TR=q('#tour');let ti=0,tdone=false;
const vis=el=>el&&el.offsetParent!==null&&!el.closest('[hidden]');
function place(){
  if(TR.hidden)return;const s=TS[ti];const R=root.getBoundingClientRect(),bx=R.left+root.clientLeft,by=R.top+root.clientTop,ph=root.clientHeight;
  const el=s.sel&&q(s.sel),sp=q('#tSpot'),card=q('#tCard'),hd=q('#tHand'),rp=q('#tRip');
  let r=null;
  if(vis(el)){const b=el.getBoundingClientRect();r={x:b.left-bx-4,y:Math.max(0,b.top-by-4),w:b.width+8,h:Math.min(b.height+8,ph)};sp.classList.remove('none');}
  else{r={x:root.clientWidth/2,y:ph/2,w:0,h:0};sp.classList.add('none');}
  Object.assign(sp.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});
  const ch=card.offsetHeight;let top;
  if(!r.w)top=(ph-ch)/2;else if(r.y+r.h+10+ch<=ph-6)top=r.y+r.h+10;else if(r.y-10-ch>=6)top=r.y-10-ch;else top=6;
  card.style.top=Math.max(6,top)+'px';
  const h=s.hand&&q(s.hand);
  if(vis(h)&&!tdone){const b=h.getBoundingClientRect();const cx=b.left-bx+b.width/2,cy=b.top-by+b.height/2;hd.style.left=(cx-15)+'px';hd.style.top=(cy-4)+'px';rp.style.left=(cx-11)+'px';rp.style.top=(cy-11)+'px';hd.toggleAttribute('hidden',false);rp.hidden=false;}
  else{hd.toggleAttribute('hidden',true);rp.hidden=true;}
}
function tRender(){
  const s=TS[ti];tdone=false;
  root.classList.remove('tour-temas');if(s.cls)root.classList.add(s.cls);
  if(s.prep)s.prep();
  [q('#tHand'),q('#tRip'),q('#tNext')].forEach(e=>{e.style.animation='none';e.getBoundingClientRect();e.style.animation='';});
  q('#tProg').textContent=ti?`Passo ${ti} de ${TS.length-1}`:'Como usar o site';
  q('#tDots').innerHTML=TS.slice(1).map((x,i)=>`<i class="${i<ti?'on':''}"></i>`).join('');
  q('#tT').textContent=s.t;q('#tX').textContent=s.x;q('#tOk').innerHTML='';q('#tPrev').hidden=ti===0;
  const n=q('#tNext');n.textContent=ti===TS.length-1?'Terminar':ti===0?'Começar':'Próximo';n.classList.toggle('go',ti===0);
  requestAnimationFrame(()=>{place();q('#tT').focus({preventScroll:true});});
}
function tOk(){if(tdone)return;tdone=true;const s=TS[ti];q('#tOk').innerHTML=svgI('<path d="M20 6 9 17l-5-5"/>')+esc(s.ok);q('#tNext').classList.add('go');setTimeout(place,60);}
onEv=(n,d)=>{if(TR.hidden)return;const s=TS[ti];if(s.m&&s.m(n,d))tOk();};
function tOpen(i){lado=Math.random()<.5?'F':'L';ti=i||0;TR.hidden=false;root.classList.add('touring');tRender();}
function toast(m){const el=q('#pxToast');el.textContent=m;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{el.hidden=true;},8000);}
function tClose(){TR.hidden=true;root.classList.remove('touring','tour-temas');try{speechSynthesis.cancel();}catch(e){}try{localStorage.setItem('cc-passeio-visto','1');}catch(e){}toast('Pronto! Para ver o passeio de novo, toque em Como usar, lá em cima.');}
function speak(){try{const s=TS[ti];speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(s.t+'. '+s.x);u.lang='pt-BR';u.rate=.9;speechSynthesis.speak(u);}catch(e){}}
if(!('speechSynthesis' in window))q('#tSay').hidden=true;
q('#tCard').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;e.stopPropagation();
  if(b.id==='tSkip')return tClose();
  if(b.id==='tNext'){if(ti===TS.length-1)return tClose();ti++;return tRender();}
  if(b.id==='tPrev'){ti=Math.max(0,ti-1);return tRender();}
  if(b.id==='tSay')return speak();
});
root.addEventListener('click',()=>{if(TR.hidden)return;setTimeout(()=>{const s=TS[ti];if(s.sel&&!vis(q(s.sel))&&!tdone&&s.prep)s.prep();place();},90);});
root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!TR.hidden){e.stopPropagation();tClose();}},true);
['#pxBody','#pxShB'].forEach(sel=>q(sel).addEventListener('scroll',()=>place(),{passive:true}));
window.addEventListener('resize',()=>place());
lerPref();render();
let visto=false;try{visto=localStorage.getItem('cc-passeio-visto')==='1';}catch(e){}
if(!visto)tOpen(0);
})();
