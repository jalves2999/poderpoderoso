"use strict";

function escapeHTML(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* ── Filtros ─────────────────────────────────────────────────── */
let filters = { difficulty: "", size: "", location: "", search: "" };

/* ── Modal de Batalha ────────────────────────────────────────── */
let battle = [];  // [{ id, name, hpMax, hpCurrent, size, diff }]
let battleOpen = false;

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  buildFilters();
  renderContent();
  bindFilters();
  bindBattle();
});

/* ── Bind filtros ────────────────────────────────────────────── */
function bindFilters() {
  document.getElementById("search-input").addEventListener("input", e => {
    filters.search = e.target.value.toLowerCase().trim();
    renderContent();
  });

  ["diff-select","size-select","loc-select"].forEach(id => {
    document.getElementById(id).addEventListener("change", e => {
      if (id === "diff-select")  filters.difficulty = e.target.value;
      if (id === "size-select")  filters.size       = e.target.value;
      if (id === "loc-select")   filters.location   = e.target.value;
      document.getElementById(id).classList.toggle("has-value", !!e.target.value);
      updateActiveFilters();
      renderContent();
    });
  });
}

function clearAllFilters() {
  filters = { difficulty: "", size: "", location: "", search: "" };
  document.getElementById("search-input").value = "";
  ["diff-select","size-select","loc-select"].forEach(id => {
    document.getElementById(id).value = "";
    document.getElementById(id).classList.remove("has-value");
  });
  updateActiveFilters();
  renderContent();
}

/* ── Select de locais ────────────────────────────────────────── */
function buildFilters() {
  const LOC_ICONS = {
    Floresta:'🌲', Caverna:'🕳', Dungeon:'⚓', Cidade:'🏘',
    Ruínas:'🏚', Planície:'🌾', Montanha:'⛰', Pântano:'🌿',
    Deserto:'🏜', Cemitério:'💀', Templo:'🏛', Estrada:'🛤'
  };
  const allLocs = [...new Set(BESTIARY.flatMap(m => m.location))].sort();
  const locSel = document.getElementById("loc-select");
  allLocs.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = (LOC_ICONS[l] ? LOC_ICONS[l] + " " : "") + l;
    locSel.appendChild(opt);
  });
  updateActiveFilters();
}

/* ── Tags de filtros ativos ──────────────────────────────────── */
function updateActiveFilters() {
  const active = [];
  if (filters.difficulty) active.push({ label: diffLabel(parseInt(filters.difficulty)), key: "difficulty" });
  if (filters.size)       active.push({ label: filters.size[0].toUpperCase()+filters.size.slice(1), key: "size" });
  if (filters.location)   active.push({ label: filters.location, key: "location" });
  if (filters.search)     active.push({ label: `"${filters.search}"`, key: "search" });

  const bar = document.getElementById("active-filters");
  if (active.length === 0) { bar.innerHTML = ""; return; }

  bar.innerHTML = active.map(f =>
    `<button class="active-filter-tag" data-clear-filter="${f.key}">${escapeHTML(f.label)} ✕</button>`
  ).join("") + `<button class="active-filter-clear" id="btn-clear-all">Limpar tudo</button>`;

  bar.querySelectorAll("[data-clear-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.clearFilter;
      filters[key] = "";
      if (key === "search") document.getElementById("search-input").value = "";
      if (key === "difficulty") { document.getElementById("diff-select").value = ""; document.getElementById("diff-select").classList.remove("has-value"); }
      if (key === "size")       { document.getElementById("size-select").value = ""; document.getElementById("size-select").classList.remove("has-value"); }
      if (key === "location")   { document.getElementById("loc-select").value = "";  document.getElementById("loc-select").classList.remove("has-value"); }
      updateActiveFilters();
      renderContent();
    });
  });
  document.getElementById("btn-clear-all")?.addEventListener("click", clearAllFilters);
}

