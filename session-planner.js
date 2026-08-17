"use strict";
/* ================================================================
   session-planner.js — Planejador de Sessão v2
   Estrutura: Sessões → Locais → NPCs / Inimigos / Tesouro
   Persistência: localStorage "sp2_sessions"
   ================================================================ */

const SP_STORE = "sp2_sessions";
let sessions = [];

/* ── Persistência ──────────────────────────────────────────────── */
function spLoad()  { try { sessions = JSON.parse(localStorage.getItem(SP_STORE)) || []; } catch { sessions = []; } }
function spSave()  { try { localStorage.setItem(SP_STORE, JSON.stringify(sessions)); } catch {} }
function uid()     { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

/* ── Modelos ───────────────────────────────────────────────────── */
const newSession  = () => ({ id:uid(), name:"Nova Sessão", notes:"", locations:[], createdAt:Date.now() });
const newLocation = t  => ({ id:uid(), name:"", type:t||"cidade", npcs:[], enemies:[], treasure:[] });
const newNPC = (n,d,shopType) => ({
  id:uid(), name:n, desc:d||"",
  shopType: shopType||"",      // ""=sem loja | "armas" | "magias" | "pocoes" | "pericias"
  items:[],                    // itens à venda (armas/armaduras/acessórios/poções/magias)
  skills:[],                   // perícias ensinadas [{name, attr, price}]
  mission: null,               // null ou {desc:"", reward:""}
  checked:false
});
const newEnemy    = (n,d,c)   => ({ id:uid(), name:n, difficulty:d||1, category:c||"", drops:[], checked:false });
const newTreasure = (n,t)     => ({ id:uid(), name:n, tier:t||"comum", checked:false });
const newShopItem = (n,t,p)   => ({ id:uid(), name:n, tier:t||"comum", price:p||"" });
const newDrop     = (n,t)     => ({ id:uid(), name:n, tier:t||"comum" });

/* ── Toast ─────────────────────────────────────────────────────── */
function toast(msg){
  const t=document.getElementById("sp-toast");
  t.textContent=msg;t.style.opacity="1";
  clearTimeout(t._t);t._t=setTimeout(()=>t.style.opacity="0",2200);
}

/* ── Dados do compêndio ────────────────────────────────────────── */
function getAllItems(){
  return [
    ...(typeof WEAPONS_ONE_HAND!=="undefined"?WEAPONS_ONE_HAND:[]),
    ...(typeof WEAPONS_TWO_HAND!=="undefined"?WEAPONS_TWO_HAND:[]),
    ...(typeof WEAPONS_RANGED  !=="undefined"?WEAPONS_RANGED  :[]),
    ...(typeof WEAPONS_MAGIC   !=="undefined"?WEAPONS_MAGIC   :[]),
    ...(typeof SHIELDS         !=="undefined"?SHIELDS         :[]),
    ...(typeof ARMORS          !=="undefined"?ARMORS          :[]),
    ...(typeof ACCESSORIES     !=="undefined"?ACCESSORIES     :[]),
    ...(typeof MISC_ITEMS      !=="undefined"?MISC_ITEMS      :[]),
  ].filter(Boolean);
}
function getBestiary(){ return typeof BESTIARY!=="undefined"?BESTIARY:[]; }

/* ── Escape HTML ───────────────────────────────────────────────── */
function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

/* ── Finders ───────────────────────────────────────────────────── */
function findSession(sid)         { return sessions.find(s=>s.id===sid); }
function findLocation(sid,lid)    { return findSession(sid)?.locations.find(l=>l.id===lid); }
function findNPC(sid,lid,nid)     { return findLocation(sid,lid)?.npcs.find(n=>n.id===nid); }
function findEnemy(sid,lid,eid)   { return findLocation(sid,lid)?.enemies.find(e=>e.id===eid); }

/* ── Picker ────────────────────────────────────────────────────── */
let pickerCb=null, pickerFilter="", pickerMode="", pickerItems=[], pickerSelected=null;

function openPicker(mode,title,chips,cb){
  pickerMode=mode; pickerCb=cb; pickerFilter=""; pickerSelected=null;
  document.getElementById("picker-title").textContent=title;
  document.getElementById("picker-search").value="";

  const chipsEl=document.getElementById("picker-chips");
  chipsEl.innerHTML="";
  chips.forEach(([label,val],i)=>{
    const btn=document.createElement("button");
    btn.className="picker-chip"+(i===0?" active":"");
    btn.textContent=label;
    btn.addEventListener("click",()=>{
      chipsEl.querySelectorAll(".picker-chip").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      pickerFilter=val;
      renderPickerList(document.getElementById("picker-search").value.trim().toLowerCase());
    });
    chipsEl.appendChild(btn);
  });

  const priceRow=document.getElementById("picker-price-row");
  if(mode==="shop-item"||mode==="shop-spell"||mode==="skill"){
    priceRow.style.display="flex";
    document.getElementById("picker-price-input").value="";
    document.getElementById("picker-price-input").placeholder=
      mode==="skill" ? "Preço para aprender (ex: 20 prata...)" : "Preço (ex: 10 prata, 2 ouro...)";
    document.getElementById("picker-confirm").onclick=()=>{
      if(!pickerSelected)return;
      cb({item:pickerSelected,price:document.getElementById("picker-price-input").value.trim()});
      closePicker();
    };
  } else { priceRow.style.display="none"; }

  document.getElementById("picker-overlay").classList.remove("hidden");
  setTimeout(()=>document.getElementById("picker-search").focus(),80);
  renderPickerList("");
}

function renderPickerList(q){
  const el=document.getElementById("picker-list");
  let items=[];

  if(pickerMode==="enemy"){
    items=getBestiary()
      .filter(m=>(!pickerFilter||String(m.difficulty)===pickerFilter)&&
                 (!q||(m.name||"").toLowerCase().includes(q)||(m.category||"").toLowerCase().includes(q)))
      .map(m=>({_raw:m,icon:"💀",name:m.name,sub:`Dif.${m.difficulty} · ${m.category||"Criatura"}`}));

  } else if(pickerMode==="shop-spell"){
    // Magias do compêndio
    const spells=(typeof GENERAL_SPELLS!=="undefined"?GENERAL_SPELLS:[])
      .filter(Boolean)
      .filter(s=>(!pickerFilter||String(s.level)===pickerFilter)&&
                 (!q||(s.name||"").toLowerCase().includes(q)||(s.effect||"").toLowerCase().includes(q)));
    items=spells.map(s=>({_raw:{name:s.name,tier:"magico",level:s.level,effect:s.effect},
      icon:"✨",name:s.name,sub:`Nível ${s.level} · ${(s.effect||"").substring(0,50)}…`}));

  } else if(pickerMode==="skill"){
    // Perícias de todas as classes + perícias gerais
    const cls=typeof CLASSES!=="undefined"?CLASSES:{};
    const genSkills=typeof GENERAL_SKILLS!=="undefined"?GENERAL_SKILLS:[];
    const allSkills=[];

    // Perícias gerais
    genSkills.forEach(s=>{
      allSkills.push({
        _raw:{name:s.name,attr:s.attr||"",tier:"comum",classKey:"geral"},
        icon:"🌐",name:s.name,
        sub:`Geral · ${s.attr||""} · ${(s.desc||"").substring(0,60)}`
      });
    });

    // Perícias por classe
    Object.entries(cls).forEach(([key,c])=>{
      (c.skillsClass||[]).forEach(s=>{
        allSkills.push({
          _raw:{name:s.name,attr:s.attr||"",tier:"comum",classKey:key},
          icon:"📚",name:s.name,
          sub:`${c.name} · ${s.attr||""} · ${(s.desc||"").substring(0,50)}`
        });
      });
    });

    items=allSkills.filter(s=>
      (!pickerFilter||s._raw.classKey===pickerFilter||pickerFilter==="")&&
      (!q||(s.name||"").toLowerCase().includes(q)||(s.sub||"").toLowerCase().includes(q))
    );

  } else {
    // Itens do compêndio (shop-item, item)
    const catMap={
      weapon:  [...(typeof WEAPONS_ONE_HAND!=="undefined"?WEAPONS_ONE_HAND:[]),
                ...(typeof WEAPONS_TWO_HAND!=="undefined"?WEAPONS_TWO_HAND:[]),
                ...(typeof WEAPONS_RANGED  !=="undefined"?WEAPONS_RANGED  :[]),
                ...(typeof WEAPONS_MAGIC   !=="undefined"?WEAPONS_MAGIC   :[])].map(i=>({...i,_cat:"weapon"})),
      armor:   (typeof ARMORS     !=="undefined"?ARMORS    :[]).map(i=>({...i,_cat:"armor"})),
      accessory:(typeof ACCESSORIES!=="undefined"?ACCESSORIES:[]).map(i=>({...i,_cat:"accessory"})),
      shield:  (typeof SHIELDS    !=="undefined"?SHIELDS   :[]).map(i=>({...i,_cat:"shield"})),
      potion:  (typeof MISC_ITEMS !=="undefined"?MISC_ITEMS:[]).filter(i=>i&&i.subcategory==="potion").map(i=>({...i,_cat:"misc"})),
      material:(typeof MISC_ITEMS !=="undefined"?MISC_ITEMS:[]).filter(i=>i&&(i.craftingMaterial||i.smithingMaterial)).map(i=>({...i,_cat:"misc"})),
      scroll:  (typeof MISC_ITEMS !=="undefined"?MISC_ITEMS:[]).filter(i=>i&&(i.subcategory==="scroll"||i.subcategory==="recipe_scroll")).map(i=>({...i,_cat:"misc"})),
    };
    const all=[...Object.values(catMap).flat()];
    const pool=pickerFilter&&catMap[pickerFilter]?catMap[pickerFilter]:all;
    items=pool.filter(Boolean)
      .filter(i=>!q||(i.name||"").toLowerCase().includes(q)||(i.effect||"").toLowerCase().includes(q))
      .map(i=>({_raw:i,icon:"🎒",name:i.name,
                sub:[i.tier||"comum",i.dmg,i.physDefense!=null?"Def."+i.physDefense:null].filter(Boolean).join(" · ")}))
      .filter(i=>i.name);
    // Se filtro for tier (comum/raro/etc)
    if(pickerFilter&&!catMap[pickerFilter]){
      items=all.filter(Boolean)
        .filter(i=>(!pickerFilter||(i.tier||"comum")===pickerFilter)&&
                   (!q||(i.name||"").toLowerCase().includes(q)))
        .map(i=>({_raw:i,icon:"🎒",name:i.name,
                  sub:[i.tier||"comum",i.dmg,i.physDefense!=null?"Def."+i.physDefense:null].filter(Boolean).join(" · ")}))
        .filter(i=>i.name);
    }
  }

  pickerItems=items.slice(0,100);
  if(pickerItems.length===0){
    el.innerHTML=`<p style="text-align:center;padding:20px;color:var(--ink-soft);font-size:13px">Nenhum resultado.</p>`;
    return;
  }
  el.innerHTML=pickerItems.map((it,idx)=>`
    <div class="picker-item" data-idx="${idx}">
      <span class="picker-item-icon">${it.icon}</span>
      <div class="picker-item-body">
        <div class="picker-item-name">${esc(it.name)}</div>
        ${it.sub?`<div class="picker-item-sub">${esc(it.sub)}</div>`:""}
      </div>
    </div>`).join("");
  el.querySelectorAll(".picker-item").forEach(el2=>{
    el2.addEventListener("click",()=>{
      const it=pickerItems[parseInt(el2.dataset.idx)];
      if(pickerMode==="shop-item"||pickerMode==="shop-spell"||pickerMode==="skill"){
        el.querySelectorAll(".picker-item").forEach(e=>e.style.background="");
        el2.style.background="rgba(156,122,60,.12)";
        pickerSelected=it._raw;
      } else { pickerCb&&pickerCb(it._raw); closePicker(); }
    });
  });
}

function closePicker(){
  document.getElementById("picker-overlay").classList.add("hidden");
  pickerCb=null; pickerSelected=null;
}

/* ── Mini-prompt ───────────────────────────────────────────────── */
function miniPrompt(fields){
  return new Promise(res=>{
    const ov=document.createElement("div");
    Object.assign(ov.style,{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"});
    const box=document.createElement("div");
    Object.assign(box.style,{background:"var(--parchment)",borderRadius:"10px",border:"1px solid var(--line)",padding:"18px",maxWidth:"380px",width:"100%",display:"flex",flexDirection:"column",gap:"10px"});
    const inputStyle="padding:8px 10px;border:1px solid var(--line);border-radius:6px;background:rgba(255,255,255,.7);font-family:var(--font-heading);font-size:13px;color:var(--ink);outline:none;width:100%";
    let shopChk=null;
    fields.forEach(f=>{
      if(f.type==="select"){
        const w=document.createElement("div"); w.style.display="flex"; w.style.flexDirection="column"; w.style.gap="3px";
        const lbl=document.createElement("div"); lbl.style.cssText="font-size:10px;color:var(--ink-soft);font-family:var(--font-label);text-transform:uppercase;letter-spacing:.3px"; lbl.textContent=f.label;
        const sel=document.createElement("select"); sel.id="mini-"+f.key; sel.style.cssText=inputStyle;
        f.options.forEach(([v,l])=>{ const o=document.createElement("option"); o.value=v; o.textContent=l; sel.appendChild(o); });
        w.appendChild(lbl); w.appendChild(sel); box.appendChild(w);
      } else if(f.type==="checkbox"){
        const row=document.createElement("label"); row.style.cssText="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;font-family:var(--font-heading);color:var(--ink)";
        shopChk=document.createElement("input"); shopChk.type="checkbox"; shopChk.id="mini-"+f.key;
        row.appendChild(shopChk); row.append(f.label); box.appendChild(row);
      } else {
        const inp=document.createElement("input"); inp.style.cssText=inputStyle; inp.placeholder=f.label; inp.id="mini-"+f.key; inp.value=f.default||"";
        box.appendChild(inp);
      }
    });
    const btns=document.createElement("div"); btns.style.cssText="display:flex;gap:8px;margin-top:2px";
    const ok=document.createElement("button"); const cn=document.createElement("button");
    ok.style.cssText="flex:1;padding:9px;border:none;border-radius:6px;background:var(--gold);color:#fff;font-family:var(--font-heading);font-size:13px;cursor:pointer";
    cn.style.cssText="flex:1;padding:9px;border:1px solid var(--line);border-radius:6px;background:transparent;font-family:var(--font-heading);font-size:13px;cursor:pointer;color:var(--ink)";
    ok.textContent="Adicionar"; cn.textContent="Cancelar";
    btns.appendChild(ok); btns.appendChild(cn); box.appendChild(btns); ov.appendChild(box); document.body.appendChild(ov);
    const first=box.querySelector("input,select"); if(first){first.focus(); first.addEventListener("keydown",e=>{if(e.key==="Enter")ok.click();});}
    ok.addEventListener("click",()=>{
      const r={};
      fields.forEach(f=>{
        if(f.type==="checkbox") r[f.key]=shopChk?.checked||false;
        else if(f.type==="select") r[f.key]=document.getElementById("mini-"+f.key)?.value||"";
        else r[f.key]=document.getElementById("mini-"+f.key)?.value.trim()||"";
      });
      document.body.removeChild(ov); res(r);
    });
    cn.addEventListener("click",()=>{document.body.removeChild(ov); res(null);});
  });
}

/* ── Constantes visuais ────────────────────────────────────────── */
const TYPE_ICONS  ={cidade:"🏘",caminho:"🛤",caverna:"🕳",outro:"📍"};
const TYPE_LABELS ={cidade:"Cidade",caminho:"Caminho",caverna:"Caverna",outro:"Outro"};
const DIFF_COLORS =["","#27ae60","#f39c12","#e67e22","#e74c3c","#8e44ad"];
const TIER_CLASS  = t=>({comum:"tier-comum",raro:"tier-raro",magico:"tier-magico",lendario:"tier-lendario",ancestral:"tier-ancestral"}[t]||"tier-comum");

/* ── Render ────────────────────────────────────────────────────── */
function render(){
  const listEl=document.getElementById("session-list");
  const emptyEl=document.getElementById("sp-empty");
  if(sessions.length===0){emptyEl.style.display="block";listEl.innerHTML="";return;}
  emptyEl.style.display="none";
  listEl.innerHTML=sessions.map(s=>renderSession(s)).join("");
  bindAll();
}

function renderSession(s){
  const lc=s.locations.length;
  return `
<div class="session-block" data-sid="${s.id}">
  <div class="session-head">
    <span class="session-chevron">▶</span>
    <input class="session-name-input" value="${esc(s.name)}" placeholder="Nome da sessão" data-field="name" data-sid="${s.id}">
    <span class="session-meta">${lc} local${lc!==1?"is":""}</span>
    <button class="btn-print-session" data-print-session="${s.id}" title="Imprimir esta sessão">🖨</button>
    <button class="btn-del-session" data-del-session="${s.id}" title="Excluir sessão">🗑</button>
  </div>
  <div class="session-body">
    <textarea class="session-notes-input" placeholder="Notas gerais desta sessão..." data-field="notes" data-sid="${s.id}">${esc(s.notes||"")}</textarea>
    ${s.locations.map(l=>renderLocation(s.id,l)).join("")}
    <button class="btn-add-location" data-add-loc="${s.id}">🗺 Adicionar Local</button>
  </div>
</div>`;
}

function renderLocation(sid,l){
  const icon=TYPE_ICONS[l.type]||"📍";
  const npc=l.npcs.length, en=l.enemies.length, tr=l.treasure.length;
  return `
<div class="location-block" data-sid="${sid}" data-lid="${l.id}">
  <div class="location-head">
    <span class="session-chevron">▶</span>
    <span>${icon}</span>
    <span class="location-type-badge type-${l.type}">${TYPE_LABELS[l.type]||l.type}</span>
    <input class="location-name-input" value="${esc(l.name)}" placeholder="Nome do local..." data-field="loc-name" data-sid="${sid}" data-lid="${l.id}">
    <span style="font-size:11px;color:var(--ink-soft);white-space:nowrap;flex-shrink:0">${npc?"👤"+npc+" ":""}${en?"⚔"+en+" ":""}${tr?"💰"+tr:""}</span>
    <button class="btn-del-location" data-del-loc="${l.id}" data-sid="${sid}">✕</button>
  </div>
  <div class="location-body">

    <div class="loc-section">
      <div class="loc-section-head">
        <span class="loc-section-label">👤 NPCs</span>
        <button class="btn-loc-add" data-add-npc="${l.id}" data-sid="${sid}">+ NPC</button>
      </div>
      ${l.npcs.length===0?`<p style="font-size:12px;color:var(--ink-soft)">Nenhum NPC.</p>`:l.npcs.map(n=>renderNPC(sid,l.id,n)).join("")}
    </div>

    <div class="loc-section">
      <div class="loc-section-head">
        <span class="loc-section-label">⚔ Inimigos</span>
        <button class="btn-loc-add" data-add-enemy="${l.id}" data-sid="${sid}">+ Inimigo</button>
      </div>
      ${l.enemies.length===0?`<p style="font-size:12px;color:var(--ink-soft)">Nenhum inimigo.</p>`:l.enemies.map(e=>renderEnemy(sid,l.id,e)).join("")}
    </div>

    <div class="loc-section">
      <div class="loc-section-head">
        <span class="loc-section-label">💰 Tesouro</span>
        <button class="btn-loc-add" data-add-treasure="${l.id}" data-sid="${sid}">+ Item</button>
      </div>
      ${l.treasure.length===0?`<p style="font-size:12px;color:var(--ink-soft)">Nenhum tesouro.</p>`:l.treasure.map(t=>renderTreasure(sid,l.id,t)).join("")}
    </div>

  </div>
</div>`;
}

function renderNPC(sid,lid,n){
  const SHOP_ICONS = {armas:"⚔",magias:"✨",pocoes:"🧪",pericias:"📚"};
  const SHOP_LABELS= {armas:"Armas, Armaduras & Acessórios",magias:"Magias & Pergaminhos",pocoes:"Poções & Materiais",pericias:"Mestre de Perícias"};
  const shopIcon  = n.shopType ? SHOP_ICONS[n.shopType]  : "";
  const shopLabel = n.shopType ? SHOP_LABELS[n.shopType] : "";

  // Seção de itens da loja (armas/magias/poções)
  const shopItemsHtml = (n.shopType && n.shopType !== "pericias") ? `
    <div class="entry-subitems">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:10px;color:var(--gold);font-family:var(--font-label);text-transform:uppercase;letter-spacing:.3px">${shopIcon} ${shopLabel}</span>
        <button class="btn-loc-add" data-add-shop-item="${n.id}" data-sid="${sid}" data-lid="${lid}" style="font-size:10px;padding:2px 8px">+ Item</button>
      </div>
      ${n.items.length===0?`<p style="font-size:11px;color:var(--ink-soft)">Nenhum item.</p>`:
        n.items.map(it=>`
        <div class="entry-subitem">
          <span class="entry-subitem-name">${esc(it.name)}</span>
          <span class="entry-subitem-price">${esc(it.price||"—")}</span>
          <button class="btn-del-subitem" data-del-shop-item="${it.id}" data-nid="${n.id}" data-sid="${sid}" data-lid="${lid}">✕</button>
        </div>`).join("")}
    </div>` : "";

  // Seção de perícias ensinadas
  const skillsHtml = (n.shopType === "pericias") ? `
    <div class="entry-subitems">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:10px;color:var(--gold);font-family:var(--font-label);text-transform:uppercase;letter-spacing:.3px">📚 Perícias Ensinadas</span>
        <button class="btn-loc-add" data-add-skill="${n.id}" data-sid="${sid}" data-lid="${lid}" style="font-size:10px;padding:2px 8px">+ Perícia</button>
      </div>
      ${(n.skills||[]).length===0?`<p style="font-size:11px;color:var(--ink-soft)">Nenhuma perícia cadastrada.</p>`:
        (n.skills||[]).map(sk=>`
        <div class="entry-subitem">
          <span class="entry-subitem-name">${esc(sk.name)}<span style="font-size:10px;color:var(--ink-soft);margin-left:4px">[${sk.attr||""}]</span></span>
          <span class="entry-subitem-price">${esc(sk.price||"—")}</span>
          <button class="btn-del-subitem" data-del-skill="${sk.id}" data-nid="${n.id}" data-sid="${sid}" data-lid="${lid}">✕</button>
        </div>`).join("")}
    </div>` : "";

  // Seção de missão
  const missionHtml = n.mission ? `
    <div class="entry-subitems" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px">
      <span style="font-size:10px;color:#e67e22;font-family:var(--font-label);text-transform:uppercase;letter-spacing:.3px;display:block;margin-bottom:4px">📜 Missão</span>
      <textarea class="sp-inline-ta" data-mission-desc="${n.id}" data-sid="${sid}" data-lid="${lid}" rows="2" placeholder="Descrição da missão...">${esc(n.mission.desc||"")}</textarea>
      <input class="sp-inline-input" data-mission-reward="${n.id}" data-sid="${sid}" data-lid="${lid}" value="${esc(n.mission.reward||"")}" placeholder="Recompensa (ex: 50 prata + item raro)">
      <button class="btn-loc-add" data-remove-mission="${n.id}" data-sid="${sid}" data-lid="${lid}" style="font-size:10px;color:#c0392b;border-color:#e74c3c;margin-top:4px">✕ Remover missão</button>
    </div>` : `
    <button class="btn-loc-add" data-add-mission="${n.id}" data-sid="${sid}" data-lid="${lid}" style="margin-top:6px;font-size:11px">📜 Adicionar Missão</button>`;

  return `
<div class="entry-card" style="border-left:3px solid #8e44ad">
  <div class="entry-card-head">
    <div class="entry-check ${n.checked?"checked":""}" data-check-npc="${n.id}" data-sid="${sid}" data-lid="${lid}">${n.checked?"✓":""}</div>
    <div class="entry-card-body">
      <div class="entry-card-name" style="${n.checked?"text-decoration:line-through;opacity:.5":""}">
        👤 ${esc(n.name||"NPC")}
        ${n.shopType?`<span style="font-size:11px;margin-left:6px;opacity:.7">${shopIcon} ${shopLabel}</span>`:""}
        ${n.mission?`<span style="font-size:11px;margin-left:6px;color:#e67e22">📜</span>`:""}
      </div>
      ${n.desc?`<div class="entry-card-sub">${esc(n.desc)}</div>`:""}
      ${shopItemsHtml}${skillsHtml}${missionHtml}
    </div>
  </div>
  <button class="btn-del-entry" data-del-npc="${n.id}" data-sid="${sid}" data-lid="${lid}">✕</button>
</div>`;
}

function renderEnemy(sid,lid,e){
  const dc=DIFF_COLORS[e.difficulty]||"#999";
  return `
<div class="entry-card" style="border-left:3px solid #e74c3c">
  <div class="entry-card-head">
    <div class="entry-check ${e.checked?"checked":""}" data-check-enemy="${e.id}" data-sid="${sid}" data-lid="${lid}">${e.checked?"✓":""}</div>
    <div class="entry-card-body">
      <div class="entry-card-name" style="${e.checked?"text-decoration:line-through;opacity:.5":""}">
        💀 ${esc(e.name||"Inimigo")}
        <span style="font-size:10px;padding:1px 6px;border-radius:8px;background:${dc}22;color:${dc};margin-left:4px">Dif.${e.difficulty}</span>
        ${e.category?`<span style="font-size:10px;color:var(--ink-soft)"> · ${esc(e.category)}</span>`:""}
      </div>
      ${e.drops.length>0?`
      <div class="entry-subitems">
        <span style="font-size:10px;color:var(--ink-soft);font-family:var(--font-label);text-transform:uppercase;letter-spacing:.3px;display:block;margin-bottom:3px">Drops</span>
        ${e.drops.map(d=>`
        <div class="entry-subitem">
          <span class="entry-subitem-name">${esc(d.name)}</span>
          <span class="entry-subitem-price" style="color:var(--ink-soft);font-size:10px">${d.tier||""}</span>
          <button class="btn-del-subitem" data-del-drop="${d.id}" data-eid="${e.id}" data-sid="${sid}" data-lid="${lid}">✕</button>
        </div>`).join("")}
      </div>`:""}
    </div>
  </div>
  <div style="position:absolute;top:7px;right:32px">
    <button class="btn-loc-add" data-add-drop="${e.id}" data-sid="${sid}" data-lid="${lid}" style="font-size:10px;padding:2px 8px">+ Drop</button>
  </div>
  <button class="btn-del-entry" data-del-enemy="${e.id}" data-sid="${sid}" data-lid="${lid}">✕</button>
</div>`;
}

function renderTreasure(sid,lid,t){
  return `
<div class="entry-card" style="border-left:3px solid #9c7a3c">
  <div class="entry-card-head">
    <div class="entry-check ${t.checked?"checked":""}" data-check-treasure="${t.id}" data-sid="${sid}" data-lid="${lid}">${t.checked?"✓":""}</div>
    <div class="entry-card-body">
      <div class="entry-card-name" style="${t.checked?"text-decoration:line-through;opacity:.5":""}">
        💎 ${esc(t.name||"Item")}
        <span class="catalog-item-tier ${TIER_CLASS(t.tier)}" style="margin-left:5px;font-size:10px">${t.tier||"comum"}</span>
      </div>
    </div>
  </div>
  <button class="btn-del-entry" data-del-treasure="${t.id}" data-sid="${sid}" data-lid="${lid}">✕</button>
</div>`;
}

/* ── Reabre acordeões ──────────────────────────────────────────── */
function reopenBlocks(sid,lid){
  const sb=document.querySelector(`.session-block[data-sid="${sid}"]`);
  if(sb)sb.classList.add("open");
  if(lid){const lb=sb?.querySelector(`.location-block[data-lid="${lid}"]`);if(lb)lb.classList.add("open");}
}

/* ── Bind de todos os eventos ──────────────────────────────────── */
function bindAll(){
  const L=document.getElementById("session-list");

  // Acordeão sessão
  L.querySelectorAll(".session-head").forEach(h=>{
    h.addEventListener("click",e=>{
      if(["INPUT","BUTTON","TEXTAREA"].includes(e.target.tagName))return;
      h.closest(".session-block").classList.toggle("open");
    });
  });

  // Acordeão local
  L.querySelectorAll(".location-head").forEach(h=>{
    h.addEventListener("click",e=>{
      if(["INPUT","BUTTON"].includes(e.target.tagName))return;
      h.closest(".location-block").classList.toggle("open");
    });
  });

  // Editar nome sessão
  L.querySelectorAll("[data-field='name']").forEach(inp=>{
    inp.addEventListener("input",()=>{ const s=findSession(inp.dataset.sid);if(s){s.name=inp.value;spSave();}});
  });

  // Editar notas sessão
  L.querySelectorAll("[data-field='notes']").forEach(ta=>{
    ta.addEventListener("input",()=>{ const s=findSession(ta.dataset.sid);if(s){s.notes=ta.value;spSave();}});
  });

  // Editar nome local
  L.querySelectorAll("[data-field='loc-name']").forEach(inp=>{
    inp.addEventListener("input",()=>{ const l=findLocation(inp.dataset.sid,inp.dataset.lid);if(l){l.name=inp.value;spSave();}});
  });

  // Deletar sessão
  L.querySelectorAll("[data-del-session]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      if(!confirm("Excluir esta sessão inteira?"))return;
      sessions=sessions.filter(s=>s.id!==btn.dataset.delSession);
      spSave();render();
    });
  });

  // Imprimir sessão
  L.querySelectorAll("[data-print-session]").forEach(btn=>{
    btn.addEventListener("click", e => {
      e.stopPropagation();
      printSession(btn.dataset.printSession);
    });
  });

  // Deletar local
  L.querySelectorAll("[data-del-loc]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const s=findSession(btn.dataset.sid);if(!s)return;
      s.locations=s.locations.filter(l=>l.id!==btn.dataset.delLoc);
      spSave();render();reopenBlocks(btn.dataset.sid,null);
    });
  });

  // Adicionar local
  L.querySelectorAll("[data-add-loc]").forEach(btn=>{
    btn.addEventListener("click",async()=>{
      const r=await miniPrompt([
        {key:"name",label:"Nome do local"},
        {key:"type",type:"select",label:"Tipo",options:[["cidade","🏘 Cidade"],["caminho","🛤 Caminho"],["caverna","🕳 Caverna"],["outro","📍 Outro"]]},
      ]);
      if(!r)return;
      const s=findSession(btn.dataset.addLoc);if(!s)return;
      const loc=newLocation(r.type);loc.name=r.name;
      s.locations.push(loc);
      spSave();render();
      setTimeout(()=>{
        const sb=document.querySelector(`.session-block[data-sid="${s.id}"]`);sb?.classList.add("open");
        const lbs=sb?.querySelectorAll(".location-block");lbs?.[lbs.length-1]?.classList.add("open");
      },40);
    });
  });

  // Adicionar NPC
  L.querySelectorAll("[data-add-npc]").forEach(btn=>{
    btn.addEventListener("click",async()=>{
      const r=await miniPrompt([
        {key:"name",label:"Nome do NPC"},
        {key:"desc",label:"Papel / descrição (opcional)"},
        {key:"shopType",type:"select",label:"Tipo de estabelecimento",options:[
          ["","🚶 Sem loja"],
          ["armas","⚔ Loja de Armas, Armaduras e Acessórios"],
          ["magias","✨ Loja de Magias e Pergaminhos"],
          ["pocoes","🧪 Loja de Poções e Materiais"],
          ["pericias","📚 Mestre de Perícias"],
        ]},
      ]);
      if(!r||!r.name)return;
      const l=findLocation(btn.dataset.sid,btn.dataset.addNpc);if(!l)return;
      l.npcs.push(newNPC(r.name,r.desc,r.shopType));
      spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.addNpc);
    });
  });

  // Check NPC
  L.querySelectorAll("[data-check-npc]").forEach(el=>{
    el.addEventListener("click",()=>{
      const n=findNPC(el.dataset.sid,el.dataset.lid,el.dataset.checkNpc);if(!n)return;
      n.checked=!n.checked;spSave();render();reopenBlocks(el.dataset.sid,el.dataset.lid);
    });
  });

  // Deletar NPC
  L.querySelectorAll("[data-del-npc]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const l=findLocation(btn.dataset.sid,btn.dataset.lid);if(!l)return;
      l.npcs=l.npcs.filter(n=>n.id!==btn.dataset.delNpc);
      spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.lid);
    });
  });

  // Adicionar item de loja
  L.querySelectorAll("[data-add-shop-item]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      // Descobrir o shopType do NPC
      const n=findNPC(btn.dataset.sid,btn.dataset.lid,btn.dataset.addShopItem);
      if(!n)return;
      const st=n.shopType;
      let title,chips,mode="shop-item";
      if(st==="armas"){
        title="⚔ Item para Loja de Armas/Armaduras";
        chips=[["Todos",""],["Armas","weapon"],["Armaduras","armor"],["Acessórios","accessory"],["Escudos","shield"]];
      } else if(st==="magias"){
        title="✨ Magia ou Pergaminho";
        chips=[["Todos",""],["Nível 1","1"],["Nível 2","2"],["Nível 3","3"],["Nível 4","4"],["Nível 5","5"]];
        mode="shop-spell";
      } else if(st==="pocoes"){
        title="🧪 Poção ou Material";
        chips=[["Todos",""],["Poções","potion"],["Materiais","material"],["Pergaminhos","scroll"]];
      } else {
        title="🎒 Item";
        chips=[["Todos",""],["Comum","comum"],["Raro","raro"],["Lendário","lendario"]];
      }
      openPicker(mode,title,chips,({item,price})=>{
        const npc=findNPC(btn.dataset.sid,btn.dataset.lid,btn.dataset.addShopItem);if(!npc)return;
        npc.items.push(newShopItem(item.name,item.tier||"comum",price));
        spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.lid);
      });
    });
  });

  // Adicionar perícia ensinada
  L.querySelectorAll("[data-add-skill]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      openPicker("skill","📚 Perícia a Ensinar",
        [["Todas",""],["Gerais","geral"],["Guerreiro","guerreiro"],["Mago","mago"],["Arqueiro","arqueiro"],["Ladino","ladino"],["Clérigo","clerigo"]],
        ({item,price})=>{
          const n=findNPC(btn.dataset.sid,btn.dataset.lid,btn.dataset.addSkill);if(!n)return;
          if(!n.skills)n.skills=[];
          n.skills.push({id:uid(),name:item.name,attr:item.attr||"",price:price||""});
          spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.lid);
        });
    });
  });

  // Deletar perícia
  L.querySelectorAll("[data-del-skill]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const n=findNPC(btn.dataset.sid,btn.dataset.lid,btn.dataset.nid);if(!n)return;
      n.skills=(n.skills||[]).filter(s=>s.id!==btn.dataset.delSkill);
      spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.lid);
    });
  });

  // Adicionar missão ao NPC
  L.querySelectorAll("[data-add-mission]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const n=findNPC(btn.dataset.sid,btn.dataset.lid,btn.dataset.addMission);if(!n)return;
      n.mission={desc:"",reward:""};
      spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.lid);
      // Focar no textarea da missão
      setTimeout(()=>{
        const ta=document.querySelector(`[data-mission-desc="${n.id}"]`);
        if(ta)ta.focus();
      },60);
    });
  });

  // Remover missão
  L.querySelectorAll("[data-remove-mission]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const n=findNPC(btn.dataset.sid,btn.dataset.lid,btn.dataset.removeMission);if(!n)return;
      n.mission=null;
      spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.lid);
    });
  });

  // Editar desc/reward da missão (autosave)
  L.querySelectorAll("[data-mission-desc]").forEach(ta=>{
    ta.addEventListener("input",()=>{
      const n=findNPC(ta.dataset.sid,ta.dataset.lid,ta.dataset.missionDesc);
      if(n&&n.mission)n.mission.desc=ta.value;
      spSave();
    });
  });
  L.querySelectorAll("[data-mission-reward]").forEach(inp=>{
    inp.addEventListener("input",()=>{
      const n=findNPC(inp.dataset.sid,inp.dataset.lid,inp.dataset.missionReward);
      if(n&&n.mission)n.mission.reward=inp.value;
      spSave();
    });
  });

  // Deletar item de loja
  L.querySelectorAll("[data-del-shop-item]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const n=findNPC(btn.dataset.sid,btn.dataset.lid,btn.dataset.nid);if(!n)return;
      n.items=n.items.filter(i=>i.id!==btn.dataset.delShopItem);
      spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.lid);
    });
  });

  // Adicionar inimigo
  L.querySelectorAll("[data-add-enemy]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      openPicker("enemy","⚔ Adicionar Inimigo",
        [["Todos",""],["Dif.1","1"],["Dif.2","2"],["Dif.3","3"],["Dif.4","4"],["Dif.5","5"]],
        m=>{
          const l=findLocation(btn.dataset.sid,btn.dataset.addEnemy);if(!l)return;
          l.enemies.push(newEnemy(m.name,m.difficulty,m.category));
          spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.addEnemy);
        });
    });
  });

  // Check inimigo
  L.querySelectorAll("[data-check-enemy]").forEach(el=>{
    el.addEventListener("click",()=>{
      const e=findLocation(el.dataset.sid,el.dataset.lid)?.enemies.find(x=>x.id===el.dataset.checkEnemy);if(!e)return;
      e.checked=!e.checked;spSave();render();reopenBlocks(el.dataset.sid,el.dataset.lid);
    });
  });

  // Deletar inimigo
  L.querySelectorAll("[data-del-enemy]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const l=findLocation(btn.dataset.sid,btn.dataset.lid);if(!l)return;
      l.enemies=l.enemies.filter(e=>e.id!==btn.dataset.delEnemy);
      spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.lid);
    });
  });

  // Adicionar drop
  L.querySelectorAll("[data-add-drop]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      openPicker("item","🎒 Drop do Inimigo",
        [["Todos",""],["Comum","comum"],["Raro","raro"],["Lendário","lendario"]],
        it=>{
          const e=findLocation(btn.dataset.sid,btn.dataset.lid)?.enemies.find(x=>x.id===btn.dataset.addDrop);if(!e)return;
          e.drops.push(newDrop(it.name,it.tier||"comum"));
          spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.lid);
        });
    });
  });

  // Deletar drop
  L.querySelectorAll("[data-del-drop]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const e=findLocation(btn.dataset.sid,btn.dataset.lid)?.enemies.find(x=>x.id===btn.dataset.eid);if(!e)return;
      e.drops=e.drops.filter(d=>d.id!==btn.dataset.delDrop);
      spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.lid);
    });
  });

  // Adicionar tesouro
  L.querySelectorAll("[data-add-treasure]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      openPicker("item","💎 Tesouro / Loot",
        [["Todos",""],["Comum","comum"],["Raro","raro"],["Mágico","magico"],["Lendário","lendario"]],
        it=>{
          const l=findLocation(btn.dataset.sid,btn.dataset.addTreasure);if(!l)return;
          l.treasure.push(newTreasure(it.name,it.tier||"comum"));
          spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.addTreasure);
        });
    });
  });

  // Check tesouro
  L.querySelectorAll("[data-check-treasure]").forEach(el=>{
    el.addEventListener("click",()=>{
      const l=findLocation(el.dataset.sid,el.dataset.lid);if(!l)return;
      const t=l.treasure.find(x=>x.id===el.dataset.checkTreasure);if(!t)return;
      t.checked=!t.checked;spSave();render();reopenBlocks(el.dataset.sid,el.dataset.lid);
    });
  });

  // Deletar tesouro
  L.querySelectorAll("[data-del-treasure]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const l=findLocation(btn.dataset.sid,btn.dataset.lid);if(!l)return;
      l.treasure=l.treasure.filter(t=>t.id!==btn.dataset.delTreasure);
      spSave();render();reopenBlocks(btn.dataset.sid,btn.dataset.lid);
    });
  });
}

