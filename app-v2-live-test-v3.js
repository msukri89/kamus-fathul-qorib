const DATA_URL = "data-v2-thaharah-opening-test-v24.json";
const state = { data: null, activeToken: null, lastFocusedToken: null };
const $ = (selector) => document.querySelector(selector);

function lexemeMap() { return new Map((state.data?.lexemes || []).map((item) => [item.lexeme_id, item])); }
function tokenArabic(token) { return token?.form?.arabic || token?.arabic || ""; }
function getTokenLexemeIds(token) {
  if (token?.lexeme_id) return [token.lexeme_id];
  if (Array.isArray(token?.form?.components)) return token.form.components.map((component) => component.lexeme_id).filter(Boolean);
  return [];
}
function getTokenLiteral(token, lexeme) { return token?.literal || lexeme?.literal || ""; }
function getLexemeLabel(lexeme) { return lexeme?.lemma || lexeme?.arabic || ""; }
function escapeHtml(value = "") { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function escapeAttribute(value = "") { return escapeHtml(value); }

function render() {
  const data = state.data;
  const section = data.sections[0];
  const map = lexemeMap();
  const seenLexemes = new Set();

  $("#format-badge").textContent = `V${data.format_version} · ${data.status}`;
  $("#title-arabic").textContent = section.title_arabic;
  $("#chapter-reference").textContent = section.chapter_reference;
  $("#text-arabic").textContent = section.text_arabic;
  $("#translation").textContent = section.translation_literal;
  $("#translation-note").textContent = section.translation_note || "";

  $("#tokens").innerHTML = section.tokens.map((token, index) => {
    const arabic = tokenArabic(token);
    const ids = getTokenLexemeIds(token);
    const known = ids.some((id) => seenLexemes.has(id));
    ids.forEach((id) => seenLexemes.add(id));
    const first = ids.length ? map.get(ids[0]) : null;
    const label = token.token_type === "phrase" ? "frasa" : (known ? "sudah dibahas" : "lihat rincian");
    return `<button class="token ${known ? "token-repeat" : "token-new"}" data-index="${index}" type="button" aria-label="Lihat rincian lafaz ${escapeAttribute(arabic)}"><span class="token-arabic">${escapeHtml(arabic)}</span><span class="token-ref">${escapeHtml(first ? getLexemeLabel(first) : label)}</span></button>`;
  }).join("");

  $("#tokens").querySelectorAll(".token").forEach((button) => button.addEventListener("click", () => showToken(Number(button.dataset.index), button)));
}

function showToken(index, sourceButton = null) {
  const token = state.data.sections[0].tokens[index];
  if (!token) return;

  const map = lexemeMap();
  const arabic = tokenArabic(token);
  const ids = getTokenLexemeIds(token);
  const lexemes = ids.map((id) => map.get(id)).filter(Boolean);
  const primary = lexemes[0] || null;
  const isPhrase = token.token_type === "phrase";

  state.activeToken = token;
  state.lastFocusedToken = sourceButton || document.activeElement;

  $("#detail-arabic").textContent = arabic;
  $("#detail-meaning-label").textContent = isPhrase ? "Makna frasa" : "Makna literal";

  if (isPhrase) {
    const components = Array.isArray(token.form?.components) ? token.form.components : [];
    const componentMeanings = components.map((component) => {
      const lexeme = component.lexeme_id ? map.get(component.lexeme_id) : null;
      return lexeme?.literal || component.literal || "";
    }).filter(Boolean);
    $("#detail-literal").textContent = token.literal || componentMeanings.join("; ") || token.contextual_meaning || "—";
  } else {
    $("#detail-literal").textContent = getTokenLiteral(token, primary) || "—";
  }

  $("#single-lexeme-fields").hidden = isPhrase;
  $("#detail-components-box").hidden = !isPhrase;

  if (!isPhrase) {
    $("#detail-lemma").textContent = primary?.lemma || "—";
    $("#detail-type").textContent = primary?.type || "—";
    $("#detail-morphology").textContent = primary?.morphology || "—";
    $("#detail-root").textContent = primary?.root || "—";
    $("#detail-pattern").textContent = primary?.pattern || "—";
    $("#detail-derivation").textContent = primary?.derivation || "—";
  } else {
    const components = Array.isArray(token.form?.components) ? token.form.components : [];
    $("#detail-components").innerHTML = components.map((component) => {
      const lexeme = component.lexeme_id ? map.get(component.lexeme_id) : null;
      const componentArabic = component.arabic || "";
      const literal = lexeme?.literal || component.literal || "";
      const lemma = lexeme?.lemma || "";
      return `<div class="component-row"><div class="component-arabic">${escapeHtml(componentArabic)}</div><div><strong>${escapeHtml(lemma || "Lafaz fungsi")}</strong><div class="component-literal">${escapeHtml(literal || "—")}</div></div></div>`;
    }).join("");
  }

  const literal = getTokenLiteral(token, primary);
  const contextual = token.contextual_meaning || "";
  const context = contextual && contextual !== literal ? contextual : (token.reference?.context_note || "");
  $("#detail-context").textContent = context;
  $("#detail-context-box").hidden = !context;

  const isRepeat = Boolean(token.reference?.status === "reused" || token.reference_note);
  $("#repeat-note").hidden = !isRepeat;
  if (isRepeat) $("#repeat-note").textContent = token.reference_note || "Lafaz ini menggunakan kembali identitas leksikal yang sudah dianalisis sebelumnya.";

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
  state.activeToken = null;
  if (state.lastFocusedToken?.focus) state.lastFocusedToken.focus();
}
function initModalEvents() {
  $("#close-modal").addEventListener("click", closeModal);
  $("#lexeme-modal").addEventListener("click", (event) => { if (event.target === $("#lexeme-modal")) closeModal(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#lexeme-modal").hidden) { event.preventDefault(); closeModal(); }
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
