/* ==========================================================================
   APP.JS — Lógica da aplicação
   ========================================================================== */

const STORAGE_KEY = "rpg_characters_v1";

/* ---------------------------------------------------------------------- */
/* STORAGE                                                                */
/* ---------------------------------------------------------------------- */

function loadCharacters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Erro ao carregar personagens:", e);
    return [];
  }
}

function saveCharacters(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Erro ao salvar personagens:", e);
    showToast("Não foi possível salvar. O armazenamento local pode estar cheio ou bloqueado.");
  }
}

function uid() {
  return "char_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

/* ---------------------------------------------------------------------- */
/* GLOBAL STATE                                                           */
/* ---------------------------------------------------------------------- */

let characters = loadCharacters();
let currentRosterTab = "pc";
let currentSheetId = null;

/* Wizard draft state */
let wizard = null;
const WIZARD_STEPS = 8;

function freshWizardDraft() {
  return {
    name: "",
    origin: "",
    rosterType: "pc",
    classKey: null,
    subclass: null,       // chave da subclasse (ex: "necromante")
    subclassSkills: [],   // IDs das 2 habilidades escolhidas
    attrs: { FOR: 0, DEX: 0, AGI: 0, INT: 0, SAB: 0 },
    attrPointsLeft: CREATION_ATTR_POINTS,
    classSkills: [],
    generalSkills: [],
    combatSkills: [],
    startSpell: null,
    equipment: [], // array of {name, weight, kind, refIndex}
    equipmentKitApplied: false,
  };
}

/* ---------------------------------------------------------------------- */
/* VIEW NAVIGATION                                                        */
/* ---------------------------------------------------------------------- */

function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------------------------------------------------------------- */
/* MENU DE NAVEGAÇÃO DO TOPO (Páginas do Mundo)                          */
/* Construído dinamicamente a partir de NAV_PAGES em data.js — adicionar */
/* uma página nova ali não exige tocar no HTML.                          */
/* ---------------------------------------------------------------------- */

function renderHeaderNavMenu() {
  const menu = document.getElementById("header-nav-menu");
  menu.innerHTML = NAV_PAGES.map((page, idx) => `
    <button class="header-nav-item ${page.available ? "" : "header-nav-item-soon"}" data-nav-index="${idx}">
      <span class="header-nav-item-icon">${page.icon}</span>
      <span class="header-nav-item-label">${page.label}</span>
      ${!page.available ? `<span class="header-nav-item-badge">Em breve</span>` : ""}
    </button>
  `).join("");

  menu.querySelectorAll(".header-nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const page = NAV_PAGES[parseInt(btn.dataset.navIndex)];
      closeHeaderNavMenu();
      if (page.available && page.action && typeof window[page.action] === "function") {
        window[page.action]();
      } else if (page.available && page.action) {
        // função ainda não existe no escopo global por algum motivo — falha graciosamente
        showToast(`Não foi possível abrir "${page.label}" agora.`);
      } else {
        showToast(`"${page.label}" ainda está em construção — fique de olho em futuras atualizações!`);
      }
    });
  });
}

function toggleHeaderNavMenu() {
  const menu = document.getElementById("header-nav-menu");
  const isHidden = menu.classList.contains("hidden");
  if (isHidden) openHeaderNavMenu(); else closeHeaderNavMenu();
}

function openHeaderNavMenu() {
  // Garante que o menu está no body (fora de qualquer stacking context)
  const menu = document.getElementById("header-nav-menu");
  if (menu && menu.parentElement !== document.body) {
    document.body.appendChild(menu);
  }
  _positionNavMenu();
  menu.classList.remove("hidden");
  document.getElementById("btn-nav-toggle").classList.add("active");
  document.getElementById("nav-overlay")?.classList.add("active");
}

function closeHeaderNavMenu() {
  document.getElementById("header-nav-menu").classList.add("hidden");
  document.getElementById("btn-nav-toggle").classList.remove("active");
  document.getElementById("nav-overlay")?.classList.remove("active");
}

function _positionNavMenu() {
  const toggle = document.getElementById("btn-nav-toggle");
  const menu   = document.getElementById("header-nav-menu");
  if (!toggle || !menu) return;
  const rect = toggle.getBoundingClientRect();
  menu.style.position = "fixed";
  menu.style.top      = (rect.bottom + 6) + "px";
  menu.style.left     = Math.max(8, Math.min(
    rect.left + rect.width / 2 - 120,
    window.innerWidth - 248
  )) + "px";
  menu.style.width    = "240px";
  menu.style.zIndex   = "9999";
}

renderHeaderNavMenu();
document.getElementById("btn-nav-toggle").addEventListener("click", (e) => {
  e.stopPropagation();
  toggleHeaderNavMenu();
});
document.getElementById("nav-overlay")?.addEventListener("click", closeHeaderNavMenu);
// Fecha o menu ao clicar fora dele
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("header-nav-dropdown");
  if (dropdown && !dropdown.contains(e.target)) closeHeaderNavMenu();
});

/* ---------------------------------------------------------------------- */
/* TOAST + MODAL                                                         */
/* ---------------------------------------------------------------------- */

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  const raf = window.requestAnimationFrame || ((cb) => setTimeout(cb, 16));
  raf(() => toast.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 200);
  }, 2600);
}

function showConfirm(message, onConfirm) {
  const overlay = document.getElementById("modal-overlay");
  document.getElementById("modal-message").textContent = message;
  overlay.classList.remove("hidden");

  const confirmBtn = document.getElementById("modal-confirm");
  const cancelBtn = document.getElementById("modal-cancel");

  function cleanup() {
    overlay.classList.add("hidden");
    confirmBtn.removeEventListener("click", onConfirmClick);
    cancelBtn.removeEventListener("click", onCancelClick);
  }
  function onConfirmClick() { cleanup(); onConfirm(); }
  function onCancelClick() { cleanup(); }

  confirmBtn.addEventListener("click", onConfirmClick);
  cancelBtn.addEventListener("click", onCancelClick);
}

/* ---------------------------------------------------------------------- */
/* DICE / RANDOM HELPERS (para referência futura, não usados em cálculo de UI)
   O sistema de combate é resolvido manualmente à mesa; esta ficha apenas
   guarda os dados do personagem. */

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function round1(n) { return Math.round(n * 10) / 10; }

/* ---------------------------------------------------------------------- */
/* CÁLCULOS DERIVADOS (seguem o documento de regras)                     */
/* ---------------------------------------------------------------------- */
/* NOVA ARQUITETURA: o inventário é a única fonte de itens. Cada item tem
   um campo `equippedSlot` (null, "primary", "secondary", "shield", "armor"
   ou "accessory"). Equipar = setar esse campo; desequipar = voltar a null.
   Cada item equipável carrega `damageBonus` (número) e `modifierText`
   (texto livre) — o "modificador" pedido pelo usuário. */

function getClassDef(classKey) {
  return CLASSES[classKey] || null;
}

/* Retorna os itens do inventário atualmente equipados em cada slot */
function getEquippedItem(character, slotKey) {
  if (slotKey === "accessory") {
    return character.inventory.filter(i => i.equippedSlot === "accessory");
  }
  return character.inventory.find(i => i.equippedSlot === slotKey) || null;
}

/* Valor efetivo de um atributo: base do personagem + bônus de itens mágicos equipados.
   Usar esta função (em vez de character.attrs.X direto) em qualquer cálculo derivado
   garante que itens mágicos com bônus de atributo se propaguem corretamente. */
function getEffectiveAttr(character, attrKey) {
  const base = character.attrs[attrKey] || 0;
  const bonus = calcEquippedAttrBonus(character, attrKey);
  return base + bonus;
}

/* HP = 20 + (FOR * hpPerFor da classe) + hpPerLevel da classe * (nivel - 1) + bônus de acessórios */
function calcMaxHP(character) {
  const cls = getClassDef(character.classKey);
  const hpPerFor = cls ? cls.hpPerFor : 3;
  const hpPerLevel = cls && cls.hpPerLevel ? cls.hpPerLevel : 5;
  const base = 20 + (getEffectiveAttr(character, "FOR") * hpPerFor);
  const levelBonus = hpPerLevel * (character.level - 1);
  const accBonus = sumAccessoryEffectValue(character, "hp"); // acessórios
  const itemBonus = sumMagicItemBonus(character, "hp");      // armas/escudos/armaduras
  return Math.max(1, base + levelBonus + accBonus + itemBonus);
}

/* Slots de Magia = INT + SAB, mínimo 1 para classes conjuradoras */
function calcSpellSlots(character) {
  const cls = getClassDef(character.classKey);
  const isCaster = cls && cls.spellsFull !== null && cls.spellsFull !== undefined;
  let slots = getEffectiveAttr(character, "INT") + getEffectiveAttr(character, "SAB");
  const accBonus = sumAccessoryEffectValue(character, "slots");
  slots += accBonus;
  if (isCaster && slots < 1) slots = 1; // garante ao menos 1 slot para conjuradores
  return slots;
}

/* Movimento = 4 + AGI (- penalidade de armadura/escudo) + bônus de acessórios */
function calcMovement(character) {
  let move = 4 + getEffectiveAttr(character, "AGI");
  move -= getEquippedMovePenalty(character);
  move += sumAccessoryEffectValue(character, "move");
  return Math.max(1, move);
}

/* Ações por turno = AGI + DEX, mínimo 1 */
/* Ações de Combate por turno:
   - Progressão garantida por nível: +1 a cada 3 níveis (nível 1→1, 3→2, 6→3, 9→4)
   - Bônus de AGI: +1 a cada 4 pontos (AGI 4→+1, 8→+2)
   - Bônus de DEX: +1 a cada 5 pontos (DEX 5→+1) — especialização
   Garante que todo personagem ganha ações no ritmo do jogo,
   com atributos funcionando como bônus complementares. */
function calcActions(character) {
  const levelBonus = Math.floor((character.level || 1) / 3);        // +1 a cada 3 níveis
  const agiBonus   = Math.floor(getEffectiveAttr(character, "AGI") / 4); // +1 a cada 4 AGI
  const dexBonus   = Math.floor(getEffectiveAttr(character, "DEX") / 5); // +1 a cada 5 DEX
  const base = 1 + levelBonus + agiBonus + dexBonus;
  const bonus = sumAccessoryEffectValue(character, "actions") + sumMagicItemBonus(character, "actions");
  return base + bonus;
}

/* Reações por rodada = 1 + 1 a cada 4 pontos de AGI (regra original, mantida) */
function calcReactions(character) {
  let reactions = 1 + Math.floor(getEffectiveAttr(character, "AGI") / 4);
  reactions += sumAccessoryEffectValue(character, "reaction");   // itens fixos por nome
  reactions += sumAccessoryEffectValue(character, "reactions");  // magicBonus em acessórios
  reactions += sumMagicItemBonus(character, "reactions");        // magicBonus em armas/armaduras/escudos
  return reactions;
}

/* Ações de Reação = 1 a cada 3 pontos de AGI, mínimo 1. Recurso separado das Reações de combate. */
function calcReactionActions(character) {
  const base = Math.max(1, Math.floor(getEffectiveAttr(character, "AGI") / 3));
  const bonus = sumAccessoryEffectValue(character, "reactionActions") + sumMagicItemBonus(character, "reactionActions");
  return base + bonus;
}

/* Ações de Magia por turno:
   - Progressão garantida por nível para TODAS as classes: +1 a cada 3 níveis
   - Bônus de INT: +1 a cada 2 pontos de INT (para conjuradores)
   - Mago: mínimo 1 mesmo sem INT
   Exemplo: nível 1 com INT 0 = 1 (base nível) | nível 3 com INT 2 = 2 (nível) +1 (INT) = 3 */
function calcSpellActions(character) {
  const cls = getClassDef(character.classKey);
  const levelBonus = Math.floor((character.level || 1) / 3);         // +1 a cada 3 níveis (todas as classes)
  const intBonus   = Math.floor(getEffectiveAttr(character, "INT") / 2); // +1 a cada 2 INT
  let actions = 1 + levelBonus + intBonus;
  // Mago mantém mínimo extra de 1 caso fórmula dê 0 (impossível agora, mas por segurança)
  if (cls && cls.name === "Mago" && actions < 1) actions = 1;
  actions += sumAccessoryEffectValue(character, "spellActions");
  actions += sumMagicItemBonus(character, "spellActions");
  return Math.max(0, actions);
}

/* Verifica se o personagem conhece uma perícia de classe com o efeito mecânico indicado
   (usado para perícias que destravam regras especiais, como Defesa com Armas Pesadas). */
function hasMechanicalSkill(character, effectKey) {
  const cls = getClassDef(character.classKey);
  if (!cls || !character.skills || !character.skills.class) return false;
  return character.skills.class.some(name => {
    const skill = cls.skillsClass.find(s => s.name === name);
    return skill && skill.mechanicalEffect === effectKey;
  });
}

/* Identifica se a arma primária equipada é uma arma de duas mãos pesada (corpo a corpo) */
function isHeavyTwoHandedEquipped(character) {
  const primary = getEquippedItem(character, "primary");
  return !!(primary && primary.baseData && primary.baseData.heavyTwoHanded);
}

/* Chance de Esquiva = 10 (base) + AGI, no d20. Penalidade de -2 ao empunhar arma de
   duas mãos pesada sem a perícia "Defesa com Armas Pesadas" do Guerreiro. */
function calcDodgeChance(character) {
  let dodge = 10 + getEffectiveAttr(character, "AGI");
  if (isHeavyTwoHandedEquipped(character) && !hasMechanicalSkill(character, "enable_two_hand_defense")) {
    dodge -= 2;
  }
  dodge += sumAccessoryEffectValue(character, "dodge");
  return Math.max(1, dodge);
}

/* Bônus de Cura: aplicado a magias/habilidades que curam "+SAB". O Clérigo dobra esse
   bônus (2×SAB) — para outras classes que aprendam magia de cura, vale o SAB normal. */
function calcHealingBonus(character) {
  const cls = getClassDef(character.classKey);
  const multiplier = (cls && cls.name === "Clérigo") ? 2 : 1;
  return getEffectiveAttr(character, "SAB") * multiplier;
}

/* Calcula os valores de teste de uma perícia para o personagem.
   Retorna { bonus, normal, hard, critical, hasSkill }
   bonus = soma dos atributos efetivos listados em attrKeys + 2 se perícia aprendida
   normal = 10 + bonus  /  hard = 5 + bonus  /  critical = 1 + bonus */
function calcSkillTest(character, skillTest) {
  const attrBonus = skillTest.attrKeys.reduce((sum, key) => sum + getEffectiveAttr(character, key), 0);

  // Verifica se o personagem tem essa perícia aprendida (nas listas class ou general)
  const allKnownSkills = [
    ...(character.skills.class || []),
    ...(character.skills.general || [])
  ];
  const hasSkill = allKnownSkills.includes(skillTest.name);
  const learnedBonus = hasSkill ? 2 : 0;
  const bonus = attrBonus + learnedBonus;

  return {
    bonus,
    normal: Math.min(19, 10 + bonus),
    hard:   Math.max(1, 5 + bonus),
    critical: Math.max(1, 1 + bonus),
    hasSkill
  };
}

/* Capacidade de Carga = 20 + FOR*5 + carryPerLevel da classe * (nivel - 1) */
function calcCarryCapacity(character) {
  const cls = getClassDef(character.classKey);
  const carryPerLevel = cls && cls.carryPerLevel ? cls.carryPerLevel : 0;
  const levelBonus = carryPerLevel * (character.level - 1);
  const accBonus = sumAccessoryEffectValue(character, "carry");
  const itemBonus = sumMagicItemBonus(character, "carry");
  return CARRY_BASE + (getEffectiveAttr(character, "FOR") * CARRY_PER_FOR) + levelBonus + accBonus + itemBonus;
}

/* Recurso de classe máximo (Fúria/Foco fixos, MP/Fé calculados) */
function calcResourceMax(character) {
  const cls = getClassDef(character.classKey);
  if (!cls) return 0;
  if (cls.resourceMax !== null) return cls.resourceMax;
  if (cls.name === "Mago") {
    let mp = 10 + (getEffectiveAttr(character, "INT") * 2);
    mp += sumAccessoryEffectValue(character, "mp");
    return mp;
  }
  if (cls.name === "Clérigo") {
    let fe = 8 + getEffectiveAttr(character, "SAB");
    fe += sumAccessoryEffectValue(character, "fe");
    return fe;
  }
  return 0;
}

/* Defesa Física / Mágica vindas de armadura + escudo equipados */
function calcPhysicalDefense(character) {
  let def = 0;
  const armor = getEquippedItem(character, "armor");
  if (armor) def += (armor.baseData && armor.baseData.physDefense) || 0;
  const shield = getEquippedItem(character, "shield");
  if (shield) def += (shield.baseData && shield.baseData.physDefense) || 0;
  return def;
}

function calcMagicDefense(character) {
  let def = 0;
  const armor = getEquippedItem(character, "armor");
  if (armor) def += (armor.baseData && armor.baseData.magDefense) || 0;
  return def;
}

function getEquippedMovePenalty(character) {
  let penalty = 0;
  const armor = getEquippedItem(character, "armor");
  if (armor && armor.baseData) penalty += armor.baseData.movePenalty || 0;
  const shield = getEquippedItem(character, "shield");
  if (shield && shield.baseData && shield.baseData.penalty === "−1 no Movimento") penalty += 1;
  return penalty;
}

/* Soma efeitos numéricos de acessórios equipados e de itens com magicBonus */
function sumAccessoryEffectValue(character, kind) {
  const accessories = getEquippedItem(character, "accessory");
  let total = 0;
  accessories.forEach(item => {
    if (kind === "hp"       && item.name === "Anel de Vitalidade")    total += 5;
    if (kind === "slots"    && item.name === "Anel de Foco Arcano")   total += 1;
    if (kind === "move"     && item.name === "Botas Ágeis")           total += 1;
    if (kind === "reaction" && item.name === "Bracelete de Reflexos") total += 1;
    if (kind === "mp"       && item.name === "Pedra de Mana")         total += 5;
    if (kind === "fe"       && item.name === "Amuleto de Fé")         total += 2;
    const bonus = item.magicBonus || item.baseData?.magicBonus;
    if (bonus && typeof bonus[kind] === "number") total += bonus[kind];
  });
  return total;
}

/* Soma o bônus de itens MÁGICOS PERSONALIZADOS equipados em qualquer slot
   (arma primária/secundária, escudo, armadura, acessórios). `kind` corresponde
   às chaves do objeto magicBonus: hp, move, actions, reactions, reactionActions,
   spellActions, dodge, slots. Bônus de atributo são tratados separadamente
   por calcEquippedAttrBonus, pois afetam o cálculo de todas as outras stats. */
/* Soma o bônus de magicBonus de itens equipados nos slots de ARMA/ESCUDO/ARMADURA
   (não inclui acessórios — esses são cobertos por sumAccessoryEffectValue) */
function sumMagicItemBonus(character, kind) {
  let total = 0;
  const getBonus = (item) => {
    if (!item) return 0;
    const bonus = item.magicBonus || item.baseData?.magicBonus;
    return (bonus && typeof bonus[kind] === "number") ? bonus[kind] : 0;
  };
  ["primary", "secondary", "shield", "armor"].forEach(slotKey => {
    total += getBonus(getEquippedItem(character, slotKey));
  });
  return total;
}

/* Soma o bônus de atributo concedido por itens mágicos equipados, para um atributo específico. */
function calcEquippedAttrBonus(character, attrKey) {
  let total = 0;
  const getAttrBonus = (item) => {
    if (!item) return 0;
    const bonus = item.magicBonus || item.baseData?.magicBonus;
    if (bonus && bonus.attr === attrKey) return bonus.attrValue || 0;
    return 0;
  };
  const slots = ["primary", "secondary", "shield", "armor"];
  slots.forEach(slotKey => { total += getAttrBonus(getEquippedItem(character, slotKey)); });
  const accessories = getEquippedItem(character, "accessory");
  accessories.forEach(item => { total += getAttrBonus(item); });
  return total;
}

/* Peso total do inventário inteiro (equipado ou não — tudo é inventário agora) */
function calcTotalWeight(character) {
  let total = 0;
  character.inventory.forEach(item => total += (item.weight || 0) * (item.qty || 1));
  return Math.max(0, round1(total));
}

/* --- DANO: separa fontes (arma equipada, modificador, dano natural) --- */

/* Combina todas as fontes de dano (cada uma podendo ter múltiplos dados, ex: "1d12 + 1d4")
   em uma única string resumida, somando dados iguais e bônus fixos. Ex.: "1d4 + 2d6 + 1d8 (+3)" */
function buildCombinedDamageString(dmg) {
  const diceCounts = {}; // ex.: { "d4": 3, "d6": 2, "d8": 1 }
  let totalBonus = 0;

  dmg.sources.forEach(source => {
    totalBonus += source.bonus || 0;
    if (!source.dice || source.dice === "—") return;
    // Cada fonte pode ter múltiplos dados, ex: "1d12 + 1d4" ou "1d4 (toque)"
    const diceMatches = source.dice.match(/(\d+)d(\d+)/g);
    if (!diceMatches) return;
    diceMatches.forEach(match => {
      const [qtyStr, sidesStr] = match.split("d");
      const qty = parseInt(qtyStr) || 1;
      const key = "d" + sidesStr;
      diceCounts[key] = (diceCounts[key] || 0) + qty;
    });
  });

  // Ordena por tamanho do dado, do menor para o maior (d4, d6, d8, d10, d12, d20)
  const orderedKeys = Object.keys(diceCounts).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
  const diceParts = orderedKeys.map(key => `${diceCounts[key]}${key}`);

  if (diceParts.length === 0 && totalBonus === 0) return "—";

  let result = diceParts.join(" + ");
  if (totalBonus > 0) result += (result ? ` + ${totalBonus}` : `${totalBonus}`);
  return result || "—";
}


/* ---------------------------------------------------------------------- */
/* REQUISITOS DE ATRIBUTO PARA EQUIPAMENTO                               */
/* Interpreta o texto livre do campo `req` (ex.: "FOR", "FOR/DEX",       */
/* "FOR alta", "FOR (alto)") em uma lista de {attr, minValue} a cumprir. */
/* Cumprir QUALQUER um dos atributos listados já satisfaz o requisito.   */
/* ---------------------------------------------------------------------- */

const REQ_THRESHOLD_NORMAL = 2;
const REQ_THRESHOLD_HIGH = 4;

function parseAttrRequirement(reqText) {
  if (!reqText || reqText === "—") return [];
  const isHigh = /alta|alto/i.test(reqText);
  const threshold = isHigh ? REQ_THRESHOLD_HIGH : REQ_THRESHOLD_NORMAL;
  const found = [];
  ATTRS.forEach(attr => {
    if (reqText.toUpperCase().indexOf(attr) !== -1) {
      found.push({ attr, minValue: threshold });
    }
  });
  return found;
}

/* Verifica se o personagem cumpre o requisito de um item (cumprir QUALQUER
   atributo listado já é suficiente). Retorna { met: bool, requirement: [...] } */
function checkItemRequirement(character, baseData) {
  if (!baseData || !baseData.req) return { met: true, requirement: [] };
  const requirement = parseAttrRequirement(baseData.req);
  if (requirement.length === 0) return { met: true, requirement: [] };
  const met = requirement.some(r => getEffectiveAttr(character, r.attr) >= r.minValue);
  return { met, requirement };
}

/* Penalidade de Chance de Acerto por não cumprir requisito da arma equipada.
   Retorna 0 se cumprir ou se não houver arma/requisito. */
function calcWeaponRequirementPenalty(character) {
  const primary = getEquippedItem(character, "primary");
  if (!primary || !primary.baseData) return 0;
  const check = checkItemRequirement(character, primary.baseData);
  return check.met ? 0 : -2;
}

/* Dano natural por FOR:
   FOR 0 = — | FOR 1 = 1d4 | FOR 2 = 1d6 | FOR 3 = 1d8
   FOR 4 = 1d10 | FOR 5 = 1d12 | FOR 6 = 1d20 | FOR 7 = 2d20 | FOR 8+ = 4d20 */
function calcNaturalDamageByFOR(forValue) {
  const table = ["—", "1d4", "1d6", "1d8", "1d10", "1d12", "1d20", "2d20", "4d20"];
  const idx = Math.min(Math.max(0, forValue), 8);
  return table[idx];
}

function calcDamageBreakdown(character) {
  const cls = getClassDef(character.classKey);
  const primary = getEquippedItem(character, "primary");
  const secondary = getEquippedItem(character, "secondary");

  // Dano natural por FOR (nova regra) — ignora naturalDamageDie da classe
  const forVal = getEffectiveAttr(character, "FOR");
  const naturalDie = calcNaturalDamageByFOR(forVal);
  const naturalNote = forVal >= 8 ? "FOR máximo atingido!" :
                      forVal >= 6 ? "Poder colossal" :
                      forVal === 0 ? "Sem FOR — sem dano natural" : "";

  const sources = [];
  if (primary) {
    const dmg = (primary.baseData && primary.baseData.dmg) || "—";
    sources.push({
      label: `Arma Primária (${primary.name})`,
      dice: dmg,
      bonus: primary.damageBonus || 0,
      modifier: primary.modifierText || ""
    });
  }
  if (secondary && secondary.baseData && secondary.baseData.dmg && secondary.baseData.dmg !== "—") {
    sources.push({
      label: `Arma Secundária (${secondary.name})`,
      dice: secondary.baseData.dmg,
      bonus: secondary.damageBonus || 0,
      modifier: secondary.modifierText || ""
    });
  }
  sources.push({
    label: `Dano Natural (FOR ${forVal} → ${naturalDie})`,
    dice: naturalDie,
    bonus: 0,
    modifier: naturalNote
  });

  // Acessórios e armadura também podem ter bônus de dano via modificador
  const armor = getEquippedItem(character, "armor");
  if (armor && armor.damageBonus) {
    sources.push({ label: `Armadura (${armor.name})`, dice: "—", bonus: armor.damageBonus, modifier: armor.modifierText || "" });
  }
  const accessories = getEquippedItem(character, "accessory");
  accessories.forEach(acc => {
    if (acc.damageBonus) {
      sources.push({ label: `Acessório (${acc.name})`, dice: "—", bonus: acc.damageBonus, modifier: acc.modifierText || "" });
    }
  });

  const totalFixedBonus = sources.reduce((sum, s) => sum + (s.bonus || 0), 0);
  return { sources, totalFixedBonus };
}

/* XP necessário para o próximo nível (fixo em 1000 por nível, conforme regra) */
function xpToNextLevel(character) {
  return XP_PER_LEVEL;
}

/* Aplica ganho de XP, processando subidas de nível múltiplas se necessário */
function applyXPGain(character, amount) {
  character.xp += amount;
  let leveledUp = 0;
  while (character.xp >= xpToNextLevel(character)) {
    character.xp -= xpToNextLevel(character);
    character.level += 1;
    character.unspentAttrPoints = (character.unspentAttrPoints || 0) + 1;
    character.unspentSkillPoints = (character.unspentSkillPoints || 0) + 1;
    leveledUp++;
  }
  return leveledUp;
}

/* ---------------------------------------------------------------------- */
/* WIZARD DE CRIAÇÃO — controle de etapas                                */
/* ---------------------------------------------------------------------- */

let wizardCurrentStep = 1;

function startWizard() {
  wizard = freshWizardDraft();
  wizardCurrentStep = 1;
  renderWizardProgress();
  renderRosterTypeChoice();
  renderClassChoice();
  document.getElementById("input-name").value = "";
  document.getElementById("input-origin").value = "";
  goToWizardStep(1);
  showView("view-create");
}

function renderWizardProgress() {
  const el = document.getElementById("wizard-progress");
  el.innerHTML = "";
  for (let i = 1; i <= WIZARD_STEPS; i++) {
    const dot = document.createElement("div");
    dot.className = "wizard-progress-dot";
    if (i < wizardCurrentStep) dot.classList.add("done");
    if (i === wizardCurrentStep) dot.classList.add("current");
    el.appendChild(dot);
  }
}

