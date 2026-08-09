"use strict";
/* ================================================================
   craft.js — Sistema de Alquimia | Grimório de Personagens
   Lê personagens do mesmo localStorage do app principal.
   ================================================================ */

const STORAGE_KEY  = "rpg_characters_v1";

// ── Estado ────────────────────────────────────────────────────────
let characters   = [];
let currentChar  = null;
let currentFilter= "all";
let currentTab   = "recipes";
let pendingCraft = null;   // receita em crafting aguardando confirmação

// ── Bootstrap ─────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  loadCharacters();
  buildCharSelect();
  attachTabListeners();
  attachFilterListeners();
  attachResultModalListeners();

  const sel = document.getElementById("char-select");
  sel.addEventListener("change", () => {
    currentChar = characters.find(c => c.id === sel.value) || null;
    renderAll();
  });

  // Auto-selecionar o primeiro personagem
  if (characters.length) {
    sel.value   = characters[0].id;
    currentChar = characters[0];
    renderAll();
  }
});

// ── Carregar personagens ──────────────────────────────────────────
function loadCharacters() {
  try { characters = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { characters = []; }
}

function saveCharacters() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(characters)); }
  catch { console.warn("Falha ao salvar"); }
}

// ── Seletor de personagem ─────────────────────────────────────────
function buildCharSelect() {
  const sel = document.getElementById("char-select");
  sel.innerHTML = '<option value="">— selecione —</option>';
  characters.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.class || "?"} nv.${c.level || 1})`;
    sel.appendChild(opt);
  });
}

// ── Abas ──────────────────────────────────────────────────────────
function attachTabListeners() {
  document.querySelectorAll(".craft-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".craft-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentTab = btn.dataset.tab;
      document.getElementById("tab-recipes").style.display   = currentTab === "recipes"   ? "" : "none";
      document.getElementById("tab-materials").style.display = currentTab === "materials" ? "" : "none";
      renderAll();
    });
  });
}

// ── Filtros ───────────────────────────────────────────────────────
function attachFilterListeners() {
  document.querySelectorAll(".craft-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".craft-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderRecipes();
    });
  });
}

// ── Helpers de inventário ─────────────────────────────────────────
function getInventory() {
  return currentChar?.inventory || [];
}

/** Conta quantas unidades de um materialTag o personagem tem */
function countMaterial(tag) {
  return getInventory().filter(i => i.materialTag === tag || i.craftingMaterialTag === tag).length;
}

/** Retorna true se o personagem tem todos os ingredientes */
function hasIngredients(recipe) {
  return recipe.ingredients.every(ing => countMaterial(ing.tag) >= ing.qty);
}

/** Conhece a receita? (tem pergaminho aprendido) */
function knowsRecipe(recipe) {
  // O personagem aprende receitas ao "usar" um Pergaminho de Receita
  const known = currentChar?.knownRecipes || [];
  return known.includes(recipe.id);
}

/** Remove ingredientes do inventário */
function consumeIngredients(recipe) {
  const inv = currentChar.inventory;
  recipe.ingredients.forEach(ing => {
    let toRemove = ing.qty;
    for (let i = inv.length - 1; i >= 0 && toRemove > 0; i--) {
      if ((inv[i].materialTag === ing.tag || inv[i].craftingMaterialTag === ing.tag)) {
        inv.splice(i, 1);
        toRemove--;
      }
    }
  });
}

/** Adiciona item craftado ao inventário */
function addCraftedItem(recipe, extraEffect) {
  const item = {
    instanceId   : `crafted_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    name         : recipe.name + (extraEffect ? " ★" : ""),
    category     : "misc",
    subcategory  : "potion",
    tier         : recipe.tier,
    weight       : recipe.weight,
    consumable   : true,
    icon         : recipe.icon,
    effect       : recipe.baseEffect + (extraEffect ? `\n✨ Bônus: ${extraEffect}` : ""),
    story        : recipe.story || "",
    craftedBy    : currentChar?.name || "?",
    craftedAt    : new Date().toLocaleDateString("pt-BR"),
    isCrafted    : true,
  };
  if (!currentChar.inventory) currentChar.inventory = [];
  currentChar.inventory.push(item);
}

// ── Sistema de testes de perícia ──────────────────────────────────
function calcCraftBonus(recipe) {
  if (!currentChar) return { bonus:0, normal:10, hard:5, critical:1 };
  const attrs = currentChar.attributes || {};
  const attrKey = recipe.skillTest?.attr || "INT";
  const attrVal = attrs[attrKey] || 0;
  // Bônus extra se subclasse Alquimista
  const isAlchemist = (currentChar.subclass || "").toLowerCase().includes("alquimista");
  const bonus = attrVal + (isAlchemist ? 2 : 0);
  return {
    bonus,
    normal  : Math.min(19, 10 + bonus),
    hard    : Math.max(1,   5 + bonus),
    critical: Math.max(1,   1 + bonus),
  };
}

