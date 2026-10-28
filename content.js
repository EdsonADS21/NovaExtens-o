(function () {
  const STORAGE_KEY = "expanderTags";
  const DEBUG = true;
  let tags = [];
  let modalHost = null;
  let modalOpen = false;

  let pwdModalHost = null;
  let pwdModalOpen = false;
  // UI preference only; all expander and modal actions retain their original logic.
  let surfaceTheme = 'light';
  const applySurfaceTheme = theme => {
    surfaceTheme = theme === 'dark' ? 'dark' : 'light';
    for (const surface of [previewHost, modalHost, pwdModalHost]) {
      if (surface) surface.dataset.theme = surfaceTheme;
    }
  };

  const ROUTER_PASSWORDS = [
    { provider: "Br Super", passwords: ["br@@remoto", "Br$uper01", "XPON#TDWLD"] },
    { provider: "HBA", passwords: ["hba2021#", "Hba2021#"] },
    { provider: "Phx", passwords: ["phoenix1010"] },
    { provider: "Provernet", passwords: ["Prove$NET!@#3411", "Admin3411px@", "3411px"] }
  ];

  let previewHost = null;
  let previewRoot = null;
  let previewBox = null;
  let activeElement = null;
  let activeTypedPrefix = "";
  try {
    chrome.storage.local.get(['scriptPanelState'], result => applySurfaceTheme(result.scriptPanelState?.theme));
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.scriptPanelState) applySurfaceTheme(changes.scriptPanelState.newValue?.theme);
    });
  } catch {}

  function log(...args) {
    if (DEBUG) console.log("[Auto Preencher - Text Expander]", ...args);
  }

  function loadTags() {
    try {
      chrome.storage.local.get([STORAGE_KEY], (res) => {
        tags = Array.isArray(res[STORAGE_KEY]) ? res[STORAGE_KEY] : [];
        log("Tags carregadas:", tags.map((t) => t.shortcut));
      });
    } catch (e) {
      console.warn("[Auto Preencher] Não consegui acessar chrome.storage.", e);
    }
  }
  loadTags();

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[STORAGE_KEY]) {
        tags = Array.isArray(changes[STORAGE_KEY].newValue) ? changes[STORAGE_KEY].newValue : [];
      }
    });
  } catch (e) {}

  /* ==================================================================
     MENU DE SUGESTÕES EM LISTA (DESIGN MODERNO)
  ================================================================== */
  function ensurePreviewDOM() {
    if (previewHost) return;
    previewHost = document.createElement("div");
    previewHost.dataset.theme = surfaceTheme;
    previewHost.style.all = "initial";
    document.body.appendChild(previewHost);
    previewRoot = previewHost.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `:host{
  color-scheme: light;
  --bg: #f3f5f2;
  --surface: #ffffff;
  --surface-2: #eef2ee;
  --surface-3: #e0e7e1;
  --text: #20332e;
  --text-muted: #56665f;
  --border: #7a8f80;
  --border-hover: #7f9589;
  --primary: #086b59;
  --primary-hover: #075647;
  --primary-dim: #e0f0e9;
  --on-primary: #ffffff;
  --success: #18633d;
  --amber: #8a5307;
  --amber-dim: #fff1d6;
  --danger: #b02b38;
  --secondary: var(--primary);
  --secondary-dim: var(--primary-dim);
  --accent: var(--primary);
  --accent-dim: var(--primary-dim);
  --purple: var(--primary);
  --purple-dim: var(--primary-dim);
  --sans: 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif;
  --display: var(--sans);
  --mono: 'Cascadia Mono', Consolas, ui-monospace, monospace;
  --radius: 8px;
  --radius-sm: 5px;
  --transition: 120ms ease;
  --shadow-sm: none;
  --shadow-md: none;}:host([data-theme=dark]){
  color-scheme: dark;
  --bg: #151e1b;
  --surface: #1c2923;
  --surface-2: #25352d;
  --surface-3: #34473c;
  --text: #eef4ef;
  --text-muted: #b3c2b8;
  --border: #698573;
  --border-hover: #819b89;
  --primary: #8cddbc;
  --primary-hover: #a6e8cd;
  --primary-dim: #263f33;
  --on-primary: #123326;
  --success: #9cdeb1;
  --amber: #f0c27b;
  --amber-dim: #443620;
  --danger: #ffadb0;}
*{box-sizing:border-box;font-family:var(--sans)}
button{font:inherit;cursor:pointer;color:var(--text);min-height:36px;border:1px solid var(--border);border-radius:5px;background:var(--surface);padding:8px 12px}
button:hover{background:var(--surface-2);border-color:var(--primary)}
:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
.suggestion-menu{position:fixed;z-index:2147483647;display:none;width:380px;max-width:calc(100vw - 20px);max-height:min(380px,calc(100vh - 20px));overflow:auto;padding:6px;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;font-size:14px}
.menu-header,.menu-footer{display:flex;justify-content:space-between;align-items:center;padding:8px;color:var(--text-muted);font-size:12px}
.menu-header{border-bottom:1px solid var(--border);margin-bottom:4px}.menu-footer{border-top:1px solid var(--border)}
.count,.shortcut,.badge{color:var(--primary);background:var(--primary-dim);border-radius:4px;padding:3px 6px;font-size:11px}.shortcut{font-family:var(--mono)}
.suggestion-item{min-height:36px;padding:9px;border:1px solid transparent;border-radius:5px;cursor:pointer}.suggestion-item:hover{border-color:var(--primary);background:var(--surface-2)}
.item-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:5px}.label{font-size:14px;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.body-preview{font-size:12px;line-height:1.5;color:var(--text-muted);white-space:pre-wrap;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}`;
    previewRoot.appendChild(style);

    previewBox = document.createElement("div");
    previewBox.className = "suggestion-menu";
    previewRoot.appendChild(previewBox);
  }

  function getCaretCoordinates(targetEl) {
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect && (rect.top > 0 || rect.left > 0)) {
          return rect;
        }
        const clientRects = range.getClientRects();
        if (clientRects && clientRects.length > 0) {
          return clientRects[0];
        }
      }
    } catch (e) {}
    return targetEl.getBoundingClientRect();
  }

  function showSuggestionsMenu(matchingTags, targetEl, typedPrefix) {
    if (!matchingTags || matchingTags.length === 0 || modalOpen || pwdModalOpen) {
      hideSuggestionsMenu();
      return;
    }
    ensurePreviewDOM();
    activeElement = targetEl;
    activeTypedPrefix = typedPrefix;

    previewBox.innerHTML = `
      <div class="menu-header">
        <span>Respostas rápidas</span>
        <span class="count">${matchingTags.length} atalhos</span>
      </div>
      ${matchingTags.map((t, idx) => `
        <div class="suggestion-item" data-idx="${idx}">
          <div class="item-head">
            <span class="label">${escapeHtml(t.label || t.shortcut)}</span>
            ${t.audioBase64 ? `<span class="badge">🎵 Áudio</span>` : ''}
            ${hasSchedulePlaceholders(t.body) ? `<span class="badge">📅 Agenda</span>` : ''}
            <span class="shortcut">${escapeHtml(t.shortcut)}</span>
          </div>
          <div class="body-preview">${escapeHtml(t.body || "")}</div>
        </div>
      `).join("")}
      <div class="menu-footer">Clique para inserir · Esc para fechar</div>
    `;

    previewBox.querySelectorAll(".suggestion-item").forEach((item) => {
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = Number(item.dataset.idx);
        const chosenTag = matchingTags[idx];
        if (chosenTag && activeElement) {
          applyTagExpansion(chosenTag, activeElement, activeTypedPrefix.length);
        }
      });
    });

    const rect = getCaretCoordinates(targetEl);
    previewBox.style.display = "block";
    const width = previewBox.offsetWidth;
    const height = previewBox.offsetHeight;
    const below = rect.bottom + 8;
    const top = below + height <= window.innerHeight - 10 ? below : Math.max(10, rect.top - height - 8);
    previewBox.style.top = Math.min(top, Math.max(10, window.innerHeight - height - 10)) + 'px';
    previewBox.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - width - 10)) + 'px';
  }

  function hideSuggestionsMenu() {
    if (previewBox) {
      previewBox.style.display = "none";
    }
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  /* ==================================================================
     AUXILIARES DE INPUT & CARET
  ================================================================== */
  function isEditable(el) {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === "TEXTAREA") return true;
    if (tag === "INPUT") {
      const type = (el.type || "text").toLowerCase();
      return ["text", "search", "email", "tel", "url", "password", ""].includes(type);
    }
    return !!el.isContentEditable;
  }

  function isNativeField(el) {
    return el.tagName === "INPUT" || el.tagName === "TEXTAREA";
  }

  function getTextBeforeCaret(el) {
    if (isNativeField(el)) {
      const pos = el.selectionStart ?? el.value.length;
      return el.value.slice(0, pos);
    }
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      return (el.innerText || el.textContent || "").replace(/\u00A0/g, " ");
    }
    try {
      const range = sel.getRangeAt(0);
      const preRange = range.cloneRange();
      preRange.selectNodeContents(el);
      preRange.setEnd(range.endContainer, range.endOffset);
      return preRange.toString().replace(/\u00A0/g, " ");
    } catch (e) {
      return (el.innerText || el.textContent || "").replace(/\u00A0/g, " ");
    }
  }

  function setNativeValue(el, value) {
    const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc && desc.set) {
      desc.set.call(el, value);
    } else {
      el.value = value;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function replaceInNativeField(el, shortcutLen, replacement) {
    const pos = el.selectionStart ?? el.value.length;
    const value = el.value;
    const start = Math.max(0, pos - shortcutLen);
    const newValue = value.slice(0, start) + replacement + value.slice(pos);
    setNativeValue(el, newValue);
    const newPos = start + replacement.length;
    try {
      el.setSelectionRange(newPos, newPos);
    } catch (e) {}
  }

  /* ==================================================================
     DIGITAÇÃO SIMULADA (PARA CAMPOS MASCARADOS)
  ================================================================== */
  function setRawValue(el, value) {
    const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc && desc.set) desc.set.call(el, value);
    else el.value = value;
  }

  function simulateRealTyping(el, text) {
    el.focus();
    try { el.setSelectionRange(0, el.value.length); } catch (e) {}

    setRawValue(el, "");
    el.dispatchEvent(new Event("input", { bubbles: true }));

    let current = "";
    for (const ch of text) {
      current += ch;
      el.dispatchEvent(new KeyboardEvent("keydown", { key: ch, bubbles: true, cancelable: true }));
      el.dispatchEvent(new KeyboardEvent("keypress", { key: ch, bubbles: true, cancelable: true }));
      setRawValue(el, current);
      try {
        el.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: true, data: ch, inputType: "insertText" }));
      } catch (e) {
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
      el.dispatchEvent(new KeyboardEvent("keyup", { key: ch, bubbles: true, cancelable: true }));
    }
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    el.focus();
  }

  function findPairedMaskField(el) {
    if (!el || !el.classList) return null;
    const isMasked = el.classList.contains("maskPassword");
    const isUnmasked = el.classList.contains("unmaskPassword");
    if (!isMasked && !isUnmasked) return null;

    const container = el.closest(".zypasswordBox") || el.parentElement || document;
    const pairSelector = isMasked ? "input.unmaskPassword" : "input.maskPassword";
    return container.querySelector(pairSelector);
  }

  function fillPasswordField(targetEl, pwd) {
    simulateRealTyping(targetEl, pwd);
    const pairEl = findPairedMaskField(targetEl);
    if (pairEl && pairEl !== targetEl) {
      simulateRealTyping(pairEl, pwd);
    }
  }

  function replaceInContentEditable(el, shortcutLen, replacement) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    let node = range.endContainer;
    let offset = range.endOffset;

    try {
      if (node.nodeType === Node.TEXT_NODE && offset >= shortcutLen && shortcutLen > 0) {
        const newRange = document.createRange();
        newRange.setStart(node, offset - shortcutLen);
        newRange.setEnd(node, offset);
        newRange.deleteContents();
        
        const lines = replacement.split("\n");
        const frag = document.createDocumentFragment();
        lines.forEach((line, i) => {
          if (i > 0) frag.appendChild(document.createElement("br"));
          frag.appendChild(document.createTextNode(line));
        });
        newRange.insertNode(frag);
        newRange.collapse(false);
        sel.removeAllRanges();
        sel.addRange(newRange);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        document.execCommand("insertText", false, replacement);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } catch (e) {
      document.execCommand("insertText", false, replacement);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function findExactMatch(text) {
    if (!text) return null;
    const cleanText = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
    let best = null;
    for (const t of tags) {
      if (!t.shortcut) continue;
      if (cleanText.endsWith(t.shortcut)) {
        if (!best || t.shortcut.length > best.shortcut.length) best = t;
      }
    }
    return best;
  }

  function findMatchingTags(text) {
    if (!text) return { matches: [], typed: "" };
    const cleanText = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
    const lastWordMatch = cleanText.match(/(#[^\s]*)$/);
    if (!lastWordMatch) return { matches: [], typed: "" };
    
    const typed = lastWordMatch[1].toLowerCase();
    if (typed === "#") {
      return { matches: tags, typed };
    }

    const matches = tags.filter((t) => t.shortcut && t.shortcut.toLowerCase().startsWith(typed));
    return { matches, typed };
  }

  function hasSchedulePlaceholders(body) {
    return /{{\s*(DATA|TURNO)\s*}}/i.test(body || "");
  }

  function getProtocol() {
    return new Promise((resolve) => {
      const hostname = window.location.hostname;
      const isWithub = hostname === 'app.withub.ai' || hostname.endsWith('.app.withub.ai');
      const modernWithub = hostname === 'app-beta.withub.ai' || (hostname === 'app.withub.ai'
        && (!/^\/attendance\/\d+/.test(window.location.pathname) || new URL(window.location.href).searchParams.has('idTicket')));
      if (modernWithub) {
        const badge = Array.from(document.querySelectorAll('[class~="bg-primary/15"] span.text-primary'))
          .find(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && /^\d{4,20}$/.test(el.textContent.trim()));
        const protocol = badge?.textContent.trim() || '';
        if (protocol) chrome.storage.local.set({ currentProtocol: protocol });
        return resolve(protocol);
      }
      if (isWithub && window.location.pathname.startsWith('/attendance/')) {
        const urlMatch = window.location.pathname.match(/\/attendance\/(\d+)/);
        if (urlMatch && urlMatch[1]) {
          chrome.storage.local.set({ currentProtocol: urlMatch[1] });
          return resolve(urlMatch[1]);
        }
        const spans = Array.from(document.querySelectorAll("span.css-12tehev, span.MuiTypography-caption, span, p"));
        for (const span of spans) {
          const match = span.textContent.match(/#(\d{4,15})/);
          if (match && match[1]) {
            chrome.storage.local.set({ currentProtocol: match[1] });
            return resolve(match[1]);
          }
        }
      }

      try {
        chrome.storage.local.get(["currentProtocol", "pendingAutofill", "scriptPanelState"], (res) => {
          let proto = res.currentProtocol || "";
          if (!proto && res.pendingAutofill?.protocolo) {
            proto = res.pendingAutofill.protocolo;
          }
          if (!proto && res.scriptPanelState?.atendimento?.proto) {
            proto = res.scriptPanelState.atendimento.proto;
          }
          resolve(proto || "");
        });
      } catch (e) {
        resolve("");
      }
    });
  }

  function replaceProtocolTokens(text, protocolValue) {
    return (text || "").replace(/{{\s*(PROTOCOLO|PROTO)\s*}}/gi, protocolValue || "");
  }

  function replaceTimeTokens(text, shortcut = "") {
    const hour = new Date().getHours();
    let saudacao = "Boa noite";
    if (hour >= 5 && hour < 12) {
      saudacao = "Bom dia";
    } else if (hour >= 12 && hour < 18) {
      saudacao = "Boa tarde";
    }
    const periodo = saudacao === "Bom dia" ? "dia" : saudacao === "Boa tarde" ? "tarde" : "noite";
    let result = text || "";
    if (shortcut.trim().toLowerCase() === "#boa") {
      const preserveCase = (original, replacement) => original === original.toUpperCase()
        ? replacement.toUpperCase()
        : original[0] === original[0].toUpperCase()
          ? replacement[0].toUpperCase() + replacement.slice(1) : replacement;
      result = result.replace(/\b(um|uma)\s+excelente\s+(dia|tarde|noite)\b/gi,
        original => preserveCase(original, `${periodo === "dia" ? "um" : "uma"} excelente ${periodo}`));
      result = result.replace(/\brestante\s+de\s+(dia|tarde|noite)\s+maravilhos[oa]\b/gi,
        original => preserveCase(original, `restante de ${periodo} ${periodo === "dia" ? "maravilhoso" : "maravilhosa"}`));
      // Atualiza também a despedida dos atalhos já salvos, sem alterar o cadastro.
      result = result.replace(/\b(?:(um|uma)\s+)?(bom dia|boa tarde|boa noite)\b/gi, (original, article, greeting) => {
        let replacement = greeting === greeting.toUpperCase() ? saudacao.toUpperCase()
          : greeting[0] === greeting[0].toLowerCase() ? saudacao.toLowerCase() : saudacao;
        if (article) {
          let nextArticle = saudacao === "Bom dia" ? "um" : "uma";
          if (article === article.toUpperCase()) nextArticle = nextArticle.toUpperCase();
          else if (article[0] === article[0].toUpperCase()) nextArticle = nextArticle[0].toUpperCase() + nextArticle.slice(1);
          replacement = nextArticle + " " + replacement;
        }
        return replacement;
      });
    }
    return result.replace(/{{\s*HORARIO\s*}}/gi, saudacao)
      .replace(/{{\s*DESPEDIDA\s*}}/gi,
        `Tenha um restante de ${periodo} ${periodo === "dia" ? "maravilhoso" : "maravilhosa"}!`)
      .replace(/(?:\b(um|uma)\s+)?{{\s*EXCELENTE\s*}}/gi, (original, article) => {
        if (!article) return `Excelente ${periodo}`;
        let nextArticle = periodo === "dia" ? "um" : "uma";
        if (article[0] === article[0].toUpperCase()) {
          nextArticle = nextArticle[0].toUpperCase() + nextArticle.slice(1);
        }
        return `${nextArticle} excelente ${periodo}`;
      });
  }

  async function pasteAudioFile(targetEl, audioBase64, fileName = "audio.mp3") {
    if (!audioBase64) return;
    try {
      const response = await fetch(audioBase64);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: "audio/mpeg" });

      const dt = new DataTransfer();
      dt.items.add(file);

      const pasteEvent = new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: dt
      });
      targetEl.dispatchEvent(pasteEvent);

      const dragEnterEvent = new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: dt });
      const dragOverEvent = new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: dt });
      const dropEvent = new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt });

      targetEl.dispatchEvent(dragEnterEvent);
      targetEl.dispatchEvent(dragOverEvent);
      targetEl.dispatchEvent(dropEvent);
    } catch (e) {
      console.error("[Auto Preencher] Falha ao colar/dropar arquivo de áudio:", e);
    }
  }

  function formatDate(d, relative = false) {
    const dias = [
      "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
      "Quinta-feira", "Sexta-feira", "Sábado",
    ];
    let dia = dias[d.getDay()];
    if (relative) {
      const today = new Date();
      const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const sameDay = date => d.getFullYear() === date.getFullYear()
        && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
      if (sameDay(today)) dia = "Hoje";
      else if (sameDay(tomorrow)) dia = "Amanhã";
    }
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dia} (${dd}/${mm})`;
  }

  function closeModal() {
    if (modalHost) modalHost.remove();
    modalHost = null;
    modalOpen = false;
    activeElement?.focus();
  }

  /* ==================================================================
     MODAL DE SENHAS
  ================================================================== */
  function closePasswordModal() {
    if (pwdModalHost) pwdModalHost.remove();
    pwdModalHost = null;
    pwdModalOpen = false;
    if (activeElement) activeElement.focus();
  }

  function openPasswordModal(targetEl) {
    if (pwdModalOpen || modalOpen) return;
    pwdModalOpen = true;
    hideSuggestionsMenu();
    activeElement = targetEl;

    pwdModalHost = document.createElement('div');
    pwdModalHost.dataset.theme = surfaceTheme;
    pwdModalHost.style.all = 'initial';
    document.documentElement.appendChild(pwdModalHost);
    const root = pwdModalHost.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `:host{
  color-scheme: light;
  --bg: #f3f5f2;
  --surface: #ffffff;
  --surface-2: #eef2ee;
  --surface-3: #e0e7e1;
  --text: #20332e;
  --text-muted: #56665f;
  --border: #7a8f80;
  --border-hover: #7f9589;
  --primary: #086b59;
  --primary-hover: #075647;
  --primary-dim: #e0f0e9;
  --on-primary: #ffffff;
  --success: #18633d;
  --amber: #8a5307;
  --amber-dim: #fff1d6;
  --danger: #b02b38;
  --secondary: var(--primary);
  --secondary-dim: var(--primary-dim);
  --accent: var(--primary);
  --accent-dim: var(--primary-dim);
  --purple: var(--primary);
  --purple-dim: var(--primary-dim);
  --sans: 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif;
  --display: var(--sans);
  --mono: 'Cascadia Mono', Consolas, ui-monospace, monospace;
  --radius: 8px;
  --radius-sm: 5px;
  --transition: 120ms ease;
  --shadow-sm: none;
  --shadow-md: none;}:host([data-theme=dark]){
  color-scheme: dark;
  --bg: #151e1b;
  --surface: #1c2923;
  --surface-2: #25352d;
  --surface-3: #34473c;
  --text: #eef4ef;
  --text-muted: #b3c2b8;
  --border: #698573;
  --border-hover: #819b89;
  --primary: #8cddbc;
  --primary-hover: #a6e8cd;
  --primary-dim: #263f33;
  --on-primary: #123326;
  --success: #9cdeb1;
  --amber: #f0c27b;
  --amber-dim: #443620;
  --danger: #ffadb0;}
*{box-sizing:border-box;font-family:var(--sans)}
button{font:inherit;cursor:pointer;color:var(--text);min-height:36px;border:1px solid var(--border);border-radius:5px;background:var(--surface);padding:8px 12px}
button:hover{background:var(--surface-2);border-color:var(--primary)}
:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
.overlay{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;background:#101b1580;color:var(--text);font-size:14px}
.card{width:420px;max-width:100%;max-height:calc(100dvh - 32px);overflow:auto;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:20px}
.eyebrow,.section-label{display:block;color:var(--primary);font-size:12px;font-weight:600;margin-bottom:8px}.heading{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
h3{font-size:20px;font-weight:650;margin:0 0 8px}.sub{font-size:13px;line-height:1.5;color:var(--text-muted);margin:0 0 16px}.close{width:36px;height:36px;flex-shrink:0;padding:0;font-size:24px}
.actions{display:flex;align-items:center;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid var(--border)}.hint,.empty{color:var(--text-muted);font-size:12px;line-height:1.5;margin:0}.hint{flex:1}
@media(max-width:400px){.card{padding:14px}}
.steps{display:flex;gap:16px;margin:0 0 14px;padding:0 0 12px;border-bottom:1px solid var(--border);list-style:none}.step{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted)}.step b{display:grid;place-items:center;border:1px solid var(--border);border-radius:4px;width:24px;height:24px;font-size:12px}.step.active,.step.done{color:var(--primary)}.step.active b{background:var(--primary-dim);border-color:var(--primary)}
.choices{display:grid;gap:6px}.provider-btn,.pwd-btn{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;text-align:left;padding:10px}.provider-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:6px;color:var(--primary);background:var(--primary-dim);font-size:12px;font-weight:600;flex-shrink:0}
.choice-text{flex:1;min-width:0}.choice-text strong{display:block;font-size:14px}.choice-text small{display:block;font-size:12px;color:var(--text-muted);margin-top:4px}.arrow,.insert-label{color:var(--primary)}.insert-label,.pwd-index{font-size:12px}.pwd-btn code{font:14px var(--mono);overflow-wrap:anywhere}.pwd-index{font-family:var(--mono);color:var(--text-muted)}.back{font-size:13px}`;
    root.appendChild(style);
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    root.appendChild(overlay);
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-labelledby', 'passwordTitle');
    card.setAttribute('aria-describedby', 'passwordDescription');
    overlay.appendChild(card);
    let selectedProvider = null;

    function renderStep(focusIndex = 0) {
      const choosingPassword = selectedProvider !== null;
      const provider = choosingPassword ? ROUTER_PASSWORDS[selectedProvider] : null;
      card.innerHTML = `
        <span class="eyebrow">ACESSO AO ROTEADOR</span>
        <div class="heading"><h3 id="passwordTitle">${choosingPassword ? escapeHtml(provider.provider) : 'Qual é a provedora?'}</h3><button type="button" class="close" aria-label="Fechar senhas">×</button></div>
        <p class="sub" id="passwordDescription">${choosingPassword ? 'Selecione a senha para preencher o campo do roteador.' : 'Escolha a provedora para ver as senhas disponíveis.'}</p>
        <ol class="steps" aria-label="Etapas"><li class="step ${choosingPassword ? 'done' : 'active'}" ${!choosingPassword ? 'aria-current="step"' : ''}><b>1</b> Provedora</li><li class="step ${choosingPassword ? 'active' : ''}" ${choosingPassword ? 'aria-current="step"' : ''}><b>2</b> Senha</li></ol>
        <div class="choices">
          ${choosingPassword ? provider.passwords.map((pwd, index) => `<button type="button" class="pwd-btn" data-password-index="${index}"><span class="pwd-index">${String(index + 1).padStart(2, '0')}</span><span class="choice-text"><code>${escapeHtml(pwd)}</code></span><span class="insert-label">Inserir ↗</span></button>`).join('') : ROUTER_PASSWORDS.map((p, index) => `<button type="button" class="provider-btn" data-provider-index="${index}"><span class="provider-icon" aria-hidden="true">${escapeHtml(p.provider.slice(0, 2).toUpperCase())}</span><span class="choice-text"><strong>${escapeHtml(p.provider)}</strong><small>${p.passwords.length} ${p.passwords.length === 1 ? 'senha disponível' : 'senhas disponíveis'}</small></span><span class="arrow" aria-hidden="true">›</span></button>`).join('')}
        </div>
        <div class="actions"><button type="button" class="back">${choosingPassword ? '← Trocar provedora' : 'Cancelar'}</button><p class="hint">${choosingPassword ? 'A senha será inserida ao selecionar.' : 'Alt + S para abrir · Esc para fechar'}</p></div>
      `;
      card.querySelector('.close').onclick = closePasswordModal;
      card.querySelector('.back').onclick = () => {
        if (!choosingPassword) return closePasswordModal();
        const previous = selectedProvider;
        selectedProvider = null;
        renderStep(previous);
      };
      card.querySelectorAll('.provider-btn').forEach(button => {
        button.onclick = () => { selectedProvider = Number(button.dataset.providerIndex); renderStep(); };
      });
      card.querySelectorAll('.pwd-btn').forEach(button => {
        button.onclick = () => {
          const pwd = provider.passwords[Number(button.dataset.passwordIndex)];
          closePasswordModal();
          if (targetEl) {
            targetEl.focus();
            if (isNativeField(targetEl)) fillPasswordField(targetEl, pwd);
            else replaceInContentEditable(targetEl, 0, pwd);
          }
        };
      });
      (card.querySelectorAll('.choices button')[focusIndex] || card.querySelector('.close')).focus();
    }
    overlay.addEventListener('click', event => { if (event.target === overlay) closePasswordModal(); });
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        const controls = [...card.querySelectorAll('button')];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && root.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && root.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const choices = [...card.querySelectorAll('.choices button')];
        const index = choices.indexOf(root.activeElement);
        if (index >= 0) { event.preventDefault(); choices[(index + (event.key === 'ArrowDown' ? 1 : -1) + choices.length) % choices.length].focus(); }
      }
    });
    renderStep();
  }

  /* ==================================================================
     MODAL DE AGENDAMENTO
  ================================================================== */
  function openScheduleModal(onConfirm, shortcut = "") {
    if (modalOpen || pwdModalOpen) return;
    modalOpen = true;
    hideSuggestionsMenu();

    modalHost = document.createElement("div");
    modalHost.dataset.theme = surfaceTheme;
    modalHost.style.all = "initial";
    document.documentElement.appendChild(modalHost);
    const root = modalHost.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `:host{
  color-scheme: light;
  --bg: #f3f5f2;
  --surface: #ffffff;
  --surface-2: #eef2ee;
  --surface-3: #e0e7e1;
  --text: #20332e;
  --text-muted: #56665f;
  --border: #7a8f80;
  --border-hover: #7f9589;
  --primary: #086b59;
  --primary-hover: #075647;
  --primary-dim: #e0f0e9;
  --on-primary: #ffffff;
  --success: #18633d;
  --amber: #8a5307;
  --amber-dim: #fff1d6;
  --danger: #b02b38;
  --secondary: var(--primary);
  --secondary-dim: var(--primary-dim);
  --accent: var(--primary);
  --accent-dim: var(--primary-dim);
  --purple: var(--primary);
  --purple-dim: var(--primary-dim);
  --sans: 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif;
  --display: var(--sans);
  --mono: 'Cascadia Mono', Consolas, ui-monospace, monospace;
  --radius: 8px;
  --radius-sm: 5px;
  --transition: 120ms ease;
  --shadow-sm: none;
  --shadow-md: none;}:host([data-theme=dark]){
  color-scheme: dark;
  --bg: #151e1b;
  --surface: #1c2923;
  --surface-2: #25352d;
  --surface-3: #34473c;
  --text: #eef4ef;
  --text-muted: #b3c2b8;
  --border: #698573;
  --border-hover: #819b89;
  --primary: #8cddbc;
  --primary-hover: #a6e8cd;
  --primary-dim: #263f33;
  --on-primary: #123326;
  --success: #9cdeb1;
  --amber: #f0c27b;
  --amber-dim: #443620;
  --danger: #ffadb0;}
*{box-sizing:border-box;font-family:var(--sans)}
button{font:inherit;cursor:pointer;color:var(--text);min-height:36px;border:1px solid var(--border);border-radius:5px;background:var(--surface);padding:8px 12px}
button:hover{background:var(--surface-2);border-color:var(--primary)}
:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
.overlay{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;background:#101b1580;color:var(--text);font-size:14px}
.card{width:420px;max-width:100%;max-height:calc(100dvh - 32px);overflow:auto;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:20px}
.eyebrow,.section-label{display:block;color:var(--primary);font-size:12px;font-weight:600;margin-bottom:8px}.heading{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
h3{font-size:20px;font-weight:650;margin:0 0 8px}.sub{font-size:13px;line-height:1.5;color:var(--text-muted);margin:0 0 16px}.close{width:36px;height:36px;flex-shrink:0;padding:0;font-size:24px}
.actions{display:flex;align-items:center;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid var(--border)}.hint,.empty{color:var(--text-muted);font-size:12px;line-height:1.5;margin:0}.hint{flex:1}
@media(max-width:400px){.card{padding:14px}}
.cal-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px;background:var(--surface-2);border:1px solid var(--border);border-radius:5px;margin-bottom:10px}.month{font-size:14px;font-weight:600;text-transform:capitalize}.navbtn{width:36px;height:36px;padding:0;font-size:20px}
.grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;margin-bottom:10px}.dow{font-size:12px;text-align:center;color:var(--text-muted);padding:5px 0}.day{min-width:0;min-height:36px;padding:4px;border:1px solid transparent;background:transparent;font-size:13px}.day.disabled{color:var(--text-muted);opacity:.65;cursor:not-allowed}.day.today{border-color:var(--border-hover)}.day.selected,.day.selected:hover{background:var(--primary);color:var(--on-primary);border-color:var(--primary);font-weight:650}.day.empty{visibility:hidden}
.section-label{margin:12px 0 6px}.turnos{display:flex;gap:6px}.turno-btn{flex:1;text-align:left;min-height:44px}.turno-btn small{display:block;margin-top:4px;color:var(--text-muted);font-size:12px}.turno-btn.selected{background:var(--primary-dim);color:var(--primary);border-color:var(--primary)}.schedule-summary{background:var(--surface-2);border:1px solid var(--border);padding:10px;border-radius:5px;color:var(--text-muted);margin-top:12px;font-size:13px;line-height:1.5}.confirm{flex:1;min-height:44px;background:var(--primary);border-color:var(--primary);color:var(--on-primary)}.confirm:disabled{opacity:.5;cursor:not-allowed}`;
    root.appendChild(style);

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    root.appendChild(overlay);

    const card = document.createElement("div");
    card.className = "card";
    overlay.appendChild(card);

    card.innerHTML = `
      <span class="eyebrow">AGENDAMENTO · VISITA TÉCNICA</span><h3 id="scheduleTitle">Vamos marcar a visita?</h3>
      <p class="sub">Escolha uma data e o melhor período para o cliente.</p>
      <div class="cal-head">
        <button class="navbtn" id="prevM" aria-label="Mês anterior">‹</button>
        <span class="month" id="monthLabel"></span>
        <button class="navbtn" id="nextM" aria-label="Próximo mês">›</button>
      </div>
      <div class="grid" id="dowRow"></div>
      <div class="grid" id="daysGrid"></div>
      <label class="section-label">Turno</label>
      <div class="turnos">
        <button class="turno-btn" data-turno="Manhã" aria-pressed="false">Manhã<small>09:00 – 13:00</small></button>
        <button class="turno-btn" data-turno="Tarde" aria-pressed="false">Tarde<small>13:00 – 18:00</small></button>
      </div>
      <p class="schedule-summary" id="scheduleSummary" role="status">Selecione o dia e o turno para continuar.</p>
      <div class="actions">
        <button class="btn cancel" id="cancelBtn">Cancelar</button>
        <button class="btn confirm" id="confirmBtn" disabled>Confirmar visita</button>
      </div>
    `;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();
    let selectedDate = null;
    let selectedTurno = null;

    const dowRow = card.querySelector("#dowRow");
    ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].forEach((d) => {
      const el = document.createElement("div");
      el.className = "dow";
      el.textContent = d;
      dowRow.appendChild(el);
    });

    const monthLabel = card.querySelector("#monthLabel");
    const daysGrid = card.querySelector("#daysGrid");
    const confirmBtn = card.querySelector("#confirmBtn");

    function renderCalendar() {
      daysGrid.innerHTML = "";
      const firstDay = new Date(viewYear, viewMonth, 1);
      const startWeekday = (firstDay.getDay() + 6) % 7; 
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      monthLabel.textContent = firstDay.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

      for (let i = 0; i < startWeekday; i++) {
        const empty = document.createElement("div");
        empty.className = "day empty";
        daysGrid.appendChild(empty);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const thisDate = new Date(viewYear, viewMonth, d);
        thisDate.setHours(0, 0, 0, 0);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("aria-label", thisDate.toLocaleDateString("pt-BR", {dateStyle:"full"}));
        btn.setAttribute("aria-pressed", String(!!selectedDate && thisDate.getTime() === selectedDate.getTime()));
        btn.className = "day";
        btn.textContent = d;

        const isPast = thisDate < today;
        if (isPast) { btn.classList.add("disabled"); btn.disabled = true; }
        if (thisDate.getTime() === today.getTime()) btn.classList.add("today");
        if (selectedDate && thisDate.getTime() === selectedDate.getTime()) btn.classList.add("selected");

        if (!isPast) {
          btn.addEventListener("click", () => {
            selectedDate = thisDate;
            renderCalendar();
            daysGrid.querySelector(".selected")?.focus();
            updateConfirm();
          });
        }
        daysGrid.appendChild(btn);
      }
    }

    function updateConfirm() {
      confirmBtn.disabled = !(selectedDate && selectedTurno);
      card.querySelector("#scheduleSummary").textContent = [selectedDate ? (shortcut.trim().toLowerCase() === "#age" ? formatDate(selectedDate, true) : selectedDate.toLocaleDateString("pt-BR", {day:"numeric",month:"long"})) : "Selecione uma data", selectedTurno || "Selecione um turno"].join(" · ");
      card.querySelectorAll(".turno-btn").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.turno === selectedTurno)));
    }

    card.querySelector("#prevM").addEventListener("click", () => {
      viewMonth -= 1;
      if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
      renderCalendar();
    });
    card.querySelector("#nextM").addEventListener("click", () => {
      viewMonth += 1;
      if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
      renderCalendar();
    });

    card.querySelectorAll(".turno-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedTurno = btn.dataset.turno;
        card.querySelectorAll(".turno-btn").forEach((b) => b.classList.toggle("selected", b === btn));
        updateConfirm();
      });
    });

    card.querySelector("#cancelBtn").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    card.querySelector("#confirmBtn").addEventListener("click", () => {
      if (!selectedDate || !selectedTurno) return;
      const dataStr = formatDate(selectedDate, shortcut.trim().toLowerCase() === "#age");
      const TURNO_HORARIOS = {
        "Manhã": "Manhã (De 9 as 13 horas )",
        "Tarde": "Tarde (De 13 as 18 horas )",
      };
      const turnoStr = TURNO_HORARIOS[selectedTurno] || selectedTurno;
      closeModal();
      onConfirm(dataStr, turnoStr);
    });

    card.setAttribute('role','dialog');
    card.setAttribute('aria-modal','true');
    card.setAttribute('aria-labelledby','scheduleTitle');
    overlay.addEventListener('keydown', e => {
      if(e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeModal(); }
      if(e.key === 'Tab') {
        const controls=[...card.querySelectorAll('button:not(:disabled)')];
        const first=controls[0],last=controls[controls.length-1];
        if(e.shiftKey && root.activeElement === first){e.preventDefault();last.focus();}
        else if(!e.shiftKey && root.activeElement === last){e.preventDefault();first.focus();}
      }
    });
    renderCalendar();
    card.querySelector('.day.today')?.focus();
  }

  /* ==================================================================
     EXECUÇÃO DA EXPANSÃO DO ATALHO
  ================================================================== */
  async function applyTagExpansion(match, el, replaceLen) {
    activeElement = el;
    hideSuggestionsMenu();
    log("Expandindo tag:", match.shortcut);
    const nativeField = isNativeField(el);
    const currentProtocol = await getProtocol();

    let bodyProcessado = replaceTimeTokens(match.body, match.shortcut);

    if (hasSchedulePlaceholders(bodyProcessado)) {
      openScheduleModal((dataStr, turnoStr) => {
        let finalText = bodyProcessado
          .replace(/{{\s*DATA\s*}}/gi, dataStr)
          .replace(/{{\s*TURNO\s*}}/gi, turnoStr);
        finalText = replaceProtocolTokens(finalText, currentProtocol);

        el.focus();
        if (nativeField) replaceInNativeField(el, replaceLen, finalText);
        else replaceInContentEditable(el, replaceLen, finalText);

        if (match.audioBase64) {
          pasteAudioFile(el, match.audioBase64, match.audioName || "audio.mp3");
        }
      }, match.shortcut);
    } else {
      const finalText = replaceProtocolTokens(bodyProcessado, currentProtocol);
      el.focus();
      if (nativeField) replaceInNativeField(el, replaceLen, finalText);
      else replaceInContentEditable(el, replaceLen, finalText);

      if (match.audioBase64) {
        pasteAudioFile(el, match.audioBase64, match.audioName || "audio.mp3");
      }
    }
  }

  /* ==================================================================
     DISPARO DO EVENTO DE DIGITAÇÃO E MENU
  ================================================================== */
  async function handleInput(e) {
    if (modalOpen || pwdModalOpen) return;
    const el = e.target;
    if (!isEditable(el)) return;

    const before = getTextBeforeCaret(el);

    const exactMatch = findExactMatch(before);
    if (exactMatch) {
      applyTagExpansion(exactMatch, el, exactMatch.shortcut.length);
      return;
    }

    const { matches, typed } = findMatchingTags(before);
    if (matches.length > 0) {
      showSuggestionsMenu(matches, el, typed);
    } else {
      hideSuggestionsMenu();
    }
  }

  document.addEventListener("input", handleInput, true);
  document.addEventListener("keyup", (e) => {
    if (e.key !== "Escape" && e.key !== "Enter") {
      handleInput(e);
    }
  }, true);
  
  document.addEventListener("click", (e) => {
    if (previewHost && !previewHost.contains(e.target)) {
      hideSuggestionsMenu();
    }
  }, true);

  /* ==================================================================
     ATALHOS DE TECLADO (ESCAPE E SENHAS ALT + S)
  ================================================================== */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideSuggestionsMenu();
      if (pwdModalOpen) closePasswordModal();
      if (modalOpen) closeModal();
    }

    if (e.altKey && e.key.toLowerCase() === "s") {
      const el = document.activeElement || e.target;
      if (isEditable(el)) {
        e.preventDefault();
        openPasswordModal(el);
      }
    }
  }, true);

  log("Content script ativo e configurado com Lista de Sugestões e Modal de Senhas (UI Moderna).");
})();
