"use strict";

/* ================================================================
   ACOMPANHAMENTO DA CAMPANHA
   Persistência: localStorage (chaves: cl_days, cl_events)
   ================================================================ */

// ── Dados ─────────────────────────────────────────────────────────
let days   = [];   // [{id, day, title, relato}]
let events = [];   // [{id, day, title, desc, options:[{text,consequence,chosen}], status}]
let selectedDayId  = null;
let editingDayId   = null;   // null = novo dia, string = editar
let editingEventId = null;
let optionDraft    = [];     // [{text, consequence}] — opções sendo editadas no modal

const STORAGE_DAYS   = "cl_days_v1";
const STORAGE_EVENTS = "cl_events_v1";

function loadData() {
  try { days   = JSON.parse(localStorage.getItem(STORAGE_DAYS))   || []; } catch { days   = []; }
  try { events = JSON.parse(localStorage.getItem(STORAGE_EVENTS)) || []; } catch { events = []; }
}
function saveData() {
  localStorage.setItem(STORAGE_DAYS,   JSON.stringify(days));
  localStorage.setItem(STORAGE_EVENTS, JSON.stringify(events));
}
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

function currentDay() {
  if (days.length === 0) return 1;
  return Math.max(...days.map(d => d.day), ...events.map(e => e.day), 1);
}

// ── Renderização principal ────────────────────────────────────────
function render() {
  renderTimeline();
  renderContent();
  document.getElementById("current-day-badge").textContent = `Dia ${currentDay()}`;
}

function renderTimeline() {
  const list = document.getElementById("timeline-list");

  // Ordenar dias registrados
  const sortedDays = [...days].sort((a,b) => a.day - b.day);

  // Dias com eventos planejados mas sem relato
  const registeredDayNums = new Set(days.map(d => d.day));
  const futureEventDays = [...new Set(
    events.filter(e => !registeredDayNums.has(e.day)).map(e => e.day)
  )].sort((a,b) => a-b);

  let html = "";

  // Dias registrados
  if (sortedDays.length === 0) {
    html += `<div style="padding:10px 12px;font-size:12px;color:var(--ink-soft);font-style:italic;">Nenhum dia registrado.<br>Clique em + Dia para começar.</div>`;
  } else {
    sortedDays.forEach(d => {
      const eventsForDay = events.filter(e => e.day === d.day);
      const hasEvent = eventsForDay.length > 0;
      const active = selectedDayId === d.id ? "active" : "";
      html += `
        <div class="cl-day-entry ${active} ${hasEvent ? "has-event" : ""}" data-day-id="${d.id}">
          <div class="cl-day-num">Dia ${d.day}</div>
          <div class="cl-day-title-small">${escHTML(d.title || "(sem título)")}</div>
        </div>`;
    });
  }

  // Separador para dias futuros com eventos
  if (futureEventDays.length > 0) {
    html += `<div class="cl-timeline-sep">⚡ Eventos Planejados</div>`;
    futureEventDays.forEach(dayNum => {
      const evForDay = events.filter(e => e.day === dayNum);
      const active = selectedDayId === `future-${dayNum}` ? "active" : "";
      html += `
        <div class="cl-day-entry ${active} has-event" data-future-day="${dayNum}">
          <div class="cl-day-num" style="color:var(--wax-red-dark);">Dia ${dayNum}</div>
          <div class="cl-day-title-small" style="color:var(--wax-red);">${evForDay.length} evento(s) planejado(s)</div>
        </div>`;
    });
  }

  list.innerHTML = html;

  // Handlers
  list.querySelectorAll("[data-day-id]").forEach(el => {
    el.addEventListener("click", () => {
      selectedDayId = el.dataset.dayId;
      render();
    });
  });
  list.querySelectorAll("[data-future-day]").forEach(el => {
    el.addEventListener("click", () => {
      selectedDayId = `future-${el.dataset.futureDay}`;
      render();
    });
  });
}

