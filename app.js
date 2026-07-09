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
const WIZARD_STEPS = 7;

function freshWizardDraft() {
  return {
    name: "",
    origin: "",
    rosterType: "pc",
    classKey: null,
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
   Base: max(1, floor(DEX/3) + floor(AGI/2))
   Regra: a cada 3 DEX ganha +1 ação; a cada 2 AGI ganha +1 ação */
function calcActions(character) {
  const dexBonus = Math.floor(getEffectiveAttr(character, "DEX") / 3);
  const agiBonus = Math.floor(getEffectiveAttr(character, "AGI") / 2);
  const base = Math.max(1, dexBonus + agiBonus);
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

/* Ações de Magia = max(floor(INT/2), floor(SAB/2)). Só o Mago tem mínimo garantido de 1. */
function calcSpellActions(character) {
  const cls = getClassDef(character.classKey);
  let actions = Math.floor(getEffectiveAttr(character, "INT") / 2);
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

/* Capacidade de Carga = 15 + FOR*5 + carryPerLevel da classe * (nivel - 1) */
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
  if (step === 3) renderAttributeStep();
  if (step === 4) renderSkillStep();
  if (step === 5) renderSpellStep();
  if (step === 6) renderEquipmentStep();
  if (step === 7) renderReviewStep();

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
    if (wizard.attrPointsLeft > 0) { showToast(`Ainda restam ${wizard.attrPointsLeft} ponto(s) de atributo para distribuir.`); return false; }
    return true;
  }
  if (step === 4) {
    if (wizard.classSkills.length !== 2) { showToast("Escolha exatamente 2 perícias de classe."); return false; }
    if (wizard.generalSkills.length !== 1) { showToast("Escolha 1 perícia geral."); return false; }
    return true;
  }
  if (step === 5) {
    if (isCasterClass() && !wizard.startSpell) { showToast("Escolha uma magia inicial."); return false; }
    return true;
  }
  return true;
}

document.getElementById("btn-wizard-next").addEventListener("click", () => {
  if (!validateStep(wizardCurrentStep)) return;
  let next = wizardCurrentStep + 1;
  // pular etapa 5 se a classe não conjura magia
  if (next === 5 && !isCasterClass()) next = 6;
  if (next <= WIZARD_STEPS) goToWizardStep(next);
});

document.getElementById("btn-wizard-back").addEventListener("click", () => {
  let prev = wizardCurrentStep - 1;
  if (prev === 5 && !isCasterClass()) prev = 4;
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
    level: 1,
    xp: 0,
    unspentAttrPoints: 0,
    unspentSkillPoints: 0,
    attrs: finalAttrs,
    currentHP: null, // será setado para maxHP após cálculo
    currentResource: 0,
    skills: {
      class: [...wizard.classSkills, ...(wizard.combatSkills || [])],
      general: [...wizard.generalSkills],
      abilities: cls.skills.length > 0 ? [cls.skills[0].name] : [], // 1ª habilidade V1 gratuita no nível 1
      abilityLevels: cls.skills.length > 0 ? { [cls.skills[0].name]: 1 } : {}, // nível atual de cada habilidade V1
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


function openBestiary() {
  window.open("bestiary.html", "_blank");
}

function openLocations() {
  window.open("locations.html", "_blank");
}

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
    { label: "Ações/turno", value: actions, tooltip: "Quantas ações você pode realizar no seu turno (atacar, usar habilidade, etc). Ganha-se 1 a cada 3 pontos de DEX e 1 a cada 2 pontos de AGI. Mínimo de 1." },
    { label: "Reações/rodada", value: reactions, tooltip: "Quantas vezes você pode reagir fora do seu turno (defender-se, ataque de oportunidade). Ganha-se 1 reação extra a cada 4 pontos de AGI, começando com 1." },
    { label: "Ações de Reação", value: reactionActions, tooltip: "Recurso separado das Reações comuns, usado especificamente para ações reativas especiais. Ganha-se 1 a cada 3 pontos de AGI. Mínimo de 1." },
    { label: "Ações de Magia", value: spellActions, tooltip: "Ações reservadas para conjurar magias. Equivale a INT ÷ 2 (arredondado para baixo). O Mago sempre tem no mínimo 1.", highlight: spellActions > 0 },
    { label: "Defesa Física", value: physDef, tooltip: "Reduz o dano de ataques físicos recebidos. Vem da armadura equipada e do escudo (se houver)." },
    { label: "Defesa Mágica", value: magDef, tooltip: "Reduz o dano de magias e ataques mágicos recebidos. Vem principalmente de armaduras arcanas/sagradas e itens mágicos." },
    { label: "Chance de Esquiva", value: `${dodge} ou menos (d20)`, tooltip: "Role 1d20: se o resultado for igual ou menor que este valor, você esquiva totalmente do ataque. Base 10 + AGI. Armas de duas mãos pesadas (sem a perícia 'Defesa com Armas Pesadas') aplicam −2." },
    { label: "Slots de Magia", value: slots, tooltip: "Quantas magias você pode conjurar antes de descansar. Equivale a INT + SAB. Classes conjuradoras têm garantia de pelo menos 1." },
    { label: "Carga", value: `${weight} / ${carry}`, tooltip: "Peso atual carregado / capacidade máxima. Base 15 + (FOR × 5), mais um bônus fixo por nível que varia por classe." }
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
  const known = character.skills.abilities;
  const levels = character.skills.abilityLevels;
  const points = character.unspentSkillPoints || 0;

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Habilidades de Classe</h3>
    <p class="section-hint">Recurso: <strong>${cls.resource}</strong> — ${cls.resourceDesc}</p>
    ${points > 0 ? `<div class="points-banner">★ Você tem <strong>${points}</strong> ponto(s) de habilidade para gastar abaixo.</div>` : ""}

    <div class="ability-card-grid">
      ${cls.skills.map(skill => {
        const isKnown = known.includes(skill.name);
        const isLevelable = Array.isArray(skill.levels) && skill.levels.length > 1;
        const currentLevel = levels[skill.name] || 1;
        const maxLevel = isLevelable ? skill.levels.length : 1;
        const currentData = isLevelable ? skill.levels[currentLevel - 1] : skill;
        const canUpgrade = isKnown && isLevelable && currentLevel < maxLevel;

        return `
        <div class="ability-card ${isKnown ? "known" : "locked"}">
          <div class="ability-card-head">
            <span class="ability-card-name">${skill.name}</span>
            ${isKnown ? `<span class="ability-card-badge">Aprendida</span>` : ""}
          </div>
          ${isLevelable ? `
            <div class="ability-level-dots" title="Nível ${currentLevel} de ${maxLevel}">
              ${Array.from({ length: maxLevel }).map((_, i) => `<span class="ability-level-dot ${i < currentLevel ? "filled" : ""}"></span>`).join("")}
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

    <h4 class="learn-subtitle">Aprender Nova Perícia (com um NPC)</h4>
    <div class="learn-row">
      <select class="learn-select" id="learn-class-skill-select">
        <option value="">Perícia de classe...</option>
        ${learnableClass.map(s => `<option value="${s.name}">${s.name} (${s.attr})</option>`).join("")}
      </select>
      <button class="btn-secondary" id="btn-learn-class-skill">Aprender</button>
    </div>
    <div class="learn-row">
      <select class="learn-select" id="learn-general-skill-select">
        <option value="">Perícia geral...</option>
        ${learnableGeneral.map(s => `<option value="${s.name}">${s.name} (${s.attr})</option>`).join("")}
      </select>
      <button class="btn-secondary" id="btn-learn-general-skill">Aprender</button>
    </div>
    <div class="learn-row">
      <select class="learn-select" id="learn-combat-skill-select">
        <option value="">Perícia de combate...</option>
        ${SKILL_TESTS.filter(t => t.combat && !allKnown.includes(t.name)).map(t => `<option value="${t.name}">${t.name} (${t.attrKeys.join("+")})</option>`).join("")}
      </select>
      <button class="btn-secondary" id="btn-learn-combat-skill">Aprender</button>
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
  const allSpells = getAllSpellsInGame();
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
        ${usedSlots}/${totalSlots} slots
      </span>
    </h3>
    <p class="section-hint">Qualquer classe pode aprender qualquer magia através de grimórios. Equipe até <strong>${totalSlots} magia(s)</strong> nos slots disponíveis para que estejam em uso durante a aventura.</p>

    <div class="spell-card-grid">
      ${known.map(name => {
        const s = allSpells.find(x => x.name === name);
        if (!s) return "";
        const isSlow = s.castTime && !s.castTime.includes("instantânea") && !s.castTime.includes("1 Ação");
        const isActive = active.includes(name);
        const canEquip = !isActive && usedSlots < totalSlots;

        // Extrai dados mecânicos importantes do effect para destacar
        const dmgMatch = s.effect.match(/(\d+d\d+(?:\s*[+\-]\s*\d+d\d+)*)\s*de\s*dano/i);
        const healMatch = s.effect.match(/recupera\s+(\d+d\d+[^,.;]*(?:HP|vida))/i) || s.effect.match(/cura\s+(\d+d\d+[^,.;]*)/i);
        const rangeMatch = s.effect.match(/raio\s+(\d+(?:\s*hex)?)|alcance\s+(\d+(?:\s*hex)?)/i);
        const areaMatch = s.effect.match(/área\s+([\d]+x[\d]+(?:\s*hex)?)/i);
        const durationMatch = s.effect.match(/por\s+(\d+\s*rodadas?)/i) || s.effect.match(/por\s+(\d+\s*turnos?)/i);
        const isRestrictedCooldown = s.cooldown && (s.cooldown.includes("dia") || s.cooldown.includes("semana") || s.cooldown.includes("sessão"));

        const highlights = [
          dmgMatch   && `<span class="spell-hl spell-hl-dmg">⚔ ${dmgMatch[1]}</span>`,
          healMatch  && `<span class="spell-hl spell-hl-heal">💚 ${healMatch[1]}</span>`,
          areaMatch  && `<span class="spell-hl spell-hl-area">📐 ${areaMatch[1]}</span>`,
          rangeMatch && `<span class="spell-hl spell-hl-range">🎯 ${rangeMatch[1] || rangeMatch[2]}</span>`,
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
      }).join("")}
      ${known.length === 0 ? `<p class="empty-inline-note">Nenhuma magia conhecida ainda.</p>` : ""}
    </div>

    <h4 class="learn-subtitle">Aprender Nova Magia (em um grimório)</h4>
    <div class="learn-row">
      <select class="learn-select" id="learn-spell-select">
        <option value="">Selecione uma magia...</option>
        ${Object.keys(groups).map(origin => `
          <optgroup label="${origin}">
            ${groups[origin].map(s => `<option value="${s.name}">${s.name} (Nível ${s.level} · ${s.cooldown || "sem limite"})</option>`).join("")}
          </optgroup>
        `).join("")}
      </select>
      <button class="btn-secondary" id="btn-learn-spell">Aprender</button>
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
    <div class="equip-slot equip-slot-accessories ${equippedAccessories.length ? "filled" : ""}" style="grid-column: 1 / -1;">
      <div class="equip-slot-label">💍 Acessórios equipados</div>
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
  const allSpells = getAllSpellsInGame();

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
      const abilityName = btn.dataset.upgradeAbility;
      if (!character.skills.abilityLevels) character.skills.abilityLevels = {};
      const currentLevel = character.skills.abilityLevels[abilityName] || 1;
      if (currentLevel >= ABILITY_MAX_LEVEL) { showToast("Esta habilidade já está no nível máximo."); return; }
      character.skills.abilityLevels[abilityName] = currentLevel + 1;
      character.unspentSkillPoints -= 1;
      persistCurrentCharacter();
      renderSheet();
      showToast(`"${abilityName}" evoluiu para o Nível ${currentLevel + 1}!`);
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

  // Learn class skill
  const learnClassBtn = document.getElementById("btn-learn-class-skill");
  if (learnClassBtn) learnClassBtn.addEventListener("click", () => {
    const select = document.getElementById("learn-class-skill-select");
    const value = select.value;
    if (!value) { showToast("Selecione uma perícia para aprender."); return; }
    character.skills.class.push(value);
    persistCurrentCharacter();
    renderSheet();
    showToast(`Perícia "${value}" aprendida com um instrutor.`);
  });

  // Learn general skill
  const learnGeneralBtn = document.getElementById("btn-learn-general-skill");
  if (learnGeneralBtn) learnGeneralBtn.addEventListener("click", () => {
    const select = document.getElementById("learn-general-skill-select");
    const value = select.value;
    if (!value) { showToast("Selecione uma perícia para aprender."); return; }
    character.skills.general.push(value);
    persistCurrentCharacter();
    renderSheet();
    showToast(`Perícia "${value}" aprendida com um instrutor.`);
  });

  // Learn combat skill
  const learnCombatBtn = document.getElementById("btn-learn-combat-skill");
  if (learnCombatBtn) learnCombatBtn.addEventListener("click", () => {
    const select = document.getElementById("learn-combat-skill-select");
    const value = select.value;
    if (!value) { showToast("Selecione uma perícia de combate para aprender."); return; }
    // Perícias de combate ficam em skills.class para serem encontradas pelo sistema de testes
    character.skills.class.push(value);
    persistCurrentCharacter();
    renderSheet();
    showToast(`Perícia de Combate "${value}" aprendida!`);
  });

  // Learn spell
  const learnSpellBtn = document.getElementById("btn-learn-spell");
  if (learnSpellBtn) learnSpellBtn.addEventListener("click", () => {
    const select = document.getElementById("learn-spell-select");
    const value = select.value;
    if (!value) { showToast("Selecione uma magia para aprender."); return; }
    character.spells.push(value);
    persistCurrentCharacter();
    renderSheet();
    showToast(`Magia "${value}" aprendida em um grimório.`);
  });

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
    item.equippedSlot = "accessory";
    persistCurrentCharacter();
    renderSheet();
    showToast(`${item.name} equipado.`);
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
    const category = catalogCategorySelect.value;
    const itemName = document.getElementById("catalog-item-select").value;
    const qty = parseInt(document.getElementById("catalog-item-qty").value) || 1;
    const sourceItem = (WORLD_ITEM_CATALOG[category] || []).find(i => i.name === itemName);
    pendingWeight = sourceItem ? (sourceItem.weight || 0) * qty : 0;
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

const catalogCategorySelect = document.getElementById("catalog-category-select");
catalogCategorySelect.addEventListener("change", () => {
  populateCatalogItemSelect();
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

function populateCatalogItemSelect() {
  const category = catalogCategorySelect.value;
  const itemSelect = document.getElementById("catalog-item-select");
  const items = WORLD_ITEM_CATALOG[category] || [];
  itemSelect.innerHTML = items.map(i => {
    const rarityTag = i.rarity ? ` [${i.rarity}]` : "";
    return `<option value="${i.name}">${i.name}${i.weight !== undefined ? " · " + i.weight + "kg" : ""}${rarityTag}</option>`;
  }).join("");
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
    const category = catalogCategorySelect.value;
    const itemName = document.getElementById("catalog-item-select").value;
    const qty = parseInt(document.getElementById("catalog-item-qty").value) || 1;
    if (!itemName) { showToast("Selecione um item do compêndio."); return; }
    const sourceItem = (WORLD_ITEM_CATALOG[category] || []).find(i => i.name === itemName);
    if (!sourceItem) return;
    pendingWeight = (sourceItem.weight || 0) * qty;
    itemLabel = itemName;

    const carry = calcCarryCapacity(character);
    const currentWeight = calcTotalWeight(character);
    if (round1(currentWeight + pendingWeight) > carry) {
      const space = round1(carry - currentWeight);
      showToast(`Carga máxima excedida! Faltam ${pendingWeight - space < 0 ? 0 : round1(pendingWeight - space)}kg de espaço livre (${space > 0 ? space : 0}kg disponíveis).`);
      return;
    }

    const newItem = makeInventoryItem({ ...sourceItem, kind: category }, null);
    newItem.qty = qty;
    character.inventory.push(newItem);
    showToast(`${itemName} adicionado ao inventário.`);

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

/* --- Glossário de Habilidades (todas as classes) --- */

function renderAbilitiesGlossary(query) {
  let html = "";
  Object.keys(CLASSES).forEach(key => {
    const cls = CLASSES[key];
    const filtered = cls.skills.filter(s => !query || s.name.toLowerCase().includes(query) || s.effect.toLowerCase().includes(query));
    if (filtered.length === 0) return;
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
  return html;
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

  return Object.keys(groups).map(origin => {
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
  return html;
}

