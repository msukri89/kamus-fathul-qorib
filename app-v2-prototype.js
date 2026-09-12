const DATA_URL = "data-v2-prototype.json";

const state = {
  data: null,
  activeLexeme: null,
  seenLexemes: new Set()
};

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function lexemeMap() {
  return new Map((state.data?.lexemes || []).map((item) => [item.lexeme_id, item]));
}

function render() {
  const data = state.data;
  const map = lexemeMap();
  const section = data.sections[0];

  $("#format-badge").textContent = `V${data.format_version} · ${data.status}`;
  $("#title-arabic").textContent = section.title_arabic;
  $("#chapter-reference").textContent = section.chapter_reference;
  $("#text-arabic").textContent = section.text_arabic;
  $("#translation").textContent = section.translation_literal;
  $("#translation-note").textContent = section.translation_note;

  $("#tokens").innerHTML = section.tokens.map((token, index) => {
    const lexeme = token.lexeme_id ? map.get(token.lexeme_id) : null;
    const known = token.lexeme_id && state.seenLexemes.has(token.lexeme_id);
    if (token.lexeme_id) state.seenLexemes.add(token.lexeme_id);

    const classes = ["token", known ? "token-repeat" : "token-new"].join(" ");
    const label = known ? "sudah dibahas" : "analisis lafaz";
    const lexemeData = lexeme ? escapeHtml(lexeme.lemma || lexeme.arabic) : "";

    return `
      <button class="${classes}" data-index="${index}" type="button">
        <span class="token-arabic">${escapeHtml(token.arabic)}</span>
        <span class="token-role">${escapeHtml(token.grammar_role || "")}</span>
        ${known ? `<span class="token-ref">↳ ${label}</span>` : lexeme ? `<span class="token-ref">${lexemeData}</span>` : ""}
      </button>`;
  }).join("");

  $("#tokens").querySelectorAll(".token").forEach((button) => {
    button.addEventListener("click", () => showToken(Number(button.dataset.index)));
  });
}

function showToken(index) {
  const section = state.data.sections[0];
  const token = section.tokens[index];
  const map = lexemeMap();
  const lexeme = token.lexeme_id ? map.get(token.lexeme_id) : null;

  state.activeLexeme = token.lexeme_id || null;
  $("#detail-empty").hidden = true;
  $("#detail").hidden = false;
  $("#detail-arabic").textContent = token.arabic;
  $("#detail-role").textContent = token.grammar_role || "—";
  $("#detail-context").textContent = token.context || token.reference_note || "—";

  if (!lexeme) {
    $("#lexeme-card").hidden = true;
    $("#repeat-note").hidden = true;
    return;
  }

  $("#lexeme-card").hidden = false;
  $("#repeat-note").hidden = false;
  $("#detail-lemma").textContent = lexeme.lemma || lexeme.arabic;
  $("#detail-type").textContent = lexeme.type || "—";
  $("#detail-morphology").textContent = lexeme.morphology || "—";
  $("#detail-root").textContent = lexeme.root || "—";
  $("#detail-pattern").textContent = lexeme.pattern || "—";
  $("#detail-derivation").textContent = lexeme.derivation || "—";
  $("#detail-literal").textContent = lexeme.literal || "—";
  $("#repeat-note").textContent = token.reference_note || "Analisis sharaf dan makna leksikal disimpan satu kali pada lafaz ini. Kemunculan berikutnya cukup memakai referensi ini, sementara fungsi nahwu tetap dicatat sesuai konteks.";
}

async function init() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    render();
  } catch (error) {
    $("#app-error").hidden = false;
    $("#app-error").textContent = `Gagal memuat prototype: ${error.message}`;
  }
}

init();