function renderContent() {
  const col = document.getElementById("content-col");

  if (!selectedDayId) {
    col.innerHTML = `
      <div class="cl-empty">
        <div class="cl-empty-icon">📅</div>
        <p class="cl-empty-title">Bem-vindo ao Acompanhamento</p>
        <p class="cl-empty-sub">Registre os dias da campanha com o que aconteceu e planeje eventos futuros com as escolhas dos jogadores e suas consequências.</p>
      </div>
      <div class="cl-plan-section" id="btn-plan-new-event">
        <span class="cl-plan-icon">⚡</span>
        <div class="cl-plan-text">
          <strong>Planejar Evento Futuro</strong>
          <span>Defina o que acontece em determinado dia e prepare as opções dos jogadores</span>
        </div>
        <span>▶</span>
      </div>`;
    document.getElementById("btn-plan-new-event")?.addEventListener("click", () => openEventModal(null));
    return;
  }

  // Dia registrado
  if (!selectedDayId.startsWith("future-")) {
    const day = days.find(d => d.id === selectedDayId);
    if (!day) { selectedDayId = null; render(); return; }
    const dayEvents = events.filter(e => e.day === day.day);

    col.innerHTML = `
      ${renderDayCard(day)}
      ${renderEventsSection(dayEvents, day.day)}
      <div class="cl-plan-section" id="btn-plan-new-event">
        <span class="cl-plan-icon">⚡</span>
        <div class="cl-plan-text">
          <strong>Planejar Evento Futuro</strong>
          <span>Defina o que acontece em determinado dia e prepare as opções dos jogadores</span>
        </div>
        <span>▶</span>
      </div>`;

    // Bind botões do card de dia
    document.getElementById(`btn-edit-day-${day.id}`)?.addEventListener("click", () => openDayModal(day.id));
    document.getElementById(`btn-delete-day-${day.id}`)?.addEventListener("click", () => deleteDay(day.id));
    document.getElementById(`btn-add-event-to-day`)?.addEventListener("click", () => openEventModal(null, day.day));
    document.getElementById("btn-plan-new-event")?.addEventListener("click", () => openEventModal(null));
    bindEventHandlers(dayEvents);
    return;
  }

  // Dia futuro (só eventos)
  const futureDay = parseInt(selectedDayId.replace("future-",""));
  const dayEvents = events.filter(e => e.day === futureDay);

  col.innerHTML = `
    <div class="cl-day-card">
      <div class="cl-day-card-header">
        <span class="cl-day-label">Dia ${futureDay}</span>
        <span class="cl-day-card-title" style="color:var(--wax-red-dark);">Dia ainda não registrado</span>
      </div>
      <div class="cl-day-card-body">
        <p class="cl-relato-empty">Este dia tem eventos planejados mas ainda não foi registrado. Quando a sessão chegar a este dia, clique em "+ Dia" para registrar o relato.</p>
      </div>
    </div>
    ${renderEventsSection(dayEvents, futureDay)}
    <div class="cl-plan-section" id="btn-plan-new-event">
      <span class="cl-plan-icon">⚡</span>
      <div class="cl-plan-text">
        <strong>Planejar Evento Futuro</strong>
        <span>Defina o que acontece em determinado dia e prepare as opções dos jogadores</span>
      </div>
      <span>▶</span>
    </div>`;

  document.getElementById(`btn-add-event-to-day`)?.addEventListener("click", () => openEventModal(null, futureDay));
  document.getElementById("btn-plan-new-event")?.addEventListener("click", () => openEventModal(null));
  bindEventHandlers(dayEvents);
}