function rollD20() { return Math.floor(Math.random() * 20) + 1; }

/**
 * Resultado do craft:
 *  "crit_success" — roll == 1 (raro) ou roll ≤ (normal - 7)
 *  "success"      — roll ≤ normal
 *  "fail"         — roll > normal
 *  "crit_fail"    — roll == 20
 */
function evalCraft(roll, thresholds, recipe) {
  const diff = recipe.skillTest?.difficulty || "normal";
  let target;
  if (diff === "dificil")  target = thresholds.hard;
  else if (diff === "critico") target = thresholds.critical;
  else target = thresholds.normal;

  if (roll === 20) return "crit_fail";
  if (roll === 1 || roll <= Math.max(1, target - 6)) return "crit_success";
  if (roll <= target) return "success";
  return "fail";
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Renderização geral ────────────────────────────────────────────
function renderAll() {
  updateCharInfo();
  if (currentTab === "recipes")   renderRecipes();
  if (currentTab === "materials") renderMaterials();
}

function updateCharInfo() {
  const el = document.getElementById("char-info");
  if (!currentChar) { el.textContent = ""; return; }
  const inv    = getInventory();
  const matCnt = inv.filter(i => i.craftingMaterial || i.craftingMaterialTag || i.materialTag).length;
  const recCnt = (currentChar.knownRecipes || []).length;
  el.textContent = `${matCnt} materiais · ${recCnt} receitas conhecidas`;
}

// ── Aba: Receitas ─────────────────────────────────────────────────
function renderRecipes() {
  const container = document.getElementById("recipe-list");
  if (!currentChar) {
    container.innerHTML = `<div class="craft-empty"><span class="craft-empty-icon">⚗️</span>Selecione um personagem para ver as receitas disponíveis.</div>`;
    return;
  }

  const allRecipes = typeof ALCHEMY_RECIPES !== "undefined" ? ALCHEMY_RECIPES : [];
  const known   = currentChar.knownRecipes || [];

  // Filtrar
  let visible = allRecipes;
  if (currentFilter === "available") {
    visible = allRecipes.filter(r => known.includes(r.id) && hasIngredients(r));
  } else if (currentFilter !== "all") {
    visible = allRecipes.filter(r => r.category === currentFilter);
  }

  if (visible.length === 0) {
    container.innerHTML = `<div class="craft-empty"><span class="craft-empty-icon">📜</span>Nenhuma receita encontrada.</div>`;
    return;
  }

  container.innerHTML = visible.map(r => renderRecipeCard(r, known)).join("");

  // Expandir/colapsar
  container.querySelectorAll(".recipe-header").forEach(h => {
    h.addEventListener("click", () => {
      h.closest(".recipe-card").classList.toggle("open");
    });
  });

  // Botões de craft
  container.querySelectorAll(".btn-craft").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = btn.dataset.recipeId;
      const recipe = allRecipes.find(r => r.id === id);
      if (recipe) startCraft(recipe);
    });
  });
}

