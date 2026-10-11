(function(){
const D=window.DADOS;
const root=document.getElementById('px');
const q=s=>root.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TEMAS={},CURTO={},GOV={};
Object.entries(D.temas).forEach(([k,v])=>{TEMAS[k]=v.nome;CURTO[k]=v.curto;GOV[k]=v.governo;});
const ORDEM=Object.keys(TEMAS);
const MS={L:['l1','l2','l3'],F:['b']};
const WHO={F:'Flávio',L:'Lula',BR:'Brasil'};
const MANDATO={b:'governo Bolsonaro',l1:'1º mandato',l2:'2º mandato',l3:'3º mandato'};
const TIPO={pos:['Positivo','var(--dot-pos)'],neg:['Problema','var(--dot-neg)'],pol:['Polêmico','var(--dot-mid)'],ctx:['Contexto','var(--dot-info)'],pro:['Promessa','var(--dot-neu)']};
const TERMS=D.termos;
function mandOf(c,d,t){if(!t||c==='BR'||!GOV[t])return null;const y=+d.slice(0,4);if(c==='L')return y<=2006?'l1':y<=2010?'l2':y>=2023?'l3':null;return y>=2019&&y<=2022?'b':null;}
const F=D.fatos.map(f=>({...f,m:mandOf(f.c,f.d,f.t)})).sort((a,b)=>a.d.localeCompare(b.d));
const st={c:'all',v:'mapa',dq:''};
const ler=(k,p)=>{try{return JSON.parse(localStorage.getItem(k))||p;}catch(e){return p;}};
const guardar=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
const vistos=new Set(ler('cc-vistos',[]));
const PREF=Object.assign({escala:1,contraste:false,lista:false},ler('cc-acesso',{}));
const ESCALAS=[0.9,1,1.15,1.3,1.5];
const svgI=p=>`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const IC={seta:svgI('<path d="m9 18 6-6-6-6"/>'),brilho:svgI('<path d="M12 3l1.9 5.8L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.2Z"/><path d="M19 17v4M17 19h4"/>'),doc:svgI('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h6"/><path d="M8 13h8M8 17h5"/>'),sai:svgI('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),zap:svgI('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),copia:svgI('<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>')};

const sgn=v=>(v>0?'+':v<0?'−':'')+Math.abs(v).toFixed(1).replace('.',',');
function score(c,t){
  const fs=F.filter(f=>f.c===c&&f.t===t&&f.w);
  if(!GOV[t])return {v:fs.reduce((a,f)=>a+f.w,0),n:fs.length,gov:false};
  const per={};fs.filter(f=>f.m).forEach(f=>{per[f.m]=(per[f.m]||0)+f.w;});
  const got=MS[c].filter(m=>m in per);
  return {v:got.length?got.reduce((a,m)=>a+per[m],0)/got.length:0,n:got.length,tot:MS[c].length,gov:true};
}
const nota=sc=>sc.n?sgn(sc.v):'sem fatos';
function rich(s){return esc(s).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,k,d)=>{const key=k.toLowerCase();return TERMS[key]?`<button class="pxterm" data-term="${esc(key)}">${d||k}</button>`:(d||k);});}
const plain=s=>String(s).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,k,d)=>d||k);
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function mes(d){const M=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];return d.length<7?d:(d.length>7?+d.slice(8,10)+' ':'')+M[+d.slice(5,7)-1]+' '+d.slice(0,4);}
function quando(iso){return new Date(iso).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}).replace(/\./g,'');}
const say=t=>{q('#pxSR').textContent=t;};
function toast(m){const el=q('#pxToast');el.textContent=m;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{el.hidden=true;},5000);}
const plural=(n,s)=>`${n} ${s}${n===1?'':'s'}`;

function doTema(t,c){
  const ord=(a,b)=>Math.abs(b.w)-Math.abs(a.w)||b.d.localeCompare(a.d);
  const por=x=>F.filter(f=>f.c===x&&f.t===t).sort(ord);
  if(c!=='all')return por(c);
  const [a,b]=ORDEM.indexOf(t)%2?[por('L'),por('F')]:[por('F'),por('L')];
  const out=[];for(let i=0;i<Math.max(a.length,b.length);i++){if(a[i])out.push(a[i]);if(b[i])out.push(b[i]);}
  return out;
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
function vMapa(){
  const rs=temas(),fs=F.filter(f=>f.t&&(st.c==='all'||f.c===st.c)),vi=fs.filter(f=>vistos.has(f.id)).length;
  const corpo=PREF.lista?rs.map(r=>`<button class="pxrow" data-tema="${r.t}"><span class="tx"><b>${esc(TEMAS[r.t])}</b><small>${resumo(r)}</small></span>${IC.seta}</button>`).join(''):constelacao(rs);
  return `<p class="pxhint">Toque num tema para ver os fatos</p>${corpo}<div class="pxacao"><button class="pxsurpresa" data-surpresa="1">${IC.brilho}Fato surpresa</button>${fs.length?`<p class="pxvistos"><i aria-hidden="true"><b style="width:${Math.round(vi/fs.length*100)}%"></b></i>Você já viu ${vi} de ${fs.length} fatos</p>`:''}</div>`;
}
function vCmp(){
  const x=v=>((Math.max(-6,Math.min(6,v))+6)/12*100).toFixed(1)+'%';
  return `<p class="pxhint">Onde cada um fica em cada tema</p><p class="pxleg" aria-hidden="true"><span>← pior</span><span><span class="quem F">F</span>Flávio <span class="quem L">L</span>Lula</span><span>melhor →</span></p>`+ORDEM.map(t=>{const a=score('F',t),b=score('L',t);return `<button class="pxrow pxcrow" data-cmp="${t}" aria-label="${esc(TEMAS[t])}: Flávio ${nota(a)}, Lula ${nota(b)}"><b>${esc(TEMAS[t])}</b><span class="pxtrack"><span class="quem F${a.n?'':' nf'}" style="--x:${x(a.v)}">F</span><span class="quem L${b.n?'':' nf'}" style="--x:${x(b.v)}">L</span></span><small>Flávio ${nota(a)} · Lula ${nota(b)}</small></button>`;}).join('');
}
const PER=[['Antes de 2003',0,2002],['2003 a 2010 · Lula 1 e 2',2003,2010],['2011 a 2018 · Dilma e Temer',2011,2018],['2019 a 2022 · Bolsonaro',2019,2022],['2023 a 2026 · Lula 3',2023,2026]];
const linhaTempo=()=>F.filter(f=>f.c==='BR'||st.c==='all'||f.c===st.c);
function linha(f,attr){return `<li><button class="pxrow" ${attr}><span class="quem ${f.c}">${f.c}</span><span class="tx"><span class="${f.mk?'marco':''}">${esc(f.tit)}</span><small>${mes(f.d)}</small></span></button></li>`;}
function vTempo(){
  const it=linhaTempo();
  return PER.map(p=>{const fs=it.filter(f=>{const y=+f.d.slice(0,4);return y>=p[1]&&y<=p[2];});return fs.length?`<h2 class="pxper">${p[0]}</h2><ul class="pxtl">${fs.map(f=>linha(f,`data-tl="${f.id}"`)).join('')}</ul>`:'';}).join('')||'<p class="pxhint">Ainda não há fatos.</p>';
}
let achadosFs=[];
function achados(){
  const qn=norm(st.dq.trim());
  achadosFs=qn.length>1?F.filter(f=>norm(f.tit+' '+plain(f.txt)).includes(qn)).slice(0,30):[];
  const ks=Object.keys(TERMS).filter(k=>!qn||norm(TERMS[k][0]+' '+plain(TERMS[k][1])).includes(qn)).sort((a,b)=>TERMS[a][0].localeCompare(TERMS[b][0],'pt'));
  return (achadosFs.length?`<h2 class="pxh">Fatos</h2><ul class="pxtl">${achadosFs.map((f,i)=>linha(f,`data-busca="${i}"`)).join('')}</ul>`:'')+(ks.length?`<h2 class="pxh">${qn?'Palavras':'Palavras explicadas'}</h2>`+ks.map(k=>`<div class="pxrow"><span class="tx"><b>${esc(TERMS[k][0])}</b><small>${esc(plain(TERMS[k][1]))}</small></span></div>`).join(''):'')||'<p class="pxhint">Nada encontrado. Tente outra palavra.</p>';
}
const vDic=()=>`<input class="pxsearch" id="pxDq" type="search" placeholder="Buscar palavra ou assunto" value="${esc(st.dq)}" aria-label="Buscar palavras e fatos" autocomplete="off"><div id="pxDl" aria-live="polite">${achados()}</div>`;
const VIEWS={mapa:[vMapa,'os temas'],cmp:[vCmp,'a comparação'],tempo:[vTempo,'a linha do tempo'],dic:[vDic,'a busca']};
function render(manter){
  const b=q('#pxBody'),y=b.scrollTop;
  b.innerHTML=VIEWS[st.v][0]();b.scrollTop=manter?y:0;
  root.querySelectorAll('.pxnav button').forEach(x=>x.setAttribute('aria-current',x.dataset.v===st.v));
  root.querySelectorAll('.pxseg button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.c===st.c));
  q('.pxseg').hidden=st.v==='cmp'||st.v==='dic';
  const di=q('#pxDq');if(di)di.addEventListener('input',e=>{st.dq=e.target.value;q('#pxDl').innerHTML=achados();});
}

const ST=q('#story'),CARD=q('#stCard'),SH=q('#pxSheet'),SCRIM=q('#pxScrim');
let S=null,quem=null,quemSh=null,depois=null;
function travar(){const sheet=!SH.hidden,story=!ST.hidden;['.pxhead','#pxBody','.pxnav'].forEach(s=>{q(s).inert=sheet||story;});ST.inert=sheet;}
function abrir(s,i){
  if(ST.hidden){quem=document.activeElement;history.pushState({cc:1},'');}
  S=s;S.i=Math.max(0,i);ST.hidden=false;travar();mostrar(1);
}
function abrirTema(t,c,id){
  const fs=doTema(t,c),k=id?fs.findIndex(f=>f.id===id):fs.findIndex(f=>!vistos.has(f.id));
  abrir({itens:fs,t,c,onde:`${c==='all'?'Os dois':WHO[c]} · ${TEMAS[t]}`,fim:true},k);
}
function proximoTema(){
  const k=ORDEM.indexOf(S.t);if(k<0)return null;
  const seq=ORDEM.slice(k+1).concat(ORDEM.slice(0,k));
  return seq.find(t=>doTema(t,S.c).some(f=>!vistos.has(f.id)))||seq.find(t=>doTema(t,S.c).length)||null;
}
function erro(f){return `mailto:contato@conhecercandidatos.com.br?subject=${encodeURIComponent('Apontar erro: '+f.id)}&body=${encodeURIComponent('Fato: '+f.tit+'\nO que está errado:\n')}`;}
function cartao(f){
  const tp=TIPO[f.tipo],valor=f.c==='BR'?'marco do Brasil':f.w>0?`+${f.w} na nota`:f.w<0?`−${-f.w} na nota`:'não muda a nota';
  return `<p class="stmeta"><span class="quem ${f.c}">${f.c}</span><span><b>${WHO[f.c]}</b>${f.m?' · '+MANDATO[f.m]:''} · ${mes(f.d)}</span></p><h2 id="stT" tabindex="-1">${esc(f.tit)}</h2><p class="txt">${rich(f.txt)}</p><p class="tipo" style="--c:${tp[1]}"><i aria-hidden="true"></i>${tp[0]}<small>· ${valor}</small></p><a class="fonte" href="${esc(f.link)}" target="_blank" rel="noopener">${IC.doc}<span>Ver a fonte<small>${esc(f.orgao)}${f.doc?', '+esc(f.doc):''}</small></span>${IC.sai}</a>${f.fontes.length?`<p class="stextra"><span>Também em ${f.fontes.map(x=>`<a href="${esc(x[1])}" target="_blank" rel="noopener">${esc(x[0])}</a>`).join(', ')}</span></p>`:''}<p class="stextra"><span>Conferido em ${esc(f.conf)}</span><a href="${erro(f)}">Apontar erro</a></p>`;
}
function fim(){
  const t=S.t,cs=S.c==='all'?['F','L']:[S.c],outro=S.c==='F'?'L':S.c==='L'?'F':null,tudo=S.itens.length&&S.itens.every(f=>vistos.has(f.id));
  const linhas=cs.map(c=>{const sc=score(c,t),n=F.filter(f=>f.c===c&&f.t===t).length;return `<div><span class="quem ${c}">${c}</span><span><b>${WHO[c]}</b><small>${n?plural(n,'fato'):'sem fatos ainda'}</small></span><em>${sc.n?sgn(sc.v):'—'}</em></div>`;}).join('');
  return `<div class="fim"><p class="stmeta">${tudo?'Você viu todos os fatos deste tema':'Resumo'}</p><h2 id="stT" tabindex="-1">${esc(TEMAS[t])}: a nota</h2>${S.itens.length?'':'<p class="stleg">Ainda não há fatos aqui. O robô procura essa lacuna primeiro.</p>'}<div class="nota">${linhas}</div><p class="stleg">Fato positivo soma, problema tira. A mesma régua vale para os dois. <a href="como-funciona.html">Como funciona</a></p><div class="fimbtn">${outro?`<button data-outro="${outro}">Ver ${WHO[outro]} neste tema ${IC.seta}</button>`:''}<button data-fechar="1">Voltar aos temas ${IC.seta}</button></div></div>`;
}
function mostrar(dir){
  const n=S.itens.length,tot=n+(S.fim?1:0),f=S.itens[S.i];
  q('#stWhere').textContent=S.onde;
  q('#stBars').innerHTML=tot>20?`<i><b style="width:${((S.i+1)/tot*100).toFixed(1)}%"></b></i>`:Array.from({length:tot},(_,k)=>`<i class="${k<S.i?'on':k===S.i?'agora':''}"></i>`).join('');
  CARD.classList.toggle('volta',dir<0);
  CARD.innerHTML=f?cartao(f):fim();CARD.scrollTop=0;
  if(f){vistos.add(f.id);guardar('cc-vistos',[...vistos]);}
  q('#stPrev').disabled=S.i===0;
  const prox=!f&&proximoTema();
  q('#stNext').textContent=f?(S.i<n-1?'Próximo':S.fim?'Ver o resumo':'Fechar'):prox?'Próximo: '+CURTO[prox]:'Fechar';
  say(f?`Fato ${S.i+1} de ${n}`:'Resumo do tema');
  q('#stT').focus({preventScroll:true});
}
function avancar(){
  const n=S.itens.length;
  if(S.i<n-1||(S.fim&&S.i===n-1)){S.i++;return mostrar(1);}
  const t=S.fim&&proximoTema();
  if(t)return abrirTema(t,S.c);
  fechar();
}
function voltar(){if(S.i>0){S.i--;mostrar(-1);}}
function fecharStory(){
  const t=S&&S.t;ST.hidden=true;S=null;travar();
  if(st.v==='mapa'){render(true);const el=t&&q(`[data-tema="${t}"]`);if(el)el.focus({preventScroll:true});}
  else if(quem&&document.contains(quem))quem.focus({preventScroll:true});
  if(!tourVisto&&TR.hidden)abrirTour();
}
function dica(btn){
  const k=btn.dataset.term,t=TERMS[k],velha=CARD.querySelector('.dica');
  if(velha){velha.remove();if(velha.dataset.k===k)return;}
  const d=document.createElement('p');d.className='dica';d.dataset.k=k;d.setAttribute('role','status');
  d.innerHTML=`<b>${esc(t[0])}</b>${esc(plain(t[1]))}`;btn.closest('p').after(d);
}
function surpresa(){
  const cs=(st.c==='all'?['F','L']:[st.c]).map(c=>[c,F.filter(f=>f.c===c&&f.t&&vistos.has(f.id)).length]).sort((a,b)=>a[1]-b[1]||Math.random()-.5).map(x=>x[0]);
  const sorteia=p=>p[Math.floor(Math.random()*p.length)];
  for(const c of cs){const p=F.filter(f=>f.c===c&&f.t&&!vistos.has(f.id));if(p.length){const f=sorteia(p);return abrirTema(f.t,st.c,f.id);}}
  const p=F.filter(f=>f.t&&cs.includes(f.c));
  if(p.length){const f=sorteia(p);abrirTema(f.t,st.c,f.id);}
}

function abrirSheet(html){
  if(SH.hidden){quemSh=document.activeElement;history.pushState({cc:1},'');}
  q('#pxShB').innerHTML=html;SH.hidden=false;SCRIM.hidden=false;travar();q('#pxShB').scrollTop=0;q('#shT').focus({preventScroll:true});
}
function fecharSheet(){
  SH.hidden=true;SCRIM.hidden=true;travar();
  const f=depois;depois=null;
  if(f)f();else if(quemSh&&document.contains(quemSh))quemSh.focus({preventScroll:true});
}
const fechar=()=>history.back();
window.addEventListener('popstate',()=>{if(!SH.hidden)fecharSheet();else if(!ST.hidden)fecharStory();});

function partilhar(){
  const f=S&&S.itens[S.i],base=location.origin+'/';
  const url=f?`${base}fato/${f.id}.html`:S&&S.t?`${base}#t=${S.t}${S.c!=='all'?'&c='+S.c:''}`:base+(st.v!=='mapa'?'#v='+st.v:st.c!=='all'?'#c='+st.c:'');
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
  return `<h2 id="shT" tabindex="-1">Menu</h2><div class="pxmenu"><button data-acao="tour">Como usar ${IC.seta}</button><div class="linha"><span>Tamanho da letra</span><span class="letra"><button data-escala="-1" aria-label="Letra menor">A−</button><button data-escala="1" aria-label="Letra maior">A+</button></span></div><button data-pref="contraste" aria-pressed="${!!PREF.contraste}">Alto contraste<i class="chave" aria-hidden="true"></i></button><button data-pref="lista" aria-pressed="${!!PREF.lista}">Temas em lista<i class="chave" aria-hidden="true"></i></button>${'speechSynthesis' in window?`<button data-acao="ouvir">Ouvir esta tela ${IC.seta}</button>`:''}<button data-acao="libras">Libras ${IC.seta}</button><hr><a href="como-funciona.html">Como funciona ${IC.seta}</a><a href="o-que-mudou.html">O que mudou ${IC.seta}</a><a href="mailto:contato@conhecercandidatos.com.br">Contato<small>contato@conhecercandidatos.com.br</small></a></div>`;
}
function ouvir(){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance((ST.hidden?q('#pxBody'):CARD).innerText.slice(0,4000));u.lang='pt-BR';u.rate=.9;speechSynthesis.speak(u);}catch(e){}}
function libras(){if(window.VLibras){toast('O botão de Libras está no canto da tela.');return;}const w=document.createElement('div');w.setAttribute('vw','');w.className='enabled';w.innerHTML='<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';document.body.appendChild(w);const s=document.createElement('script');s.src='https://vlibras.gov.br/app/vlibras-plugin.js';s.onload=()=>{new window.VLibras.Widget('https://vlibras.gov.br/app');toast('Toque no botão azul de Libras, no canto da tela.');};document.body.appendChild(s);}
const ACOES={tour:()=>abrirTour(),ouvir,libras};