function renderDayCard(day) {
  return `
    <div class="cl-day-card">
      <div class="cl-day-card-header">
        <span class="cl-day-label">Dia ${day.day}</span>
        <span class="cl-day-card-title">${escHTML(day.title || "(sem título)")}</span>
        <div class="cl-day-card-actions">
          <button class="cl-icon-btn" id="btn-edit-day-${day.id}" title="Editar">✏️</button>
          <button class="cl-icon-btn danger" id="btn-delete-day-${day.id}" title="Remover">🗑</button>
        </div>
      </div>
      <div class="cl-day-card-body">
        ${day.relato
          ? `<div class="cl-relato">${escHTML(day.relato)}</div>`
          : `<p class="cl-relato-empty">Nenhum relato escrito para este dia.</p>`}
      </div>
    </div>`;
}

function renderEventsSection(dayEvents, dayNum) {
  let html = `<div class="cl-events-section">`;

  if (dayEvents.length > 0) {
    html += `<div class="cl-events-title">⚡ Eventos do Dia ${dayNum} <span style="font-family:var(--font-heading);font-size:10px;opacity:0.7;">(${dayEvents.length})</span></div>`;
    dayEvents.forEach(ev => { html += renderEventCard(ev); });
  }

  html += `
    <button class="cl-btn-add-event" id="btn-add-event-to-day">
      ⚡ Adicionar Evento ao Dia ${dayNum}
    </button>
  </div>`;

  return html;
}

function renderEventCard(ev) {
  const statusLabel = { pending:"Pendente", resolved:"Resolvido", skipped:"Ignorado" }[ev.status] || "Pendente";
  const optionsHTML = (ev.options || []).map((opt, i) => `
    <div class="cl-option ${opt.chosen ? "chosen" : ""}" data-event-id="${ev.id}" data-opt-idx="${i}">
      <div class="cl-option-header">
        <div class="cl-option-radio"></div>
        <span class="cl-option-text">${escHTML(opt.text)}</span>
      </div>
      ${opt.consequence ? `<div class="cl-option-consequence">${escHTML(opt.consequence)}</div>` : ""}
    </div>`).join("");

  return `
    <div class="cl-event-card status-${ev.status || "pending"}" id="event-card-${ev.id}">
      <div class="cl-event-header">
        <span class="cl-event-status-badge">${statusLabel}</span>
        <span class="cl-event-title">${escHTML(ev.title)}</span>
        <div style="display:flex;gap:5px;margin-left:auto;">
          <button class="cl-icon-btn" data-edit-event="${ev.id}" title="Editar">✏️</button>
          <button class="cl-icon-btn danger" data-delete-event="${ev.id}" title="Remover">🗑</button>
        </div>
      </div>
      ${ev.desc ? `<div class="cl-event-body">${escHTML(ev.desc)}</div>` : ""}
      ${optionsHTML ? `<div class="cl-event-body" style="padding-top:0">${optionsHTML ? `<div class="cl-options">${optionsHTML}</div>` : ""}</div>` : ""}
    </div>`;
}

function bindEventHandlers(dayEvents) {
  // Editar evento
  document.querySelectorAll("[data-edit-event]").forEach(btn => {
    btn.addEventListener("click", e => { e.stopPropagation(); openEventModal(btn.dataset.editEvent); });
  });
  // Deletar evento
  document.querySelectorAll("[data-delete-event]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      if (!confirm("Remover este evento?")) return;
      events = events.filter(ev => ev.id !== btn.dataset.deleteEvent);
      saveData(); render();
    });
  });
  // Escolher opção
  document.querySelectorAll("[data-event-id][data-opt-idx]").forEach(el => {
    el.querySelector(".cl-option-header")?.addEventListener("click", () => {
      const evId = el.dataset.eventId;
      const idx  = parseInt(el.dataset.optIdx);
      const ev   = events.find(e => e.id === evId);
      if (!ev) return;
      // Toggle: se já escolhida, desmarca
      ev.options.forEach((o, i) => { o.chosen = (i === idx) ? !o.chosen : false; });
      ev.status = ev.options.some(o => o.chosen) ? "resolved" : "pending";
      saveData(); render();
    });
  });
}