function renderRecipeCard(recipe, known) {
  const isKnown   = known.includes(recipe.id);
  const canCraft  = isKnown && hasIngredients(recipe);
  const thresh    = calcCraftBonus(recipe);
  const diff      = recipe.skillTest?.difficulty || "normal";
  const diffLabel = { normal:"Normal", dificil:"Difícil", critico:"Crítico" }[diff] || diff;

  const statusClass = !isKnown ? "dot-norecipe" : canCraft ? "dot-ok" : "dot-missing";
  const cardClass   = canCraft ? "" : "unavailable";

  const ingredientsHTML = recipe.ingredients.map(ing => {
    const have = countMaterial(ing.tag);
    const ok   = have >= ing.qty;
    return `
      <div class="ingredient-row ${ok ? "have" : "missing"}">
        <span class="ingredient-icon">${ok ? "✅" : "❌"}</span>
        <span class="ingredient-name">${ing.label}</span>
        <span class="ingredient-qty">${have}/${ing.qty}</span>
      </div>`;
  }).join("");

  const targetVal = diff === "dificil" ? thresh.hard : diff === "critico" ? thresh.critical : thresh.normal;

  const learnBtn = !isKnown ? `
    <p style="font-size:12px;color:var(--ink-soft);margin:8px 0 0;">
      ⚠ Você ainda não conhece esta receita. Use um <strong>Pergaminho de Receita: ${recipe.name}</strong> para aprendê-la.
    </p>` : "";

  return `
  <div class="recipe-card ${cardClass}" data-recipe-id="${recipe.id}">
    <div class="recipe-header">
      <span class="recipe-icon">${recipe.icon}</span>
      <div class="recipe-title-col">
        <div class="recipe-name">${recipe.name}</div>
        <div class="recipe-sub">${{ cura:"💚 Cura", ofensiva:"💥 Ofensiva", utilidade:"🔧 Utilidade" }[recipe.category] || recipe.category} · ${diffLabel}</div>
      </div>
      <span class="recipe-tier-badge tier-${recipe.tier}">${recipe.tier}</span>
      <span class="recipe-status-dot ${statusClass}" title="${!isKnown ? "Receita desconhecida" : canCraft ? "Pronto para criar" : "Ingredientes faltando"}"></span>
    </div>
    <div class="recipe-body">
      <div class="ingredient-list">${ingredientsHTML}</div>

      <div class="recipe-base-effect">
        <strong>Efeito base:</strong> ${recipe.baseEffect}
      </div>

      <div class="craft-roll-section">
        <div class="craft-roll-label">Teste de ${recipe.skillTest?.attr || "INT"} para criar</div>
        <div class="craft-roll-info">
          <span class="craft-roll-chip chip-n">Normal ≤${thresh.normal}</span>
          <span class="craft-roll-chip chip-d">Difícil ≤${thresh.hard}</span>
          <span class="craft-roll-chip chip-c">Crítico ≤${thresh.critical}</span>
        </div>
        <div style="font-size:11px;color:var(--ink-soft);margin-bottom:10px;">
          Alvo desta receita: <strong>${diffLabel} (d20 ≤ ${targetVal})</strong>
          &nbsp;·&nbsp; 🎯 Crítico positivo: d20 ≤ ${Math.max(1, targetVal - 6)} ou d20 = 1
          &nbsp;·&nbsp; 💀 Falha crítica: d20 = 20
        </div>
      </div>

      ${learnBtn}
      <button class="btn-craft" data-recipe-id="${recipe.id}" ${!canCraft ? "disabled" : ""}>
        ${canCraft ? "⚗️ Criar Poção" : isKnown ? "❌ Ingredientes insuficientes" : "🔒 Receita desconhecida"}
      </button>
    </div>
  </div>`;
}

// ── Craft: execução ───────────────────────────────────────────────
function startCraft(recipe) {
  const thresh = calcCraftBonus(recipe);
  const roll   = rollD20();
  const result = evalCraft(roll, thresh, recipe);

  const diff   = recipe.skillTest?.difficulty || "normal";
  const target = diff === "dificil" ? thresh.hard : diff === "critico" ? thresh.critical : thresh.normal;

  pendingCraft = { recipe, roll, result, target };

  // Conteúdo do modal
  const overlay = document.getElementById("result-overlay");
  document.getElementById("crm-icon").textContent  = recipe.icon;
  document.getElementById("crm-title").textContent = recipe.name;
  document.getElementById("crm-roll").textContent  = `d20 = ${roll} (alvo ≤ ${target})`;

  const resultEl = document.getElementById("crm-result");

  if (result === "crit_success") {
    const bonus = pickRandom(recipe.critBonus || []);
    pendingCraft.bonus = bonus;
    resultEl.className = "crm-result crm-crit-suc";
    resultEl.innerHTML = `
      <div class="crm-label">✨ Sucesso Crítico!</div>
      <div>${recipe.baseEffect}</div>
      <div class="crm-bonus">✨ Bônus especial: ${bonus}</div>`;
    document.getElementById("btn-crm-add").style.display = "";

  } else if (result === "success") {
    pendingCraft.bonus = null;
    resultEl.className = "crm-result crm-success";
    resultEl.innerHTML = `
      <div class="crm-label">✅ Sucesso</div>
      <div>${recipe.baseEffect}</div>`;
    document.getElementById("btn-crm-add").style.display = "";

  } else if (result === "crit_fail") {
    const penalty = pickRandom(recipe.critFailEffect || ["A poção explodiu sem efeito."]);
    pendingCraft.penalty = penalty;
    resultEl.className = "crm-result crm-crit-fail";
    resultEl.innerHTML = `
      <div class="crm-label">💀 Falha Crítica! (d20 = 20)</div>
      <div class="crm-penalty">${penalty}</div>
      <div style="font-size:12px;color:var(--ink-soft);margin-top:6px;">Ingredientes consumidos. Nenhuma poção criada.</div>`;
    document.getElementById("btn-crm-add").style.display = "none";

  } else {
    resultEl.className = "crm-result crm-fail";
    resultEl.innerHTML = `
      <div class="crm-label">❌ Falha</div>
      <div style="color:var(--ink-soft);">Os ingredientes foram desperdiçados. A poção não foi criada.</div>`;
    document.getElementById("btn-crm-add").style.display = "none";
  }

  overlay.classList.remove("hidden");
}