const TR=q('#tour');let ti=0,tourVisto=false;
try{tourVisto=localStorage.getItem('cc-passeio-visto')==='1';}catch(e){}
const TS=[
 {t:'Bem-vindo!',x:'Aqui você vê fatos sobre Flávio e Lula, um de cada vez, cada um com a fonte de onde veio.'},
 {t:'Toque num tema',x:'Os fatos abrem um por vez. Toque em Próximo ou passe o dedo para o lado. Cada estrela acende quando você vê todos os fatos dela.',el:()=>q('.pxconst')||q('#pxBody')},
 {t:'Compartilhe',x:'Achou algo importante? Este botão manda para quem você quiser, de qualquer tela.',el:()=>q('#pxShare')}
];
function lugar(){
  if(TR.hidden)return;
  const s=TS[ti],el=s.el&&s.el(),sp=q('#tSpot'),card=q('#tCard'),R=root.getBoundingClientRect(),bx=R.left+root.clientLeft,ph=root.clientHeight;
  let r={x:root.clientWidth/2,y:ph/2,w:0,h:0};
  if(el){const b=el.getBoundingClientRect();r={x:b.left-bx-6,y:Math.max(0,b.top-R.top-6),w:b.width+12,h:Math.min(b.height+12,ph)};}
  sp.classList.toggle('none',!el);
  Object.assign(sp.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});
  const ch=card.offsetHeight;
  card.style.top=Math.max(8,!r.w?(ph-ch)/2:r.y+r.h+12+ch<=ph-8?r.y+r.h+12:r.y-12-ch>=8?r.y-12-ch:8)+'px';
}
function tPasso(){
  const s=TS[ti];
  q('#tDots').innerHTML=TS.map((x,i)=>`<i class="${i<=ti?'on':''}"></i>`).join('');
  q('#tT').textContent=s.t;q('#tX').textContent=s.x;
  q('#tNext').textContent=ti===TS.length-1?'Começar':'Próximo';
  q('#tSkip').hidden=ti===TS.length-1;
  requestAnimationFrame(()=>{lugar();q('#tT').focus({preventScroll:true});});
}
function abrirTour(){if(st.v!=='mapa'){st.v='mapa';render();}ti=0;TR.hidden=false;tPasso();}
function fecharTour(){TR.hidden=true;tourVisto=true;try{localStorage.setItem('cc-passeio-visto','1');}catch(e){}toast('Para rever o passeio: Menu, depois Como usar.');q('#pxBody').focus({preventScroll:true});}

