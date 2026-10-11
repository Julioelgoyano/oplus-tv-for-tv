// O-PLUS TV · modo Smart TV (proyector HY300 con control remoto infrarrojo)
// El control remoto llega como teclas de Android: la parte nativa (MainActivity) las manda aquí como evento "tvkey";
// con un teclado (o en el navegador) funcionan las mismas acciones por el evento normal "keydown".
(()=>{
const g=id=>document.getElementById(id),P=(window.Capacitor&&Capacitor.Plugins)||{};
const de=document.documentElement,sc=document.querySelector(".screen"),aside=document.querySelector("aside");
const h=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
const btn=(cls,html,fn)=>{const b=h("button",cls);b.innerHTML=html;b.onclick=fn;return b};
const store2={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};

let ui="",uiT=0,lastBack=0;   // ui: "", "list", "menu", "guide", "help", "test"
const v2=g("v");

/* ========== Banner de canal ========== */
const bn=h("div");bn.id="tvbanner";
bn.innerHTML='<div class="bn-num"></div><span class="logo"></span><div class="bn-txt"><div class="bn-name"></div><div class="bn-now"></div><div class="bn-bar"><i></i></div><div class="bn-next"></div></div><div class="bn-tags"></div>';
document.body.append(bn);
const bq=s=>bn.querySelector(s);let bnT=0;
function fillBanner(){
  const c=all()[cur];if(!c)return;
  const [p,nx]=nowNext(c);
  bq(".bn-num").textContent=cur+1;
  const old=bq(".logo"),l=h("span","logo");l.textContent=c.n.slice(0,2).toUpperCase();l.style.background=okColor(c.color)||"linear-gradient(135deg,#1b4a6b,#163959)";logoImg(l,c);old.replaceWith(l);
  bq(".bn-name").textContent=c.n;
  bq(".bn-now").textContent=p?("Ahora: "+p.t+"  ·  "+hm(p.s)+" – "+hm(p.e)):(c.c||"");
  bq(".bn-bar").style.display=p?"":"none";if(p)bq(".bn-bar i").style.width=pct(p);
  bq(".bn-next").textContent=nx?("Después: "+nx.t+" · "+hm(nx.s)):"";
  const tg=bq(".bn-tags");tg.textContent="";
  if(favs.includes(c.u))tg.append(h("span","bn-tag fav","★ Favorito"));
  if(c.live)tg.append(h("span","bn-tag","EN VIVO"));
  tg.append(h("div","bn-hint","OK lista · ↑↓ cambiar canal · → menú"));
}
function showBanner(ms){if(ui)return;try{fillBanner()}catch{}bn.classList.add("show");clearTimeout(bnT);bnT=setTimeout(()=>bn.classList.remove("show"),ms||5000)}
function hideBanner(){clearTimeout(bnT);bn.classList.remove("show")}

// Al cambiar de canal (flechas, números, lista, guía) siempre aparece el banner.
const _play=window.play;
window.play=function(){const r=_play.apply(this,arguments);showBanner();return r};
const _nb=window.nowBox;
window.nowBox=function(){const r=_nb.apply(this,arguments);if(bn.classList.contains("show"))try{fillBanner()}catch{};return r};

// Al volver a dibujar la lista o las categorías, el foco se queda donde estaba (si no, el control "se pierde").
function keepFocus(name,box,sel){
  const orig=window[name];
  window[name]=function(){
    const b=box(),ae=document.activeElement;let st=null;
    if(b&&ae&&b.contains(ae)){const it=[].slice.call(b.querySelectorAll(sel));st={i:it.indexOf(ae),t:ae.textContent}}
    const r=orig.apply(this,arguments);
    if(st&&st.i>=0){
      const it=[].slice.call(b.querySelectorAll(sel));let el=null;
      if(sel===".chip")el=it.filter(x=>x.textContent===st.t)[0];
      el=el||it[Math.min(st.i,it.length-1)];
      if(el)el.focus({preventScroll:true});
    }
    return r;
  };
}
keepFocus("drawList",()=>g("list"),".ch,.fav");
keepFocus("drawChips",()=>g("chips"),".chip");

/* ========== Paneles ========== */
// Menú rápido
const menu=h("div");menu.id="tvmenu";menu.innerHTML="<h2>O-PLUS<sup>TV</sup></h2>";document.body.append(menu);
const mItems={};
function mBtn(key,fn){const b=btn("tvbtn","",fn);mItems[key]=b;menu.append(b);return b}
mBtn("list",()=>openUi("list"));
mBtn("guide",()=>openUi("guide"));
mBtn("fav",()=>{toggleFav();refreshMenu()});
mBtn("qual",()=>{cycleQual();refreshMenu()});
mBtn("fit",()=>{cycleFit();refreshMenu()});
mBtn("mute",()=>{v2.muted=!v2.muted;refreshMenu()});
mBtn("retry",()=>{closeUi();play(cur)});
mBtn("help",()=>openUi("help"));
mBtn("test",()=>openUi("test"));
mBtn("exit",()=>{if(P.App)P.App.exitApp()});
function setLbl(k,t,s){mItems[k].innerHTML=t+(s?"<small>"+s+"</small>":"")}
function refreshMenu(){
  const c=all()[cur],q=g("qual");
  const ql=q.options.length>1?q.options[q.selectedIndex].text.replace("Calidad: ",""):"Auto";
  setLbl("list","Canales");
  setLbl("guide","Guía de programación");
  setLbl("fav",c&&favs.includes(c.u)?"★ Quitar de favoritos":"☆ Agregar a favoritos");
  setLbl("qual","Calidad: "+ql);
  setLbl("fit","Imagen: "+FITS[fit][1].split(" (")[0]);
  setLbl("mute","Sonido: "+(v2.muted?"silenciado":"activado"));
  setLbl("retry","Reiniciar canal");
  setLbl("help","Ayuda del control remoto");
  setLbl("test","Probar control remoto");
  setLbl("exit","Salir de la app");
}

// Tamaño de imagen (útil en proyector: ajustar / llenar / estirar)
const FITS=[["contain","Ajustar (se ve completo)"],["cover","Llenar (recorta los bordes)"],["fill","Estirar (deforma)"]];
let fit=store2.get("op_tv_fit",0);if(!(fit>=0&&fit<FITS.length))fit=0;
function applyFit(){FITS.forEach((f,i)=>sc.classList.toggle("fit-"+f[0],i===fit))}
function cycleFit(){fit=(fit+1)%FITS.length;store2.set("op_tv_fit",fit);applyFit();toast("Imagen: "+FITS[fit][1].split(" (")[0])}
applyFit();
function cycleQual(){
  const q=g("qual");if(q.options.length<2){toast("Este canal no ofrece varias calidades");return}
  q.selectedIndex=(q.selectedIndex+1)%q.options.length;q.dispatchEvent(new Event("change"));
}
function toggleFav(){
  const c=all()[cur];if(!c)return;
  favs=favs.includes(c.u)?favs.filter(x=>x!==c.u):favs.concat([c.u]);store.set("op_favs",favs);
  toast(favs.includes(c.u)?"★ Agregado a favoritos":"Quitado de favoritos");drawList();fillBannerSafe();
}
const fillBannerSafe=()=>{if(bn.classList.contains("show"))try{fillBanner()}catch{}};

// Guía de programación (vertical, fácil de recorrer con flechas)
const gd=h("div");gd.id="tvguide";
gd.innerHTML='<div class="tvg-list"><h2 class="tvg-title">Guía<sup>TV</sup></h2><div class="tvg-rows"></div></div><div class="tvg-detail"></div><div class="tvg-foot">↑↓ elegir canal · OK ver el canal · ATRÁS cerrar</div>';
document.body.append(gd);
const gRows=gd.querySelector(".tvg-rows"),gDet=gd.querySelector(".tvg-detail");
function buildGuide(){
  gRows.textContent="";
  all().forEach((c,i)=>{
    const b=h("button","tvg-row"+(i===cur?" cur":""));b.dataset.i=i;
    const p=nowNext(c)[0];
    b.innerHTML='<span class="n"></span><span class="t"><b></b><small></small></span>';
    b.querySelector(".n").textContent=i+1;b.querySelector("b").textContent=c.n;
    b.querySelector("small").textContent=p?p.t:(c.c||"");
    b.onclick=()=>{closeUi();play(i)};
    gRows.append(b);
  });
}
function fillGuide(i){
  const c=all()[i];if(!c)return;gDet.textContent="";
  gDet.append(h("h3",null,c.n),h("div","cat",(c.c||"")+(c.live?" · En vivo":"")));
  const a=progs(c),[p,nx]=nowNext(c);
  if(!a||(!p&&!nx)){gDet.append(h("div","tvg-empty",guideMsg(c)||"Este canal no tiene guía de programación."));return}
  if(p){
    const n=h("div","tvg-now");
    n.append(h("div","l","AHORA"),h("div","p",p.t),h("div","h",hm(p.s)+" – "+hm(p.e)));
    const bar=h("div","bar"),bi=h("i");bi.style.width=pct(p);bar.append(bi);n.append(bar);
    if(p.d)n.append(h("div","d",p.d));
    gDet.append(n);
  }
  const t=Date.now();let k=0;
  a.filter(x=>x.s>t).slice(0,7).forEach(x=>{const r=h("div","tvg-next");r.append(h("span","h",hm(x.s)),h("span","p",x.t));gDet.append(r);k++});
}
gRows.addEventListener("focusin",e=>{const r=e.target.closest&&e.target.closest(".tvg-row");if(r)fillGuide(+r.dataset.i)});

// Ayuda
const help=h("div");help.id="tvhelp";
help.innerHTML='<div class="box"><h2>Control remoto</h2>'+[
 ["OK / ←","Abrir la lista de canales"],["↑ / ↓","Canal anterior / siguiente"],["→  o  MENÚ","Menú rápido (calidad, imagen, favoritos...)"],
 ["CH+ / CH−","Canal siguiente / anterior (si tu control los tiene)"],["Números","Ir directo a un canal (ej. 12)"],["INFO","Ver datos del canal y del programa"],
 ["GUÍA","Guía de programación"],["Amarillo","Agregar / quitar favorito"],["ATRÁS","Cerrar paneles · 2 veces seguidas = salir"],["Volumen","Lo maneja el proyector"]
].map(r=>'<div class="row"><b>'+r[0]+'</b><span>'+r[1]+'</span></div>').join("")+'<div class="ok"></div></div>';
document.body.append(help);
help.querySelector(".ok").append(btn("tvbtn","Entendido",()=>openUi("menu")));

// Prueba del control remoto: muestra el código de cada tecla (sirve para saber qué manda cada botón de TU control)
const tt=h("div");tt.id="tvtest";
tt.innerHTML='<div class="box"><h2>Probar control remoto</h2><div class="sub">Presiona cualquier botón del control</div><div class="big">—</div><div class="sub code"></div><div class="note">Aquí no se ejecuta ninguna acción.<br>Para salir presiona ATRÁS.</div></div>';
document.body.append(tt);
window.__rk=(code,name)=>{if(ui!=="test")return;showRaw(String(name).replace("KEYCODE_",""),code)};
function showRaw(name,code){tt.querySelector(".big").textContent=name;tt.querySelector(".code").textContent="código "+code}

/* ========== Abrir / cerrar ========== */
const panels={list:aside,menu:menu,guide:gd,help:help,test:tt};
function openUi(name){
  if(!g("mant").hidden)return;
  Object.keys(panels).forEach(k=>panels[k].classList.remove("open"));
  hideBanner();ui=name;panels[name].classList.add("open");
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
  if(name==="list"){drawChips();drawList();const c=g("list").querySelector('.ch[aria-current="true"]')||g("list").querySelector(".ch");focusEl(c||aside.querySelector(".chip"),"center")}
  else if(name==="menu"){refreshMenu();focusEl(mItems.list)}
  else if(name==="guide"){buildGuide();const r=gRows.querySelector(".tvg-row.cur")||gRows.querySelector(".tvg-row");focusEl(r,"center");if(r)fillGuide(+r.dataset.i)}
  else if(name==="help"){focusEl(help.querySelector("button"))}
  else if(name==="test"){showRaw("—","");tt.querySelector(".code").textContent=""}
  touch();
}
function closeUi(){
  Object.keys(panels).forEach(k=>panels[k].classList.remove("open"));
  ui="";clearTimeout(uiT);if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
}
function focusEl(el,block){if(!el)return;el.focus({preventScroll:true});try{el.scrollIntoView({block:block||"nearest",inline:"nearest"})}catch{}}
// Los paneles se cierran solos si no tocas nada (el proyector se queda con la imagen limpia).
function touch(){clearTimeout(uiT);if(ui&&ui!=="test")uiT=setTimeout(closeUi,25000)}
g("list").addEventListener("click",e=>{if(e.target.closest&&e.target.closest(".ch")&&!(e.target.closest(".fav")))closeUi()},true);

/* ========== Navegación con flechas ========== */
function moveFocus(dir){
  const root=panels[ui];if(!root)return false;
  const list=[].slice.call(root.querySelectorAll("button")).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&!e.disabled});
  const ae=document.activeElement,curEl=ae&&root.contains(ae)&&ae.tagName==="BUTTON"?ae:null;
  if(!curEl){focusEl(list[0]);return true}
  const a=curEl.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2;
  const pick=strict=>{
    let best=null,bs=1e9;
    list.forEach(el=>{
      if(el===curEl)return;
      const b=el.getBoundingClientRect(),dx=b.left+b.width/2-ax,dy=b.top+b.height/2-ay;
      const horiz=dir==="left"||dir==="right";
      // izquierda/derecha: solo elementos a la misma altura; arriba/abajo: solo los que quedan encima/debajo en la misma columna
      if(strict&&(horiz?(b.top>=a.bottom||b.bottom<=a.top):(b.left>=a.right||b.right<=a.left)))return;
      let pri,sec;
      if(dir==="right"){if(dx<=2)return;pri=dx;sec=Math.abs(dy)}
      else if(dir==="left"){if(dx>=-2)return;pri=-dx;sec=Math.abs(dy)}
      else if(dir==="down"){if(dy<=2)return;pri=dy;sec=Math.abs(dx)}
      else{if(dy>=-2)return;pri=-dy;sec=Math.abs(dx)}
      const s2=pri+sec*2.2;if(s2<bs){bs=s2;best=el}
    });
    return best;
  };
  let best=pick(true);
  if(!best&&dir!=="left"&&dir!=="right")best=pick(false);
  // de la lista hacia arriba: se va a la categoría que está seleccionada
  if(best&&dir==="up"&&best.classList.contains("chip")&&curEl.closest("#list"))best=aside.querySelector('.chip[aria-pressed="true"]')||best;
  if(best){focusEl(best);return true}
  return false;
}