// ── Modal de resultado: listeners ────────────────────────────────
function attachResultModalListeners() {
  document.getElementById("btn-crm-close").addEventListener("click", () => {
    // Se falha: consome ingredientes mesmo assim
    if (pendingCraft && (pendingCraft.result === "fail" || pendingCraft.result === "crit_fail")) {
      consumeIngredients(pendingCraft.recipe);
      saveCharacters();
    }
    pendingCraft = null;
    document.getElementById("result-overlay").classList.add("hidden");
    renderAll();
  });

  document.getElementById("btn-crm-add").addEventListener("click", () => {
    if (!pendingCraft) return;
    const { recipe, result, bonus } = pendingCraft;
    consumeIngredients(recipe);
    addCraftedItem(recipe, bonus || null);
    saveCharacters();
    pendingCraft = null;
    document.getElementById("result-overlay").classList.add("hidden");
    renderAll();
    showCraftToast(`${recipe.icon} ${recipe.name} adicionada ao inventário!`);
  });

  // Fechar ao clicar fora
  document.getElementById("result-overlay").addEventListener("click", e => {
    if (e.target === document.getElementById("result-overlay")) {
      document.getElementById("btn-crm-close").click();
    }
  });
}

// ── Aba: Materiais ────────────────────────────────────────────────
function renderMaterials() {
  const grid = document.getElementById("mat-grid");
  if (!currentChar) {
    grid.innerHTML = `<div class="craft-empty"><span class="craft-empty-icon">🌿</span>Selecione um personagem.</div>`;
    return;
  }

  const inv   = getInventory();
  // Agrupar materiais por materialTag
  const matMap = {};
  inv.forEach(i => {
    const tag = i.materialTag || i.craftingMaterialTag;
    if (tag) {
      if (!matMap[tag]) matMap[tag] = { name: i.name, tag, qty: 0, tier: i.tier };
      matMap[tag].qty++;
    }
  });

  const mats = Object.values(matMap);
  if (mats.length === 0) {
    grid.innerHTML = `<div class="craft-empty"><span class="craft-empty-icon">🌿</span>Nenhum material de alquimia no inventário.<br>Derrote criaturas e explore para coletar ingredientes.</div>`;
    return;
  }

  grid.innerHTML = mats.map(m => `
    <div class="mat-card">
      <div class="mat-card-qty">${m.qty}</div>
      <div class="mat-card-name">${m.name}</div>
      <div class="mat-card-tag tier-${m.tier}">${m.tier}</div>
    </div>`).join("");
}

// ── Toast simples ─────────────────────────────────────────────────
function showCraftToast(msg) {
  let t = document.getElementById("craft-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "craft-toast";
    Object.assign(t.style, {
      position:"fixed", bottom:"20px", left:"50%", transform:"translateX(-50%)",
      background:"rgba(30,30,30,.9)", color:"#fff", padding:"10px 18px",
      borderRadius:"20px", fontSize:"14px", zIndex:"999", transition:"opacity .3s",
      maxWidth:"90vw", textAlign:"center",
    });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = "0"; }, 2800);
}

/* ================================================================
   SISTEMA DE APRENDIZADO DE RECEITAS
   Quando o personagem usa um item do tipo "recipe_scroll" no
   app principal, adiciona o recipeId a knownRecipes.
   Para testes: expor função global que o dev pode chamar no console.
   ================================================================ */
window.learnRecipe = function(charId, recipeId) {
  const c = characters.find(x => x.id === charId);
  if (!c) return "Personagem não encontrado";
  if (!c.knownRecipes) c.knownRecipes = [];
  if (!c.knownRecipes.includes(recipeId)) {
    c.knownRecipes.push(recipeId);
    saveCharacters();
    loadCharacters();
    currentChar = characters.find(x => x.id === charId);
    renderAll();
    return `✅ Receita "${recipeId}" aprendida por ${c.name}`;
  }
  return "Já conhecia esta receita";
};

window.learnAllRecipes = function(charId) {
  const recipes = typeof ALCHEMY_RECIPES !== "undefined" ? ALCHEMY_RECIPES : [];
  recipes.forEach(r => window.learnRecipe(charId, r.id));
  return `Todas as ${recipes.length} receitas aprendidas`;
};

