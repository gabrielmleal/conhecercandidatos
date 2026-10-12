(function(){
const D=window.DADOS;
const root=document.getElementById('px');
const q=s=>root.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TEMAS={},CURTO={},GOV={};
Object.entries(D.temas).forEach(([k,v])=>{TEMAS[k]=v.nome;CURTO[k]=v.curto;GOV[k]=v.governo;});
const ORDEM=Object.keys(TEMAS);
const WHO={F:'Flávio',L:'Lula',BR:'Brasil'};
const MANDATO={b:'governo Bolsonaro',l1:'primeiro mandato',l2:'segundo mandato',l3:'terceiro mandato'};
const TIPO={pos:['Positivo','var(--dot-pos)','algo que melhorou, mostrado por um número'],neg:['Problema','var(--dot-neg)','algo que piorou, uma condenação ou uma investigação aberta'],pol:['Polêmico','var(--dot-mid)','o efeito ou a prova ainda estão em disputa'],ctx:['Contexto','var(--dot-info)','informação sem lado bom ou ruim'],pro:['Promessa','var(--dot-neu)','o que ainda não aconteceu']};
const TIPOS=Object.keys(TIPO);
const MESES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const TERMS=D.termos,G=D.grupos;
function mandOf(c,d,t){if(!t||c==='BR'||!GOV[t])return null;const y=+d.slice(0,4);if(c==='L')return y<=2006?'l1':y<=2010?'l2':y>=2023?'l3':null;return y>=2019&&y<=2022?'b':null;}
const F=D.fatos.map(f=>({...f,m:f.tipo==='pro'?null:mandOf(f.c,f.d,f.t)})).sort((a,b)=>a.d.localeCompare(b.d));
const st={c:'all',v:'ini',dq:'',tipos:new Set(TIPOS),g:'',para:'',pi:0};
const ler=(k,p)=>{try{return JSON.parse(localStorage.getItem(k))||p;}catch(e){return p;}};
const guardar=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
const vistos=new Set(ler('cc-vistos',[]));
const PREF=Object.assign({escala:1,contraste:false,lista:false},ler('cc-acesso',{}));
const ESCALAS=[0.9,1,1.15,1.3,1.5];
const svgI=p=>`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const IC={seta:svgI('<path d="m9 18 6-6-6-6"/>'),baixo:svgI('<path d="m6 9 6 6 6-6"/>'),lista:svgI('<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>'),brilho:svgI('<path d="M12 3l1.9 5.8L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.2Z"/><path d="M19 17v4M17 19h4"/>'),doc:svgI('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h6"/><path d="M8 13h8M8 17h5"/>'),sai:svgI('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),zap:svgI('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),funil:svgI('<path d="M3 5h18l-7 8v5l-4 2v-7Z"/>'),som:svgI('<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),pessoa:svgI('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),lado:svgI('<rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="16" rx="2"/>'),relogio:svgI('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),esq:svgI('<path d="m15 18-6-6 6-6"/>'),copia:svgI('<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>')};

function rich(s){return esc(s).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,k,d)=>{const key=k.toLowerCase();return TERMS[key]?`<button class="pxterm" data-term="${esc(key)}">${d||k}</button>`:(d||k);});}
const plain=s=>String(s).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,k,d)=>d||k);
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const diaMes=d=>(d.length>7?+d.slice(8,10)+' ':'')+MESES[+d.slice(5,7)-1];
const mes=d=>d.length<7?d:diaMes(d)+' '+d.slice(0,4);
const MESL=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const quando=d=>`${+d.slice(8,10)} de ${MESL[+d.slice(5,7)-1]}`;
const say=t=>{q('#pxSR').textContent=t;};
function toast(m){const el=q('#pxToast');el.textContent=m;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{el.hidden=true;},5000);}
const plural=(n,s)=>`${n} ${s}${n===1?'':'s'}`;
const junta=xs=>xs.length>1?xs.slice(0,-1).join(', ')+' e '+xs[xs.length-1]:xs.join('');
const passa=f=>st.tipos.has(f.tipo)&&(!st.g||f.g.includes(st.g));
const filtrado=()=>st.tipos.size<TIPOS.length||!!st.g;
const escolhidos=()=>[st.tipos.size<TIPOS.length?junta(TIPOS.filter(k=>st.tipos.has(k)).map(k=>TIPO[k][0])):'',st.g?'para '+G[st.g]:''].filter(Boolean).join(' · ');
const daVez=v=>F.filter(f=>v==='tempo'?f.c==='BR'||st.c==='all'||f.c===st.c:f.t&&(st.c==='all'||f.c===st.c));
const avisoFiltro=()=>filtrado()?`<p class="pxfiltro">Só ${esc(escolhidos())}<button data-todos="1">Mostrar todos</button></p>`:'';

const bio=f=>f.s==='biografia';
const importa=(a,b)=>bio(b)-bio(a)||(bio(a)?a.d.localeCompare(b.d):!!b.mk-!!a.mk||Math.abs(b.w)-Math.abs(a.w)||b.d.localeCompare(a.d));
function alterna(fs,prim){
  const ls=[prim,prim==='F'?'L':'F','BR'].map(c=>fs.filter(f=>f.c===c)),out=[];
  for(let i=0;i<Math.max(...ls.map(l=>l.length));i++)ls.forEach(l=>{if(l[i])out.push(l[i]);});
  return out;
}
const subDe=(t,f)=>D.temas[t].subtemas[f.s]?f.s:'_';
const subsDe=(t,fs)=>Object.entries(D.temas[t].subtemas).concat(fs.some(f=>subDe(t,f)==='_')?[['_','Outros']]:[]);
function doTema(t,c){
  const fs=F.filter(f=>f.t===t&&(c==='all'?f.c!=='BR':f.c===c)&&passa(f)).sort(importa);
  const parte=xs=>subsDe(t,fs).flatMap(([k])=>{const ys=xs.filter(f=>subDe(t,f)===k);return c==='all'?alterna(ys,ORDEM.indexOf(t)%2?'L':'F'):ys;});
  return GOV[t]?[...parte(fs.filter(f=>f.tipo==='pro')),...parte(fs.filter(f=>f.tipo!=='pro'))]:parte(fs);
}
const doSite=()=>F.filter(f=>(st.c==='all'||f.c===st.c)&&passa(f));
function todosFatos(){
  const fs=doSite().sort(importa),n=c=>fs.filter(f=>f.c===c&&vistos.has(f.id)).length;
  const prim=n('F')<n('L')||(n('F')===n('L')&&Math.random()<.5)?'F':'L';
  return [...alterna(fs.filter(f=>!vistos.has(f.id)),prim),...alterna(fs.filter(f=>vistos.has(f.id)),prim)];
}
function temas(){return ORDEM.map(t=>{const fs=doTema(t,st.c);return {t,n:fs.length,novos:fs.filter(f=>!vistos.has(f.id)).length};});}
const resumo=r=>r.n?`${plural(r.n,'fato')}, ${r.novos?plural(r.novos,'novo'):'todos vistos'}`:'ainda sem fatos';

function constelacao(rs){
  const N=rs.length,cx=180,cy=170,R=110;
  const nos=rs.map((r,i)=>{
    const a=-Math.PI/2+i*2*Math.PI/N,x=cx+R*Math.cos(a),y=cy+R*Math.sin(a),raio=12+Math.min(5,r.n),feito=r.n&&!r.novos;
    const pct=r.n?Math.round((r.n-r.novos)/r.n*100):0,lx=x+Math.cos(a)*(raio+11),ly=y+Math.sin(a)*(raio+11)+5,anc=Math.abs(Math.cos(a))<.12?'middle':Math.cos(a)>0?'start':'end';
    const X=x.toFixed(1),Y=y.toFixed(1);
    return {lin:`<line x1="${cx}" y1="${cy}" x2="${X}" y2="${Y}" stroke="var(--m-line2)"/>`,
      no:`<g class="pxn${feito?' feito':''}" tabindex="0" role="button" data-tema="${r.t}" aria-label="${esc(TEMAS[r.t])}: ${resumo(r)}" style="animation-delay:${i*35}ms"><circle cx="${X}" cy="${Y}" r="${raio+5}" fill="none" stroke="var(--m-line)" stroke-width="3"/>${pct?`<circle class="anel" cx="${X}" cy="${Y}" r="${raio+5}" fill="none" stroke="var(--m-ink)" stroke-width="3" pathLength="100" stroke-dasharray="${pct} 100" transform="rotate(-90 ${X} ${Y})"/>`:''}<circle class="bola" cx="${X}" cy="${Y}" r="${raio}" fill="${feito?'var(--m-ink)':'var(--m-s1)'}" stroke="var(--m-line2)" stroke-width="1.5"${r.n?'':' stroke-dasharray="3 3"'}/><text x="${X}" y="${(y+5).toFixed(1)}" text-anchor="middle" font-size="15" font-weight="700" fill="${feito?'var(--m-bg)':'var(--m-ink)'}">${feito?'✓':r.novos||''}</text><text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anc}" font-size="19" font-weight="700" fill="var(--m-ink)">${esc(CURTO[r.t])}</text></g>`};
  });
  return `<figure class="pxconst"><svg viewBox="-60 10 470 314" role="group" aria-label="Temas">${nos.map(n=>n.lin).join('')}<circle cx="${cx}" cy="${cy}" r="25" fill="var(--m-ink)"/><text x="${cx}" y="${cy+5}" text-anchor="middle" fill="var(--m-bg)" font-weight="700" font-size="15">${st.c==='all'?'F · L':st.c}</text>${nos.map(n=>n.no).join('')}</svg></figure>`;
}
const PERFIL={F:{nome:'Flávio Bolsonaro',partido:'PL',hoje:'Senador pelo Rio de Janeiro',nasc:'Nasceu em 1981, em Resende (RJ)'},L:{nome:'Lula',partido:'PT',hoje:'Presidente da República',nasc:'Nasceu em 1945, em Garanhuns (PE)'}};
const subNome=f=>f.t?(D.temas[f.t].subtemas[f.s]||CURTO[f.t]):'Brasil';
function vIni(){
  const rs=temas(),fs=doSite(),vi=fs.filter(f=>vistos.has(f.id)).length;
  const cand=c=>`<button class="cand" data-quem="${c}"><span class="quem ${c}" aria-hidden="true">${c}</span><b>${PERFIL[c].nome}</b><small>${PERFIL[c].partido} · ${PERFIL[c].hoje}</small><small>${PERFIL[c].nasc}</small><span class="mais">Quem é ${IC.seta}</span></button>`;
  const porta=(attr,ic,t,x)=>`<button class="porta" ${attr}>${ic}<span><b>${t}</b><small>${x}</small></span>${IC.seta}</button>`;
  const corpo=PREF.lista?rs.map(r=>`<button class="pxrow" data-tema="${r.t}"><span class="tx"><b>${esc(TEMAS[r.t])}</b><small>${resumo(r)}</small></span>${IC.seta}</button>`).join(''):constelacao(rs);
  return `<button class="turno" data-tl="tempo-19">2º turno para presidente · domingo, 25 de outubro</button><div class="duo">${cand('F')}${cand('L')}</div><h2 class="pxh">O que você quer saber?</h2><div class="portas">${porta('data-v="pro"',IC.lado,'O que cada um propõe','As propostas dos dois, lado a lado')}${porta('data-para="1"',IC.pessoa,'Propostas para a minha situação','Aposentados, estudantes, agro e outros')}${porta('data-v="tempo"',IC.relogio,'O que já aconteceu','Do mais novo ao mais antigo')}</div><h2 class="pxh">Ou escolha um assunto</h2>${avisoFiltro()||(PREF.lista?'':'<p class="pxhint">O número em cada bolinha é quantos fatos você ainda não viu</p>')}${corpo}<div class="pxacao"><button class="pxsurpresa" data-surpresa="1">${IC.brilho}Fato surpresa</button>${fs.length?`<p class="pxvistos"><i aria-hidden="true"><b style="width:${Math.round(vi/fs.length*100)}%"></b></i>Você já viu ${vi} de ${fs.length} fatos</p><button class="pxtodos" data-lista="1">${IC.lista}Ver todos os fatos</button>`:''}</div>`;
}

