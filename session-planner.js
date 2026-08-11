"use strict";
/* ================================================================
   session-planner.js — Planejador de Sessão | Grimório de Aether
   Persistência: localStorage chave "sp_sessions_v1"
   ================================================================ */

const SP_KEY = "sp_sessions_v1";

/* ── Estado ─────────────────────────────────────────────────────── */
let sessions    = [];   // lista de sessões salvas
let currentSess = null; // sessão em edição
let pickerCb    = null; // callback do picker
let pickerType  = "";   // "enemy" | "mission" | "item"
let pickerFilter= "";

/* ── Persistência ────────────────────────────────────────────────── */
function loadSessions() {
  try { sessions = JSON.parse(localStorage.getItem(SP_KEY)) || []; } catch { sessions = []; }
}
function saveSessions() {
  try { localStorage.setItem(SP_KEY, JSON.stringify(sessions)); } catch { console.warn("Falha ao salvar sessões"); }
}
function saveCurrentSession() {
  if (!currentSess) return;
  // Coleta campos do editor
  currentSess.name        = document.getElementById("sp-session-name")?.value.trim() || "Sessão sem nome";
  currentSess.number      = document.getElementById("sp-session-number")?.value.trim() || "";
  currentSess.date        = document.getElementById("sp-session-date")?.value || "";
  currentSess.players     = document.getElementById("sp-session-players")?.value.trim() || "";
  currentSess.strongStart = document.getElementById("sp-strong-start")?.value || "";
  currentSess.hook        = document.getElementById("sp-hook")?.value || "";
  currentSess.clock       = document.getElementById("sp-clock")?.value || "";
  currentSess.notes       = document.getElementById("sp-notes")?.value || "";
  currentSess.recap       = document.getElementById("sp-recap")?.value || "";
  // Secrets
  currentSess.secrets = [...document.querySelectorAll(".sp-secret-input")]
    .map(el => el.value.trim()).filter(Boolean);
  // Cenas (notas dos cards)
  currentSess.scenes.forEach((s, idx) => {
    const ta = document.getElementById(`scene-note-${idx}`);
    if (ta) s.note = ta.value;
  });
  // NPCs — notas
  currentSess.npcs.forEach((n, idx) => {
    const ta = document.getElementById(`npc-note-${idx}`);
    if (ta) n.note = ta.value;
  });
  // Inimigos — notas
  currentSess.enemies.forEach((e, idx) => {
    const ta = document.getElementById(`enemy-note-${idx}`);
    if (ta) e.note = ta.value;
  });
  // Missões — notas
  currentSess.missions.forEach((m, idx) => {
    const ta = document.getElementById(`mission-note-${idx}`);
    if (ta) m.note = ta.value;
  });
  // Locais — notas
  currentSess.locations.forEach((l, idx) => {
    const ta = document.getElementById(`location-note-${idx}`);
    if (ta) l.note = ta.value;
  });
  // Itens — notas
  currentSess.items.forEach((it, idx) => {
    const ta = document.getElementById(`item-note-${idx}`);
    if (ta) it.note = ta.value;
  });

  const idx = sessions.findIndex(s => s.id === currentSess.id);
  if (idx >= 0) sessions[idx] = currentSess;
  else sessions.unshift(currentSess);
  saveSessions();
  renderSessionList();
  showSPToast("💾 Sessão salva!");
}

/* ── Criação de nova sessão ──────────────────────────────────────── */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function newSession() {
  if (currentSess) saveCurrentSession();
  currentSess = {
    id: uid(), name:"Nova Sessão", number:"", date:"", players:"",
    status:"planejando",
    strongStart:"", hook:"", clock:"",
    scenes:[], npcs:[], enemies:[], missions:[], locations:[], items:[],
    secrets:["","",""],
    notes:"", recap:"",
    createdAt: new Date().toISOString(),
  };
  sessions.unshift(currentSess);
  saveSessions();
  renderSessionList();
  openSession(currentSess.id);
}

/* ── Renderização da lista de sessões ────────────────────────────── */
function renderSessionList() {
  const list  = document.getElementById("sp-session-list");
  const count = document.getElementById("sp-session-count");
  if (count) count.textContent = sessions.length;
  if (!list) return;
  if (sessions.length === 0) {
    list.innerHTML = `<div class="sp-empty-sidebar">Nenhuma sessão ainda.<br>Crie a primeira clicando em<br><strong>+ Nova Sessão</strong>.</div>`;
    return;
  }
  list.innerHTML = sessions.map(s => {
    const isActive = currentSess?.id === s.id;
    const meta = [s.number ? `#${s.number}` : null, s.date ? fmtDate(s.date) : null].filter(Boolean).join(" · ");
    const statusDot = { planejando:"🟡", pronta:"🟢", concluida:"⚫" }[s.status] || "🟡";
    return `
    <div class="sp-session-item ${isActive ? "active" : ""}" data-sess-id="${s.id}">
      <div class="sp-session-item-title">${statusDot} ${esc(s.name)}</div>
      ${meta ? `<div class="sp-session-item-meta">${meta}</div>` : ""}
      <div class="sp-session-item-meta" style="margin-top:3px">
        ${countBadge("⚔", s.enemies?.length)} ${countBadge("👤", s.npcs?.length)} ${countBadge("📜", s.missions?.length)}
      </div>
    </div>`;
  }).join("");
  list.querySelectorAll(".sp-session-item").forEach(el => {
    el.addEventListener("click", () => openSession(el.dataset.sessId));
  });
}
function countBadge(icon, n) { return n ? `<span style="font-size:10px">${icon}${n}</span>` : ""; }
function fmtDate(d) { try { return new Date(d).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}); } catch { return d; } }

