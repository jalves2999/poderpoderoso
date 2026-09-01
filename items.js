/* ══════════════════════════════════════════════════════════════
   COMPÊNDIO DE ITENS — Página dedicada
   Filtros por categoria, tier, nome, dano, peso e sets.
   Cards clicáveis abrem modal com informações completas.
   ══════════════════════════════════════════════════════════════ */

/* ── Configuração ───────────────────────────────────────────── */

const TIER_LABELS = {
  comum: "Comum", raro: "Raro", magico: "Mágico",
  lendario: "Lendário", unico: "Único", ancestral: "Ancestral"
};
const TIER_ORDER = { comum: 0, raro: 1, magico: 2, lendario: 3, unico: 4, ancestral: 5 };

const CATEGORIES = [
  { key: "todos",      label: "Todos",           icon: "📦" },
  { key: "weapon1h",   label: "Armas 1 Mão",     icon: "🗡" },
  { key: "weapon2h",   label: "Armas 2 Mãos",    icon: "⚔" },
  { key: "weaponmag",  label: "Armas Mágicas",   icon: "🪄" },
  { key: "weaponrng",  label: "À Distância",     icon: "🏹" },
  { key: "shield",     label: "Escudos",         icon: "🛡" },
  { key: "armor",      label: "Armaduras",       icon: "🧥" },
  { key: "accessory",  label: "Acessórios",      icon: "💍" },
  { key: "potion",     label: "Poções",          icon: "🧪" },
  { key: "material",   label: "Materiais",       icon: "🪨" },
  { key: "scroll",     label: "Pergaminhos",     icon: "📜" },
  { key: "artefato",   label: "Artefatos",       icon: "✨" },
  { key: "gear",       label: "Equipamento",     icon: "🎒" },
];

const SPECIAL_FILTERS = [
  { key: "set",     label: "🔗 Parte de Set" },
  { key: "unique",  label: "⭐ Hab. Única" },
  { key: "charges", label: "🔵 Com Cargas" },
  { key: "magic",   label: "✨ Bônus Mágico" },
];

/* ── Estado ─────────────────────────────────────────────────── */

const state = {
  search: "",
  category: "todos",
  tiers: new Set(),
  specials: new Set(),
  maxWeight: 20,
  minDmg: 0,
};

/* ── Normalização: unifica todos os arrays num formato único ── */

function buildItemPool() {
  const pool = [];
  const add = (arr, category, categoryLabel, icon) => {
    (arr || []).filter(Boolean).forEach(item => {
      pool.push({ ...item, _cat: category, _catLabel: categoryLabel, _icon: icon });
    });
  };

  add(typeof WEAPONS_ONE_HAND !== "undefined" ? WEAPONS_ONE_HAND : [], "weapon1h",  "Armas de Uma Mão",  "🗡");
  add(typeof WEAPONS_TWO_HAND !== "undefined" ? WEAPONS_TWO_HAND : [], "weapon2h",  "Armas de Duas Mãos","⚔");
  add(typeof WEAPONS_MAGIC    !== "undefined" ? WEAPONS_MAGIC    : [], "weaponmag", "Armas Mágicas",     "🪄");
  add(typeof WEAPONS_RANGED   !== "undefined" ? WEAPONS_RANGED   : [], "weaponrng", "Armas à Distância", "🏹");
  add(typeof SHIELDS          !== "undefined" ? SHIELDS          : [], "shield",    "Escudos",           "🛡");
  add(typeof ARMORS           !== "undefined" ? ARMORS           : [], "armor",     "Armaduras",         "🧥");
  add(typeof ACCESSORIES      !== "undefined" ? ACCESSORIES      : [], "accessory", "Acessórios",        "💍");

  // MISC_ITEMS é dividido por subcategoria
  const miscMap = {
    potion:        { cat: "potion",    label: "Poções e Consumíveis", icon: "🧪" },
    material:      { cat: "material",  label: "Materiais",            icon: "🪨" },
    scroll:        { cat: "scroll",    label: "Pergaminhos",          icon: "📜" },
    recipe_scroll: { cat: "scroll",    label: "Pergaminhos",          icon: "📜" },
    artefato:      { cat: "artefato",  label: "Artefatos",            icon: "✨" },
    gear:          { cat: "gear",      label: "Equipamento Geral",    icon: "🎒" },
  };
  (typeof MISC_ITEMS !== "undefined" ? MISC_ITEMS : []).filter(Boolean).forEach(item => {
    const m = miscMap[item.subcategory] || miscMap.gear;
    pool.push({ ...item, _cat: m.cat, _catLabel: m.label, _icon: m.icon });
  });

  return pool.filter(i => i.name);
}