const PARA={aposentados:['contas.previdencia','saude.sus','saude.remedios','renda.precos'],clt:['renda.emprego','renda.salario','contas.previdencia','contas.impostos'],informais:['renda.emprego','renda.juros','social.transferencia','producao.pequenas'],servidores:['contas.gastos','contas.previdencia','democracia.gestao','educacao.mec'],policiais:['seguranca.policia','seguranca.crime','seguranca.armas','seguranca.leis'],beneficiarios:['social.transferencia','social.fome','social.moradia','renda.salario'],estudantes:['educacao.creche','educacao.medio','educacao.universidades','obras.ciencia'],agro:['producao.agro','ambiente.desmatamento','mundo.comercio','ambiente.clima'],empresas:['contas.impostos','producao.pequenas','producao.industria','renda.juros'],mulheres:['social.direitos','educacao.creche','saude.sus','seguranca.crime']};
const propostas=()=>F.filter(f=>f.tipo==='pro'&&f.c!=='BR');
function blocosPro(){
  const alvo=st.para?new Set(PARA[st.para]):null,ps=propostas();
  return ORDEM.filter(t=>GOV[t]).map(t=>{
    const subs=Object.entries(D.temas[t].subtemas).filter(([k])=>!alvo||alvo.has(t+'.'+k)).map(([k,nome])=>({k,nome,fs:ps.filter(f=>f.t===t&&f.s===k).sort(importa)}));
    return {t,com:subs.filter(x=>x.fs.length),sem:subs.filter(x=>!x.fs.length)};
  }).filter(b=>b.com.length||(alvo&&b.sem.length));
}
let recua=false;
const foca=s=>{const el=q(s);if(el)el.focus({preventScroll:true});};
const pares=()=>blocosPro().flatMap(b=>b.com.map(x=>({t:b.t,nome:x.nome,F:x.fs.filter(f=>f.c==='F'),L:x.fs.filter(f=>f.c==='L')})));
const fonteMini=f=>`<a class="mini" href="${esc(f.link)}" target="_blank" rel="noopener">${IC.doc}Ver a fonte<small>${esc(f.orgao)}</small></a>`;
function vPro(){
  const topo=st.para?`<p class="pxfiltro">Assuntos ligados a: ${esc(G[st.para])}<button data-para="1">Trocar</button><button data-tudo="1">Ver tudo</button></p>`:`<button class="pxpara" data-para="1">${IC.pessoa}Propostas para a minha situação</button>`;
  const ps=pares();if(!ps.length)return topo+'<p class="pxhint">Ainda não há propostas aqui.</p>';
  st.pi=Math.max(0,Math.min(st.pi,ps.length-1));const p=ps[st.pi];
  [...p.F,...p.L].forEach(f=>vistos.add(f.id));guardar('cc-vistos',[...vistos]);
  const lado=c=>`<section class="umlado"><p class="lado"><span class="quem ${c}" aria-hidden="true">${c}</span>${WHO[c]}</p>${p[c].length?p[c].map(f=>`<h3>${esc(f.tit)}</h3><p class="umtx">${rich(f.txt)}</p>${fonteMini(f)}`).join(''):`<p class="vz">Ainda não registramos proposta de ${WHO[c]} sobre isso.</p>`}</section>`;
  const saltos=[...new Set(ps.map(x=>x.t))].map(t=>`<button data-salto="${ps.findIndex(x=>x.t===t)}" aria-pressed="${p.t===t}">${esc(CURTO[t])}</button>`).join('');
  return `${topo}<nav class="saltos" aria-label="Ir para o assunto">${saltos}</nav><div class="um${recua?' volta':''}"><i class="umbar" aria-hidden="true"><b style="width:${((st.pi+1)/ps.length*100).toFixed(1)}%"></b></i><p class="umonde">${esc(TEMAS[p.t])}<small>${st.pi+1} de ${ps.length}</small></p><h2 id="pxUmT" tabindex="-1">${esc(p.nome)}</h2><button class="ouvir" data-ouvirum="1">${IC.som}Ouvir os dois</button>${lado('F')}${lado('L')}</div><div class="umnav"><button data-um="-1" aria-label="Assunto anterior"${st.pi?'':' disabled'}>${IC.esq}</button>${st.pi<ps.length-1?'<button class="prim" data-um="1">Próximo assunto</button>':st.para?'<button class="prim" data-tudo="1">Ver todos os assuntos</button>':'<button class="prim" data-v="tempo">Ver o que já aconteceu</button>'}</div>`;
}
function irPara(i,foco){
  const ps=pares();if(i<0||i>=ps.length)return;
  calar();recua=i<st.pi;st.pi=i;render();recua=false;
  const el=foco&&q(foco);(el&&!el.disabled?el:q('#pxUmT')).focus({preventScroll:true});
  say(`Assunto ${i+1} de ${ps.length}: ${ps[i].nome}`);
}
function ouvirUm(){
  const p=pares()[st.pi],fala=c=>p[c].length?p[c].map(f=>`${f.tit}. ${plain(f.txt)}`).join(' '):'Ainda não registramos proposta sobre isso.';
  try{if(speechSynthesis.speaking)return calar();const u=new SpeechSynthesisUtterance(`${p.nome}. Propostas de Flávio Bolsonaro: ${fala('F')} Propostas de Lula: ${fala('L')}`);u.lang='pt-BR';u.rate=.9;speechSynthesis.speak(u);}catch(e){toast('Este aparelho não consegue ler em voz alta.');}
}
function para(){
  return `<h2 id="shT" tabindex="-1">Qual é a sua situação?</h2><p>Mostramos as propostas dos dois nos assuntos ligados a ela.</p><div class="pxmenu">${Object.keys(PARA).filter(k=>G[k]).map(k=>`<button data-escolhe="${k}" aria-pressed="${st.para===k}"><span>${esc(G[k])}<small>${esc(junta(PARA[k].map(x=>{const[t,sb]=x.split('.');return D.temas[t].subtemas[sb];})))}</small></span>${IC.seta}</button>`).join('')}</div>`;
}