/* ── Abrir sessão para edição ────────────────────────────────────── */
function openSession(id) {
  if (currentSess?.id !== id) {
    if (currentSess) saveCurrentSession();
    currentSess = sessions.find(s => s.id === id) || null;
  }
  if (!currentSess) return;
  renderSessionList();
  document.getElementById("sp-welcome").style.display = "none";
  const editor = document.getElementById("sp-editor");
  editor.style.display = "flex";

  // Preencher campos simples
  document.getElementById("sp-session-name").value    = currentSess.name;
  document.getElementById("sp-session-number").value  = currentSess.number || "";
  document.getElementById("sp-session-date").value    = currentSess.date || "";
  document.getElementById("sp-session-players").value = currentSess.players || "";
  document.getElementById("sp-strong-start").value    = currentSess.strongStart || "";
  document.getElementById("sp-hook").value            = currentSess.hook || "";
  document.getElementById("sp-clock").value           = currentSess.clock || "";
  document.getElementById("sp-notes").value           = currentSess.notes || "";
  document.getElementById("sp-recap").value           = currentSess.recap || "";

  // Status
  updateStatusBtn();

  // Renderizar cada aba
  renderScenesTab();
  renderNpcsTab();
  renderEnemiesTab();
  renderMissionsTab();
  renderLocationsTab();
  renderItemsTab();
  renderSecretsTab();
  renderOverview();
}

/* ── Status ──────────────────────────────────────────────────────── */
const STATUS_CYCLE = ["planejando","pronta","concluida"];
const STATUS_LABELS = { planejando:"Planejando", pronta:"Pronta ✓", concluida:"Concluída ✔" };
function updateStatusBtn() {
  const btn = document.getElementById("sp-status-btn");
  if (!btn || !currentSess) return;
  btn.textContent  = STATUS_LABELS[currentSess.status] || "Planejando";
  btn.className    = `sp-status-badge status-${currentSess.status}`;
}

/* ── Contadores das abas ─────────────────────────────────────────── */
function updateTabCounts() {
  if (!currentSess) return;
  const set = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n || ""; };
  set("cnt-scenes",   currentSess.scenes?.length   || 0);
  set("cnt-npcs",     currentSess.npcs?.length     || 0);
  set("cnt-enemies",  currentSess.enemies?.length   || 0);
  set("cnt-missions", currentSess.missions?.length  || 0);
  set("cnt-locations",currentSess.locations?.length || 0);
  set("cnt-items",    currentSess.items?.length     || 0);
  set("cnt-secrets",  (currentSess.secrets || []).filter(Boolean).length || 0);
}

/* ── Renderizações das abas ──────────────────────────────────────── */

// Cenas
function renderScenesTab() {
  const el = document.getElementById("scene-list");
  if (!el) return;
  el.innerHTML = (currentSess.scenes || []).map((s, idx) => `
    <div class="sp-element-card sp-card-scene">
      <span class="sp-drag-handle">⠿</span>
      <div class="sp-element-card-body">
        <div class="sp-element-card-name">🎭 ${esc(s.name)}</div>
        ${s.type ? `<div class="sp-element-card-sub">${esc(s.type)}</div>` : ""}
        <div class="sp-element-card-note">
          <textarea class="sp-element-card-note-input" id="scene-note-${idx}" rows="2" placeholder="O que acontece nesta cena... tensão, objetivo, possíveis saídas">${esc(s.note||"")}</textarea>
        </div>
      </div>
      <button class="sp-element-card-remove" data-remove-scene="${idx}">✕</button>
    </div>`).join("") || `<p style="color:var(--ink-soft);font-size:13px">Nenhuma cena planejada. Adicione cenas manuais abaixo.</p>`;
  el.querySelectorAll("[data-remove-scene]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentSess.scenes.splice(parseInt(btn.dataset.removeScene), 1);
      renderScenesTab(); updateTabCounts(); renderOverview();
    });
  });
  updateTabCounts();
}

// NPCs
function renderNpcsTab() {
  const el = document.getElementById("npc-list");
  if (!el) return;
  el.innerHTML = (currentSess.npcs || []).map((n, idx) => `
    <div class="sp-element-card sp-card-npc">
      <span class="sp-element-card-icon">👤</span>
      <div class="sp-element-card-body">
        <div class="sp-element-card-name">${esc(n.name)}</div>
        ${n.role ? `<div class="sp-element-card-sub">${esc(n.role)}</div>` : ""}
        <div class="sp-element-card-note">
          <textarea class="sp-element-card-note-input" id="npc-note-${idx}" rows="2"
            placeholder="Quer: ... | Se ajudado: ... | Se atrapalhado: ...">${esc(n.note||"")}</textarea>
        </div>
      </div>
      <button class="sp-element-card-remove" data-remove-npc="${idx}">✕</button>
    </div>`).join("") || `<p style="color:var(--ink-soft);font-size:13px">Nenhum NPC. Adicione abaixo.</p>`;
  el.querySelectorAll("[data-remove-npc]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentSess.npcs.splice(parseInt(btn.dataset.removeNpc), 1);
      renderNpcsTab(); updateTabCounts(); renderOverview();
    });
  });
  updateTabCounts();
}