// ── Modal de Dia ──────────────────────────────────────────────────
function openDayModal(dayId = null) {
  editingDayId = dayId;
  const modal = document.getElementById("modal-day");
  const existing = dayId ? days.find(d => d.id === dayId) : null;

  document.getElementById("modal-day-title").textContent = existing ? "Editar Dia" : "Registrar Dia";
  document.getElementById("field-day-num").value   = existing ? existing.day   : (currentDay() + (days.length === 0 ? 0 : 1));
  document.getElementById("field-day-title").value = existing ? existing.title : "";
  document.getElementById("field-day-relato").value = existing ? existing.relato : "";

  modal.classList.add("open");
  setTimeout(() => document.getElementById("field-day-title").focus(), 100);
}
function closeDayModal() { document.getElementById("modal-day").classList.remove("open"); }

function saveDayModal() {
  const dayNum = parseInt(document.getElementById("field-day-num").value);
  const title  = document.getElementById("field-day-title").value.trim();
  const relato = document.getElementById("field-day-relato").value.trim();

  if (!dayNum || dayNum < 1) { alert("Informe um número de dia válido."); return; }

  if (editingDayId) {
    const idx = days.findIndex(d => d.id === editingDayId);
    if (idx >= 0) { days[idx] = { ...days[idx], day: dayNum, title, relato }; }
  } else {
    const newDay = { id: genId(), day: dayNum, title, relato };
    days.push(newDay);
    selectedDayId = newDay.id;
  }

  saveData(); closeDayModal(); render();
}

// ── Modal de Evento ───────────────────────────────────────────────
function openEventModal(eventId = null, prefillDay = null) {
  editingEventId = eventId;
  const modal = document.getElementById("modal-event");
  const existing = eventId ? events.find(e => e.id === eventId) : null;

  document.getElementById("modal-event-title").textContent = existing ? "Editar Evento" : "Planejar Evento";
  document.getElementById("field-event-day").value   = existing ? existing.day   : (prefillDay || "");
  document.getElementById("field-event-title").value  = existing ? existing.title : "";
  document.getElementById("field-event-desc").value   = existing ? existing.desc  : "";

  optionDraft = existing ? existing.options.map(o => ({ ...o })) : [];
  if (optionDraft.length === 0) {
    // começa com 2 opções vazias
    optionDraft.push({ text: "", consequence: "", chosen: false });
    optionDraft.push({ text: "", consequence: "", chosen: false });
  }

  renderOptionsDraft();
  modal.classList.add("open");
  setTimeout(() => document.getElementById("field-event-title").focus(), 100);
}
function closeEventModal() { document.getElementById("modal-event").classList.remove("open"); }

function renderOptionsDraft() {
  const builder = document.getElementById("options-builder");
  builder.innerHTML = optionDraft.map((opt, i) => `
    <div class="cl-option-builder-item">
      <div class="cl-option-builder-head">
        <div class="cl-option-num">${i+1}</div>
        <input type="text" class="cl-input" style="flex:1;" data-opt-text="${i}" value="${escHTML(opt.text)}" placeholder="O que os jogadores podem fazer...">
        <button class="cl-btn-remove-opt" data-remove-opt="${i}" title="Remover opção">×</button>
      </div>
      <textarea class="cl-textarea" style="min-height:56px;" data-opt-consequence="${i}" placeholder="Consequência desta escolha para o mundo...">${escHTML(opt.consequence)}</textarea>
    </div>`).join("");

  // Bind campos
  builder.querySelectorAll("[data-opt-text]").forEach(inp => {
    inp.addEventListener("input", () => { optionDraft[parseInt(inp.dataset.optText)].text = inp.value; });
  });
  builder.querySelectorAll("[data-opt-consequence]").forEach(ta => {
    ta.addEventListener("input", () => { optionDraft[parseInt(ta.dataset.optConsequence)].consequence = ta.value; });
  });
  builder.querySelectorAll("[data-remove-opt]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.removeOpt);
      if (optionDraft.length <= 1) return;
      optionDraft.splice(idx, 1);
      renderOptionsDraft();
    });
  });
}

