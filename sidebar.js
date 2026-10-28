(() => {
  'use strict';
  // Text Expander still runs in every frame; the drawer belongs only to the page.
  if (window !== window.top || document.getElementById('auto-preencher-sidebar')) return;

  const host = document.createElement('div');
  host.id = 'auto-preencher-sidebar';
  host.style.cssText = 'all:initial!important;position:fixed!important;inset:0 0 0 auto!important;width:min(480px,100vw)!important;z-index:2147483646!important;pointer-events:none!important;display:block!important;';
  host.dataset.theme = 'light';
  const root = host.attachShadow({ mode: 'closed' });
  root.innerHTML = `
    <style>:host{
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
:host{color:var(--text)}button{font-size:13px}
.launcher{position:absolute;right:0;top:50%;width:36px;height:44px;transform:translateY(-50%);pointer-events:auto;display:grid;place-items:center;background:var(--primary);color:var(--on-primary);border:1px solid var(--primary);border-radius:7px 0 0 7px;padding:0}.launcher svg{width:22px;height:22px}
.drawer{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;pointer-events:none;background:var(--bg);color:var(--text);border-left:1px solid var(--border);transform:translateX(100%);visibility:hidden}.drawer.open{transform:translateX(0);visibility:visible;pointer-events:auto}
.toolbar{display:flex;align-items:center;gap:8px;min-height:48px;padding:6px 10px;border-bottom:1px solid var(--border);background:var(--surface)}.toolbar[hidden]{display:none}.brand-symbol{display:grid;place-items:center;width:28px;height:28px;border-radius:6px;background:var(--primary);color:var(--on-primary);flex-shrink:0}.brand-symbol svg{width:20px;height:20px}.title{flex:1;font-size:15px;font-weight:650}.title small{display:none}.toolbar .close{width:36px;height:36px;padding:0;font-size:26px}
.body{position:relative;flex:1;min-height:0}iframe{display:block;width:100%;height:100%;border:0;background:var(--bg)}.loading{position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center;background:var(--bg);font-size:14px;color:var(--text-muted)}.loading[hidden]{display:none}
@media(min-width:600px){.launcher[aria-expanded=true]{right:100%}}@media(max-width:599px){.launcher[aria-expanded=true]{visibility:hidden}}</style>
    <button class="launcher" aria-label="Abrir Auto Preencher" aria-expanded="false" aria-controls="drawer" title="Auto Preencher — clique para abrir">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h6M5 12h11M5 19h6m10-7-5-5m5 5-5 5"/></svg>
    </button>
    <section class="drawer" id="drawer" role="region" aria-label="Ferramentas Auto Preencher" aria-hidden="true" inert>
      <div class="toolbar"><span class="brand-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h6M5 12h11M5 19h6m10-7-5-5m5 5-5 5"/></svg></span><div class="title">Auto Preencher<small>Menos etapas. Mais foco.</small></div><button class="close" aria-label="Fechar barra lateral" title="Fechar barra lateral">×</button></div>
      <div class="body"><div class="loading" role="status">Carregando ferramentas…</div></div>
    </section>`;
  document.documentElement.appendChild(host);
  function applyDrawerTheme(theme) {
    if (theme === 'dark' || theme === 'light') host.dataset.theme = theme;
  }
  // Match the saved theme while the embedded panel is still loading.
  try {
    chrome.storage.local.get(['scriptPanelState'], result => applyDrawerTheme(result.scriptPanelState?.theme || 'light'));
  } catch {}

  const launcher = root.querySelector('.launcher');
  const drawer = root.querySelector('.drawer');
  const loading = root.querySelector('.loading');
  let frame, ready = false, opened = false;
  let loadingTimer;
  const frameUrl = chrome.runtime.getURL('panel.html');
  const parsed = new URL(frameUrl);
  const frameOrigin = `${parsed.protocol}//${parsed.host}`;

  function sendVisibility() {
    if (ready) frame.contentWindow.postMessage({ type: 'auto-preencher-sidebar-visibility', visible: opened }, frameOrigin);
  }
  function mountPanel() {
    if (frame) return;
    frame = document.createElement('iframe');
    frame.title = 'Painel Auto Preencher';
    frame.allow = 'clipboard-write';
    frame.src = `${frameUrl}?embedded=1`;
    root.querySelector('.body').appendChild(frame);
    loadingTimer = setTimeout(() => {
      if (!ready) loading.textContent = 'Não foi possível carregar. Recarregue a extensão e atualize esta página.';
    }, 10000);
  }
  function open() {
    opened = true;
    drawer.inert = false;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    launcher.setAttribute('aria-expanded', 'true');
    mountPanel();
    sendVisibility();
  }
  function close() {
    opened = false;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;
    launcher.setAttribute('aria-expanded', 'false');
    sendVisibility();
    launcher.focus({ preventScroll: true });
  }
  launcher.addEventListener('click', () => { open(); });
  root.querySelector('.close').addEventListener('click', () => close());
  window.addEventListener('message', event => {
    if (!frame || event.source !== frame.contentWindow || event.origin !== frameOrigin) return;
    if (event.data?.type === 'auto-preencher-sidebar-ready') {
      ready = true;
      clearTimeout(loadingTimer);
      loading.hidden = true;
      root.querySelector('.toolbar').hidden = true;
      sendVisibility();
    } else if (event.data?.type === 'auto-preencher-sidebar-theme') {
      applyDrawerTheme(event.data.theme);
    } else if (event.data?.type === 'auto-preencher-sidebar-close') close();
  });
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message?.action !== 'show-sidebar') return;
    open();
    respond({ done: true });
  });
})();