// Inimigos / Encontros
function renderEnemiesTab() {
  const el = document.getElementById("enemy-list");
  if (!el) return;
  el.innerHTML = (currentSess.enemies || []).map((e, idx) => {
    const diffClass = `diff-${e.difficulty || 1}`;
    const diffLabel = ["","Fácil","Normal","Difícil","Elite","Lendário"][e.difficulty || 1] || "?";
    return `
    <div class="sp-element-card sp-card-enemy">
      <span class="sp-element-card-icon">${e.icon || "💀"}</span>
      <div class="sp-element-card-body">
        <div class="sp-element-card-name">${esc(e.name)} <span class="diff-badge ${diffClass}">Dif.${e.difficulty||1} — ${diffLabel}</span></div>
        ${e.category ? `<div class="sp-element-card-sub">${esc(e.category)}</div>` : ""}
        <div class="sp-element-card-note">
          <textarea class="sp-element-card-note-input" id="enemy-note-${idx}" rows="2"
            placeholder="Contexto deste encontro, variantes, arena especial...">${esc(e.note||"")}</textarea>
        </div>
      </div>
      <button class="sp-element-card-remove" data-remove-enemy="${idx}">✕</button>
    </div>`;
  }).join("") || `<p style="color:var(--ink-soft);font-size:13px">Nenhum inimigo. Busque no bestiário abaixo.</p>`;
  el.querySelectorAll("[data-remove-enemy]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentSess.enemies.splice(parseInt(btn.dataset.removeEnemy), 1);
      renderEnemiesTab(); updateTabCounts(); renderOverview();
    });
  });
  renderEncounterSummary();
  updateTabCounts();
}

// Resumo do encontro (estilo Kobold Fight Club)
function renderEncounterSummary() {
  const el = document.getElementById("encounter-summary");
  if (!el || !currentSess) return;
  const enemies = currentSess.enemies || [];
  if (enemies.length === 0) { el.innerHTML = ""; return; }
  const totalDiff = enemies.reduce((s, e) => s + (e.difficulty || 1), 0);
  const avgDiff   = (totalDiff / enemies.length).toFixed(1);
  const diffLevel = totalDiff <= 3 ? { l:"Tranquilo", c:"#27ae60" }
                  : totalDiff <= 7 ? { l:"Equilibrado", c:"#f39c12" }
                  : totalDiff <= 12 ? { l:"Desafiador", c:"#e67e22" }
                  : totalDiff <= 18 ? { l:"Perigoso", c:"#e74c3c" }
                  : { l:"Mortal", c:"#8e44ad" };
  const byDiff = enemies.reduce((a,e)=>{const d=e.difficulty||1;a[d]=(a[d]||0)+1;return a},{});
  const breakdown = Object.entries(byDiff).map(([d,n])=>`${n}× Dif.${d}`).join(", ");
  el.innerHTML = `
    <div style="padding:10px 12px;border-radius:8px;border:1px solid rgba(0,0,0,.1);background:rgba(0,0,0,.03);display:flex;gap:14px;flex-wrap:wrap;align-items:center">
      <div style="font-family:var(--font-heading);font-size:18px;color:${diffLevel.c}">${diffLevel.l}</div>
      <div style="font-size:12px;color:var(--ink-soft)">${enemies.length} inimigos · ${breakdown} · Dif. média ${avgDiff}</div>
    </div>`;
}

// Missões
function renderMissionsTab() {
  const el = document.getElementById("mission-list");
  if (!el) return;
  const icons = { facil:"🟢", normal:"🟡", dificil:"🔴" };
  el.innerHTML = (currentSess.missions || []).map((m, idx) => `
    <div class="sp-element-card sp-card-mission">
      <span class="sp-element-card-icon">${m.icon || "📜"}</span>
      <div class="sp-element-card-body">
        <div class="sp-element-card-name">${esc(m.title || m.name)} ${icons[m.difficulty] || ""}</div>
        ${m.hook ? `<div class="sp-element-card-sub" style="font-size:11px">${esc(m.hook.substring(0,80))}…</div>` : ""}
        <div class="sp-element-card-note">
          <textarea class="sp-element-card-note-input" id="mission-note-${idx}" rows="2"
            placeholder="Como esta missão se encaixa na sessão...">${esc(m.note||"")}</textarea>
        </div>
      </div>
      <button class="sp-element-card-remove" data-remove-mission="${idx}">✕</button>
    </div>`).join("") || `<p style="color:var(--ink-soft);font-size:13px">Nenhuma missão. Busque abaixo.</p>`;
  el.querySelectorAll("[data-remove-mission]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentSess.missions.splice(parseInt(btn.dataset.removeMission), 1);
      renderMissionsTab(); updateTabCounts(); renderOverview();
    });
  });
  updateTabCounts();
}

// Locais
function renderLocationsTab() {
  const el = document.getElementById("location-list");
  if (!el) return;
  el.innerHTML = (currentSess.locations || []).map((l, idx) => `
    <div class="sp-element-card sp-card-location">
      <span class="sp-element-card-icon">🗺</span>
      <div class="sp-element-card-body">
        <div class="sp-element-card-name">${esc(l.name)}</div>
        ${l.region ? `<div class="sp-element-card-sub">${esc(l.region)}</div>` : ""}
        <div class="sp-element-card-note">
          <textarea class="sp-element-card-note-input" id="location-note-${idx}" rows="3"
            placeholder="Óbvio: ... | Requer investigação: ... | Nunca revelado: ...">${esc(l.note||"")}</textarea>
        </div>
      </div>
      <button class="sp-element-card-remove" data-remove-location="${idx}">✕</button>
    </div>`).join("") || `<p style="color:var(--ink-soft);font-size:13px">Nenhum local. Adicione abaixo.</p>`;
  el.querySelectorAll("[data-remove-location]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentSess.locations.splice(parseInt(btn.dataset.removeLocation), 1);
      renderLocationsTab(); updateTabCounts(); renderOverview();
    });
  });
  updateTabCounts();
}