/* ── Conteúdo ─────────────────────────────────────────────────── */
function renderContent() {
  const { difficulty, size, location, search } = filters;
  const list = BESTIARY.filter(m => {
    if (difficulty && m.difficulty !== parseInt(difficulty)) return false;
    if (size       && m.size !== size)                        return false;
    if (location   && !m.location.includes(location))         return false;
    if (search     && !m.name.toLowerCase().includes(search)
                   && !m.category.toLowerCase().includes(search)) return false;
    return true;
  });

  const container = document.getElementById("bestiary-content");
  const countEl   = document.getElementById("result-count");
  if (countEl) countEl.textContent = `${list.length} criatura${list.length !== 1 ? "s" : ""}`;

  if (list.length === 0) {
    container.innerHTML = `<p class="bestiary-empty">Nenhuma criatura encontrada.<br>Tente remover alguns filtros.</p>`;
    return;
  }

  const byDiff = {};
  list.forEach(m => { (byDiff[m.difficulty] = byDiff[m.difficulty] || []).push(m); });

  container.innerHTML = Object.keys(byDiff).sort((a,b)=>a-b).map(d => `
    <div class="bestiary-group">
      <h3 class="bestiary-group-title diff-${d}">${diffLabel(d)}</h3>
      ${byDiff[d].map(renderMonsterCard).join("")}
    </div>
  `).join("");

  container.querySelectorAll(".monster-card-header").forEach(header => {
    header.addEventListener("click", () => {
      const card = header.closest(".monster-card");
      const wasOpen = card.classList.contains("expanded");
      document.querySelectorAll(".monster-card.expanded").forEach(c => c.classList.remove("expanded"));
      if (!wasOpen) card.classList.add("expanded");
    });
  });

  container.querySelectorAll("[data-add-to-battle]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = btn.dataset.addToBattle;
      const monster = BESTIARY.find(m => m.id === id);
      if (monster) addToBattle(monster);
    });
  });
}

/* ── Card de monstro ─────────────────────────────────────────── */
function diffLabel(d) {
  return { 1:"☠ Fácil", 2:"☠☠ Equilibrado", 3:"☠☠☠ Desafiador", 4:"☠☠☠☠ Muito Forte", 5:"☠☠☠☠☠ Chefe/Lenda" }[d] || "Dif."+d;
}
function sizeIcon(s) {
  return { pequeno:"🐭", normal:"🧍", grande:"🦁", colossal:"🐉" }[s] || "?";
}
function diffCardClass(d) { return `diff-card-${d}`; }