const PER=[[2023,2026,'Lula (terceiro mandato)'],[2019,2022,'Jair Bolsonaro'],[2011,2018,'Dilma Rousseff e Michel Temer'],[2007,2010,'Lula (segundo mandato)'],[2003,2006,'Lula (primeiro mandato)'],[1995,2002,'Fernando Henrique Cardoso'],[0,1994,'']];
const anos=p=>p[0]?`${p[0]} a ${p[1]}`:'Antes de 1995';
const noPer=(fs,p)=>fs.filter(f=>{const y=+f.d.slice(0,4);return y>=p[0]&&y<=p[1];});
const linhaTempo=()=>daVez('tempo').filter(passa).sort((a,b)=>b.d.localeCompare(a.d));
function vTempo(){
  const it=linhaTempo();
  const blocos=PER.map((p,k)=>{
    let ano='';
    const fs=noPer(it,p);
    return fs.length?`<section id="per${k}"><h2 class="pxper"><button data-pular="1" aria-haspopup="dialog"><span><b>${anos(p)}</b>${p[2]?` · Presidente: ${esc(p[2])}`:''}</span>${IC.baixo}</button></h2><ol class="tl">${fs.map(f=>{
      const y=f.d.slice(0,4),novo=y!==ano;ano=y;
      const data=(novo?`<b>${y}</b>`:'')+(f.d.length>4?`<small>${diaMes(f.d)}</small>`:novo?'':`<small>${y}</small>`);
      return `<li><span class="qd" aria-hidden="true">${data}</span><span class="quem ${f.c}" aria-hidden="true">${f.c}</span><button class="it${f.mk?' marco':''}" data-tl="${f.id}" aria-label="${WHO[f.c]}, ${mes(f.d)}, ${TIPO[f.tipo][0]}: ${esc(f.tit)}"><small><b>${WHO[f.c]}${mandato(f)}</b><i style="--c:${TIPO[f.tipo][1]}"></i>${TIPO[f.tipo][0]}</small><span>${esc(f.tit)}</span></button></li>`;
    }).join('')}</ol></section>`:'';
  }).join('');
  return blocos?`${avisoFiltro()||'<p class="pxhint">Do mais novo ao mais antigo</p>'}${blocos}`:`${avisoFiltro()}<p class="pxhint">Ainda não há fatos.</p>`;
}
function pular(){
  const it=linhaTempo();
  return `<h2 id="shT" tabindex="-1">Ir para o período</h2><div class="pxmenu">${PER.map((p,k)=>{const n=noPer(it,p).length;return n?`<button data-per="${k}"><span>${anos(p)}<small>${p[2]?`Presidente: ${esc(p[2])} · `:''}${plural(n,'fato')}</small></span>${IC.seta}</button>`:'';}).join('')}</div>`;
}