const ALL_ITEMS = buildItemPool();

/* ── Utilitários ────────────────────────────────────────────── */

function avgDamage(dmgStr) {
  if (!dmgStr || dmgStr === "—") return 0;
  let total = 0;
  (dmgStr.match(/(\d+)d(\d+)/g) || []).forEach(part => {
    const [n, sides] = part.split("d").map(Number);
    total += n * (sides + 1) / 2;
  });
  (dmgStr.match(/\+\s*(\d+)(?!\s*d)/g) || []).forEach(f => {
    total += parseInt(f.replace(/[+\s]/g, ""), 10) || 0;
  });
  return Math.round(total * 10) / 10;
}

function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatReq(reqText) {
  if (!reqText || reqText === "—") return "—";
  if (reqText === "qualquer") return "Qualquer";
  const ATTRS = ["FOR", "DEX", "AGI", "INT", "SAB"];
  const isHigh = /alto|alta/i.test(reqText);
  const min = isHigh ? 3 : 1;
  const cleaned = reqText.replace(/\s*(alto|alta|\(alto\)|\(alta\))/gi, "").trim();
  const attrs = cleaned.split(/[/,\s]+/).filter(a => ATTRS.includes(a.toUpperCase())).map(a => a.toUpperCase());
  if (!attrs.length) return reqText;
  return attrs.map(a => `${a} ≥ ${min}`).join(" ou ");
}

/* ── Filtragem ──────────────────────────────────────────────── */