/* ── Impressão de sessão ───────────────────────────────────────── */
function printSession(sid) {
  const s = findSession(sid);
  if (!s) return;

  const DIFF_LABEL = ["","Fácil","Normal","Difícil","Elite","Lendário"];
  const TYPE_LABEL = { cidade:"🏘 Cidade", caminho:"🛤 Caminho", caverna:"🕳 Caverna", outro:"📍 Outro" };
  const TIER_PT    = { comum:"Comum", raro:"Raro", magico:"Mágico", lendario:"Lendário", ancestral:"Ancestral" };

  const renderLocHtml = (l) => {
    const SHOP_LABELS={armas:"⚔ Loja de Armas/Armaduras",magias:"✨ Loja de Magias",pocoes:"🧪 Loja de Poções",pericias:"📚 Mestre de Perícias"};
    const npcsHtml = l.npcs.length ? `
      <div class="p-section">
        <div class="p-section-title">👤 NPCs</div>
        ${l.npcs.map(n => {
          const shopLabel=n.shopType?SHOP_LABELS[n.shopType]:"";
          const shopItems=(n.shopType&&n.shopType!=="pericias"&&n.items.length)?
            `<div class="p-shop"><em>${shopLabel}:</em> ${n.items.map(it=>`${esc(it.name)}${it.price?` · <strong>${esc(it.price)}</strong>`:""}`).join(", ")}</div>`:"";
          const skillsSection=(n.shopType==="pericias"&&(n.skills||[]).length)?
            `<div class="p-shop"><em>Perícias:</em> ${(n.skills||[]).map(s=>`${esc(s.name)} [${s.attr||""}]${s.price?` · ${esc(s.price)}`:""}`).join(", ")}</div>`:"";
          const missionSection=n.mission?
            `<div class="p-mission"><strong>📜 Missão:</strong> ${esc(n.mission.desc||"")}${n.mission.reward?`<br><em>Recompensa: ${esc(n.mission.reward)}</em>`:""}</div>`:"";
          return `
          <div class="p-entry ${n.checked?"p-checked":""}">
            <span class="p-check">${n.checked?"☑":"☐"}</span>
            <div class="p-entry-body">
              <strong>${esc(n.name)}</strong>${n.desc?` — ${esc(n.desc)}`:""}${shopLabel?` <em>(${shopLabel})</em>`:""}
              ${shopItems}${skillsSection}${missionSection}
            </div>
          </div>`;
        }).join("")}
      </div>` : "";

    const enemiesHtml = l.enemies.length ? `
      <div class="p-section">
        <div class="p-section-title">⚔ Inimigos</div>
        ${l.enemies.map(e => `
          <div class="p-entry ${e.checked?"p-checked":""}">
            <span class="p-check">${e.checked?"☑":"☐"}</span>
            <div class="p-entry-body">
              <strong>${esc(e.name)}</strong> — Dif.${e.difficulty} ${DIFF_LABEL[e.difficulty]||""}${e.category?` · ${esc(e.category)}`:""}
              ${e.drops.length ? `<div class="p-drops">Drops: ${e.drops.map(d=>esc(d.name)+(d.tier&&d.tier!=="comum"?" ("+TIER_PT[d.tier]+")":"")).join(", ")}</div>` : ""}
            </div>
          </div>`).join("")}
      </div>` : "";

    const treasureHtml = l.treasure.length ? `
      <div class="p-section">
        <div class="p-section-title">💰 Tesouro</div>
        ${l.treasure.map(t => `
          <div class="p-entry ${t.checked?"p-checked":""}">
            <span class="p-check">${t.checked?"☑":"☐"}</span>
            <div class="p-entry-body">
              ${esc(t.name)}${t.tier&&t.tier!=="comum"?` <em>(${TIER_PT[t.tier]})</em>`:""}
            </div>
          </div>`).join("")}
      </div>` : "";

    return `
      <div class="p-location">
        <div class="p-location-head">
          <span class="p-location-type">${TYPE_LABEL[l.type]||l.type}</span>
          <span class="p-location-name">${esc(l.name||"Local sem nome")}</span>
        </div>
        ${npcsHtml}${enemiesHtml}${treasureHtml}
      </div>`;
  };

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="UTF-8">
<title>${esc(s.name)} — Sessão</title>
<style>
  @page { margin: 15mm 14mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Georgia', serif; font-size: 11pt; color: #2a1a0e; line-height: 1.55; }
  h1 { font-size: 20pt; border-bottom: 2px solid #9c7a3c; padding-bottom: 4mm; margin-bottom: 4mm; color: #3a2810; }
  .p-notes { font-size: 10.5pt; color: #555; margin-bottom: 6mm; font-style: italic; white-space: pre-wrap; }
  .p-location { border: 1px solid #c8a87a; border-left: 4px solid #9c7a3c; border-radius: 4px; padding: 5mm; margin-bottom: 5mm; break-inside: avoid; }
  .p-location-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4mm; }
  .p-location-type { font-size: 9pt; background: #f5ead0; border: 1px solid #c8a87a; border-radius: 10px; padding: 1px 7px; color: #7a5c10; }
  .p-location-name { font-size: 14pt; font-weight: bold; color: #3a2810; }
  .p-section { margin-bottom: 3mm; }
  .p-section-title { font-size: 9pt; text-transform: uppercase; letter-spacing: 0.4pt; color: #9c7a3c; margin-bottom: 2mm; font-weight: bold; }
  .p-entry { display: flex; align-items: flex-start; gap: 5px; padding: 2mm 0; border-bottom: 1px solid #e8d8b0; }
  .p-entry:last-child { border-bottom: none; }
  .p-check { font-size: 13pt; flex-shrink: 0; color: #9c7a3c; line-height: 1.2; }
  .p-entry-body { flex: 1; font-size: 10.5pt; }
  .p-checked .p-entry-body { text-decoration: line-through; color: #999; }
  .p-shop { font-size: 9.5pt; margin-top: 2mm; color: #555; }
  .p-shop-item { display: inline-block; margin-right: 6px; }
  .p-drops { font-size: 9.5pt; color: #666; margin-top: 1mm; }
  .p-mission { font-size: 10pt; margin-top: 2mm; padding: 2mm 3mm; background: #fef9f0; border-left: 3px solid #e67e22; border-radius: 3px; }
  @media print {
    .p-location { break-inside: avoid; }
  }
</style>
</head><body>
  <h1>${esc(s.name)}</h1>
  ${s.notes ? `<div class="p-notes">${esc(s.notes)}</div>` : ""}
  ${s.locations.map(l => renderLocHtml(l)).join("")}
</body></html>`;

  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) { toast("⚠ Pop-up bloqueado. Permita pop-ups para esta página."); return; }
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 350);
}

/* ── Bootstrap ─────────────────────────────────────────────────── */
window.addEventListener("DOMContentLoaded",()=>{
  spLoad(); render();

  // Picker global
  document.getElementById("picker-close").addEventListener("click",closePicker);
  document.getElementById("picker-overlay").addEventListener("click",e=>{if(e.target.id==="picker-overlay")closePicker();});
  document.getElementById("picker-search").addEventListener("input",e=>renderPickerList(e.target.value.trim().toLowerCase()));

  // Nova sessão
  const doNew=()=>{
    sessions.unshift(newSession());spSave();render();
    setTimeout(()=>{
      const sb=document.querySelector(".session-block");sb?.classList.add("open");
      sb?.querySelector(".session-name-input")?.select();
    },40);
  };
  document.getElementById("btn-add-session").addEventListener("click",doNew);
  document.getElementById("btn-add-session-empty").addEventListener("click",doNew);

  window.addEventListener("beforeunload",spSave);
});
