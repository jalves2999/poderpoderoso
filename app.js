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
  return Math.min(18, Math.max(1, dodge));
}

/* Bônus de Cura: aplicado a magias/habilidades que curam "+SAB". O Clérigo dobra esse
   bônus (2×SAB) — para outras classes que aprendam magia de cura, vale o SAB normal. */
function calcHealingBonus(character) {
  const cls = getClassDef(character.classKey);
  const multiplier = (cls && cls.name === "Clérigo") ? 2 : 1;
  return getEffectiveAttr(character, "SAB") * multiplier;
}

/* ── Dado de Crítico ──────────────────────────────────────────────
   Regra: todo personagem joga 1d10 junto com o dado de acerto.
   Se o resultado for IGUAL OU MENOR que a Chance de Crítico → crítico!
   Base: 1 (acerto somente no 1 natural).
   Bônus de SAB: +1 por cada 4 pontos completos de SAB.
   Ex: SAB 0→4 = chance 1, SAB 4→7 = chance 2, SAB 8→11 = chance 3.
   Itens mágicos podem adicionar mais pontos via magicBonus.critChance.
   Dano crítico: +50% do dano total final (após subtrair defesa).
   Itens mágicos podem adicionar mais % via magicBonus.critDamage (em %).
   ────────────────────────────────────────────────────────────────── */
function calcCritChance(character) {
  const sab       = getEffectiveAttr(character, "SAB");
  const fromSAB   = Math.floor(sab / 4);  // +1 a cada 4 SAB
  // Bônus de itens mágicos equipados
  const fromItems = sumMagicItemBonus(character, "critChance")
                  + sumAccessoryEffectValue(character, "critChance");
  return 1 + fromSAB + fromItems;   // mínimo 1
}

/* Bônus de dano crítico acima dos 50% base (em %) */
function calcCritDamageBonus(character) {
  const fromItems = sumMagicItemBonus(character, "critDamage")
                  + sumAccessoryEffectValue(character, "critDamage");
  return 50 + fromItems;   // base 50%, itens podem adicionar mais
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
  // Escudos não somam Def. Física — sua vantagem é manter a chance de defesa
  // sem o custo de redução por uso repetido (esquivas subsequentes).
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
  const mountIds = new Set((character.mount?.storedItems || []).map(id => id));
  character.inventory.forEach(item => {
    if (!mountIds.has(item.instanceId)) {
      total += (item.weight || 0) * (item.qty || 1);
    }
  });
  return Math.max(0, round1(total));
}