// Itens
function renderItemsTab() {
  const el = document.getElementById("item-list");
  if (!el) return;
  el.innerHTML = (currentSess.items || []).map((it, idx) => `
    <div class="sp-element-card sp-card-item">
      <span class="sp-element-card-icon">🎒</span>
      <div class="sp-element-card-body">
        <div class="sp-element-card-name">${esc(it.name)} <span class="catalog-item-tier tier-${it.tier||"comum"}">${it.tier||"comum"}</span></div>
        ${it.effect ? `<div class="sp-element-card-sub" style="font-size:11px">${esc(it.effect.substring(0,80))}…</div>` : ""}
        <div class="sp-element-card-note">
          <textarea class="sp-element-card-note-input" id="item-note-${idx}" rows="1"
            placeholder="Como o grupo encontra este item...">${esc(it.note||"")}</textarea>
        </div>
      </div>
      <button class="sp-element-card-remove" data-remove-item="${idx}">✕</button>
    </div>`).join("") || `<p style="color:var(--ink-soft);font-size:13px">Nenhum item. Busque no compêndio abaixo.</p>`;
  el.querySelectorAll("[data-remove-item]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentSess.items.splice(parseInt(btn.dataset.removeItem), 1);
      renderItemsTab(); updateTabCounts(); renderOverview();
    });
  });
  updateTabCounts();
}

// Segredos
function renderSecretsTab() {
  const el = document.getElementById("secret-list");
  if (!el) return;
  const secrets = currentSess.secrets || [];
  el.innerHTML = secrets.map((s, idx) => `
    <div class="sp-secret-item">
      <span class="sp-secret-icon">🔮</span>
      <textarea class="sp-secret-input" rows="2"
        placeholder="Segredo ou pista #${idx+1} — algo que os jogadores podem descobrir...">${esc(s)}</textarea>
      <button style="background:none;border:none;cursor:pointer;color:var(--ink-soft);font-size:16px;flex-shrink:0;padding:0 4px" data-remove-secret="${idx}" title="Remover">✕</button>
    </div>`).join("");
  el.querySelectorAll("[data-remove-secret]").forEach(btn => {
    btn.addEventListener("click", () => {
      // Salvar estado atual antes de remover
      el.querySelectorAll(".sp-secret-input").forEach((ta, i) => {
        if (currentSess.secrets[i] !== undefined) currentSess.secrets[i] = ta.value;
      });
      currentSess.secrets.splice(parseInt(btn.dataset.removeSecret), 1);
      renderSecretsTab(); updateTabCounts();
    });
  });
  updateTabCounts();
}

// Visão geral
function renderOverview() {
  if (!currentSess) return;
  // Inimigos
  const eList = document.getElementById("overview-enemies-list");
  if (eList) {
    eList.innerHTML = (currentSess.enemies || []).length === 0
      ? `<p style="font-size:12px;color:var(--ink-soft)">Nenhum encontro planejado.</p>`
      : (currentSess.enemies || []).map(e =>
          `<div class="sp-overview-stat"><span>${e.icon||"⚔"} ${esc(e.name)}</span><span class="sp-overview-stat-val">Dif.${e.difficulty||1}</span></div>`
        ).join("");
  }
  // NPCs
  const nList = document.getElementById("overview-npcs-list");
  if (nList) {
    nList.innerHTML = (currentSess.npcs || []).length === 0
      ? `<p style="font-size:12px;color:var(--ink-soft)">Nenhum NPC planejado.</p>`
      : (currentSess.npcs || []).map(n =>
          `<div class="sp-overview-stat"><span>👤 ${esc(n.name)}</span><span class="sp-overview-stat-val" style="font-size:11px">${esc(n.role||"")}</span></div>`
        ).join("");
  }
  // Missões
  const mList = document.getElementById("overview-missions-list");
  if (mList) {
    mList.innerHTML = (currentSess.missions || []).length === 0
      ? `<p style="font-size:12px;color:var(--ink-soft)">Nenhuma missão.</p>`
      : (currentSess.missions || []).map(m =>
          `<div class="sp-overview-stat"><span>${m.icon||"📜"} ${esc(m.title||m.name)}</span><span class="sp-overview-stat-val">${{facil:"Fácil",normal:"Normal",dificil:"Difícil"}[m.difficulty]||""}</span></div>`
        ).join("");
  }
  // Dificuldade
  const totalDiff = (currentSess.enemies || []).reduce((s,e)=>s+(e.difficulty||1),0);
  const maxDiff   = 20;
  const pct       = Math.min(100, (totalDiff / maxDiff) * 100);
  const fill = document.getElementById("difficulty-fill");
  const txt  = document.getElementById("difficulty-text");
  if (fill) {
    fill.style.width = pct + "%";
    fill.className   = "sp-difficulty-fill " + (pct<25?"diff-easy":pct<50?"diff-medium":pct<75?"diff-hard":"diff-deadly");
  }
  if (txt) {
    txt.textContent = totalDiff === 0 ? "Sem encontros"
      : pct < 25 ? `Tranquilo (Σ ${totalDiff})`
      : pct < 50 ? `Equilibrado (Σ ${totalDiff})`
      : pct < 75 ? `Desafiador (Σ ${totalDiff})`
      : `Perigoso / Mortal (Σ ${totalDiff})`;
    txt.style.color = pct<25?"#27ae60":pct<50?"#f39c12":pct<75?"#e74c3c":"#8e44ad";
  }
  // Stats gerais
  const stats = document.getElementById("overview-stats");
  if (stats) {
    const s = currentSess;
    stats.innerHTML = [
      ["🎭 Cenas",     (s.scenes||[]).length],
      ["📜 Missões",   (s.missions||[]).length],
      ["🗺 Locais",    (s.locations||[]).length],
      ["🎒 Itens",     (s.items||[]).length],
      ["🔮 Segredos",  (s.secrets||[]).filter(Boolean).length],
    ].map(([l,v])=>`<div class="sp-overview-stat"><span>${l}</span><span class="sp-overview-stat-val">${v}</span></div>`).join("");
  }
}