function isCasterClass() {
  const cls = getClassDef(wizard.classKey);
  return cls && cls.spellsFull !== null && cls.spellsFull !== undefined;
}

/* Retorna a lista real de etapas a percorrer (pula magia se não for conjurador) */
function getActiveSteps() {
  const steps = [1, 2, 3, 4, 6, 7];
  // etapa 5 (magia) só entra se for conjurador — inserida na posição certa
  const full = [1, 2, 3, 4, 5, 6, 7];
  return full;
}

function goToWizardStep(step) {
  wizardCurrentStep = step;
  document.querySelectorAll(".wizard-step").forEach(s => {
    s.classList.toggle("active", parseInt(s.dataset.step) === step);
  });
  renderWizardProgress();

  // Render content needed for this step right before showing it
  if (step === 3) renderSubclassStep();
  if (step === 4) renderAttributeStep();
  if (step === 5) renderSkillStep();
  if (step === 6) renderSpellStep();
  if (step === 7) renderEquipmentStep();
  if (step === 8) renderReviewStep();

  const backBtn = document.getElementById("btn-wizard-back");
  const nextBtn = document.getElementById("btn-wizard-next");
  const finishBtn = document.getElementById("btn-wizard-finish");

  backBtn.disabled = step === 1;
  if (step === WIZARD_STEPS) {
    nextBtn.classList.add("hidden");
    finishBtn.classList.remove("hidden");
  } else {
    nextBtn.classList.remove("hidden");
    finishBtn.classList.add("hidden");
  }
}

function validateStep(step) {
  if (step === 1) {
    const name = document.getElementById("input-name").value.trim();
    if (!name) { showToast("Dê um nome ao seu personagem antes de continuar."); return false; }
    return true;
  }
  if (step === 2) {
    if (!wizard.classKey) { showToast("Escolha uma classe para continuar."); return false; }
    return true;
  }
  if (step === 3) {
    if (!wizard.subclass) { showToast("Escolha uma subclasse para continuar."); return false; }
    if (wizard.subclassSkills.length !== 2) { showToast("Selecione exatamente 2 habilidades da subclasse."); return false; }
    return true;
  }
  if (step === 4) {
    if (wizard.attrPointsLeft > 0) { showToast(`Ainda restam ${wizard.attrPointsLeft} ponto(s) de atributo para distribuir.`); return false; }
    return true;
  }
  if (step === 5) {
    if (wizard.classSkills.length !== 2) { showToast("Escolha exatamente 2 perícias de classe."); return false; }
    if (wizard.generalSkills.length !== 1) { showToast("Escolha 1 perícia geral."); return false; }
    return true;
  }
  if (step === 6) {
    if (isCasterClass() && !wizard.startSpell) { showToast("Escolha uma magia inicial."); return false; }
    return true;
  }
  return true;
}

document.getElementById("btn-wizard-next").addEventListener("click", () => {
  if (!validateStep(wizardCurrentStep)) return;
  let next = wizardCurrentStep + 1;
  // pular etapa 6 (magia) se a classe não conjura magia
  if (next === 6 && !isCasterClass()) next = 7;
  if (next <= WIZARD_STEPS) goToWizardStep(next);
});

document.getElementById("btn-wizard-back").addEventListener("click", () => {
  let prev = wizardCurrentStep - 1;
  if (prev === 6 && !isCasterClass()) prev = 5;
  if (prev >= 1) goToWizardStep(prev);
});

document.getElementById("btn-cancel-create").addEventListener("click", () => {
  showConfirm("Descartar a criação deste personagem? Nada será salvo.", () => {
    showView("view-list");
    renderCharacterList();
  });
});

/* --- Etapa 1: Identidade --- */

document.getElementById("input-name").addEventListener("input", e => { wizard.name = e.target.value; });
document.getElementById("input-origin").addEventListener("input", e => { wizard.origin = e.target.value; });

function renderRosterTypeChoice() {
  const container = document.getElementById("choice-roster-type");
  container.querySelectorAll(".choice-card").forEach(card => {
    card.classList.toggle("selected", card.dataset.value === wizard.rosterType);
    card.onclick = () => {
      wizard.rosterType = card.dataset.value;
      renderRosterTypeChoice();
    };
  });
}

/* --- Etapa 2: Classe --- */

function renderClassChoice() {
  const container = document.getElementById("choice-class");
  container.innerHTML = "";
  Object.keys(CLASSES).forEach(key => {
    const cls = CLASSES[key];
    const card = document.createElement("button");
    card.className = "choice-card";
    card.dataset.value = key;
    if (wizard.classKey === key) card.classList.add("selected");
    card.innerHTML = `
      <span class="choice-icon">${cls.icon}</span>
      <span class="choice-name">${cls.name}</span>
      <span class="choice-desc">${cls.role}</span>
    `;
    card.onclick = () => {
      wizard.classKey = key;
      // reset selections that depend on class
      wizard.classSkills = [];
      wizard.startSpell = null;
      wizard.equipment = [];
      wizard.equipmentKitApplied = false;
      renderClassChoice();
      renderClassDetail();
    };
    container.appendChild(card);
  });
  renderClassDetail();
}

function renderClassDetail() {
  const detail = document.getElementById("class-detail");
  if (!wizard.classKey) { detail.classList.add("hidden"); return; }
  const cls = getClassDef(wizard.classKey);
  detail.classList.remove("hidden");
  detail.innerHTML = `
    <div class="class-detail-resource">Recurso de classe: ${cls.resource}</div>
    <p>${cls.resourceDesc}</p>
    <div class="class-detail-bonus">Bônus inicial ao escolher esta classe: <strong>+1 ${cls.startBonusAttr} (${ATTR_NAMES[cls.startBonusAttr]})</strong></div>
  `;
}

/* --- Etapa 3: Subclasse --- */

function renderSubclassStep() {
  const classKey  = wizard.classKey;
  const choiceRow = document.getElementById("choice-subclass");
  const detailBox = document.getElementById("subclass-detail");

  choiceRow.innerHTML = Object.entries(SUBCLASSES).map(([key, sc]) => {
    const hasSynergy = sc.sinergyClasses.includes(classKey);
    const isChosen   = wizard.subclass === key;
    return `
      <div class="choice-card ${isChosen ? "selected" : ""} ${hasSynergy ? "choice-card-synergy" : ""}"
           data-subclass="${key}">
        <div class="choice-icon">${sc.icon}</div>
        <div class="choice-name">${sc.name}</div>
        ${hasSynergy ? `<div class="choice-synergy-badge">✨ Sinergia</div>` : ""}
      </div>`;
  }).join("");

  choiceRow.querySelectorAll("[data-subclass]").forEach(card => {
    card.addEventListener("click", () => {
      wizard.subclass      = card.dataset.subclass;
      wizard.subclassSkills = [];
      document.querySelectorAll("#choice-subclass .choice-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      renderSubclassDetail();
    });
  });

  if (wizard.subclass) renderSubclassDetail();
  else detailBox.classList.add("hidden");
}

function renderSubclassDetail() {
  const sc     = SUBCLASSES[wizard.subclass];
  const detail = document.getElementById("subclass-detail");
  if (!sc) { detail.classList.add("hidden"); return; }
  detail.classList.remove("hidden");

  const classKey   = wizard.classKey;
  const hasSynergy = sc.sinergyClasses.includes(classKey);
  const chosen     = wizard.subclassSkills;

  detail.innerHTML = `
    <div class="subclass-header">
      <span class="subclass-icon-lg">${sc.icon}</span>
      <div class="subclass-header-text">
        <h3 class="subclass-title">${sc.name}</h3>
        <p class="subclass-desc">${sc.description}</p>
        ${hasSynergy ? `<p class="subclass-synergy-note">✨ <strong>Sinergia com sua classe:</strong> ${sc.sinergyNote}</p>` : ""}
      </div>
    </div>
    <p class="subclass-pick-hint">
      Escolha <strong>2 habilidades</strong> para adicionar à sua ficha — essas ficam disponíveis para evoluir com pontos de nível. As outras 2 ficam inacessíveis.
      <span class="pick-counter" id="subclass-skill-counter">${chosen.length}/2</span>
    </p>
    <div class="subclass-skills-grid" id="subclass-skills-grid">
      ${sc.skills.map(sk => {
        const isChosen   = chosen.includes(sk.id);
        const isSynergy  = !sk.commonToAll && Array.isArray(sk.sinergyClasses) && sk.sinergyClasses.includes(classKey);
        const isCommon   = sk.commonToAll;
        const isDisabled = !isChosen && chosen.length >= 2;
        return `
          <div class="subclass-skill-card ${isChosen ? "ssc-chosen" : ""} ${isDisabled ? "ssc-disabled" : ""} ${isSynergy ? "ssc-synergy" : ""}"
               data-skill-id="${sk.id}">
            <div class="ssc-header">
              <span class="ssc-name">${sk.name}</span>
              <div class="ssc-badges">
                ${isCommon  ? `<span class="ssc-badge ssc-badge-common">Qualquer classe</span>` : ""}
                ${isSynergy ? `<span class="ssc-badge ssc-badge-synergy">✨ Sinergia</span>`    : ""}
                <span class="ssc-badge ssc-badge-tier">${sk.cost}</span>
              </div>
            </div>
            <p class="ssc-effect">${sk.effect}</p>
            <div class="ssc-levels">
              ${sk.levels.map(lv => `<p class="ssc-level"><strong>Nível ${lv.level}:</strong> ${lv.effect}</p>`).join("")}
            </div>
            ${sk.example ? `<p class="ssc-example">"${sk.example}"</p>` : ""}
            <button class="ssc-choose-btn ${isChosen ? "ssc-chosen" : ""}" data-btn-skill="${sk.id}" ${isDisabled ? "disabled" : ""}>
              ${isChosen ? "✔ Selecionada — remover" : isDisabled ? "🔒 Limite atingido" : "+ Selecionar"}
            </button>
          </div>`;
      }).join("")}
    </div>`;

  detail.querySelectorAll("[data-skill-id]").forEach(card => {
    card.addEventListener("click", e => {
      if (e.target.closest("button")) return; // handled by button
    });
  });
  detail.querySelectorAll("[data-btn-skill]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = btn.dataset.btnSkill;
      if (wizard.subclassSkills.includes(id)) {
        wizard.subclassSkills = wizard.subclassSkills.filter(x => x !== id);
      } else {
        if (wizard.subclassSkills.length >= 2) return;
        wizard.subclassSkills.push(id);
      }
      renderSubclassDetail();
    });
  });
}

/* --- Etapa 3: Atributos --- */

function renderAttributeStep() {
  document.getElementById("attr-points-total").textContent = CREATION_ATTR_POINTS;
  const grid = document.getElementById("attr-grid");
  grid.innerHTML = "";

  ATTRS.forEach(attr => {
    const row = document.createElement("div");
    row.className = "attr-row";
    row.innerHTML = `
      <div>
        <div class="attr-row-name">${ATTR_NAMES[attr]} (${attr})</div>
        <span class="attr-row-desc">${ATTR_DESC[attr]}</span>
      </div>
      <div></div>
      <div class="attr-stepper">
        <button class="attr-step-btn" data-attr="${attr}" data-dir="-1">−</button>
        <span class="attr-value" id="attr-val-${attr}">${wizard.attrs[attr]}</span>
        <button class="attr-step-btn" data-attr="${attr}" data-dir="1">+</button>
      </div>
    `;
    grid.appendChild(row);
  });

  grid.querySelectorAll(".attr-step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const attr = btn.dataset.attr;
      const dir = parseInt(btn.dataset.dir);
      if (dir > 0 && wizard.attrPointsLeft <= 0) return;
      if (dir < 0 && wizard.attrs[attr] <= 0) return;
      wizard.attrs[attr] += dir;
      wizard.attrPointsLeft -= dir;
      updateAttrStepUI();
    });
  });

  updateAttrStepUI();
  renderAttrBonusNote();
}

function updateAttrStepUI() {
  document.getElementById("attr-points-left").textContent = wizard.attrPointsLeft;
  ATTRS.forEach(attr => {
    document.getElementById(`attr-val-${attr}`).textContent = wizard.attrs[attr];
  });
  document.querySelectorAll(".attr-step-btn").forEach(btn => {
    const dir = parseInt(btn.dataset.dir);
    const attr = btn.dataset.attr;
    if (dir > 0) btn.disabled = wizard.attrPointsLeft <= 0;
    if (dir < 0) btn.disabled = wizard.attrs[attr] <= 0;
  });
}

function renderAttrBonusNote() {
  const note = document.getElementById("attr-bonus-note");
  if (!wizard.classKey) { note.textContent = ""; return; }
  const cls = getClassDef(wizard.classKey);
  note.innerHTML = `✦ Ao selar este personagem, ele receberá automaticamente <strong>+1 ${cls.startBonusAttr}</strong> por ser ${cls.name}, somado aos valores acima.`;
}

/* --- Etapa 4: Perícias --- */

function renderSkillStep() {
  const cls = getClassDef(wizard.classKey);

  const classList = document.getElementById("class-skill-list");
  classList.innerHTML = "";
  cls.skillsClass.forEach(skill => {
    const item = buildPickItem(skill.name, skill.attr, skill.desc, wizard.classSkills.includes(skill.name), () => {
      toggleSelection(wizard.classSkills, skill.name, 2);
      renderSkillStep();
    }, skill.example);
    classList.appendChild(item);
  });
  document.getElementById("class-skill-counter").textContent = `(${wizard.classSkills.length}/2)`;

  const generalList = document.getElementById("general-skill-list");
  generalList.innerHTML = "";
  GENERAL_SKILLS.forEach(skill => {
    const item = buildPickItem(skill.name, skill.attr, skill.desc, wizard.generalSkills.includes(skill.name), () => {
      toggleSelection(wizard.generalSkills, skill.name, 1);
      renderSkillStep();
    }, skill.example);
    generalList.appendChild(item);
  });
  document.getElementById("general-skill-counter").textContent = `(${wizard.generalSkills.length}/1)`;

  const combatList = document.getElementById("combat-skill-list");
  if (combatList) {
    combatList.innerHTML = "";
    SKILL_TESTS.filter(t => t.combat).forEach(test => {
      const item = buildPickItem(
        test.name,
        test.attrKeys.join("+"),
        test.desc,
        wizard.combatSkills.includes(test.name),
        () => {
          toggleSelection(wizard.combatSkills, test.name, 1);
          renderSkillStep();
        }
      );
      combatList.appendChild(item);
    });
    document.getElementById("combat-skill-counter").textContent = `(${wizard.combatSkills.length}/1) — opcional`;
  }
}

function toggleSelection(arr, value, maxCount) {
  const idx = arr.indexOf(value);
  if (idx >= 0) {
    arr.splice(idx, 1);
  } else {
    if (arr.length >= maxCount) {
      showToast(`Você só pode escolher ${maxCount} ${maxCount === 1 ? "item" : "itens"} aqui.`);
      return;
    }
    arr.push(value);
  }
}

function buildPickItem(name, meta, desc, selected, onClick, example) {
  const div = document.createElement("div");
  div.className = "pick-item" + (selected ? " selected" : "");
  div.innerHTML = `
    <div class="pick-item-check"></div>
    <div class="pick-item-body">
      <span class="pick-item-name">${name}</span><span class="pick-item-meta">${meta}</span>
      <div class="pick-item-desc">${desc}</div>
      ${example ? `<div class="pick-item-example"><span class="pick-item-example-label">Exemplo:</span> ${example}</div>` : ""}
    </div>
  `;
  div.addEventListener("click", onClick);
  return div;
}

/* --- Etapa 5: Magia Inicial --- */

function renderSpellStep() {
  const desc = document.getElementById("spell-step-desc");
  const skipNote = document.getElementById("spell-skip-note");
  const list = document.getElementById("spell-pick-list");
  list.innerHTML = "";

  if (!isCasterClass()) {
    desc.textContent = "Esta classe não conjura magias através de Slots — esta etapa não se aplica.";
    skipNote.textContent = "";
    return;
  }

  const cls = getClassDef(wizard.classKey);
  desc.textContent = `Como ${cls.name}, você começa conhecendo 1 magia de Nível 1. Magias mais avançadas podem ser aprendidas posteriormente em grimórios.`;
  skipNote.textContent = "";

  const level1Spells = cls.spellsFull.filter(s => s.level === 1);
  level1Spells.forEach(spell => {
    const item = buildPickItem(spell.name, `Nível ${spell.level} · ${spell.cooldown || "sem limite"}`, spell.effect, wizard.startSpell === spell.name, () => {
      wizard.startSpell = spell.name;
      renderSpellStep();
    });
    list.appendChild(item);
  });
}

/* --- Etapa 6: Equipamento Inicial --- */

const STARTER_KITS = {
  guerreiro: ["Espada Longa de Uma Mão", "Escudo Médio", "Armadura de Couro Batido"],
  mago: ["Cetro/Cajado de Uma Mão", "Grimório", "Vestes Arcanas"],
  arqueiro: ["Arco Longo", "Adaga", "Armadura de Couro"],
  ladino: ["Adaga", "Adaga de Lançamento", "Manto das Sombras"],
  clerigo: ["Maça/Clava", "Escudo Leve (broquel)", "Vestes Sagradas"]
};

function findEquipmentByName(name) {
  const weapon = ALL_WEAPONS.find(w => w.name === name);
  if (weapon) return { ...weapon, kind: "weapon" };
  const shield = SHIELDS.find(s => s.name === name);
  if (shield) return { ...shield, kind: "shield" };
  const armor = ARMORS.find(a => a.name === name);
  if (armor) return { ...armor, kind: "armor" };
  return null;
}

function renderEquipmentStep() {
  const list = document.getElementById("equipment-pick-list");
  list.innerHTML = "";

  const kitNote = document.createElement("p");
  kitNote.className = "step-skip-note";
  kitNote.textContent = "Itens sugeridos para sua classe vêm pré-selecionados — desmarque ou adicione outros à vontade.";
  list.appendChild(kitNote);

  if (!wizard.equipmentKitApplied) {
    const kit = STARTER_KITS[wizard.classKey] || [];
    kit.forEach(name => {
      const found = findEquipmentByName(name);
      if (found) wizard.equipment.push(found);
    });
    STARTER_GEAR.slice(0, 4).forEach(g => wizard.equipment.push({ ...g, kind: "gear" }));
    wizard.equipmentKitApplied = true;
  }

  const isStarterEligible = i => (!i.tier || i.tier === "comum") && !i.setName;
  const allOptions = [
    ...ALL_WEAPONS.filter(isStarterEligible).map(w => ({ ...w, kind: "weapon" })),
    ...SHIELDS.filter(isStarterEligible).map(s => ({ ...s, kind: "shield" })),
    ...ARMORS.filter(isStarterEligible).map(a => ({ ...a, kind: "armor" })),
    ...STARTER_GEAR.map(g => ({ ...g, kind: "gear" }))
  ];

  allOptions.forEach(opt => {
    const selected = wizard.equipment.some(e => e.name === opt.name);
    const metaLabel = opt.kind === "weapon" ? `Dano ${opt.dmg || "—"}` : opt.kind === "armor" ? `Def. Física ${opt.physDefense}` : opt.kind === "shield" ? `Def. Física +${opt.physDefense}` : `Item geral`;
    const item = buildPickItem(opt.name, `${metaLabel} · ${opt.weight}kg`, opt.note || "", selected, () => {
      const idx = wizard.equipment.findIndex(e => e.name === opt.name);
      if (idx >= 0) wizard.equipment.splice(idx, 1);
      else wizard.equipment.push(opt);
      renderEquipmentStep();
    });
    list.appendChild(item);
  });

  updateWeightPreview();
}

function updateWeightPreview() {
  const totalWeight = wizard.equipment.reduce((sum, e) => sum + (e.weight || 0), 0);
  const capacity = CARRY_BASE + (wizard.attrs.FOR * CARRY_PER_FOR);
  const preview = document.getElementById("weight-preview");
  preview.textContent = `Peso total selecionado: ${round1(totalWeight)} / ${capacity} de capacidade de carga`;
  preview.classList.toggle("over", totalWeight > capacity);
}

/* --- Etapa 7: Revisão --- */

function renderReviewStep() {
  const cls = getClassDef(wizard.classKey);
  const finalAttrs = { ...wizard.attrs };
  finalAttrs[cls.startBonusAttr] += 1;

  const summary = document.getElementById("review-summary");
  summary.innerHTML = `
    <div class="review-block">
      <h4>Identidade</h4>
      <p><strong>${wizard.name}</strong>${wizard.origin ? " — " + wizard.origin : ""} (${wizard.rosterType === "pc" ? "Personagem Jogador" : "NPC / Criatura"})</p>
    </div>
    <div class="review-block">
      <h4>Classe</h4>
      <p>${cls.icon} ${cls.name} — ${cls.role}</p>
    </div>
    ${wizard.subclass ? (() => {
      const sc = SUBCLASSES[wizard.subclass];
      const skillNames = (wizard.subclassSkills || []).map(id => {
        const sk = sc?.skills.find(s => s.id === id);
        return sk ? sk.name : id;
      });
      return `<div class="review-block">
        <h4>Subclasse</h4>
        <p>${sc?.icon || ""} ${sc?.name || wizard.subclass}</p>
        <p style="font-size:12px;color:var(--ink-soft);margin-top:4px">Habilidades: ${skillNames.join(" · ") || "—"}</p>
      </div>`;
    })() : ""}
    <div class="review-block">
      <h4>Atributos finais (com bônus de classe)</h4>
      <div class="review-attr-chips">
        ${ATTRS.map(a => `<span class="review-chip">${a} ${finalAttrs[a]}</span>`).join("")}
      </div>
    </div>
    <div class="review-block">
      <h4>Perícias</h4>
      <p>Classe: ${wizard.classSkills.join(", ")}<br>Geral: ${wizard.generalSkills.join(", ")}</p>
    </div>
    ${wizard.startSpell ? `<div class="review-block"><h4>Magia Inicial</h4><p>${wizard.startSpell}</p></div>` : ""}
    <div class="review-block">
      <h4>Equipamento Inicial</h4>
      <p>${wizard.equipment.map(e => e.name).join(", ") || "Nenhum"}</p>
    </div>
  `;
}

document.getElementById("btn-wizard-finish").addEventListener("click", finalizeCharacterCreation);

function finalizeCharacterCreation() {
  const cls = getClassDef(wizard.classKey);
  const finalAttrs = { ...wizard.attrs };
  finalAttrs[cls.startBonusAttr] += 1;

  const character = {
    id: uid(),
    rosterType: wizard.rosterType,
    name: wizard.name.trim(),
    origin: wizard.origin.trim(),
    classKey: wizard.classKey,
    subclassKey: wizard.subclass || null,         // subclasse escolhida
    level: 1,
    xp: 0,
    unspentAttrPoints: 0,
    unspentSkillPoints: 0,
    attrs: finalAttrs,
    currentHP: null,
    currentResource: 0,
    skills: {
      class: [...wizard.classSkills, ...(wizard.combatSkills || [])],
      general: [...wizard.generalSkills],
      abilities: [
        ...(cls.skills.length > 0 ? [cls.skills[0].name] : []),
        ...(wizard.subclassSkills || [])           // habilidades de subclasse escolhidas
      ],
      abilityLevels: {
        ...(cls.skills.length > 0 ? { [cls.skills[0].name]: 1 } : {}),
        ...(wizard.subclassSkills || []).reduce((acc, id) => ({ ...acc, [id]: 1 }), {})
      },
    },
    spells: wizard.startSpell ? [wizard.startSpell] : [],
    activeSpells: [], // magias preparadas/equipadas em uso (limitado pelos Slots de Magia)
    inventory: [],
    notes: "",
    createdAt: Date.now()
  };

  // Todo equipamento escolhido entra no inventário. Itens equipáveis (arma/escudo/armadura)
  // são automaticamente equipados no slot apropriado se ele ainda estiver vazio.
  let primaryTaken = false, secondaryTaken = false, shieldTaken = false, armorTaken = false;

  wizard.equipment.forEach(item => {
    const canBeSecondary = item.kind === "weapon" && item.slot && item.slot.includes("secondary");
    let equippedSlot = null;

    if (item.kind === "weapon" && !primaryTaken) { equippedSlot = "primary"; primaryTaken = true; }
    else if (item.kind === "weapon" && canBeSecondary && !secondaryTaken) { equippedSlot = "secondary"; secondaryTaken = true; }
    else if (item.kind === "shield" && !shieldTaken) { equippedSlot = "shield"; shieldTaken = true; }
    else if (item.kind === "armor" && !armorTaken) { equippedSlot = "armor"; armorTaken = true; }

    character.inventory.push(makeInventoryItem(item, equippedSlot));
  });

  character.currentHP = calcMaxHP(character);

  characters.push(character);
  saveCharacters(characters);
  showToast(`${character.name} foi registrado no grimório!`);
  showView("view-list");
  renderCharacterList();
}

/* Constrói um item de inventário no formato padronizado usado em toda a ficha.
   `sourceItem` pode vir do catálogo (weapon/shield/armor/accessory, com baseData)
   ou ser um item genérico (gear) sem baseData. */
function makeInventoryItem(sourceItem, equippedSlot) {
  const category = sourceItem.kind || sourceItem.category || "gear";
  let baseData = null;
  if (category === "weapon") baseData = ALL_WEAPONS.find(w => w.name === sourceItem.name) || null;
  if (category === "shield") baseData = SHIELDS.find(s => s.name === sourceItem.name) || null;
  if (category === "armor") baseData = ARMORS.find(a => a.name === sourceItem.name) || null;
  if (category === "accessory") baseData = ACCESSORIES.find(a => a.name === sourceItem.name) || null;

  return {
    instanceId: uid(),
    name: sourceItem.name,
    qty: 1,
    weight: sourceItem.weight || 0,
    category, // "weapon" | "shield" | "armor" | "accessory" | "gear"
    baseData, // dados completos do catálogo, ou null se for item genérico
    equippedSlot: equippedSlot || null, // null | "primary" | "secondary" | "shield" | "armor" | "accessory"
    damageBonus: 0,
    modifierText: ""
  };
}

/* ---------------------------------------------------------------------- */
/* LISTA DE PERSONAGENS                                                   */
/* ---------------------------------------------------------------------- */