function calcMountWeight(character) {
  if (!character.mount) return 0;
  const mountIds = new Set((character.mount.storedItems || []));
  let total = 0;
  character.inventory.forEach(item => {
    if (mountIds.has(item.instanceId)) total += (item.weight || 0) * (item.qty || 1);
  });
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

/* Requisito normal: ter pelo menos 1 ponto no atributo.
   Requisito alto ("alto"/"alta"): ter pelo menos 3 pontos no atributo. */
const REQ_THRESHOLD_NORMAL = 1;
const REQ_THRESHOLD_HIGH   = 3;

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

/* Formata o campo req para exibição legível ao jogador.
   "FOR"      → "FOR ≥ 1"
   "FOR alto" → "FOR ≥ 3"
   "FOR/DEX"  → "FOR ≥ 1 ou DEX ≥ 1"  */
function formatReq(reqText) {
  if (!reqText || reqText === "—") return "—";
  if (reqText === "qualquer") return "Qualquer atributo";
  const isHigh  = /alto|alta/i.test(reqText);
  const min     = isHigh ? REQ_THRESHOLD_HIGH : REQ_THRESHOLD_NORMAL;
  const cleaned = reqText.replace(/\s*(alto|alta|\(alto\)|\(alta\))/gi, "").trim();
  const attrs   = cleaned.split(/[/,\s]+/).filter(a => ATTRS.includes(a.toUpperCase())).map(a => a.toUpperCase());
  if (attrs.length === 0) return reqText;
  return attrs.map(a => `${a} ≥ ${min}`).join(" ou ");
}
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

  // Só mostra subclasses com sinergia com a classe atual + a pura da classe
  const available = Object.entries(SUBCLASSES).filter(([key, sc]) =>
    sc.sinergyClasses.includes(classKey) || key === classKey + "-puro"
  );

  choiceRow.innerHTML = available.map(([key, sc]) => {
    const isPuro   = key === classKey + "-puro";
    const isChosen = wizard.subclass === key;
    return `
      <div class="choice-card ${isChosen ? "selected" : ""} ${isPuro ? "choice-card-puro" : "choice-card-synergy"}"
           data-subclass="${key}">
        <div class="choice-icon">${sc.icon}</div>
        <div class="choice-name">${sc.name}</div>
        <div class="${isPuro ? "choice-puro-badge" : "choice-synergy-badge"}">${isPuro ? "⭐ Puro" : "✨ Sinergia"}</div>
      </div>`;
  }).join("");

  // Resetar subclasse se a atual não é mais válida para esta classe
  if (wizard.subclass && !available.find(([k]) => k === wizard.subclass)) {
    wizard.subclass = null;
    wizard.subclassSkills = [];
  }

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
  const weapon = ALL_WEAPONS.find(w => w && w.name === name);
  if (weapon) return { ...weapon, kind: "weapon" };
  const shield = SHIELDS.find(s => s && s.name === name);
  if (shield) return { ...shield, kind: "shield" };
  const armor = ARMORS.find(a => a && a.name === name);
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

  const isStarterEligible = i => i && i.name && (!i.tier || i.tier === "comum") && !i.setName;
  const allOptions = [
    ...ALL_WEAPONS.filter(isStarterEligible).map(w => ({ ...w, kind: "weapon" })),
    ...SHIELDS.filter(isStarterEligible).map(s => ({ ...s, kind: "shield" })),
    ...ARMORS.filter(isStarterEligible).map(a => ({ ...a, kind: "armor" })),
    ...STARTER_GEAR.map(g => ({ ...g, kind: "gear" }))
  ];

  allOptions.forEach(opt => {
    const selected = wizard.equipment.some(e => e.name === opt.name);
    const reqTag    = opt.kind === "weapon" && opt.req ? ` [${formatReq(opt.req)}]` : "";
    const metaLabel = opt.kind === "weapon"
      ? `${opt.dmg || "—"}${opt.req ? " · req. " + formatReq(opt.req) : ""} · ${opt.weight}kg`
      : opt.kind === "armor"  ? `Def. Física ${opt.physDefense} · ${opt.weight}kg`
      : opt.kind === "shield" ? `Escudo · ${opt.penalty && opt.penalty !== "Nenhuma" ? opt.penalty + " · " : ""}${opt.weight}kg`
      : `Item geral · ${opt.weight || 0}kg`;
    const displayName = opt.name + reqTag;
    const item = buildPickItem(displayName, metaLabel, opt.note || "", selected, () => {
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

/* ════════════════════════════════════════════════════════════════
   GERADOR RÁPIDO DE NPC
   O usuário informa apenas nome e origem (e opcionalmente nível,
   classe e tipo de loja). Tudo o mais — atributos, habilidades,
   equipamento, dinheiro e itens à venda — é sorteado a partir
   do compêndio (data.js), coerente com o nível gerado.
   ════════════════════════════════════════════════════════════════ */

function openQuickNpcModal() {
  document.getElementById("qnpc-name").value = "";
  document.getElementById("qnpc-origin").value = "";
  document.getElementById("qnpc-level").value = "random";
  document.getElementById("qnpc-class").value = "random";
  document.getElementById("qnpc-shop").value = "none";
  document.getElementById("quick-npc-modal-overlay").classList.remove("hidden");
  setTimeout(() => document.getElementById("qnpc-name").focus(), 50);
}

function closeQuickNpcModal() {
  document.getElementById("quick-npc-modal-overlay").classList.add("hidden");
}

document.getElementById("btn-quick-npc")?.addEventListener("click", openQuickNpcModal);
document.getElementById("qnpc-cancel")?.addEventListener("click", closeQuickNpcModal);
document.getElementById("qnpc-generate")?.addEventListener("click", generateQuickNpc);

/* Faixa de tier de item disponível por nível de personagem */
function tierRangeForLevel(level) {
  if (level <= 2)  return ["comum"];
  if (level <= 4)  return ["comum", "raro"];
  if (level <= 6)  return ["raro", "magico"];
  if (level <= 8)  return ["magico", "lendario"];
  return ["lendario", "unico"];
}

/* Dinheiro coerente com o nível — mais alto, mais rico */
function rollCurrencyForLevel(level) {
  const base = level * (5 + Math.floor(Math.random() * 8));
  return {
    bronze: Math.floor(Math.random() * 10),
    prata:  Math.floor(base * 0.6) + Math.floor(Math.random() * 5),
    ouro:   level >= 3 ? Math.floor(base / 10) + Math.floor(Math.random() * 3) : 0,
    platina: level >= 8 ? Math.floor(Math.random() * 2) : 0,
  };
}

/* Distribui pontos de atributo de forma realista para um NPC de nível N,
   priorizando o atributo principal da classe. */
function rollAttrsForLevel(classKey, level) {
  const cls = getClassDef(classKey);
  const totalPoints = level + 2; // progressão similar à do wizard normal
  const attrs = { FOR:0, DEX:0, AGI:0, INT:0, SAB:0 };
  const priority = {
    guerreiro: ["FOR","AGI","SAB","DEX","INT"],
    mago:      ["INT","SAB","DEX","AGI","FOR"],
    arqueiro:  ["DEX","AGI","SAB","INT","FOR"],
    ladino:    ["DEX","AGI","INT","SAB","FOR"],
    clerigo:   ["SAB","INT","FOR","DEX","AGI"],
  }[classKey] || ["FOR","DEX","AGI","INT","SAB"];

  let remaining = totalPoints;
  let idx = 0;
  while (remaining > 0) {
    const weight = idx < 2 ? 2 : 1; // primeiros 2 atributos da prioridade recebem o dobro de chance
    const attr = priority[Math.min(idx % priority.length, priority.length - 1)];
    const give = Math.min(remaining, weight);
    attrs[attr] += give;
    remaining -= give;
    idx++;
    if (idx > 30) break; // segurança
  }
  return attrs;
}

/* Sorteia itens equipáveis (arma + armadura, e escudo se a classe combinar) coerentes com nível */
function rollEquipmentForLevel(classKey, level) {
  const tiers = tierRangeForLevel(level);
  const weaponPool = classKey === "guerreiro"
    ? [...ALL_WEAPONS]
    : classKey === "mago"
    ? WEAPONS_MAGIC.length ? WEAPONS_MAGIC.filter(Boolean) : ALL_WEAPONS
    : classKey === "arqueiro"
    ? WEAPONS_RANGED.filter(Boolean)
    : ALL_WEAPONS;

  const filteredWeapons = weaponPool.filter(Boolean).filter(w => tiers.includes(w.tier || "comum"));
  const armorPool = ARMORS.filter(Boolean).filter(a => tiers.includes(a.tier || "comum"));

  const equipment = [];
  if (filteredWeapons.length) {
    const w = filteredWeapons[Math.floor(Math.random() * filteredWeapons.length)];
    equipment.push({ ...w, kind: "weapon" });
  }
  if (armorPool.length && Math.random() < 0.8) {
    const a = armorPool[Math.floor(Math.random() * armorPool.length)];
    equipment.push({ ...a, kind: "armor" });
  }
  if (classKey === "guerreiro" && Math.random() < 0.4) {
    const shields = SHIELDS.filter(Boolean).filter(s => tiers.includes(s.tier || "comum"));
    if (shields.length) equipment.push({ ...shields[Math.floor(Math.random() * shields.length)], kind: "shield" });
  }
  return equipment;
}

/* Sorteia 1-3 acessórios coerentes com nível para o inventário (não equipados) */
function rollAccessoriesForLevel(level) {
  const tiers = tierRangeForLevel(level);
  const pool = ACCESSORIES.filter(Boolean).filter(a => tiers.includes(a.tier || "comum"));
  if (!pool.length) return [];
  const qty = 1 + Math.floor(Math.random() * 2);
  const picked = [];
  for (let i = 0; i < qty && pool.length; i++) {
    picked.push({ ...pool[Math.floor(Math.random() * pool.length)], kind: "accessory" });
  }
  return picked;
}

/* Monta o estoque de uma loja, coerente com o nível do NPC dono */
function rollShopStock(shopType, level) {
  const tiers = tierRangeForLevel(level);
  const priceByTier = { comum: "5-15 prata", raro: "1-3 ouro", magico: "5-10 ouro", lendario: "20-50 ouro", unico: "80+ ouro" };
  const stock = [];

  if (shopType === "armas") {
    const pool = [...WEAPONS_ONE_HAND, ...WEAPONS_TWO_HAND, ...ARMORS, ...ACCESSORIES, ...SHIELDS]
      .filter(Boolean).filter(i => tiers.includes(i.tier || "comum"));
    const qty = 4 + Math.floor(Math.random() * 5);
    for (let i = 0; i < qty && pool.length; i++) {
      const item = pool[Math.floor(Math.random() * pool.length)];
      stock.push({ name: item.name, tier: item.tier || "comum", price: priceByTier[item.tier || "comum"] });
    }
  } else if (shopType === "magias") {
    const maxLv = Math.min(5, Math.ceil(level / 2));
    const pool = GENERAL_SPELLS.filter(s => s.level <= maxLv);
    const qty = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < qty && pool.length; i++) {
      const spell = pool[Math.floor(Math.random() * pool.length)];
      stock.push({ name: spell.name, tier: `Nível ${spell.level}`, price: `${spell.level * 15}-${spell.level * 25} prata` });
    }
  } else if (shopType === "pocoes") {
    const pool = MISC_ITEMS.filter(Boolean).filter(i =>
      (i.subcategory === "potion" || i.craftingMaterial || i.smithingMaterial) &&
      tiers.includes(i.tier || "comum"));
    const qty = 4 + Math.floor(Math.random() * 5);
    for (let i = 0; i < qty && pool.length; i++) {
      const item = pool[Math.floor(Math.random() * pool.length)];
      stock.push({ name: item.name, tier: item.tier || "comum", price: priceByTier[item.tier || "comum"] });
    }
  } else if (shopType === "pericias") {
    const allSkills = [
      ...GENERAL_SKILLS.map(s => ({ name: s.name, attr: s.attr, cat: "Geral" })),
      ...Object.entries(CLASSES).flatMap(([key, c]) =>
        (c.skillsClass || []).map(s => ({ name: s.name, attr: s.attr, cat: c.name })))
    ];
    const qty = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < qty && allSkills.length; i++) {
      const s = allSkills[Math.floor(Math.random() * allSkills.length)];
      stock.push({ name: s.name, tier: `${s.cat} · ${s.attr}`, price: `${10 + level * 5}-${20 + level * 8} prata` });
    }
  }
  return stock;
}

function generateQuickNpc() {
  const name = document.getElementById("qnpc-name").value.trim();
  if (!name) { showToast("Digite um nome para o NPC."); return; }
  const origin = document.getElementById("qnpc-origin").value.trim();

  const levelSel = document.getElementById("qnpc-level").value;
  const level = levelSel === "random" ? (1 + Math.floor(Math.random() * 10)) : parseInt(levelSel);

  const classSel = document.getElementById("qnpc-class").value;
  const classKeys = Object.keys(CLASSES);
  const classKey = classSel === "random" ? classKeys[Math.floor(Math.random() * classKeys.length)] : classSel;

  let shopSel = document.getElementById("qnpc-shop").value;
  if (shopSel === "random") {
    const options = ["none", "none", "none", "armas", "magias", "pocoes", "pericias"]; // 3/7 chance de não ter loja
    shopSel = options[Math.floor(Math.random() * options.length)];
  }

  const cls = getClassDef(classKey);
  const attrs = rollAttrsForLevel(classKey, level);
  const equipment = rollEquipmentForLevel(classKey, level);
  const accessories = rollAccessoriesForLevel(level);
  const currency = rollCurrencyForLevel(level);

  // Perícias: 1 geral + 1 de classe, sorteadas
  const generalSkill = GENERAL_SKILLS[Math.floor(Math.random() * GENERAL_SKILLS.length)];
  const classSkillPool = cls.skillsClass || [];
  const classSkill = classSkillPool.length ? classSkillPool[Math.floor(Math.random() * classSkillPool.length)] : null;

  // Habilidade de classe inicial (a primeira, como no wizard normal)
  const startAbility = cls.skills && cls.skills.length > 0 ? cls.skills[0] : null;

  // Magia inicial se for classe conjuradora
  const isCaster = classKey === "mago" || classKey === "clerigo";
  const maxSpellLv = Math.min(5, Math.ceil(level / 2));
  const spellPool = GENERAL_SPELLS.filter(s => s.level <= maxSpellLv);
  const startSpell = isCaster && spellPool.length ? spellPool[Math.floor(Math.random() * spellPool.length)].name : null;

  const finalAttrs = { ...attrs };
  if (cls.startBonusAttr) finalAttrs[cls.startBonusAttr] = (finalAttrs[cls.startBonusAttr] || 0) + 1;

  const character = {
    id: uid(),
    rosterType: "npc",
    name, origin,
    classKey, subclassKey: null,
    level, xp: 0,
    unspentAttrPoints: 0, unspentSkillPoints: 0,
    attrs: finalAttrs,
    currentHP: null, currentResource: 0,
    skills: {
      class: [generalSkill.name, ...(classSkill ? [classSkill.name] : [])],
      general: [generalSkill.name],
      abilities: startAbility ? [startAbility.name] : [],
      abilityLevels: startAbility ? { [startAbility.name]: 1 } : {},
    },
    spells: startSpell ? [startSpell] : [],
    activeSpells: [],
    inventory: [],
    notes: "",
    createdAt: Date.now(),
    currency,
  };

  // Equipar arma/armadura/escudo sorteados
  let primaryTaken = false, shieldTaken = false, armorTaken = false;
  equipment.forEach(item => {
    let equippedSlot = null;
    if (item.kind === "weapon" && !primaryTaken) { equippedSlot = "primary"; primaryTaken = true; }
    else if (item.kind === "shield" && !shieldTaken) { equippedSlot = "shield"; shieldTaken = true; }
    else if (item.kind === "armor" && !armorTaken) { equippedSlot = "armor"; armorTaken = true; }
    character.inventory.push(makeInventoryItem(item, equippedSlot));
  });
  // Acessórios não equipados
  accessories.forEach(item => character.inventory.push(makeInventoryItem(item, null)));

  character.currentHP = calcMaxHP(character);

  // Loja, se aplicável
  if (shopSel && shopSel !== "none") {
    character.shopType = shopSel;
    character.shopStock = rollShopStock(shopSel, level);
  }

  characters.push(character);
  saveCharacters(characters);
  closeQuickNpcModal();
  showToast(`🎲 ${name} foi gerado — Nv.${level} ${cls.name}${character.shopType ? " (com loja)" : ""}!`);
  renderCharacterList();
}


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
  if (category === "weapon")    baseData = ALL_WEAPONS.filter(Boolean).find(w => w.name === sourceItem.name) || null;
  if (category === "shield")    baseData = SHIELDS.filter(Boolean).find(s => s.name === sourceItem.name) || null;
  if (category === "armor")     baseData = ARMORS.filter(Boolean).find(a => a.name === sourceItem.name) || null;
  if (category === "accessory") baseData = ACCESSORIES.filter(Boolean).find(a => a.name === sourceItem.name) || null;

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
      <h3 class="char-card-name">
        <button class="char-name-link" data-char-preview="${character.id}">${escapeHTML(character.name)}</button>
      </h3>
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
      <div class="char-card-btns">
        <button class="char-btn-preview" data-char-preview="${character.id}" title="Ver resumo rápido">📋 Resumo</button>
        <button class="char-btn-sheet"   data-char-sheet="${character.id}"   title="Abrir ficha completa">📄 Ficha</button>
      </div>
    `;

    // Clique no card (fora dos botões) → resumo
    card.addEventListener("click", (e) => {
      if (e.target.closest(".char-card-delete")) return;
      if (e.target.closest(".char-btn-preview")) return;
      if (e.target.closest(".char-btn-sheet"))   return;
      if (e.target.closest(".char-name-link"))   return;
      openCharPreviewModal(character.id);
    });

    // Nome → resumo
    card.querySelector(".char-name-link").addEventListener("click", (e) => {
      e.stopPropagation();
      openCharPreviewModal(character.id);
    });

    // Botão 📋 Resumo
    card.querySelector(".char-btn-preview").addEventListener("click", (e) => {
      e.stopPropagation();
      openCharPreviewModal(character.id);
    });

    // Botão 📄 Ficha
    card.querySelector(".char-btn-sheet").addEventListener("click", (e) => {
      e.stopPropagation();
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

/* ── Modal de Resumo de Personagem ──────────────────────────── */

function openCharPreviewModal(id) {
  const character = findCharacter(id);
  if (!character) return;
  const overlay = document.getElementById("char-preview-overlay");
  const box     = document.getElementById("char-preview-box");
  if (!overlay || !box) return;

  const cls      = getClassDef(character.classKey);
  const sc       = character.subclassKey ? (typeof SUBCLASSES !== "undefined" ? SUBCLASSES[character.subclassKey] : null) : null;
  const maxHP    = calcMaxHP(character);
  const resMax   = calcResourceMax(character);
  const carry    = calcCarryCapacity(character);
  const weight   = calcTotalWeight(character);
  const move     = calcMovement(character);
  const actions  = calcActions(character);
  const spells   = calcSpellActions(character);
  const slots    = calcSpellSlots(character);
  const physDef  = calcPhysicalDefense(character);
  const magDef   = calcMagicDefense(character);
  const dmg      = calcDamageBreakdown(character);

  const hpPct  = clamp((character.currentHP / maxHP) * 100, 0, 100);
  const resPct = clamp((character.currentResource / resMax) * 100, 0, 100);
  const xpPct  = clamp((character.xp / xpToNextLevel(character)) * 100, 0, 100);

  // Atributos
  const ATTR_ICONS = { FOR:"💪", DEX:"🎯", AGI:"⚡", INT:"🧠", SAB:"🔮" };
  const attrsHTML = ["FOR","DEX","AGI","INT","SAB"].map(a => `
    <div class="cpv-attr">
      <span class="cpv-attr-icon">${ATTR_ICONS[a]}</span>
      <span class="cpv-attr-label">${a}</span>
      <span class="cpv-attr-val">${character.attrs?.[a] ?? 0}</span>
    </div>`).join("");

  // Equipados
  const equip = [
    { slot:"primary",   label:"⚔" },
    { slot:"secondary", label:"⚔" },
    { slot:"shield",    label:"🛡" },
    { slot:"armor",     label:"🧥" },
  ].map(s => {
    const item = character.inventory?.find(i => i.equippedSlot === s.slot);
    return item ? `<span class="cpv-equip-item">${s.label} ${escapeHTML(item.name)}</span>` : null;
  }).filter(Boolean);
  const accessories = character.inventory?.filter(i => i.equippedSlot === "accessory") || [];
  accessories.forEach(a => equip.push(`<span class="cpv-equip-item">💍 ${escapeHTML(a.name)}</span>`));

  // Magias equipadas
  const knownSpells = (character.spells || []).slice(0, 5);

  // Maldições/Bênçãos
  const ALL_CB = [
    ...(typeof CURSES   !== "undefined" ? CURSES   : []).map(c=>({...c,type:"curse"})),
    ...(typeof BLESSINGS!== "undefined" ? BLESSINGS: []).map(b=>({...b,type:"blessing"})),
  ];
  const activeCB = (character.activeCurses || []).map(id => ALL_CB.find(x=>x.id===id)).filter(Boolean);

  // Montaria
  const mountData = character.mount
    ? (typeof MOUNTS !== "undefined" ? MOUNTS : []).find(m => m.id === character.mount.id)
    : null;

  box.innerHTML = `
    <div class="cpv-header">
      <div class="cpv-icon">${cls ? cls.icon : "?"}</div>
      <div class="cpv-header-info">
        <h2 class="cpv-name">${escapeHTML(character.name)}</h2>
        <div class="cpv-sub">
          ${cls ? cls.name : "Sem classe"}${sc ? ` · ${sc.icon} ${sc.name}` : ""}${character.origin ? ` · ${escapeHTML(character.origin)}` : ""}
        </div>
        <div class="cpv-level">Nível ${character.level} · ${character.rosterType === "pc" ? "Personagem Jogador" : "NPC"}</div>
      </div>
      <button class="idd-close-btn" id="char-preview-close">✕</button>
    </div>

    <div class="cpv-body">

      <!-- Barras vitais -->
      <div class="cpv-bars">
        <div class="cpv-bar-row">
          <span class="cpv-bar-label">❤ PV</span>
          <div class="carry-meter-track"><div class="carry-meter-fill hp" style="width:${hpPct}%"></div></div>
          <span class="cpv-bar-val">${character.currentHP}/${maxHP}</span>
        </div>
        ${cls ? `
        <div class="cpv-bar-row">
          <span class="cpv-bar-label">${cls.resourceIcon||"🔵"} ${cls.resource||"Recurso"}</span>
          <div class="carry-meter-track"><div class="carry-meter-fill" style="width:${resPct}%;background:rgba(60,100,180,0.65)"></div></div>
          <span class="cpv-bar-val">${character.currentResource}/${resMax}</span>
        </div>` : ""}
        <div class="cpv-bar-row">
          <span class="cpv-bar-label">✨ XP</span>
          <div class="carry-meter-track"><div class="carry-meter-fill xp" style="width:${xpPct}%"></div></div>
          <span class="cpv-bar-val">${character.xp}/${xpToNextLevel(character)}</span>
        </div>
      </div>

      <!-- Atributos -->
      <div class="cpv-attrs">${attrsHTML}</div>

      <!-- Stats de combate -->
      <div class="cpv-stats-grid">
        <div class="cpv-stat"><span class="cpv-stat-icon">🛡</span><span class="cpv-stat-label">Def.Física</span><strong>${physDef}</strong></div>
        <div class="cpv-stat"><span class="cpv-stat-icon">✨</span><span class="cpv-stat-label">Def.Mágica</span><strong>${magDef}</strong></div>
        <div class="cpv-stat"><span class="cpv-stat-icon">⚡</span><span class="cpv-stat-label">Ações</span><strong>${actions}</strong></div>
        <div class="cpv-stat"><span class="cpv-stat-icon">🔮</span><span class="cpv-stat-label">Ações Magia</span><strong>${spells}</strong></div>
        <div class="cpv-stat"><span class="cpv-stat-icon">🏃</span><span class="cpv-stat-label">Movimento</span><strong>${move}</strong></div>
        <div class="cpv-stat"><span class="cpv-stat-icon">🎒</span><span class="cpv-stat-label">Carga</span><strong>${weight}/${carry}kg</strong></div>
        ${slots > 0 ? `<div class="cpv-stat"><span class="cpv-stat-icon">📖</span><span class="cpv-stat-label">Slots</span><strong>${character.usedSlots||0}/${slots}</strong></div>` : ""}
      </div>

      <!-- Dano -->
      ${(() => {
        const combined = buildCombinedDamageString(dmg);
        if (!combined || combined === "—") return "";
        return `
        <div class="cpv-section">
          <div class="cpv-section-label">⚔ Dano Total de Ataque</div>
          <div class="cpv-damage-combined">${combined}</div>
          <div class="cpv-damage-sources">
            ${dmg.sources.filter(s => s.dice && s.dice !== "—").map(s => `
              <div class="cpv-damage-row">
                <span class="cpv-damage-label">${s.label}</span>
                <span class="cpv-damage-dice">${s.dice}${s.bonus ? ` +${s.bonus}` : ""}</span>
              </div>`).join("")}
            ${dmg.totalFixedBonus > 0 ? `
              <div class="cpv-damage-row">
                <span class="cpv-damage-label">Bônus fixo total</span>
                <span class="cpv-damage-dice">+${dmg.totalFixedBonus}</span>
              </div>` : ""}
          </div>
        </div>`;
      })()}

      <!-- Equipamento -->
      ${equip.length ? `
      <div class="cpv-section">
        <div class="cpv-section-label">Equipamento</div>
        <div class="cpv-equip-list">${equip.join("")}</div>
      </div>` : ""}

      <!-- Perícias -->
      ${(character.skills?.class||[]).length || (character.skills?.general||[]).length ? `
      <div class="cpv-section">
        <div class="cpv-section-label">Perícias</div>
        <div class="cpv-tags">
          ${[...(character.skills.class||[]),...(character.skills.general||[])].map(s=>`<span class="cpv-tag">${s}</span>`).join("")}
        </div>
      </div>` : ""}

      <!-- Magias conhecidas (primeiras 5) -->
      ${knownSpells.length ? `
      <div class="cpv-section">
        <div class="cpv-section-label">Magias${(character.spells||[]).length > 5 ? ` (${(character.spells||[]).length} total — mostrando 5)` : ""}</div>
        <div class="cpv-tags">
          ${knownSpells.map(s=>`<span class="cpv-tag">${s}</span>`).join("")}
        </div>
      </div>` : ""}

      <!-- Maldições e Bênçãos -->
      ${activeCB.length ? `
      <div class="cpv-section">
        <div class="cpv-section-label">Condições Ativas</div>
        <div class="cpv-tags">
          ${activeCB.map(cb=>`<span class="cpv-tag ${cb.type==="curse"?"cpv-tag-curse":"cpv-tag-bless"}">${cb.icon} ${cb.name}</span>`).join("")}
        </div>
      </div>` : ""}

      <!-- Testes de Perícia -->
      ${(() => {
        const nonCombat = (typeof SKILL_TESTS !== "undefined" ? SKILL_TESTS : []).filter(t => !t.combat);
        if (!nonCombat.length) return "";
        const rows = nonCombat.map(test => {
          const { normal, hard, critical, hasSkill } = calcSkillTest(character, test);
          return `
            <div class="cpv-skill-row ${hasSkill ? "cpv-skill-trained" : ""}">
              <span class="cpv-skill-icon">${test.icon}</span>
              <span class="cpv-skill-name">${test.name}${hasSkill ? `<span class="cpv-skill-plus">+2</span>` : ""}</span>
              <span class="cpv-skill-n" title="Normal">N<strong>${normal}</strong></span>
              <span class="cpv-skill-d" title="Difícil">D<strong>${hard}</strong></span>
              <span class="cpv-skill-c" title="Crítico">C<strong>${critical}</strong></span>
            </div>`;
        }).join("");
        return `
        <div class="cpv-section">
          <div class="cpv-section-label">Testes de Perícia <span style="font-weight:400;text-transform:none;letter-spacing:0">— role 1d20 abaixo do valor</span></div>
          <div class="cpv-skills-grid">${rows}</div>
        </div>`;
      })()}

      ${mountData ? `
      <div class="cpv-section">
        <div class="cpv-section-label">Montaria</div>
        <div class="cpv-mount-row">
          <span class="cpv-mount-icon">${mountData.icon}</span>
          <span class="cpv-mount-name">${mountData.name}</span>
          <span class="cpv-mount-speed">⚡ ${mountData.speed} hex</span>
          <span class="cpv-mount-carry">📦 ${calcMountWeight(character)}/${mountData.carryKg}kg</span>
        </div>
      </div>` : ""}

    </div>

    <div class="cpv-footer">
      <button class="btn-secondary" id="char-preview-close-footer">Fechar</button>
      <button class="btn-primary" id="char-preview-open-sheet">Abrir Ficha Completa →</button>
    </div>`;

  overlay.classList.remove("hidden");

  const close = () => overlay.classList.add("hidden");
  document.getElementById("char-preview-close")?.addEventListener("click", close);
  document.getElementById("char-preview-close-footer")?.addEventListener("click", close);
  document.getElementById("char-preview-open-sheet")?.addEventListener("click", () => {
    close();
    openCharacterSheet(id);
  });
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); }, { once: true });
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


function openBestiary()       { window.open("bestiary.html",         "_blank"); }
function openCraft()          { window.open("craft.html",             "_blank"); }
function openSessionPlanner() { window.open("session-planner.html",   "_blank"); }
function openPrintSheet()     { window.open("ficha-impressa.html",    "_blank"); }
function openCombatNotes()    { window.open("anotacoes-combate.html", "_blank"); }
function openItems()       { window.open("items.html",       "_blank"); }
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
  } else if (currentGlossaryTab === "skills") {
    container.innerHTML = renderSkillsGlossary(query);
  } else if (currentGlossaryTab === "curses") {
    container.innerHTML = renderCursesGlossary(query);
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

/* --- Aba de Perícias --- */

function renderSkillsGlossary(query = "") {
  const allSkills = typeof SKILL_TESTS !== "undefined" ? SKILL_TESTS : [];
  const gerais  = allSkills.filter(s => !s.combat);
  const combate = allSkills.filter(s =>  s.combat);

  const q = query.toLowerCase();
  const match = s => !q ||
    s.name.toLowerCase().includes(q) ||
    (s.desc||"").toLowerCase().includes(q) ||
    (s.combatDesc||"").toLowerCase().includes(q) ||
    (s.example||"").toLowerCase().includes(q);

  /* — Grupos temáticos das perícias gerais — */
  const GROUPS = [
    { label: "👁 Sentidos e Percepção",  names: ["Percepção","Pressentimento","Investigação"] },
    { label: "📚 Conhecimento",           names: ["Conhecimento","Arcanismo"] },
    { label: "🗣 Social e Influência",    names: ["Lábia","Persuasão","Intimidação"] },
    { label: "🌑 Furtividade e Destreza", names: ["Furtividade","Acrobacia","Prestidigitação"] },
    { label: "💪 Físico e Resistência",   names: ["Atletismo","Resistência","Força de Vontade","Briga"] },
  ];

  /* — Grupos temáticos das perícias de combate — */
  const COMBAT_GROUPS = [
    { label: "⚡ Geral",              names: ["Retaliar","Esquivar Rolar","Foco de Combate","Guardião de Flanco"] },
    { label: "🗡 Armas de 1 Mão",    names: ["Desarmamento","Duelista"] },
    { label: "⚔ Armas de 2 Mãos",   names: ["Defesa com Armas Pesadas","Varredura","Ímpeto Brutal"] },
    { label: "🛡 Escudo",             names: ["Escudo Bash","Muralha Viva"] },
    { label: "🏹 Distância",          names: ["Tiro em Movimento","Pressão de Distância","Tiro Preciso"] },
    { label: "✨ Magia e Conjuração", names: ["Conjuração Rápida","Canalizar pelo Cajado","Foco Ampliado"] },
  ];

  const buildCard = (s) => {
    const attrBadges = (s.attrKeys||[]).map(a =>
      `<span class="skill-attr-badge">${a}</span>`).join("");
    const learnedBadge = s.learned !== false
      ? `<span class="skill-badge skill-badge-learned">Aprendível</span>`
      : `<span class="skill-badge skill-badge-passive">Passiva</span>`;
    const combatBadge = s.combat
      ? `<span class="skill-badge skill-badge-combat">Combate</span>`
      : "";
    return `
      <div class="skill-gloss-card ${s.combat?"skill-gloss-card-combat":""}">
        <div class="skill-gloss-head">
          <span class="skill-gloss-icon">${s.icon||"🎯"}</span>
          <div class="skill-gloss-title-col">
            <span class="skill-gloss-name">${s.name}</span>
            <div class="skill-gloss-badges">${attrBadges}${learnedBadge}${combatBadge}</div>
          </div>
        </div>
        <p class="skill-gloss-desc">${s.desc||""}</p>
        ${s.combat && s.combatDesc ? `
          <div class="skill-gloss-mechanic">
            <span class="skill-gloss-mech-label">⚙ Mecânica</span>
            <span>${s.combatDesc}</span>
          </div>` : ""}
        ${s.example ? `
          <div class="skill-gloss-example">
            <span class="skill-gloss-ex-label">📖 Exemplo</span>
            <span>${s.example}</span>
          </div>` : ""}
      </div>`;
  };

  const buildGroup = (group, sourceList) => {
    const skills = group.names
      .map(n => sourceList.find(s => s.name === n))
      .filter(Boolean)
      .filter(match);
    if (!skills.length) return "";
    return `
      <div class="skill-gloss-group">
        <h4 class="skill-gloss-group-title">${group.label}</h4>
        <div class="skill-gloss-cards">${skills.map(buildCard).join("")}</div>
      </div>`;
  };

  /* — Calcula fórmula para exibição — */
  const formulaHTML = `
    <div class="skill-gloss-formula-box">
      <div class="skill-gloss-formula-title">📐 Como calcular um Teste de Perícia Geral</div>
      <div class="skill-gloss-formula-grid">
        <div class="skill-gloss-formula-item">
          <span class="sfg-label">Base</span>
          <span class="sfg-val">10</span>
          <span class="sfg-note">sempre</span>
        </div>
        <span class="sfg-op">+</span>
        <div class="skill-gloss-formula-item">
          <span class="sfg-label">Atributos</span>
          <span class="sfg-val">+X</span>
          <span class="sfg-note">soma dos atributos indicados</span>
        </div>
        <span class="sfg-op">+</span>
        <div class="skill-gloss-formula-item">
          <span class="sfg-label">Aprendida</span>
          <span class="sfg-val">+2</span>
          <span class="sfg-note">se tiver a perícia aprendida</span>
        </div>
        <span class="sfg-op">=</span>
        <div class="skill-gloss-formula-item sfg-result">
          <span class="sfg-label">Normal</span>
          <span class="sfg-val">10+X+2</span>
          <span class="sfg-note">rolar d20 abaixo = sucesso</span>
        </div>
      </div>
      <div class="skill-gloss-difficulty-row">
        <div class="skill-gloss-diff diff-n">
          <span>Normal</span>
          <strong>10 + bônus</strong>
          <span>d20 ≤ valor</span>
        </div>
        <div class="skill-gloss-diff diff-d">
          <span>Difícil</span>
          <strong>5 + bônus</strong>
          <span>d20 ≤ valor</span>
        </div>
        <div class="skill-gloss-diff diff-c">
          <span>Crítico</span>
          <strong>1 + bônus</strong>
          <span>d20 ≤ valor</span>
        </div>
      </div>
      <p class="skill-gloss-formula-note">
        Testes de Combate <strong>não usam esta fórmula</strong> — cada um define sua própria mecânica situacional.
        Testes de Perícia Geral têm valor máximo de <strong>19</strong> (independente dos bônus).
      </p>
    </div>`;

  const geralFiltered = GROUPS.map(g => buildGroup(g, gerais)).join("");
  const combateFiltered = COMBAT_GROUPS.map(g => buildGroup(g, combate)).join("");

  // Skills fora dos grupos (caso existam)
  const knownNames = new Set([...GROUPS, ...COMBAT_GROUPS].flatMap(g => g.names));
  const orphans = allSkills.filter(s => !knownNames.has(s.name) && match(s));
  const orphansHTML = orphans.length
    ? `<div class="skill-gloss-group"><h4 class="skill-gloss-group-title">📋 Outras</h4>
        <div class="skill-gloss-cards">${orphans.map(buildCard).join("")}</div></div>` : "";

  if (q && !geralFiltered.replace(/<[^>]*>/g,"").trim() && !combateFiltered.replace(/<[^>]*>/g,"").trim()) {
    return `<p class="empty-inline-note" style="margin-top:20px">Nenhuma perícia encontrada para "${query}".</p>`;
  }

  return `
    <div class="skill-gloss-root">

      ${!q ? formulaHTML : ""}

      <!-- Perícias Gerais -->
      <div class="skill-gloss-section-header">
        <span class="skill-gloss-section-icon">🎯</span>
        <div>
          <h3 class="skill-gloss-section-title">Testes de Perícia Geral</h3>
          <p class="skill-gloss-section-sub">Usados em exploração, social e investigação. Role 1d20 abaixo do valor calculado.</p>
        </div>
      </div>
      ${geralFiltered || `<p class="empty-inline-note">Nenhum resultado.</p>`}

      <!-- Perícias de Combate -->
      <div class="skill-gloss-section-header" style="margin-top:28px">
        <span class="skill-gloss-section-icon">⚔</span>
        <div>
          <h3 class="skill-gloss-section-title">Perícias de Combate</h3>
          <p class="skill-gloss-section-sub">Vantagens passivas situacionais. Ativam automaticamente quando a condição específica ocorre — não são habilidades ativas.</p>
        </div>
      </div>
      ${combateFiltered || `<p class="empty-inline-note">Nenhum resultado.</p>`}

      ${orphansHTML}
    </div>`;
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
                <li>Armas com req. <strong>FOR</strong> exigem FOR ≥ 1</li>
                <li>Armas com req. <strong>FOR alto</strong> exigem FOR ≥ 3 — armas pesadas e de alta brutalidade</li>
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
                <li>Armas com req. DEX exigem pelo menos <strong>1 ponto em DEX</strong> para usar sem penalidade</li>
                <li>Armas com req. <strong>DEX alto</strong> exigem DEX ≥ 3 — armas técnicas avançadas</li>
              </ul>
            </div>
            <div class="rules-attr-card">
              <span class="rules-attr-badge">AGI</span>
              <strong>Agilidade</strong>
              <ul class="rules-list">
                <li>+1 Ação de Combate a cada 4 AGI</li>
                <li>Movimento: <code>4 + AGI − penalidade armadura</code></li>
                <li>Reações: <code>1 + floor(AGI/4)</code></li>                <li>Esquiva: <code>10 + AGI − penalidades</code></li>
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
          <p class="rules-intro">Em combate, cada personagem tem dois tipos de recursos de ação por rodada: <strong>Ações de Combate</strong> e <strong>Ações de Magia</strong>. Cada tipo é independente.</p>
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
          <p class="rules-intro">Todo o combate usa <strong>d10</strong> (ataque, defesa, iniciativa) e <strong>d20</strong> (esquiva). A base de acerto é sempre <strong>5 ou menos</strong> no d10. DEX define vantagem/desvantagem nos ataques.</p>

          <!-- 1. INICIATIVA -->
          <div class="rules-callout rules-callout-red">
            <strong>1. Iniciativa — 1d10</strong>
            <ul class="rules-list">
              <li>O jogador rola <strong>1d10</strong> pelo grupo inteiro. O Mestre rola <strong>1d10</strong> pelos inimigos.</li>
              <li>Quem tirar o <strong>maior número age primeiro</strong> com todo o seu grupo.</li>
              <li>Empate: jogar novamente até desempatar.</li>
              <li>O grupo que vencer a iniciativa realiza todas as suas Ações antes dos inimigos agirem.</li>
            </ul>
          </div>

          <!-- 2. ATAQUE -->
          <div class="rules-callout rules-callout-gold">
            <strong>2. Ataque — 1d10</strong>
            <ul class="rules-list">
              <li>Base de acerto: <strong>5 ou menos</strong> no d10 (ou seja, 50% de chance).</li>
              <li><strong>Vantagem de DEX:</strong> compare a DEX do atacante com a DEX do defensor.</li>
            </ul>
            <div class="rules-table-wrap">
              <table class="rules-table">
                <thead><tr><th>Situação</th><th>Chance de Acerto</th><th>Exemplo</th></tr></thead>
                <tbody>
                  <tr><td>DEX igual</td><td>5 ou menos (base)</td><td>Ambos com DEX 2 → acerta no 5</td></tr>
                  <tr><td>Atacante tem DEX maior</td><td>5 + diferença ou menos</td><td>Atacante DEX 2, Defensor DEX 1 → acerta no <strong>6</strong></td></tr>
                  <tr><td>Atacante tem DEX menor</td><td>5 − diferença ou menos</td><td>Atacante DEX 1, Defensor DEX 3 → acerta no <strong>3</strong></td></tr>
                </tbody>
              </table>
            </div>
            <ul class="rules-list" style="margin-top:8px">
              <li>Cada Ação de Combate permite <strong>1 rolagem de ataque</strong>.</li>
              <li>O ataque pode acertar o mesmo alvo múltiplas vezes (uma por Ação usada).</li>
            </ul>
          </div>

          <!-- 3. DEFESA -->
          <div class="rules-callout rules-callout-blue">
            <strong>3. Defesa — 1d10</strong>
            <ul class="rules-list">
              <li>Ao ser atacado, o defensor pode <strong>declarar Defesa</strong> antes de ver o dado do atacante.</li>
              <li>Base de defesa: <strong>5 ou menos</strong> no d10 (bloqueia o ataque).</li>
              <li>Cada tipo de equipamento tem regra diferente:</li>
            </ul>
            <div class="rules-table-wrap">
              <table class="rules-table">
                <thead><tr><th>Equipamento</th><th>Chance de Defesa</th><th>Desgaste</th></tr></thead>
                <tbody>
                  <tr>
                    <td><strong>Escudo Pesado</strong></td>
                    <td><strong>6 ou menos</strong> (vantagem +1)</td>
                    <td>Não perde chance de defesa</td>
                  </tr>
                  <tr>
                    <td><strong>Escudo Normal</strong></td>
                    <td><strong>5 ou menos</strong> (base)</td>
                    <td>Não perde chance de defesa</td>
                  </tr>
                  <tr>
                    <td><strong>Arma de 1 Mão</strong></td>
                    <td><strong>5 ou menos</strong> (base)</td>
                    <td>−1 na chance por ataque defendido</td>
                  </tr>
                  <tr>
                    <td><strong>Arma de 2 Mãos</strong></td>
                    <td><strong>5 ou menos</strong> (requer perícia)</td>
                    <td>−2 na chance por ataque defendido</td>
                  </tr>
                  <tr>
                    <td><strong>Adaga / Instrumento</strong></td>
                    <td>❌ Sem defesa</td>
                    <td>+1 de bônus de Esquiva em vez disso</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul class="rules-list" style="margin-top:8px">
              <li>A chance de defesa de armas <strong>reseta ao início de cada rodada</strong>.</li>
              <li>Se a chance de defesa chegar a 0 ou menos no meio de uma rodada: sem mais defesas naquela rodada.</li>
            </ul>
          </div>

          <!-- DADO DE CRÍTICO -->
          <div class="rules-callout" style="background:rgba(215,38,56,0.05);border-left:3px solid #d72638;padding:12px 14px;border-radius:0 6px 6px 0;margin-bottom:8px">
            <strong>3b. Dado de Crítico — 1d10</strong>
            <ul class="rules-list">
              <li>Junto com o dado de acerto (d10), role um <strong>segundo d10</strong> — este é o Dado de Crítico.</li>
              <li>Se o resultado for <strong>igual ou menor que a Chance de Crítico</strong> do personagem → o ataque é Crítico.</li>
              <li><strong>Base:</strong> 1 — apenas o 1 natural acerta o crítico.</li>
              <li><strong>SAB:</strong> a cada 4 pontos completos de SAB, +1 na Chance de Crítico. (SAB 4→+1, SAB 8→+2, SAB 12→+3…)</li>
              <li>Itens mágicos com <code>critChance</code> aumentam a chance. Itens com <code>critDamage</code> aumentam o bônus de dano.</li>
            </ul>
            <div class="rules-table-wrap">
              <table class="rules-table">
                <thead><tr><th>SAB</th><th>Chance de Crítico (d10 ≤)</th><th>Probabilidade</th></tr></thead>
                <tbody>
                  <tr><td>0–3</td><td>1</td><td>10%</td></tr>
                  <tr><td>4–7</td><td>2</td><td>20%</td></tr>
                  <tr><td>8–11</td><td>3</td><td>30%</td></tr>
                  <tr><td>12–15</td><td>4</td><td>40%</td></tr>
                  <tr><td>16+</td><td>5+</td><td>50%+</td></tr>
                </tbody>
              </table>
            </div>
            <div style="margin-top:8px;padding:8px 10px;background:rgba(215,38,56,0.07);border-radius:6px;font-size:13px">
              <strong>💥 Dano Crítico:</strong> O dano final (após subtrair a Defesa do alvo) é aumentado em <strong>+50%</strong>. Itens com <code>critDamage</code> somam ao percentual base.<br>
              <em>Exemplo: Dano final = 18. Crítico → 18 + 9 (50%) = 27 de dano.</em>
            </div>
          </div>

          <!-- 4. ESQUIVA -->
          <div class="rules-callout rules-callout-green">
            <strong>4. Esquiva — 1d20</strong>
            <ul class="rules-list">
              <li>A Esquiva usa <strong>1d20</strong> com base <strong>10 ou menos</strong>.</li>
              <li>Qualquer personagem pode tentar esquivar <em>em vez de</em> ou <em>além de</em> defender.</li>
              <li><strong>Cada Esquiva realizada</strong> na mesma rodada custa <strong>−2 na chance de esquiva</strong>.</li>
              <li>Adagas e instrumentos concedem <strong>+1 de bônus de Esquiva</strong> (em vez de defesa).</li>
            </ul>
            <div class="rules-table-wrap">
              <table class="rules-table">
                <thead><tr><th>Situação</th><th>Chance de Esquiva</th></tr></thead>
                <tbody>
                  <tr><td>1ª esquiva da rodada</td><td>10 ou menos no d20</td></tr>
                  <tr><td>2ª esquiva</td><td>8 ou menos</td></tr>
                  <tr><td>3ª esquiva</td><td>6 ou menos</td></tr>
                  <tr><td>4ª esquiva</td><td>4 ou menos</td></tr>
                  <tr><td>Com adaga/instrumento</td><td>+1 na chance base (11, 9, 7…)</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 5. DANO -->
          <div class="rules-callout rules-callout-red">
            <strong>5. Cálculo de Dano</strong>
            <ul class="rules-list">
              <li>O dano é calculado <strong>pelo número de acertos</strong> em um ataque completo.</li>
            </ul>
            <div class="rules-callout" style="background:rgba(0,0,0,0.04);border-left:3px solid var(--gold);padding:10px 14px;margin:8px 0;border-radius:0 6px 6px 0">
              <code style="font-size:13px">(Dano da Arma + Dano Natural + Bônus) × Nº de Acertos − Defesa Física = Dano Final</code>
            </div>
            <ul class="rules-list">
              <li><strong>Dano da Arma:</strong> indicado no item equipado.</li>
              <li><strong>Dano Natural:</strong> baseado em FOR (FOR 0 = nenhum, FOR 1 = 1d4, FOR 2 = 1d6…).</li>
              <li><strong>Bônus fixo:</strong> modificadores de itens, habilidades e magias.</li>
              <li><strong>Defesa do alvo</strong> é subtraída do total após multiplicação pelos acertos.</li>
              <li>O <strong>dano mínimo</strong> de qualquer ataque que acertar é sempre 1.</li>
            </ul>
          </div>

          <!-- 6. CRÍTICO -->
          <div class="rules-callout rules-callout-gold">
            <strong>6. Crítico</strong>
            <ul class="rules-list">
              <li>Um <strong>Acerto Crítico</strong> ocorre quando o atacante tira <strong>1 no d10 de ataque</strong>.</li>
              <li>Uma <strong>Defesa Crítica Falha</strong> ocorre quando o defensor tira o <strong>valor máximo do d10</strong> na tentativa de defesa.</li>
              <li>Para o crítico ocorrer: o atacante precisa ter Acerto Crítico <strong>E</strong> o defensor precisa ter Defesa Crítica Falha na mesma troca.</li>
              <li>Efeito do crítico: <strong>Dano dobrado</strong> — (Dano + Bônus) × 2, antes de subtrair a defesa.</li>
            </ul>
            <div class="rules-table-wrap">
              <table class="rules-table">
                <thead><tr><th>Dado</th><th>Resultado</th><th>Efeito</th></tr></thead>
                <tbody>
                  <tr>
                    <td>Atacante: 1 no d10</td>
                    <td>✦ Acerto Crítico</td>
                    <td rowspan="2" style="vertical-align:middle;font-weight:700;color:#c04040">Dano dobrado! <br>(Dano + Bônus) × 2</td>
                  </tr>
                  <tr>
                    <td>Defensor: 10 no d10 (valor máx.)</td>
                    <td>✦ Defesa Crítica Falha</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- EXEMPLO COMPLETO -->
          <div class="rules-callout" style="background:rgba(156,122,60,0.08);border:1px solid rgba(156,122,60,0.3);border-radius:8px;padding:14px 16px">
            <strong>📖 Exemplo Completo de Rodada</strong>
            <ol class="rules-list" style="list-style:decimal;padding-left:20px;gap:6px">
              <li><strong>Iniciativa:</strong> Jogador tira 7, Mestre tira 4. Grupo do jogador age primeiro.</li>
              <li><strong>Ataque:</strong> Kalek (DEX 2) ataca Goblin (DEX 1). Vantagem +1 → acerta com 6 ou menos. Kalek tira <strong>4</strong> — acertou!</li>
              <li><strong>Defesa do Goblin:</strong> Goblin tem escudo normal (base 5). Tira <strong>3</strong> — defendeu! Ataque bloqueado.</li>
              <li><strong>Segundo Ataque:</strong> Kalek usa segunda Ação. Tira <strong>6</strong> — acertou de novo!</li>
              <li><strong>Defesa do Goblin (2ª):</strong> Goblin tira <strong>7</strong> — falhou! O ataque passa.</li>
              <li><strong>Dano:</strong> Kalek usa Espada (1d8) + Dano Natural FOR 2 (1d6) + 0 bônus. Acertou 1 vez sem crítico. Rola: 1d8 = 5, 1d6 = 3 → total 8. Goblin tem Def.Física 2. Dano Final: 8 − 2 = <strong>6 de dano</strong>.</li>
            </ol>
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
      title: "Condições e Status",
      content: `
        <div class="rules-block">
          <p class="rules-intro">Condições são estados que afetam o personagem até serem removidas. Algumas duram turnos fixos, outras exigem teste ou recurso para remover.</p>
          <div class="rules-table-wrap">
            <table class="rules-table">
              <thead><tr><th>Condição</th><th>Efeito</th><th>Como Remover</th></tr></thead>
              <tbody>
                <tr><td><strong>Atordoado</strong></td><td>Perde 1 Ação no turno afetado</td><td>Automático (1 turno)</td></tr>
                <tr><td><strong>Derrubado</strong></td><td>Não pode mover; levantar custa 1 Ação; −1d4 na Esquiva</td><td>Gastar 1 Ação para levantar</td></tr>
                <tr><td><strong>Imobilizado</strong></td><td>Movimento = 0; pode atacar normalmente</td><td>FOR (varia por fonte) / Ação</td></tr>
                <tr><td><strong>Preso</strong></td><td>Imóvel; FOR (normal) para escapar gastando 1 Ação</td><td>FOR (normal) + 1 Ação</td></tr>
                <tr><td><strong>Acorrentado</strong></td><td>Imóvel, −2 Ações; FOR (normal) para escapar gastando 1 Ação</td><td>FOR (normal) + 1 Ação</td></tr>
                <tr><td><strong>Confuso</strong></td><td>Ataca o aliado mais próximo no turno; SAB (normal) para resistir</td><td>SAB (normal) no início do turno / sair da área</td></tr>
                <tr><td><strong>Aterrorizado</strong></td><td>Foge do causador; não pode atacá-lo; −1d4 em testes</td><td>SAB (difícil) / 1–2 turnos / sair da área</td></tr>
                <tr><td><strong>Abalado</strong></td><td>−1d4 em todos os testes por 1–2 rodadas</td><td>Automático (fim da duração)</td></tr>
                <tr><td><strong>Envenenado</strong></td><td>1d4–1d8 por rodada (varia); FOR ou SAB para resistir</td><td>Antídoto / Cura Mágica / Descanso Longo</td></tr>
                <tr><td><strong>Envenenado Grave</strong></td><td>1d8–1d12/rodada; SAB (difícil); irremovível em combate</td><td>Cura Mágica (fora de combate) / Descanso Longo</td></tr>
                <tr><td><strong>Congelado</strong></td><td>Imóvel 1 turno; +50% dano físico recebido</td><td>FOR (normal) ou fim do turno</td></tr>
                <tr><td><strong>Queimando</strong></td><td>1d4–1d8 por rodada; 1 Ação para apagar</td><td>1 Ação / água / rolar no chão</td></tr>
                <tr><td><strong>Sangramento</strong></td><td>1d4 por rodada; não acumula além do indicado</td><td>1 Ação (estabilizar) / Cura Mágica</td></tr>
                <tr><td><strong>Corrompido</strong></td><td>−1d4 em testes; curas recebidas reduzidas em 50%</td><td>Magia Sagrada Nv.3+ / Clérigo (Purificar)</td></tr>
                <tr><td><strong>Maldito</strong></td><td>Varia por fonte; pode aplicar cargas (3 = explosão de dano)</td><td>Cura Mágica Nv.4+ / Ritual</td></tr>
                <tr><td><strong>Petrificado</strong></td><td>0 Ações, 0 Reações; Def.Física dobrada; não move</td><td>Cura Mágica / fim da duração</td></tr>
                <tr><td><strong>Paralisado</strong></td><td>0 Ações, 0 Reações; Esquiva = 0</td><td>FOR (difícil) / Cura Mágica / fim do turno</td></tr>
                <tr><td><strong>Dominado</strong></td><td>Age sob controle do conjurador inimigo</td><td>Sofrer dano (SAB normal); Cura Mágica; fim da duração</td></tr>
                <tr><td><strong>Exausto Menor</strong></td><td>Perde 1 Ação no próximo turno (pós Aceleração Menor)</td><td>Automático após 1 turno</td></tr>
                <tr><td><strong>Exausto</strong></td><td>Perde turno inteiro — 0 Ações, 0 Reações (pós Aceleração)</td><td>Automático após 1 turno</td></tr>
                <tr><td><strong>Colapso de Adrenalina</strong></td><td>Perde turno + não pode ser protegido por aliados (pós Aceleração Superior)</td><td>Automático após 1 turno</td></tr>
                <tr><td><strong>Vulnerável</strong></td><td>+25–50% de dano do tipo indicado</td><td>Indicado na fonte / Cura Mágica</td></tr>
                <tr><td><strong>Inconsciente</strong></td><td>0 Ações; Esquiva 0; pode ser executado</td><td>Estabilizar (1 HP) / Cura / Descanso</td></tr>
              </tbody>
            </table>
          </div>
          <div class="rules-callout rules-callout-gold">
            <strong>Condições de Exaustão — Aceleração</strong>
            <ul class="rules-list">
              <li><strong>Aceleração Menor (Nv.2):</strong> +1 Ação por 5 turnos → perde 1 Ação no próximo turno</li>
              <li><strong>Aceleração (Nv.3):</strong> +1 Ação por 8 turnos → perde turno inteiro</li>
              <li><strong>Aceleração Superior (Nv.4):</strong> +2 Ações por 4 rodadas → Colapso de Adrenalina</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: "subclasses",
      icon: "⭐",
      title: "Subclasses e Habilidades",
      content: `
        <div class="rules-block">
          <p class="rules-intro">Subclasses specializam o personagem além da classe base. São de dois tipos: <strong>Sinergia</strong> (combinam duas classes) e <strong>Puras</strong> (exclusivas de uma classe, mais poderosas).</p>
          <div class="rules-callout rules-callout-blue">
            <strong>Subclasses de Sinergia (10)</strong>
            <ul class="rules-list">
              <li><strong>Paladino</strong> — Guerreiro + Clérigo</li>
              <li><strong>Berserker</strong> — Guerreiro + Ladino</li>
              <li><strong>Runa-Lâmina</strong> — Guerreiro + Mago</li>
              <li><strong>Caçador de Gigantes</strong> — Guerreiro + Arqueiro</li>
              <li><strong>Necromante</strong> — Mago + Clérigo</li>
              <li><strong>Bardo</strong> — Mago + Ladino</li>
              <li><strong>Alquimista</strong> — Mago + Arqueiro</li>
              <li><strong>Druida</strong> — Arqueiro + Clérigo</li>
              <li><strong>Caçador Sombrio</strong> — Ladino + Arqueiro</li>
              <li><strong>Sussurro Sombrio</strong> — Ladino + Clérigo</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-gold">
            <strong>Subclasses Puras (5) — Nível 4+ obrigatório para aprender habilidades</strong>
            <ul class="rules-list">
              <li><strong>🗡 Guerreiro Puro</strong> — Fortaleza Inabalável · Golpe Devastador (×3)</li>
              <li><strong>🔮 Mago Puro</strong> — Amplificação Canalizada (×3 dano) · Domínio de Área (+4 hex)</li>
              <li><strong>🏹 Arqueiro Puro</strong> — Saraivada de Flechas (cone/linha todos) · Tiro Indefensável</li>
              <li><strong>🗡 Ladino Puro</strong> — Passo das Sombras (invisível 4 rodadas) · Veneno Mortal (irremovível)</li>
              <li><strong>✝ Clérigo Puro</strong> — Cura Milagrosa (ressuscita) · Onda de Purificação (8 hex)</li>
            </ul>
            <p style="margin-top:6px;font-size:12px">Custo: <strong>2 pontos</strong> por habilidade pura (em vez de 1). Exigem Nível 4+.</p>
          </div>
          <div class="rules-table-wrap">
            <table class="rules-table">
              <thead><tr><th>Tipo de Habilidade</th><th>Custo</th><th>Nível mínimo</th><th>Níveis</th></tr></thead>
              <tbody>
                <tr><td>Habilidade de Classe normal</td><td>1 ponto</td><td>Qualquer</td><td>1 → 2 → 3</td></tr>
                <tr><td>Habilidade de Subclasse Sinergia</td><td>1 ponto</td><td>Qualquer</td><td>1 → 2 → 3</td></tr>
                <tr><td>Habilidade de Subclasse Pura</td><td><strong>2 pontos</strong></td><td><strong>Nível 4+</strong></td><td>1 → 2 → 3</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `
    },
    {
      id: "encontros",
      icon: "⚔",
      title: "Balanceamento de Encontros",
      content: `
        <div class="rules-block">
          <p class="rules-intro">O bestiário de Aether tem <strong>178 monstros</strong> distribuídos em 5 dificuldades. Os HPs já foram calibrados para uma party de 4 jogadores. Duração estimada de combate com party equivalente ao nível do monstro:</p>
          <div class="rules-table-wrap">
            <table class="rules-table">
              <thead><tr><th>Dificuldade</th><th>HP médio</th><th>Def.Física</th><th>Dodge</th><th>Rounds (4p equiv.)</th><th>Rounds (boss)</th></tr></thead>
              <tbody>
                <tr><td><span class="rules-badge diff-1">☠ Dif.1</span></td><td>~31 HP</td><td>2</td><td>~12</td><td>5–6</td><td>10–14</td></tr>
                <tr><td><span class="rules-badge diff-2">☠☠ Dif.2</span></td><td>~74 HP</td><td>4</td><td>~11</td><td>5–6</td><td>10–14</td></tr>
                <tr><td><span class="rules-badge diff-3">☠☠☠ Dif.3</span></td><td>~149 HP</td><td>7</td><td>~10</td><td>8–10</td><td>12–16</td></tr>
                <tr><td><span class="rules-badge diff-4">☠☠☠☠ Dif.4</span></td><td>~200 HP</td><td>8</td><td>~11</td><td>8–9</td><td>15–20</td></tr>
                <tr><td><span class="rules-badge diff-5">☠☠☠☠☠ Dif.5</span></td><td>~382 HP</td><td>9–16</td><td>~12</td><td>10–11</td><td>20+</td></tr>
              </tbody>
            </table>
          </div>
          <div class="rules-callout rules-callout-gold">
            <strong>Locais de Encontro (12 canônicos)</strong>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;margin-top:6px">
              ${[['⚓','Dungeon',70],['🌲','Floresta',58],['🏚','Ruínas',57],['🌾','Planície',46],
                 ['⛰','Montanha',36],['🕳','Caverna',29],['🌿','Pântano',25],['💀','Cemitério',24],
                 ['🏘','Cidade',22],['🏛','Templo',22],['🛤','Estrada',13],['🏜','Deserto',12]]
                .map(([i,n,c]) => `<div style="font-size:12px">${i} <strong>${n}</strong> — ${c} monstros</div>`).join("")}
            </div>
          </div>
          <div class="rules-callout rules-callout-blue">
            <strong>Soma de Dificuldades — pressão do encontro</strong>
            <ul class="rules-list">
              <li>Soma 1–4: Tranquilo — sem risco real</li>
              <li>Soma 5–9: Equilibrado — tensão moderada, 1–2 KOs possíveis</li>
              <li>Soma 10–14: Desafiador — combate longo, decisões importam</li>
              <li>Soma 15–20: Perigoso — alto risco de morte</li>
              <li>Soma 21+: Mortal — confronto final / boss épico</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: "mecanicas-especiais",
      icon: "🎮",
      title: "Mecânicas Especiais de Monstros",
      content: `
        <div class="rules-block">
          <p class="rules-intro">Alguns monstros — especialmente os inspirados em Dark Souls — têm mecânicas únicas que mudam a forma de jogar o combate. O Mestre deve anunciar mecânicas visíveis antes que o jogador precise reagir.</p>
          <div class="rules-callout rules-callout-gold">
            <strong>Partes Destruíveis</strong>
            <ul class="rules-list">
              <li>Declarar intenção de atacar parte específica antes de rolar</li>
              <li>Se acertar, o dano é aplicado à parte (HP separado, geralmente 10–20)</li>
              <li>Parte destruída: monstro perde habilidade ou Ação relacionada</li>
              <li>Exemplo: Gárgula de Pedra Viva — cauda cortável com 15+ dano num golpe</li>
              <li>Exemplo: Ancião Sem Escamas — Olho (5 HP), Ferida (15 HP), Garras (10 HP)</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-blue">
            <strong>Fases de Combate</strong>
            <ul class="rules-list">
              <li>Monstros com fases mudam de comportamento ao atingir % de HP</li>
              <li>A transição geralmente ocorre automaticamente no início do turno do monstro</li>
              <li>Fase 2 pode alterar: Ações, imunidades, vulnerabilidades, padrão de ataque</li>
              <li>Exemplo: Senhor das Cinzas — 50% HP → fragmenta-se em cinza por 1 turno, retorna com 6 Ações</li>
              <li>Exemplo: Cavaleiro Negro Maldito — cai a 0 HP → ressurge com 40% HP e Modo Crítico</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-green">
            <strong>Padrões de Ataque Anunciados</strong>
            <ul class="rules-list">
              <li>Alguns monstros anunciam o próximo ataque com animação (1 Ação de "postura")</li>
              <li>O Mestre anuncia: "O Cavaleiro Elite entra em postura — ataque pesado vem no próximo turno"</li>
              <li>Jogadores podem usar isso para se reposicionar, usar habilidades ou proteger aliados</li>
              <li>Interromper a postura antes do ataque (dano suficiente) pode cancelar o golpe especial</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-red" style="background:rgba(125,42,46,0.06);border-left:3px solid var(--red)">
            <strong style="color:var(--red)">Punição por Erro</strong>
            <ul class="rules-list">
              <li><strong>Punição por Esquiva Atrasada:</strong> falhar na esquiva → próximo ataque do monstro tem +3 Crit</li>
              <li><strong>Punição por Rolar (Cavaleiro Negro):</strong> recuar mais de 2 hex → ataque gratuito inevitável</li>
              <li><strong>Fragmentos Cortantes (Golem de Espelhos):</strong> acerto melee → 1d4 de reflexo no atacante</li>
              <li><strong>Espada nas Costas (Aranha):</strong> acerto com rolagem ≤ 2 → atacante recebe dano da lâmina</li>
            </ul>
          </div>
          <div class="rules-callout rules-callout-gold">
            <strong>Resistências Especiais</strong>
            <ul class="rules-list">
              <li><strong>Intangível (Fantasma de Pedra):</strong> imune a armas não-encantadas; Água Transiente ativa 3 ataques físicos</li>
              <li><strong>Imune a Críticos (Cavaleiro Sem Cabeça):</strong> não tem cabeça — críticos causam dano normal</li>
              <li><strong>Reflexo Mágico (Golem de Espelhos):</strong> 40% de refletir magia direcionada de volta</li>
              <li><strong>Imortal por Maldição (Cavaleiro Negro):</strong> primeira "morte" → ressurge com 40% HP</li>
              <li><strong>Colossal (Ancião Sem Escamas):</strong> imune a todas as formas de controle; requer espaço ≥3 hex</li>
            </ul>
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

const SHOP_TYPE_LABELS = { armas:"⚔ Armas, Armaduras & Acessórios", magias:"✨ Magias & Pergaminhos", pocoes:"🧪 Poções & Materiais", pericias:"📚 Mestre de Perícias" };

function renderNpcShopSection(character) {
  const stock = character.shopStock || [];
  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">🏪 Loja — ${SHOP_TYPE_LABELS[character.shopType] || character.shopType}</h3>
    ${stock.length === 0 ? `<p class="empty-inline-note">Nenhum item em estoque.</p>` : `
    <div class="ability-card-grid">
      ${stock.map(it => `
        <div class="ability-card known">
          <div class="ability-card-head">
            <span class="ability-card-name">${it.name}</span>
            <span class="ability-card-badge">${it.tier}</span>
          </div>
          <p class="ability-card-effect">💰 ${it.price}</p>
        </div>`).join("")}
    </div>`}
  </div>`;
}

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
      ${renderEquippedItemsPanel(character)}
      ${renderCursesSection(character)}
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
      ${character.shopType ? renderNpcShopSection(character) : ""}
      ${renderMountSection(character)}
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


/* --- Painel de Itens Equipados (resumo na aba Vital) --- */

function renderEquippedItemsPanel(character) {
  const TIER_RARE = ["raro","magico","lendario","unico","ancestral"];
  const TIER_LABELS = { comum:"Comum", raro:"Raro", magico:"Mágico", lendario:"Lendário", unico:"Único", ancestral:"Ancestral" };
  const TIER_CLASS  = { raro:"tier-raro", magico:"tier-magico", lendario:"tier-lendario", unico:"tier-unico", ancestral:"tier-ancestral" };

  // Coletar todos os itens equipados
  const slots = [
    { key:"primary",   label:"⚔ Arma Primária"   },
    { key:"secondary", label:"⚔ Arma Secundária"  },
    { key:"shield",    label:"🛡 Escudo"           },
    { key:"armor",     label:"🧥 Armadura"         },
  ];

  const equipped = [];
  slots.forEach(s => {
    const item = character.inventory?.find(i => i.equippedSlot === s.key);
    if (item) equipped.push({ slotLabel: s.label, item });
  });

  // Acessórios
  const accessories = character.inventory?.filter(i => i.equippedSlot === "accessory") || [];

  if (!equipped.length && !accessories.length) return "";

  const renderStatChips = (item) => {
    const bd = item.baseData || {};
    const chips = [];
    if (bd.dmg)           chips.push({ k:"⚔ Dano",        v: bd.dmg,              cls:"chip-atk" });
    if (bd.physDefense && item.category !== "shield") chips.push({ k:"🛡 Def.Física",  v:`+${bd.physDefense}`, cls:"chip-def" });
    if (bd.magDefense)    chips.push({ k:"✨ Def.Mágica",  v:`+${bd.magDefense}`,  cls:"chip-mag" });
    if (bd.movePenalty)   chips.push({ k:"🏃 Movimento",   v: bd.movePenalty > 0 ? `−${bd.movePenalty}` : `+${-bd.movePenalty}`, cls: bd.movePenalty > 0 ? "chip-warn" : "chip-def" });
    if (bd.weight != null) chips.push({ k:"⚖ Peso",        v:`${bd.weight}kg`,     cls:"chip-neutral" });
    if (bd.range)          chips.push({ k:"🎯 Alcance",    v:`${bd.range}hex`,     cls:"chip-neutral" });
    if (bd.req)            chips.push({ k:"📋 Req.",        v: formatReq(bd.req),              cls:"chip-neutral" });
    // magicBonus
    if (bd.magicBonus) {
      const MB_LABELS = { hp:"❤ HP", move:"🏃 Mov", actions:"⚡ Ações", spellActions:"✨ Ações Magia", slots:"🔮 Slots", carry:"📦 Carga", critChance:"🎯 Chance Crit", critDamage:"💥 Dano Crit %" };
      Object.entries(bd.magicBonus).forEach(([k,v]) => {
        if (k === "attr" || k === "attrValue" || !v) return;
        chips.push({ k: MB_LABELS[k] || k, v:`+${v}`, cls:"chip-magic" });
      });
      if (bd.magicBonus.attr && bd.magicBonus.attrValue) {
        chips.push({ k: bd.magicBonus.attr, v:`+${bd.magicBonus.attrValue}`, cls:"chip-magic" });
      }
    }
    if (!chips.length) return "";
    return `<div class="eip-chips">${chips.map(c =>`<span class="eip-chip ${c.cls}"><span class="eip-chip-k">${c.k}</span>${c.v}</span>`).join("")}</div>`;
  };

  const renderItemCard = (item, slotLabel) => {
    const bd   = item.baseData || {};
    const tier = bd.tier || "comum";
    const rare = TIER_RARE.includes(tier);
    const tierBadge = rare ? `<span class="eip-tier ${TIER_CLASS[tier]||""}">${TIER_LABELS[tier]||tier}</span>` : "";
    const statChips  = renderStatChips(item);
    const effectLine = rare && bd.effect ? `<p class="eip-effect">📜 ${bd.effect}</p>` : "";
    const noteLine   = rare && bd.note   ? `<p class="eip-note">✦ ${bd.note}</p>`     : "";
    const storyLine  = rare && bd.story  ? `<p class="eip-story">"${bd.story.substring(0,160)}${bd.story.length>160?"…":""}"</p>` : "";
    const setLine    = bd.setName ? `<div class="eip-set">Conjunto: ${bd.setName}</div>` : "";
    const cursedBadge = bd.cursed  ? `<span class="eip-badge eip-badge-cursed">⚠ Amaldiçoado</span>` : "";
    const divineBadge = bd.divine  ? `<span class="eip-badge eip-badge-divine">🌟 ${bd.divine}</span>` : "";

    return `
      <div class="eip-card ${rare ? "eip-card-rare" : ""}">
        <div class="eip-slot-label">${slotLabel}</div>
        <div class="eip-head">
          <span class="eip-name">${escapeHTML(item.name)}</span>
          <div class="eip-badges">${tierBadge}${cursedBadge}${divineBadge}</div>
        </div>
        ${statChips}
        ${effectLine}${noteLine}${storyLine}${setLine}
      </div>`;
  };

  const weaponCards = equipped.map(({ slotLabel, item }) => renderItemCard(item, slotLabel)).join("");

  const accCards = accessories.map(item => {
    const bd   = item.baseData || {};
    const tier = bd.tier || "comum";
    const rare = TIER_RARE.includes(tier);
    const tierBadge   = rare ? `<span class="eip-tier ${TIER_CLASS[tier]||""}">${TIER_LABELS[tier]||tier}</span>` : "";
    const statChips   = renderStatChips(item);
    const effectLine  = rare && bd.effect ? `<p class="eip-effect">📜 ${bd.effect}</p>` : "";
    const noteLine    = rare && bd.note   ? `<p class="eip-note">✦ ${bd.note}</p>`     : "";
    const storyLine   = rare && bd.story  ? `<p class="eip-story">"${bd.story.substring(0,140)}${bd.story.length>140?"…":""}"</p>` : "";
    const cursedBadge = bd.cursed ? `<span class="eip-badge eip-badge-cursed">⚠ Amaldiçoado</span>` : "";
    const divineBadge = bd.divine ? `<span class="eip-badge eip-badge-divine">🌟 ${bd.divine}</span>` : "";

    return `
      <div class="eip-card ${rare ? "eip-card-rare" : ""}">
        <div class="eip-slot-label">💍 Acessório</div>
        <div class="eip-head">
          <span class="eip-name">${escapeHTML(item.name)}</span>
          <div class="eip-badges">${tierBadge}${cursedBadge}${divineBadge}</div>
        </div>
        ${statChips}
        ${effectLine}${noteLine}${storyLine}
      </div>`;
  }).join("");

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Itens Equipados</h3>
    <p class="section-hint">Resumo do equipamento ativo. Itens raros e acima mostram seus efeitos e atributos completos aqui. Para trocar itens acesse a aba 🛡 Equip.</p>
    <div class="eip-grid">
      ${weaponCards}${accCards}
    </div>
    ${!equipped.length && !accessories.length ? `<p class="empty-inline-note">Nenhum item equipado ainda.</p>` : ""}
  </div>`;
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
  const spellActions = calcSpellActions(character);
  const slots = calcSpellSlots(character);
  const carry = calcCarryCapacity(character);
  const weight = calcTotalWeight(character);
  const physDef = calcPhysicalDefense(character);
  const magDef = calcMagicDefense(character);
  const dodge = calcDodgeChance(character);
  const healBonus = calcHealingBonus(character);
  const critChance = calcCritChance(character);
  const critDmgPct = calcCritDamageBonus(character);
  const dmg = calcDamageBreakdown(character);
  const weaponPenalty = calcWeaponRequirementPenalty(character);

  const sab = getEffectiveAttr(character, "SAB");
  const sabCritBonus = Math.floor(sab / 4);

  const stats = [
    { label: "Movimento", value: `${move} hex`, tooltip: "Quantos hexágonos você pode andar por turno. Ganha-se 1 por ponto de AGI (base 4), descontando penalidade de armadura/escudo pesado." },
    { label: "Ações/turno", value: actions, tooltip: "Ações de combate por turno. Base: 1 + floor(Nível÷3). Bônus: +1 a cada 4 AGI, +1 a cada 5 DEX. Exemplo: nível 3 = 2 ações; nível 6 = 3 ações. Atributos adicionam bônus extras." },    { label: "Ações de Magia", value: spellActions, tooltip: "Ações para conjurar magias. Todas as classes ganham 1 + floor(Nível÷3). Bônus de INT: +1 a cada 2 pontos.", highlight: spellActions > 0 },
    { label: "Defesa Física", value: physDef, tooltip: "Reduz o dano de ataques físicos recebidos. Vem da armadura equipada e do escudo (se houver)." },
    { label: "Defesa Mágica", value: magDef, tooltip: "Reduz o dano de magias e ataques mágicos recebidos. Vem principalmente de armaduras arcanas/sagradas e itens mágicos." },
    { label: "Chance de Esquiva", value: `${dodge} ou menos (d20)`, tooltip: "Role 1d20: resultado igual ou menor que este valor esquiva totalmente o ataque. Base 10 — cada esquiva adicional na mesma rodada custa −2 (10, 8, 6…). Adagas e instrumentos concedem +1 de bônus." },
    { label: "🎯 Chance de Crítico", value: `${critChance} ou menos (d10)`, tooltip: `Role 1d10 junto com o dado de acerto. Se o resultado for ${critChance} ou menos → Crítico! Base: 1 natural. SAB ${sab} → +${sabCritBonus} (1 por cada 4 pontos). Itens mágicos podem adicionar mais. O crítico aumenta o dano final em ${critDmgPct}%.`, highlight: critChance > 1 },
    { label: "💥 Dano Crítico", value: `+${critDmgPct}% do dano final`, tooltip: `Quando o dado de crítico (d10) for ${critChance} ou menos: o dano final (após subtrair a defesa do alvo) é aumentado em ${critDmgPct}%. Base: 50%. Itens mágicos com critDamage aumentam essa porcentagem.`, highlight: critDmgPct > 50 },
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
      ${weaponPenalty !== 0 ? `<div class="derived-box derived-box-danger" title="Sua arma exige pelo menos 1 ponto no atributo indicado (ex: DEX 1 para uma Adaga). Com 0 pontos no atributo, todos os ataques com essa arma sofrem −2 na Chance de Acerto. Aloque pelo menos 1 ponto no atributo correto para remover a penalidade.">
        <div class="derived-box-label">Penalidade de Acerto <span class="derived-box-info">ⓘ</span></div>
        <div class="derived-box-value">${weaponPenalty}</div>
      </div>` : ""}
    </div>
    ${weaponPenalty !== 0 ? `<p class="weapon-penalty-warning">⚠ Sua arma primária exige pelo menos 1 ponto no atributo <strong>${getEquippedItem(character,"primary")?.baseData?.req || "indicado"}</strong> — que você tem 0. Aplique ${weaponPenalty} na Chance de Acerto enquanto equipada. Aloque 1 ponto no atributo para remover a penalidade.</p>` : ""}

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
    <div class="crit-formula-box">
      <span class="crit-formula-icon">🎯</span>
      <div>
        <div class="crit-formula-title">Dado de Crítico — d10 ≤ ${critChance}</div>
        <div class="crit-formula-desc">Jogue 1d10 junto com o dado de acerto. Se o resultado for <strong>${critChance} ou menos</strong>, o ataque é Crítico — o dano final (após subtrair a Defesa) aumenta em <strong>+${critDmgPct}%</strong>.</div>
        <div class="crit-formula-breakdown">Base 1 ${sabCritBonus > 0 ? `+ ${sabCritBonus} (SAB ${sab})` : ""} ${critChance - 1 - sabCritBonus > 0 ? `+ ${critChance - 1 - sabCritBonus} (itens)` : ""}${critDmgPct > 50 ? ` · Dano crítico: 50% base + ${critDmgPct - 50}% (itens) = ${critDmgPct}%` : ""}</div>
      </div>
    </div>
  </div>`;
}

/* --- Habilidades de Classe (Fúria/MP/Foco/Veneno/Fé) --- */

function renderClassAbilitiesSection(character, cls) {
  if (!character.skills.abilities)      character.skills.abilities      = [];
  if (!character.skills.abilityLevels) character.skills.abilityLevels = {};
  const known  = character.skills.abilities;
  const levels = character.skills.abilityLevels;
  const points = character.unspentSkillPoints || 0;
  const charLevel = character.level || 1;

  // ── Subclasse ────────────────────────────────────────────────────
  const sc        = character.subclassKey ? SUBCLASSES[character.subclassKey] : null;
  const isPuro    = character.subclassKey?.endsWith("-puro");
  const scKnown   = sc ? sc.skills.filter(sk => known.includes(sk.id)) : [];

  // Habilidades de subclasse aprendíveis (não puras são sempre disponíveis;
  // puras só ficam disponíveis a partir do nível 4)
  const scAvailable = sc ? sc.skills.filter(sk => {
    if (known.includes(sk.id)) return false;           // já aprendida
    if (isPuro && charLevel < 4) return false;         // pura bloqueada abaixo nível 4
    return true;
  }) : [];

  // ── Card de habilidade de subclasse conhecida ────────────────────
  const renderSubclassAbilityCard = (sk) => {
    const currentLevel = levels[sk.id] || 1;
    const maxLevel     = sk.levels?.length || 1;
    const canUpgrade   = currentLevel < maxLevel;
    const currentData  = sk.levels?.[currentLevel - 1] || sk;
    const isClassSyn   = Array.isArray(sk.sinergyClasses) && sk.sinergyClasses.includes(character.classKey);

    return `
      <div class="ability-card known ability-card-subclass ${isClassSyn ? "ability-card-synergy" : ""} ${sk.exclusive ? "ability-card-exclusive" : ""}">
        <div class="ability-card-head">
          <span class="ability-card-name">${sk.name}</span>
          <div style="display:flex;gap:5px;flex-wrap:wrap;">
            ${sk.exclusive      ? `<span class="ability-card-badge badge-exclusive">⭐ Puro</span>` : ""}
            ${sk.commonToAll    ? `<span class="ability-card-badge badge-common">Qualquer classe</span>` : ""}
            ${isClassSyn        ? `<span class="ability-card-badge badge-synergy">✨ Sinergia</span>` : ""}
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

  // ── Card de habilidade de subclasse disponível (não aprendida) ───
  const renderSubclassAvailableCard = (sk) => {
    const isPuroSkill = sk.exclusive;
    const cost = sk.cost || "2 pontos";
    return `
      <div class="ability-card locked ability-card-subclass-available ${isPuroSkill ? "ability-card-exclusive" : ""}">
        <div class="ability-card-head">
          <span class="ability-card-name">${sk.name}</span>
          <div style="display:flex;gap:5px;flex-wrap:wrap;">
            ${isPuroSkill ? `<span class="ability-card-badge badge-exclusive">⭐ Puro</span>` : ""}
            <span class="ability-card-badge">${cost}</span>
          </div>
        </div>
        <p class="ability-card-effect">${sk.levels?.[0]?.effect || sk.effect || ""}</p>
        <button class="btn-secondary btn-learn-subclass-ability"
          data-learn-subclass-id="${sk.id}"
          ${points >= 2 ? "" : "disabled"}>
          ${points >= 2 ? "Aprender (2 pontos)" : `Requer 2 pontos (você tem ${points})`}
        </button>
      </div>`;
  };

  // ── Habilidades da CLASSE (só as conhecidas) ─────────────────────
  const knownClassSkills = cls.skills.filter(sk => known.includes(sk.name));

  // Habilidades da classe NÃO aprendidas (para o picker abaixo)
  const unlearnedClass = cls.skills.filter(sk => !known.includes(sk.name));

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Habilidades de Classe</h3>
    <p class="section-hint">Recurso: <strong>${cls.resource}</strong> — ${cls.resourceDesc}</p>
    ${points > 0 ? `<div class="points-banner">★ Você tem <strong>${points}</strong> ponto(s) de habilidade para gastar.</div>` : ""}

    ${knownClassSkills.length > 0 ? `
    <div class="ability-card-grid">
      ${knownClassSkills.map(skill => {
        const isLevelable  = Array.isArray(skill.levels) && skill.levels.length > 1;
        const currentLevel = levels[skill.name] || 1;
        const maxLevel     = isLevelable ? skill.levels.length : 1;
        const currentData  = isLevelable ? skill.levels[currentLevel - 1] : skill;
        const canUpgrade   = isLevelable && currentLevel < maxLevel;
        return `
        <div class="ability-card known">
          <div class="ability-card-head">
            <span class="ability-card-name">${skill.name}</span>
            <span class="ability-card-badge">Aprendida</span>
          </div>
          ${isLevelable ? `
            <div class="ability-level-dots" title="Nível ${currentLevel} de ${maxLevel}">
              ${Array.from({ length: maxLevel }).map((_,i) => `<span class="ability-level-dot ${i < currentLevel ? "filled" : ""}"></span>`).join("")}
              <span class="ability-level-text">Nível ${currentLevel}/${maxLevel}</span>
            </div>` : ""}
          <div class="ability-card-cost">${currentData.cost}</div>
          <p class="ability-card-effect">${currentData.effect}</p>
          ${canUpgrade ? `
          <button class="btn-secondary btn-upgrade-ability" data-upgrade-ability="${skill.name}" ${points > 0 ? "" : "disabled"}>
            ${points > 0 ? `Evoluir para Nível ${currentLevel + 1} (1 ponto)` : "Sem pontos disponíveis"}
          </button>` : ""}
          ${isLevelable && currentLevel >= maxLevel ? `<div class="ability-max-level-note">✦ Nível máximo alcançado</div>` : ""}
        </div>`;
      }).join("")}
    </div>` : `<p class="empty-inline-note">Nenhuma habilidade de classe aprendida ainda. Use os pontos abaixo para aprender.</p>`}

    ${unlearnedClass.length > 0 ? `
    <details class="ability-learn-details">
      <summary class="ability-learn-summary">
        + Aprender habilidade de classe (${unlearnedClass.length} disponív${unlearnedClass.length > 1 ? "eis" : "el"})
      </summary>
      <div class="ability-card-grid" style="margin-top:10px">
        ${unlearnedClass.map(skill => {
          const firstData = Array.isArray(skill.levels) ? skill.levels[0] : skill;
          return `
          <div class="ability-card locked">
            <div class="ability-card-head">
              <span class="ability-card-name">${skill.name}</span>
            </div>
            <div class="ability-card-cost">${firstData.cost || skill.cost || "1 ponto"}</div>
            <p class="ability-card-effect">${firstData.effect || skill.effect || ""}</p>
            <button class="btn-secondary btn-learn-ability" data-learn-ability="${skill.name}" ${points > 0 ? "" : "disabled"}>
              ${points > 0 ? "Aprender (1 ponto)" : "Sem pontos disponíveis"}
            </button>
          </div>`;
        }).join("")}
      </div>
    </details>` : ""}

    ${sc ? `
    <h3 class="sheet-section-title" style="margin-top:18px">
      ${sc.icon} ${sc.name}
    </h3>

    ${isPuro ? `
    <div class="ability-puro-notice">
      <span class="ability-puro-notice-icon">⭐</span>
      <div>
        <strong>Subclasse Pura</strong> — As habilidades desta subclasse só podem ser aprendidas a partir do <strong>Nível 4</strong>.
        ${charLevel < 4 ? `<span style="color:#c0392b"> Seu personagem está no nível <strong>${charLevel}</strong> — ainda não disponível.</span>` : `<span style="color:#27ae60"> Nível ${charLevel} — habilidades disponíveis para aprendizado!</span>`}
      </div>
    </div>` : ""}

    ${scKnown.length > 0 ? `
    <div class="ability-card-grid">
      ${scKnown.map(renderSubclassAbilityCard).join("")}
    </div>` : ""}

    ${scAvailable.length > 0 ? `
    <details class="ability-learn-details">
      <summary class="ability-learn-summary">
        + Aprender habilidade de subclasse (${scAvailable.length} disponív${scAvailable.length > 1 ? "eis" : "el"})
      </summary>
      <div class="ability-card-grid" style="margin-top:10px">
        ${scAvailable.map(renderSubclassAvailableCard).join("")}
      </div>
    </details>` : ""}

    ${scKnown.length === 0 && scAvailable.length === 0 && isPuro && charLevel < 4 ? `
    <p class="empty-inline-note" style="color:var(--ink-soft)">🔒 As habilidades do ${sc.name} ficam disponíveis a partir do Nível 4.</p>` : ""}
    ` : ""}

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
        { label: "Requisito", value: formatReq(itemData.req) || "—", kind: reqCheck.met ? "neutral" : "warn" },
        { label: "Defesa", value: defenseInfo, kind: defenseKind }
      ];
      if (itemData.range) chips.splice(1, 0, { label: "Alcance", value: `${itemData.range} hex`, kind: "neutral" });
      if (isHeavyTwoHand && cfg.key === "primary") {
        chips.push({ label: "Esquiva", value: hasHeavyDefenseSkill ? "Sem penalidade" : "−2 (arma de 2 mãos pesada)", kind: hasHeavyDefenseSkill ? "neutral" : "warn" });
      }
      if (!reqCheck.met && cfg.key === "primary") {
        requirementWarning = `<div class="equip-requirement-warning">⚠ Requisito não cumprido (${formatReq(itemData.req)}): −2 na Chance de Acerto enquanto esta arma estiver equipada como primária.</div>`;
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
        { label: "Requisito", value: formatReq(itemData.req) || "—", kind: armorReqCheck.met ? "neutral" : "warn" }
      ];
      if (itemData.movePenalty) chips.push({ label: "Movimento", value: itemData.movePenalty < 0 ? `+${-itemData.movePenalty}` : `−${itemData.movePenalty}`, kind: itemData.movePenalty > 0 ? "warn" : "defense" });
      if (!armorReqCheck.met) {
        requirementWarning = `<div class="equip-requirement-warning">⚠ Requisito não cumprido (${formatReq(itemData.req)}) — o mestre pode aplicar penalidades adicionais de manejo.</div>`;
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

/* --- Montaria --- */

function renderMountSection(character) {
  const mount     = character.mount || null;
  const mountData = mount ? (typeof MOUNTS !== "undefined" ? MOUNTS : []).find(m => m.id === mount.id) : null;

  const TIER_LABELS   = { fraco:"Fraco", normal:"Normal", forte:"Forte" };
  const TRAVEL_LABELS = {
    terrestre:"🏔 Terrestre", voador:"🌤 Voador",
    terrestre_voador:"🏔/🌤 Terrestre + Voo", terrestre_aquatico:"🏔/🌊 Terrestre + Aquático"
  };
  const encLabel = mod =>
    mod > 0 ? `<span style="color:#e07050">+${mod} encontros ▲</span>` :
    mod < 0 ? `<span style="color:#50a050">${mod} encontros ▼</span>` :
              `<span style="color:var(--ink-soft)">neutro</span>`;

  const mountCardHTML = mountData ? (() => {
    const storedItems = (mount.storedItems || []);
    const storedList  = character.inventory.filter(i => storedItems.includes(i.instanceId));
    const mountWeight = calcMountWeight(character);
    const mountCarry  = mountData.carryKg;
    const mountPct    = clamp((mountWeight / mountCarry) * 100, 0, 100);
    const mountOver   = mountWeight > mountCarry;

    return `
      <div class="mount-card">
        <div class="mount-card-head">
          <span class="mount-icon">${mountData.icon}</span>
          <div class="mount-head-info">
            <div class="mount-name">${mountData.name}</div>
            <div class="mount-species">${mountData.species} · ${TIER_LABELS[mountData.tier]||mountData.tier}</div>
          </div>
          <button class="mount-remove-btn" id="btn-remove-mount">✕ Dispensar</button>
        </div>

        <div class="mount-chip-row">
          <span class="mount-chip"><span class="mchip-k">⚡ Veloc.</span>${mountData.speed} hex</span>
          <span class="mount-chip"><span class="mchip-k">📦 Carga</span>${mountData.carryKg} kg</span>
          <span class="mount-chip"><span class="mchip-k">🗺 Viagem</span>${TRAVEL_LABELS[mountData.travel]||mountData.travel}</span>
          <span class="mount-chip"><span class="mchip-k">🎲 Encontros</span>${encLabel(mountData.encounterMod)}</span>
          ${mountData.magic ? `<span class="mount-chip mount-chip-magic">✨ Mágica — Invocável</span>` : ""}
        </div>

        <p class="mount-desc">${mountData.description}</p>

        <div class="mount-traits">
          ${mountData.traits.map(t=>`<div class="mount-trait">✦ ${t}</div>`).join("")}
          ${mountData.weakness ? `<div class="mount-trait mount-weakness">⚠ ${mountData.weakness}</div>` : ""}
        </div>

        <div class="mount-cargo-section">
          <div class="mount-cargo-title">📦 Carga Guardada (${storedList.length} iten${storedList.length!==1?"s":""})</div>
          ${storedList.length ? `
          <div class="mount-cargo-list">
            ${storedList.map(item=>`
              <div class="mount-cargo-item">
                <span class="mci-name">${escapeHTML(item.name)}</span>
                <span class="mci-weight">${round1((item.weight||0)*(item.qty||1))} kg</span>
                <button class="inv-mount-btn mounted" data-mount-item="${item.instanceId}" title="Trazer de volta">↩ Trazer</button>
              </div>`).join("")}
          </div>` : `<p class="empty-inline-note" style="font-size:11.5px;margin-top:4px">Nenhum item guardado. Use o botão 🐴 nos itens do inventário.</p>`}

          <div class="carry-meter" style="margin-top:8px">
            <div class="carry-meter-label">
              <span>${mountData.icon} Peso na montaria</span>
              <span>${mountWeight} / ${mountCarry} kg</span>
            </div>
            <div class="carry-meter-track">
              <div class="carry-meter-fill ${mountOver?"over":""}" style="width:${mountPct}%;${mountOver?"":"background:rgba(60,130,80,0.7)"}"></div>
            </div>
            ${mountOver ? `<div class="carry-meter-note">Montaria sobrecarregada! Velocidade reduzida à metade.</div>` : ""}
          </div>
        </div>
      </div>`;
  })() : "";

  const availableMounts = typeof MOUNTS !== "undefined" ? MOUNTS : [];

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">🐴 Montaria</h3>
    <p class="section-hint">Itens guardados na montaria são removidos do peso da mochila. Montarias mágicas são invocáveis. O modificador de encontros afeta viagens longas.</p>

    ${mount ? mountCardHTML : `<p class="empty-inline-note">Nenhuma montaria registrada. Adicione uma abaixo.</p>`}

    ${!mount ? `
    <div class="mount-add-form">
      <div class="mount-select-row">
        <select id="mount-select" class="field-input" style="flex:1">
          <option value="">Escolher espécie de montaria...</option>
          ${[
            { label:"── Tier Fraco · 25 kg de carga ──", opts: availableMounts.filter(m=>m.tier==="fraco") },
            { label:"── Tier Normal · 50 kg de carga ──", opts: availableMounts.filter(m=>m.tier==="normal") },
            { label:"── Tier Forte · 75 kg de carga ──",  opts: availableMounts.filter(m=>m.tier==="forte") },
          ].map(g => g.opts.length ? `
            <optgroup label="${g.label}">
              ${g.opts.map(m=>`<option value="${m.id}">${m.icon} ${m.name} — Vel.${m.speed} | ${m.carryKg}kg | ${TRAVEL_LABELS[m.travel]||m.travel}${m.magic?" ✨":""}</option>`).join("")}
            </optgroup>` : "").join("")}
        </select>
        <button class="btn-primary" id="btn-add-mount">🐴 Registrar</button>
      </div>
      <div id="mount-preview"></div>
    </div>` : ""}
  </div>`;
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

  // Total em bronze para exibição
  const totalBronze = Object.entries(CURRENCY_VALUE_IN_BRONZE)
    .reduce((sum, [k, v]) => sum + (currency[k] || 0) * v, 0);

  // Formatar total de forma legível
  function formatTotal(b) {
    if (b === 0) return "0 bronze";
    const p  = Math.floor(b / 10);
    const o  = Math.floor(b / 1000);
    const pl = Math.floor(b / 1000000);
    if (pl >= 1)  return `${pl.toLocaleString()} platina`;
    if (o  >= 1)  return `${o.toLocaleString()} ouro`;
    if (p  >= 1)  return `${p.toLocaleString()} prata`;
    return `${b.toLocaleString()} bronze`;
  }

  // Tabela de conversão: para cada moeda, de quanto vem e para quanto vai
  const convTable = [
    // bronze → prata: 10b = 1p
    { from:"bronze", fromAmt:10,  to:"prata",  toAmt:1,  label:"10 🟫 → 1 ⚪" },
    // prata → ouro: 100p = 1o
    { from:"prata",  fromAmt:100, to:"ouro",   toAmt:1,  label:"100 ⚪ → 1 🟡" },
    // ouro → platina: 1000o = 1pl
    { from:"ouro",   fromAmt:1000,to:"platina",toAmt:1,  label:"1000 🟡 → 1 ⬜" },
    // prata → bronze: 1p = 10b (troco)
    { from:"prata",  fromAmt:1,   to:"bronze", toAmt:10, label:"1 ⚪ → 10 🟫" },
    // ouro → prata: 1o = 100p (troco)
    { from:"ouro",   fromAmt:1,   to:"prata",  toAmt:100,label:"1 🟡 → 100 ⚪" },
    // platina → ouro: 1pl = 1000o (troco)
    { from:"platina",fromAmt:1,   to:"ouro",   toAmt:1000,label:"1 ⬜ → 1000 🟡" },
  ];

  const denomColors = { bronze:"#a0522d", prata:"#888", ouro:"#b8960c", platina:"#6a8fa8" };
  const denomBg     = { bronze:"rgba(160,82,45,0.09)", prata:"rgba(140,140,140,0.09)", ouro:"rgba(184,150,12,0.09)", platina:"rgba(106,143,168,0.09)" };

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">💰 Dinheiro</h3>

    <!-- Total em bronze -->
    <div class="currency-total-bar">
      <span class="currency-total-label">Total equivalente</span>
      <span class="currency-total-value" id="currency-total-display">${formatTotal(totalBronze)}</span>
      <span class="currency-total-bronze">(${totalBronze.toLocaleString()} bronze)</span>
    </div>

    <!-- Grade de moedas: 1 por linha no mobile -->
    <div class="currency-list">
      ${CURRENCY_DENOMINATIONS.map(d => `
        <div class="currency-row" style="border-left: 3px solid ${denomColors[d.key]}; background: ${denomBg[d.key]};">
          <div class="currency-row-left">
            <span class="currency-row-icon">${d.icon}</span>
            <span class="currency-row-label">${d.label}</span>
          </div>
          <div class="currency-row-controls">
            <button class="currency-btn currency-btn-dec" data-currency-dec="${d.key}" aria-label="Remover ${d.label}">−</button>
            <input type="number" class="currency-input-v2" id="currency-input-${d.key}"
                   value="${currency[d.key]}" min="0" aria-label="${d.label}">
            <button class="currency-btn currency-btn-inc" data-currency-inc="${d.key}" aria-label="Adicionar ${d.label}">+</button>
          </div>
        </div>
      `).join("")}
    </div>

    <!-- Conversores -->
    <div class="currency-converters">
      <div class="currency-conv-title">🔄 Converter</div>
      <div class="currency-conv-grid">
        <!-- Subir denominação -->
        <div class="currency-conv-group">
          <div class="currency-conv-group-label">↑ Trocar por moeda maior</div>
          ${convTable.slice(0,3).map(c => `
            <button class="currency-conv-btn" data-conv-from="${c.from}" data-conv-from-amt="${c.fromAmt}" data-conv-to="${c.to}" data-conv-to-amt="${c.toAmt}">
              ${c.label}
            </button>
          `).join("")}
        </div>
        <!-- Descer denominação (troco) -->
        <div class="currency-conv-group">
          <div class="currency-conv-group-label">↓ Dar troco</div>
          ${convTable.slice(3).map(c => `
            <button class="currency-conv-btn currency-conv-btn-down" data-conv-from="${c.from}" data-conv-from-amt="${c.fromAmt}" data-conv-to="${c.to}" data-conv-to-amt="${c.toAmt}">
              ${c.label}
            </button>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- Juntar tudo -->
    <button class="btn-secondary btn-consolidate-currency" id="btn-consolidate-currency"
            style="width:100%;margin-top:10px;">
      ⇄ Juntar tudo na maior denominação possível
    </button>

    <p class="section-hint" style="margin-top:8px;">
      1 Prata = 10 Bronze &nbsp;·&nbsp; 1 Ouro = 100 Prata &nbsp;·&nbsp; 1 Platina = 1000 Ouro
    </p>
  </div>`;
}

function renderInventorySection(character) {
  const carry  = calcCarryCapacity(character);
  const weight = calcTotalWeight(character);
  const pct    = clamp((weight / carry) * 100, 0, 100);
  const over   = weight > carry;

  // Itens na montaria
  const storedIds  = new Set((character.mount?.storedItems || []));
  const mountData  = character.mount ? (typeof MOUNTS !== "undefined" ? MOUNTS : []).find(m => m.id === character.mount.id) : null;
  const mountCarry = mountData?.carryKg || 0;
  const mountWeight = calcMountWeight(character);
  const mountPct   = mountCarry > 0 ? clamp((mountWeight / mountCarry) * 100, 0, 100) : 0;
  const mountOver  = mountWeight > mountCarry;

  const slotLabels = { primary:"Arma Primária", secondary:"Arma Secundária", shield:"Escudo", armor:"Armadura", accessory:"Acessório" };

  const itemRows = character.inventory.map(item => {
    const onMount  = storedIds.has(item.instanceId);
    const equipped = !!item.equippedSlot;
    const canMount = !equipped && !!character.mount;
    return `
      <div class="inv-row ${onMount ? "inv-row-mounted" : ""}">
        <div class="inv-row-name">
          <button class="inv-item-link" data-item-detail="${item.instanceId}" title="Ver detalhes do item">${escapeHTML(item.name)}</button>
          ${equipped
            ? `<span class="equipped-tag" style="font-size:10px">⚔ ${slotLabels[item.equippedSlot]||item.equippedSlot}</span>`
            : onMount
              ? `<span class="mount-stored-tag">🐴 Na Montaria</span>`
              : ""}
        </div>
        <div class="inv-row-actions">
          ${canMount ? `
            <button class="inv-mount-btn ${onMount?"mounted":""}" data-mount-item="${item.instanceId}" title="${onMount?"Trazer de volta da montaria":"Guardar na montaria"}">
              ${onMount ? "↩ Trazer" : "🐴 Guardar"}
            </button>` : ""}
          <button class="inv-remove-btn" data-remove-inv="${item.instanceId}" title="Remover item" ${equipped ? "disabled" : ""}>✕</button>
        </div>
      </div>`;
  }).join("");

  return `
  <div class="sheet-section">
    <div class="inventory-header-row">
      <h3 class="sheet-section-title" style="margin-bottom:0;flex:1;">Inventário (Mochila)</h3>
      <button class="btn-primary" id="btn-open-add-item-modal">+ Adicionar Item</button>
    </div>

    ${character.inventory.length > 0
      ? `<div class="inv-list">${itemRows}</div>`
      : `<p class="empty-inline-note">A mochila está vazia. Use "+ Adicionar Item" para registrar itens encontrados.</p>`}

    <div class="carry-meter" style="margin-top:10px">
      <div class="carry-meter-label">
        <span>🎒 Mochila</span>
        <span>${weight} / ${carry} kg</span>
      </div>
      <div class="carry-meter-track">
        <div class="carry-meter-fill ${over ? "over" : ""}" style="width:${pct}%"></div>
      </div>
      ${over ? `<div class="carry-meter-note">Sobrecarregado! Penalidades de Movimento até o peso ser reduzido.</div>` : ""}
    </div>

    ${character.mount && mountData ? `
    <div class="carry-meter" style="margin-top:6px">
      <div class="carry-meter-label">
        <span>${mountData.icon} ${mountData.name}</span>
        <span>${mountWeight} / ${mountCarry} kg</span>
      </div>
      <div class="carry-meter-track">
        <div class="carry-meter-fill ${mountOver ? "over" : ""}" style="width:${mountPct}%;background:${mountOver?"":"rgba(60,130,80,0.7)"}"></div>
      </div>
      ${mountOver ? `<div class="carry-meter-note">Montaria sobrecarregada! Velocidade reduzida à metade.</div>` : ""}
    </div>` : ""}
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

  let html = `
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
        <div class="print-combat-cell"><span class="print-combat-label">Ações</span><span class="print-combat-value">${actions}</span></div>        <div class="print-combat-cell"><span class="print-combat-label">Ações de Magia</span><span class="print-combat-value">${spellActions}</span></div>
        <div class="print-combat-cell"><span class="print-combat-label">Def. Física</span><span class="print-combat-value">${physDef}</span></div>
        <div class="print-combat-cell"><span class="print-combat-label">Def. Mágica</span><span class="print-combat-value">${magDef}</span></div>
        <div class="print-combat-cell"><span class="print-combat-label">Slots de Magia</span><span class="print-combat-value">${slots}</span></div>
        <div class="print-combat-cell"><span class="print-combat-label">Carga</span><span class="print-combat-value">${weight}/${carry}kg</span></div>
        <div class="print-combat-cell" style="border-color:#d72638"><span class="print-combat-label" style="color:#d72638">🎯 Crítico (d10)</span><span class="print-combat-value">${calcCritChance(character)} ou menos</span></div>
        <div class="print-combat-cell" style="border-color:#d72638"><span class="print-combat-label" style="color:#d72638">💥 Dano Crítico</span><span class="print-combat-value">+${calcCritDamageBonus(character)}%</span></div>
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
            ${[
              { label: "Arma Primária",   item: equippedPrimary   },
              { label: "Arma Secundária", item: equippedSecondary },
              { label: "Escudo",          item: equippedShield    },
              { label: "Armadura",        item: equippedArmor     },
            ].map(({ label, item }) => {
              if (!item) return `<tr><td class="print-table-label">${label}</td><td>—</td></tr>`;
              const bd = item.baseData || {};
              const tier = bd.tier || "";
              const isRare = ["raro","magico","lendario","unico","ancestral"].includes(tier);
              const dmg  = bd.dmg  ? ` · Dano: ${bd.dmg}` : "";
              const pDef = bd.physDefense != null ? ` · Def.Fís: ${bd.physDefense}` : "";
              const mDef = bd.magDefense  != null ? ` · Def.Mag: ${bd.magDefense}`  : "";
              const wt   = bd.weight != null ? ` · ${bd.weight}kg` : "";
              const tierBadge = isRare ? ` <em style="color:#7a5c10">[${tier}]</em>` : "";
              const statLine = `${dmg}${pDef}${mDef}${wt}`;
              const noteLine = isRare && (bd.note || bd.effect)
                ? `<div style="font-size:7.5pt;color:#555;margin-top:2px;padding-left:4px;border-left:2px solid #c8a87a">${escapeHTML((bd.note || bd.effect || "").substring(0, 180))}${(bd.note || bd.effect || "").length > 180 ? "…" : ""}</div>`
                : "";
              return `<tr>
                <td class="print-table-label" style="vertical-align:top">${label}</td>
                <td>
                  <strong>${escapeHTML(item.name)}</strong>${tierBadge}${statLine ? `<br><span style="font-size:7.5pt;color:#666">${statLine}</span>` : ""}
                  ${noteLine}
                </td>
              </tr>`;
            }).join("")}
            ${equippedAccessories.length ? `
            <tr>
              <td class="print-table-label" style="vertical-align:top">Acessórios</td>
              <td>
                ${equippedAccessories.map(a => {
                  const bd = a.baseData || {};
                  const tier = bd.tier || "";
                  const isRare = ["raro","magico","lendario","unico","ancestral"].includes(tier);
                  const tierBadge = isRare ? ` <em style="color:#7a5c10">[${tier}]</em>` : "";
                  const noteLine = isRare && (bd.effect || bd.note)
                    ? `<div style="font-size:7.5pt;color:#555;margin:1px 0 3px 4px;padding-left:4px;border-left:2px solid #c8a87a">${escapeHTML((bd.effect || bd.note || "").substring(0, 140))}${(bd.effect || bd.note || "").length > 140 ? "…" : ""}</div>`
                    : "";
                  return `<strong>${escapeHTML(a.name)}</strong>${tierBadge}${noteLine}`;
                }).join("<br>")}
              </td>
            </tr>` : `<tr><td class="print-table-label">Acessórios</td><td>—</td></tr>`}
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

    ${(() => {
      const sc = character.subclassKey ? SUBCLASSES[character.subclassKey] : null;
      if (!sc) return "";
      const chosen = (character.skills.abilities || []).filter(id =>
        sc.skills.some(sk => sk.id === id)
      );
      if (!chosen.length) return "";
      const abilityLevels = character.skills.abilityLevels || {};
      return `
    <div class="print-box print-box-subclass">
      <div class="print-box-title">${sc.icon} Habilidades de Subclasse — ${sc.name}</div>
      <ul class="print-compact-list subclass-list">
        ${chosen.map(id => {
          const sk = sc.skills.find(s => s.id === id);
          if (!sk) return "";
          const currentLevel = abilityLevels[id] || 1;
          const levelData = sk.levels[currentLevel - 1];
          const synTag = !sk.commonToAll && Array.isArray(sk.sinergyClasses) && sk.sinergyClasses.includes(character.classKey)
            ? " ✨" : "";
          const commonTag = sk.commonToAll ? " <em style='font-size:7.5pt;color:#7a9a7a'>[qualquer classe]</em>" : "";
          return `<li><strong>${sk.name}</strong>${synTag}${commonTag} [Nv.${currentLevel}/${sk.levels.length}] (${sk.cost})<br><span style="font-size:8.5pt;color:#444">${levelData.effect}</span></li>`;
        }).filter(Boolean).join("")}
      </ul>
    </div>`;
    })()}

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

  // Bloco de maldições e bênçãos ativas
  const activeCBIds = character.activeCurses || [];
  if (activeCBIds.length) {
    const ALL_CB = [
      ...CURSES.map(c    => ({ ...c, type:"curse"    })),
      ...BLESSINGS.map(b => ({ ...b, type:"blessing" })),
    ];
    const TIER_LABELS = { menor:"Menor", media:"Média", poderosa:"Poderosa" };
    const activeCurses   = activeCBIds.map(id => ALL_CB.find(x => x.id === id)).filter(x => x && x.type === "curse");
    const activeBlessing = activeCBIds.map(id => ALL_CB.find(x => x.id === id)).filter(x => x && x.type === "blessing");

    const renderCBPrintCard = (item) => {
      const isCurse = item.type === "curse";
      const borderColor = isCurse ? "#c05050" : "#40a060";
      const mechHTML = item.mechanical ? Object.entries(item.mechanical).map(([k,v]) =>
        `<span style="font-size:7.5pt;padding:1px 5px;border-radius:4px;background:${k==="bonus"?"rgba(40,140,60,0.12)":"rgba(160,40,40,0.1)"};color:${k==="bonus"?"#3a7040":"#904040"}">${k==="bonus"?"✦ ":"▼ "}${v}</span>`
      ).join("&nbsp;") : "";
      return `
        <div style="border:1px solid ${borderColor};border-left:3px solid ${borderColor};border-radius:6px;padding:6px 8px;margin-bottom:5px;background:${isCurse?"rgba(140,30,30,0.04)":"rgba(30,100,50,0.04)"}">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:15px">${item.icon}</span>
            <strong style="font-size:9.5pt">${item.name}</strong>
            <span style="font-size:7.5pt;color:#888;margin-left:auto">${isCurse?"Maldição":"Bênção"} · ${TIER_LABELS[item.tier]||item.tier}</span>
          </div>
          <p style="font-size:8.5pt;color:#333;margin:0 0 3px;line-height:1.5">${item.effect}</p>
          ${mechHTML ? `<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:3px">${mechHTML}</div>` : ""}
          ${item.duration ? `<div style="font-size:7.5pt;color:#888;margin-top:2px">⏳ ${item.duration}</div>` : ""}
          ${item.removal && isCurse ? `<div style="font-size:7.5pt;color:#508050;margin-top:1px">🔑 ${item.removal}</div>` : ""}
        </div>`;
    };

    const cursesBlock = activeCurses.length ? `
      <div class="print-box" style="border-left:3px solid #c05050">
        <div class="print-box-title" style="color:#c05050">💀 Maldições Ativas (${activeCurses.length})</div>
        ${activeCurses.map(renderCBPrintCard).join("")}
      </div>` : "";

    const blessBlock = activeBlessing.length ? `
      <div class="print-box" style="border-left:3px solid #40a060">
        <div class="print-box-title" style="color:#3a8050">✨ Bênçãos Ativas (${activeBlessing.length})</div>
        ${activeBlessing.map(renderCBPrintCard).join("")}
      </div>` : "";

    const cbSection = cursesBlock || blessBlock ? `
      <div class="print-two-col" style="margin-top:8px">
        ${cursesBlock}
        ${blessBlock}
      </div>` : "";

    html = html.replace(
      `<div class="print-footer">`,
      cbSection + `<div class="print-footer">`
    );
  }

  return html;
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

  // Aprender habilidade de SUBCLASSE (custa 2 pontos)
  document.querySelectorAll("[data-learn-subclass-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const points = character.unspentSkillPoints || 0;
      if (points < 2) { showToast("Aprender habilidade de subclasse custa 2 pontos. Você não tem pontos suficientes."); return; }
      const id = btn.dataset.learnSubclassId;
      if (!character.skills.abilities) character.skills.abilities = [];
      if (!character.skills.abilityLevels) character.skills.abilityLevels = {};
      if (character.skills.abilities.includes(id)) return;
      // Checar bloqueio de nível para subclasses puras
      const isPuro = character.subclassKey?.endsWith("-puro");
      const sc     = SUBCLASSES[character.subclassKey];
      const sk     = sc?.skills.find(s => s.id === id);
      if (isPuro && (character.level || 1) < 4) {
        showToast("Habilidades de subclasse pura só podem ser aprendidas a partir do Nível 4.");
        return;
      }
      character.skills.abilities.push(id);
      character.skills.abilityLevels[id] = 1;
      character.unspentSkillPoints -= 2;
      persistCurrentCharacter();
      renderSheet();
      showToast(`Habilidade "${sk?.name || id}" aprendida! (2 pontos gastos)`);
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

  // Handlers de Maldições & Bênçãos
  const cbAddCurse = document.getElementById("cb-btn-add-curse");
  if (cbAddCurse) cbAddCurse.addEventListener("click", () => {
    const sel = document.getElementById("cb-select-curse");
    const id  = sel?.value;
    if (!id) return;
    if (!character.activeCurses) character.activeCurses = [];
    if (!character.activeCurses.includes(id)) {
      character.activeCurses.push(id);
      persistCurrentCharacter();
      renderSheet();
      showToast("Maldição aplicada.");
    }
  });

  const cbAddBlessing = document.getElementById("cb-btn-add-blessing");
  if (cbAddBlessing) cbAddBlessing.addEventListener("click", () => {
    const sel = document.getElementById("cb-select-blessing");
    const id  = sel?.value;
    if (!id) return;
    if (!character.activeCurses) character.activeCurses = [];
    if (!character.activeCurses.includes(id)) {
      character.activeCurses.push(id);
      persistCurrentCharacter();
      renderSheet();
      showToast("Bênção concedida.");
    }
  });

  document.querySelectorAll("[data-remove-curse]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.removeCurse;
      character.activeCurses = (character.activeCurses || []).filter(x => x !== id);
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
  // ── Clique no nome do item → modal de detalhes ────────────────
  document.querySelectorAll("[data-item-detail]").forEach(btn => {
    btn.addEventListener("click", () => {
      const instanceId = btn.dataset.itemDetail;
      const item = character.inventory.find(i => i.instanceId === instanceId);
      if (item) openItemDetailModal(item, character);
    });
  });

  // ── Handlers de Montaria ──────────────────────────────────────
  const mountSelect  = document.getElementById("mount-select");
  const mountPreview = document.getElementById("mount-preview");

  if (mountSelect && mountPreview) {
    const TRAVEL_LABELS = {
      terrestre:"🏔 Terrestre", voador:"🌤 Voador",
      terrestre_voador:"🏔/🌤 Terrestre + Voo", terrestre_aquatico:"🏔/🌊 Terrestre + Aquático"
    };
    mountSelect.addEventListener("change", () => {
      const m = (typeof MOUNTS !== "undefined" ? MOUNTS : []).find(x => x.id === mountSelect.value);
      if (!m) { mountPreview.innerHTML = ""; return; }
      const encTxt = m.encounterMod > 0 ? `+${m.encounterMod} (mais encontros)` : m.encounterMod < 0 ? `${m.encounterMod} (menos encontros)` : "Neutro";
      mountPreview.innerHTML = `
        <div class="mount-preview-card">
          <div style="font-size:26px;margin-bottom:4px">${m.icon}</div>
          <strong style="font-size:13px">${m.name}</strong>
          <div style="font-size:12px;color:var(--ink-soft);margin:4px 0;font-style:italic">${m.description}</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px">
            <span class="mount-chip"><span class="mchip-k">⚡ Veloc.</span>${m.speed} hex</span>
            <span class="mount-chip"><span class="mchip-k">📦 Carga</span>${m.carryKg}kg</span>
            <span class="mount-chip"><span class="mchip-k">🗺 Viagem</span>${TRAVEL_LABELS[m.travel]||m.travel}</span>
            <span class="mount-chip"><span class="mchip-k">🎲 Encontros</span>${encTxt}</span>
            ${m.magic ? `<span class="mount-chip mount-chip-magic">✨ Mágica — Invocável</span>` : ""}
          </div>
          <div style="margin-top:7px;display:flex;flex-direction:column;gap:3px">
            ${m.traits.map(t=>`<div style="font-size:11.5px">✦ ${t}</div>`).join("")}
            ${m.weakness ? `<div style="font-size:11.5px;color:#c05050">⚠ ${m.weakness}</div>` : ""}
          </div>
        </div>`;
    });
  }

  const addMountBtn = document.getElementById("btn-add-mount");
  if (addMountBtn) addMountBtn.addEventListener("click", () => {
    const sel = document.getElementById("mount-select");
    const id  = sel?.value;
    if (!id) { showToast("Escolha uma montaria antes de registrar."); return; }
    character.mount = { id, storedItems: [] };
    persistCurrentCharacter();
    renderSheet();
    showToast("Montaria registrada!");
  });

  const removeMountBtn = document.getElementById("btn-remove-mount");
  if (removeMountBtn) removeMountBtn.addEventListener("click", () => {
    if (!confirm("Dispensar a montaria? Itens guardados voltarão para a mochila.")) return;
    character.mount = null;
    persistCurrentCharacter();
    renderSheet();
    showToast("Montaria dispensada.");
  });

  // Guardar / trazer item da montaria (toggle)
  document.querySelectorAll("[data-mount-item]").forEach(btn => {
    btn.addEventListener("click", () => {
      const instanceId = btn.dataset.mountItem;
      if (!character.mount) return;
      if (!character.mount.storedItems) character.mount.storedItems = [];
      const idx = character.mount.storedItems.indexOf(instanceId);
      if (idx === -1) {
        // Verificar capacidade antes de guardar
        const mountData = (typeof MOUNTS !== "undefined" ? MOUNTS : []).find(m => m.id === character.mount.id);
        const currentMountWeight = calcMountWeight(character);
        const item = character.inventory.find(i => i.instanceId === instanceId);
        const itemWeight = (item?.weight || 0) * (item?.qty || 1);
        if (mountData && currentMountWeight + itemWeight > mountData.carryKg) {
          showToast(`Montaria sem espaço! (${currentMountWeight}/${mountData.carryKg} kg)`);
          return;
        }
        character.mount.storedItems.push(instanceId);
        showToast("Item guardado na montaria.");
      } else {
        character.mount.storedItems.splice(idx, 1);
        showToast("Item trazido de volta para a mochila.");
      }
      persistCurrentCharacter();
      renderSheet();
    });
  });

  // ── Handlers de Inventário ────────────────────────────────────
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

  // Botões de conversão bidirecional
  document.querySelectorAll("[data-conv-from]").forEach(btn => {
    btn.addEventListener("click", () => {
      const from    = btn.dataset.convFrom;
      const fromAmt = parseInt(btn.dataset.convFromAmt);
      const to      = btn.dataset.convTo;
      const toAmt   = parseInt(btn.dataset.convToAmt);
      const cur     = ensureCurrency(character);
      if ((cur[from] || 0) < fromAmt) {
        showToast(`Você não tem ${fromAmt} ${from} suficientes para converter.`);
        return;
      }
      cur[from] = (cur[from] || 0) - fromAmt;
      cur[to]   = (cur[to]   || 0) + toAmt;
      persistCurrentCharacter();
      renderSheet();
      showToast(`Convertido: −${fromAmt} ${from} → +${toAmt} ${to}.`);
    });
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

/* ── Modal de Detalhes do Item ───────────────────────────────── */

function openItemDetailModal(item, character) {
  const overlay = document.getElementById("item-detail-overlay");
  const box     = document.getElementById("item-detail-box");
  if (!overlay || !box) return;

  const bd   = item.baseData || {};
  const tier = bd.tier || "comum";

  const TIER_LABEL = { comum:"Comum", raro:"Raro", magico:"Mágico", lendario:"Lendário", unico:"Único", ancestral:"Ancestral" };
  const TIER_COLOR = {
    comum:    "#888",
    raro:     "#4a90d9",
    magico:   "#b070d0",
    lendario: "#d06040",
    unico:    "#c0900a",
    ancestral:"#d4a830"
  };
  const CAT_LABEL = { weapon:"Arma", shield:"Escudo", armor:"Armadura", accessory:"Acessório", misc:"Item", gear:"Item Geral", potion:"Poção" };

  // Chips de stats
  const chips = [];
  if (bd.dmg)            chips.push({ icon:"⚔", label:"Dano",          val: bd.dmg });
  if (bd.physDefense)    chips.push({ icon:"🛡", label:"Def. Física",   val:`+${bd.physDefense}` });
  if (bd.magDefense)     chips.push({ icon:"✨", label:"Def. Mágica",   val:`+${bd.magDefense}` });
  if (bd.range)          chips.push({ icon:"🎯", label:"Alcance",       val:`${bd.range} hex` });
  if (bd.movePenalty)    chips.push({ icon:"🏃", label:"Pen. Movimento",val: bd.movePenalty > 0 ? `−${bd.movePenalty}` : `+${-bd.movePenalty}` });
  if (bd.penalty && bd.penalty !== "Nenhuma") chips.push({ icon:"⚠", label:"Penalidade", val: bd.penalty });
  if (bd.weight != null) chips.push({ icon:"⚖", label:"Peso",          val:`${bd.weight}kg` });
  if (bd.req)            chips.push({ icon:"📋", label:"Requisito",     val: formatReq(bd.req) });
  if (item.qty > 1)      chips.push({ icon:"🔢", label:"Quantidade",    val: item.qty });

  // magicBonus
  const MB = { hp:"❤ HP", move:"🏃 Mov", actions:"⚡ Ações", spellActions:"✨ Ações Magia", slots:"🔮 Slots", carry:"📦 Carga", critChance:"🎯 Chance Crit", critDamage:"💥 Dano Crit %" };
  if (bd.magicBonus) {
    Object.entries(bd.magicBonus).forEach(([k,v]) => {
      if (!v) return;
      if (k === "attr" || k === "attrValue") return;
      chips.push({ icon:"💎", label: MB[k]||k, val:`+${v}` });
    });
    if (bd.magicBonus.attr && bd.magicBonus.attrValue)
      chips.push({ icon:"💎", label: bd.magicBonus.attr, val:`+${bd.magicBonus.attrValue}` });
  }

  const chipsHTML = chips.length ? `
    <div class="idd-chips">
      ${chips.map(c=>`
        <span class="idd-chip">
          <span class="idd-chip-icon">${c.icon}</span>
          <span class="idd-chip-label">${c.label}</span>
          <span class="idd-chip-val">${c.val}</span>
        </span>`).join("")}
    </div>` : "";

  // Slot de equipamento atual
  const SLOT_LABEL = { primary:"⚔ Arma Primária", secondary:"⚔ Arma Secundária", shield:"🛡 Escudo", armor:"🧥 Armadura", accessory:"💍 Acessório" };
  const slotBadge = item.equippedSlot
    ? `<span class="idd-badge idd-badge-equipped">${SLOT_LABEL[item.equippedSlot]||item.equippedSlot} — Equipado</span>`
    : "";

  // Na montaria?
  const onMount = (character.mount?.storedItems||[]).includes(item.instanceId);
  const mountBadge = onMount ? `<span class="idd-badge idd-badge-mount">🐴 Na Montaria</span>` : "";

  // Set
  const setBadge = bd.setName ? `<span class="idd-badge idd-badge-set">✦ Set: ${bd.setName}</span>` : "";
  const cursedBadge = bd.cursed ? `<span class="idd-badge idd-badge-cursed">⚠ Amaldiçoado</span>` : "";
  const divineBadge = bd.divine ? `<span class="idd-badge idd-badge-divine">🌟 ${bd.divine}</span>` : "";
  const magicBadge  = bd.magicBonus && Object.values(bd.magicBonus).some(v=>v) && tier === "comum"
    ? `<span class="idd-badge idd-badge-magic">✨ Mágico</span>` : "";
  const consumBadge = bd.consumable ? `<span class="idd-badge idd-badge-consumable">🔥 Consumível</span>` : "";

  box.innerHTML = `
    <div class="idd-header">
      <div class="idd-title-row">
        <h2 class="idd-name">${escapeHTML(item.name)}</h2>
        <button class="idd-close-btn" id="item-detail-close" aria-label="Fechar">✕</button>
      </div>
      <div class="idd-meta-row">
        <span class="idd-tier" style="color:${TIER_COLOR[tier]};border-color:${TIER_COLOR[tier]}">${TIER_LABEL[tier]||tier}</span>
        <span class="idd-cat">${CAT_LABEL[item.category]||item.category}</span>
        ${slotBadge}${mountBadge}${setBadge}${cursedBadge}${divineBadge}${magicBadge}${consumBadge}
      </div>
    </div>

    ${chipsHTML}

    ${bd.effect ? `
    <div class="idd-section">
      <div class="idd-section-label">📜 Efeito</div>
      <p class="idd-text">${escapeHTML(bd.effect)}</p>
    </div>` : ""}

    ${bd.note ? `
    <div class="idd-section">
      <div class="idd-section-label">✦ Nota</div>
      <p class="idd-text idd-note">${escapeHTML(bd.note)}</p>
    </div>` : ""}

    ${bd.story ? `
    <div class="idd-section">
      <div class="idd-section-label">📖 História</div>
      <p class="idd-text idd-story">"${escapeHTML(bd.story)}"</p>
    </div>` : ""}

    ${(!bd.effect && !bd.note && !bd.story) ? `
    <div class="idd-section">
      <p class="idd-text" style="color:var(--ink-soft);font-style:italic">Item sem descrição adicional.</p>
    </div>` : ""}

    <div class="idd-footer">
      ${bd.subcategory === "recipe_scroll" && bd.recipeId ? `
        <button class="btn-primary" id="btn-use-recipe-scroll" style="flex:1">
          📜 Aprender Receita
        </button>` : ""}
      <button class="btn-secondary" id="item-detail-close-footer">Fechar</button>
    </div>`;

  overlay.classList.remove("hidden");

  // Fechar
  const close = () => overlay.classList.add("hidden");
  document.getElementById("item-detail-close")?.addEventListener("click", close);
  document.getElementById("item-detail-close-footer")?.addEventListener("click", close);
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); }, { once: true });

  // Usar Pergaminho de Receita
  document.getElementById("btn-use-recipe-scroll")?.addEventListener("click", () => {
    if (!item.recipeId) return;
    if (!character.knownRecipes) character.knownRecipes = [];
    if (character.knownRecipes.includes(item.recipeId)) {
      showToast("Você já conhece esta receita!");
      return;
    }
    character.knownRecipes.push(item.recipeId);
    // Remove o pergaminho do inventário
    character.inventory = character.inventory.filter(i => i.instanceId !== item.instanceId);
    persistCurrentCharacter();
    renderSheet();
    close();
    showToast(`📜 Receita "${item.name.replace("Pergaminho de Receita: ", "")}" aprendida! Abra a página de Alquimia para criar.`);
  });
}

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

/* Mapeamento de tipo-chip → categoria e predicado */
/* ── Catálogo de itens ── */

/* Mapeamento tipo-chip → itens */
function getItemsByType(type) {
  const all_w1 = (WEAPONS_ONE_HAND || []).filter(Boolean).map(i => ({ ...i, _cat:"weapon"    }));
  const all_w2 = (WEAPONS_TWO_HAND || []).filter(Boolean).map(i => ({ ...i, _cat:"weapon"    }));
  const all_wr = (WEAPONS_RANGED   || []).filter(Boolean).map(i => ({ ...i, _cat:"weapon"    }));
  const all_wm = (WEAPONS_MAGIC    || []).filter(Boolean).map(i => ({ ...i, _cat:"weapon"    }));
  const all_sh = (SHIELDS          || []).filter(Boolean).map(i => ({ ...i, _cat:"shield"    }));
  const all_ar = (ARMORS           || []).filter(Boolean).map(i => ({ ...i, _cat:"armor"     }));
  const all_ac = (ACCESSORIES      || []).filter(Boolean).map(i => ({ ...i, _cat:"accessory" }));
  const miscAll  = (MISC_ITEMS || []).filter(Boolean).map(i => ({ ...i, _cat:"misc" }));
  const misc = sub => sub ? miscAll.filter(i => i.subcategory === sub) : miscAll;

  // Materiais: craftingMaterial:true  OU  smithingMaterial:true
  const matItems = miscAll.filter(i => i.craftingMaterial || i.smithingMaterial);

  switch (type) {
    case "weapon1h":       return all_w1;
    case "weapon2h":       return all_w2;
    case "weaponranged":   return all_wr;
    case "weaponmagic":    return all_wm;
    case "shield":         return all_sh;
    case "armorleve":      return all_ar.filter(a => (a.weight||0) <= 5  && !(a.movePenalty > 0));
    case "armormedia":     return all_ar.filter(a => (a.weight||0) >  5  && (a.weight||0) <= 12);
    case "armorpesada":    return all_ar.filter(a => (a.weight||0) > 12  ||  (a.movePenalty > 0));
    case "accessory":      return all_ac;
    case "misc":           return misc(null);
    case "misc-potion":    return misc("potion");
    case "misc-scroll":    return misc("scroll");
    case "misc-artefato":  return misc("artefato");
    case "misc-gear":      return misc("gear");
    case "misc-recipe":    return misc("recipe_scroll");
    case "misc-material":  return matItems;
    default:               return [
      ...all_w1, ...all_w2, ...all_wr, ...all_wm,
      ...all_sh, ...all_ar, ...all_ac, ...miscAll,
    ];
  }
}

/* Filtragem com busca + tier */
function getFilteredCatalogItems() {
  let items = getItemsByType(catalogFilters.type).filter(i => i && i.name);

  if (catalogFilters.tier) {
    items = items.filter(i => (i.tier || "comum") === catalogFilters.tier);
  }

  if (catalogFilters.search) {
    const q = catalogFilters.search.toLowerCase();
    items = items.filter(i =>
      (i.name || "").toLowerCase().includes(q) ||
      (i.effect || "").toLowerCase().includes(q) ||
      (i.note  || "").toLowerCase().includes(q) ||
      (i.story || "").toLowerCase().includes(q) ||
      (i.materialTag || "").toLowerCase().includes(q) ||
      (i.subcategory || "").toLowerCase().includes(q)
    );
  }
  return items;
}

/* Labels auxiliares */
function tierLabel(t) {
  return { comum:"Comum", raro:"Raro", magico:"Mágico", lendario:"Lendário",
           unico:"Único", ancestral:"Ancestral" }[t] || t || "Comum";
}
function tierClass(t) {
  return "tier-" + (t || "comum");
}
function typeLabel(item) {
  if (item._cat === "shield")    return "Escudo";
  if (item._cat === "armor")     return "Armadura";
  if (item._cat === "accessory") return "Acessório";
  if (item._cat === "misc") {
    if (item.craftingMaterial || item.smithingMaterial)
      return item.smeltingType === "armor" ? "🪨 Mat. Armadura"
           : item.smeltingType === "weapon" ? "⚒ Mat. Arma"
           : "🌿 Material";
    return { potion:"🧪 Poção", scroll:"📜 Pergaminho",
             artefato:"💎 Artefato", gear:"🎒 Equipamento",
             recipe_scroll:"📜 Receita", material:"🌿 Material" }[item.subcategory] || "Misc.";
  }
  if (item._cat === "weapon") {
    if ((WEAPONS_MAGIC  || []).some(w => w.name === item.name)) return "✨ Arcana";
    if ((WEAPONS_RANGED || []).some(w => w.name === item.name)) return "🏹 Ranged";
    if ((WEAPONS_TWO_HAND || []).some(w => w.name === item.name)) return "⚔ 2M";
    return "🗡 1M";
  }
  return "—";
}

/* Renderiza a lista filtrada */
function renderCatalogItemList() {
  const container = document.getElementById("catalog-item-list");
  const countEl   = document.getElementById("catalog-result-count");
  if (!container) return;

  const items = getFilteredCatalogItems();
  if (countEl) countEl.textContent = `${items.length} ite${items.length !== 1 ? "ns" : "m"}`;

  if (items.length === 0) {
    container.innerHTML = `<p class="catalog-empty">Nenhum item encontrado para estes filtros.</p>`;
    if (catalogSelectedItem) { catalogSelectedItem = null; updateCatalogItemPreview(); }
    return;
  }

  /* Se o item selecionado não está no conjunto filtrado, limpar seleção */
  if (catalogSelectedItem && !items.some(i => i.name === catalogSelectedItem.name && i._cat === catalogSelectedItem._cat)) {
    catalogSelectedItem = null;
  }

  container.innerHTML = items.map((item, idx) => {
    const tier       = item.tier || "comum";
    const isSelected = catalogSelectedItem && catalogSelectedItem.name === item.name && catalogSelectedItem._cat === item._cat;
    const stat = item.dmg
      ? `⚔ ${item.dmg}`
      : item.physDefense !== undefined
      ? `🛡 ${item.physDefense} Def.`
      : item.effect
      ? item.effect.slice(0, 44) + (item.effect.length > 44 ? "…" : "")
      : "";

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

  /* Handlers de seleção */
  container.querySelectorAll(".catalog-list-item").forEach((el, idx) => {
    el.addEventListener("click", () => {
      catalogSelectedItem = items[idx];
      _syncHiddenCatalogSelects(catalogSelectedItem);
      renderCatalogItemList();
      updateCatalogItemPreview();
      updateAddItemWeightPreview();
    });
  });

  /* Pré-selecionar primeiro se nada selecionado */
  if (!catalogSelectedItem && items.length > 0) {
    catalogSelectedItem = items[0];
    _syncHiddenCatalogSelects(catalogSelectedItem);
    updateCatalogItemPreview();
    updateAddItemWeightPreview();
  } else if (catalogSelectedItem) {
    updateCatalogItemPreview();
  }
}

/* Sincroniza os selects ocultos (legado) */
function _syncHiddenCatalogSelects(item) {
  const hiddenCat = document.getElementById("catalog-category-select");
  const hiddenSel = document.getElementById("catalog-item-select");
  if (hiddenCat) hiddenCat.value = item._cat;
  if (hiddenSel) {
    hiddenSel.innerHTML = `<option value="${escapeHTML(item.name)}">${escapeHTML(item.name)}</option>`;
    hiddenSel.value = item.name;
  }
}

/* Preview do item selecionado */
function updateCatalogItemPreview() {
  const preview = document.getElementById("catalog-item-preview");
  if (!preview) return;
  const item = catalogSelectedItem;
  if (!item) { preview.classList.add("hidden"); return; }
  preview.classList.remove("hidden");

  const magLines  = item.magicBonus ? Object.entries(item.magicBonus)
    .filter(([k]) => k !== "attr" && k !== "attrValue" && k !== "attr2" && k !== "attrValue2")
    .map(([k,v]) => {
      const lbl = { actions:"Ações", spellActions:"Ações de Magia", hp:"HP", carry:"Carga",
                    slots:"Slots", move:"Movimento",
                    critChance:"🎯 Chance Crítico", critDamage:"💥 Dano Crítico %" }[k];
      return v > 0 && lbl ? `<span class="catalog-preview-bonus">+${v} ${lbl}</span>` : null;
    }).filter(Boolean).join("") : "";
  const attrBonus  = item.magicBonus?.attr  ? `<span class="catalog-preview-bonus">+${item.magicBonus.attrValue} ${item.magicBonus.attr}</span>`   : "";
  const attrBonus2 = item.magicBonus?.attr2 ? `<span class="catalog-preview-bonus">+${item.magicBonus.attrValue2} ${item.magicBonus.attr2}</span>` : "";

  const matTag = (item.craftingMaterial || item.smithingMaterial)
    ? `<div class="catalog-preview-row" style="color:#7a5a10"><span>Tag:</span> <code>${item.materialTag || "—"}</code></div>` : "";
  const chargesHtml = item.charges
    ? `<div class="catalog-preview-row"><span>Cargas:</span> <strong>${item.charges.max} ${item.charges.label} / ${item.charges.resetOn}</strong></div>` : "";
  const rangeHtml = item.range
    ? `<div class="catalog-preview-row"><span>Alcance:</span> <strong>${item.range} hex</strong></div>` : "";

  preview.innerHTML = `
    <div class="catalog-preview-header">
      <span class="catalog-preview-name">${escapeHTML(item.name)}</span>
      <span class="catalog-item-tier ${tierClass(item.tier||"comum")}">${tierLabel(item.tier||"comum")}</span>
    </div>
    ${item.setName   ? `<div class="catalog-preview-set">Conjunto: <em>${item.setName}</em></div>` : ""}
    <div class="catalog-preview-stats">
      ${item.dmg           ? `<div class="catalog-preview-row"><span>Dano:</span>      <strong>${item.dmg}</strong></div>` : ""}
      ${item.physDefense !== undefined ? `<div class="catalog-preview-row"><span>Def.Física:</span> <strong>${item.physDefense}</strong></div>` : ""}
      ${item.magDefense  !== undefined ? `<div class="catalog-preview-row"><span>Def.Mágica:</span> <strong>${item.magDefense}</strong></div>` : ""}
      ${item.movePenalty ? `<div class="catalog-preview-row"><span>Pen.Mov.:</span>   <strong>−${item.movePenalty}</strong></div>` : ""}
      ${item.req         ? `<div class="catalog-preview-row"><span>Req.:</span>        <strong>${item.req}</strong></div>` : ""}
      ${item.weight !== undefined ? `<div class="catalog-preview-row"><span>Peso:</span> <strong>${item.weight}kg</strong></div>` : ""}
      ${item.consumable  ? `<div class="catalog-preview-row" style="color:var(--wax-red-dark)"><span>Tipo:</span> <strong>🔥 Consumível</strong></div>` : ""}
      ${chargesHtml}${rangeHtml}${matTag}
    </div>
    ${(magLines || attrBonus || attrBonus2) ? `<div class="catalog-preview-bonuses">${magLines}${attrBonus}${attrBonus2}</div>` : ""}
    ${item.effect ? `<div class="catalog-preview-effect">${escapeHTML(item.effect)}</div>` : ""}
    ${item.note   ? `<div class="catalog-preview-note">📌 ${escapeHTML(item.note)}</div>`  : ""}
    ${item.story  ? `<div class="catalog-preview-story">"${escapeHTML(item.story)}"</div>` : ""}
  `;
}

/* ── Estado dos filtros ─────────────────────────────────────────── */
let catalogFilters     = { type:"", tier:"", search:"" };
let catalogSelectedItem = null;

/* ── Chips de tipo ──────────────────────────────────────────────── */
document.querySelectorAll("#catalog-type-chips .catalog-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#catalog-type-chips .catalog-chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    catalogFilters.type   = btn.dataset.catalogType;
    catalogSelectedItem   = null;
    renderCatalogItemList();
    updateAddItemWeightPreview();
  });
});

/* ── Chips de tier ──────────────────────────────────────────────── */
document.querySelectorAll("#catalog-tier-chips .catalog-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#catalog-tier-chips .catalog-chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    catalogFilters.tier   = btn.dataset.catalogTier;
    catalogSelectedItem   = null;
    renderCatalogItemList();
    updateAddItemWeightPreview();
  });
});

/* ── Busca em tempo real ────────────────────────────────────────── */
document.getElementById("catalog-search").addEventListener("input", e => {
  catalogFilters.search = e.target.value.trim().toLowerCase();
  /* Ao digitar, limpar seleção só se o item atual não bater mais */
  if (catalogSelectedItem) {
    const q = catalogFilters.search;
    const still = !q ||
      (catalogSelectedItem.name || "").toLowerCase().includes(q) ||
      (catalogSelectedItem.effect || "").toLowerCase().includes(q) ||
      (catalogSelectedItem.materialTag || "").toLowerCase().includes(q);
    if (!still) catalogSelectedItem = null;
  }
  renderCatalogItemList();
  updateAddItemWeightPreview();
});

/* ── populateCatalogItemSelect (compat) ─────────────────────────── */
function populateCatalogItemSelect() {
  catalogFilters     = { type:"", tier:"", search:"" };
  catalogSelectedItem = null;
  // Resetar chips
  document.querySelectorAll("#catalog-type-chips .catalog-chip").forEach(b => b.classList.toggle("active", b.dataset.catalogType === ""));
  document.querySelectorAll("#catalog-tier-chips .catalog-chip").forEach(b => b.classList.toggle("active", b.dataset.catalogTier === ""));
  const searchEl = document.getElementById("catalog-search");
  if (searchEl) searchEl.value = "";
  renderCatalogItemList();
}

/* ── Confirmar adição ───────────────────────────────────────────── */
document.getElementById("add-item-modal-confirm").addEventListener("click", () => {
  if (!addItemModalCharacter) return;
  const character = addItemModalCharacter;

  if (addItemModalTab === "catalog") {
    const sourceItem = catalogSelectedItem;
    const qty        = Math.max(1, parseInt(document.getElementById("catalog-item-qty").value) || 1);
    if (!sourceItem) { showToast("Selecione um item da lista."); return; }

    const pendingW = (sourceItem.weight || 0) * qty;
    const carry    = calcCarryCapacity(character);
    const current  = calcTotalWeight(character);
    if (round1(current + pendingW) > carry) {
      const space = round1(carry - current);
      showToast(`Carga máxima excedida! Espaço livre: ${Math.max(0, space)}kg.`);
      return;
    }

    for (let q = 0; q < qty; q++) {
      const cat     = sourceItem._cat || "weapon";
      const newItem = makeInventoryItem({ ...sourceItem, kind: cat }, null);
      /* propagar campos especiais de alquimia/forja */
      if (sourceItem.craftingMaterial)  newItem.craftingMaterial  = true;
      if (sourceItem.smithingMaterial)  newItem.smithingMaterial   = true;
      if (sourceItem.materialTag)       newItem.materialTag        = sourceItem.materialTag;
      if (sourceItem.smeltingType)      newItem.smeltingType       = sourceItem.smeltingType;
      if (sourceItem.recipeId)          newItem.recipeId           = sourceItem.recipeId;
      if (sourceItem.subcategory)       newItem.subcategory        = sourceItem.subcategory;
      if (sourceItem.consumable)        newItem.consumable         = sourceItem.consumable;
      character.inventory.push(newItem);
    }
    showToast(`${qty > 1 ? qty + "× " : ""}${sourceItem.name} adicionado.`);

  } else if (addItemModalTab === "generic") {
    const name   = document.getElementById("generic-item-name").value.trim();
    const qty    = Math.max(1, parseInt(document.getElementById("generic-item-qty").value) || 1);
    const weight = parseFloat(document.getElementById("generic-item-weight").value) || 0;
    if (!name) { showToast("Dê um nome ao item."); return; }
    const carry   = calcCarryCapacity(character);
    const current = calcTotalWeight(character);
    if (round1(current + weight * qty) > carry) { showToast("Carga máxima excedida!"); return; }
    for (let q = 0; q < qty; q++) {
      character.inventory.push({ instanceId:uid(), name, weight, category:"gear",
        baseData:null, equippedSlot:null, damageBonus:0, modifierText:"" });
    }
    showToast(`${qty > 1 ? qty + "× " : ""}${name} adicionado.`);

  } else if (addItemModalTab === "custom") {
    const category = document.getElementById("custom-item-category").value;
    const name     = document.getElementById("custom-item-name").value.trim();
    const weight   = parseFloat(document.getElementById("custom-item-weight").value) || 0;
    const note     = document.getElementById("custom-item-note").value.trim();
    if (!name) { showToast("Dê um nome ao item personalizado."); return; }
    const carry   = calcCarryCapacity(character);
    const current = calcTotalWeight(character);
    if (round1(current + weight) > carry) { showToast("Carga máxima excedida!"); return; }

    let baseData = null;
    if (category === "weapon") {
      baseData = { name,
        dmg           : document.getElementById("custom-weapon-dmg").value.trim() || "1d4",
        req           : document.getElementById("custom-weapon-req").value.trim() || "—",
        defenseDegrade: (() => { const v = document.getElementById("custom-weapon-defense").value; return v === "null" ? null : parseInt(v); })(),
        weight, slot:["primary","secondary"], note: note || undefined };
    } else if (category === "armor") {
      baseData = { name,
        physDefense : parseInt(document.getElementById("custom-armor-physdef").value)    || 0,
        magDefense  : parseInt(document.getElementById("custom-armor-magdef").value)     || 0,
        movePenalty : parseInt(document.getElementById("custom-armor-movepenalty").value) || 0,
        req         : document.getElementById("custom-armor-req").value.trim() || "—",
        weight, note: note || undefined };
    } else if (category === "shield") {
      baseData = { name,
        physDefense : parseInt(document.getElementById("custom-shield-physdef").value) || 0,
        penalty     : document.getElementById("custom-shield-penalty").value.trim() || "Nenhuma",
        weight, slot:["shield"], note: note || undefined };
    } else if (category === "accessory") {
      const effect = document.getElementById("custom-accessory-effect").value.trim() || "Sem efeito.";
      baseData = { name, weight, effect, note: note || undefined };
    }

    let magicBonus = null;
    if (document.getElementById("custom-item-is-magic").checked) {
      const attrKey = document.getElementById("custom-bonus-attr-select").value;
      magicBonus = {
        attr        : attrKey || null,
        attrValue   : attrKey ? (parseInt(document.getElementById("custom-bonus-attr-value").value) || 0) : 0,
        hp          : parseInt(document.getElementById("custom-bonus-hp").value)           || 0,
        move        : parseInt(document.getElementById("custom-bonus-move").value)         || 0,
        actions     : parseInt(document.getElementById("custom-bonus-actions").value)      || 0,
        spellActions: parseInt(document.getElementById("custom-bonus-spell-actions").value)|| 0,
        dodge       : parseInt(document.getElementById("custom-bonus-dodge").value)        || 0,
        slots       : parseInt(document.getElementById("custom-bonus-slots").value)        || 0,
      };
    }

    character.inventory.push({ instanceId:uid(), name, qty:1, weight, category,
      baseData, equippedSlot:null, damageBonus:0, modifierText:"", isCustom:true, magicBonus });
    showToast(`${name} (personalizado) adicionado.`);
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

/* ── Glossário de Maldições & Bênçãos ─────────────────────────── */

function renderCursesGlossary(query) {
  const q = (query || "").toLowerCase();

  const TIER_CFG = {
    menor:    { label: "Menor",    color: "#7a9a7a", icon: "⚬", order: 1 },
    media:    { label: "Média",    color: "#c09040", icon: "◆", order: 2 },
    poderosa: { label: "Poderosa", color: "#c04040", icon: "★", order: 3 },
  };

  const renderCard = (item, type) => {
    if (q && !item.name.toLowerCase().includes(q) && !item.effect.toLowerCase().includes(q) && !(item.origin||"").toLowerCase().includes(q)) return "";
    const tc = TIER_CFG[item.tier] || TIER_CFG.menor;
    const isCurse = type === "curse";
    const borderColor = isCurse ? "rgba(180,40,40,0.35)" : "rgba(40,160,80,0.35)";
    const mechHTML = item.mechanical ? Object.entries(item.mechanical).map(([k,v]) =>
      `<span class="curse-mech-tag curse-mech-${k}">${k === "bonus" ? "✦ Bônus: " : k === "penalty" ? "▼ Penalidade: " : "⬡ "}${v}</span>`
    ).join("") : "";
    return `
      <div class="curse-card ${isCurse ? "curse-card-curse" : "curse-card-blessing"}">
        <div class="curse-card-head">
          <span class="curse-card-icon">${item.icon}</span>
          <div class="curse-card-titles">
            <span class="curse-card-name">${item.name}</span>
            <span class="curse-card-origin">${item.origin || ""}</span>
          </div>
          <span class="curse-tier-badge" style="color:${tc.color};border-color:${tc.color}">${tc.icon} ${tc.label}</span>
        </div>
        <p class="curse-card-effect">${item.effect}</p>
        ${mechHTML ? `<div class="curse-mech-row">${mechHTML}</div>` : ""}
        <div class="curse-card-footer">
          <span class="curse-duration">⏳ ${item.duration || "Permanente"}</span>
          ${item.removal ? `<span class="curse-removal">🔑 ${item.removal}</span>` : ""}
        </div>
      </div>`;
  };

  const cursesHTML  = CURSES.sort((a,b)=>  (TIER_CFG[a.tier]?.order||0)-(TIER_CFG[b.tier]?.order||0)).map(c=>renderCard(c,"curse")).join("");
  const blessHTML   = BLESSINGS.sort((a,b)=>(TIER_CFG[a.tier]?.order||0)-(TIER_CFG[b.tier]?.order||0)).map(b=>renderCard(b,"blessing")).join("");

  const printBar = `
    <div class="glossary-print-bar">
      <span class="glossary-print-info">⚫ ${CURSES.length} maldições · ✨ ${BLESSINGS.length} bênçãos</span>
      <button class="glossary-print-btn" onclick="printCursesGlossary()">🖨 Imprimir</button>
    </div>`;

  const noResults = !cursesHTML.trim() && !blessHTML.trim()
    ? `<p class="empty-inline-note">Nenhuma maldição ou bênção encontrada para "${escapeHTML(query)}".</p>` : "";

  return `${printBar}
    ${noResults}
    ${cursesHTML || blessHTML ? `
    <h3 class="glossary-group-title" style="color:#c05050">💀 Maldições</h3>
    <div class="curse-grid">${cursesHTML || '<p class="empty-inline-note">Nenhuma encontrada.</p>'}</div>
    <h3 class="glossary-group-title" style="color:#40a060;margin-top:20px">✨ Bênçãos</h3>
    <div class="curse-grid">${blessHTML || '<p class="empty-inline-note">Nenhuma encontrada.</p>'}</div>
    ` : ""}`;
}

function printCursesGlossary() {
  const TIER_CFG = { menor:{label:"Menor",col:"#4a7a4a"}, media:{label:"Média",col:"#8a6020"}, poderosa:{label:"Poderosa",col:"#8a2020"} };
  const card = (item, type) => {
    const tc = TIER_CFG[item.tier] || TIER_CFG.menor;
    const mechHTML = item.mechanical ? Object.entries(item.mechanical).map(([k,v]) =>
      `<span class="tag">${k==="bonus"?"✦ ":"▼ "}${v}</span>`).join("") : "";
    return `<div class="card" style="border-left-color:${type==="curse"?"#c05050":"#40a060"}">
      <div class="card-name">${item.icon} ${item.name}</div>
      <div class="card-meta">
        <span class="badge" style="background:${tc.col}">${tc.label}</span>
        <span class="badge bg-gray">${type==="curse"?"Maldição":"Bênção"}</span>
      </div>
      <p class="card-effect">${item.effect}</p>
      <div class="tags">${mechHTML}</div>
      ${item.duration?`<p class="card-note">⏳ ${item.duration}</p>`:""}
      ${item.removal?`<p class="card-note">🔑 ${item.removal}</p>`:""}
      ${item.origin?`<p class="card-story">${item.origin}</p>`:""}
    </div>`;
  };
  const body = `<h2 style="color:#c05050">💀 Maldições</h2><div class="print-grid">${CURSES.map(c=>card(c,"curse")).join("")}</div>
    <h2 style="color:#40a060;margin-top:10mm">✨ Bênçãos</h2><div class="print-grid">${BLESSINGS.map(b=>card(b,"blessing")).join("")}</div>`;
  _openPrintWindow("Maldições & Bênçãos — Grimório de Aether", body);
}

/* ── Seção de Maldições & Bênçãos na Ficha (aba Vital) ──────── */

function renderCursesSection(character) {
  const active = character.activeCurses || [];
  const TIER_ORDER = { menor:1, media:2, poderosa:3 };
  const ALL = [
    ...CURSES.map(c    => ({ ...c, type:"curse"    })),
    ...BLESSINGS.map(b => ({ ...b, type:"blessing" })),
  ].sort((a,b) => (TIER_ORDER[a.tier]||0)-(TIER_ORDER[b.tier]||0));

  const TIER_LABELS = { menor:"Menor", media:"Média", poderosa:"Poderosa" };
  const TIER_COLORS = { menor:"#7a9a7a", media:"#c09040", poderosa:"#c04040" };

  const activeCards = active.map(id => {
    const entry = ALL.find(x => x.id === id);
    if (!entry) return "";
    const isCurse = entry.type === "curse";
    const tc = TIER_LABELS[entry.tier] || entry.tier;
    const mechHTML = entry.mechanical ? Object.entries(entry.mechanical).map(([k,v]) =>
      `<span class="cb-mech ${isCurse?"cb-mech-bad":"cb-mech-good"}">${k==="bonus"?"✦ ":k==="penalty"?"▼ ":"⬡ "}${v}</span>`
    ).join("") : "";
    return `
      <div class="cb-active-card ${isCurse ? "cb-card-curse" : "cb-card-blessing"}">
        <div class="cb-active-head">
          <span class="cb-active-icon">${entry.icon}</span>
          <div style="flex:1;min-width:0">
            <div class="cb-active-name">${entry.name}</div>
            <div class="cb-active-tier" style="color:${TIER_COLORS[entry.tier]||"#888"}">${isCurse?"💀 Maldição":"✨ Bênção"} · ${tc}</div>
          </div>
          <button class="skill-remove-btn" data-remove-curse="${entry.id}" title="Remover">×</button>
        </div>
        <p class="cb-active-effect">${entry.effect}</p>
        ${mechHTML ? `<div class="cb-mech-row">${mechHTML}</div>` : ""}
        ${entry.duration ? `<div class="cb-duration">⏳ ${entry.duration}</div>` : ""}
        ${entry.removal && isCurse ? `<div class="cb-removal">🔑 ${entry.removal}</div>` : ""}
      </div>`;
  }).join("");

  // Select para adicionar
  const available = ALL.filter(x => !active.includes(x.id));
  const curseOptions   = available.filter(x=>x.type==="curse"   ).map(x=>`<option value="${x.id}">[${TIER_LABELS[x.tier]}] ${x.icon} ${x.name}</option>`).join("");
  const blessOptions   = available.filter(x=>x.type==="blessing").map(x=>`<option value="${x.id}">[${TIER_LABELS[x.tier]}] ${x.icon} ${x.name}</option>`).join("");

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">⚫ Maldições & ✨ Bênçãos Ativas</h3>
    <p class="section-hint">Adicione maldições ou bênçãos que o personagem carrega. Os efeitos são informativos — aplique-os manualmente nas cenas. Veja o Glossário para detalhes completos de cada uma.</p>

    ${active.length ? `<div class="cb-active-grid">${activeCards}</div>` : `<p class="empty-inline-note">Nenhuma maldição ou bênção ativa no momento.</p>`}

    <div class="cb-add-row">
      <div class="cb-add-group">
        <span class="cb-add-label">💀 Adicionar Maldição</span>
        <div style="display:flex;gap:6px">
          <select id="cb-select-curse" class="cb-select">
            <option value="">Escolher...</option>
            ${curseOptions}
          </select>
          <button class="cb-add-btn cb-btn-curse" id="cb-btn-add-curse">+ Aplicar</button>
        </div>
      </div>
      <div class="cb-add-group">
        <span class="cb-add-label">✨ Adicionar Bênção</span>
        <div style="display:flex;gap:6px">
          <select id="cb-select-blessing" class="cb-select">
            <option value="">Escolher...</option>
            ${blessOptions}
          </select>
          <button class="cb-add-btn cb-btn-blessing" id="cb-btn-add-blessing">+ Aplicar</button>
        </div>
      </div>
    </div>
  </div>`;
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