/* ================================================================
   SISTEMA DE FORJA — Encantamento de Armas e Armaduras
   ================================================================ */

let currentForgeFilter = "all";
let selectedBaseItem   = null;   // item do inventário selecionado como base
let pendingForge       = null;   // forja aguardando confirmação

// ── Inicialização da forja ────────────────────────────────────────
(function initForge() {
  window.addEventListener("DOMContentLoaded", () => {
    // Filtros de forja
    document.querySelectorAll("[data-forge-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-forge-filter]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentForgeFilter = btn.dataset.forgeFilter;
        renderForge();
      });
    });

    // Seletor de item base
    document.getElementById("forge-base-select")?.addEventListener("change", e => {
      const inv = getInventory();
      selectedBaseItem = inv.find(i => i.instanceId === e.target.value) || null;
      updateForgeBaseInfo();
      renderForge();
    });

    // Botões de forjar (delegado)
    document.getElementById("forge-recipe-list")?.addEventListener("click", e => {
      const btn = e.target.closest(".btn-forge");
      if (btn) {
        const id = btn.dataset.forgeId;
        const recipe = (typeof FORGE_RECIPES !== "undefined" ? FORGE_RECIPES : []).find(r => r.id === id);
        if (recipe) startForge(recipe);
      }
      // Toggle open
      const header = e.target.closest(".forge-card-header");
      if (header && !e.target.closest(".btn-forge")) {
        header.closest(".forge-card").classList.toggle("open");
      }
    });

    // Resultado da forja
    document.getElementById("btn-crm-add")?.addEventListener("click", handleForgeAdd, true);
    document.getElementById("btn-crm-close")?.addEventListener("click", handleForgeClose, true);
  });
})();

// ── Helpers de forja ─────────────────────────────────────────────

function getForgeRecipes() {
  return typeof FORGE_RECIPES !== "undefined" ? FORGE_RECIPES : [];
}

/** Conta material de forja por tag */
function countForgeMaterial(tag) {
  return getInventory().filter(i =>
    (i.materialTag === tag || i.craftingMaterialTag === tag) && i.smithingMaterial
  ).length;
}

/** Verifica se tem o material da receita de forja */
function hasForgeIngredients(recipe) {
  return countForgeMaterial(recipe.material.tag) >= recipe.material.qty;
}

/** Verifica se o item base é compatível com a receita */
function baseItemCompatible(recipe, item) {
  if (!item) return false;
  if (recipe.smeltingType === "weapon") {
    return item.slot && (item.slot.includes("primary") || item.slot.includes("secondary")) &&
           item.tier === "comum" && item.dmg; // é arma
  }
  if (recipe.smeltingType === "armor") {
    return (item.physDefense !== undefined || item.category === "armor") &&
           item.tier === "comum";
  }
  return false;
}

/** Itens do inventário que são armas ou armaduras comuns (base para forja) */
function getForgeableItems() {
  return getInventory().filter(i => {
    if (i.tier !== "comum") return false;
    const isWeapon = i.dmg && i.slot && (i.slot.includes("primary") || i.slot.includes("secondary"));
    const isArmor  = i.physDefense !== undefined || (i.category === "armor" && !i.dmg);
    return isWeapon || isArmor;
  });
}

function updateForgeBaseInfo() {
  const el = document.getElementById("forge-base-info");
  if (!el) return;
  if (!selectedBaseItem) { el.textContent = ""; return; }
  const isWeapon = selectedBaseItem.dmg;
  const type     = isWeapon ? `Arma — ${selectedBaseItem.dmg} de dano` : `Armadura — Def.Física ${selectedBaseItem.physDefense ?? 0}`;
  el.textContent = `${selectedBaseItem.name} · ${type} · ${selectedBaseItem.weight ?? 0}kg`;
}

/** Popula o seletor de item base */
function populateForgeBaseSelect() {
  const sel = document.getElementById("forge-base-select");
  if (!sel) return;
  const items = getForgeableItems();
  const prev  = sel.value;
  sel.innerHTML = '<option value="">— selecione arma ou armadura comum —</option>';
  items.forEach(i => {
    const opt = document.createElement("option");
    opt.value = i.instanceId;
    opt.textContent = i.name + (i.equippedSlot ? " (equipado)" : "");
    sel.appendChild(opt);
  });
  if (prev) { sel.value = prev; }
  selectedBaseItem = items.find(i => i.instanceId === sel.value) || null;
  updateForgeBaseInfo();
}

// ── Renderizar aba Forja ──────────────────────────────────────────