/* ── Picker (busca no compêndio) ─────────────────────────────────── */
function openPicker(type, onSelect) {
  pickerType = type;
  pickerCb   = onSelect;
  pickerFilter = "";

  const overlay = document.getElementById("sp-picker-overlay");
  const title   = document.getElementById("sp-picker-title");
  const chips   = document.getElementById("sp-picker-chips");
  const input   = document.getElementById("sp-picker-search-input");

  title.textContent = {
    enemy:"⚔ Buscar no Bestiário",
    mission:"📜 Buscar Missões",
    item:"🎒 Buscar no Compêndio de Itens",
  }[type] || "Selecionar";

  // Chips de filtro por tipo
  chips.innerHTML = "";
  if (type === "enemy") {
    [["Todos",""],["Dif.1","1"],["Dif.2","2"],["Dif.3","3"],["Dif.4","4"],["Dif.5","5"]].forEach(([l,v])=>{
      const btn = document.createElement("button");
      btn.className   = "sp-picker-chip" + (v===""?" active":"");
      btn.textContent = l;
      btn.addEventListener("click", () => {
        chips.querySelectorAll(".sp-picker-chip").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        pickerFilter = v;
        renderPickerList(input.value.trim().toLowerCase());
      });
      chips.appendChild(btn);
    });
  } else if (type === "mission") {
    [["Todas",""],["Fácil","facil"],["Normal","normal"],["Difícil","dificil"]].forEach(([l,v])=>{
      const btn = document.createElement("button");
      btn.className   = "sp-picker-chip" + (v===""?" active":"");
      btn.textContent = l;
      btn.addEventListener("click", () => {
        chips.querySelectorAll(".sp-picker-chip").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        pickerFilter = v;
        renderPickerList(input.value.trim().toLowerCase());
      });
      chips.appendChild(btn);
    });
  } else if (type === "item") {
    [["Todos",""],["Comum","comum"],["Raro","raro"],["Mágico","magico"],["Lendário","lendario"]].forEach(([l,v])=>{
      const btn = document.createElement("button");
      btn.className   = "sp-picker-chip" + (v===""?" active":"");
      btn.textContent = l;
      btn.addEventListener("click", () => {
        chips.querySelectorAll(".sp-picker-chip").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        pickerFilter = v;
        renderPickerList(input.value.trim().toLowerCase());
      });
      chips.appendChild(btn);
    });
  }

  input.value = "";
  overlay.classList.remove("hidden");
  input.focus();
  renderPickerList("");
}

function getPickerItems(q) {
  const lq = (q || "").toLowerCase();
  if (pickerType === "enemy") {
    const b = typeof BESTIARY !== "undefined" ? BESTIARY : [];
    return b.filter(m =>
      (!pickerFilter || String(m.difficulty) === pickerFilter) &&
      (!lq || m.name.toLowerCase().includes(lq) || (m.category||"").toLowerCase().includes(lq))
    ).map(m => ({
      id:m.id, name:m.name, icon:"💀", sub:`Dif.${m.difficulty} · ${m.category||""}`,
      raw:m,
    }));
  }
  if (pickerType === "mission") {
    const ms = typeof MISSIONS !== "undefined" ? MISSIONS : [];
    return ms.filter(m =>
      (!pickerFilter || m.difficulty === pickerFilter) &&
      (!lq || m.title.toLowerCase().includes(lq) || (m.hook||"").toLowerCase().includes(lq))
    ).map(m => ({
      id:m.id, name:m.title, icon:m.icon||"📜", sub:`${m.difficulty} · ${(m.tags||[]).join(", ")}`,
      raw:m,
    }));
  }
  if (pickerType === "item") {
    const all = [
      ...(typeof WEAPONS_ONE_HAND!=="undefined"?WEAPONS_ONE_HAND:[]),
      ...(typeof WEAPONS_TWO_HAND!=="undefined"?WEAPONS_TWO_HAND:[]),
      ...(typeof WEAPONS_MAGIC   !=="undefined"?WEAPONS_MAGIC   :[]),
      ...(typeof WEAPONS_RANGED  !=="undefined"?WEAPONS_RANGED  :[]),
      ...(typeof ARMORS          !=="undefined"?ARMORS          :[]),
      ...(typeof SHIELDS         !=="undefined"?SHIELDS         :[]),
      ...(typeof ACCESSORIES     !=="undefined"?ACCESSORIES     :[]),
    ];
    return all.filter(i =>
      (!pickerFilter || (i.tier||"comum") === pickerFilter) &&
      (!lq || i.name.toLowerCase().includes(lq) || (i.effect||"").toLowerCase().includes(lq))
    ).map(i => ({
      id:i.name, name:i.name, icon:"🎒",
      sub:`${i.tier||"comum"} · ${i.dmg||""} ${i.physDefense!==undefined?("Def."+i.physDefense):""}`.trim(),
      raw:i,
    }));
  }
  return [];
}