function renderMonsterCard(m) {
  const skulls = "☠".repeat(m.difficulty);
  const lootRows = m.loot.map(l => `
    <div class="monster-loot-row">
      <span class="monster-loot-chance">${l.chance}%</span>
      <span class="monster-loot-item">${l.item}</span>
      <span class="monster-loot-qty">${l.qty}</span>
    </div>`).join("");

  const abilitiesHTML = m.abilities.map(a => `
    <div class="monster-ability">
      <strong class="monster-ability-name">${a.name}:</strong>
      <span class="monster-ability-desc"> ${a.desc}</span>
    </div>`).join("");

  const spellsHTML = m.spells?.length ? `
    <div class="monster-detail-block">
      <div class="monster-detail-title">✨ Magias</div>
      ${m.spells.map(s => `
        <div class="monster-ability">
          <strong class="monster-ability-name">${s.name}:</strong>
          <span class="monster-ability-desc"> ${s.desc}</span>
        </div>`).join("")}
    </div>` : "";

  const storyHTML = m.story ? `
    <div class="monster-detail-block monster-story-block">
      <div class="monster-detail-title">📖 História</div>
      <p class="monster-story-text">${m.story}</p>
    </div>` : "";

  const LOC_ICONS = {Floresta:'🌲',Caverna:'🕳',Dungeon:'⚓',Cidade:'🏘',Ruínas:'🏚',Planície:'🌾',Montanha:'⛰',Pântano:'🌿',Deserto:'🏜',Cemitério:'💀',Templo:'🏛',Estrada:'🛤'};
  const locStr = m.location.map(l => (LOC_ICONS[l]||'') + ' ' + l).join(' · ');

  return `
  <div class="monster-card ${diffCardClass(m.difficulty)} ${m.isElite ? "monster-card-elite" : ""}">
    <div class="monster-card-header">
      <div class="monster-card-title-row">
        <span class="monster-size-icon" title="${m.size}">${sizeIcon(m.size)}</span>
        <div class="monster-card-title-block">
          <span class="monster-name">${m.name}${m.isElite?" ⭐":""}</span>
          <span class="monster-meta">${m.category} · ${locStr}</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
          <span class="monster-skulls diff-skulls-${m.difficulty}" title="Dif. ${m.difficulty}">${skulls}</span>
          <button class="battle-add-btn ${inBattle?"battle-add-btn--active":""}" data-add-to-battle="${m.id}" title="Adicionar à batalha">⚔ Batalha</button>
        </div>
      </div>
      <div class="monster-stat-chips">
        <span class="monster-chip chip-hp">❤ ${m.hp}<small>HP</small></span>
        <span class="monster-chip chip-def">🛡 ${m.physDefense}<small>Def. Física</small></span>
        <span class="monster-chip chip-mag">✨ ${m.magDefense}<small>Def. Mágica</small></span>
        <span class="monster-chip chip-dodge">${m.dodge}<small>Esquiva</small></span>
        <span class="monster-chip chip-act">${m.actions}<small>Ações</small></span>
        <span class="monster-chip chip-dmg">⚔ ${m.damage}<small>Dano</small></span>
      </div>
      <div class="monster-attrs">
        ${['FOR','DEX','AGI','INT','SAB'].map(k => `
          <div class="monster-attr ${k==='DEX'?'attr-dex':''}">
            <span class="monster-attr-key">${k}</span>
            <span class="monster-attr-val">${m.attrs?.[k] ?? 0}</span>
          </div>`).join('')}
      </div>
      <div class="monster-expand-hint">▾ Toque para detalhes</div>
    </div>
    <div class="monster-card-details">
      ${abilitiesHTML ? `<div class="monster-detail-block"><div class="monster-detail-title">⚡ Habilidades</div>${abilitiesHTML}</div>` : ""}
      ${spellsHTML}
      <div class="monster-detail-block">
        <div class="monster-detail-title">🧠 Comportamento</div>
        <p class="monster-behavior-text">${m.behavior}</p>
      </div>
      <div class="monster-detail-block">
        <div class="monster-detail-title">💰 Loot</div>
        ${lootRows}
      </div>
      ${storyHTML}
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════════════════════════
   MODAL DE BATALHA
   ═══════════════════════════════════════════════════════════════ */

function bindBattle() {
  document.getElementById("battle-fab").addEventListener("click", toggleBattleModal);
  document.getElementById("battle-modal-overlay").addEventListener("click", e => {
    if (e.target === document.getElementById("battle-modal-overlay")) closeBattleModal();
  });
  document.getElementById("btn-battle-close").addEventListener("click", closeBattleModal);
  document.getElementById("btn-battle-clear").addEventListener("click", () => {
    if (battle.length === 0 || confirm("Remover todos os monstros da batalha?")) {
      battle = [];
      renderBattle();
      updateBattleFAB();
    }
  });
  document.getElementById("battle-custom-add").addEventListener("click", addCustomMonster);
}

let battleIdCounter = 0;

function addToBattle(monster) {
  battle.push({
    uid: ++battleIdCounter,
    sourceId: monster.id,
    name: monster.name,
    hpMax: monster.hp,
    hpCurrent: monster.hp,
    size: monster.size,
    diff: monster.difficulty,
    isElite: !!monster.isElite
  });
  renderBattle();
  updateBattleFAB();
  if (!battleOpen) openBattleModal();
  else document.getElementById("battle-modal-overlay").classList.add("flash");
  setTimeout(() => document.getElementById("battle-modal-overlay")?.classList.remove("flash"), 300);
  renderContent();
}

function addCustomMonster() {
  const nameEl  = document.getElementById("battle-custom-name");
  const hpEl    = document.getElementById("battle-custom-hp");
  const name  = nameEl.value.trim() || "Monstro Customizado";
  const hp    = parseInt(hpEl.value) || 10;
  battle.push({ uid: ++battleIdCounter, sourceId: null, name, hpMax: hp, hpCurrent: hp, size: "normal", diff: 1, isElite: false });
  nameEl.value = "";
  hpEl.value = "";
  renderBattle();
  updateBattleFAB();
}

function toggleBattleModal() {
  if (battleOpen) closeBattleModal(); else openBattleModal();
}
function openBattleModal() {
  battleOpen = true;
  document.getElementById("battle-modal-overlay").classList.add("open");
  renderBattle();
}
function closeBattleModal() {
  battleOpen = false;
  document.getElementById("battle-modal-overlay").classList.remove("open");
}

function updateBattleFAB() {
  const fab = document.getElementById("battle-fab");
  const alive = battle.filter(m => m.hpCurrent > 0).length;
  fab.innerHTML = `⚔ ${battle.length > 0 ? alive+"/"+battle.length : "Batalha"}`;
  fab.classList.toggle("battle-fab--active", battle.length > 0);
}

function renderBattle() {
  const container = document.getElementById("battle-list");
  if (battle.length === 0) {
    container.innerHTML = `<p class="battle-empty">Nenhum monstro na batalha.<br>Clique em ⚔ Batalha em qualquer monstro para adicioná-lo.</p>`;
    return;
  }

  container.innerHTML = battle.map(m => {
    const pct = Math.max(0, Math.round((m.hpCurrent / m.hpMax) * 100));
    const barColor = pct > 60 ? "#4a9e50" : pct > 25 ? "#c8a020" : "#c83020";
    const isDead = m.hpCurrent <= 0;
    return `
    <div class="battle-entry ${isDead ? "battle-entry--dead" : ""}">
      <div class="battle-entry-head">
        <span class="battle-entry-name">${escapeHTML(m.name)}${m.isElite?" ⭐":""}</span>
        <button class="battle-remove-btn" data-battle-remove="${m.uid}" title="Remover">✕</button>
      </div>
      <div class="battle-hp-row">
        <button class="battle-hp-btn" data-battle-dmg="${m.uid}" data-amount="-1">−1</button>
        <button class="battle-hp-btn" data-battle-dmg="${m.uid}" data-amount="-5">−5</button>
        <button class="battle-hp-btn" data-battle-dmg="${m.uid}" data-amount="-10">−10</button>
        <div class="battle-hp-display ${isDead?"battle-hp-dead":""}">
          <span class="battle-hp-current">${isDead ? "☠" : m.hpCurrent}</span>
          <span class="battle-hp-sep">/</span>
          <span class="battle-hp-max">${m.hpMax}</span>
        </div>
        <button class="battle-hp-btn battle-hp-btn--heal" data-battle-dmg="${m.uid}" data-amount="5">+5</button>
        <button class="battle-hp-btn battle-hp-btn--heal" data-battle-dmg="${m.uid}" data-amount="10">+10</button>
      </div>
      <div class="battle-hp-bar-track">
        <div class="battle-hp-bar-fill" style="width:${pct}%;background:${barColor}"></div>
      </div>
      <div class="battle-custom-dmg-row">
        <input type="number" class="battle-custom-input" id="battle-custom-val-${m.uid}" placeholder="dano / cura" min="-9999" max="9999">
        <button class="battle-hp-btn" data-battle-dmg="${m.uid}" data-amount="custom">Aplicar</button>
        <button class="battle-hp-btn" data-battle-set-hp="${m.uid}" title="Definir HP manualmente">Setar HP</button>
      </div>
    </div>`;
  }).join("");

  // Handlers de dano/cura
  container.querySelectorAll("[data-battle-dmg]").forEach(btn => {
    btn.addEventListener("click", () => {
      const uid = parseInt(btn.dataset.battleDmg);
      const monster = battle.find(m => m.uid === uid);
      if (!monster) return;
      let amount;
      if (btn.dataset.amount === "custom") {
        const inp = document.getElementById(`battle-custom-val-${uid}`);
        amount = parseInt(inp?.value) || 0;
        if (inp) inp.value = "";
      } else {
        amount = parseInt(btn.dataset.amount);
      }
      monster.hpCurrent = Math.max(0, Math.min(monster.hpMax, monster.hpCurrent + amount));
      renderBattle();
      updateBattleFAB();
    });
  });

  container.querySelectorAll("[data-battle-set-hp]").forEach(btn => {
    btn.addEventListener("click", () => {
      const uid = parseInt(btn.dataset.battleSetHp);
      const monster = battle.find(m => m.uid === uid);
      if (!monster) return;
      const inp = document.getElementById(`battle-custom-val-${uid}`);
      const val = parseInt(inp?.value);
      if (!isNaN(val)) {
        monster.hpCurrent = Math.max(0, Math.min(monster.hpMax, val));
        if (inp) inp.value = "";
        renderBattle();
        updateBattleFAB();
      }
    });
  });

  container.querySelectorAll("[data-battle-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const uid = parseInt(btn.dataset.battleRemove);
      battle = battle.filter(m => m.uid !== uid);
      renderBattle();
      updateBattleFAB();
      renderContent();
    });
  });
}