function renderForge() {
  populateForgeBaseSelect();

  const container = document.getElementById("forge-recipe-list");
  if (!container) return;

  if (!currentChar) {
    container.innerHTML = `<div class="craft-empty"><span class="craft-empty-icon">⚒</span>Selecione um personagem para forjar.</div>`;
    return;
  }

  const all = getForgeRecipes();
  let visible = all;
  if      (currentForgeFilter === "weapon")   visible = all.filter(r => r.smeltingType === "weapon");
  else if (currentForgeFilter === "armor")    visible = all.filter(r => r.smeltingType === "armor");
  else if (currentForgeFilter === "lendario") visible = all.filter(r => r.tier === "lendario");
  else if (currentForgeFilter === "available") {
    visible = all.filter(r => hasForgeIngredients(r) && baseItemCompatible(r, selectedBaseItem));
  }

  if (visible.length === 0) {
    container.innerHTML = `<div class="craft-empty"><span class="craft-empty-icon">⚒</span>Nenhuma receita encontrada.</div>`;
    return;
  }

  container.innerHTML = visible.map(r => renderForgeCard(r)).join("");
}

function renderForgeCard(recipe) {
  const haveMat   = countForgeMaterial(recipe.material.tag);
  const needMat   = recipe.material.qty;
  const matOk     = haveMat >= needMat;
  const baseOk    = selectedBaseItem && baseItemCompatible(recipe, selectedBaseItem);
  const canForge  = matOk && baseOk;
  const thresh    = calcForgeBonus(recipe);
  const diff      = recipe.skillTest?.difficulty || "normal";
  const diffLabel = { normal:"Normal", dificil:"Difícil", critico:"Crítico" }[diff] || diff;
  const target    = diff === "dificil" ? thresh.hard : diff === "critico" ? thresh.critical : thresh.normal;

  const typeIcon  = recipe.smeltingType === "weapon" ? "⚔" : "🛡";
  const tierClass = `tier-${recipe.tier}`;

  const matRow = `
    <div class="forge-material-row ${matOk ? "have" : "missing"}">
      <span>${matOk ? "✅" : "❌"}</span>
      <span style="flex:1">${recipe.material.label}</span>
      <span class="forge-material-qty">${haveMat}/${needMat}</span>
    </div>`;

  const baseStatus = !selectedBaseItem
    ? `<div class="forge-req-box">⚠ Selecione um item base acima antes de forjar.</div>`
    : !baseItemCompatible(recipe, selectedBaseItem)
    ? `<div class="forge-req-box" style="color:#c0392b">❌ <strong>${selectedBaseItem.name}</strong> não é compatível. Req: ${recipe.baseRequirement}</div>`
    : `<div class="forge-req-box" style="color:#27ae60">✅ Usando: <strong>${selectedBaseItem.name}</strong></div>`;

  return `
  <div class="forge-card ${!canForge ? "unavailable" : ""}" data-forge-id="${recipe.id}">
    <div class="forge-card-header">
      <span class="forge-card-icon">${recipe.icon}</span>
      <div class="forge-card-title-col">
        <div class="forge-card-name">${recipe.name}</div>
        <div class="forge-card-sub">${typeIcon} ${recipe.smeltingType === "weapon" ? "Arma" : "Armadura"} · ${diffLabel} · ${recipe.description}</div>
      </div>
      <span class="recipe-tier-badge ${tierClass}">${recipe.tier}</span>
      <span class="recipe-status-dot ${canForge ? "dot-ok" : "dot-missing"}"></span>
    </div>
    <div class="forge-card-body">
      <div class="forge-req-box" style="margin-bottom:4px">
        <strong>Item base necessário:</strong> ${recipe.baseRequirement}
      </div>
      ${baseStatus}
      ${matRow}
      <div class="forge-enchant-box">
        <span class="forge-enchant-label">✨ Encantamento</span>
        ${recipe.enchantEffect}
      </div>
      <div class="craft-roll-section">
        <div class="craft-roll-label">Teste de ${recipe.skillTest?.attr || "FOR"} para forjar</div>
        <div class="craft-roll-info">
          <span class="craft-roll-chip chip-n">Normal ≤${thresh.normal}</span>
          <span class="craft-roll-chip chip-d">Difícil ≤${thresh.hard}</span>
          <span class="craft-roll-chip chip-c">Crítico ≤${thresh.critical}</span>
        </div>
        <div style="font-size:11px;color:var(--ink-soft);margin-bottom:10px">
          Alvo desta receita: <strong>${diffLabel} (≤${target})</strong>
          &nbsp;·&nbsp; 🎯 Crítico positivo: ≤${Math.max(1,target-6)} ou d20=1
          &nbsp;·&nbsp; 💀 Falha crítica: d20=20
        </div>
      </div>
      <button class="btn-craft btn-forge" data-forge-id="${recipe.id}" ${!canForge ? "disabled" : ""}>
        ${!selectedBaseItem ? "🔒 Selecione o item base" : !baseOk ? "❌ Item incompatível" : !matOk ? "❌ Material insuficiente" : "⚒ Forjar Encantamento"}
      </button>
    </div>
  </div>`;
}