/* ========== Acciones del control remoto ========== */
function act(k){
  if(ui==="test")return;
  if(!g("mant").hidden)return;
  if(ui)return panelAct(k);
  switch(k){
    case "up": case "chdown": play(cur-1);break;
    case "down": case "chup": play(cur+1);break;
    case "ok":{
      const rb=g("retry"),ov=g("ov");
      if(!ov.hidden&&!rb.hidden){rb.click();break}                        // error: OK = reintentar
      if(!ov.hidden&&/^Toca/.test(g("ovt").textContent)){ov.click();break} // "Toca para reproducir"
      openUi("list");break}
    case "left": case "green": openUi("list");break;
    case "right": case "menu": case "red": openUi("menu");break;
    case "guide": case "blue": openUi("guide");break;
    case "info": bn.classList.contains("show")?hideBanner():showBanner(7000);break;
    case "yellow": toggleFav();break;
    case "pp": if(v2.paused){v2.play();toast("▶ Reproduciendo")}else{v2.pause();toast("❚❚ Pausa")}break;
  }
}
function panelAct(k){
  touch();
  switch(k){
    case "up": case "down": case "left": case "right": moveFocus(k);break;
    case "chup": for(let i=0;i<5;i++)moveFocus("down");break;
    case "chdown": for(let i=0;i<5;i++)moveFocus("up");break;
    case "ok":{const ae=document.activeElement;if(ae&&panels[ui].contains(ae)&&ae.tagName==="BUTTON")ae.click();else moveFocus("down");break}
    case "menu": ui==="menu"?closeUi():openUi("menu");break;
    case "guide": ui==="guide"?closeUi():openUi("guide");break;
    case "info": closeUi();showBanner(7000);break;
  }
}
function onBack(){
  if(ui==="test"||ui==="help"){openUi("menu");return}
  if(ui){closeUi();return}
  if(bn.classList.contains("show")){hideBanner();return}
  if(Date.now()-lastBack<2500){if(P.App)P.App.exitApp();return}
  lastBack=Date.now();toast("Presiona ATRÁS otra vez para salir",2400);
}

