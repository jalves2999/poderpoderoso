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