// ── Cálculo de bônus de forja ─────────────────────────────────────
function calcForgeBonus(recipe) {
  if (!currentChar) return { bonus:0, normal:10, hard:5, critical:1 };
  const attrs  = currentChar.attributes || {};
  const attr   = recipe.skillTest?.attr || "FOR";
  const val    = attrs[attr] || 0;
  // Bônus subclasse: Alquimista para int, Guerreiro/Caçador de Gigantes para FOR
  const sub    = (currentChar.subclass || "").toLowerCase();
  const bonus2 = (attr === "INT" && sub.includes("alquimista")) ||
                 (attr === "FOR" && (sub.includes("guerreiro") || sub.includes("berserker") || sub.includes("cacador-gigantes") || sub.includes("runa-lamina"))) ? 2 : 0;
  const bonus  = val + bonus2;
  return {
    bonus,
    normal  : Math.min(19, 10 + bonus),
    hard    : Math.max(1,   5 + bonus),
    critical: Math.max(1,   1 + bonus),
  };
}

// ── Executar forja ────────────────────────────────────────────────
function startForge(recipe) {
  if (!selectedBaseItem) return;
  const thresh  = calcForgeBonus(recipe);
  const roll    = rollD20();
  const result  = evalCraft(roll, thresh, recipe);
  const diff    = recipe.skillTest?.difficulty || "normal";
  const target  = diff === "dificil" ? thresh.hard : diff === "critico" ? thresh.critical : thresh.normal;

  pendingForge  = { recipe, roll, result, target, baseItem: selectedBaseItem };

  // ── Preencher modal ──
  document.getElementById("crm-icon").textContent  = recipe.icon;
  document.getElementById("crm-title").textContent = recipe.name;
  document.getElementById("crm-roll").textContent  = `d20 = ${roll} (alvo ≤ ${target}) · Base: ${selectedBaseItem.name}`;

  const resultEl = document.getElementById("crm-result");

  const forgedItemHtml = (bonus) => `
    <div class="crm-forged-item">
      <div class="crm-forged-name">${recipe.icon} ${selectedBaseItem.name} [Encantado]</div>
      <div class="crm-forged-effect">${recipe.enchantEffect}${bonus ? `<br><span style="color:#b8960c">✨ Bônus crítico: ${bonus}</span>` : ""}</div>
    </div>`;

  if (result === "crit_success") {
    const bonus         = pickRandom(recipe.critBonus || []);
    pendingForge.bonus  = bonus;
    resultEl.className  = "crm-result crm-crit-suc";
    resultEl.innerHTML  = `
      <div class="crm-label">✨ Sucesso Crítico na Forja!</div>
      ${forgedItemHtml(bonus)}`;
    document.getElementById("btn-crm-add").textContent = "⚒ Adicionar ao inventário";
    document.getElementById("btn-crm-add").style.display = "";

  } else if (result === "success") {
    pendingForge.bonus  = null;
    resultEl.className  = "crm-result crm-success";
    resultEl.innerHTML  = `
      <div class="crm-label">✅ Forja bem-sucedida!</div>
      ${forgedItemHtml(null)}`;
    document.getElementById("btn-crm-add").textContent = "⚒ Adicionar ao inventário";
    document.getElementById("btn-crm-add").style.display = "";

  } else if (result === "crit_fail") {
    const penalty       = pickRandom(recipe.critFailEffect || ["O encantamento falhou catastroficamente."]);
    pendingForge.penalty= penalty;
    resultEl.className  = "crm-result crm-crit-fail";
    resultEl.innerHTML  = `
      <div class="crm-label">💀 Falha Crítica na Forja! (d20 = 20)</div>
      <div class="crm-penalty">${penalty}</div>
      <div style="font-size:12px;color:var(--ink-soft);margin-top:6px">Material consumido. Encantamento não aplicado.</div>`;
    document.getElementById("btn-crm-add").style.display = "none";

  } else {
    resultEl.className  = "crm-result crm-fail";
    resultEl.innerHTML  = `
      <div class="crm-label">❌ Forja falhou</div>
      <div style="color:var(--ink-soft)">O material foi desperdiçado. O item base permanece inalterado.</div>`;
    document.getElementById("btn-crm-add").style.display = "none";
  }

  document.getElementById("result-overlay").classList.remove("hidden");
}