// Desde el control remoto (vía código nativo)
addEventListener("tvkey",e=>act(e.detail));

// Desde un teclado (o el navegador): mismas acciones. Se atiende en la fase de captura para ganarle al atajo viejo de la página.
const KM={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right",Enter:"ok",NumpadEnter:"ok",PageUp:"chdown",PageDown:"chup",
  ChannelUp:"chup",ChannelDown:"chdown",ContextMenu:"menu",Menu:"menu",F1:"menu",Info:"info",i:"info",I:"info",Guide:"guide",g:"guide",G:"guide",
  MediaPlayPause:"pp",MediaPlay:"pp",MediaPause:"pp",y:"yellow"};
const OFF={f:1,F:1,p:1,P:1,"/":1};
addEventListener("keydown",e=>{
  if(ui==="test"){
    e.preventDefault();e.stopImmediatePropagation();
    if(e.key==="Escape"||e.key==="Backspace"){onBack();return}
    showRaw(e.key===" "?"Space":e.key,e.keyCode);return;
  }
  if(e.key==="Escape"||e.key==="Backspace"){e.preventDefault();e.stopImmediatePropagation();onBack();return}
  const k=KM[e.key];
  if(k){e.preventDefault();e.stopImmediatePropagation();if(e.repeat&&(k==="ok"||k==="menu"||k==="guide"||k==="info"||k==="pp"||k==="yellow"))return;act(k);return}
  if(OFF[e.key]){e.preventDefault();e.stopImmediatePropagation()}
},true);

/* ========== Ciclo de vida y señal ========== */
if(P.App){
  P.App.addListener("backButton",onBack);
  let bgAt=0;
  P.App.addListener("appStateChange",s=>{
    if(!s.isActive){bgAt=Date.now();return}
    if(bgAt&&Date.now()-bgAt>45000&&cur>=0&&!maint)play(cur);   // la señal en vivo quedó vieja: reconecta
    bgAt=0;
  });
}
// Si la señal se queda cargando mucho rato, reconecta sola (el proyector suele quedar sin nadie al control).
let stT=0,stN=0;
v2.addEventListener("waiting",()=>{clearTimeout(stT);stT=setTimeout(()=>{if(cur>=0&&!v2.paused&&stN++<3){toast("Reconectando…");play(cur)}},20000)});
v2.addEventListener("playing",()=>{clearTimeout(stT);stN=0});
v2.addEventListener("pause",()=>clearTimeout(stT));

// Primer canal: mostrar el banner un momento cuando termina de cargar la app
setTimeout(()=>{if(!ui&&cur>=0)showBanner(6000)},2500);
})();
