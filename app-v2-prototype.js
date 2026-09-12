const DATA_URL = "data-v2-prototype.json";

const state = {
  data: null,
  activeLexeme: null,
  lastFocusedToken: null
};

const $ = (selector) => document.querySelector(selector);

function lexemeMap() {
  return new Map((state.data?.lexemes || []).map((item) => [item.lexeme_id, item]));
}

function render() {
  const data = state.data;
  const map = lexemeMap();
  const section = data.sections[0];
  const seenLexemes = new Set();

  $("#format-badge").textContent = `V${data.format_version} · ${data.status}`;
  $("#title-arabic").textContent = section.title_arabic;
  $("#chapter-reference").textContent = section.chapter_reference;
  $("#text-arabic").textContent = section.text_arabic;
  $("#translation").textContent = section.translation_literal;
  $("#translation-note").textContent = section.translation_note;

  $("#tokens").innerHTML = section.tokens.map((token, index) => {
    const lexeme = token.lexeme_id ? map.get(token.lexeme_id) : null;
    const known = token.lexeme_id && seenLexemes.has(token.lexeme_id);
    if (token.lexeme_id) seenLexemes.add(token.lexeme_id);

    const classes = ["token", known ? "token-repeat" : "token-new"].join(" ");
    const label = known ? "sudah dibahas" : "lihat rincian";

    return `
      <button class="${classes}" data-index="${index}" type="button" aria-label="Lihat rincian lafaz ${escapeAttribute(token.arabic)}">
        <span class="token-arabic">${escapeHtml(token.arabic)}</span>
        ${known ? `<span class="token-ref">↳ ${label}</span>` : lexeme ? `<span class="token-ref">${escapeHtml(lexeme.lemma || lexeme.arabic)}</span>` : ""}
      </button>`;
  }).join("");

  $("#tokens").querySelectorAll(".token").forEach((button) => {
    button.addEventListener("click", () => showToken(Number(button.dataset.index), button));
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value);
}

function showToken(index, sourceButton = null) {
  const section = state.data.sections[0];
  const token = section.tokens[index];
  const map = lexemeMap();
  const lexeme = token.lexeme_id ? map.get(token.lexeme_id) : null;

  if (!lexeme) return;

  state.activeLexeme = token.lexeme_id;
  state.lastFocusedToken = sourceButton || document.activeElement;

  $("#detail-arabic").textContent = token.arabic;
  $("#detail-lemma").textContent = lexeme.lemma || lexeme.arabic || "—";
  $("#detail-type").textContent = lexeme.type || "—";
  $("#detail-morphology").textContent = lexeme.morphology || "—";
  $("#detail-root").textContent = lexeme.root || "—";
  $("#detail-pattern").textContent = lexeme.pattern || "—";
  $("#detail-derivation").textContent = lexeme.derivation || "—";
  $("#detail-literal").textContent = lexeme.literal || "—";

  const context = token.context || lexeme.context_note || token.reference_note || "";
  $("#detail-context").textContent = context;
  $("#detail-context-box").hidden = !context;

  const isRepeat = Boolean(token.reference_note);
  $("#repeat-note").hidden = !isRepeat;
  if (isRepeat) {
    $("#repeat-note").textContent = token.reference_note;
  }

  openModal();
}

function openModal() {
  const modal = $("#lexeme-modal");
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  $("#close-modal").focus();
}

function closeModal() {
  const modal = $("#lexeme-modal");
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  state.activeLexeme = null;

  if (state.lastFocusedToken && typeof state.lastFocusedToken.focus === "function") {
    state.lastFocusedToken.focus();
  }
}

function initModalEvents() {
  $("#close-modal").addEventListener("click", closeModal);

  $("#lexeme-modal").addEventListener("click", (event) => {
    if (event.target === $("#lexeme-modal")) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#lexeme-modal").hidden) {
      event.preventDefault();
      closeModal();
    }
  });
}

async function init() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    initModalEvents();
    render();
  } catch (error) {
    $("#app-error").hidden = false;
    $("#app-error").textContent = `Gagal memuat prototype: ${error.message}`;
  }
}

init();