function renderCharacterList() {
  const grid = document.getElementById("character-grid");
  const emptyState = document.getElementById("empty-state");
  grid.innerHTML = "";

  const filtered = characters.filter(c => c.rosterType === currentRosterTab);

  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  filtered.forEach(character => {
    const cls = getClassDef(character.classKey);
    const maxHP = calcMaxHP(character);
    const hpPct = clamp((character.currentHP / maxHP) * 100, 0, 100);
    const xpPct = clamp((character.xp / xpToNextLevel(character)) * 100, 0, 100);

    const card = document.createElement("div");
    card.className = "char-card";
    card.innerHTML = `
      <button class="char-card-delete" title="Remover personagem" aria-label="Remover personagem">✕</button>
      <div class="char-card-seal">${cls ? cls.icon : "?"}</div>
      <h3 class="char-card-name">${escapeHTML(character.name)}</h3>
      <p class="char-card-class">${cls ? cls.name : "Sem classe"}${character.origin ? " · " + escapeHTML(character.origin) : ""}</p>
      <div class="char-card-bars">
        <div class="mini-bar-row">
          <span class="mini-bar-label">PV</span>
          <div class="mini-bar-track"><div class="mini-bar-fill hp" style="width:${hpPct}%"></div></div>
          <span>${character.currentHP}/${maxHP}</span>
        </div>
        <div class="mini-bar-row">
          <span class="mini-bar-label">XP</span>
          <div class="mini-bar-track"><div class="mini-bar-fill xp" style="width:${xpPct}%"></div></div>
          <span>${character.xp}/${xpToNextLevel(character)}</span>
        </div>
      </div>
      <div class="char-card-footer">
        <span class="char-card-level">Nível ${character.level}</span>
        <span>${character.rosterType === "pc" ? "Jogador" : "NPC"}</span>
      </div>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".char-card-delete")) return;
      openCharacterSheet(character.id);
    });

    card.querySelector(".char-card-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      showConfirm(`Remover permanentemente "${character.name}" do grimório?`, () => {
        characters = characters.filter(c => c.id !== character.id);
        saveCharacters(characters);
        renderCharacterList();
        showToast(`${character.name} foi removido.`);
      });
    });

    grid.appendChild(card);
  });
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    currentRosterTab = btn.dataset.roster;
    renderCharacterList();
  });
});

document.getElementById("btn-new-character").addEventListener("click", startWizard);

/* ---------------------------------------------------------------------- */
/* FICHA DE PERSONAGEM                                                    */
/* ---------------------------------------------------------------------- */

function findCharacter(id) { return characters.find(c => c.id === id); }

function persistCurrentCharacter() {
  saveCharacters(characters);
}

function openCharacterSheet(id) {
  currentSheetId = id;
  renderSheet();
  showView("view-sheet");
}

document.getElementById("btn-back-sheet").addEventListener("click", () => {
  currentSheetId = null;
  showView("view-list");
  renderCharacterList();
});

/* ---------------------------------------------------------------------- */
/* GLOSSÁRIO & TUTORIAIS                                                  */
/* ---------------------------------------------------------------------- */

let currentGlossaryTab = "classes";


function openBestiary()    { window.open("bestiary.html",    "_blank"); }
function openLocations()   { window.open("locations.html",   "_blank"); }
function openHistory()     { window.open("history.html",     "_blank"); }
function openCampaignLog() { window.open("campaign-log.html","_blank"); }
function openMap()         { window.open("map.html",         "_blank"); }
function openBattleMap()   { window.open("battle-map.html",  "_blank"); }

function openGlossary() {
  currentGlossaryTab = "classes";
  document.querySelectorAll("#glossary-tabs .tab-btn").forEach(b => b.classList.toggle("active", b.dataset.glossarytab === "classes"));
  document.getElementById("glossary-search").value = "";
  renderGlossaryContent();
  showView("view-glossary");
}

document.getElementById("btn-back-glossary").addEventListener("click", () => {
  showView("view-list");
  renderCharacterList();
});

document.querySelectorAll("#glossary-tabs .tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentGlossaryTab = btn.dataset.glossarytab;
    document.querySelectorAll("#glossary-tabs .tab-btn").forEach(b => b.classList.toggle("active", b === btn));
    document.getElementById("glossary-search").value = "";
    renderGlossaryContent();
  });
});

document.getElementById("glossary-search").addEventListener("input", () => {
  renderGlossaryContent();
});

function renderGlossaryContent() {
  const container = document.getElementById("glossary-content");
  const query = document.getElementById("glossary-search").value.trim().toLowerCase();

  if (currentGlossaryTab === "classes") {
    container.innerHTML = renderClassTutorials();
  } else if (currentGlossaryTab === "abilities") {
    container.innerHTML = renderAbilitiesGlossary(query);
  } else if (currentGlossaryTab === "spells") {
    container.innerHTML = renderSpellsGlossary(query);
  } else if (currentGlossaryTab === "items") {
    container.innerHTML = renderItemsGlossary(query);
  } else if (currentGlossaryTab === "rules") {
    container.innerHTML = renderRulesTab();
    // Bind acordeão das regras
    container.querySelectorAll(".rules-accordion-trigger").forEach(btn => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
        const isOpen = btn.classList.contains("open");
        container.querySelectorAll(".rules-accordion-trigger.open").forEach(b => {
          b.classList.remove("open");
          b.nextElementSibling?.classList.remove("open");
        });
        if (!isOpen) { btn.classList.add("open"); panel?.classList.add("open"); }
      });
    });
  }
}

/* --- Tutorial de Classes --- */

const CLASS_TUTORIALS = {
  guerreiro: {
    howToPlay: "O Guerreiro é a linha de frente do grupo: absorve dano, controla o posicionamento dos inimigos e entrega dano físico constante. Equipe a arma mais pesada que sua FOR permitir e use Postura Defensiva quando antecipar muitos ataques na mesma rodada.",
    howToGainResource: "Você ganha 1 ponto de Fúria sempre que <strong>acerta</strong> um ataque corpo a corpo, e também sempre que <strong>recebe dano</strong> de qualquer fonte. Ou seja: tanto atacar quanto ser atacado alimenta sua Fúria — não hesite em entrar em combate corpo a corpo.",
    howToUseResource: "Gaste Fúria nas habilidades da sua árvore (seção Habilidades de Classe na ficha). A Fúria não acumula entre combates — zera ao final de cada luta — então o ideal é gastá-la durante a própria batalha em que foi ganha, não guardá-la para depois.",
    tip: "Dica: comece a luta com Postura Defensiva se esperar ser focado por vários inimigos; gaste a Fúria acumulada em Golpe Pesado ou Quebra-Guarda quando identificar o alvo prioritário."
  },
  mago: {
    howToPlay: "O Mago entrega o maior dano em área do jogo, mas é frágil e depende de posicionamento cuidadoso — fique fora do alcance de ataques corpo a corpo sempre que possível. Magias de Nível 3+ exigem turnos de concentração, então proteja-se com aliados na linha de frente antes de conjurá-las.",
    howToGainResource: "Seu MP (Mana) máximo é calculado automaticamente como 10 + (INT × 2). Diferente da Fúria, o MP <strong>não se ganha em combate</strong> — ele já existe como uma reserva fixa que se recarrega com descanso (100% em descanso longo, 25% em descanso curto).",
    howToUseResource: "MP é gasto exclusivamente nas habilidades de <em>amplificação</em> de magia (Amplificar Dano, Eco Arcano, etc.) — não na conjuração da magia em si, que usa Slots de Magia (INT + SAB) separadamente. Use o MP para tornar uma magia já poderosa ainda mais decisiva no momento certo.",
    tip: "Dica: a habilidade 'Reserva Arcana Ampliada' permite recarregar um uso extra de uma magia com cooldown apertado — economize MP para usá-la antes de magias de Nível 5 com cooldown semanal."
  },
  arqueiro: {
    howToPlay: "O Arqueiro controla o campo de batalha à distância, focando alvos prioritários e mantendo-se sempre reposicionando. Use Marcar Alvo no inimigo mais perigoso assim que o combate começar, para que todo o grupo se beneficie do bônus de acerto contra ele.",
    howToGainResource: "Você ganha 1 ponto de Foco sempre que <strong>acerta</strong> um ataque à distância. Ficar parado e disparar repetidamente é a forma mais simples de acumular Foco rapidamente.",
    howToUseResource: "Foco é gasto nas habilidades da sua árvore. Como o Foco zera fora de combate, gaste-o ao longo da própria luta — guardar Foco para 'depois' geralmente significa perder esses pontos quando o combate terminar.",
    tip: "Dica: Reposicionamento Tático custa pouco Foco e permite fugir de perseguidores enquanto ainda ataca — ótimo para não ficar cercado."
  },
  ladino: {
    howToPlay: "O Ladino busca o golpe certeiro: aproxime-se furtivamente, espere a abertura (alvo Desprevenido ou flanqueado) e descarregue um Ataque Furtivo. Fora de combate, suas perícias de Furtividade e Ladinagem resolvem fechaduras, armadilhas e investigação.",
    howToGainResource: "Cargas de Veneno não são 'ganhas' em combate — você começa cada dia com 3 cargas fixas, recarregando após um descanso longo. Cuidado: gaste-as estrategicamente, pois não há como recuperá-las no meio de uma sessão sem itens específicos (como o Frasco de Antídoto Permanente).",
    howToUseResource: "Use Cargas de Veneno nas habilidades de envenenamento (Golpe Envenenado, Veneno Paralisante, Sangramento Mortal). Combine com Ataques Furtivos sempre que possível, já que o dano extra de furtividade se soma ao efeito do veneno.",
    tip: "Dica: 'Emboscada' permite se mover e atacar furtivamente no mesmo turno sem se revelar antes do golpe — ideal para abrir um combate com dano máximo antes que os inimigos saibam que você está lá."
  },
  clerigo: {
    howToPlay: "O Clérigo equilibra cura, suporte e dano sagrado moderado. Use magias e habilidades de cura proativamente entre os turnos de combate — não espere os aliados chegarem a 0 HP para agir. Em combate corpo a corpo, sua FOR alta permite usar armas de impacto sem penalidade.",
    howToGainResource: "Sua Fé Máxima é calculada automaticamente como 8 + SAB. Assim como o MP do Mago, a Fé <strong>não se ganha em combate</strong> — recarrega 50% em descanso curto e 100% em descanso longo.",
    howToUseResource: "Fé é gasta nas habilidades de cura/suporte rápidas (Mãos Curativas, Bênção, Escudo da Fé) — separada dos Slots de Magia, que conjuram as magias propriamente ditas (Curar Feridas, Punição Divina, etc.). Isso permite intercalar curas pequenas via Fé sem esgotar seus Slots de Magia maiores.",
    tip: "Dica: guarde 'Ressurreição Menor' (custa toda a Fé) apenas para emergências reais — um aliado caído há até 3 rodadas pode ser trazido de volta com 50% do HP máximo, uma vez por dia."
  }
};

/* =====================================================================
   REGRAS DA MESA — aba de referência rápida com acordeão
   ===================================================================== */

function renderRulesTab() {
  const sections = [
    {
      id: "xp-niveis",
      icon: "⭐",
      title: "XP e Níveis",
      content: `
        <div class="rules-block">
          <p class="rules-intro">O avanço de personagens é medido em <strong>Pontos de Experiência (XP)</strong>. Cada 1.000 XP acumulados equivalem a um nível. O XP não é zerado ao subir de nível — acumula continuamente.</p>
          <div class="rules-table-wrap">
            <table class="rules-table">
              <thead><tr><th>Nível</th><th>XP Total</th><th>Ações (sem attrs)</th><th>Ações de Magia (INT 0)</th></tr></thead>
              <tbody>
                ${[1,2,3,4,5,6,7,8,9,10,12,15].map(lvl => {
                  const act  = 1 + Math.floor(lvl/3);
                  const sp   = 1 + Math.floor(lvl/3);
                  return `<tr><td><strong>Nv. ${lvl}</strong></td><td>${(lvl-1)*1000} XP</td><td>${act} ação${act>1?"ões":""}</td><td>${sp} ação${sp>1?"ões":""} magia</td></tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
          <div class="rules-callout rules-callout-gold">
            <strong>Ao subir de nível você recebe:</strong>
            <ul class="rules-list">
              <li>+1 ponto de Atributo para distribuir livremente (use ↺ Redistribuir para realocar os anteriores)</li>
              <li>+1 ponto de Habilidade para aprender habilidades de classe ou gerais</li>
              <li>HP máximo cresce automaticamente via <em>hpPerLevel</em> da classe</li>
              <li>Ações de Combate e Ações de Magia crescem automaticamente a cada 3 níveis</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-green">
            <strong>Sugestão de XP por encontro (guia do Mestre):</strong>
            <ul class="rules-list">
              <li><span class="rules-badge diff-1">☠ Fácil</span> 50–100 XP por criatura derrotada</li>
              <li><span class="rules-badge diff-2">☠☠ Equilibrado</span> 100–200 XP por criatura</li>
              <li><span class="rules-badge diff-3">☠☠☠ Desafiador</span> 200–350 XP por criatura</li>
              <li><span class="rules-badge diff-4">☠☠☠☠ Muito Forte</span> 350–500 XP por criatura ou evento</li>
              <li><span class="rules-badge diff-5">☠☠☠☠☠ Chefe</span> 500–1000 XP + XP de narrativa</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: "atributos",
      icon: "💪",
      title: "Atributos",
      content: `
        <div class="rules-block">
          <p class="rules-intro">Existem 5 atributos. Na criação o personagem começa com <strong>2 pontos</strong> para distribuir, e ganha <strong>+1 ponto</strong> por nível. Use ↺ Redistribuir na aba Vital para reorganizá-los a qualquer momento.</p>
          <div class="rules-attr-grid">
            <div class="rules-attr-card">
              <span class="rules-attr-badge">FOR</span>
              <strong>Força</strong>
              <ul class="rules-list">
                <li>HP máximo: <code>20 + FOR × hpPerFor</code> (varia por classe)</li>
                <li>Dano natural corpo a corpo (tabela abaixo)</li>
                <li>Carga máxima: <code>20 + FOR × 5</code></li>
              </ul>
              <div class="rules-sub-table">
                <div class="rules-sub-row"><span>FOR 0</span><span>—</span></div>
                <div class="rules-sub-row"><span>FOR 1</span><span>1d4</span></div>
                <div class="rules-sub-row"><span>FOR 2</span><span>1d6</span></div>
                <div class="rules-sub-row"><span>FOR 3</span><span>1d8</span></div>
                <div class="rules-sub-row"><span>FOR 4</span><span>1d10</span></div>
                <div class="rules-sub-row"><span>FOR 5</span><span>1d12</span></div>
                <div class="rules-sub-row"><span>FOR 6</span><span>1d20</span></div>
                <div class="rules-sub-row"><span>FOR 7</span><span>2d20</span></div>
                <div class="rules-sub-row rules-sub-row-max"><span>FOR 8+</span><span>4d20 ⚡</span></div>
              </div>
            </div>
            <div class="rules-attr-card">
              <span class="rules-attr-badge">DEX</span>
              <strong>Destreza</strong>
              <ul class="rules-list">
                <li>+1 Ação de Combate a cada 5 DEX</li>
                <li>Testes de precisão, ladinagem e armas de arremesso</li>
                <li>Reduz penalidade de requisito de armas leves</li>
              </ul>
            </div>
            <div class="rules-attr-card">
              <span class="rules-attr-badge">AGI</span>
              <strong>Agilidade</strong>
              <ul class="rules-list">
                <li>+1 Ação de Combate a cada 4 AGI</li>
                <li>Movimento: <code>4 + AGI − penalidade armadura</code></li>
                <li>Reações: <code>1 + floor(AGI/4)</code></li>
                <li>Ações de Reação: <code>1 + floor(AGI/3)</code></li>
                <li>Esquiva: <code>10 + AGI − penalidades</code></li>
              </ul>
            </div>
            <div class="rules-attr-card">
              <span class="rules-attr-badge">INT</span>
              <strong>Inteligência</strong>
              <ul class="rules-list">
                <li>+1 Ação de Magia a cada 2 INT</li>
                <li>Slots de Magia: <code>INT + SAB</code></li>
                <li>Testes de conhecimento, arcanismo e percepção</li>
              </ul>
            </div>
            <div class="rules-attr-card">
              <span class="rules-attr-badge">SAB</span>
              <strong>Sabedoria</strong>
              <ul class="rules-list">
                <li>Slots de Magia: <code>INT + SAB</code></li>
                <li>Bônus de Cura: Clérigo ganha <code>2×SAB</code>, outros <code>SAB</code></li>
                <li>Testes de resistência mental, percepção e sobrevivência</li>
              </ul>
            </div>
          </div>
        </div>
      `
    },
    {
      id: "acoes",
      icon: "⚔",
      title: "Sistema de Ações",
      content: `
        <div class="rules-block">
          <p class="rules-intro">Em combate, cada personagem tem três tipos de recursos de ação por rodada: <strong>Ações</strong>, <strong>Reações</strong> e <strong>Ações de Reação</strong>. Cada tipo é independente.</p>
          <div class="rules-callout rules-callout-red">
            <strong>⚔ Ações de Combate</strong> — o que você faz no seu turno
            <p>Fórmula: <code>1 + floor(Nível÷3) + floor(AGI÷4) + floor(DEX÷5) + bônus de itens</code></p>
            <ul class="rules-list">
              <li>Nível 1 sem attrs: <strong>1 ação</strong></li>
              <li>Nível 3 sem attrs: <strong>2 ações</strong> (+1 pelo nível)</li>
              <li>Nível 6 sem attrs: <strong>3 ações</strong> (+2 pelo nível)</li>
              <li>AGI 4: +1 ação extra | AGI 8: +2 ações extras</li>
              <li>DEX 5: +1 ação extra | DEX 10: +2 ações extras</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-blue">
            <strong>✨ Ações de Magia</strong> — usadas para conjurar magias (todas as classes)
            <p>Fórmula: <code>1 + floor(Nível÷3) + floor(INT÷2) + bônus de itens</code></p>
            <ul class="rules-list">
              <li>Qualquer personagem em Nível 1 tem pelo menos <strong>1 Ação de Magia</strong></li>
              <li>INT 2: +1 | INT 4: +2 | INT 6: +3</li>
              <li>Conjurar uma magia de nível 1 custa 1 Ação de Magia e 1 Slot de Magia</li>
              <li>Magias lentas (ritmos, rituais) custam múltiplos turnos de concentração</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-green">
            <strong>🔄 Reações</strong> — usadas fora do seu turno
            <p>Fórmula: <code>1 + floor(AGI÷4) + bônus de itens</code></p>
            <ul class="rules-list">
              <li>Reações são gastas fora do turno (Bloquear, Esquivar, Contra-Atacar)</li>
              <li>Cada Reação gasta permite executar 1 <em>Ação de Reação</em></li>
              <li>Reações não utilizadas são perdidas ao início do próximo turno</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-gold">
            <strong>↩ Ações de Reação</strong> — o que você pode fazer quando reage
            <p>Fórmula: <code>max(1, floor(AGI÷3)) + bônus de itens</code></p>
            <ul class="rules-list">
              <li>AGI 3: 1 Ação de Reação | AGI 6: 2 | AGI 9: 3</li>
              <li>Cada Reação gasta ativa o uso de Ações de Reação naquele momento</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: "hp-defesa",
      icon: "❤",
      title: "HP, Defesa e Movimento",
      content: `
        <div class="rules-block">
          <div class="rules-callout rules-callout-red">
            <strong>❤ HP Máximo por classe</strong>
            <p>Fórmula universal: <code>20 + FOR × hpPerFor + hpPerLevel × (Nível − 1) + bônus de itens</code></p>
            <div class="rules-table-wrap">
              <table class="rules-table">
                <thead><tr><th>Classe</th><th>HP/FOR</th><th>HP/Nível</th><th>Carga/Nível</th></tr></thead>
                <tbody>
                  <tr><td>⚔ Guerreiro</td><td>+5</td><td>+10/nv</td><td>+5/nv</td></tr>
                  <tr><td>✨ Mago</td><td>+2</td><td>+6/nv</td><td>+2/nv</td></tr>
                  <tr><td>🏹 Arqueiro</td><td>+3</td><td>+8/nv</td><td>+4/nv</td></tr>
                  <tr><td>🗡 Ladino</td><td>+3</td><td>+7/nv</td><td>+3/nv</td></tr>
                  <tr><td>✝ Clérigo</td><td>+4</td><td>+9/nv</td><td>+4/nv</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="rules-callout rules-callout-blue">
            <strong>🛡 Defesa Física e Mágica</strong>
            <ul class="rules-list">
              <li>Defesa Física vem de armaduras, escudos e habilidades</li>
              <li>Defesa Mágica vem de vestes, foco e habilidades arcanas</li>
              <li>Cada ponto de Defesa reduz o dano daquela categoria em 1 ponto</li>
              <li>Algumas armaduras pesadas aplicam penalidade de Movimento</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-green">
            <strong>🏃 Movimento</strong>
            <p>Fórmula: <code>4 + AGI − penalidade de armadura/escudo</code></p>
            <ul class="rules-list">
              <li>Movimento representa hexágonos percorridos por Ação de Movimento</li>
              <li>Mover-se custa 1 Ação de Combate por segmento de Movimento usado</li>
              <li>Terreno difícil (lama, água, escombros) reduz o Movimento pela metade</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-gold">
            <strong>📦 Carga</strong>
            <p>Fórmula: <code>20 + FOR × 5 + carryPerLevel × (Nível−1) + bônus de itens</code></p>
            <ul class="rules-list">
              <li>Se o peso total dos itens equipados + inventário exceder a Carga, o personagem fica Sobrecarregado</li>
              <li>Sobrecarregado: −2 em todos os testes físicos e Movimento reduzido à metade</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: "magia",
      icon: "✨",
      title: "Sistema de Magia",
      content: `
        <div class="rules-block">
          <p class="rules-intro">Qualquer personagem pode conjurar magias, mas classes conjuradoras (Mago, Clérigo) têm vantagens significativas em Slots, Ações de Magia e habilidades de amplificação.</p>
          <div class="rules-callout rules-callout-blue">
            <strong>🔵 Slots de Magia</strong>
            <p>Fórmula: <code>INT + SAB</code> (mínimo 1 para Mago e Clérigo)</p>
            <ul class="rules-list">
              <li>Cada conjuração gasta 1 Slot, independente do nível da magia</li>
              <li>Slots recuperam 100% em Descanso Longo e 25% em Descanso Curto</li>
              <li>Magias equipadas são as que o personagem mantém "na memória"</li>
              <li>Para conjurar, a magia precisa estar <em>equipada</em> (ativa na aba Magias)</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-gold">
            <strong>📋 Níveis de Magia</strong>
            <div class="rules-table-wrap">
              <table class="rules-table">
                <thead><tr><th>Nível</th><th>Poder</th><th>Custo de Tempo</th><th>Acesso</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>Básico</td><td>1 Ação de Magia</td><td>Qualquer conjurador</td></tr>
                  <tr><td>2</td><td>Significativo</td><td>1 Ação de Magia</td><td>Qualquer conjurador</td></tr>
                  <tr><td>3</td><td>Poderoso</td><td>1 turno de concentração</td><td>Conjurador experiente</td></tr>
                  <tr><td>4</td><td>Muito Forte</td><td>2 turnos de concentração</td><td>Mago / Clérigo avançado</td></tr>
                  <tr><td>5</td><td>Lendário</td><td>Ritual completo + custo extra</td><td>Classe avançada apenas</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="rules-callout rules-callout-green">
            <strong>🟢 Conjuração e Concentração</strong>
            <ul class="rules-list">
              <li>Magias lentas (turnos de concentração) exigem que o personagem não seja interrompido</li>
              <li>Receber dano durante concentração exige teste de SAB (dificuldade = dano ÷ 5, mínimo 1) ou a magia falha</li>
              <li>Rituais de Nível 5 geralmente consomem recurso de classe (Mana, Fúria, Foco ou Fé)</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-red">
            <strong>🔴 Invocações — Condições por Nível</strong>
            <ul class="rules-list">
              <li><strong>Nv 1–2:</strong> Sem condição especial além do custo normal</li>
              <li><strong>Nv 3:</strong> Requer INT ou SAB ≥ 2</li>
              <li><strong>Nv 4:</strong> Foco contínuo — gasta 1 Ação de Magia por turno para manter a criatura ativa</li>
              <li><strong>Nv 5:</strong> Ritual de 1 turno completo + custo de recurso de classe</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: "testes",
      icon: "🎲",
      title: "Testes e Dificuldades",
      content: `
        <div class="rules-block">
          <p class="rules-intro">Quando o sucesso não é garantido, o Mestre pede um <strong>Teste</strong>. Role 1d20 e adicione o atributo relevante. Compare com a dificuldade.</p>
          <div class="rules-table-wrap">
            <table class="rules-table">
              <thead><tr><th>Dificuldade</th><th>Resultado Necessário</th><th>Situação Típica</th></tr></thead>
              <tbody>
                <tr><td><strong>Fácil</strong></td><td>1d20 + atributo ≥ 8</td><td>Tarefa simples com algum risco</td></tr>
                <tr><td><strong>Normal</strong></td><td>1d20 + atributo ≥ 12</td><td>Desafio para um aventureiro treinado</td></tr>
                <tr><td><strong>Difícil</strong></td><td>1d20 + atributo ≥ 16</td><td>Exige habilidade e preparação</td></tr>
                <tr><td><strong>Crítico</strong></td><td>1d20 + atributo ≥ 20</td><td>Borda do impossível — raramente pedido</td></tr>
              </tbody>
            </table>
          </div>
          <div class="rules-callout rules-callout-gold">
            <strong>Teste com Vantagem / Desvantagem</strong>
            <ul class="rules-list">
              <li><em>Vantagem:</em> role 2d20 e use o maior resultado</li>
              <li><em>Desvantagem:</em> role 2d20 e use o menor resultado</li>
              <li>Nunca se acumulam: vantagem + vantagem ainda é só 2 dados</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-green">
            <strong>Acerto Crítico e Falha Crítica</strong>
            <ul class="rules-list">
              <li><strong>20 natural (antes de somar)</strong> = Crítico: sucesso automático + efeito especial definido pelo Mestre</li>
              <li><strong>1 natural (antes de somar)</strong> = Falha Crítica: falha automática + complicação narrativa</li>
              <li>Em ataques, Crítico significa dano máximo (não rola dados — usa o valor máximo de cada dado)</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: "combate",
      icon: "🗡",
      title: "Sequência de Combate",
      content: `
        <div class="rules-block">
          <div class="rules-callout rules-callout-red">
            <strong>1. Iniciativa</strong>
            <ul class="rules-list">
              <li>Cada participante rola 1d20 + AGI</li>
              <li>Ordem decrescente (maior vai primeiro)</li>
              <li>Empates: AGI maior vai primeiro; se ainda empatado, joga dado</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-gold">
            <strong>2. Turno do Personagem</strong>
            <ul class="rules-list">
              <li>Use as Ações de Combate disponíveis para: atacar, usar habilidade, mover-se, interagir com objeto</li>
              <li>Use as Ações de Magia disponíveis para conjurar magias</li>
              <li>Ações não usadas no turno são perdidas (não acumulam)</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-blue">
            <strong>3. Reações (fora do seu turno)</strong>
            <ul class="rules-list">
              <li>Quando um inimigo ataca você, gasta uma Reação para executar Ações de Reação</li>
              <li>Possíveis Ações de Reação: Bloquear (usar escudo/arma), Esquivar (rolar Esquiva), Contra-Atacar</li>
              <li>Sem Reações sobrando: você não pode reagir — o ataque acerta automaticamente se tiver acerto</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-green">
            <strong>4. Ataque</strong>
            <ul class="rules-list">
              <li>Role o dado de acerto da arma (varia por arma e habilidade)</li>
              <li>Compare com a Esquiva do alvo — se igual ou maior, acerta</li>
              <li>Se acertar: role o dano da arma + dano natural (FOR) + modificadores</li>
              <li>O alvo reduz o dano recebido pela Defesa correspondente (física ou mágica)</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: "descanso",
      icon: "🏕",
      title: "Descanso e Recuperação",
      content: `
        <div class="rules-block">
          <div class="rules-table-wrap">
            <table class="rules-table">
              <thead><tr><th>Tipo</th><th>Duração</th><th>O que recupera</th></tr></thead>
              <tbody>
                <tr>
                  <td><strong>Descanso Curto</strong></td>
                  <td>~1 hora</td>
                  <td>25% do HP máximo; 25% dos Slots de Magia; Fúria/Foco/Fé zerados (resetam)</td>
                </tr>
                <tr>
                  <td><strong>Descanso Longo</strong></td>
                  <td>8 horas (dormir)</td>
                  <td>HP máximo completo; Slots de Magia completos; recurso de classe no máximo; Cargas de Veneno do Ladino resetam</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="rules-callout rules-callout-gold">
            <strong>Condições que interrompem o descanso longo:</strong>
            <ul class="rules-list">
              <li>Sofrer qualquer dano durante as 8 horas</li>
              <li>Conjurar uma magia (exceto magias de vigia acordada)</li>
              <li>Qualquer combate — mesmo que curto</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: "condicoes",
      icon: "⚠",
      title: "Condições",
      content: `
        <div class="rules-block">
          <p class="rules-intro">Condições são estados que afetam o personagem até serem removidas (cura, habilidade, fim de duração ou teste bem-sucedido).</p>
          <div class="rules-table-wrap">
            <table class="rules-table">
              <thead><tr><th>Condição</th><th>Efeito</th><th>Como Remover</th></tr></thead>
              <tbody>
                <tr><td><strong>Atordoado</strong></td><td>Perde todas as Ações no próximo turno</td><td>Fim da duração ou Descanso Curto</td></tr>
                <tr><td><strong>Derrubado</strong></td><td>−1d4 na Esquiva; levantar custa 1 Ação</td><td>Levantar (1 Ação)</td></tr>
                <tr><td><strong>Envenenado</strong></td><td>Sofre dano por turno (varia); −1d4 em testes</td><td>Antídoto, Clérigo (Purificar), Descanso Longo</td></tr>
                <tr><td><strong>Sangramento</strong></td><td>Sofre dano por turno (não acumula além do máximo indicado)</td><td>1 Ação (estabilizar) ou cura mágica</td></tr>
                <tr><td><strong>Amedrontado</strong></td><td>Não pode se aproximar da fonte do medo; −1d4 em testes enquanto a vê</td><td>Sair do campo de visão da fonte; Descanso Longo</td></tr>
                <tr><td><strong>Dominado</strong></td><td>Age sob controle do conjurador inimigo</td><td>Fim da duração; sofrer dano (teste SAB); cura mágica</td></tr>
                <tr><td><strong>Paralisado</strong></td><td>Não pode agir nem reagir; Esquiva cai a 0</td><td>Fim da duração; teste SAB no início de cada turno</td></tr>
                <tr><td><strong>Corrompido</strong></td><td>Sofre 1d6 por turno; 20% de chance de atacar aliados</td><td>Magia sagrada Nv 3+; Clérigo com Purificar</td></tr>
                <tr><td><strong>Exausto</strong></td><td>−1d4 em todos os testes por 1–2 rodadas</td><td>Fim da duração</td></tr>
                <tr><td><strong>Inconsciente</strong></td><td>0 Ações; Esquiva 0; pode ser executado (Ataque Fatal)</td><td>Estabilizar (1 HP); cura; Descanso</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `
    },
    {
      id: "itens-equipamento",
      icon: "🛡",
      title: "Itens e Equipamento",
      content: `
        <div class="rules-block">
          <div class="rules-callout rules-callout-gold">
            <strong>Tiers de Item</strong>
            <ul class="rules-list">
              <li><span class="rules-badge tier-comum">Comum</span> Itens mundanos, disponíveis em qualquer cidade</li>
              <li><span class="rules-badge tier-raro">Raro</span> Itens de qualidade excepcional, raramente encontrados</li>
              <li><span class="rules-badge tier-magico">Mágico</span> Itens com encantamentos — podem ter <em>magicBonus</em> que alteram estatísticas ao equipar</li>
              <li><span class="rules-badge tier-lendario">Lendário</span> Artefatos com história e poderes únicos — alguns precisam de aprovação do Mestre</li>
              <li><span class="rules-badge tier-unico">Único</span> Existe apenas um exemplar no mundo</li>
              <li><span class="rules-badge tier-ancestral">Ancestral</span> Forjados com fragmentos da Batalha Colossal — poder incomparável</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-blue">
            <strong>Conjuntos (Sets)</strong>
            <ul class="rules-list">
              <li>Itens do mesmo conjunto têm seu nome entre parênteses: <em>Adaga de Ferro (Sanguinária)</em></li>
              <li>Equipar todas as peças de um conjunto ativa uma habilidade especial exclusiva</li>
              <li>Itens de conjunto nunca aparecem no wizard de criação — são encontrados durante a aventura</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-green">
            <strong>Bônus Mágicos (magicBonus)</strong>
            <p>Itens Raros+ podem ter bônus que modificam as estatísticas ao ser equipados:</p>
            <ul class="rules-list">
              <li><code>actions</code> — +N Ações de Combate por turno</li>
              <li><code>reactions</code> — +N Reações por rodada</li>
              <li><code>reactionActions</code> — +N Ações de Reação</li>
              <li><code>spellActions</code> — +N Ações de Magia</li>
              <li><code>hp</code> — +N HP máximo</li>
              <li><code>carry</code> — +N Carga máxima</li>
              <li><code>attr + attrValue</code> — +N em um atributo (FOR, DEX, AGI, INT ou SAB)</li>
            </ul>
          </div>
        </div>
      `
    }
  ];

  return `
    <div class="rules-tab">
      <div class="rules-header">
        <h2 class="rules-title">📜 Regras da Mesa</h2>
        <p class="rules-subtitle">Referência rápida das mecânicas do sistema. Toque em uma seção para expandir.</p>
      </div>
      <div class="rules-accordion">
        ${sections.map(s => `
          <div class="rules-accordion-item">
            <button class="rules-accordion-trigger" data-rules-id="${s.id}">
              <span class="rules-section-icon">${s.icon}</span>
              <span class="rules-section-title">${s.title}</span>
              <span class="rules-accordion-arrow">▾</span>
            </button>
            <div class="rules-accordion-panel">
              ${s.content}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderClassTutorials() {
  return Object.keys(CLASSES).map(key => {
    const cls = CLASSES[key];
    const tut = CLASS_TUTORIALS[key];
    if (!tut) return "";
    return `
    <div class="tutorial-card">
      <div class="tutorial-card-head">
        <span class="tutorial-card-icon">${cls.icon}</span>
        <div>
          <h3 class="tutorial-card-title">${cls.name}</h3>
          <span class="tutorial-card-role">${cls.role}</span>
        </div>
      </div>
      <div class="tutorial-block">
        <h4 class="tutorial-block-title">Como Jogar</h4>
        <p>${tut.howToPlay}</p>
      </div>
      <div class="tutorial-block">
        <h4 class="tutorial-block-title">Como Ganhar ${cls.resource}</h4>
        <p>${tut.howToGainResource}</p>
      </div>
      <div class="tutorial-block">
        <h4 class="tutorial-block-title">Como Usar ${cls.resource}</h4>
        <p>${tut.howToUseResource}</p>
      </div>
      <div class="tutorial-tip">${tut.tip}</div>
    </div>`;
  }).join("");
}

// Estado da aba ativa na ficha (persiste entre re-renders)
let activeSheetTab = "vital";

function renderSheet() {
  const character = findCharacter(currentSheetId);
  if (!character) { showView("view-list"); return; }
  const cls = getClassDef(character.classKey);

  const maxHP = calcMaxHP(character);
  character.currentHP = clamp(character.currentHP, 0, maxHP);
  const resourceMax = calcResourceMax(character);
  if (character.currentResource > resourceMax) character.currentResource = resourceMax;

  // Conteúdo de cada aba
  const tabContent = {
    vital: `
      ${renderVitalsSection(character, cls, maxHP, resourceMax)}
      ${renderAttributesSection(character, cls)}
      ${renderDerivedSection(character, cls)}
    `,
    habilidades: `
      ${cls ? renderClassAbilitiesSection(character, cls) : ""}
      ${renderSkillsSection(character, cls)}
      ${renderSkillTestsSection(character)}
    `,
    magias: renderSpellsSection(character, cls),
    equip: `
      ${renderEquipmentSection(character)}
      ${renderCurrencySection(character)}
    `,
    inventario: `
      ${renderInventorySection(character)}
      ${renderNotesSection(character)}
      <div class="sheet-danger-zone">
        <button class="btn-danger" id="btn-delete-from-sheet">Remover este personagem</button>
      </div>
    `
  };

  const tabs = [
    { key: "vital",       icon: "❤",  label: "Vital" },
    { key: "habilidades", icon: "⚔",  label: "Perícias" },
    { key: "magias",      icon: "✨",  label: "Magias" },
    { key: "equip",       icon: "🛡",  label: "Equip." },
    { key: "inventario",  icon: "🎒",  label: "Inv." }
  ];

  const frame = document.getElementById("sheet-frame");
  frame.innerHTML = `
    <div class="sheet-header">
      <div class="sheet-seal">${cls ? cls.icon : "?"}</div>
      <div class="sheet-title-block">
        <h2 class="sheet-name">${escapeHTML(character.name)}</h2>
        <p class="sheet-subtitle">${cls ? cls.name : "Sem classe"}${character.origin ? " · " + escapeHTML(character.origin) : ""} · Nv. ${character.level}</p>
      </div>
      <div class="sheet-level-badge">
        <span class="lvl-num">${character.level}</span>
        <span class="lvl-label">Nível</span>
      </div>
    </div>

    <div class="sheet-tab-content">
      ${tabContent[activeSheetTab] || tabContent.vital}
    </div>

    <nav class="sheet-bottom-nav no-print" aria-label="Seções da ficha">
      ${tabs.map(t => `
        <button class="sheet-tab-btn ${t.key === activeSheetTab ? "active" : ""}" data-sheet-tab="${t.key}">
          <span class="sheet-tab-icon">${t.icon}</span>
          <span class="sheet-tab-label">${t.label}</span>
        </button>
      `).join("")}
    </nav>
  `;

  // Handler de abas
  frame.querySelectorAll("[data-sheet-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      activeSheetTab = btn.dataset.sheetTab;
      renderSheet();
      frame.querySelector(".sheet-tab-content")?.scrollTo(0, 0);
    });
  });

  attachSheetHandlers(character);
}


/* --- Vitals: HP, XP/Nível, Recurso de classe --- */

function renderVitalsSection(character, cls, maxHP, resourceMax) {
  const hpPct = clamp((character.currentHP / maxHP) * 100, 0, 100);
  const xpPct = clamp((character.xp / xpToNextLevel(character)) * 100, 0, 100);
  const resourcePct = resourceMax > 0 ? clamp((character.currentResource / resourceMax) * 100, 0, 100) : 0;

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Vitalidade</h3>

    <div class="bar-row">
      <div class="bar-label-row"><span>Pontos de Vida</span><span>${character.currentHP} / ${maxHP}</span></div>
      <div class="bar-track"><div class="bar-fill hp" style="width:${hpPct}%"></div></div>
      <div class="bar-controls">
        <button class="bar-btn" data-action="hp-dec">−</button>
        <input type="number" class="bar-input-inline" id="hp-input" value="${character.currentHP}" min="0" max="${maxHP}">
        <button class="bar-btn" data-action="hp-inc">+</button>
        <span style="font-size:12px;color:var(--ink-soft)">de ${maxHP}</span>
      </div>
    </div>

    ${cls ? `
    <div class="bar-row">
      <div class="bar-label-row"><span>${cls.resource}</span><span>${character.currentResource} / ${resourceMax}</span></div>
      <div class="bar-track"><div class="bar-fill resource" style="width:${resourcePct}%"></div></div>
      <div class="bar-controls">
        <button class="bar-btn" data-action="res-dec">−</button>
        <input type="number" class="bar-input-inline" id="resource-input" value="${character.currentResource}" min="0" max="${resourceMax}">
        <button class="bar-btn" data-action="res-inc">+</button>
      </div>
    </div>` : ""}

    <div class="bar-row">
      <div class="bar-label-row"><span>Experiência (XP)</span><span>${character.xp} / ${xpToNextLevel(character)}</span></div>
      <div class="bar-track"><div class="bar-fill xp" style="width:${xpPct}%"></div></div>
      <div class="bar-controls">
        <input type="number" class="bar-input-inline" id="xp-gain-input" placeholder="+XP" min="0">
        <button class="btn-secondary" id="btn-add-xp">Adicionar XP</button>
      </div>
      <div class="points-badges-row">
        ${character.unspentAttrPoints > 0 ? `<span class="points-badge">★ ${character.unspentAttrPoints} ponto(s) de atributo</span>` : ""}
        ${(character.unspentSkillPoints || 0) > 0 ? `<span class="points-badge skill">✦ ${character.unspentSkillPoints} ponto(s) de habilidade</span>` : ""}
      </div>
    </div>
  </div>`;
}

/* --- Atributos (editáveis via level up) --- */

function renderAttributesSection(character, cls) {
  const totalPoints = CREATION_ATTR_POINTS + (character.level - 1); // pontos gastos + acumulados por nível
  const spent = Object.values(character.attrs).reduce((a, b) => a + b, 0);
  const available = character.unspentAttrPoints || 0;

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">
      Atributos
      ${available > 0 ? `<span class="attr-points-badge">${available} ponto(s) disponível(is)</span>` : ""}
      <button class="btn-link attr-reset-btn" id="btn-attr-reset" title="Zerar todos os atributos e recuperar os pontos para redistribuir" style="font-size:11px;margin-left:4px;">↺ Redistribuir</button>
    </h3>
    <div class="sheet-attr-grid">
      ${ATTRS.map(attr => {
        const val = character.attrs[attr];
        const effectiveVal = getEffectiveAttr(character, attr);
        const hasItemBonus = effectiveVal > val;
        return `
        <div class="sheet-attr-box">
          <div class="sheet-attr-box-label">${attr}</div>
          <div class="sheet-attr-box-value ${hasItemBonus ? "attr-has-bonus" : ""}" title="${hasItemBonus ? `+${effectiveVal - val} de item equipado` : ""}">${effectiveVal}${hasItemBonus ? `<span class="attr-item-bonus">+${effectiveVal - val}</span>` : ""}</div>
          <div class="sheet-attr-box-controls">
            <button class="attr-step-btn" data-attr-sheet-dec="${attr}" ${val <= 0 ? "disabled" : ""} title="Remover 1 ponto (recupera para redistribuir)">−</button>
            <button class="attr-step-btn" data-attr-sheet-inc="${attr}" ${available <= 0 ? "disabled" : ""} title="Gastar 1 ponto de atributo">+</button>
          </div>
        </div>`;
      }).join("")}
    </div>
    <p class="section-hint" style="margin-top:8px;">Pontos gastos: ${spent} · Disponíveis: ${available} · Use ↺ para zerar e redistribuir livremente.</p>
  </div>`;
}

/* --- Estatísticas derivadas (movimento, ações, slots, carga) --- */

function renderDerivedSection(character, cls) {
  const move = calcMovement(character);
  const actions = calcActions(character);
  const reactions = calcReactions(character);
  const reactionActions = calcReactionActions(character);
  const spellActions = calcSpellActions(character);
  const slots = calcSpellSlots(character);
  const carry = calcCarryCapacity(character);
  const weight = calcTotalWeight(character);
  const physDef = calcPhysicalDefense(character);
  const magDef = calcMagicDefense(character);
  const dodge = calcDodgeChance(character);
  const healBonus = calcHealingBonus(character);
  const dmg = calcDamageBreakdown(character);
  const weaponPenalty = calcWeaponRequirementPenalty(character);

  const stats = [
    { label: "Movimento", value: `${move} hex`, tooltip: "Quantos hexágonos você pode andar por turno. Ganha-se 1 por ponto de AGI (base 4), descontando penalidade de armadura/escudo pesado." },
    { label: "Ações/turno", value: actions, tooltip: "Ações de combate por turno. Base: 1 + floor(Nível÷3). Bônus: +1 a cada 4 AGI, +1 a cada 5 DEX. Exemplo: nível 3 = 2 ações; nível 6 = 3 ações. Atributos adicionam bônus extras." },
    { label: "Reações/rodada", value: reactions, tooltip: "Quantas vezes você pode reagir fora do seu turno (defender-se, ataque de oportunidade). Ganha-se 1 reação extra a cada 4 pontos de AGI, começando com 1." },
    { label: "Ações de Reação", value: reactionActions, tooltip: "Recurso separado das Reações comuns, usado especificamente para ações reativas especiais. Ganha-se 1 a cada 3 pontos de AGI. Mínimo de 1." },
    { label: "Ações de Magia", value: spellActions, tooltip: "Ações para conjurar magias. Todas as classes ganham 1 + floor(Nível÷3). Bônus de INT: +1 a cada 2 pontos.", highlight: spellActions > 0 },
    { label: "Defesa Física", value: physDef, tooltip: "Reduz o dano de ataques físicos recebidos. Vem da armadura equipada e do escudo (se houver)." },
    { label: "Defesa Mágica", value: magDef, tooltip: "Reduz o dano de magias e ataques mágicos recebidos. Vem principalmente de armaduras arcanas/sagradas e itens mágicos." },
    { label: "Chance de Esquiva", value: `${dodge} ou menos (d20)`, tooltip: "Role 1d20: se o resultado for igual ou menor que este valor, você esquiva totalmente do ataque. Base 10 + AGI. Armas de duas mãos pesadas (sem a perícia 'Defesa com Armas Pesadas') aplicam −2." },
    { label: "Slots de Magia", value: `${(character.activeSpells||[]).length}/${slots}`, tooltip: "Slots em uso / total disponível (INT + SAB). Cada magia equipada consome 1 slot. Desequipe magias para liberar slots. Classes conjuradoras têm garantia de pelo menos 1." },
    { label: "Carga", value: `${weight} / ${carry}`, tooltip: "Peso atual carregado / capacidade máxima. Base 20 + (FOR × 5), mais um bônus fixo por nível que varia por classe." }
  ];

  if (healBonus > 0) {
    const isCleric = cls && cls.name === "Clérigo";
    stats.push({
      label: "Bônus de Cura",
      value: `+${healBonus}`,
      tooltip: isCleric
        ? "Valor somado aos dados em qualquer magia/habilidade de cura. O Clérigo dobra o bônus normal de SAB (2 × SAB) em vez de aplicar apenas +SAB."
        : "Valor somado aos dados em qualquer magia/habilidade de cura que você conheça. Equivale ao seu SAB.",
      highlight: isCleric
    });
  }

  const statsHTML = stats.map(s => `
    <div class="derived-box ${s.highlight ? "derived-box-highlight" : ""}" title="${escapeHTML(s.tooltip)}">
      <div class="derived-box-label">${s.label} <span class="derived-box-info">ⓘ</span></div>
      <div class="derived-box-value">${s.value}</div>
    </div>
  `).join("");

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Estatísticas de Combate</h3>
    <p class="section-hint">Toque e segure (ou passe o mouse) sobre qualquer estatística para ver como ela é calculada.</p>
    <div class="derived-grid">
      ${statsHTML}
      ${weaponPenalty !== 0 ? `<div class="derived-box derived-box-danger" title="Sua arma exige um atributo mínimo que você não possui. Enquanto isso não for corrigido, todos os seus ataques com essa arma sofrem esta penalidade na Chance de Acerto.">
        <div class="derived-box-label">Penalidade de Acerto <span class="derived-box-info">ⓘ</span></div>
        <div class="derived-box-value">${weaponPenalty}</div>
      </div>` : ""}
    </div>
    ${weaponPenalty !== 0 ? `<p class="weapon-penalty-warning">⚠ Sua arma primária exige um atributo que você não possui em quantidade suficiente — aplique ${weaponPenalty} na Chance de Acerto enquanto estiver equipada com ela.</p>` : ""}

    <h4 class="damage-subtitle">Dano Total de Ataque</h4>
    <div class="damage-combined-row">
      <span class="damage-combined-label">DANOS:</span>
      <span class="damage-combined-value">${buildCombinedDamageString(dmg)}</span>
    </div>
    <p class="damage-combined-hint">Some todos os dados abaixo ao resolver um ataque — cada fonte está detalhada para referência.</p>
    <div class="damage-sources">
      ${dmg.sources.map(s => `
        <div class="damage-source-row">
          <span class="damage-source-label">${s.label}</span>
          <span class="damage-source-dice">${s.dice}${s.bonus ? ` + ${s.bonus}` : ""}</span>
          ${s.modifier ? `<span class="damage-source-modifier">${escapeHTML(s.modifier)}</span>` : ""}
        </div>
      `).join("")}
    </div>
    <p class="damage-formula-note">Dano total por ataque = (Dano da Arma + Dano Natural + bônus de modificadores) − Defesa do alvo. Some os dados indicados acima conforme a arma usada no ataque.</p>
  </div>`;
}

/* --- Habilidades de Classe (Fúria/MP/Foco/Veneno/Fé) --- */

function renderClassAbilitiesSection(character, cls) {
  if (!character.skills.abilities) character.skills.abilities = [];
  if (!character.skills.abilityLevels) character.skills.abilityLevels = {};
  const known  = character.skills.abilities;
  const levels = character.skills.abilityLevels;
  const points = character.unspentSkillPoints || 0;

  // ── Habilidades de subclasse (pelo ID, não pelo nome) ───────────
  const sc       = character.subclassKey ? SUBCLASSES[character.subclassKey] : null;
  const scSkills = sc ? sc.skills.filter(sk => known.includes(sk.id)) : [];

  const renderSubclassAbilityCard = (sk) => {
    const currentLevel = levels[sk.id] || 1;
    const maxLevel     = sk.levels.length;
    const canUpgrade   = currentLevel < maxLevel;
    const currentData  = sk.levels[currentLevel - 1];
    const isClassSyn   = Array.isArray(sk.sinergyClasses) && sk.sinergyClasses.includes(character.classKey);

    return `
      <div class="ability-card known ability-card-subclass ${isClassSyn ? "ability-card-synergy" : ""}">
        <div class="ability-card-head">
          <span class="ability-card-name">${sk.name}</span>
          <div style="display:flex;gap:5px;flex-wrap:wrap;">
            ${sk.commonToAll ? `<span class="ability-card-badge badge-common">Qualquer classe</span>` : ""}
            ${isClassSyn    ? `<span class="ability-card-badge badge-synergy">✨ Sinergia</span>` : ""}
          </div>
        </div>
        <div class="ability-level-dots" title="Nível ${currentLevel} de ${maxLevel}">
          ${Array.from({ length: maxLevel }).map((_,i) =>
            `<span class="ability-level-dot ${i < currentLevel ? "filled" : ""}"></span>`
          ).join("")}
          <span class="ability-level-text">Nível ${currentLevel}/${maxLevel}</span>
        </div>
        <p class="ability-card-effect">${currentData.effect}</p>
        ${canUpgrade ? `
          <button class="btn-secondary btn-upgrade-ability"
            data-upgrade-ability="${sk.id}" ${points > 0 ? "" : "disabled"}>
            ${points > 0 ? `Evoluir para Nível ${currentLevel + 1} (1 ponto)` : "Sem pontos disponíveis"}
          </button>` : `<div class="ability-max-level-note">✦ Nível máximo alcançado</div>`}
      </div>`;
  };

  // ── Habilidades de subclasse NÃO escolhidas (aparecem como bloqueadas) ─
  const scSkillsLocked = sc ? sc.skills.filter(sk => !known.includes(sk.id)) : [];
  const lockedSubclassHTML = scSkillsLocked.length ? `
    <div class="ability-locked-subclass-row">
      <div class="ability-locked-subclass-label">🔒 Habilidades da subclasse não escolhidas no início — indisponíveis</div>
      ${scSkillsLocked.map(sk => `
        <div class="ability-card locked ability-card-subclass-locked">
          <div class="ability-card-head">
            <span class="ability-card-name">${sk.name}</span>
            <span class="ability-card-badge" style="background:rgba(0,0,0,0.1);color:var(--ink-soft)">Indisponível</span>
          </div>
          <p class="ability-card-effect" style="opacity:.5">${sk.effect}</p>
        </div>`).join("")}
    </div>` : "";

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Habilidades de Classe</h3>
    <p class="section-hint">Recurso: <strong>${cls.resource}</strong> — ${cls.resourceDesc}</p>
    ${points > 0 ? `<div class="points-banner">★ Você tem <strong>${points}</strong> ponto(s) de habilidade para gastar abaixo.</div>` : ""}

    <div class="ability-card-grid">
      ${cls.skills.map(skill => {
        const isKnown    = known.includes(skill.name);
        const isLevelable = Array.isArray(skill.levels) && skill.levels.length > 1;
        const currentLevel = levels[skill.name] || 1;
        const maxLevel     = isLevelable ? skill.levels.length : 1;
        const currentData  = isLevelable ? skill.levels[currentLevel - 1] : skill;
        const canUpgrade   = isKnown && isLevelable && currentLevel < maxLevel;

        return `
        <div class="ability-card ${isKnown ? "known" : "locked"}">
          <div class="ability-card-head">
            <span class="ability-card-name">${skill.name}</span>
            ${isKnown ? `<span class="ability-card-badge">Aprendida</span>` : ""}
          </div>
          ${isLevelable ? `
            <div class="ability-level-dots" title="Nível ${currentLevel} de ${maxLevel}">
              ${Array.from({ length: maxLevel }).map((_,i) => `<span class="ability-level-dot ${i < currentLevel ? "filled" : ""}"></span>`).join("")}
              <span class="ability-level-text">Nível ${currentLevel}/${maxLevel}</span>
            </div>
          ` : ""}
          <div class="ability-card-cost">${currentData.cost}</div>
          <p class="ability-card-effect">${currentData.effect}</p>
          ${!isKnown ? `<button class="btn-secondary btn-learn-ability" data-learn-ability="${skill.name}" ${points > 0 ? "" : "disabled"}>
            ${points > 0 ? "Aprender (1 ponto)" : "Sem pontos disponíveis"}
          </button>` : ""}
          ${canUpgrade ? `<button class="btn-secondary btn-upgrade-ability" data-upgrade-ability="${skill.name}" ${points > 0 ? "" : "disabled"}>
            ${points > 0 ? `Evoluir para Nível ${currentLevel + 1} (1 ponto)` : "Sem pontos disponíveis"}
          </button>` : ""}
          ${isKnown && isLevelable && currentLevel >= maxLevel ? `<div class="ability-max-level-note">✦ Nível máximo alcançado</div>` : ""}
        </div>
      `}).join("")}
    </div>

    ${scSkills.length ? `
    <h3 class="sheet-section-title" style="margin-top:18px">
      ${sc.icon} Habilidades de Subclasse — ${sc.name}
    </h3>
    <div class="ability-card-grid">
      ${scSkills.map(renderSubclassAbilityCard).join("")}
    </div>` : ""}

    ${lockedSubclassHTML}
  </div>`;
}

/* --- Perícias (de classe + gerais, com aprendizado posterior) --- */

function renderSkillTestsSection(character) {
  const renderCard = (test) => {
    const { normal, hard, critical, hasSkill } = calcSkillTest(character, test);
    const attrLabel = test.attrKeys.join("+");

    return `
      <div class="skill-test-card ${hasSkill ? "skill-test-card-trained" : ""}">
        <div class="skill-test-card-head">
          <span class="skill-test-card-icon">${test.icon}</span>
          <div class="skill-test-card-info">
            <span class="skill-test-card-name">${test.name}</span>
            <span class="skill-test-card-attrs">${attrLabel}</span>
          </div>
          ${hasSkill ? `<span class="skill-test-learned-tag">+2</span>` : ""}
        </div>
        <div class="skill-test-values">
          <div class="skill-test-val skill-test-normal" title="Normal (rolar ≤ ${normal} no d20)"><span class="skill-test-val-label">N</span><span class="skill-test-val-num">${normal}</span></div>
          <div class="skill-test-val skill-test-hard"   title="Difícil (rolar ≤ ${hard} no d20)"><span class="skill-test-val-label">D</span><span class="skill-test-val-num">${hard}</span></div>
          <div class="skill-test-val skill-test-critical" title="Crítico (rolar ≤ ${critical} no d20)"><span class="skill-test-val-label">C</span><span class="skill-test-val-num">${critical}</span></div>
        </div>
      </div>`;
  };

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Testes de Perícia</h3>
    <p class="section-hint">Role 1d20 e compare: <strong>N</strong> = Normal (≤ 10 + bônus) · <strong>D</strong> = Difícil (≤ 5 + bônus) · <strong>C</strong> = Crítico (≤ 1 + bônus). Perícia aprendida adiciona +2 em todos.</p>
    <div class="skill-test-card-grid">
      ${SKILL_TESTS.filter(t => !t.combat).map(renderCard).join("")}
    </div>
  </div>`;
}

function renderSkillsSection(character, cls) {
  const knownClassSkills = character.skills.class;
  const knownGeneralSkills = character.skills.general;
  const allKnown = [...knownClassSkills, ...knownGeneralSkills];

  // Separa as perícias de combate (que vivem em skills.class) das perícias de classe normais
  const combatSkillNames = new Set(SKILL_TESTS.filter(t => t.combat).map(t => t.name));
  const knownCombatSkills = knownClassSkills.filter(name => combatSkillNames.has(name));
  const knownNormalClassSkills = knownClassSkills.filter(name => !combatSkillNames.has(name));

  const learnableClass = cls ? cls.skillsClass.filter(s => !knownClassSkills.includes(s.name)) : [];
  const learnableGeneral = GENERAL_SKILLS.filter(s => !knownGeneralSkills.includes(s.name));

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Perícias Conhecidas</h3>
    <div class="skill-card-grid">
      ${knownNormalClassSkills.map(name => {
        const s = cls ? cls.skillsClass.find(x => x.name === name) : null;
        return renderSkillCard(name, s, true);
      }).join("")}
      ${knownGeneralSkills.map(name => {
        const s = GENERAL_SKILLS.find(x => x.name === name);
        return renderSkillCard(name, s, false);
      }).join("")}
      ${(knownNormalClassSkills.length + knownGeneralSkills.length === 0 && knownCombatSkills.length === 0) ? `<p class="empty-inline-note">Nenhuma perícia registrada ainda.</p>` : ""}
    </div>

    ${knownCombatSkills.length > 0 ? `
    <h4 class="learn-subtitle" style="margin-top:14px;">Perícias de Combate</h4>
    <div class="skill-card-grid">
      ${knownCombatSkills.map(name => {
        const test = SKILL_TESTS.find(t => t.name === name);
        if (!test) return "";
        const { normal, hard, critical } = calcSkillTest(character, test);
        return `
          <div class="skill-card skill-card-combat">
            <div class="skill-card-head">
              <span class="skill-card-name">${test.icon} ${test.name}</span>
              <div style="display:flex;gap:6px;align-items:center;">
                <span class="skill-card-attr-tag">${test.attrKeys.join("+")}</span>
                <button class="skill-remove-btn" data-remove-class-skill="${escapeHTML(name)}" title="Esquecer esta perícia">×</button>
              </div>
            </div>
            <div class="skill-test-values" style="margin:4px 0;">
              <div class="skill-test-val skill-test-normal" title="Normal"><span class="skill-test-val-label">N</span><span class="skill-test-val-num">${normal}</span></div>
              <div class="skill-test-val skill-test-hard" title="Difícil"><span class="skill-test-val-label">D</span><span class="skill-test-val-num">${hard}</span></div>
              <div class="skill-test-val skill-test-critical" title="Crítico"><span class="skill-test-val-label">C</span><span class="skill-test-val-num">${critical}</span></div>
            </div>
            <p class="skill-card-effect">⚔ ${test.combatDesc}</p>
          </div>`;
      }).join("")}
    </div>` : ""}

    <h4 class="learn-subtitle">Aprender Nova Perícia ou Habilidade</h4>
    <div class="learn-picker" id="skill-picker">
      <!-- Busca -->
      <div class="learn-picker-search-row">
        <input type="text" class="learn-picker-search" id="skill-picker-search" placeholder="🔍 Buscar perícia ou habilidade...">
      </div>
      <!-- Chips de tipo -->
      <div class="learn-picker-filter-group">
        <span class="learn-picker-filter-label">Tipo</span>
        <div class="learn-picker-chips" id="skill-type-chips">
          <button class="learn-chip active" data-skill-type="">Todos</button>
          <button class="learn-chip" data-skill-type="class">Perícia de Classe</button>
          <button class="learn-chip" data-skill-type="general">Perícia Geral</button>
          <button class="learn-chip" data-skill-type="combat">Perícia de Combate</button>
        </div>
      </div>
      <!-- Contagem -->
      <div class="learn-picker-count" id="skill-picker-count"></div>
      <!-- Lista -->
      <div class="learn-picker-list" id="skill-picker-list"></div>
      <!-- Preview -->
      <div class="learn-picker-preview hidden" id="skill-picker-preview"></div>
      <!-- Selects ocultos legado -->
      <select id="learn-class-skill-select" style="display:none">
        ${learnableClass.map(s => `<option value="${s.name}">${s.name}</option>`).join("")}
      </select>
      <select id="learn-general-skill-select" style="display:none">
        ${learnableGeneral.map(s => `<option value="${s.name}">${s.name}</option>`).join("")}
      </select>
      <select id="learn-combat-skill-select" style="display:none">
        ${SKILL_TESTS.filter(t => t.combat && !allKnown.includes(t.name)).map(t => `<option value="${t.name}">${t.name}</option>`).join("")}
      </select>
      <button class="btn-primary learn-picker-confirm" id="btn-learn-skill-unified">+ Aprender Selecionada</button>
    </div>
  </div>`;
}

/* Card visual de uma perícia conhecida — mesmo padrão das habilidades de classe */
function renderSkillCard(name, skillData, isClass) {
  if (!skillData) return "";
  const removeAttr = isClass
    ? `data-remove-class-skill="${escapeHTML(name)}"`
    : `data-remove-general-skill="${escapeHTML(name)}"`;
  return `
    <div class="skill-card">
      <div class="skill-card-head">
        <span class="skill-card-name">${name}</span>
        <div style="display:flex;gap:6px;align-items:center;">
          <span class="skill-card-attr-tag">${skillData.attr}</span>
          <button class="skill-remove-btn" ${removeAttr} title="Esquecer esta perícia">×</button>
        </div>
      </div>
      <p class="skill-card-effect">${skillData.desc}</p>
      ${skillData.example ? `<div class="skill-card-example"><span class="skill-card-example-label">Exemplo:</span> ${skillData.example}</div>` : ""}
    </div>
  `;
}

/* --- Magias (apenas para classes conjuradoras) --- */

function renderSpellsSection(character, cls) {
  const known = character.spells || [];
  if (!character.activeSpells) character.activeSpells = [];
  const active = character.activeSpells;
  const allSpells = getSpellsForCharacter(character); // só magias da classe + gerais
  const totalSlots = calcSpellSlots(character);
  const usedSlots = active.length;
  const learnable = allSpells.filter(s => !known.includes(s.name));

  // agrupa as aprendíveis por origem para o <select>
  const groups = {};
  learnable.forEach(s => {
    if (!groups[s.origin]) groups[s.origin] = [];
    groups[s.origin].push(s);
  });

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">
      Magias Conhecidas
      <span class="spell-slots-counter ${usedSlots >= totalSlots ? "spell-slots-full" : ""}">
        ${usedSlots}/${totalSlots} slots em uso
      </span>
    </h3>
    <p class="section-hint">Qualquer classe pode aprender qualquer magia através de grimórios. Equipe até <strong>${totalSlots} magia(s)</strong> nos slots disponíveis (INT + SAB = ${totalSlots}). Cada magia equipada consome 1 slot.</p>

    <div class="spell-card-grid">
      ${(() => {
          const sortedKnown = [...known].sort((a, b) => {
            const aActive = active.includes(a) ? 0 : 1;
            const bActive = active.includes(b) ? 0 : 1;
            return aActive - bActive;
          });
          const activeKnown   = sortedKnown.filter(n => active.includes(n));
          const inactiveKnown = sortedKnown.filter(n => !active.includes(n));
          const needsSeparator = activeKnown.length > 0 && inactiveKnown.length > 0;

          const renderCard = name => {
            const s = allSpells.find(x => x.name === name);
            if (!s) return "";
            const isSlow = s.castTime && !s.castTime.includes("instantânea") && !s.castTime.includes("1 Ação");
            const isActive = active.includes(name);
            const canEquip = !isActive && usedSlots < totalSlots;

            const dmgMatch  = s.effect.match(/(\d+d\d+(?:\s*[+\-]\s*\d+d\d+)*)\s*de\s*dano/i);
            const healMatch = s.effect.match(/recupera\s+(\d+d\d+[^,.;]*(?:HP|vida))/i) || s.effect.match(/cura\s+(\d+d\d+[^,.;]*)/i);
            const rangeMatch   = s.effect.match(/raio\s+(\d+(?:\s*hex)?)|alcance\s+(\d+(?:\s*hex)?)/i);
            const areaMatch    = s.effect.match(/área\s+([\d]+x[\d]+(?:\s*hex)?)/i);
            const durationMatch = s.effect.match(/por\s+(\d+\s*rodadas?)/i) || s.effect.match(/por\s+(\d+\s*turnos?)/i);

            const highlights = [
              dmgMatch      && `<span class="spell-hl spell-hl-dmg">⚔ ${dmgMatch[1]}</span>`,
              healMatch     && `<span class="spell-hl spell-hl-heal">💚 ${healMatch[1]}</span>`,
              areaMatch     && `<span class="spell-hl spell-hl-area">📐 ${areaMatch[1]}</span>`,
              rangeMatch    && `<span class="spell-hl spell-hl-range">🎯 ${rangeMatch[1] || rangeMatch[2]}</span>`,
              durationMatch && `<span class="spell-hl spell-hl-duration">⏳ ${durationMatch[1]}</span>`,
            ].filter(Boolean).join("");

            return `
            <div class="spell-card spell-level-${s.level} ${isActive ? "spell-card-active" : ""}">
              <div class="spell-card-head">
                <span class="spell-card-name">${name}</span>
                <div style="display:flex;gap:5px;align-items:center;">
                  <span class="spell-card-level-badge">Nível ${s.level}</span>
                  <button class="skill-remove-btn" data-remove-spell="${escapeHTML(name)}" title="Esquecer esta magia">×</button>
                </div>
              </div>
              <span class="spell-card-origin">${s.origin}</span>
              ${highlights ? `<div class="spell-highlights">${highlights}</div>` : ""}
              <p class="spell-card-effect">${s.effect}</p>
              <div class="spell-card-meta-row">
                <span class="spell-meta-tag ${isSlow ? "spell-meta-tag-slow" : ""}">⏱ ${s.castTime || "1 Ação"}</span>
                <span class="spell-meta-tag spell-meta-tag-cooldown">↻ ${s.cooldown || "Sem limite"}</span>
              </div>
              <button class="spell-equip-btn ${isActive ? "spell-equip-btn-active" : ""}"
                data-${isActive ? "unequip" : "equip"}-spell="${escapeHTML(name)}"
                ${!isActive && !canEquip ? "disabled" : ""}>
                ${isActive ? "🔮 Em Uso — Desequipar" : canEquip ? "⚡ Equipar (usar slot)" : "🔒 Sem slots disponíveis"}
              </button>
            </div>`;
          };

          const equipadasHTML  = activeKnown.map(renderCard).join("");
          const separadorHTML  = needsSeparator
            ? `<div class="spell-separator">Não equipadas (${inactiveKnown.length})</div>`
            : "";
          const restantesHTML  = inactiveKnown.map(renderCard).join("");

          return equipadasHTML + separadorHTML + restantesHTML;
        })()}
      ${known.length === 0 ? `<p class="empty-inline-note">Nenhuma magia conhecida ainda.</p>` : ""}
    </div>

    </div>

    <h4 class="learn-subtitle">Aprender Nova Magia (em um grimório)</h4>
    <div class="learn-picker" id="spell-picker">
      <!-- Busca -->
      <div class="learn-picker-search-row">
        <input type="text" class="learn-picker-search" id="spell-picker-search" placeholder="🔍 Buscar magia...">
      </div>
      <!-- Chips de nível -->
      <div class="learn-picker-filter-group">
        <span class="learn-picker-filter-label">Nível</span>
        <div class="learn-picker-chips" id="spell-level-chips">
          <button class="learn-chip active" data-spell-level="">Todos</button>
          ${[1,2,3,4,5].map(n => `<button class="learn-chip" data-spell-level="${n}">Nv ${n}</button>`).join("")}
        </div>
      </div>
      <!-- Chips de categoria -->
      <div class="learn-picker-filter-group">
        <span class="learn-picker-filter-label">Categoria</span>
        <div class="learn-picker-chips" id="spell-cat-chips">
          <button class="learn-chip active" data-spell-cat="">Todas</button>
          <button class="learn-chip" data-spell-cat="ataque">Ataque</button>
          <button class="learn-chip" data-spell-cat="defesa">Defesa</button>
          <button class="learn-chip" data-spell-cat="cura">Cura</button>
          <button class="learn-chip" data-spell-cat="controle">Controle</button>
          <button class="learn-chip" data-spell-cat="buff">Buff</button>
          <button class="learn-chip" data-spell-cat="invocacao">Invocação</button>
          <button class="learn-chip" data-spell-cat="ritual">Ritual</button>
          <button class="learn-chip" data-spell-cat="utilidade">Utilidade</button>
        </div>
      </div>
      <!-- Contagem -->
      <div class="learn-picker-count" id="spell-picker-count"></div>
      <!-- Lista -->
      <div class="learn-picker-list" id="spell-picker-list"></div>
      <!-- Preview -->
      <div class="learn-picker-preview hidden" id="spell-picker-preview"></div>
      <!-- Botão + select oculto (legado) -->
      <select id="learn-spell-select" style="display:none"></select>
      <button class="btn-primary learn-picker-confirm" id="btn-learn-spell">+ Aprender Magia Selecionada</button>
    </div>
  </div>`;
}

/* --- Equipamento (slots equipáveis) --- */

function renderEquipmentSection(character) {
  const slotsConfig = [
    { key: "primary", label: "Arma Primária", categoryMatch: ["weapon"], filter: i => true },
    { key: "secondary", label: "Arma Secundária", categoryMatch: ["weapon"], filter: i => i.baseData && i.baseData.slot && i.baseData.slot.includes("secondary") },
    { key: "shield", label: "Escudo", categoryMatch: ["shield"], filter: i => true },
    { key: "armor", label: "Armadura", categoryMatch: ["armor"], filter: i => true }
  ];

  const slotsHTML = slotsConfig.map(cfg => {
    const equippedItem = getEquippedItem(character, cfg.key);
    const itemData = equippedItem ? equippedItem.baseData : null;

    let chips = [];
    let requirementWarning = "";
    if (itemData && (cfg.key === "primary" || cfg.key === "secondary")) {
      const hasHeavyDefenseSkill = hasMechanicalSkill(character, "enable_two_hand_defense");
      const isHeavyTwoHand = !!itemData.heavyTwoHanded;
      let defenseInfo, defenseKind;
      if (isHeavyTwoHand && hasHeavyDefenseSkill) {
        defenseInfo = "Defesa −2 (perícia de armas pesadas)";
        defenseKind = "neutral";
      } else if (itemData.defenseDegrade === null) {
        defenseInfo = "Não defende";
        defenseKind = "warn";
      } else if (itemData.defenseDegrade === 0) {
        defenseInfo = "Defesa não degrada";
        defenseKind = "neutral";
      } else {
        defenseInfo = `Defesa −${itemData.defenseDegrade}/tentativa`;
        defenseKind = "neutral";
      }
      const reqCheck = checkItemRequirement(character, itemData);
      chips = [
        { label: "Dano", value: itemData.dmg || "—", kind: "damage" },
        { label: "Peso", value: `${itemData.weight}kg`, kind: "neutral" },
        { label: "Requisito", value: itemData.req || "—", kind: reqCheck.met ? "neutral" : "warn" },
        { label: "Defesa", value: defenseInfo, kind: defenseKind }
      ];
      if (itemData.range) chips.splice(1, 0, { label: "Alcance", value: `${itemData.range} hex`, kind: "neutral" });
      if (isHeavyTwoHand && cfg.key === "primary") {
        chips.push({ label: "Esquiva", value: hasHeavyDefenseSkill ? "Sem penalidade" : "−2 (arma de 2 mãos pesada)", kind: hasHeavyDefenseSkill ? "neutral" : "warn" });
      }
      if (!reqCheck.met && cfg.key === "primary") {
        requirementWarning = `<div class="equip-requirement-warning">⚠ Requisito não cumprido (${itemData.req}): −2 na Chance de Acerto enquanto esta arma estiver equipada como primária.</div>`;
      }
    }
    if (itemData && cfg.key === "shield") {
      chips = [
        { label: "Def. Física", value: `+${itemData.physDefense}`, kind: "defense" },
        { label: "Chance de Defesa", value: "5 (fixa)", kind: "neutral" },
        { label: "Peso", value: `${itemData.weight}kg`, kind: "neutral" },
        { label: "Penalidade", value: itemData.penalty, kind: itemData.penalty !== "Nenhuma" ? "warn" : "neutral" }
      ];
    }
    if (itemData && cfg.key === "armor") {
      const armorReqCheck = checkItemRequirement(character, itemData);
      chips = [
        { label: "Def. Física", value: itemData.physDefense, kind: "defense" },
        { label: "Def. Mágica", value: itemData.magDefense, kind: "magic" },
        { label: "Peso", value: `${itemData.weight}kg`, kind: "neutral" },
        { label: "Requisito", value: itemData.req || "—", kind: armorReqCheck.met ? "neutral" : "warn" }
      ];
      if (itemData.movePenalty) chips.push({ label: "Movimento", value: itemData.movePenalty < 0 ? `+${-itemData.movePenalty}` : `−${itemData.movePenalty}`, kind: itemData.movePenalty > 0 ? "warn" : "defense" });
      if (!armorReqCheck.met) {
        requirementWarning = `<div class="equip-requirement-warning">⚠ Requisito não cumprido (${itemData.req}) — o mestre pode aplicar penalidades adicionais de manejo.</div>`;
      }
    }
    const subline = chips.length ? `<div class="equip-stat-chips">${chips.map(c => `<span class="equip-stat-chip equip-stat-chip-${c.kind}"><span class="equip-stat-chip-label">${c.label}</span>${c.value}</span>`).join("")}</div>` : "";
    const specialNote = itemData && itemData.note ? `<div class="equip-slot-special-note">✦ ${itemData.note}</div>` : "";

    // Itens do inventário disponíveis para este slot: mesma categoria, não equipados em nenhum outro slot
    const candidates = character.inventory.filter(i =>
      cfg.categoryMatch.includes(i.category) && !i.equippedSlot && cfg.filter(i)
    );

    return `
      <div class="equip-slot ${equippedItem ? "filled" : ""}">
        <div class="equip-slot-label">${cfg.label}</div>
        ${equippedItem ? `
          <div class="equip-slot-item">${equippedItem.name}</div>
          ${subline}
          ${requirementWarning}
          ${specialNote}
          ${renderModifierFields(equippedItem)}
        ` : `<div class="equip-slot-empty">Vazio</div>`}
        <div class="equip-slot-actions">
          <select data-slot="${cfg.key}" class="equip-select">
            <option value="">${equippedItem ? "Trocar por..." : "Equipar do inventário..."}</option>
            ${candidates.map(i => `<option value="${i.instanceId}">${i.name}</option>`).join("")}
          </select>
          ${equippedItem ? `<button class="btn-secondary" data-unequip="${cfg.key}">Remover</button>` : ""}
        </div>
        ${candidates.length === 0 && !equippedItem ? `<div class="equip-slot-empty-note">Nenhum item compatível no inventário ainda.</div>` : ""}
      </div>
    `;
  }).join("");

  const equippedAccessories = getEquippedItem(character, "accessory");
  const availableAccessories = character.inventory.filter(i => i.category === "accessory" && !i.equippedSlot);

  const accessoriesHTML = `
    <div class="equip-slot equip-slot-accessories ${equippedAccessories.length ? "filled" : ""} ${equippedAccessories.length >= 4 ? "equip-slot-full" : ""}" style="grid-column: 1 / -1;">
      <div class="equip-slot-label">💍 Acessórios equipados <span class="acc-counter ${equippedAccessories.length >= 4 ? "acc-counter-full" : ""}">${equippedAccessories.length}/4</span></div>
      ${equippedAccessories.length ? `
        <div class="accessory-cards-grid">
          ${equippedAccessories.map(item => {
            const bd = item.baseData || {};
            const tierBadge = bd.tier && bd.tier !== "comum" ? renderTierBadge(bd.tier) : "";
            return `
            <div class="accessory-card">
              <div class="accessory-card-head">
                <span class="accessory-card-name">${item.name}${tierBadge}</span>
                <button class="skill-remove-btn" data-unequip-accessory="${item.instanceId}" title="Remover acessório">×</button>
              </div>
              ${bd.effect ? `<p class="accessory-card-effect">${bd.effect}</p>` : ""}
              ${bd.story ? `<p class="accessory-card-story">📖 ${bd.story}</p>` : ""}
            </div>`;
          }).join("")}
        </div>
      ` : `<div class="equip-slot-empty">Nenhum acessório equipado</div>`}
      <div class="equip-slot-actions" style="margin-top:8px;">
        <select id="accessory-select">
          <option value="">Equipar acessório do inventário...</option>
          ${availableAccessories.map(i => `<option value="${i.instanceId}">${i.name}</option>`).join("")}
        </select>
        <button class="btn-secondary" id="btn-equip-accessory">Equipar</button>
      </div>
      ${availableAccessories.length === 0 && equippedAccessories.length === 0 ? `<div class="equip-slot-empty-note">Nenhum acessório disponível no inventário ainda.</div>` : ""}
    </div>
  `;

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Equipamento</h3>
    <p class="section-hint">Apenas itens já presentes no inventário podem ser equipados. Adicione itens na seção de Inventário abaixo conforme a aventura avança.</p>
    <div class="equip-slots-grid">
      ${slotsHTML}
      ${accessoriesHTML}
    </div>
  </div>`;
}

/* Campos de modificador (texto livre + bônus de dano numérico) para um item equipado */
function renderModifierFields(item) {
  // Modificadores são definidos na criação/edição do item personalizado, não nos slots equipados.
  return "";
}

/* --- Inventário (itens livres + peso total) --- */

/* --- Dinheiro: bronze, prata, ouro, platina (1 prata=10 bronze, 1 ouro=100 prata, 1 platina=1000 ouro) --- */

const CURRENCY_DENOMINATIONS = [
  { key: "bronze", label: "Bronze", icon: "🟫" },
  { key: "prata", label: "Prata", icon: "⚪" },
  { key: "ouro", label: "Ouro", icon: "🟡" },
  { key: "platina", label: "Platina", icon: "⬜" }
];

/* Valor de 1 unidade de cada moeda, em bronze (a unidade base) */
const CURRENCY_VALUE_IN_BRONZE = { bronze: 1, prata: 10, ouro: 1000, platina: 1000000 };

function ensureCurrency(character) {
  if (!character.currency) {
    character.currency = { bronze: 0, prata: 0, ouro: 0, platina: 0 };
  }
  CURRENCY_DENOMINATIONS.forEach(d => {
    if (typeof character.currency[d.key] !== "number") character.currency[d.key] = 0;
  });
  return character.currency;
}

/* Converte todo o dinheiro do personagem para a menor quantidade de moedas possível,
   priorizando as denominações maiores (ex.: 500 bronze -> 5 prata -> ... -> conforme o total). */
function consolidateCurrency(character) {
  const currency = ensureCurrency(character);

  let totalInBronze = 0;
  CURRENCY_DENOMINATIONS.forEach(d => {
    totalInBronze += (currency[d.key] || 0) * CURRENCY_VALUE_IN_BRONZE[d.key];
  });

  // Redistribui da maior denominação (platina) para a menor (bronze)
  const order = ["platina", "ouro", "prata", "bronze"];
  let remaining = totalInBronze;
  order.forEach(key => {
    const unitValue = CURRENCY_VALUE_IN_BRONZE[key];
    currency[key] = Math.floor(remaining / unitValue);
    remaining -= currency[key] * unitValue;
  });
}

function renderCurrencySection(character) {
  const currency = ensureCurrency(character);

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Dinheiro</h3>
    <p class="section-hint">Bronze, Prata, Ouro e Platina não contam no peso/carga do personagem. 1 Prata = 10 Bronze · 1 Ouro = 100 Prata · 1 Platina = 1000 Ouro.</p>

    <div class="currency-grid">
      ${CURRENCY_DENOMINATIONS.map(d => `
        <div class="currency-box">
          <div class="currency-icon">${d.icon}</div>
          <div class="currency-label">${d.label}</div>
          <div class="currency-controls">
            <button class="bar-btn" data-currency-dec="${d.key}">−</button>
            <input type="number" class="bar-input-inline currency-input" id="currency-input-${d.key}" value="${currency[d.key]}" min="0">
            <button class="bar-btn" data-currency-inc="${d.key}">+</button>
          </div>
        </div>
      `).join("")}
    </div>

    <button class="btn-secondary btn-consolidate-currency" id="btn-consolidate-currency">⇄ Juntar Moedas (converter para a maior denominação possível)</button>
  </div>`;
}

function renderInventorySection(character) {
  const carry = calcCarryCapacity(character);
  const weight = calcTotalWeight(character);
  const pct = clamp((weight / carry) * 100, 0, 100);
  const over = weight > carry;

  const slotLabels = { primary: "Arma Primária", secondary: "Arma Secundária", shield: "Escudo", armor: "Armadura", accessory: "Acessório" };

  return `
  <div class="sheet-section">
    <div class="inventory-header-row">
      <h3 class="sheet-section-title" style="margin-bottom:0;flex:1;">Inventário (Mochila)</h3>
      <button class="btn-primary" id="btn-open-add-item-modal">+ Adicionar Item do Mundo</button>
    </div>

    ${character.inventory.length > 0 ? `
    <div class="inventory-table-wrap">
    <table class="inventory-table">
      <thead><tr><th>Item</th><th>Categoria</th><th>Qtd.</th><th>Peso unit.</th><th>Total</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${character.inventory.map(item => `
          <tr>
            <td>${escapeHTML(item.name)}</td>
            <td>${categoryLabel(item.category)}</td>
            <td>${item.qty}</td>
            <td>${item.weight} kg</td>
            <td>${round1(item.weight * item.qty)} kg</td>
            <td>${item.equippedSlot ? `<span class="equipped-tag">Equipado: ${slotLabels[item.equippedSlot]}</span>` : `<span class="unequipped-tag">Na mochila</span>`}</td>
            <td><button class="inv-remove-btn" data-remove-inv="${item.instanceId}" title="Remover item" ${item.equippedSlot ? "disabled" : ""}>✕</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    </div>` : `<p class="empty-inline-note">A mochila está vazia. Use "Adicionar Item do Mundo" para registrar itens encontrados na aventura.</p>`}

    <div class="carry-meter">
      <div class="carry-meter-label"><span>Capacidade de Carga</span><span>${weight} / ${carry} kg</span></div>
      <div class="carry-meter-track"><div class="carry-meter-fill ${over ? "over" : ""}" style="width:${pct}%"></div></div>
      ${over ? `<div class="carry-meter-note">Sobrecarregado! O mestre pode aplicar penalidades de Movimento ou Ações até o peso ser reduzido.</div>` : ""}
    </div>
  </div>`;
}

function categoryLabel(cat) {
  const labels = { weapon: "Arma", shield: "Escudo", armor: "Armadura", accessory: "Acessório", gear: "Item Geral" };
  return labels[cat] || "Item";
}

/* --- Notas --- */

function renderNotesSection(character) {
  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Anotações</h3>
    <textarea class="notes-textarea" id="character-notes" placeholder="Histórico, objetivos, conexões com NPCs, condições ativas...">${escapeHTML(character.notes || "")}</textarea>
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* HANDLERS DA FICHA (delegação de eventos por re-render)                */
/* ---------------------------------------------------------------------- */

/* ---------------------------------------------------------------------- */
/* FICHA IMPRIMÍVEL (A4 / PDF via window.print())                        */
/* ---------------------------------------------------------------------- */

function buildPrintableSheet(character, cls, maxHP, resourceMax) {
  const move = calcMovement(character);
  const actions = calcActions(character);
  const reactions = calcReactions(character);
  const reactionActions = calcReactionActions(character);
  const spellActions = calcSpellActions(character);
  const slots = calcSpellSlots(character);
  const carry = calcCarryCapacity(character);
  const weight = calcTotalWeight(character);
  const physDef = calcPhysicalDefense(character);
  const magDef = calcMagicDefense(character);
  const dmg = calcDamageBreakdown(character);
  const allSpells = getSpellsForCharacter(character); // só magias da classe + gerais

  const knownAbilities = (cls && character.skills.abilities) ? character.skills.abilities : [];
  const knownClassSkills = character.skills.class || [];
  const knownGeneralSkills = character.skills.general || [];
  const knownSpells = character.spells || [];

  const equippedPrimary = getEquippedItem(character, "primary");
  const equippedSecondary = getEquippedItem(character, "secondary");
  const equippedShield = getEquippedItem(character, "shield");
  const equippedArmor = getEquippedItem(character, "armor");
  const equippedAccessories = getEquippedItem(character, "accessory");

  return `
  <div class="print-page">
    <div class="print-header">
      <div class="print-header-main">
        <h1 class="print-char-name">${escapeHTML(character.name)}</h1>
        <p class="print-char-sub">${cls ? cls.name : "Sem classe"}${character.origin ? " · " + escapeHTML(character.origin) : ""} · ${character.rosterType === "pc" ? "Personagem Jogador" : "NPC / Criatura"}</p>
      </div>
      <div class="print-level-badge">Nível ${character.level}</div>
    </div>

    <div class="print-grid-top">
      <div class="print-box">
        <div class="print-box-title">Vitalidade</div>
        <div class="print-stat-row"><span>Pontos de Vida</span><span class="print-stat-fill-line">${character.currentHP} / ${maxHP}</span></div>
        ${cls ? `<div class="print-stat-row"><span>${cls.resource}</span><span class="print-stat-fill-line">${character.currentResource} / ${resourceMax}</span></div>` : ""}
        <div class="print-stat-row"><span>Experiência (XP)</span><span class="print-stat-fill-line">${character.xp} / ${xpToNextLevel(character)}</span></div>
      </div>

      <div class="print-box">
        <div class="print-box-title">Atributos</div>
        <div class="print-attr-row">
          ${ATTRS.map(a => `<div class="print-attr-cell"><span class="print-attr-label">${a}</span><span class="print-attr-value">${character.attrs[a]}</span></div>`).join("")}
        </div>
      </div>
    </div>

    <div class="print-box">
      <div class="print-box-title">Estatísticas de Combate</div>
      <div class="print-combat-grid">
        <div class="print-combat-cell"><span class="print-combat-label">Movimento</span><span class="print-combat-value">${move} hex</span></div>
        <div class="print-combat-cell"><span class="print-combat-label">Ações</span><span class="print-combat-value">${actions}</span></div>
        <div class="print-combat-cell"><span class="print-combat-label">Reações</span><span class="print-combat-value">${reactions}</span></div>
        <div class="print-combat-cell"><span class="print-combat-label">Ações de Reação</span><span class="print-combat-value">${reactionActions}</span></div>
        <div class="print-combat-cell"><span class="print-combat-label">Ações de Magia</span><span class="print-combat-value">${spellActions}</span></div>
        <div class="print-combat-cell"><span class="print-combat-label">Def. Física</span><span class="print-combat-value">${physDef}</span></div>
        <div class="print-combat-cell"><span class="print-combat-label">Def. Mágica</span><span class="print-combat-value">${magDef}</span></div>
        <div class="print-combat-cell"><span class="print-combat-label">Slots de Magia</span><span class="print-combat-value">${slots}</span></div>
        <div class="print-combat-cell"><span class="print-combat-label">Carga</span><span class="print-combat-value">${weight}/${carry}kg</span></div>
      </div>
      <div class="print-damage-list">
        <strong>DANOS: ${buildCombinedDamageString(dmg)}</strong><br>
        ${dmg.sources.map(s => `${s.label.replace(/\s*\(.*?\)\s*/, "").trim()}: ${s.dice}${s.bonus ? ` +${s.bonus}` : ""}`).join("  ·  ")}
      </div>
    </div>

    <div class="print-box">
      <div class="print-box-title">Dinheiro</div>
      <div class="print-currency-row">
        ${CURRENCY_DENOMINATIONS.map(d => `<span>${d.label}: <strong>${(character.currency && character.currency[d.key]) || 0}</strong></span>`).join("  ·  ")}
      </div>
    </div>

    <div class="print-two-col">
      <div class="print-box">
        <div class="print-box-title">Equipamento</div>
        <table class="print-table">
          <tbody>
            <tr><td class="print-table-label">Arma Primária</td><td>${equippedPrimary ? equippedPrimary.name + (equippedPrimary.baseData ? ` (${equippedPrimary.baseData.dmg || "—"})` : "") : "—"}</td></tr>
            <tr><td class="print-table-label">Arma Secundária</td><td>${equippedSecondary ? equippedSecondary.name : "—"}</td></tr>
            <tr><td class="print-table-label">Escudo</td><td>${equippedShield ? equippedShield.name : "—"}</td></tr>
            <tr><td class="print-table-label">Armadura</td><td>${equippedArmor ? equippedArmor.name : "—"}</td></tr>
            <tr><td class="print-table-label">Acessórios</td><td>${equippedAccessories.length ? equippedAccessories.map(a => a.name).join(", ") : "—"}</td></tr>
          </tbody>
        </table>
      </div>

      <div class="print-box">
        <div class="print-box-title">Inventário (Mochila)</div>
        ${character.inventory.length ? `
        <table class="print-table">
          <thead><tr><th>Item</th><th>Qtd.</th><th>Peso</th></tr></thead>
          <tbody>
            ${character.inventory.map(i => `<tr><td>${escapeHTML(i.name)}${i.equippedSlot ? " (equipado)" : ""}</td><td>${i.qty}</td><td>${round1(i.weight * i.qty)}kg</td></tr>`).join("")}
          </tbody>
        </table>` : `<p class="print-empty-note">Mochila vazia.</p>`}
      </div>
    </div>

    <div class="print-box">
      <div class="print-box-title">Habilidades de Classe Conhecidas</div>
      ${knownAbilities.length ? `<ul class="print-compact-list">
        ${knownAbilities.map(name => {
          const s = cls ? cls.skills.find(x => x.name === name) : null;
          if (!s) return `<li><strong>${name}</strong></li>`;
          const abilityLevels = character.skills.abilityLevels || {};
          const isLevelable = Array.isArray(s.levels) && s.levels.length > 1;
          const currentLevel = abilityLevels[name] || 1;
          const data = isLevelable ? s.levels[currentLevel - 1] : s;
          const levelTag = isLevelable ? ` [Nv.${currentLevel}/${s.levels.length}]` : "";
          return `<li><strong>${name}</strong>${levelTag} (${data.cost}) — ${data.effect}</li>`;
        }).join("")}
      </ul>` : `<p class="print-empty-note">Nenhuma habilidade conhecida.</p>`}
    </div>

    <div class="print-two-col">
      <div class="print-box">
        <div class="print-box-title">Perícias</div>
        ${(knownClassSkills.length + knownGeneralSkills.length) ? `<ul class="print-compact-list">
          ${knownClassSkills.map(name => {
            const s = cls ? cls.skillsClass.find(x => x.name === name) : null;
            return `<li><strong>${name}</strong>${s ? ` (${s.attr})` : ""}</li>`;
          }).join("")}
          ${knownGeneralSkills.map(name => {
            const s = GENERAL_SKILLS.find(x => x.name === name);
            return `<li><strong>${name}</strong>${s ? ` (${s.attr})` : ""}</li>`;
          }).join("")}
        </ul>` : `<p class="print-empty-note">Nenhuma perícia conhecida.</p>`}
      </div>

      <div class="print-box">
        <div class="print-box-title">Magias (${(character.activeSpells||[]).length}/${calcSpellSlots(character)} slots em uso)</div>
        ${knownSpells.length ? `<ul class="print-compact-list">
          ${knownSpells.map(name => {
            const s = allSpells.find(x => x.name === name);
            const isActive = (character.activeSpells || []).includes(name);
            return `<li>${isActive ? "🔮 " : ""}<strong>${name}</strong>${s ? ` (Nv.${s.level} · ${s.castTime || "1 Ação"} · ${s.cooldown || "—"})` : ""} — ${s ? s.effect : ""}${isActive ? " [EM USO]" : ""}</li>`;
          }).join("")}
        </ul>` : `<p class="print-empty-note">Nenhuma magia conhecida.</p>`}
      </div>
    </div>

    ${character.notes ? `
    <div class="print-box">
      <div class="print-box-title">Anotações</div>
      <p class="print-notes-text">${escapeHTML(character.notes)}</p>
    </div>` : ""}

    <div class="print-box">
      <div class="print-box-title">Testes de Perícia</div>
      <p style="font-size:8.5pt;color:#555;margin:0 0 5px;">N = Normal (≤ 10+bônus) · D = Difícil (≤ 5+bônus) · C = Crítico (≤ 1+bônus) · +2 se treinado</p>
      <div class="print-skill-tests-grid">
        ${SKILL_TESTS.filter(t => !t.combat).map(test => {
          const { normal, hard, critical, hasSkill } = calcSkillTest(character, test);
          return `<div class="print-skill-test-cell ${hasSkill ? 'trained' : ''}">
            <span class="print-skill-test-name">${test.icon} ${test.name}</span>
            <span class="print-skill-test-attrs">${test.attrKeys.join("+")}</span>
            <span class="print-skill-test-vals">${normal} / ${hard} / ${critical}</span>
          </div>`;
        }).join("")}
      </div>
    </div>

    <div class="print-footer">Grimório de Personagens — Ficha gerada em ${new Date().toLocaleDateString("pt-BR")}</div>
  </div>
  `;
}


/* =====================================================================
   PICKER DE MAGIAS — chips de nível/categoria + lista + preview
   ===================================================================== */

function initSpellPicker(character) {
  const known    = character.spells || [];
  const allSpells = getSpellsForCharacter(character); // só magias da classe + gerais
  const learnable = allSpells.filter(s => !known.includes(s.name));

  let spellFilters = { level: "", cat: "", search: "" };
  let spellSelected = null;

  const getFiltered = () => {
    let items = learnable;
    if (spellFilters.level) items = items.filter(s => String(s.level) === spellFilters.level);
    if (spellFilters.cat)   items = items.filter(s => (s.category || "").toLowerCase().includes(spellFilters.cat));
    if (spellFilters.search) {
      const q = spellFilters.search;
      items = items.filter(s => s.name.toLowerCase().includes(q) || (s.effect||"").toLowerCase().includes(q) || (s.origin||"").toLowerCase().includes(q));
    }
    return items;
  };

  const render = () => {
    const items = getFiltered();
    const listEl    = document.getElementById("spell-picker-list");
    const countEl   = document.getElementById("spell-picker-count");
    const previewEl = document.getElementById("spell-picker-preview");
    if (!listEl) return;

    if (countEl) countEl.textContent = `${items.length} magia${items.length !== 1 ? "s" : ""}`;

    if (items.length === 0) {
      listEl.innerHTML = `<p class="learn-picker-empty">Nenhuma magia encontrada.</p>`;
      if (previewEl) previewEl.classList.add("hidden");
      spellSelected = null;
      return;
    }

    listEl.innerHTML = items.map((s, i) => {
      const isSel = spellSelected && spellSelected.name === s.name;
      const lvlColor = ["","#6a9e50","#c8a020","#c0601a","#b03030","#6b0000"][s.level] || "#888";
      return `
        <div class="learn-picker-item ${isSel ? "selected" : ""}" data-picker-idx="${i}">
          <div class="learn-picker-item-main">
            <span class="learn-picker-item-name">${escapeHTML(s.name)}</span>
            <div class="learn-picker-item-meta">
              <span class="learn-picker-badge" style="background:${lvlColor}20;color:${lvlColor};border:1px solid ${lvlColor}40">Nv ${s.level}</span>
              ${s.origin ? `<span class="learn-picker-badge learn-picker-badge-origin">${escapeHTML(s.origin)}</span>` : ""}
              ${s.category ? `<span class="learn-picker-badge learn-picker-badge-cat">${s.category}</span>` : ""}
            </div>
            <div class="learn-picker-item-sub">⏱ ${s.castTime || "1 Ação"} · ↻ ${s.cooldown || "Ilimitado"}</div>
          </div>
          <span class="learn-picker-item-check">${isSel ? "✓" : ""}</span>
        </div>`;
    }).join("");

    // Seleciona o primeiro automaticamente
    if (!spellSelected && items.length > 0) {
      spellSelected = items[0];
      const hiddenSel = document.getElementById("learn-spell-select");
      if (hiddenSel) { hiddenSel.innerHTML = `<option value="${escapeHTML(items[0].name)}">${escapeHTML(items[0].name)}</option>`; hiddenSel.value = items[0].name; }
      renderPreview(items[0]);
    }

    // Handlers de clique
    listEl.querySelectorAll(".learn-picker-item").forEach((el, i) => {
      el.addEventListener("click", () => {
        spellSelected = items[i];
        const hiddenSel = document.getElementById("learn-spell-select");
        if (hiddenSel) { hiddenSel.innerHTML = `<option value="${escapeHTML(items[i].name)}">${escapeHTML(items[i].name)}</option>`; hiddenSel.value = items[i].name; }
        renderPreview(items[i]);
        render();
      });
    });
  };

  const renderPreview = (s) => {
    const el = document.getElementById("spell-picker-preview");
    if (!el) return;
    const dmgMatch = s.effect.match(/(\d+d\d+(?:\s*[+\-]\s*\d+d\d+)*)\s*de\s*dano/i);
    const healMatch = s.effect.match(/cura\s+(\d+d\d+)/i) || s.effect.match(/recupera\s+(\d+d\d+)/i);
    el.classList.remove("hidden");
    el.innerHTML = `
      <div class="learn-preview-header">
        <span class="learn-preview-name">${escapeHTML(s.name)}</span>
        <span class="learn-picker-badge" style="background:rgba(58,42,29,0.1)">Nível ${s.level}</span>
      </div>
      ${dmgMatch ? `<div class="learn-preview-hl learn-preview-hl-dmg">⚔ Dano: ${dmgMatch[1]}</div>` : ""}
      ${healMatch ? `<div class="learn-preview-hl learn-preview-hl-heal">💚 Cura: ${healMatch[1]}</div>` : ""}
      <p class="learn-preview-effect">${escapeHTML(s.effect)}</p>
      <div class="learn-preview-meta">
        <span>⏱ ${escapeHTML(s.castTime || "1 Ação")}</span>
        <span>↻ ${escapeHTML(s.cooldown || "Ilimitado")}</span>
        <span>📚 ${escapeHTML(s.origin || "Geral")}</span>
      </div>`;
  };

  // Bind chips de nível
  document.querySelectorAll("#spell-level-chips .learn-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#spell-level-chips .learn-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      spellFilters.level = btn.dataset.spellLevel;
      spellSelected = null;
      render();
    });
  });
  // Bind chips de categoria
  document.querySelectorAll("#spell-cat-chips .learn-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#spell-cat-chips .learn-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      spellFilters.cat = btn.dataset.spellCat;
      spellSelected = null;
      render();
    });
  });
  // Bind busca
  document.getElementById("spell-picker-search")?.addEventListener("input", e => {
    spellFilters.search = e.target.value.trim().toLowerCase();
    spellSelected = null;
    render();
  });
  // Bind confirmar
  document.getElementById("btn-learn-spell")?.addEventListener("click", () => {
    const val = document.getElementById("learn-spell-select")?.value;
    if (!val) { showToast("Selecione uma magia para aprender."); return; }
    if (!character.spells) character.spells = [];
    character.spells.push(val);
    persistCurrentCharacter();
    renderSheet();
    showToast(`Magia "${val}" aprendida em um grimório.`);
  });

  render();
}

/* =====================================================================
   PICKER DE PERÍCIAS/HABILIDADES — chips de tipo + lista + preview
   ===================================================================== */

function initSkillPicker(character, cls) {
  const knownClass   = character.skills.class   || [];
  const knownGeneral = character.skills.general  || [];
  const allKnown = [...knownClass, ...knownGeneral];
  const combatSkillNames = new Set(SKILL_TESTS.filter(t => t.combat).map(t => t.name));

  // Montar catálogo completo de aprendíveis
  const classItems    = cls ? cls.skillsClass.filter(s => !knownClass.includes(s.name)).map(s => ({ ...s, _type: "class",   _typeLabel: "Perícia de Classe",  _attr: s.attr, example: s.example })) : [];
  const generalItems  = GENERAL_SKILLS.filter(s => !knownGeneral.includes(s.name)).map(s => ({ ...s, _type: "general", _typeLabel: "Perícia Geral",      _attr: s.attr, example: s.example }));
  const combatItems   = SKILL_TESTS.filter(t => t.combat && !allKnown.includes(t.name)).map(t => ({ name: t.name, desc: t.combatDesc || t.desc || "", _type: "combat",  _typeLabel: "Perícia de Combate", _attr: t.attrKeys.join("+"), _icon: t.icon }));
  const allItems = [...classItems, ...generalItems, ...combatItems];

  let skillFilters = { type: "", search: "" };
  let skillSelected = null;

  const getFiltered = () => {
    let items = allItems;
    if (skillFilters.type)   items = items.filter(s => s._type === skillFilters.type);
    if (skillFilters.search) {
      const q = skillFilters.search;
      items = items.filter(s => s.name.toLowerCase().includes(q) || (s.desc||s.description||"").toLowerCase().includes(q) || (s._attr||"").toLowerCase().includes(q));
    }
    return items;
  };

  const typeColor = { class: "#7a5c10", general: "#2a4a8a", combat: "#7a1010" };
  const typeBg    = { class: "rgba(156,122,60,0.15)", general: "rgba(40,80,140,0.12)", combat: "rgba(125,42,46,0.12)" };

  const render = () => {
    const items   = getFiltered();
    const listEl  = document.getElementById("skill-picker-list");
    const countEl = document.getElementById("skill-picker-count");
    const prevEl  = document.getElementById("skill-picker-preview");
    if (!listEl) return;

    if (countEl) countEl.textContent = `${items.length} perícia${items.length !== 1 ? "s" : ""}`;

    if (items.length === 0) {
      listEl.innerHTML = `<p class="learn-picker-empty">Nenhuma perícia disponível.</p>`;
      if (prevEl) prevEl.classList.add("hidden");
      skillSelected = null;
      return;
    }

    listEl.innerHTML = items.map((s, i) => {
      const isSel = skillSelected && skillSelected.name === s.name;
      const desc = s.desc || s.description || "";
      return `
        <div class="learn-picker-item ${isSel ? "selected" : ""}" data-skill-idx="${i}">
          <div class="learn-picker-item-main">
            <span class="learn-picker-item-name">${s._icon ? s._icon + " " : ""}${escapeHTML(s.name)}</span>
            <div class="learn-picker-item-meta">
              <span class="learn-picker-badge" style="background:${typeBg[s._type]||"rgba(0,0,0,0.07)"};color:${typeColor[s._type]||"#555"}">${s._typeLabel}</span>
              ${s._attr ? `<span class="learn-picker-badge learn-picker-badge-origin">${s._attr}</span>` : ""}
            </div>
            ${desc ? `<div class="learn-picker-item-sub">${escapeHTML(desc.slice(0, 60))}${desc.length > 60 ? "…" : ""}</div>` : ""}
          </div>
          <span class="learn-picker-item-check">${isSel ? "✓" : ""}</span>
        </div>`;
    }).join("");

    // Auto-seleciona o primeiro
    if (!skillSelected && items.length > 0) {
      skillSelected = items[0];
      renderSkillPreview(items[0]);
    }

    listEl.querySelectorAll(".learn-picker-item").forEach((el, i) => {
      el.addEventListener("click", () => {
        skillSelected = items[i];
        renderSkillPreview(items[i]);
        render();
      });
    });
  };

  const renderSkillPreview = (s) => {
    const el = document.getElementById("skill-picker-preview");
    if (!el) return;
    const desc = s.desc || s.description || s.effect || "";
    const example = s.example ? `<p class="learn-preview-example"><em>Exemplo: ${escapeHTML(s.example)}</em></p>` : "";
    const cost = s.cost ? `<div class="learn-preview-meta"><span>Custo: ${escapeHTML(s.cost)}</span></div>` : "";

    // Para perícias de combate, mostrar também os valores N/D/C calculados
    let combatValuesHTML = "";
    if (s._type === "combat") {
      const fullTest = SKILL_TESTS.find(t => t.name === s.name);
      if (fullTest) {
        const char = arguments[1] || null; // passa character se disponível
        combatValuesHTML = `<div class="learn-preview-meta" style="gap:6px;">
          <span style="font-size:11px;color:var(--ink-soft);">Atributos: <strong>${fullTest.attrKeys.join(" + ")}</strong></span>
        </div>`;
      }
    }

    el.classList.remove("hidden");
    el.innerHTML = `
      <div class="learn-preview-header">
        <span class="learn-preview-name">${s._icon ? s._icon + " " : ""}${escapeHTML(s.name)}</span>
        <span class="learn-picker-badge" style="background:${typeBg[s._type]};color:${typeColor[s._type]}">${s._typeLabel}</span>
      </div>
      ${s._attr ? `<div class="learn-preview-meta"><span>Atributo: <strong>${s._attr}</strong></span></div>` : ""}
      ${desc ? `<p class="learn-preview-effect">${escapeHTML(desc)}</p>` : ""}
      ${combatValuesHTML}
      ${example}${cost}`;
  };

  // Bind chips de tipo
  document.querySelectorAll("#skill-type-chips .learn-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#skill-type-chips .learn-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      skillFilters.type = btn.dataset.skillType;
      skillSelected = null;
      render();
    });
  });
  // Bind busca
  document.getElementById("skill-picker-search")?.addEventListener("input", e => {
    skillFilters.search = e.target.value.trim().toLowerCase();
    skillSelected = null;
    render();
  });
  // Bind confirmar
  document.getElementById("btn-learn-skill-unified")?.addEventListener("click", () => {
    if (!skillSelected) { showToast("Selecione uma perícia para aprender."); return; }
    const name  = skillSelected.name;
    const type  = skillSelected._type;
    if (type === "class") {
      if (!character.skills.class.includes(name)) character.skills.class.push(name);
    } else if (type === "general") {
      if (!character.skills.general.includes(name)) character.skills.general.push(name);
    } else if (type === "combat") {
      if (!character.skills.class.includes(name)) character.skills.class.push(name);
    }
    persistCurrentCharacter();
    renderSheet();
    showToast(`"${name}" aprendida!`);
  });

  render();
}

function attachSheetHandlers(character) {
  const cls = getClassDef(character.classKey);
  const maxHP = calcMaxHP(character);
  const resourceMax = calcResourceMax(character);

  // Print / Save as PDF
  const printBtn = document.getElementById("btn-print-sheet");
  if (printBtn) printBtn.addEventListener("click", () => {
    document.getElementById("print-sheet-area").innerHTML = buildPrintableSheet(character, cls, maxHP, resourceMax);
    window.print();
  });

  // HP controls (aba vital)
  const hpInput = document.getElementById("hp-input");
  document.querySelector('[data-action="hp-dec"]')?.addEventListener("click", () => {
    character.currentHP = clamp(character.currentHP - 1, 0, maxHP);
    persistCurrentCharacter(); renderSheet();
  });
  document.querySelector('[data-action="hp-inc"]')?.addEventListener("click", () => {
    character.currentHP = clamp(character.currentHP + 1, 0, maxHP);
    persistCurrentCharacter(); renderSheet();
  });
  if (hpInput) hpInput.addEventListener("change", () => {
    character.currentHP = clamp(parseInt(hpInput.value) || 0, 0, maxHP);
    persistCurrentCharacter(); renderSheet();
  });

  // Resource controls (Fúria/Foco/MP/Fé)
  if (cls) {
    const resInput = document.getElementById("resource-input");
    const decBtn = document.querySelector('[data-action="res-dec"]');
    const incBtn = document.querySelector('[data-action="res-inc"]');
    if (decBtn) decBtn.addEventListener("click", () => {
      character.currentResource = clamp(character.currentResource - 1, 0, resourceMax);
      persistCurrentCharacter(); renderSheet();
    });
    if (incBtn) incBtn.addEventListener("click", () => {
      character.currentResource = clamp(character.currentResource + 1, 0, resourceMax);
      persistCurrentCharacter(); renderSheet();
    });
    if (resInput) resInput.addEventListener("change", () => {
      character.currentResource = clamp(parseInt(resInput.value) || 0, 0, resourceMax);
      persistCurrentCharacter(); renderSheet();
    });
  }

  // XP gain + level up
  document.getElementById("btn-add-xp")?.addEventListener("click", () => {
    const input = document.getElementById("xp-gain-input");
    const amount = parseInt(input.value) || 0;
    if (amount <= 0) { showToast("Informe uma quantidade de XP maior que zero."); return; }
    const levelsGained = applyXPGain(character, amount);
    persistCurrentCharacter();
    renderSheet();
    if (levelsGained > 0) {
      showToast(`${character.name} subiu ${levelsGained} nível(is)! Ganhou ${levelsGained} ponto(s) de atributo.`);
    } else {
      showToast(`+${amount} XP registrado.`);
    }
  });

  // Attribute level-up spending
  // Atributos: + gasta ponto, − recupera ponto para redistribuir
  document.querySelectorAll("[data-attr-sheet-inc]").forEach(btn => {
    btn.addEventListener("click", () => {
      if ((character.unspentAttrPoints || 0) <= 0) { showToast("Sem pontos disponíveis. Use ↺ Redistribuir para recuperar pontos."); return; }
      const attr = btn.dataset.attrSheetInc;
      character.attrs[attr] += 1;
      character.unspentAttrPoints -= 1;
      persistCurrentCharacter();
      renderSheet();
    });
  });

  document.querySelectorAll("[data-attr-sheet-dec]").forEach(btn => {
    btn.addEventListener("click", () => {
      const attr = btn.dataset.attrSheetDec;
      if (character.attrs[attr] <= 0) return;
      character.attrs[attr] -= 1;
      character.unspentAttrPoints = (character.unspentAttrPoints || 0) + 1;
      persistCurrentCharacter();
      renderSheet();
      showToast(`1 ponto de ${attr} recuperado — redistribua livremente.`);
    });
  });

  // Botão ↺ Redistribuir — zera tudo e devolve todos os pontos base
  document.getElementById("btn-attr-reset")?.addEventListener("click", () => {
    showConfirm("Zerar todos os atributos e recuperar os pontos para redistribuir?", () => {
      const totalSpent = Object.values(character.attrs).reduce((a, b) => a + b, 0);
      ATTRS.forEach(a => { character.attrs[a] = 0; });
      character.unspentAttrPoints = (character.unspentAttrPoints || 0) + totalSpent;
      // Garante que o bônus de classe de nível 1 é refletido
      persistCurrentCharacter();
      renderSheet();
      showToast(`${character.unspentAttrPoints} pontos disponíveis para redistribuir.`);
    });
  });

  // Legacy — handler antigo data-attr-up (retrocompatibilidade)
  document.querySelectorAll("[data-attr-up]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (character.unspentAttrPoints <= 0) return;
      const attr = btn.dataset.attrUp;
      character.attrs[attr] += 1;
      character.unspentAttrPoints -= 1;
      persistCurrentCharacter();
      renderSheet();
    });
  });

  // Learn class ability (costs 1 skill point)
  document.querySelectorAll("[data-learn-ability]").forEach(btn => {
    btn.addEventListener("click", () => {
      if ((character.unspentSkillPoints || 0) <= 0) { showToast("Sem pontos de habilidade disponíveis. Ganhe XP para subir de nível."); return; }
      const abilityName = btn.dataset.learnAbility;
      if (!character.skills.abilities) character.skills.abilities = [];
      if (!character.skills.abilityLevels) character.skills.abilityLevels = {};
      if (character.skills.abilities.includes(abilityName)) return;
      character.skills.abilities.push(abilityName);
      character.skills.abilityLevels[abilityName] = 1;
      character.unspentSkillPoints -= 1;
      persistCurrentCharacter();
      renderSheet();
      showToast(`Habilidade "${abilityName}" aprendida!`);
    });
  });

  // Evoluir (subir de nível) uma habilidade já conhecida — custa 1 ponto de habilidade
  document.querySelectorAll("[data-upgrade-ability]").forEach(btn => {
    btn.addEventListener("click", () => {
      if ((character.unspentSkillPoints || 0) <= 0) { showToast("Sem pontos de habilidade disponíveis. Ganhe XP para subir de nível."); return; }
      const abilityId = btn.dataset.upgradeAbility;
      if (!character.skills.abilityLevels) character.skills.abilityLevels = {};
      const currentLevel = character.skills.abilityLevels[abilityId] || 1;

      // Determinar o nível máximo: subclasse tem níveis próprios, habilidade de classe usa ABILITY_MAX_LEVEL
      let maxLevel = ABILITY_MAX_LEVEL;
      if (character.subclassKey) {
        const sc = SUBCLASSES[character.subclassKey];
        const scSkill = sc?.skills.find(sk => sk.id === abilityId);
        if (scSkill) maxLevel = scSkill.levels.length;
      }

      if (currentLevel >= maxLevel) { showToast("Esta habilidade já está no nível máximo."); return; }
      character.skills.abilityLevels[abilityId] = currentLevel + 1;
      character.unspentSkillPoints -= 1;
      persistCurrentCharacter();
      renderSheet();
      showToast(`Habilidade evoluiu para Nível ${currentLevel + 1}!`);
    });
  });

  // Remover perícia de classe aprendida
  document.querySelectorAll("[data-remove-class-skill]").forEach(btn => {
    btn.addEventListener("click", () => {
      const skillName = btn.dataset.removeClassSkill;
      showConfirm(`Esquecer a perícia "${skillName}"? Ela precisará ser reaprendida com um mestre.`, () => {
        character.skills.class = character.skills.class.filter(s => s !== skillName);
        persistCurrentCharacter();
        renderSheet();
        showToast(`Perícia "${skillName}" esquecida.`);
      });
    });
  });

  // Remover perícia geral aprendida
  document.querySelectorAll("[data-remove-general-skill]").forEach(btn => {
    btn.addEventListener("click", () => {
      const skillName = btn.dataset.removeGeneralSkill;
      showConfirm(`Esquecer a perícia "${skillName}"? Ela precisará ser reaprendida com um mestre.`, () => {
        character.skills.general = character.skills.general.filter(s => s !== skillName);
        persistCurrentCharacter();
        renderSheet();
        showToast(`Perícia "${skillName}" esquecida.`);
      });
    });
  });

  // Remover magia conhecida
  document.querySelectorAll("[data-remove-spell]").forEach(btn => {
    btn.addEventListener("click", () => {
      const spellName = btn.dataset.removeSpell;
      showConfirm(`Esquecer a magia "${spellName}"? Ela precisará ser reaprendida em um grimório.`, () => {
        character.spells = (character.spells || []).filter(s => s !== spellName);
        character.activeSpells = (character.activeSpells || []).filter(s => s !== spellName);
        persistCurrentCharacter();
        renderSheet();
        showToast(`Magia "${spellName}" esquecida.`);
      });
    });
  });

  // Equipar magia (colocar em slot ativo)
  document.querySelectorAll("[data-equip-spell]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!character.activeSpells) character.activeSpells = [];
      const spellName = btn.dataset.equipSpell;
      const totalSlots = calcSpellSlots(character);
      if (character.activeSpells.length >= totalSlots) {
        showToast(`Sem slots disponíveis. Desequipe uma magia primeiro (${totalSlots} slot(s) no total).`);
        return;
      }
      if (!character.activeSpells.includes(spellName)) {
        character.activeSpells.push(spellName);
        persistCurrentCharacter();
        renderSheet();
        showToast(`"${spellName}" equipada no slot!`);
      }
    });
  });

  // Desequipar magia (liberar slot)
  document.querySelectorAll("[data-unequip-spell]").forEach(btn => {
    btn.addEventListener("click", () => {
      const spellName = btn.dataset.unequipSpell;
      character.activeSpells = (character.activeSpells || []).filter(s => s !== spellName);
      persistCurrentCharacter();
      renderSheet();
      showToast(`"${spellName}" desequipada.`);
    });
  });

  // ── Picker de Perícias ────────────────────────────────────────
  initSkillPicker(character, cls);

  // ── Picker de Magias ──────────────────────────────────────────
  initSpellPicker(character);

  // Equip from inventory / unequip back to inventory
  document.querySelectorAll(".equip-select").forEach(select => {
    select.addEventListener("change", () => {
      const slot = select.dataset.slot;
      const instanceId = select.value;
      if (!instanceId) return;
      const item = character.inventory.find(i => i.instanceId === instanceId);
      if (!item) return;
      // se já havia algo equipado nesse slot, ele volta pra mochila (não equipado)
      character.inventory.forEach(i => { if (i.equippedSlot === slot) i.equippedSlot = null; });
      item.equippedSlot = slot;
      persistCurrentCharacter();
      renderSheet();
      showToast(`${item.name} equipado.`);
    });
  });

  document.querySelectorAll("[data-unequip]").forEach(btn => {
    btn.addEventListener("click", () => {
      const slot = btn.dataset.unequip;
      character.inventory.forEach(i => { if (i.equippedSlot === slot) i.equippedSlot = null; });
      persistCurrentCharacter();
      renderSheet();
    });
  });

  // Accessories (multi-equip)
  const equipAccBtn = document.getElementById("btn-equip-accessory");
  if (equipAccBtn) equipAccBtn.addEventListener("click", () => {
    const select = document.getElementById("accessory-select");
    const instanceId = select.value;
    if (!instanceId) { showToast("Selecione um acessório do inventário para equipar."); return; }
    const item = character.inventory.find(i => i.instanceId === instanceId);
    if (!item) return;
    const currentlyEquipped = getEquippedItem(character, "accessory");
    if (currentlyEquipped.length >= 4) {
      showToast("Limite de 4 acessórios equipados atingido. Remova um para equipar outro.");
      return;
    }
    item.equippedSlot = "accessory";
    persistCurrentCharacter();
    renderSheet();
    showToast(`${item.name} equipado (${currentlyEquipped.length + 1}/4).`);
  });

  document.querySelectorAll("[data-unequip-accessory]").forEach(btn => {
    btn.addEventListener("click", () => {
      const instanceId = btn.dataset.unequipAccessory;
      const item = character.inventory.find(i => i.instanceId === instanceId);
      if (item) item.equippedSlot = null;
      persistCurrentCharacter();
      renderSheet();
    });
  });

  // Modifier fields (text + damage bonus) on equipped items
  document.querySelectorAll("[data-modifier-text]").forEach(textarea => {
    textarea.addEventListener("blur", () => {
      const item = character.inventory.find(i => i.instanceId === textarea.dataset.modifierText);
      if (item) { item.modifierText = textarea.value; persistCurrentCharacter(); }
    });
  });
  document.querySelectorAll("[data-modifier-bonus]").forEach(input => {
    input.addEventListener("change", () => {
      const item = character.inventory.find(i => i.instanceId === input.dataset.modifierBonus);
      if (item) {
        item.damageBonus = parseInt(input.value) || 0;
        persistCurrentCharacter();
        renderSheet();
      }
    });
  });

  // Remove inventory item (only if not equipped)
  document.querySelectorAll("[data-remove-inv]").forEach(btn => {
    btn.addEventListener("click", () => {
      const instanceId = btn.dataset.removeInv;
      const item = character.inventory.find(i => i.instanceId === instanceId);
      if (item && item.equippedSlot) { showToast("Desequipe o item antes de removê-lo."); return; }
      character.inventory = character.inventory.filter(i => i.instanceId !== instanceId);
      persistCurrentCharacter();
      renderSheet();
    });
  });

  // Open "Add item from the world" modal
  const openAddItemBtn = document.getElementById("btn-open-add-item-modal");
  if (openAddItemBtn) openAddItemBtn.addEventListener("click", () => openAddItemModal(character));

  // Notes (debounced save on blur/input) — só existe na aba inventário
  const notesArea = document.getElementById("character-notes");
  if (notesArea) {
    notesArea.addEventListener("input", () => { character.notes = notesArea.value; });
    notesArea.addEventListener("blur", () => { persistCurrentCharacter(); });
  }

  // Currency controls (bronze/prata/ouro/platina)
  const currency = ensureCurrency(character);

  document.querySelectorAll("[data-currency-inc]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.currencyInc;
      currency[key] = (currency[key] || 0) + 1;
      persistCurrentCharacter();
      renderSheet();
    });
  });

  document.querySelectorAll("[data-currency-dec]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.currencyDec;
      currency[key] = Math.max(0, (currency[key] || 0) - 1);
      persistCurrentCharacter();
      renderSheet();
    });
  });

  CURRENCY_DENOMINATIONS.forEach(d => {
    const input = document.getElementById(`currency-input-${d.key}`);
    if (input) {
      input.addEventListener("change", () => {
        currency[d.key] = Math.max(0, parseInt(input.value) || 0);
        persistCurrentCharacter();
        renderSheet();
      });
    }
  });

  const consolidateBtn = document.getElementById("btn-consolidate-currency");
  if (consolidateBtn) consolidateBtn.addEventListener("click", () => {
    consolidateCurrency(character);
    persistCurrentCharacter();
    renderSheet();
    showToast("Moedas convertidas para as maiores denominações possíveis.");
  });

  // Delete from sheet (só existe na aba inventário)
  document.getElementById("btn-delete-from-sheet")?.addEventListener("click", () => {
    showConfirm(`Remover permanentemente "${character.name}" do grimório?`, () => {
      characters = characters.filter(c => c.id !== character.id);
      saveCharacters(characters);
      currentSheetId = null;
      showView("view-list");
      renderCharacterList();
      showToast(`${character.name} foi removido.`);
    });
  });
}

/* ---------------------------------------------------------------------- */
/* MODAL: ADICIONAR ITEM DO MUNDO AO INVENTÁRIO                          */
/* ---------------------------------------------------------------------- */

let addItemModalCharacter = null;
let addItemModalTab = "catalog";

function openAddItemModal(character) {
  addItemModalCharacter = character;
  addItemModalTab = "catalog";
  const overlay = document.getElementById("add-item-modal-overlay");
  overlay.classList.remove("hidden");

  document.querySelectorAll("#add-item-tabs .tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.itemtab === addItemModalTab);
  });
  document.querySelectorAll(".modal-tab-content").forEach(c => {
    c.classList.toggle("active", c.dataset.itemtabContent === addItemModalTab);
  });

  populateCatalogItemSelect();

  document.getElementById("generic-item-name").value = "";
  document.getElementById("generic-item-qty").value = "1";
  document.getElementById("generic-item-weight").value = "0";
  document.getElementById("catalog-item-qty").value = "1";

  document.getElementById("custom-item-category").value = "weapon";
  document.getElementById("custom-item-name").value = "";
  document.getElementById("custom-item-weight").value = "1";
  document.getElementById("custom-weapon-dmg").value = "";
  document.getElementById("custom-weapon-req").value = "";
  document.getElementById("custom-weapon-defense").value = "1";
  document.getElementById("custom-armor-physdef").value = "0";
  document.getElementById("custom-armor-magdef").value = "0";
  document.getElementById("custom-armor-movepenalty").value = "0";
  document.getElementById("custom-armor-req").value = "";
  document.getElementById("custom-shield-physdef").value = "1";
  document.getElementById("custom-shield-penalty").value = "";
  document.getElementById("custom-accessory-effect").value = "";
  document.getElementById("custom-item-note").value = "";
  document.getElementById("custom-item-is-magic").checked = false;
  document.getElementById("custom-magic-bonus-fields").classList.add("hidden");
  document.getElementById("custom-bonus-attr-select").value = "";
  document.getElementById("custom-bonus-attr-value").value = "0";
  document.getElementById("custom-bonus-hp").value = "0";
  document.getElementById("custom-bonus-move").value = "0";
  document.getElementById("custom-bonus-actions").value = "0";
  document.getElementById("custom-bonus-reactions").value = "0";
  document.getElementById("custom-bonus-reaction-actions").value = "0";
  document.getElementById("custom-bonus-spell-actions").value = "0";
  document.getElementById("custom-bonus-dodge").value = "0";
  document.getElementById("custom-bonus-slots").value = "0";
  updateCustomItemFieldsVisibility();

  updateAddItemWeightPreview();
}

/* Calcula e exibe o peso resultante caso o item atual do modal seja adicionado,
   bloqueando visualmente (cor de alerta) quando excederia a capacidade de carga. */
function updateAddItemWeightPreview() {
  const previewEl = document.getElementById("add-item-weight-preview");
  if (!previewEl || !addItemModalCharacter) return;
  const character = addItemModalCharacter;
  const carry = calcCarryCapacity(character);
  const currentWeight = calcTotalWeight(character);

  let pendingWeight = 0;
  if (addItemModalTab === "catalog") {
    const qty = parseInt(document.getElementById("catalog-item-qty").value) || 1;
    pendingWeight = catalogSelectedItem ? (catalogSelectedItem.weight || 0) * qty : 0;
  } else if (addItemModalTab === "generic") {
    const qty = parseInt(document.getElementById("generic-item-qty").value) || 1;
    const weight = parseFloat(document.getElementById("generic-item-weight").value) || 0;
    pendingWeight = weight * qty;
  } else if (addItemModalTab === "custom") {
    pendingWeight = parseFloat(document.getElementById("custom-item-weight").value) || 0;
  }

  const resultWeight = round1(currentWeight + pendingWeight);
  const over = resultWeight > carry;
  previewEl.classList.toggle("over", over);
  const confirmBtn = document.getElementById("add-item-modal-confirm");

  if (over) {
    const space = round1(carry - currentWeight);
    previewEl.textContent = `⚠ Excede a capacidade de carga! Resultaria em ${resultWeight}kg / ${carry}kg (só há ${space > 0 ? space : 0}kg livres).`;
    if (confirmBtn) confirmBtn.disabled = true;
  } else {
    previewEl.textContent = `Peso após adicionar: ${resultWeight}kg / ${carry}kg de capacidade de carga.`;
    if (confirmBtn) confirmBtn.disabled = false;
  }
}

function closeAddItemModal() {
  document.getElementById("add-item-modal-overlay").classList.add("hidden");
  addItemModalCharacter = null;
}

document.querySelectorAll("#add-item-tabs .tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    addItemModalTab = btn.dataset.itemtab;
    document.querySelectorAll("#add-item-tabs .tab-btn").forEach(b => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".modal-tab-content").forEach(c => {
      c.classList.toggle("active", c.dataset.itemtabContent === addItemModalTab);
    });
    updateAddItemWeightPreview();
  });
});

const catalogCategorySelect = document.getElementById("catalog-category-select"); // oculto — legado
catalogCategorySelect.addEventListener("change", () => {
  renderCatalogItemList();
  updateAddItemWeightPreview();
});

const customItemCategorySelect = document.getElementById("custom-item-category");
customItemCategorySelect.addEventListener("change", () => {
  updateCustomItemFieldsVisibility();
});

const customItemIsMagicCheckbox = document.getElementById("custom-item-is-magic");
customItemIsMagicCheckbox.addEventListener("change", () => {
  document.getElementById("custom-magic-bonus-fields").classList.toggle("hidden", !customItemIsMagicCheckbox.checked);
});

function updateCustomItemFieldsVisibility() {
  const category = customItemCategorySelect.value;
  ["weapon", "armor", "shield", "accessory"].forEach(cat => {
    const group = document.getElementById(`custom-fields-${cat}`);
    if (group) group.classList.toggle("hidden", cat !== category);
  });
}

/* ── Estado dos filtros do catálogo ─────────────────────────── */
let catalogFilters = { type: "", tier: "", search: "" };
let catalogSelectedItem = null; // { item, sourceCategory }

/* Mapeamento de tipo-chip → categoria e predicado */
function getItemsByType(type) {
  const miscCat = (sub) => (MISC_ITEMS || []).filter(i => !sub || i.subcategory === sub).map(i => ({ ...i, _cat: "misc" }));
  switch (type) {
    case "weapon1h":      return WEAPONS_ONE_HAND.map(i  => ({ ...i, _cat: "weapon" }));
    case "weapon2h":      return WEAPONS_TWO_HAND.map(i  => ({ ...i, _cat: "weapon" }));
    case "weaponranged":  return WEAPONS_RANGED.map(i    => ({ ...i, _cat: "weapon" }));
    case "weaponmagic":   return WEAPONS_MAGIC.map(i     => ({ ...i, _cat: "weapon" }));
    case "shield":        return SHIELDS.map(i            => ({ ...i, _cat: "shield" }));
    case "armorleve":     return ARMORS.filter(a => (a.weight||0) <= 5 && !(a.movePenalty > 0)).map(i => ({ ...i, _cat: "armor" }));
    case "armormedia":    return ARMORS.filter(a => (a.weight||0) > 5 && (a.weight||0) <= 12).map(i => ({ ...i, _cat: "armor" }));
    case "armorpesada":   return ARMORS.filter(a => (a.weight||0) > 12 || (a.movePenalty > 0)).map(i => ({ ...i, _cat: "armor" }));
    case "accessory":     return ACCESSORIES.map(i        => ({ ...i, _cat: "accessory" }));
    case "misc":          return miscCat(null);
    case "misc-potion":   return miscCat("potion");
    case "misc-scroll":   return miscCat("scroll");
    case "misc-artefato": return miscCat("artefato");
    case "misc-gear":     return miscCat("gear");
    default: return [
      ...WEAPONS_ONE_HAND.map(i  => ({ ...i, _cat: "weapon" })),
      ...WEAPONS_TWO_HAND.map(i  => ({ ...i, _cat: "weapon" })),
      ...WEAPONS_RANGED.map(i    => ({ ...i, _cat: "weapon" })),
      ...WEAPONS_MAGIC.map(i     => ({ ...i, _cat: "weapon" })),
      ...SHIELDS.map(i           => ({ ...i, _cat: "shield" })),
      ...ARMORS.map(i            => ({ ...i, _cat: "armor" })),
      ...ACCESSORIES.map(i       => ({ ...i, _cat: "accessory" })),
      ...miscCat(null),
    ];
  }
}

function getFilteredCatalogItems() {
  let items = getItemsByType(catalogFilters.type);
  if (catalogFilters.tier) {
    items = items.filter(i => (i.tier || "comum") === catalogFilters.tier);
  }
  if (catalogFilters.search) {
    const q = catalogFilters.search.toLowerCase();
    items = items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.story || "").toLowerCase().includes(q) ||
      (i.note || "").toLowerCase().includes(q) ||
      (i.effect || "").toLowerCase().includes(q)
    );
  }
  return items;
}

function tierLabel(tier) {
  return { comum:"Comum", raro:"Raro", magico:"Mágico", lendario:"Lendário", unico:"Único", ancestral:"Ancestral" }[tier] || tier || "Comum";
}
function tierClass(tier) {
  return { comum:"tier-comum", raro:"tier-raro", magico:"tier-magico", lendario:"tier-lendario", unico:"tier-unico", ancestral:"tier-ancestral" }[tier] || "tier-comum";
}
function typeLabel(item) {
  if (item._cat === "shield")    return "Escudo";
  if (item._cat === "armor")     return "Armadura";
  if (item._cat === "accessory") return "Acessório";
  if (item._cat === "misc") {
    return { potion:"🧪 Poção", scroll:"📜 Pergaminho", artefato:"💎 Artefato", gear:"🎒 Equipamento" }[item.subcategory] || "Misc.";
  }
  if (item.heavyTwoHanded || WEAPONS_TWO_HAND.some(w => w.name === item.name)) return "Arma 2M";
  if (WEAPONS_RANGED.some(w => w.name === item.name)) return "Arma Ranged";
  if (WEAPONS_MAGIC.some(w => w.name === item.name))  return "Arma Arcana";
  return "Arma 1M";
}

function renderCatalogItemList() {
  const container = document.getElementById("catalog-item-list");
  const countEl   = document.getElementById("catalog-result-count");
  const items = getFilteredCatalogItems();

  if (countEl) countEl.textContent = `${items.length} ite${items.length !== 1 ? "ns" : "m"}`;

  if (items.length === 0) {
    container.innerHTML = `<p class="catalog-empty">Nenhum item encontrado. Tente outros filtros.</p>`;
    catalogSelectedItem = null;
    updateCatalogItemPreview();
    return;
  }

  container.innerHTML = items.map((item, idx) => {
    const tier  = item.tier || "comum";
    const isSelected = catalogSelectedItem && catalogSelectedItem.name === item.name;
    const stat = item.dmg ? `⚔ ${item.dmg}` :
                 item.physDefense !== undefined ? `🛡 ${item.physDefense} Def.` :
                 item.effect ? item.effect.slice(0, 42) + (item.effect.length > 42 ? "…" : "") : "";
    return `
      <div class="catalog-list-item ${isSelected ? "selected" : ""}" data-catalog-idx="${idx}" title="${escapeHTML(item.name)}">
        <div class="catalog-list-item-main">
          <div class="catalog-list-item-name">${escapeHTML(item.name)}</div>
          <div class="catalog-list-item-meta">
            <span class="catalog-item-tier ${tierClass(tier)}">${tierLabel(tier)}</span>
            <span class="catalog-item-type">${typeLabel(item)}</span>
            ${item.weight !== undefined ? `<span class="catalog-item-weight">${item.weight}kg</span>` : ""}
          </div>
          ${stat ? `<div class="catalog-list-item-stat">${stat}</div>` : ""}
        </div>
        <span class="catalog-list-item-check">${isSelected ? "✓" : ""}</span>
      </div>`;
  }).join("");

  // Handlers de seleção
  container.querySelectorAll(".catalog-list-item").forEach((el, idx) => {
    el.addEventListener("click", () => {
      const item = items[idx];
      catalogSelectedItem = item;
      // Sincroniza selects ocultos (legado de peso)
      const hiddenSel = document.getElementById("catalog-item-select");
      const hiddenCat = document.getElementById("catalog-category-select");
      if (hiddenCat) hiddenCat.value = item._cat;
      if (hiddenSel) {
        hiddenSel.innerHTML = `<option value="${escapeHTML(item.name)}">${escapeHTML(item.name)}</option>`;
        hiddenSel.value = item.name;
      }
      renderCatalogItemList();
      updateCatalogItemPreview();
      updateAddItemWeightPreview();
    });
  });

  // Seleciona o primeiro automaticamente se nenhum está selecionado
  if (!catalogSelectedItem && items.length > 0) {
    catalogSelectedItem = items[0];
    const hiddenSel = document.getElementById("catalog-item-select");
    const hiddenCat = document.getElementById("catalog-category-select");
    if (hiddenCat) hiddenCat.value = items[0]._cat;
    if (hiddenSel) {
      hiddenSel.innerHTML = `<option value="${escapeHTML(items[0].name)}">${escapeHTML(items[0].name)}</option>`;
      hiddenSel.value = items[0].name;
    }
    updateCatalogItemPreview();
  }
}

function updateCatalogItemPreview() {
  const preview = document.getElementById("catalog-item-preview");
  if (!preview) return;
  const item = catalogSelectedItem;
  if (!item) { preview.classList.add("hidden"); return; }
  preview.classList.remove("hidden");

  const magicBonusLines = item.magicBonus ? Object.entries(item.magicBonus)
    .filter(([k]) => k !== "attr" && k !== "attrValue")
    .map(([k,v]) => {
      const labels = { actions:"Ações",reactions:"Reações",reactionActions:"Ações de Reação",spellActions:"Ações de Magia",hp:"HP",carry:"Carga",slots:"Slots",move:"Movimento" };
      return v > 0 ? `<span class="catalog-preview-bonus">+${v} ${labels[k]||k}</span>` : null;
    }).filter(Boolean).join("") : "";
  const attrBonus = item.magicBonus?.attr ? `<span class="catalog-preview-bonus">+${item.magicBonus.attrValue} ${item.magicBonus.attr}</span>` : "";

  const setInfo = item.setName ? `<div class="catalog-preview-set">Conjunto: <em>${item.setName}</em></div>` : "";
  const req = item.req ? `<div class="catalog-preview-row"><span>Req.:</span> <strong>${item.req}</strong></div>` : "";
  const dmg = item.dmg ? `<div class="catalog-preview-row"><span>Dano:</span> <strong>${item.dmg}</strong></div>` : "";
  const def = item.physDefense !== undefined ? `<div class="catalog-preview-row"><span>Def. Física:</span> <strong>${item.physDefense}</strong></div>` : "";
  const defMag = item.magDefense !== undefined ? `<div class="catalog-preview-row"><span>Def. Mágica:</span> <strong>${item.magDefense}</strong></div>` : "";
  const pen = item.movePenalty ? `<div class="catalog-preview-row"><span>Pen. Mov.:</span> <strong>−${item.movePenalty}</strong></div>` : "";
  const wt  = item.weight !== undefined ? `<div class="catalog-preview-row"><span>Peso:</span> <strong>${item.weight}kg</strong></div>` : "";
  const cons = item.consumable ? `<div class="catalog-preview-row" style="color:var(--wax-red-dark)"><span>Tipo:</span> <strong>🔥 Consumível (uso único)</strong></div>` : "";
  const eff = item.effect ? `<div class="catalog-preview-effect">${escapeHTML(item.effect)}</div>` : "";
  const story = item.story ? `<div class="catalog-preview-story">"${escapeHTML(item.story)}"</div>` : "";
  const note  = item.note  ? `<div class="catalog-preview-note">📌 ${escapeHTML(item.note)}</div>` : "";

  preview.innerHTML = `
    <div class="catalog-preview-header">
      <span class="catalog-preview-name">${escapeHTML(item.name)}</span>
      <span class="catalog-item-tier ${tierClass(item.tier || "comum")}">${tierLabel(item.tier || "comum")}</span>
    </div>
    ${setInfo}
    <div class="catalog-preview-stats">${dmg}${def}${defMag}${pen}${wt}${req}${cons}</div>
    ${magicBonusLines || attrBonus ? `<div class="catalog-preview-bonuses">${magicBonusLines}${attrBonus}</div>` : ""}
    ${eff}${note}${story}
  `;
}

// Bind dos chips de tipo e tier
document.querySelectorAll("#catalog-type-chips .catalog-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#catalog-type-chips .catalog-chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    catalogFilters.type = btn.dataset.catalogType;
    catalogSelectedItem = null;
    renderCatalogItemList();
    updateAddItemWeightPreview();
  });
});
document.querySelectorAll("#catalog-tier-chips .catalog-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#catalog-tier-chips .catalog-chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    catalogFilters.tier = btn.dataset.catalogTier;
    catalogSelectedItem = null;
    renderCatalogItemList();
    updateAddItemWeightPreview();
  });
});
document.getElementById("catalog-search").addEventListener("input", e => {
  catalogFilters.search = e.target.value.trim().toLowerCase();
  catalogSelectedItem = null;
  renderCatalogItemList();
  updateAddItemWeightPreview();
});

function populateCatalogItemSelect() {
  // Mantido por retrocompatibilidade — agora só renderiza a lista nova
  catalogFilters = { type: "", tier: "", search: "" };
  catalogSelectedItem = null;
  document.querySelectorAll("#catalog-type-chips .catalog-chip").forEach(b => b.classList.toggle("active", !b.dataset.catalogType));
  document.querySelectorAll("#catalog-tier-chips .catalog-chip").forEach(b => b.classList.toggle("active", !b.dataset.catalogTier));
  const srch = document.getElementById("catalog-search");
  if (srch) srch.value = "";
  renderCatalogItemList();
}

// Recalcula o preview de peso sempre que qualquer campo relevante do modal mudar
["catalog-item-select", "catalog-item-qty", "generic-item-qty", "generic-item-weight"].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", updateAddItemWeightPreview);
    el.addEventListener("change", updateAddItemWeightPreview);
  }
});

document.getElementById("add-item-modal-cancel").addEventListener("click", closeAddItemModal);

document.getElementById("add-item-modal-confirm").addEventListener("click", () => {
  if (!addItemModalCharacter) return;
  const character = addItemModalCharacter;

  let pendingWeight = 0;
  let itemLabel = "";

  if (addItemModalTab === "catalog") {
    const sourceItem = catalogSelectedItem;
    const qty = parseInt(document.getElementById("catalog-item-qty").value) || 1;
    if (!sourceItem) { showToast("Selecione um item da lista."); return; }
    const pendingWeight = (sourceItem.weight || 0) * qty;
    const carry = calcCarryCapacity(character);
    const currentWeight = calcTotalWeight(character);
    if (round1(currentWeight + pendingWeight) > carry) {
      const space = round1(carry - currentWeight);
      showToast(`Carga máxima excedida! Faltam ${round1(pendingWeight - Math.max(space, 0))}kg de espaço livre (${Math.max(space, 0)}kg disponíveis).`);
      return;
    }
    const category = sourceItem._cat || "weapon";
    const newItem = makeInventoryItem({ ...sourceItem, kind: category }, null);
    newItem.qty = qty;
    character.inventory.push(newItem);
    showToast(`${sourceItem.name} adicionado ao inventário.`);

  } else if (addItemModalTab === "generic") {
    const name = document.getElementById("generic-item-name").value.trim();
    const qty = parseInt(document.getElementById("generic-item-qty").value) || 1;
    const weight = parseFloat(document.getElementById("generic-item-weight").value) || 0;
    if (!name) { showToast("Dê um nome ao item antes de adicionar."); return; }
    pendingWeight = weight * qty;
    itemLabel = name;

    const carry = calcCarryCapacity(character);
    const currentWeight = calcTotalWeight(character);
    if (round1(currentWeight + pendingWeight) > carry) {
      const space = round1(carry - currentWeight);
      showToast(`Carga máxima excedida! Faltam ${round1(pendingWeight - (space > 0 ? space : 0))}kg de espaço livre (${space > 0 ? space : 0}kg disponíveis).`);
      return;
    }

    character.inventory.push({
      instanceId: uid(), name, qty, weight, category: "gear",
      baseData: null, equippedSlot: null, damageBonus: 0, modifierText: ""
    });
    showToast(`${name} adicionado ao inventário.`);

  } else if (addItemModalTab === "custom") {
    const category = document.getElementById("custom-item-category").value;
    const name = document.getElementById("custom-item-name").value.trim();
    const weight = parseFloat(document.getElementById("custom-item-weight").value) || 0;
    const note = document.getElementById("custom-item-note").value.trim();
    if (!name) { showToast("Dê um nome ao item personalizado antes de adicionar."); return; }
    pendingWeight = weight;
    itemLabel = name;

    const carry = calcCarryCapacity(character);
    const currentWeight = calcTotalWeight(character);
    if (round1(currentWeight + pendingWeight) > carry) {
      const space = round1(carry - currentWeight);
      showToast(`Carga máxima excedida! Faltam ${round1(pendingWeight - (space > 0 ? space : 0))}kg de espaço livre (${space > 0 ? space : 0}kg disponíveis).`);
      return;
    }

    // Monta o baseData no mesmo formato dos itens de catálogo, conforme a categoria escolhida
    let baseData = null;
    if (category === "weapon") {
      const dmg = document.getElementById("custom-weapon-dmg").value.trim() || "1d4";
      const req = document.getElementById("custom-weapon-req").value.trim() || "—";
      const defenseRaw = document.getElementById("custom-weapon-defense").value;
      const defenseDegrade = defenseRaw === "null" ? null : parseInt(defenseRaw);
      baseData = { name, dmg, req, weight, defenseDegrade, slot: ["primary", "secondary"], note: note || undefined };
    } else if (category === "armor") {
      baseData = {
        name,
        physDefense: parseInt(document.getElementById("custom-armor-physdef").value) || 0,
        magDefense: parseInt(document.getElementById("custom-armor-magdef").value) || 0,
        weight,
        movePenalty: parseInt(document.getElementById("custom-armor-movepenalty").value) || 0,
        req: document.getElementById("custom-armor-req").value.trim() || "—",
        note: note || undefined
      };
    } else if (category === "shield") {
      baseData = {
        name,
        physDefense: parseInt(document.getElementById("custom-shield-physdef").value) || 0,
        weight,
        penalty: document.getElementById("custom-shield-penalty").value.trim() || "Nenhuma",
        slot: ["shield"],
        note: note || undefined
      };
    } else if (category === "accessory") {
      const effect = document.getElementById("custom-accessory-effect").value.trim() || "Sem efeito definido.";
      baseData = { name, weight, effect, note: note || undefined };
    }

    // Bônus mágicos especiais (opcional, qualquer categoria pode ter)
    let magicBonus = null;
    if (document.getElementById("custom-item-is-magic").checked) {
      const attrKey = document.getElementById("custom-bonus-attr-select").value;
      const attrValue = parseInt(document.getElementById("custom-bonus-attr-value").value) || 0;
      magicBonus = {
        attr: attrKey || null,
        attrValue: attrKey ? attrValue : 0,
        hp: parseInt(document.getElementById("custom-bonus-hp").value) || 0,
        move: parseInt(document.getElementById("custom-bonus-move").value) || 0,
        actions: parseInt(document.getElementById("custom-bonus-actions").value) || 0,
        reactions: parseInt(document.getElementById("custom-bonus-reactions").value) || 0,
        reactionActions: parseInt(document.getElementById("custom-bonus-reaction-actions").value) || 0,
        spellActions: parseInt(document.getElementById("custom-bonus-spell-actions").value) || 0,
        dodge: parseInt(document.getElementById("custom-bonus-dodge").value) || 0,
        slots: parseInt(document.getElementById("custom-bonus-slots").value) || 0
      };
    }

    character.inventory.push({
      instanceId: uid(), name, qty: 1, weight, category,
      baseData, equippedSlot: null, damageBonus: 0, modifierText: "", isCustom: true, magicBonus
    });
    showToast(`${name} (item personalizado) adicionado ao inventário.`);
  }

  persistCurrentCharacter();
  closeAddItemModal();
  renderSheet();
});

/* ---------------------------------------------------------------------- */
/* INIT                                                                   */
/* ---------------------------------------------------------------------- */

renderCharacterList();

/* ── Impressão do Glossário ──────────────────────────────────────── */

function _openPrintWindow(title, bodyHTML) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) { alert("Pop-up bloqueado. Permita pop-ups para esta página e tente novamente."); return; }
  w.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title} — Grimório</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Crimson Text',Georgia,serif;font-size:12pt;color:#2a1a0e;background:#fff;padding:15mm 14mm;line-height:1.5}
    h1{font-family:'IM Fell English',Georgia,serif;font-size:20pt;text-align:center;margin-bottom:4mm;border-bottom:2px solid #9c7a3c;padding-bottom:3mm;color:#3a2810}
    h2{font-family:'IM Fell English',Georgia,serif;font-size:15pt;margin:6mm 0 3mm;color:#3a2810;border-bottom:1px solid #ccc;padding-bottom:1mm}
    h3{font-family:'IM Fell English',Georgia,serif;font-size:12pt;margin:4mm 0 2mm;color:#5c3a1a}
    .subtitle{text-align:center;color:#8a6a50;font-style:italic;margin-bottom:5mm;font-size:10pt}
    .print-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:4mm;margin-bottom:5mm}
    .card{border:1px solid #c8a87a;border-left:4px solid #9c7a3c;border-radius:4px;padding:3mm 4mm;break-inside:avoid;background:#fffdf8}
    .card-name{font-family:'IM Fell English',Georgia,serif;font-size:13pt;color:#2a1a0e;margin-bottom:1mm}
    .card-meta{display:flex;flex-wrap:wrap;gap:3mm;margin-bottom:2mm}
    .badge{font-size:8pt;padding:1px 6px;border-radius:8px;font-family:sans-serif;color:#fff}
    .bg-gold{background:#9c7a3c} .bg-green{background:#566248} .bg-red{background:#7a2a2e}
    .bg-purple{background:#6a3a7a} .bg-blue{background:#2a5a8a} .bg-gray{background:#666}
    .card-effect{font-size:10.5pt;color:#3a2810;line-height:1.55;margin-bottom:1.5mm}
    .card-note{font-size:9.5pt;color:#5a4030;font-style:italic;border-left:2px solid #9c7a3c;padding-left:2mm;margin-top:1.5mm}
    .card-story{font-size:9pt;color:#8a6a50;font-style:italic;margin-top:1mm}
    .tags{display:flex;flex-wrap:wrap;gap:3mm;margin:1.5mm 0}
    .tag{font-size:8.5pt;background:#f0e8d8;padding:1px 5px;border-radius:4px;color:#5a4030}
    .print-footer{text-align:right;font-size:9pt;color:#aaa;margin-top:8mm;border-top:1px solid #eee;padding-top:2mm}
    @media print{body{padding:8mm 10mm}.card{break-inside:avoid}h2{page-break-after:avoid}}
  </style>
</head>
<body>
  <h1>📖 ${title}</h1>
  <p class="subtitle">Grimório de Personagens · Mundo de Aether · ${new Date().toLocaleDateString("pt-BR")}</p>
  ${bodyHTML}
  <div class="print-footer">Impresso via Grimório de Personagens</div>
  <script>window.onload=()=>setTimeout(()=>window.print(),400)<\/script>
</body></html>`);
  w.document.close();
}

function printGlossarySpells() {
  const query = document.getElementById("glossary-search").value.trim().toLowerCase();
  const allSpells = getAllSpellsInGame();
  const filtered = allSpells.filter(s => !query || s.name.toLowerCase().includes(query) || s.effect.toLowerCase().includes(query));
  const byOrigin = {};
  filtered.forEach(s => { if (!byOrigin[s.origin]) byOrigin[s.origin] = []; byOrigin[s.origin].push(s); });

  let bodyHTML = "";
  Object.keys(byOrigin).forEach(origin => {
    const spells = byOrigin[origin].sort((a,b) => a.level - b.level);
    bodyHTML += `<h2>${origin === "Geral" ? "✦ Magias Gerais" : origin} (${spells.length})</h2><div class="print-grid">`;
    bodyHTML += spells.map(s => `
      <div class="card">
        <div class="card-name">${s.name}</div>
        <div class="card-meta">
          <span class="badge bg-gold">Nível ${s.level}</span>
          ${s.cursed ? '<span class="badge bg-red">⚠ Amaldiçoada</span>' : ""}
          ${s.divine ? `<span class="badge bg-purple">🌟 ${s.divine}</span>` : ""}
          ${s.category ? `<span class="badge bg-gray">${s.category}</span>` : ""}
        </div>
        <p class="card-effect">${s.effect}</p>
        <div class="tags">
          <span class="tag">⏱ ${s.castTime || "1 Ação"}</span>
          <span class="tag">↻ ${s.cooldown || "Sem limite"}</span>
        </div>
        ${s.note ? `<p class="card-note">${s.note}</p>` : ""}
      </div>`).join("");
    bodyHTML += `</div>`;
  });
  _openPrintWindow(`Glossário de Magias${query ? ` — "${query}"` : ""}`, bodyHTML);
}

function printGlossaryAbilities() {
  const query = document.getElementById("glossary-search").value.trim().toLowerCase();
  let bodyHTML = "";
  Object.keys(CLASSES).forEach(key => {
    const cls = CLASSES[key];
    const skills = cls.skills.filter(s => !query || s.name.toLowerCase().includes(query) || s.effect.toLowerCase().includes(query));
    if (!skills.length) return;
    bodyHTML += `<h2>${cls.icon} ${cls.name} (${skills.length})</h2><div class="print-grid">`;
    bodyHTML += skills.map(sk => {
      const isLev = Array.isArray(sk.levels) && sk.levels.length > 1;
      const levsHTML = isLev ? sk.levels.map((lv,i) => `<p class="card-note"><strong>Nv${i+1}:</strong> ${lv.effect}</p>`).join("") : "";
      return `
        <div class="card">
          <div class="card-name">${sk.name}</div>
          <div class="card-meta">
            <span class="badge bg-green">${sk.cost}</span>
            ${sk.attr ? `<span class="tag">${sk.attr}</span>` : ""}
            ${isLev ? `<span class="badge bg-purple">Nivelável 1–${sk.levels.length}</span>` : ""}
          </div>
          <p class="card-effect">${sk.effect}</p>
          ${levsHTML}
          ${sk.example ? `<p class="card-story">Ex: ${sk.example}</p>` : ""}
        </div>`;
    }).join("");
    bodyHTML += `</div>`;
  });
  _openPrintWindow(`Glossário de Perícias${query ? ` — "${query}"` : ""}`, bodyHTML);
}

function printGlossaryItems() {
  const query = document.getElementById("glossary-search").value.trim().toLowerCase();
  const matches = n => !query || n.toLowerCase().includes(query);
  const TIER_ORDER = { comum:0, raro:1, magico:2, lendario:3, unico:4, ancestral:5 };
  const TIER_COL   = { comum:"bg-gray", raro:"bg-blue", magico:"bg-purple", lendario:"bg-red", unico:"bg-red", ancestral:"bg-red" };
  const sortByTier = (a,b) => (TIER_ORDER[a.tier]||0) - (TIER_ORDER[b.tier]||0);

  const card = (it, statTags) => `
    <div class="card">
      <div class="card-name">${it.name}</div>
      <div class="card-meta">
        ${it.tier  ? `<span class="badge ${TIER_COL[it.tier]||"bg-gray"}">${it.tier}</span>` : ""}
        ${it.cursed ? '<span class="badge bg-red">⚠ Amaldiçoado</span>' : ""}
        ${it.divine ? `<span class="badge bg-purple">🌟 ${it.divine}</span>` : ""}
      </div>
      <div class="tags">${statTags}</div>
      ${it.effect ? `<p class="card-effect">${it.effect}</p>` : ""}
      ${it.note   ? `<p class="card-note">${it.note}</p>` : ""}
      ${it.story  ? `<p class="card-story">"${it.story}"</p>` : ""}
    </div>`;

  const sections = [
    { t:"⚔ Armas de Uma Mão",   l:WEAPONS_ONE_HAND,  s:it=>[it.dmg?`<span class="tag">⚔ ${it.dmg}</span>`:"",`<span class="tag">⚖ ${it.weight}kg</span>`,it.req?`<span class="tag">${it.req}</span>`:""].filter(Boolean).join("") },
    { t:"⚔ Armas de Duas Mãos", l:WEAPONS_TWO_HAND,  s:it=>[it.dmg?`<span class="tag">⚔ ${it.dmg}</span>`:"",`<span class="tag">⚖ ${it.weight}kg</span>`].filter(Boolean).join("") },
    { t:"🔮 Armas Mágicas",     l:WEAPONS_MAGIC,     s:it=>[it.dmg?`<span class="tag">⚔ ${it.dmg}</span>`:"",it.range?`<span class="tag">🎯 ${it.range}hex</span>`:""  ].filter(Boolean).join("") },
    { t:"🏹 Armas à Distância", l:WEAPONS_RANGED,    s:it=>[it.dmg?`<span class="tag">⚔ ${it.dmg}</span>`:"",it.range?`<span class="tag">🎯 ${it.range}hex</span>`:""  ].filter(Boolean).join("") },
    { t:"🛡 Escudos",           l:SHIELDS,           s:it=>[`<span class="tag">🛡+${it.physDefense}</span>`,`<span class="tag">⚖ ${it.weight}kg</span>`].join("") },
    { t:"🧥 Armaduras",         l:ARMORS,            s:it=>[`<span class="tag">🛡 Fís.${it.physDefense}</span>`,`<span class="tag">✨ Mag.${it.magDefense||0}</span>`,`<span class="tag">⚖ ${it.weight}kg</span>`].join("") },
    { t:"💍 Acessórios",        l:ACCESSORIES,       s:it=>[`<span class="tag">⚖ ${it.weight}kg</span>`].join("") },
  ];
  let bodyHTML = "";
  sections.forEach(sec => {
    const fil = sec.l.filter(i => matches(i.name)).sort(sortByTier);
    if (!fil.length) return;
    bodyHTML += `<h2>${sec.t} (${fil.length})</h2><div class="print-grid">`;
    bodyHTML += fil.map(it => card(it, sec.s(it))).join("");
    bodyHTML += `</div>`;
  });
  _openPrintWindow(`Glossário de Itens${query ? ` — "${query}"` : ""}`, bodyHTML);
}

/* --- Glossário de Habilidades (todas as classes) --- */

function renderAbilitiesGlossary(query) {
  let totalCount = 0;
  let html = "";
  Object.keys(CLASSES).forEach(key => {
    const cls = CLASSES[key];
    const filtered = cls.skills.filter(s => !query || s.name.toLowerCase().includes(query) || s.effect.toLowerCase().includes(query));
    if (filtered.length === 0) return;
    totalCount += filtered.length;
    html += `<h3 class="glossary-group-title">${cls.icon} ${cls.name}</h3>`;
    html += `<div class="ability-card-grid">`;
    html += filtered.map(skill => {
      const isLevelable = Array.isArray(skill.levels) && skill.levels.length > 1;
      if (!isLevelable) {
        return `
        <div class="ability-card known">
          <div class="ability-card-head">
            <span class="ability-card-name">${skill.name}</span>
          </div>
          <div class="ability-card-cost">${skill.cost}</div>
          <p class="ability-card-effect">${skill.effect}</p>
        </div>`;
      }
      return `
      <div class="ability-card known ability-card-glossary-levels">
        <div class="ability-card-head">
          <span class="ability-card-name">${skill.name}</span>
          <span class="ability-card-badge">Nivelável (1-${skill.levels.length})</span>
        </div>
        ${skill.levels.map((lvl, i) => `
          <div class="glossary-level-row">
            <span class="glossary-level-tag">Nível ${i + 1}</span>
            <span class="glossary-level-cost">${lvl.cost}</span>
            <p class="glossary-level-effect">${lvl.effect}</p>
          </div>
        `).join("")}
      </div>`;
    }).join("");
    html += `</div>`;
  });

  if (!html) return `<p class="empty-inline-note">Nenhuma habilidade encontrada para "${escapeHTML(query)}".</p>`;

  const printBtn = `
    <div class="glossary-print-bar">
      <span class="glossary-print-info">📖 ${totalCount} perícia(s)/habilidade(s)${query ? ` para "${escapeHTML(query)}"` : ""}</span>
      <button class="glossary-print-btn" onclick="printGlossaryAbilities()">🖨 Imprimir Perícias</button>
    </div>`;

  return printBtn + html;
}

/* --- Glossário de Magias (todas, classe + gerais) --- */

function getClassIconByName(className) {
  const keys = Object.keys(CLASSES);
  for (let i = 0; i < keys.length; i++) {
    if (CLASSES[keys[i]].name === className) return CLASSES[keys[i]].icon;
  }
  return "✦";
}

function renderSpellsGlossary(query) {
  const allSpells = getAllSpellsInGame();
  const filtered = allSpells.filter(s => !query || s.name.toLowerCase().includes(query) || s.effect.toLowerCase().includes(query));

  if (filtered.length === 0) return `<p class="empty-inline-note">Nenhuma magia encontrada para "${escapeHTML(query)}".</p>`;

  const printBtn = `
    <div class="glossary-print-bar">
      <span class="glossary-print-info">📖 ${filtered.length} magia(s)${query ? ` para "${escapeHTML(query)}"` : ""}</span>
      <button class="glossary-print-btn" onclick="printGlossarySpells()">🖨 Imprimir Magias</button>
    </div>`;

  const catConfig = {
    buff:      { icon: "⬆", label: "Buffs", color: "#4a90d9" },
    ritual:    { icon: "🕯", label: "Rituais", color: "#9b59b6" },
    invocacao: { icon: "🌀", label: "Invocações", color: "#e67e22" }
  };

  const spellCard = (s) => {
    const catBadge = s.category && catConfig[s.category]
      ? `<span class="spell-cat-badge" style="background:${catConfig[s.category].color}">${catConfig[s.category].icon} ${catConfig[s.category].label}</span>`
      : "";
    const condNote = s.category === "invocacao" && s.effect.startsWith("Condição:")
      ? `<div class="spell-condition-note">⚠ ${s.effect.match(/Condição:[^.]+\./)?.[0] || ""}</div>`
      : "";
    return `
      <div class="spell-card spell-level-${s.level}">
        <div class="spell-card-head">
          <span class="spell-card-name">${s.name}</span>
          <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
            ${catBadge}
            <span class="spell-card-level-badge">Nível ${s.level}</span>
          </div>
        </div>
        ${condNote}
        <p class="spell-card-effect">${s.effect}</p>
        <div class="spell-card-meta-row">
          <span class="spell-meta-tag ${s.castTime && !s.castTime.includes("instantânea") ? "spell-meta-tag-slow" : ""}">⏱ ${s.castTime || "1 Ação"}</span>
          <span class="spell-meta-tag spell-meta-tag-cooldown">↻ ${s.cooldown || "Sem limite"}</span>
        </div>
      </div>`;
  };

  // Agrupa: primeiro por origem, dentro de Geral por categoria
  const groups = {};
  filtered.forEach(s => {
    if (!groups[s.origin]) groups[s.origin] = [];
    groups[s.origin].push(s);
  });

  const bodyHTML = Object.keys(groups).map(origin => {
    const spells = groups[origin].sort((a, b) => a.level - b.level);
    const title = origin === "Geral"
      ? "✦ Magias Gerais (qualquer classe pode aprender)"
      : getClassIconByName(origin) + " " + origin;

    if (origin !== "Geral") {
      return `
        <h3 class="glossary-group-title">${title}</h3>
        <div class="spell-card-grid">${spells.map(spellCard).join("")}</div>`;
    }

    // Para Geral, separa por categoria
    const cats = ["buff","ritual","invocacao",null];
    let html = `<h3 class="glossary-group-title">${title}</h3>`;
    cats.forEach(cat => {
      const catSpells = cat
        ? spells.filter(s => s.category === cat)
        : spells.filter(s => !s.category);
      if (!catSpells.length) return;
      const cfg = catConfig[cat];
      html += cfg
        ? `<h4 class="damage-subtitle" style="margin:12px 0 8px;color:${cfg.color}">${cfg.icon} ${cfg.label} (${catSpells.length})</h4>`
        : `<h4 class="damage-subtitle" style="margin:12px 0 8px;">✦ Gerais</h4>`;
      html += `<div class="spell-card-grid">${catSpells.map(spellCard).join("")}</div>`;
    });
    return html;
  }).join("");

  return printBtn + bodyHTML;
}

/* --- Glossário de Itens (armas, armaduras, escudos, acessórios) --- */

/* Badge visual para tiers especiais (só Raro+) */
const TIER_CONFIG = {
  raro:      { label: "Raro",      color: "#4a90d9" },
  magico:    { label: "Mágico",    color: "#9b59b6" },
  lendario:  { label: "Lendário",  color: "#e67e22" },
  unico:     { label: "Único",     color: "#e74c3c" },
  ancestral: { label: "Ancestral", color: "#8B0000" }
};

function renderTierBadge(tier) {
  if (!tier || tier === "comum") return "";
  const cfg = TIER_CONFIG[tier];
  if (!cfg) return "";
  return `<span class="tier-badge" style="background:${cfg.color};">${cfg.label}</span>`;
}

function renderItemGlossaryCard(item, extraChips = "") {
  const tierBadge = renderTierBadge(item.tier);
  const setBadge = item.setName
    ? `<span class="set-badge">🔗 ${item.setName}</span>`
    : "";
  const setBonusHTML = item.setBonus
    ? `<div class="item-glossary-unique-ability" style="border-left-color:#4a9e50;">🔗 <strong>Bônus de Set (${item.setBonus.pieces} peças):</strong> ${item.setBonus.ability} — ${item.setBonus.effect}</div>`
    : "";
  const hasStory = item.story || item.uniqueAbility;
  return `
    <div class="item-glossary-card ${item.tier && item.tier !== "comum" ? "item-glossary-card-special" : ""} ${item.tier === "unico" || item.tier === "ancestral" ? "item-glossary-card-unique" : ""}">
      <div class="item-glossary-name">${item.name} ${tierBadge}${setBadge}</div>
      <div class="equip-stat-chips">${extraChips}</div>
      ${item.note ? `<p class="item-glossary-note">✦ ${item.note}</p>` : ""}
      ${item.story ? `<p class="item-glossary-story">📖 ${item.story}</p>` : ""}
      ${setBonusHTML}
      ${item.uniqueAbility ? `<div class="item-glossary-unique-ability">⭐ <strong>Habilidade Única:</strong> ${item.uniqueAbility}</div>` : ""}
    </div>`;
}

function renderItemsGlossary(query) {
  const matches = (name) => !query || name.toLowerCase().includes(query);
  let totalCount = 0;

  const weaponSections = [
    { title: "Armas de Uma Mão", list: WEAPONS_ONE_HAND },
    { title: "Armas de Duas Mãos", list: WEAPONS_TWO_HAND },
    { title: "Armas Mágicas (Varinhas, Grimórios, Orbes)", list: WEAPONS_MAGIC },
    { title: "Armas à Distância", list: WEAPONS_RANGED }
  ];

  // Ordena por tier: comum → raro → magico → lendario → unico → ancestral
  const TIER_ORDER = { comum: 0, raro: 1, magico: 2, lendario: 3, unico: 4, ancestral: 5 };
  const sortByTier = (a, b) => (TIER_ORDER[a.tier] || 0) - (TIER_ORDER[b.tier] || 0);

  let html = "";

  weaponSections.forEach(section => {
    const filtered = section.list.filter(w => matches(w.name)).sort(sortByTier);
    if (filtered.length === 0) return;
    totalCount += filtered.length;
    html += `<h3 class="glossary-group-title">⚔ ${section.title}</h3>`;
    html += `<div class="item-glossary-grid">`;
    html += filtered.map(w => {
      const chips = [
        `<span class="equip-stat-chip equip-stat-chip-damage"><span class="equip-stat-chip-label">Dano</span>${w.dmg || "—"}</span>`,
        w.range ? `<span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Alcance</span>${w.range} hex</span>` : "",
        `<span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Peso</span>${w.weight}kg</span>`,
        `<span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Req.</span>${w.req || "—"}</span>`
      ].filter(Boolean).join("");
      return renderItemGlossaryCard(w, chips);
    }).join("");
    html += `</div>`;
  });

  const filteredShields = SHIELDS.filter(s => matches(s.name)).sort(sortByTier);
  if (filteredShields.length > 0) {
    totalCount += filteredShields.length;
    html += `<h3 class="glossary-group-title">🛡 Escudos</h3>`;
    html += `<div class="item-glossary-grid">`;
    html += filteredShields.map(s => {
      const chips = [
        `<span class="equip-stat-chip equip-stat-chip-defense"><span class="equip-stat-chip-label">Def. Física</span>+${s.physDefense}</span>`,
        `<span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Peso</span>${s.weight}kg</span>`,
        `<span class="equip-stat-chip ${s.penalty !== "Nenhuma" ? "equip-stat-chip-warn" : "equip-stat-chip-neutral"}"><span class="equip-stat-chip-label">Penalidade</span>${s.penalty}</span>`
      ].join("");
      return renderItemGlossaryCard(s, chips);
    }).join("");
    html += `</div>`;
  }

  const filteredArmors = ARMORS.filter(a => matches(a.name)).sort(sortByTier);
  if (filteredArmors.length > 0) {
    totalCount += filteredArmors.length;
    html += `<h3 class="glossary-group-title">🧥 Armaduras</h3>`;
    html += `<div class="item-glossary-grid">`;
    html += filteredArmors.map(a => {
      const chips = [
        `<span class="equip-stat-chip equip-stat-chip-defense"><span class="equip-stat-chip-label">Def. Física</span>${a.physDefense}</span>`,
        `<span class="equip-stat-chip equip-stat-chip-magic"><span class="equip-stat-chip-label">Def. Mágica</span>${a.magDefense}</span>`,
        `<span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Peso</span>${a.weight}kg</span>`,
        `<span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Req.</span>${a.req || "—"}</span>`
      ].join("");
      return renderItemGlossaryCard(a, chips);
    }).join("");
    html += `</div>`;
  }

  const filteredAccessories = ACCESSORIES.filter(a => matches(a.name)).sort(sortByTier);
  if (filteredAccessories.length > 0) {
    totalCount += filteredAccessories.length;
    html += `<h3 class="glossary-group-title">💍 Acessórios</h3>`;
    html += `<div class="item-glossary-grid">`;
    html += filteredAccessories.map(a => {
      const chips = `<span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Peso</span>${a.weight}kg</span>`;
      const cardWithEffect = renderItemGlossaryCard({ ...a, note: a.effect }, chips);
      return cardWithEffect;
    }).join("");
    html += `</div>`;
  }

  if (!html) return `<p class="empty-inline-note">Nenhum item encontrado para "${escapeHTML(query)}".</p>`;

  const printBtn = `
    <div class="glossary-print-bar">
      <span class="glossary-print-info">📖 ${totalCount} item(ns)${query ? ` para "${escapeHTML(query)}"` : ""}</span>
      <button class="glossary-print-btn" onclick="printGlossaryItems()">🖨 Imprimir Itens</button>
    </div>`;

  return printBtn + html;
}