function saveEventModal() {
  const dayNum = parseInt(document.getElementById("field-event-day").value);
  const title  = document.getElementById("field-event-title").value.trim();
  const desc   = document.getElementById("field-event-desc").value.trim();

  if (!dayNum || dayNum < 1) { alert("Informe o dia de ocorrência do evento."); return; }
  if (!title) { alert("Informe o título do evento."); return; }

  // Sincronizar optionDraft com os valores dos inputs
  document.querySelectorAll("[data-opt-text]").forEach(inp => {
    optionDraft[parseInt(inp.dataset.optText)].text = inp.value;
  });
  document.querySelectorAll("[data-opt-consequence]").forEach(ta => {
    optionDraft[parseInt(ta.dataset.optConsequence)].consequence = ta.value;
  });

  const options = optionDraft.filter(o => o.text.trim());

  if (editingEventId) {
    const idx = events.findIndex(e => e.id === editingEventId);
    if (idx >= 0) {
      events[idx] = { ...events[idx], day: dayNum, title, desc, options };
    }
  } else {
    events.push({ id: genId(), day: dayNum, title, desc, options, status: "pending" });
  }

  // Auto-selecionar o dia do evento
  const dayRecord = days.find(d => d.day === dayNum);
  if (dayRecord) selectedDayId = dayRecord.id;
  else selectedDayId = `future-${dayNum}`;

  saveData(); closeEventModal(); render();
}

// ── Deletar dia ───────────────────────────────────────────────────
function deleteDay(dayId) {
  if (!confirm("Remover este dia e seu relato? Os eventos do dia permanecem como eventos futuros.")) return;
  const day = days.find(d => d.id === dayId);
  days = days.filter(d => d.id !== dayId);
  if (day) {
    // Verifica se ainda há eventos para esse dia — se sim, torna-o "futuro"
    const hasEvents = events.some(e => e.day === day.day);
    selectedDayId = hasEvents ? `future-${day.day}` : null;
  } else {
    selectedDayId = null;
  }
  saveData(); render();
}

// ── Utilitário ────────────────────────────────────────────────────
function escHTML(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  render();

  // Modal de dia
  document.getElementById("btn-add-day").addEventListener("click", () => openDayModal(null));
  document.getElementById("btn-close-day-modal").addEventListener("click", closeDayModal);
  document.getElementById("btn-cancel-day").addEventListener("click", closeDayModal);
  document.getElementById("btn-save-day").addEventListener("click", saveDayModal);
  document.getElementById("modal-day").addEventListener("click", e => {
    if (e.target === document.getElementById("modal-day")) closeDayModal();
  });

  // Modal de evento
  document.getElementById("btn-close-event-modal").addEventListener("click", closeEventModal);
  document.getElementById("btn-cancel-event").addEventListener("click", closeEventModal);
  document.getElementById("btn-save-event").addEventListener("click", saveEventModal);
  document.getElementById("btn-add-option").onclick = () => {
    // Sincroniza valores atuais antes de re-render
    document.querySelectorAll("[data-opt-text]").forEach(inp => {
      optionDraft[parseInt(inp.dataset.optText)].text = inp.value;
    });
    document.querySelectorAll("[data-opt-consequence]").forEach(ta => {
      optionDraft[parseInt(ta.dataset.optConsequence)].consequence = ta.value;
    });
    optionDraft.push({ text: "", consequence: "", chosen: false });
    renderOptionsDraft();
  };
  document.getElementById("modal-event").addEventListener("click", e => {
    if (e.target === document.getElementById("modal-event")) closeEventModal();
  });
});
