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

/* HP = 20 + (FOR * hpPerFor da classe) + 5 * (nivel - 1) + bônus de acessórios */
function calcMaxHP(character) {
  const cls = getClassDef(character.classKey);
  const hpPerFor = cls ? cls.hpPerFor : 3;
  const base = 20 + (character.attrs.FOR * hpPerFor);
  const levelBonus = 5 * (character.level - 1);
  const accBonus = sumAccessoryEffectValue(character, "hp");
  return Math.max(1, base + levelBonus + accBonus);
}

/* Slots de Magia = INT + SAB, mínimo 1 para classes conjuradoras */
function calcSpellSlots(character) {
  const cls = getClassDef(character.classKey);
  const isCaster = cls && cls.spellsFull !== null && cls.spellsFull !== undefined;
  let slots = character.attrs.INT + character.attrs.SAB;
  const accBonus = sumAccessoryEffectValue(character, "slots");
  slots += accBonus;
  if (isCaster && slots < 1) slots = 1; // garante ao menos 1 slot para conjuradores
  return slots;
}

/* Movimento = 4 + AGI (- penalidade de armadura/escudo) + bônus de acessórios */
function calcMovement(character) {
  let move = 4 + character.attrs.AGI;
  move -= getEquippedMovePenalty(character);
  move += sumAccessoryEffectValue(character, "move");
  return Math.max(1, move);
}

/* Ações por turno = AGI + DEX, mínimo 1 */
function calcActions(character) {
  return Math.max(1, character.attrs.AGI + character.attrs.DEX);
}

/* Reações por rodada = 1 + 1 a cada 4 pontos de AGI (regra original, mantida) */
function calcReactions(character) {
  let reactions = 1 + Math.floor(character.attrs.AGI / 4);
  reactions += sumAccessoryEffectValue(character, "reaction");
  return reactions;
}

/* Ações de Reação = 1 a cada 3 pontos de AGI, mínimo 1. Recurso separado das Reações de combate. */
function calcReactionActions(character) {
  return Math.max(1, Math.floor(character.attrs.AGI / 3));
}

/* Ações de Magia = max(floor(INT/2), floor(SAB/2)). Só o Mago tem mínimo garantido de 1. */
function calcSpellActions(character) {
  const cls = getClassDef(character.classKey);
  const fromInt = Math.floor(character.attrs.INT / 2);
  const fromSab = Math.floor(character.attrs.SAB / 2);
  let actions = Math.max(fromInt, fromSab);
  if (cls && cls.name === "Mago" && actions < 1) actions = 1;
  return actions;
}

/* Capacidade de Carga = 15 + FOR*5 */
function calcCarryCapacity(character) {
  return CARRY_BASE + (character.attrs.FOR * CARRY_PER_FOR);
}