function renderPickerList(q) {
  const el = document.getElementById("sp-picker-list");
  const items = getPickerItems(q);
  if (items.length === 0) {
    el.innerHTML = `<div class="sp-picker-empty">Nenhum resultado.</div>`;
    return;
  }
  el.innerHTML = items.slice(0, 80).map((it, idx) => `
    <div class="sp-picker-item" data-picker-idx="${idx}">
      <span class="sp-picker-item-icon">${it.icon}</span>
      <div class="sp-picker-item-body">
        <div class="sp-picker-item-name">${esc(it.name)}</div>
        ${it.sub ? `<div class="sp-picker-item-sub">${esc(it.sub)}</div>` : ""}
      </div>
    </div>`).join("");
  const snapshot = items.slice(0, 80);
  el.querySelectorAll(".sp-picker-item").forEach((el2, idx) => {
    el2.addEventListener("click", () => {
      pickerCb && pickerCb(snapshot[idx]);
      closePicker();
    });
  });
}

function closePicker() {
  document.getElementById("sp-picker-overlay").classList.add("hidden");
  pickerCb = null;
}

/* ── Impressão ───────────────────────────────────────────────────── */
function printSession() {
  if (!currentSess) return;
  saveCurrentSession();
  const s = currentSess;
  const diffTot = (s.enemies||[]).reduce((a,e)=>a+(e.difficulty||1),0);
  const diffTxt = diffTot===0?"Sem encontros":diffTot<=3?"Tranquilo":diffTot<=7?"Equilibrado":diffTot<=12?"Desafiador":"Perigoso";

  const section = (title, items, fn) => items.length === 0 ? "" :
    `<h2>${title}</h2>${items.map(fn).join("")}`;

  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) { alert("Pop-up bloqueado."); return; }
  w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head>