function getFilteredItems() {
  const q = state.search.toLowerCase();

  return ALL_ITEMS.filter(item => {
    // Categoria
    if (state.category !== "todos" && item._cat !== state.category) return false;

    // Tier
    if (state.tiers.size > 0 && !state.tiers.has(item.tier || "comum")) return false;

    // Especiais
    if (state.specials.has("set")     && !item.setName) return false;
    if (state.specials.has("unique")  && !item.uniqueAbility) return false;
    if (state.specials.has("charges") && !item.charges) return false;
    if (state.specials.has("magic")   && !item.magicBonus) return false;

    // Peso
    if (state.maxWeight < 20 && (item.weight || 0) > state.maxWeight) return false;

    // Dano
    if (state.minDmg > 0 && avgDamage(item.dmg) < state.minDmg) return false;

    // Busca textual
    if (q) {
      const haystack = [
        item.name, item.note, item.effect, item.story,
        item.uniqueAbility, item.setName, item.dmg, item._catLabel
      ].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

/* ── Renderização dos chips de filtro ───────────────────────── */

function renderFilterChips() {
  // Categorias
  document.getElementById("category-chips").innerHTML = CATEGORIES.map(c => {
    const count = c.key === "todos"
      ? ALL_ITEMS.length
      : ALL_ITEMS.filter(i => i._cat === c.key).length;
    if (count === 0 && c.key !== "todos") return "";
    return `<button class="filter-chip ${state.category === c.key ? "active" : ""}"
              data-filter="category" data-value="${c.key}">${c.icon} ${c.label} (${count})</button>`;
  }).join("");

  // Tiers
  document.getElementById("tier-chips").innerHTML = Object.keys(TIER_LABELS).map(t => {
    const count = ALL_ITEMS.filter(i => (i.tier || "comum") === t).length;
    if (count === 0) return "";
    return `<button class="filter-chip tier-chip-${t} ${state.tiers.has(t) ? "active" : ""}"
              data-filter="tier" data-value="${t}">${TIER_LABELS[t]} (${count})</button>`;
  }).join("");

  // Especiais
  document.getElementById("special-chips").innerHTML = SPECIAL_FILTERS.map(s => {
    let count = 0;
    if (s.key === "set")     count = ALL_ITEMS.filter(i => i.setName).length;
    if (s.key === "unique")  count = ALL_ITEMS.filter(i => i.uniqueAbility).length;
    if (s.key === "charges") count = ALL_ITEMS.filter(i => i.charges).length;
    if (s.key === "magic")   count = ALL_ITEMS.filter(i => i.magicBonus).length;
    if (count === 0) return "";
    return `<button class="filter-chip ${state.specials.has(s.key) ? "active" : ""}"
              data-filter="special" data-value="${s.key}">${s.label} (${count})</button>`;
  }).join("");
}

/* ── Renderização do card ───────────────────────────────────── */

function renderCard(item, index) {
  const tier = item.tier || "comum";
  const tierBadge = tier !== "comum"
    ? `<span class="item-tier-badge tier-${tier}">${TIER_LABELS[tier]}</span>` : "";
  const setBadge = item.setName
    ? `<span class="item-set-badge">🔗 ${esc(item.setName)}</span>` : "";

  const chips = [];
  if (item.dmg && item.dmg !== "—")
    chips.push(`<span class="item-chip item-chip-dmg">⚔ <strong>${esc(item.dmg)}</strong></span>`);
  if (item.physDefense != null && item._cat !== "shield")
    chips.push(`<span class="item-chip item-chip-def">🛡 <strong>${item.physDefense}</strong></span>`);
  if (item.magDefense)
    chips.push(`<span class="item-chip item-chip-mag">✨ <strong>${item.magDefense}</strong></span>`);
  if (item.range)
    chips.push(`<span class="item-chip">📏 ${item.range} hex</span>`);
  if (item.weight != null)
    chips.push(`<span class="item-chip">⚖ ${item.weight}kg</span>`);
  if (item.charges)
    chips.push(`<span class="item-chip">🔵 ${item.charges.max}x</span>`);

  const preview = item.effect || item.note || item.story || "";

  return `
    <div class="item-card tier-${tier}" data-index="${index}">
      <div class="item-card-head">
        <span class="item-card-name">${item._icon} ${esc(item.name)}</span>
        <div class="item-card-badges">${tierBadge}${setBadge}</div>
      </div>
      ${chips.length ? `<div class="item-card-chips">${chips.join("")}</div>` : ""}
      ${preview ? `<p class="item-card-preview">${esc(preview)}</p>` : ""}
    </div>`;
}

/* ── Renderização principal ─────────────────────────────────── */

let currentResults = [];

function render() {
  const items = getFilteredItems();
  currentResults = items;

  document.getElementById("result-count").textContent =
    items.length === ALL_ITEMS.length ? `${items.length} itens` : `${items.length} de ${ALL_ITEMS.length}`;

  const container = document.getElementById("items-content");

  if (items.length === 0) {
    container.innerHTML = `<div class="items-empty">
      <p style="font-size:32px;margin-bottom:8px">🔍</p>
      <p>Nenhum item encontrado com esses filtros.</p>
    </div>`;
    return;
  }

  // Agrupa por categoria e ordena por tier dentro de cada grupo
  const groups = {};
  items.forEach((item, idx) => {
    const key = item._catLabel;
    if (!groups[key]) groups[key] = { icon: item._icon, items: [] };
    groups[key].items.push({ item, idx });
  });

  let html = "";
  Object.entries(groups).forEach(([label, group]) => {
    group.items.sort((a, b) => {
      const t = (TIER_ORDER[a.item.tier] || 0) - (TIER_ORDER[b.item.tier] || 0);
      return t !== 0 ? t : a.item.name.localeCompare(b.item.name);
    });
    html += `<h3 class="items-group-title">
        <span>${group.icon} ${label}</span>
        <span class="items-group-count">${group.items.length}</span>
      </h3>`;
    html += `<div class="items-grid">`;
    html += group.items.map(({ item, idx }) => renderCard(item, idx)).join("");
    html += `</div>`;
  });

  container.innerHTML = html;

  // Bind clique nos cards
  container.querySelectorAll(".item-card").forEach(card => {
    card.addEventListener("click", () => {
      openItemModal(currentResults[parseInt(card.dataset.index, 10)]);
    });
  });
}

/* ── Modal de detalhes ──────────────────────────────────────── */

const MAGIC_BONUS_LABELS = {
  attr: "Atributo", attrValue: "", attr2: "Atributo", attrValue2: "",
  attr3: "Atributo", attrValue3: "",
  hp: "HP Máximo", move: "Movimento", actions: "Ações de Combate",
  spellActions: "Ações de Magia", dodge: "Chance de Esquiva",
  slots: "Slots de Magia", critChance: "Chance de Crítico",
  critDamage: "Dano Crítico (%)",
};

function renderMagicBonus(mb) {
  if (!mb) return "";
  const rows = [];
  if (mb.attr)  rows.push({ name: mb.attr,  value: `+${mb.attrValue || 1}` });
  if (mb.attr2) rows.push({ name: mb.attr2, value: `+${mb.attrValue2 || 1}` });
  if (mb.attr3) rows.push({ name: mb.attr3, value: `+${mb.attrValue3 || 1}` });
  ["hp","move","actions","spellActions","dodge","slots","critChance","critDamage"].forEach(k => {
    if (mb[k]) rows.push({ name: MAGIC_BONUS_LABELS[k], value: `+${mb[k]}${k === "critDamage" ? "%" : ""}` });
  });
  if (!rows.length) return "";
  return `
    <div class="modal-section">
      <div class="modal-section-label">✨ Bônus Mágicos</div>
      <div class="modal-bonus-list">
        ${rows.map(r => `
          <div class="modal-bonus-item">
            <span class="modal-bonus-name">${esc(r.name)}</span>
            <span class="modal-bonus-value">${esc(r.value)}</span>
          </div>`).join("")}
      </div>
    </div>`;
}

function openItemModal(item) {
  if (!item) return;
  const tier = item.tier || "comum";

  document.getElementById("modal-title").textContent = `${item._icon} ${item.name}`;

  // Badges do cabeçalho
  const badges = [];
  badges.push(`<span class="item-tier-badge tier-${tier}">${TIER_LABELS[tier]}</span>`);
  badges.push(`<span class="item-tier-badge">${esc(item._catLabel)}</span>`);
  if (item.setName) badges.push(`<span class="item-set-badge">🔗 ${esc(item.setName)}</span>`);
  if (item.consumable) badges.push(`<span class="item-tier-badge">Consumível</span>`);
  document.getElementById("modal-badges").innerHTML = badges.join("");

  // Corpo do modal, seção a seção
  let body = "";

  /* Seção: Atributos de combate */
  const stats = [];
  if (item.dmg && item.dmg !== "—")
    stats.push({ label: "Dano", value: item.dmg, cls: "stat-dmg" });
  if (item.dmg && item.dmg !== "—" && avgDamage(item.dmg) > 0)
    stats.push({ label: "Dano médio", value: avgDamage(item.dmg), cls: "stat-dmg" });
  if (item.physDefense != null && item._cat !== "shield")
    stats.push({ label: "Def. Física", value: item.physDefense, cls: "stat-def" });
  if (item.magDefense != null && item.magDefense !== 0)
    stats.push({ label: "Def. Mágica", value: item.magDefense, cls: "stat-mag" });
  if (item.range) stats.push({ label: "Alcance", value: `${item.range} hex` });
  if (item.weight != null) stats.push({ label: "Peso", value: `${item.weight} kg` });
  if (item.req) stats.push({ label: "Requisito", value: formatReq(item.req) });
  if (item.movePenalty) stats.push({ label: "Penal. Mov.", value: `−${item.movePenalty}` });
  if (item.defenseDegrade) stats.push({ label: "Degrade Def.", value: `−${item.defenseDegrade}` });

  if (stats.length) {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">📊 Atributos</div>
        <div class="modal-stats-grid">
          ${stats.map(s => `
            <div class="modal-stat ${s.cls || ""}">
              <span class="modal-stat-label">${esc(s.label)}</span>
              <span class="modal-stat-value">${esc(s.value)}</span>
            </div>`).join("")}
        </div>
      </div>`;
  }

  /* Seção: Slots de equipamento */
  if (item.slot && item.slot.length) {
    const slotNames = {
      primary: "Mão Principal", secondary: "Mão Secundária",
      shield: "Escudo", armor: "Armadura", accessory: "Acessório"
    };
    body += `
      <div class="modal-section">
        <div class="modal-section-label">🎯 Onde Equipar</div>
        <div class="modal-slot-tags">
          ${item.slot.map(s => `<span class="modal-slot-tag">${slotNames[s] || s}</span>`).join("")}
        </div>
      </div>`;
  }

  /* Seção: Cargas / Disparos */
  if (item.charges) {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">🔵 Cargas</div>
        <div class="modal-text-block block-charges">
          <strong>${item.charges.max}× ${esc(item.charges.label || "Cargas")}</strong>
          ${item.charges.resetOn ? ` — recarrega por ${esc(item.charges.resetOn)}` : ""}
        </div>
      </div>`;
  }

  /* Seção: Efeito */
  if (item.effect) {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">⚡ Efeito</div>
        <div class="modal-text-block block-effect">${esc(item.effect)}</div>
      </div>`;
  }

  /* Seção: Habilidade Única */
  if (item.uniqueAbility) {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">⭐ Habilidade Única</div>
        <div class="modal-text-block block-unique">${esc(item.uniqueAbility)}</div>
      </div>`;
  }

  /* Seção: Bônus Mágicos */
  body += renderMagicBonus(item.magicBonus);

  /* Seção: Nota de regras */
  if (item.note) {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">📌 Nota de Regras</div>
        <div class="modal-text-block">${esc(item.note)}</div>
      </div>`;
  }

  /* Seção: Penalidade (escudos) */
  if (item.penalty && item.penalty !== "Nenhuma") {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">⚠ Penalidade</div>
        <div class="modal-text-block">${esc(item.penalty)}</div>
      </div>`;
  }

  /* Seção: Bônus de Set */
  if (item.setBonus) {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">🔗 Bônus de Conjunto</div>
        <div class="modal-text-block block-set">
          <strong>${esc(item.setBonus.ability)}</strong> (${item.setBonus.pieces} peças)<br>
          ${esc(item.setBonus.effect)}
        </div>
      </div>`;
  }

  /* Seção: Material de crafting */
  if (item.craftingMaterial || item.smithingMaterial) {
    const uses = [];
    if (item.craftingMaterial) uses.push("Alquimia");
    if (item.smithingMaterial) uses.push("Forja");
    body += `
      <div class="modal-section">
        <div class="modal-section-label">⚗️ Material de Crafting</div>
        <div class="modal-text-block">Usado em: <strong>${uses.join(" e ")}</strong></div>
      </div>`;
  }

  /* Seção: História */
  if (item.story) {
    body += `
      <div class="modal-section">
        <div class="modal-section-label">📖 História</div>
        <div class="modal-text-block block-story">${esc(item.story)}</div>
      </div>`;
  }

  document.getElementById("modal-body").innerHTML = body;
  document.getElementById("item-modal-overlay").classList.remove("hidden");
  document.getElementById("item-modal").scrollTop = 0;
  document.body.style.overflow = "hidden";
}

function closeItemModal() {
  document.getElementById("item-modal-overlay").classList.add("hidden");
  document.body.style.overflow = "";
}

/* ── Eventos ────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  renderFilterChips();
  render();

  // Busca
  document.getElementById("search-input").addEventListener("input", e => {
    state.search = e.target.value.trim();
    render();
  });

  // Chips de filtro (delegação de evento)
  document.querySelector(".items-filters").addEventListener("click", e => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    const { filter, value } = chip.dataset;

    if (filter === "category") {
      state.category = value;
    } else if (filter === "tier") {
      state.tiers.has(value) ? state.tiers.delete(value) : state.tiers.add(value);
    } else if (filter === "special") {
      state.specials.has(value) ? state.specials.delete(value) : state.specials.add(value);
    }
    renderFilterChips();
    render();
  });

  // Sliders
  const weightRange = document.getElementById("weight-range");
  weightRange.addEventListener("input", e => {
    state.maxWeight = parseFloat(e.target.value);
    document.getElementById("weight-value").textContent =
      state.maxWeight >= 20 ? "qualquer" : `${state.maxWeight}kg`;
    render();
  });

  const dmgRange = document.getElementById("dmg-range");
  dmgRange.addEventListener("input", e => {
    state.minDmg = parseFloat(e.target.value);
    document.getElementById("dmg-value").textContent =
      state.minDmg <= 0 ? "qualquer" : `${state.minDmg}`;
    render();
  });

  // Limpar filtros
  document.getElementById("btn-clear").addEventListener("click", () => {
    state.search = "";
    state.category = "todos";
    state.tiers.clear();
    state.specials.clear();
    state.maxWeight = 20;
    state.minDmg = 0;
    document.getElementById("search-input").value = "";
    weightRange.value = 20;
    dmgRange.value = 0;
    document.getElementById("weight-value").textContent = "qualquer";
    document.getElementById("dmg-value").textContent = "qualquer";
    renderFilterChips();
    render();
  });

  // Fechar modal
  document.getElementById("btn-close-modal").addEventListener("click", closeItemModal);
  document.getElementById("item-modal-overlay").addEventListener("click", e => {
    if (e.target.id === "item-modal-overlay") closeItemModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeItemModal();
  });
});