function linha(f,attr){return `<li><button class="pxrow" ${attr}><span class="quem ${f.c}">${f.c}</span><span class="tx"><span class="${f.mk?'marco':''}">${esc(f.tit)}</span><small>${esc(subNome(f))} · ${TIPO[f.tipo][0]} · ${mes(f.d)}</small></span></button></li>`;}
const SUG=['Previdência','Impostos','Transferência de renda','Salário','Escola','Saúde','Segurança','Desmatamento','Corrupção','Inflação'];
let achadosFs=[];
function achados(){
  const qn=norm(st.dq.trim());
  const dic=ks=>ks.map(k=>`<div class="pxrow"><span class="tx"><b>${esc(TERMS[k][0])}</b><small>${esc(plain(TERMS[k][1]))}</small></span></div>`).join('');
  const todas=Object.keys(TERMS).sort((a,b)=>TERMS[a][0].localeCompare(TERMS[b][0],'pt'));
  if(qn.length<2)return `<h2 class="pxh">Sugestões</h2><div class="sug">${SUG.map(x=>`<button data-sug="${esc(x)}">${esc(x)}</button>`).join('')}</div><details class="todas"><summary>Todas as ${todas.length} palavras explicadas</summary>${dic(todas)}</details>`;
  const fs=F.filter(f=>norm([f.tit,plain(f.txt),f.t?TEMAS[f.t]:'',subNome(f)].join(' ')).includes(qn)).sort(importa);
  achadosFs=['F','L','BR'].flatMap(c=>fs.filter(f=>f.c===c));
  const ks=todas.filter(k=>norm(TERMS[k][0]+' '+plain(TERMS[k][1])).includes(qn));
  const grupo=c=>{const xs=achadosFs.map((f,i)=>[f,i]).filter(([f])=>f.c===c);return xs.length?`<h2 class="pxh">${WHO[c]}</h2><ul class="pxtl">${xs.map(([f,i])=>linha(f,`data-busca="${i}"`)).join('')}</ul>`:'';};
  return (['F','L','BR'].map(grupo).join('')+(ks.length?`<h2 class="pxh">Palavras explicadas</h2>${dic(ks)}`:''))||'<p class="pxhint">Nada encontrado. Tente outra palavra ou uma sugestão.</p>';
}
const vDic=()=>`<input class="pxsearch" id="pxDq" type="search" placeholder="Ex.: aposentadoria, escola, impostos" value="${esc(st.dq)}" aria-label="Buscar palavras e fatos" autocomplete="off"><div id="pxDl" aria-live="polite">${achados()}</div>`;
const VIEWS={ini:[vIni,'o início'],pro:[vPro,'as propostas'],tempo:[vTempo,'a linha do tempo'],dic:[vDic,'a busca']};
function render(manter){
  const b=q('#pxBody'),y=b.scrollTop;
  b.classList.remove('entra');b.innerHTML=VIEWS[st.v][0]();b.scrollTop=manter?y:0;
  root.querySelectorAll('.pxnav button').forEach(x=>x.setAttribute('aria-current',x.dataset.v===st.v));
  root.querySelectorAll('.pxseg button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.c===st.c));
  q('.pxctl').hidden=st.v!=='tempo';
  const fb=q('#pxFil');fb.classList.toggle('on',filtrado());fb.setAttribute('aria-label',filtrado()?'Filtrar. Mostrando só '+escolhidos():'Filtrar por tipo de fato');
  const di=q('#pxDq');if(di){di.addEventListener('input',e=>{st.dq=e.target.value;q('#pxDl').innerHTML=achados();});di.addEventListener('keydown',e=>{if(e.key==='Enter')di.blur();});}
  const sa=q('.saltos [aria-pressed="true"]');if(sa)sa.parentNode.scrollLeft=sa.offsetLeft-(sa.parentNode.clientWidth-sa.offsetWidth)/2;
}
const POS={};
function ir(v,nova){
  const b=q('#pxBody');
  if(v===st.v){if(nova)b.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return;}
  calar();POS[st.v]=b.scrollTop;
  if(v!=='tempo')st.c='all';
  st.v=v;if(nova)history.pushState({v},'');
  render();b.scrollTop=POS[v]||0;void b.offsetWidth;b.classList.add('entra');
  const a=document.activeElement;if(nova&&v==='dic')foca('#pxDq');else if(!a||a===document.body||!document.contains(a))foca(`.pxnav [data-v="${v}"]`);
  say('Mostrando '+VIEWS[v][1]);
}

const ST=q('#story'),CARD=q('#stCard'),SH=q('#pxSheet'),SCRIM=q('#pxScrim');
let S=null,quem=null,quemSh=null,depois=null,volta=null;
function travar(){const sheet=!SH.hidden,story=!ST.hidden;['.pxhead','#pxBody','.pxnav'].forEach(s=>{q(s).inert=sheet||story;});ST.inert=sheet;}
function abrir(s,i){
  if(ST.hidden){quem=alvo(document.activeElement);history.pushState({cc:1,v:st.v},'');}
  S=s;S.i=i;ST.hidden=false;travar();mostrar(1);
}
function abrirTema(t,c,id){
  const fs=doTema(t,c);
  abrir({itens:fs,t,c,onde:`${c==='all'?'Os dois':WHO[c]} · ${CURTO[t]}`,res:true,aba:GOV[t]&&fs.some(f=>f.tipo==='pro')?'pro':'fez',aberto:{},mais:{}},id?fs.findIndex(f=>f.id===id):-1);
}
function proximoTema(){
  const k=ORDEM.indexOf(S.t);if(!S.res||k<0)return null;
  const seq=ORDEM.slice(k+1).concat(ORDEM.slice(0,k));
  return seq.find(t=>doTema(t,S.c).some(f=>!vistos.has(f.id)))||seq.find(t=>doTema(t,S.c).length)||null;
}
function erro(f){return `mailto:contato@conhecercandidatos.com.br?subject=${encodeURIComponent('Apontar erro: '+f.id)}&body=${encodeURIComponent('Fato: '+f.tit+'\nO que está errado:\n')}`;}
const mandato=f=>f.m?f.c==='L'?` (${MANDATO[f.m]})`:' · '+MANDATO[f.m]:'';
function outroDe(f){
  if(f.c==='BR'||!f.t)return '';
  const o=f.c==='F'?'L':'F',xs=F.filter(x=>x.c===o&&x.t===f.t&&x.s===f.s).sort((a,b)=>(b.id===volta)-(a.id===volta)||(b.tipo===f.tipo)-(a.tipo===f.tipo)||importa(a,b));
  return xs.length?`<button class="outro" data-ver="${xs[0].id}"><span class="quem ${o}" aria-hidden="true">${o}</span><span><b>${WHO[o]} no mesmo assunto</b><small>${esc(xs[0].tit)}</small></span>${IC.seta}</button>`:`<p class="outro vazio"><span class="quem ${o}" aria-hidden="true">${o}</span>Ainda não registramos nada de ${WHO[o]} neste assunto.</p>`;
}
function cartao(f){
  const tp=TIPO[f.tipo];
  return `<p class="stmeta"><span class="quem ${f.c}">${f.c}</span><span><b>${WHO[f.c]}</b>${mandato(f)} · ${mes(f.d)}</span><button class="ouvir" data-ouvir="1">${IC.som}Ouvir</button></p><h2 id="stT" tabindex="-1">${esc(f.tit)}</h2><p class="txt">${rich(f.txt)}</p><p class="tipo" style="--c:${tp[1]}"><i aria-hidden="true"></i>${tp[0]}<small>${tp[2]}</small></p>${outroDe(f)}<a class="fonte" href="${esc(f.link)}" target="_blank" rel="noopener">${IC.doc}<span>Ver a fonte<small>${esc(f.orgao)}${f.doc?', '+esc(f.doc):''}${f.arq?' · cópia arquivada':''}</small></span>${IC.sai}</a>${f.fontes.length?`<p class="stextra"><span>Também em ${f.fontes.map(x=>`<a href="${esc(x[1])}" target="_blank" rel="noopener">${esc(x[0])}</a>`).join(', ')}</span></p>`:''}<p class="stextra"><span>Conferido em ${esc(f.conf)}</span><a href="${erro(f)}">Apontar erro</a></p>`;
}
const so=()=>filtrado()?' · só '+esc(escolhidos()):'';
const rs=(fs,quem)=>`<ul class="rs">${fs.map(([f,i])=>`<li><button data-ir="${i}">${quem?`<span class="quem ${f.c}" aria-hidden="true">${f.c}</span>`:`<i style="--c:${TIPO[f.tipo][1]}" aria-hidden="true"></i>`}<span>${esc(f.tit)}<small>${quem?[WHO[f.c],CURTO[f.t]].filter(Boolean).map(esc).join(' · ')+' · ':''}${bio(f)?'Biografia':TIPO[f.tipo][0]} · ${mes(f.d)}</small></span></button></li>`).join('')}</ul>`;
const naAba=f=>!GOV[S.t]||(S.aba==='pro')===(f.tipo==='pro');
function resumoTema(){
  const t=S.t,outro=S.c==='F'?'L':S.c==='L'?'F':null;
  const cs=S.c==='all'?(ORDEM.indexOf(t)%2?['L','F']:['F','L']):[S.c];
  const xs=S.itens.map((f,i)=>[f,i]).filter(([f])=>naAba(f)),lista=subsDe(t,S.itens);
  const doSub=k=>xs.filter(([f])=>subDe(t,f)===k),prim=(lista.find(([k])=>doSub(k).length)||[])[0];
  const n=a=>S.itens.filter(f=>(a==='pro')===(f.tipo==='pro')).length;
  const abas=GOV[t]?`<div class="abas" role="group" aria-label="O que mostrar">${[['pro','Propostas'],['fez','O que fez']].map(([k,nome])=>`<button data-aba="${k}" aria-pressed="${S.aba===k}">${nome} <small>${n(k)}</small></button>`).join('')}</div>`:'';
  const blocos=lista.map(([k,nome])=>{
    const ys=doSub(k),aberto=k in S.aberto?S.aberto[k]:k===prim;
    const conta=ys.length?cs.map(c=>{const m=ys.filter(([f])=>f.c===c).length;return `<span class="qn" aria-label="${WHO[c]}: ${plural(m,'fato')}"><span class="quem ${c}" aria-hidden="true">${c}</span><span aria-hidden="true">${m}</span></span>`;}).join(''):'sem fatos';
    let dentro='',resto=0;
    if(aberto)dentro=`<div class="sbd">${cs.map(c=>{const zs=ys.filter(([f])=>f.c===c),lim=S.mais[k]||k==='biografia'?zs.length:2;resto+=Math.max(0,zs.length-lim);return `${cs.length>1?`<p class="lane"><span class="quem ${c}" aria-hidden="true">${c}</span>${WHO[c]}</p>`:''}${zs.length?rs(zs.slice(0,lim)):`<p class="vz">Nada de ${WHO[c]} aqui ainda.</p>`}`;}).join('')}${resto?`<button class="pxtodos" data-mais="${k}">Ver mais ${resto} em ${esc(nome)}</button>`:''}</div>`;
    return `<section class="sb"><h3><button data-sub="${k}" aria-expanded="${!!aberto}"><b>${esc(nome)}</b><small>${conta}</small>${IC.baixo}</button></h3>${dentro}</section>`;
  }).join('');
  return `<div class="fim"><p class="stmeta">Resumo do tema${so()}</p><h2 id="stT" tabindex="-1">${esc(TEMAS[t])}</h2>${abas}<button class="tfiltro${filtrado()?' on':''}" data-filtro="1" aria-haspopup="dialog">${IC.funil}${filtrado()?'Só '+esc(escolhidos()):'Filtrar'}</button>${xs.length?blocos:`<p class="stleg">${S.itens.length?'Nada aqui ainda. Veja a outra aba.':'Ainda não há fatos aqui. O robô procura essa lacuna primeiro.'}</p>`}${outro?`<div class="fimbtn"><button data-outro="${outro}">Ver ${WHO[outro]} neste tema ${IC.seta}</button></div>`:''}</div>`;
}
function redesenha(foco){
  const y=CARD.scrollTop;CARD.innerHTML=resumoTema();CARD.scrollTop=y;
  const el=foco&&CARD.querySelector(foco);if(el)el.focus({preventScroll:true});
}
function refazStory(){if(ST.hidden||!S||!S.res)return;S.itens=S.t?doTema(S.t,S.c):todosFatos();S.aberto={};S.mais={};S.i=-1;mostrar(0);}
function resumoTodos(){
  const fs=S.itens.map((f,i)=>[f,i]),novos=fs.filter(([f])=>!S.vistos.has(f.id)),velhos=fs.filter(([f])=>S.vistos.has(f.id));
  const bloco=(xs,nome)=>xs.length?`<h3 class="rsh"><span><b>${nome}</b><small>${plural(xs.length,'fato')}</small></span></h3>${rs(xs,1)}`:'';
  return `<div class="fim"><p class="stmeta">${st.c==='all'?'Os dois':WHO[st.c]}${so()}</p><h2 id="stT" tabindex="-1">Todos os fatos</h2><p class="stleg">Os que você ainda não viu vêm primeiro. Dentro de cada parte, os mais importantes primeiro.</p>${bloco(novos,'Ainda não vistos')}${bloco(velhos,'Já vistos')}</div>`;
}
function mostrar(dir){
  const n=S.itens.length,r=S.res?1:0,tot=n+r,k=S.i+r,f=S.itens[S.i];
  q('#stWhere').textContent=f&&f.t?subNome(f):S.onde;
  calar();
  q('#stBars').innerHTML=tot>20?`<i><b style="width:${((k+1)/tot*100).toFixed(1)}%"></b></i>`:Array.from({length:tot},(_,j)=>`<i class="${j<k?'on':j===k?'agora':''}"></i>`).join('');
  CARD.classList.toggle('volta',dir<0);
  CARD.innerHTML=f?cartao(f):S.t?resumoTema():resumoTodos();CARD.scrollTop=0;
  if(f){vistos.add(f.id);guardar('cc-vistos',[...vistos]);}
  q('#stPrev').disabled=k===0;
  q('#stRes').hidden=!(S.res&&f);
  q('#stRes').lastChild.textContent=S.t?'Resumo':'Lista';
  const prox=S.i===n-1||!n?proximoTema():null;
  q('#stNext').textContent=!f&&n?'Ver um por um':S.i<n-1?'Próximo':prox?'Próximo: '+CURTO[prox]:'Fechar';
  say(f?`Fato ${S.i+1} de ${n}`:S.t?'Resumo do tema':'Todos os fatos');
  q('#stT').focus({preventScroll:true});
}
function avancar(){
  if(S.i<0&&S.t&&GOV[S.t]){const k=S.itens.findIndex(naAba);if(k>=0){S.i=k;return mostrar(1);}}
  if(S.i<S.itens.length-1){S.i++;return mostrar(1);}
  const t=proximoTema();
  if(t)return abrirTema(t,S.c);
  fechar();
}
function voltar(){if(S.i+(S.res?1:0)>0){S.i--;mostrar(-1);}}
function fecharStory(){
  const t=S&&S.t;ST.hidden=true;S=null;volta=null;travar();calar();
  if(st.v==='ini')render(true);
  const el=achar(quem&&quem.startsWith('[data-tema')&&t?`[data-tema="${t}"]`:quem||'#pxBody');if(el)el.focus({preventScroll:true});
}
function alvo(el){
  const k=el&&el.dataset&&Object.keys(el.dataset)[0];
  return el&&el.id?'#'+el.id:k?`[data-${k}="${CSS.escape(el.dataset[k])}"]`:null;
}
const achar=s=>s&&((!ST.hidden&&ST.querySelector(s))||q(s));
function dica(btn){
  const k=btn.dataset.term,t=TERMS[k],velha=btn.closest('.stcard,.pxbody').querySelector('.dica');
  if(velha){velha.remove();if(velha.dataset.k===k)return;}
  const d=document.createElement('p');d.className='dica';d.dataset.k=k;d.setAttribute('role','status');
  d.innerHTML=`<b>${esc(t[0])}</b>${esc(plain(t[1]))}`;btn.closest('p').after(d);
}
function surpresa(){
  const cs=(st.c==='all'?['F','L']:[st.c]).map(c=>[c,F.filter(f=>f.c===c&&f.t&&passa(f)&&vistos.has(f.id)).length]).sort((a,b)=>a[1]-b[1]||Math.random()-.5).map(x=>x[0]);
  const sorteia=p=>p[Math.floor(Math.random()*p.length)];
  for(const c of cs){const p=F.filter(f=>f.c===c&&f.t&&passa(f)&&!vistos.has(f.id));if(p.length){const f=sorteia(p);return abrirTema(f.t,st.c,f.id);}}
  const p=F.filter(f=>f.t&&passa(f)&&cs.includes(f.c));
  if(p.length){const f=sorteia(p);abrirTema(f.t,st.c,f.id);}
}

function abrirSheet(html){
  if(SH.hidden){quemSh=alvo(document.activeElement);history.pushState({cc:1,v:st.v},'');}
  q('#pxShB').innerHTML=html;SH.hidden=false;SCRIM.hidden=false;travar();q('#pxShB').scrollTop=0;q('#shT').focus({preventScroll:true});
}
function fecharSheet(){
  SH.hidden=true;SCRIM.hidden=true;travar();
  const f=depois;depois=null;
  const el=achar(quemSh)||(ST.hidden?q('#pxBody'):q('#stT'));if(f)f();else el.focus({preventScroll:true});
}
const fechar=()=>history.back();
window.addEventListener('popstate',e=>{
  if(!SH.hidden)return fecharSheet();
  if(!ST.hidden)return fecharStory();
  const s=e.state;if(!s)return;
  if(s.cc)return history.back();
  ir(s.v);
});

function filtro(){
  const base=daVez(st.v);
  return `<h2 id="shT" tabindex="-1">Quais fatos mostrar?</h2><p>Toque para ligar ou desligar cada tipo.</p><div class="pxmenu">${TIPOS.map(k=>`<button data-tipo="${k}" aria-pressed="${st.tipos.has(k)}"><span class="tfil"><i style="--c:${TIPO[k][1]}" aria-hidden="true"></i><span>${TIPO[k][0]}<small>${TIPO[k][2]} · ${plural(base.filter(f=>f.tipo===k).length,'fato')}</small></span></span><i class="chave" aria-hidden="true"></i></button>`).join('')}</div>${grupos(base)}<div class="fimbtn"><button data-todos="1">Mostrar todos</button><button class="prim" data-fechar="1">Pronto</button></div>`;
}
function grupos(base){
  const gs=Object.keys(G).map(k=>[k,base.filter(f=>f.g.includes(k)).length]).filter(x=>x[1]);
  return gs.length?`<h3 class="pxh">Para quem</h3><p>Só os fatos que a fonte diz que atingem o grupo, para o bem ou para o mal.</p><div class="pxmenu">${gs.map(([k,n])=>`<button data-grupo="${k}" aria-pressed="${st.g===k}"><span>${esc(G[k])}<small>${plural(n,'fato')}</small></span><i class="chave" aria-hidden="true"></i></button>`).join('')}</div>`:'';
}
function trocaGrupo(btn){
  st.g=st.g===btn.dataset.grupo?'':btn.dataset.grupo;
  SH.querySelectorAll('[data-grupo]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.grupo===st.g));render(true);refazStory();
}
function todos(){
  TIPOS.forEach(k=>st.tipos.add(k));st.g='';
  SH.querySelectorAll('[data-tipo]').forEach(b=>b.setAttribute('aria-pressed','true'));SH.querySelectorAll('[data-grupo]').forEach(b=>b.setAttribute('aria-pressed','false'));
  render(true);refazStory();say('Mostrando todos os tipos');
}
function trocaTipo(btn){
  const k=btn.dataset.tipo;
  if(st.tipos.has(k)&&st.tipos.size===1)return toast('Deixe pelo menos um tipo ligado.');
  st.tipos.has(k)?st.tipos.delete(k):st.tipos.add(k);
  btn.setAttribute('aria-pressed',st.tipos.has(k));render(true);refazStory();
}

function partilhar(){
  const f=S&&S.itens[S.i],base=location.origin+'/';
  const url=f?`${base}fato/${f.id}.html`:S&&S.t?`${base}#t=${S.t}${S.c!=='all'?'&c='+S.c:''}`:base+(st.v!=='ini'?'#v='+st.v+(st.c!=='all'?'&c='+st.c:''):'');
  const texto=f?`${f.tit}. Fato com fonte, no Conhecer Candidatos:`:'Fatos sobre Flávio e Lula, cada um com a fonte oficial:';
  if(navigator.share)return navigator.share({title:'Conhecer Candidatos',text:texto,url}).catch(()=>{});
  abrirSheet(`<h2 id="shT" tabindex="-1">Compartilhar</h2><p>${esc(texto)}</p><div class="pxpartilha"><a class="zap" href="https://wa.me/?text=${encodeURIComponent(texto+' '+url)}" target="_blank" rel="noopener">${IC.zap}WhatsApp</a><button data-copiar="${esc(url)}">${IC.copia}Copiar link</button></div>`);
}
function copiar(url){
  const ok=()=>{depois=()=>toast('Link copiado. É só colar na conversa.');fechar();};
  if(navigator.clipboard)navigator.clipboard.writeText(url).then(ok,()=>toast('Não deu para copiar. O link é '+url));else toast('O link é '+url);
}

function aplicar(){const h=document.documentElement;h.style.setProperty('--escala',PREF.escala);h.toggleAttribute('data-contraste',!!PREF.contraste);guardar('cc-acesso',PREF);}
function menu(){
  return `<h2 id="shT" tabindex="-1">Menu</h2><div class="pxmenu"><div class="linha"><span>Tamanho da letra</span><span class="letra"><button data-escala="-1" aria-label="Letra menor">A−</button><button data-escala="1" aria-label="Letra maior">A+</button></span></div><button data-pref="contraste" aria-pressed="${!!PREF.contraste}">Alto contraste<i class="chave" aria-hidden="true"></i></button><button data-pref="lista" aria-pressed="${!!PREF.lista}">Temas em lista<i class="chave" aria-hidden="true"></i></button>${'speechSynthesis' in window?`<button data-acao="ouvir">Ouvir esta tela ${IC.seta}</button>`:''}<button data-acao="libras">Libras ${IC.seta}</button><hr><a href="como-funciona.html">Como funciona ${IC.seta}</a><a href="o-que-mudou.html">O que mudou ${IC.seta}</a><a href="mailto:contato@conhecercandidatos.com.br">Contato<small>contato@conhecercandidatos.com.br</small></a></div>`;
}
function ouvir(){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance((ST.hidden?q('#pxBody'):CARD).innerText.slice(0,4000));u.lang='pt-BR';u.rate=.9;speechSynthesis.speak(u);}catch(e){}}
function libras(){if(window.VLibras){toast('O botão de Libras está no canto da tela.');return;}const w=document.createElement('div');w.setAttribute('vw','');w.className='enabled';w.innerHTML='<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';document.body.appendChild(w);const s=document.createElement('script');s.src='https://vlibras.gov.br/app/vlibras-plugin.js';s.onload=()=>{new window.VLibras.Widget('https://vlibras.gov.br/app');toast('Toque no botão azul de Libras, no canto da tela.');};document.body.appendChild(s);}
const ACOES={ouvir,libras};
function calar(){try{speechSynthesis.cancel();}catch(e){}}
function ouvirFato(){
  const f=S&&S.itens[S.i];if(!f)return;
  try{if(speechSynthesis.speaking)return calar();const u=new SpeechSynthesisUtterance(`${WHO[f.c]}. ${f.tit}. ${plain(f.txt)} Fonte: ${f.orgao}.`);u.lang='pt-BR';u.rate=.9;speechSynthesis.speak(u);}catch(e){toast('Este aparelho não consegue ler em voz alta.');}
}

root.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-tema]');if(!t)return;
  const d=t.dataset;
  if(t.id==='stNext')return avancar();
  if(t.id==='stPrev')return voltar();
  if(t.id==='stRes'){S.i=-1;return mostrar(-1);}
  if(t.id==='stClose'||d.fechar)return fechar();
  if(d.share)return partilhar();
  if(d.menu)return abrirSheet(menu());
  if(d.filtro)return abrirSheet(filtro());
  if(d.tipo)return trocaTipo(t);
  if(d.grupo)return trocaGrupo(t);
  if(d.todos)return todos();
  if(d.pular)return abrirSheet(pular());
  if(d.per){depois=()=>{const el=q('#per'+d.per);if(el){el.scrollIntoView({block:'start'});el.querySelector('button').focus({preventScroll:true});}};return fechar();}
  if(d.v)return ir(d.v,true);
  if(d.quem)return abrirTema('candidato',d.quem);
  if(d.para)return abrirSheet(para());
  if(d.escolhe){depois=()=>{st.para=d.escolhe;st.pi=0;POS.pro=0;st.v==='pro'?render():ir('pro',true);foca('#pxUmT');say('Mostrando assuntos ligados a '+G[st.para]);};return fechar();}
  if(d.tudo){st.para='';st.pi=0;render();return foca('#pxUmT');}
  if(d.um)return irPara(st.pi+ +d.um,`[data-um="${d.um}"]`);
  if(d.ouvirum)return ouvirUm();
  if(d.salto)return irPara(+d.salto,`[data-salto="${d.salto}"]`);
  if(d.ver){volta=S.itens[S.i]&&S.itens[S.i].id;const k=S.itens.findIndex(f=>f.id===d.ver);if(k>=0){S.i=k;return mostrar(1);}const f=F.find(x=>x.id===d.ver);return abrirTema(f.t,'all',f.id);}
  if(d.ouvir)return ouvirFato();
  if(d.sug){st.dq=d.sug;return render();}
  if(d.c){st.c=d.c;render();return say('Mostrando '+(st.c==='all'?'os dois':WHO[st.c]));}
  if(d.tema)return abrirTema(d.tema,'all');
  if(d.tl){const it=st.v==='tempo'?linhaTempo():F.filter(f=>f.id===d.tl);return abrir({itens:it,onde:'Linha do tempo',fim:false},it.findIndex(f=>f.id===d.tl));}
  if(d.busca)return abrir({itens:achadosFs,onde:'Busca',fim:false},+d.busca);
  if(d.ir){S.i=+d.ir;return mostrar(1);}
  if(d.aba){S.aba=d.aba;S.aberto={};S.mais={};return redesenha(`[data-aba="${d.aba}"]`);}
  if(d.sub){S.aberto[d.sub]=t.getAttribute('aria-expanded')!=='true';return redesenha(`[data-sub="${d.sub}"]`);}
  if(d.mais){S.mais[d.mais]=1;return redesenha(`[data-sub="${d.mais}"]`);}
  if(d.lista)return abrir({itens:todosFatos(),onde:'Todos os fatos',res:true,vistos:new Set(vistos)},-1);
  if(d.surpresa)return surpresa();
  if(d.term)return dica(t);
  if(d.outro)return abrirTema(S.t,d.outro);
  if(d.copiar)return copiar(d.copiar);
  if(d.acao){depois=ACOES[d.acao];return fechar();}
  if(d.escala){const k=ESCALAS.findIndex(x=>x>=PREF.escala);PREF.escala=ESCALAS[Math.max(0,Math.min(ESCALAS.length-1,k+ +d.escala))];aplicar();return say('Tamanho da letra mudou');}
  if(d.pref){PREF[d.pref]=!PREF[d.pref];aplicar();t.setAttribute('aria-pressed',PREF[d.pref]);if(d.pref==='lista')render(true);}
});
SCRIM.addEventListener('click',fechar);
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&(!SH.hidden||!ST.hidden))return fechar();
  const g=e.target.closest&&e.target.closest('.pxn');
  if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();return abrirTema(g.dataset.tema,'all');}
  if(!SH.hidden||e.target.closest('input')||!['ArrowRight','ArrowLeft'].includes(e.key))return;
  const dir=e.key==='ArrowRight'?1:-1;
  if(!ST.hidden)return dir>0?avancar():voltar();
  if(st.v==='pro')irPara(st.pi+dir);
});
let x0=null,y0=0,u0=null,v0=0;
q('#pxBody').addEventListener('touchstart',e=>{u0=e.touches[0].clientX;v0=e.touches[0].clientY;},{passive:true});
q('#pxBody').addEventListener('touchend',e=>{if(u0===null||st.v!=='pro')return;const dx=e.changedTouches[0].clientX-u0,dy=e.changedTouches[0].clientY-v0;u0=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)irPara(st.pi+(dx<0?1:-1));},{passive:true});
CARD.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY;},{passive:true});
CARD.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)(dx<0?avancar:voltar)();},{passive:true});

function rota(){
  const h=new URLSearchParams(location.hash.slice(1)),v=k=>(h.get(k)||'').match(/^[\w-]*/)[0];
  const c=['F','L'].includes(v('c'))?v('c'):'all';
  const s0=history.state||{};
  st.v=VIEWS[v('v')]?v('v'):VIEWS[s0.v]?s0.v:'ini';
  if(st.v==='tempo')st.c=c;
  history.replaceState({v:st.v},'',location.pathname+location.search);
  render();
  const id=v('f'),f=F.find(x=>x.id===id);
  if(id&&!f){toast('Esse fato saiu do site. Veja o motivo em Menu, O que mudou.');return false;}
  if(f){f.t&&f.c!=='BR'?abrirTema(f.t,c===f.c?c:'all',f.id):abrir({itens:[f],onde:'Linha do tempo',fim:false},0);return true;}
  if(TEMAS[v('t')]){abrirTema(v('t'),c);return true;}
  return false;
}
q('#pxConf').textContent='Atualizado em '+quando(D.conferido);
aplicar();
rota();
})();