root.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-tema]');if(!t)return;
  const d=t.dataset;
  if(t.id==='tSkip')return fecharTour();
  if(t.id==='tNext'){if(ti===TS.length-1)return fecharTour();ti++;return tPasso();}
  if(t.id==='stNext')return avancar();
  if(t.id==='stPrev')return voltar();
  if(t.id==='stClose'||d.fechar)return fechar();
  if(d.share)return partilhar();
  if(d.menu)return abrirSheet(menu());
  if(d.v){st.v=d.v;render();return say('Mostrando '+VIEWS[st.v][1]);}
  if(d.c){st.c=d.c;render();return say('Mostrando '+(st.c==='all'?'os dois':WHO[st.c]));}
  if(d.tema)return abrirTema(d.tema,st.c);
  if(d.cmp)return abrirTema(d.cmp,'all');
  if(d.tl){const it=linhaTempo();return abrir({itens:it,onde:'Linha do tempo',fim:false},it.findIndex(f=>f.id===d.tl));}
  if(d.busca)return abrir({itens:achadosFs,onde:'Busca',fim:false},+d.busca);
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
  if(e.key==='Escape'){if(!TR.hidden)return fecharTour();if(!SH.hidden||!ST.hidden)return fechar();}
  const g=e.target.closest&&e.target.closest('.pxn');
  if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();return abrirTema(g.dataset.tema,st.c);}
  if(!ST.hidden&&SH.hidden&&TR.hidden&&!e.target.closest('input')){if(e.key==='ArrowRight')avancar();if(e.key==='ArrowLeft')voltar();}
});
let x0=null,y0=0;
CARD.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY;},{passive:true});
CARD.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)(dx<0?avancar:voltar)();},{passive:true});
window.addEventListener('resize',lugar);

function rota(){
  const h=new URLSearchParams(location.hash.slice(1));
  if(!location.hash)return false;
  history.replaceState(null,'',location.pathname+location.search);
  if(['F','L'].includes(h.get('c')))st.c=h.get('c');
  if(VIEWS[h.get('v')])st.v=h.get('v');
  render();
  const id=h.get('f'),f=F.find(x=>x.id===id);
  if(id&&!f){toast('Esse fato saiu do site. Veja o motivo em Menu, O que mudou.');return false;}
  if(f){f.t?abrirTema(f.t,st.c==='all'||st.c===f.c?st.c:'all',f.id):abrir({itens:[f],onde:'Linha do tempo',fim:false},0);return true;}
  if(TEMAS[h.get('t')]){abrirTema(h.get('t'),st.c);return true;}
  return false;
}
q('#pxConf').textContent='Conferido em '+quando(D.conferido);
aplicar();render();
if(!rota()&&!tourVisto)abrirTour();
})();
