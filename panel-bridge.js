(() => {
  'use strict';
  if (window === window.top || new URLSearchParams(location.search).get('embedded') !== '1') return;
  document.documentElement.dataset.embedded = 'true';
  window.autoPreencherSidebarVisible = false;
  window.autoPreencherSidebarTabId = new Promise(resolve => {
    chrome.runtime.sendMessage({ action: 'sidebar-tab-id' }, response => resolve(response?.tabId));
  });
  const send = data => window.parent.postMessage(data, '*');
  const reportTheme = () => send({ type: 'auto-preencher-sidebar-theme', theme: document.documentElement.dataset.theme });
  new MutationObserver(reportTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.data?.type !== 'auto-preencher-sidebar-visibility') return;
    const wasVisible = window.autoPreencherSidebarVisible;
    window.autoPreencherSidebarVisible = event.data.visible === true;
    if (!wasVisible && window.autoPreencherSidebarVisible) {
      document.dispatchEvent(new Event('auto-preencher-sidebar-open'));
    }
    if (!window.autoPreencherSidebarVisible) document.activeElement?.blur();
  });
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sidebarClose').addEventListener('click', () => send({ type: 'auto-preencher-sidebar-close' }));
    send({ type: 'auto-preencher-sidebar-ready' });
    reportTheme();
  });
})();