<meta charset="UTF-8"><title>${esc(s.name)} — Grimório</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Crimson Text',Georgia,serif;font-size:12pt;color:#2a1a0e;background:#fff;padding:15mm 14mm;line-height:1.5}
h1{font-family:'IM Fell English',Georgia,serif;font-size:20pt;text-align:center;margin-bottom:2mm;border-bottom:2px solid #9c7a3c;padding-bottom:3mm;color:#3a2810}
h2{font-family:'IM Fell English',Georgia,serif;font-size:14pt;margin:6mm 0 3mm;color:#3a2810;border-bottom:1px solid #ccc;padding-bottom:1mm}
h3{font-family:'IM Fell English',Georgia,serif;font-size:12pt;margin:3mm 0 1mm;color:#5c3a1a}
.meta{text-align:center;color:#8a6a50;font-style:italic;font-size:10pt;margin-bottom:6mm}
.card{border:1px solid #c8a87a;border-left:4px solid #9c7a3c;border-radius:4px;padding:3mm 4mm;margin-bottom:3mm;break-inside:avoid}
.card-name{font-family:'IM Fell English',Georgia,serif;font-size:13pt}
.sub{font-size:10pt;color:#666;margin-top:1mm}
.note{font-size:10pt;color:#3a2810;margin-top:1.5mm;white-space:pre-wrap}
.secret{border-left:3px solid #6a3a7a;padding:2mm 3mm;margin-bottom:2mm;font-size:10.5pt}
.block{margin-bottom:5mm}
.block-label{font-size:9pt;text-transform:uppercase;letter-spacing:.4pt;color:#9c7a3c;margin-bottom:1mm}
.block-text{font-size:11pt;white-space:pre-wrap}
.diff{display:inline-block;padding:0 5px;border-radius:8px;font-size:9pt}
@media print{body{padding:8mm 10mm}.card{break-inside:avoid}}
</style></head><body>
<h1>${esc(s.name)}</h1>
<div class="meta">${s.number?"Sessão #"+s.number+" · ":""}${s.date?fmtDate(s.date)+" · ":""}${s.players||""} &nbsp;·&nbsp; ${diffTxt}</div>
${s.strongStart?`<div class="block"><div class="block-label">🎬 Início Forte</div><div class="block-text">${esc(s.strongStart)}</div></div>`:""}
${s.hook?`<div class="block"><div class="block-label">Gancho</div><div class="block-text">${esc(s.hook)}</div></div>`:""}
${s.clock?`<div class="block"><div class="block-label">⏰ Pressão</div><div class="block-text">${esc(s.clock)}</div></div>`:""}
${section("🎭 Cenas", s.scenes||[], sc=>`<div class="card"><div class="card-name">${esc(sc.name)}</div>${sc.note?`<div class="note">${esc(sc.note)}</div>`:""}</div>`)}
${section("👤 NPCs", s.npcs||[], n=>`<div class="card"><div class="card-name">👤 ${esc(n.name)}</div><div class="sub">${esc(n.role||"")}</div>${n.note?`<div class="note">${esc(n.note)}</div>`:""}</div>`)}
${section("⚔ Encontros", s.enemies||[], e=>`<div class="card"><div class="card-name">${esc(e.name)} <span class="diff">Dif.${e.difficulty||1}</span></div><div class="sub">${esc(e.category||"")}</div>${e.note?`<div class="note">${esc(e.note)}</div>`:""}</div>`)}
${section("📜 Missões", s.missions||[], m=>`<div class="card"><div class="card-name">${esc(m.title||m.name)}</div><div class="sub">${m.difficulty||""} ${m.tags?(m.tags||[]).join(", "):""}</div>${m.note?`<div class="note">${esc(m.note)}</div>`:""}</div>`)}
${section("🗺 Locais", s.locations||[], l=>`<div class="card"><div class="card-name">${esc(l.name)}</div>${l.region?`<div class="sub">${esc(l.region)}</div>`:""}${l.note?`<div class="note">${esc(l.note)}</div>`:""}</div>`)}
${section("🎒 Itens", s.items||[], it=>`<div class="card"><div class="card-name">${esc(it.name)}</div><div class="sub">${it.tier||""}</div>${it.note?`<div class="note">${esc(it.note)}</div>`:""}</div>`)}
${(s.secrets||[]).filter(Boolean).length?`<h2>🔮 Segredos & Pistas</h2>${(s.secrets||[]).filter(Boolean).map(sec=>`<div class="secret">${esc(sec)}</div>`).join("")}`:""}
${s.notes?`<h2>📝 Notas</h2><div class="block-text" style="font-size:11pt">${esc(s.notes)}</div>`:""}
</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function esc(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function showSPToast(msg) {
  let t = document.getElementById("sp-toast");
  if (!t) { t=document.createElement("div"); t.id="sp-toast"; Object.assign(t.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:"rgba(30,30,30,.9)",color:"#fff",padding:"10px 18px",borderRadius:"20px",fontSize:"14px",zIndex:"999",transition:"opacity .3s",maxWidth:"90vw",textAlign:"center"}); document.body.appendChild(t); }
  t.textContent=msg; t.style.opacity="1"; clearTimeout(t._t); t._t=setTimeout(()=>{t.style.opacity="0";},2500);
}

/* ── Prompt para input manual ────────────────────────────────────── */
function promptAdd(placeholder, fields) {
  return new Promise(resolve => {
    const overlay = document.createElement("div");
    Object.assign(overlay.style,{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"});
    const modal = document.createElement("div");
    Object.assign(modal.style,{background:"var(--parchment)",borderRadius:"12px",border:"1px solid var(--line)",padding:"20px",maxWidth:"400px",width:"100%",display:"flex",flexDirection:"column",gap:"10px"});
    modal.innerHTML = `<div style="font-family:var(--font-heading);font-size:15px;color:var(--ink)">${placeholder}</div>
      ${fields.map(f=>`<input id="pf-${f.key}" placeholder="${f.label}" value="${f.default||""}" style="padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-family:var(--font-heading);font-size:13px;background:rgba(255,255,255,.7);color:var(--ink)">`).join("")}
      <div style="display:flex;gap:8px">
        <button id="pf-ok"     style="flex:1;padding:10px;border:none;border-radius:6px;background:var(--gold);color:#fff;font-family:var(--font-heading);cursor:pointer">Adicionar</button>
        <button id="pf-cancel" style="flex:1;padding:10px;border:1px solid var(--line);border-radius:6px;background:transparent;font-family:var(--font-heading);cursor:pointer">Cancelar</button>
      </div>`;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    const firstInput = modal.querySelector("input");
    if (firstInput) { firstInput.focus(); firstInput.addEventListener("keydown", e=>{ if(e.key==="Enter") modal.querySelector("#pf-ok").click(); }); }
    modal.querySelector("#pf-ok").addEventListener("click", () => {
      const result = {};
      fields.forEach(f => { result[f.key] = modal.querySelector(`#pf-${f.key}`)?.value.trim()||""; });
      document.body.removeChild(overlay);
      resolve(result);
    });
    modal.querySelector("#pf-cancel").addEventListener("click", () => {
      document.body.removeChild(overlay);
      resolve(null);
    });
  });
}

/* ── Bootstrap ───────────────────────────────────────────────────── */
window.addEventListener("DOMContentLoaded", () => {
  loadSessions();
  renderSessionList();
  if (sessions.length > 0) openSession(sessions[0].id);

  // Abas do editor
  document.querySelectorAll(".sp-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".sp-tab-btn").forEach(b=>b.classList.remove("active"));
      document.querySelectorAll(".sp-tab-content").forEach(c=>c.classList.remove("active"));
      btn.classList.add("active");
      const content = document.querySelector(`[data-sptab-content="${btn.dataset.sptab}"]`);
      if (content) content.classList.add("active");
      if (btn.dataset.sptab === "overview") renderOverview();
    });
  });

  // Botões nova sessão
  document.getElementById("btn-sp-new")?.addEventListener("click", newSession);
  document.getElementById("btn-welcome-new")?.addEventListener("click", newSession);

  // Salvar
  const doSave = () => saveCurrentSession();
  document.getElementById("btn-sp-save")?.addEventListener("click", doSave);
  document.getElementById("btn-sp-save2")?.addEventListener("click", doSave);

  // Imprimir
  document.getElementById("btn-sp-print")?.addEventListener("click", printSession);

  // Status cycle
  document.getElementById("sp-status-btn")?.addEventListener("click", () => {
    if (!currentSess) return;
    const idx = STATUS_CYCLE.indexOf(currentSess.status);
    currentSess.status = STATUS_CYCLE[(idx+1) % STATUS_CYCLE.length];
    updateStatusBtn();
  });

  // Picker fechar
  document.getElementById("sp-picker-close")?.addEventListener("click", closePicker);
  document.getElementById("sp-picker-overlay")?.addEventListener("click", e => { if(e.target.id==="sp-picker-overlay") closePicker(); });
  document.getElementById("sp-picker-search-input")?.addEventListener("input", e => renderPickerList(e.target.value.trim()));

  // ── Adicionar Cena manual ───────────────────────────────────────
  document.getElementById("btn-add-scene-manual")?.addEventListener("click", async () => {
    const r = await promptAdd("🎭 Nova Cena", [
      { key:"name", label:"Nome da cena" },
      { key:"type", label:"Tipo (combate, social, exploração, revelação...)" },
    ]);
    if (!r?.name) return;
    currentSess.scenes.push({ name:r.name, type:r.type, note:"" });
    renderScenesTab(); renderOverview();
  });

  // ── Adicionar NPC manual ────────────────────────────────────────
  document.getElementById("btn-add-npc-manual")?.addEventListener("click", async () => {
    const r = await promptAdd("👤 Novo NPC", [
      { key:"name", label:"Nome do NPC" },
      { key:"role", label:"Papel / profissão" },
    ]);
    if (!r?.name) return;
    currentSess.npcs.push({ name:r.name, role:r.role, note:"" });
    renderNpcsTab(); renderOverview();
  });

  // ── Adicionar Inimigo do bestiário ──────────────────────────────
  document.getElementById("btn-add-enemy")?.addEventListener("click", () => {
    openPicker("enemy", item => {
      const m = item.raw;
      currentSess.enemies.push({ name:m.name, difficulty:m.difficulty, category:m.category, icon:"💀", id:m.id, note:"" });
      renderEnemiesTab(); renderOverview();
    });
  });

  // ── Adicionar Inimigo manual ────────────────────────────────────
  document.getElementById("btn-add-enemy-manual")?.addEventListener("click", async () => {
    const r = await promptAdd("⚔ Inimigo Manual", [
      { key:"name", label:"Nome do inimigo" },
      { key:"difficulty", label:"Dificuldade (1-5)", default:"2" },
    ]);
    if (!r?.name) return;
    currentSess.enemies.push({ name:r.name, difficulty:parseInt(r.difficulty)||2, icon:"💀", note:"" });
    renderEnemiesTab(); renderOverview();
  });

  // ── Adicionar Missão do compêndio ───────────────────────────────
  document.getElementById("btn-add-mission")?.addEventListener("click", () => {
    openPicker("mission", item => {
      const m = item.raw;
      currentSess.missions.push({ ...m, note:"" });
      renderMissionsTab(); renderOverview();
    });
  });

  // ── Adicionar objetivo manual ───────────────────────────────────
  document.getElementById("btn-add-mission-manual")?.addEventListener("click", async () => {
    const r = await promptAdd("📜 Novo Objetivo", [
      { key:"name", label:"Título do objetivo" },
      { key:"difficulty", label:"Dificuldade (facil/normal/dificil)", default:"normal" },
    ]);
    if (!r?.name) return;
    currentSess.missions.push({ title:r.name, difficulty:r.difficulty||"normal", icon:"📜", note:"" });
    renderMissionsTab(); renderOverview();
  });

  // ── Adicionar Local manual ──────────────────────────────────────
  document.getElementById("btn-add-location-manual")?.addEventListener("click", async () => {
    const r = await promptAdd("🗺 Novo Local", [
      { key:"name", label:"Nome do local" },
      { key:"region", label:"Região / reino" },
    ]);
    if (!r?.name) return;
    currentSess.locations.push({ name:r.name, region:r.region, note:"" });
    renderLocationsTab(); updateTabCounts();
  });

  // ── Adicionar Item do compêndio ─────────────────────────────────
  document.getElementById("btn-add-item")?.addEventListener("click", () => {
    openPicker("item", item => {
      const it = item.raw;
      currentSess.items.push({ name:it.name, tier:it.tier||"comum", effect:it.effect, note:"" });
      renderItemsTab(); renderOverview();
    });
  });

  // ── Adicionar Item manual ───────────────────────────────────────
  document.getElementById("btn-add-item-manual")?.addEventListener("click", async () => {
    const r = await promptAdd("🎒 Novo Item", [
      { key:"name",  label:"Nome do item" },
      { key:"tier",  label:"Tier (comum/raro/lendario)", default:"comum" },
    ]);
    if (!r?.name) return;
    currentSess.items.push({ name:r.name, tier:r.tier||"comum", note:"" });
    renderItemsTab(); updateTabCounts();
  });

  // ── Adicionar Segredo ───────────────────────────────────────────
  document.getElementById("btn-add-secret")?.addEventListener("click", () => {
    if (!currentSess) return;
    if (!currentSess.secrets) currentSess.secrets = [];
    // Salvar estado atual dos textareas
    document.querySelectorAll(".sp-secret-input").forEach((ta, i) => {
      if (currentSess.secrets[i] !== undefined) currentSess.secrets[i] = ta.value;
    });
    currentSess.secrets.push("");
    renderSecretsTab();
    // Foco no último textarea
    setTimeout(() => {
      const inputs = document.querySelectorAll(".sp-secret-input");
      if (inputs.length) inputs[inputs.length-1].focus();
    }, 50);
  });

  // Autosave ao fechar
  window.addEventListener("beforeunload", () => { if(currentSess) saveCurrentSession(); });
});