/* Recurso de classe máximo (Fúria/Foco fixos, MP/Fé calculados) */
function calcResourceMax(character) {
  const cls = getClassDef(character.classKey);
  if (!cls) return 0;
  if (cls.resourceMax !== null) return cls.resourceMax;
  if (cls.name === "Mago") {
    let mp = 10 + (character.attrs.INT * 2);
    mp += sumAccessoryEffectValue(character, "mp");
    return mp;
  }
  if (cls.name === "Clérigo") {
    let fe = 8 + character.attrs.SAB;
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

/* Soma efeitos numéricos de acessórios equipados que batem com uma chave de efeito */
function sumAccessoryEffectValue(character, kind) {
  const accessories = getEquippedItem(character, "accessory");
  let total = 0;
  accessories.forEach(item => {
    if (kind === "hp" && item.name === "Anel de Vitalidade") total += 5;
    if (kind === "slots" && item.name === "Anel de Foco Arcano") total += 1;
    if (kind === "move" && item.name === "Botas Ágeis") total += 1;
    if (kind === "reaction" && item.name === "Bracelete de Reflexos") total += 1;
    if (kind === "mp" && item.name === "Pedra de Mana") total += 5;
    if (kind === "fe" && item.name === "Amuleto de Fé") total += 2;
  });
  return total;
}

/* Peso total do inventário inteiro (equipado ou não — tudo é inventário agora) */
function calcTotalWeight(character) {
  let total = 0;
  character.inventory.forEach(item => total += (item.weight || 0) * (item.qty || 1));
  return Math.max(0, round1(total));
}

/* --- DANO: separa fontes (arma equipada, modificador, dano natural) --- */

function calcDamageBreakdown(character) {
  const cls = getClassDef(character.classKey);
  const primary = getEquippedItem(character, "primary");
  const secondary = getEquippedItem(character, "secondary");
  const naturalDie = cls ? cls.naturalDamageDie : "1d4";
  const naturalNote = cls ? cls.naturalDamageNote : "";
  const forPerBonus = cls && cls.forPerNaturalBonus ? cls.forPerNaturalBonus : 0;
  const naturalForBonus = forPerBonus > 0 ? Math.floor(character.attrs.FOR / forPerBonus) : 0;

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
    label: `Dano Natural (${cls ? cls.name : "padrão"})`,
    dice: naturalDie,
    bonus: naturalForBonus,
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

  const allOptions = [
    ...ALL_WEAPONS.map(w => ({ ...w, kind: "weapon" })),
    ...SHIELDS.map(s => ({ ...s, kind: "shield" })),
    ...ARMORS.map(a => ({ ...a, kind: "armor" })),
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
      class: [...wizard.classSkills],
      general: [...wizard.generalSkills],
      abilities: cls.skills.length > 0 ? [cls.skills[0].name] : [] // 1ª habilidade de classe é gratuita no nível 1
    },
    spells: wizard.startSpell ? [wizard.startSpell] : [],
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

document.getElementById("btn-show-glossary").addEventListener("click", () => {
  currentGlossaryTab = "classes";
  document.querySelectorAll("#glossary-tabs .tab-btn").forEach(b => b.classList.toggle("active", b.dataset.glossarytab === "classes"));
  document.getElementById("glossary-search").value = "";
  renderGlossaryContent();
  showView("view-glossary");
});

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

function renderSheet() {
  const character = findCharacter(currentSheetId);
  if (!character) { showView("view-list"); return; }
  const cls = getClassDef(character.classKey);

  const maxHP = calcMaxHP(character);
  character.currentHP = clamp(character.currentHP, 0, maxHP);
  const resourceMax = calcResourceMax(character);
  if (character.currentResource > resourceMax) character.currentResource = resourceMax;

  const frame = document.getElementById("sheet-frame");
  frame.innerHTML = `
    <div class="sheet-header">
      <div class="sheet-seal">${cls ? cls.icon : "?"}</div>
      <div class="sheet-title-block">
        <h2 class="sheet-name">${escapeHTML(character.name)}</h2>
        <p class="sheet-subtitle">${cls ? cls.name : "Sem classe"}${character.origin ? " · " + escapeHTML(character.origin) : ""} · ${character.rosterType === "pc" ? "Personagem Jogador" : "NPC / Criatura"}</p>
      </div>
      <div class="sheet-level-badge">
        <span class="lvl-num">${character.level}</span>
        <span class="lvl-label">Nível</span>
      </div>
    </div>
    <div class="sheet-body">

      ${renderVitalsSection(character, cls, maxHP, resourceMax)}
      ${renderAttributesSection(character, cls)}
      ${renderDerivedSection(character, cls)}
      ${cls ? renderClassAbilitiesSection(character, cls) : ""}
      ${renderSkillsSection(character, cls)}
      ${renderSpellsSection(character, cls)}
      ${renderEquipmentSection(character)}
      ${renderInventorySection(character)}
      ${renderNotesSection(character)}

      <div class="sheet-danger-zone">
        <button class="btn-danger" id="btn-delete-from-sheet">Remover este personagem</button>
      </div>
    </div>
  `;

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
  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Atributos</h3>
    <div class="sheet-attr-grid">
      ${ATTRS.map(attr => `
        <div class="sheet-attr-box">
          <div class="sheet-attr-box-label">${attr}</div>
          <div class="sheet-attr-box-value">${character.attrs[attr]}</div>
          <div class="sheet-attr-box-controls">
            <button class="attr-step-btn" data-attr-up="${attr}" ${character.unspentAttrPoints > 0 ? "" : "disabled"} title="Gastar 1 ponto de nível">+</button>
          </div>
        </div>
      `).join("")}
    </div>
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
  const dmg = calcDamageBreakdown(character);

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Estatísticas de Combate</h3>
    <div class="derived-grid">
      <div class="derived-box"><div class="derived-box-label">Movimento</div><div class="derived-box-value">${move} hex</div></div>
      <div class="derived-box"><div class="derived-box-label">Ações/turno</div><div class="derived-box-value">${actions}</div></div>
      <div class="derived-box"><div class="derived-box-label">Reações/rodada</div><div class="derived-box-value">${reactions}</div></div>
      <div class="derived-box"><div class="derived-box-label">Ações de Reação</div><div class="derived-box-value">${reactionActions}</div></div>
      <div class="derived-box ${spellActions > 0 ? "derived-box-highlight" : ""}"><div class="derived-box-label">Ações de Magia</div><div class="derived-box-value">${spellActions}</div></div>
      <div class="derived-box"><div class="derived-box-label">Defesa Física</div><div class="derived-box-value">${physDef}</div></div>
      <div class="derived-box"><div class="derived-box-label">Defesa Mágica</div><div class="derived-box-value">${magDef}</div></div>
      <div class="derived-box"><div class="derived-box-label">Slots de Magia</div><div class="derived-box-value">${slots}</div></div>
      <div class="derived-box"><div class="derived-box-label">Carga</div><div class="derived-box-value">${weight} / ${carry}</div></div>
    </div>
    <p class="section-hint" style="margin-top:10px;">Ações de Reação (1 a cada 3 AGI) são usadas para reagir fora do seu turno. Ações de Magia (baseadas no maior entre INT/2 e SAB/2) só podem ser usadas para conjurar magias.</p>

    <h4 class="damage-subtitle">Dano — Fontes Separadas</h4>
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
  const known = character.skills.abilities;
  const points = character.unspentSkillPoints || 0;

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Habilidades de Classe</h3>
    <p class="section-hint">Recurso: <strong>${cls.resource}</strong> — ${cls.resourceDesc}</p>
    ${points > 0 ? `<div class="points-banner">★ Você tem <strong>${points}</strong> ponto(s) de habilidade para gastar abaixo.</div>` : ""}

    <div class="ability-card-grid">
      ${cls.skills.map(skill => {
        const isKnown = known.includes(skill.name);
        return `
        <div class="ability-card ${isKnown ? "known" : "locked"}">
          <div class="ability-card-head">
            <span class="ability-card-name">${skill.name}</span>
            ${isKnown ? `<span class="ability-card-badge">Aprendida</span>` : ""}
          </div>
          <div class="ability-card-cost">${skill.cost}</div>
          <p class="ability-card-effect">${skill.effect}</p>
          ${!isKnown ? `<button class="btn-secondary btn-learn-ability" data-learn-ability="${skill.name}" ${points > 0 ? "" : "disabled"}>
            ${points > 0 ? "Aprender (1 ponto)" : "Sem pontos disponíveis"}
          </button>` : ""}
        </div>
      `}).join("")}
    </div>
  </div>`;
}

/* --- Perícias (de classe + gerais, com aprendizado posterior) --- */

function renderSkillsSection(character, cls) {
  const knownClassSkills = character.skills.class;
  const knownGeneralSkills = character.skills.general;

  const learnableClass = cls ? cls.skillsClass.filter(s => !knownClassSkills.includes(s.name)) : [];
  const learnableGeneral = GENERAL_SKILLS.filter(s => !knownGeneralSkills.includes(s.name));

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Perícias Conhecidas</h3>
    <div class="skill-card-grid">
      ${knownClassSkills.map(name => {
        const s = cls.skillsClass.find(x => x.name === name);
        return renderSkillCard(name, s);
      }).join("")}
      ${knownGeneralSkills.map(name => {
        const s = GENERAL_SKILLS.find(x => x.name === name);
        return renderSkillCard(name, s);
      }).join("")}
      ${(knownClassSkills.length + knownGeneralSkills.length === 0) ? `<p class="empty-inline-note">Nenhuma perícia registrada ainda.</p>` : ""}
    </div>

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
  </div>`;
}

/* Card visual de uma perícia conhecida — mesmo padrão das habilidades de classe */
function renderSkillCard(name, skillData) {
  if (!skillData) return "";
  return `
    <div class="skill-card">
      <div class="skill-card-head">
        <span class="skill-card-name">${name}</span>
        <span class="skill-card-attr-tag">${skillData.attr}</span>
      </div>
      <p class="skill-card-effect">${skillData.desc}</p>
      ${skillData.example ? `<div class="skill-card-example"><span class="skill-card-example-label">Exemplo:</span> ${skillData.example}</div>` : ""}
    </div>
  `;
}

/* --- Magias (apenas para classes conjuradoras) --- */

function renderSpellsSection(character, cls) {
  const known = character.spells || [];
  const allSpells = getAllSpellsInGame();
  const learnable = allSpells.filter(s => !known.includes(s.name));

  // agrupa as aprendíveis por origem para o <select>
  const groups = {};
  learnable.forEach(s => {
    if (!groups[s.origin]) groups[s.origin] = [];
    groups[s.origin].push(s);
  });

  return `
  <div class="sheet-section">
    <h3 class="sheet-section-title">Magias Conhecidas</h3>
    <p class="section-hint">Qualquer classe pode aprender qualquer magia através de grimórios e livros — não há restrição de classe para conjurar.</p>
    <div class="spell-card-grid">
      ${known.map(name => {
        const s = allSpells.find(x => x.name === name);
        if (!s) return "";
        const isSlow = s.castTime && !s.castTime.includes("instantânea");
        return `
        <div class="spell-card spell-level-${s.level}">
          <div class="spell-card-head">
            <span class="spell-card-name">${name}</span>
            <span class="spell-card-level-badge">Nível ${s.level}</span>
          </div>
          <span class="spell-card-origin">${s.origin}</span>
          <p class="spell-card-effect">${s.effect}</p>
          <div class="spell-card-meta-row">
            <span class="spell-meta-tag ${isSlow ? "spell-meta-tag-slow" : ""}">⏱ ${s.castTime || "1 Ação"}</span>
            <span class="spell-meta-tag spell-meta-tag-cooldown">↻ ${s.cooldown || "Sem limite"}</span>
          </div>
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
    if (itemData && (cfg.key === "primary" || cfg.key === "secondary")) {
      const defenseInfo = itemData.defenseDegrade === null ? "Não defende" : itemData.defenseDegrade === 0 ? "Defesa não degrada" : `Defesa −${itemData.defenseDegrade}/tentativa`;
      chips = [
        { label: "Dano", value: itemData.dmg || "—", kind: "damage" },
        { label: "Peso", value: `${itemData.weight}kg`, kind: "neutral" },
        { label: "Requisito", value: itemData.req || "—", kind: "neutral" },
        { label: "Defesa", value: defenseInfo, kind: itemData.defenseDegrade === null ? "warn" : "neutral" }
      ];
      if (itemData.range) chips.splice(1, 0, { label: "Alcance", value: `${itemData.range} hex`, kind: "neutral" });
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
      chips = [
        { label: "Def. Física", value: itemData.physDefense, kind: "defense" },
        { label: "Def. Mágica", value: itemData.magDefense, kind: "magic" },
        { label: "Peso", value: `${itemData.weight}kg`, kind: "neutral" },
        { label: "Requisito", value: itemData.req || "—", kind: "neutral" }
      ];
      if (itemData.movePenalty) chips.push({ label: "Movimento", value: itemData.movePenalty < 0 ? `+${-itemData.movePenalty}` : `−${itemData.movePenalty}`, kind: itemData.movePenalty > 0 ? "warn" : "defense" });
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
    <div class="equip-slot ${equippedAccessories.length ? "filled" : ""}" style="grid-column: 1 / -1;">
      <div class="equip-slot-label">Acessórios (sem limite fixo — use o bom senso da mesa)</div>
      ${equippedAccessories.length ? equippedAccessories.map(item => `
        <div class="equip-slot-item-row">
          <div>
            <div class="equip-slot-item">${item.name}${item.baseData && item.baseData.rarity ? ` <span class="rarity-badge rarity-${item.baseData.rarity}">${item.baseData.rarity}</span>` : ""}</div>
            <div class="equip-slot-sub">${item.baseData ? item.baseData.effect : ""}</div>
            ${renderModifierFields(item)}
          </div>
          <button class="btn-secondary" data-unequip-accessory="${item.instanceId}" style="font-size:12px;padding:4px 8px;">Remover</button>
        </div>
      `).join("") : `<div class="equip-slot-empty">Nenhum acessório equipado</div>`}
      <div class="equip-slot-actions">
        <select id="accessory-select">
          <option value="">Equipar acessório do inventário...</option>
          ${availableAccessories.map(i => `<option value="${i.instanceId}">${i.name}</option>`).join("")}
        </select>
        <button class="btn-secondary" id="btn-equip-accessory">Equipar</button>
      </div>
      ${availableAccessories.length === 0 ? `<div class="equip-slot-empty-note">Nenhum acessório disponível no inventário ainda.</div>` : ""}
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
  return `
    <div class="modifier-fields">
      <label class="modifier-label">Modificador / Efeito especial</label>
      <textarea class="modifier-text-input" data-modifier-text="${item.instanceId}" placeholder="Ex.: lâmina élfica, gela o alvo em contato, encantada contra mortos-vivos...">${escapeHTML(item.modifierText || "")}</textarea>
      <div class="modifier-bonus-row">
        <label class="modifier-label">Bônus de Dano</label>
        <input type="number" class="modifier-bonus-input" data-modifier-bonus="${item.instanceId}" value="${item.damageBonus || 0}" step="1">
      </div>
    </div>
  `;
}

/* --- Inventário (itens livres + peso total) --- */

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

function attachSheetHandlers(character) {
  const cls = getClassDef(character.classKey);
  const maxHP = calcMaxHP(character);
  const resourceMax = calcResourceMax(character);

  // HP controls
  const hpInput = document.getElementById("hp-input");
  document.querySelector('[data-action="hp-dec"]').addEventListener("click", () => {
    character.currentHP = clamp(character.currentHP - 1, 0, maxHP);
    persistCurrentCharacter(); renderSheet();
  });
  document.querySelector('[data-action="hp-inc"]').addEventListener("click", () => {
    character.currentHP = clamp(character.currentHP + 1, 0, maxHP);
    persistCurrentCharacter(); renderSheet();
  });
  hpInput.addEventListener("change", () => {
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
  document.getElementById("btn-add-xp").addEventListener("click", () => {
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
  document.querySelectorAll("[data-attr-up]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (character.unspentAttrPoints <= 0) return;
      const attr = btn.dataset.attrUp;
      character.attrs[attr] += 1;
      character.unspentAttrPoints -= 1;
      persistCurrentCharacter();
      renderSheet();
      showToast(`+1 ${attr} aplicado.`);
    });
  });

  // Learn class ability (costs 1 skill point)
  document.querySelectorAll("[data-learn-ability]").forEach(btn => {
    btn.addEventListener("click", () => {
      if ((character.unspentSkillPoints || 0) <= 0) { showToast("Sem pontos de habilidade disponíveis. Ganhe XP para subir de nível."); return; }
      const abilityName = btn.dataset.learnAbility;
      if (!character.skills.abilities) character.skills.abilities = [];
      if (character.skills.abilities.includes(abilityName)) return;
      character.skills.abilities.push(abilityName);
      character.unspentSkillPoints -= 1;
      persistCurrentCharacter();
      renderSheet();
      showToast(`Habilidade "${abilityName}" aprendida!`);
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

  // Notes (debounced save on blur/input)
  const notesArea = document.getElementById("character-notes");
  notesArea.addEventListener("input", () => {
    character.notes = notesArea.value;
  });
  notesArea.addEventListener("blur", () => {
    persistCurrentCharacter();
  });

  // Delete from sheet
  document.getElementById("btn-delete-from-sheet").addEventListener("click", () => {
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
  } else {
    const qty = parseInt(document.getElementById("generic-item-qty").value) || 1;
    const weight = parseFloat(document.getElementById("generic-item-weight").value) || 0;
    pendingWeight = weight * qty;
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
  } else {
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
    html += filtered.map(skill => `
      <div class="ability-card known">
        <div class="ability-card-head">
          <span class="ability-card-name">${skill.name}</span>
        </div>
        <div class="ability-card-cost">${skill.cost}</div>
        <p class="ability-card-effect">${skill.effect}</p>
      </div>
    `).join("");
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

  // Agrupa por origem para organização visual
  const groups = {};
  filtered.forEach(s => {
    if (!groups[s.origin]) groups[s.origin] = [];
    groups[s.origin].push(s);
  });

  return Object.keys(groups).map(origin => {
    const spells = groups[origin].sort((a, b) => a.level - b.level);
    return `
      <h3 class="glossary-group-title">${origin === "Geral" ? "✦ Magias Gerais (qualquer classe)" : getClassIconByName(origin) + " " + origin}</h3>
      <div class="spell-card-grid">
        ${spells.map(s => `
          <div class="spell-card spell-level-${s.level}">
            <div class="spell-card-head">
              <span class="spell-card-name">${s.name}</span>
              <span class="spell-card-level-badge">Nível ${s.level}</span>
            </div>
            <p class="spell-card-effect">${s.effect}</p>
            <div class="spell-card-meta-row">
              <span class="spell-meta-tag ${s.castTime && !s.castTime.includes("instantânea") ? "spell-meta-tag-slow" : ""}">⏱ ${s.castTime || "1 Ação"}</span>
              <span class="spell-meta-tag spell-meta-tag-cooldown">↻ ${s.cooldown || "Sem limite"}</span>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }).join("");
}

/* --- Glossário de Itens (armas, armaduras, escudos, acessórios) --- */

function renderItemsGlossary(query) {
  const matches = (name) => !query || name.toLowerCase().includes(query);

  const weaponSections = [
    { title: "Armas de Uma Mão", list: WEAPONS_ONE_HAND },
    { title: "Armas de Duas Mãos", list: WEAPONS_TWO_HAND },
    { title: "Armas Mágicas (Varinhas, Grimórios, Orbes)", list: WEAPONS_MAGIC },
    { title: "Armas à Distância", list: WEAPONS_RANGED }
  ];

  let html = "";

  weaponSections.forEach(section => {
    const filtered = section.list.filter(w => matches(w.name));
    if (filtered.length === 0) return;
    html += `<h3 class="glossary-group-title">⚔ ${section.title}</h3>`;
    html += `<div class="item-glossary-grid">`;
    html += filtered.map(w => `
      <div class="item-glossary-card">
        <div class="item-glossary-name">${w.name}</div>
        <div class="equip-stat-chips">
          <span class="equip-stat-chip equip-stat-chip-damage"><span class="equip-stat-chip-label">Dano</span>${w.dmg || "—"}</span>
          ${w.range ? `<span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Alcance</span>${w.range} hex</span>` : ""}
          <span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Peso</span>${w.weight}kg</span>
          <span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Requisito</span>${w.req || "—"}</span>
        </div>
        ${w.note ? `<p class="item-glossary-note">✦ ${w.note}</p>` : ""}
      </div>
    `).join("");
    html += `</div>`;
  });

  const filteredShields = SHIELDS.filter(s => matches(s.name));
  if (filteredShields.length > 0) {
    html += `<h3 class="glossary-group-title">🛡 Escudos</h3>`;
    html += `<div class="item-glossary-grid">`;
    html += filteredShields.map(s => `
      <div class="item-glossary-card">
        <div class="item-glossary-name">${s.name}</div>
        <div class="equip-stat-chips">
          <span class="equip-stat-chip equip-stat-chip-defense"><span class="equip-stat-chip-label">Def. Física</span>+${s.physDefense}</span>
          <span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Peso</span>${s.weight}kg</span>
          <span class="equip-stat-chip ${s.penalty !== "Nenhuma" ? "equip-stat-chip-warn" : "equip-stat-chip-neutral"}"><span class="equip-stat-chip-label">Penalidade</span>${s.penalty}</span>
        </div>
        ${s.note ? `<p class="item-glossary-note">✦ ${s.note}</p>` : ""}
      </div>
    `).join("");
    html += `</div>`;
  }

  const filteredArmors = ARMORS.filter(a => matches(a.name));
  if (filteredArmors.length > 0) {
    html += `<h3 class="glossary-group-title">🧥 Armaduras</h3>`;
    html += `<div class="item-glossary-grid">`;
    html += filteredArmors.map(a => `
      <div class="item-glossary-card">
        <div class="item-glossary-name">${a.name}</div>
        <div class="equip-stat-chips">
          <span class="equip-stat-chip equip-stat-chip-defense"><span class="equip-stat-chip-label">Def. Física</span>${a.physDefense}</span>
          <span class="equip-stat-chip equip-stat-chip-magic"><span class="equip-stat-chip-label">Def. Mágica</span>${a.magDefense}</span>
          <span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Peso</span>${a.weight}kg</span>
          <span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Requisito</span>${a.req || "—"}</span>
        </div>
        ${a.note ? `<p class="item-glossary-note">✦ ${a.note}</p>` : ""}
      </div>
    `).join("");
    html += `</div>`;
  }

  const filteredAccessories = ACCESSORIES.filter(a => matches(a.name));
  if (filteredAccessories.length > 0) {
    html += `<h3 class="glossary-group-title">💍 Acessórios</h3>`;
    html += `<div class="item-glossary-grid">`;
    html += filteredAccessories.map(a => `
      <div class="item-glossary-card">
        <div class="item-glossary-name">${a.name}${a.rarity ? ` <span class="rarity-badge rarity-${a.rarity}">${a.rarity}</span>` : ""}</div>
        <p class="item-glossary-note">${a.effect}</p>
        <div class="equip-stat-chips"><span class="equip-stat-chip equip-stat-chip-neutral"><span class="equip-stat-chip-label">Peso</span>${a.weight}kg</span></div>
      </div>
    `).join("");
    html += `</div>`;
  }

  if (!html) return `<p class="empty-inline-note">Nenhum item encontrado para "${escapeHTML(query)}".</p>`;
  return html;
}