// ── Handlers do modal para forja ──────────────────────────────────
function handleForgeAdd(e) {
  // Apenas processa se for forja pendente (não alquimia)
  if (!pendingForge) return;
  e.stopImmediatePropagation();

  const { recipe, result, bonus, baseItem } = pendingForge;
  // Consumir material
  consumeForgeMaterial(recipe);
  // Transformar o item base em encantado
  applyEnchantment(baseItem, recipe, bonus);
  saveCharacters();
  pendingForge  = null;
  selectedBaseItem = null;
  document.getElementById("forge-base-select").value = "";
  document.getElementById("forge-base-info").textContent = "";
  document.getElementById("result-overlay").classList.add("hidden");
  renderAll();
  showCraftToast(`⚒ ${baseItem.name} encantado com ${recipe.name}!`);
}

function handleForgeClose(e) {
  if (!pendingForge) return;
  // Falha/crit_fail: consume material mesmo assim
  if (pendingForge.result === "fail" || pendingForge.result === "crit_fail") {
    consumeForgeMaterial(pendingForge.recipe);
    saveCharacters();
  }
  pendingForge = null;
  document.getElementById("result-overlay").classList.add("hidden");
  renderAll();
}

function consumeForgeMaterial(recipe) {
  const inv = currentChar.inventory;
  let toRemove = recipe.material.qty;
  for (let i = inv.length - 1; i >= 0 && toRemove > 0; i--) {
    const item = inv[i];
    if ((item.materialTag === recipe.material.tag || item.craftingMaterialTag === recipe.material.tag) && item.smithingMaterial) {
      inv.splice(i, 1);
      toRemove--;
    }
  }
}

function applyEnchantment(baseItem, recipe, critBonus) {
  // Modifica o item base diretamente no inventário
  baseItem.name        = `${baseItem.name} [${recipe.name}]`;
  baseItem.tier        = recipe.tier;
  baseItem.isEnchanted = true;
  baseItem.enchantId   = recipe.id;

  // Adicionar efeito ao item
  const bonusText = critBonus ? `\n✨ Bônus crítico: ${critBonus}` : "";
  baseItem.effect  = (baseItem.effect ? baseItem.effect + "\n" : "") + `⚒ ${recipe.enchantEffect}${bonusText}`;
  baseItem.note    = (baseItem.note  ? baseItem.note  + " " : "") + `Encantado com ${recipe.name}.`;

  // Aplicar bônus numéricos
  if (recipe.dmgBonus && baseItem.dmg) {
    const extras = (baseItem.dmg.match(/\+.*/)?.[0] || "");
    baseItem.dmg = baseItem.dmg.replace(/\+.*/,"") + extras + " +" + recipe.dmgBonus.split(" ")[0];
  }
  if (recipe.defBonus && (baseItem.physDefense !== undefined)) {
    const match = recipe.defBonus.match(/\+(\d+) Def\.Física/);
    if (match) baseItem.physDefense = (baseItem.physDefense || 0) + parseInt(match[1]);
    const mMatch = recipe.defBonus.match(/\+(\d+) Def\.Mágica/);
    if (mMatch) baseItem.magDefense = (baseItem.magDefense || 0) + parseInt(mMatch[1]);
  }

  baseItem.forgedAt = new Date().toLocaleDateString("pt-BR");
  baseItem.forgedBy = currentChar?.name || "?";
}

// ── Sobrescrever renderAll para incluir forja ────────────────────
const _origRenderAll = renderAll;
// patch: adicionar renderForge ao renderAll
const _patchedRenderAll = function() {
  updateCharInfo();
  if (currentTab === "recipes")   renderRecipes();
  if (currentTab === "forge")     renderForge();
  if (currentTab === "materials") renderMaterials();
};
// Substituir
window.renderAll = _patchedRenderAll;

// Também patch no attachTabListeners para incluir forge
const _origAttachTabs = attachTabListeners;
function attachTabListeners() {
  document.querySelectorAll(".craft-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".craft-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentTab = btn.dataset.tab;
      document.getElementById("tab-recipes").style.display   = currentTab === "recipes"   ? "" : "none";
      document.getElementById("tab-forge").style.display     = currentTab === "forge"     ? "" : "none";
      document.getElementById("tab-materials").style.display = currentTab === "materials" ? "" : "none";
      window.renderAll();
    });
  });
}
