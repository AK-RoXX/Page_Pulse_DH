// Chrome Extension Popup Script for Page Pulse

const API_ENDPOINT = 'http://localhost:3000/api/audit'; // Or deployed URL: https://url-analysis.vercel.app/api/audit

document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const btnAudit = document.getElementById('btnAudit');
  const btnActiveTab = document.getElementById('btnActiveTab');

  const loadingState = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');
  const resultsState = document.getElementById('resultsState');

  const errorTitle = document.getElementById('errorTitle');
  const errorDesc = document.getElementById('errorDesc');

  const valStatus = document.getElementById('valStatus');
  const valTime = document.getElementById('valTime');
  const valH1 = document.getElementById('valH1');
  const valAlt = document.getElementById('valAlt');
  const valTitle = document.getElementById('valTitle');
  const valWords = document.getElementById('valWords');
  const valMeta = document.getElementById('valMeta');

  // Auto-fill active tab URL when popup opens
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && /^https?:\/\//i.test(tabs[0].url)) {
        urlInput.value = tabs[0].url;
      }
    });
  }

  // Audit Active Tab click
  btnActiveTab.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url) {
          urlInput.value = tabs[0].url;
          runAudit(tabs[0].url);
        } else {
          showError('Active tab has an invalid or non-HTTP URL.');
        }
      });
    } else {
      if (urlInput.value.trim()) {
        runAudit(urlInput.value.trim());
      }
    }
  });

  // Audit Form Submit click
  btnAudit.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!url) return;
    runAudit(url);
  });

  async function runAudit(targetUrl) {
    showLoading();

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Failed to analyze target URL.', response.status);
      } else {
        showResults(data);
      }
    } catch {
      showError('Could not connect to Page Pulse backend server.');
    }
  }

  function showLoading() {
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    resultsState.classList.add('hidden');
  }

  function showError(msg, statusCode) {
    loadingState.classList.add('hidden');
    resultsState.classList.add('hidden');
    errorState.classList.remove('hidden');

    errorTitle.textContent = statusCode ? `HTTP ${statusCode} Error` : 'Audit Error';
    errorDesc.textContent = msg;
  }

  function showResults(metrics) {
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    resultsState.classList.remove('hidden');

    valStatus.textContent = metrics.statusCode;
    valStatus.className = `metric-val ${metrics.statusCode < 400 ? 'val-emerald' : 'val-amber'}`;

    valTime.textContent = `${metrics.responseTimeMs} ms`;
    valH1.textContent = metrics.h1Count;
    valAlt.textContent = metrics.imagesMissingAltCount;
    valAlt.className = `metric-val ${metrics.imagesMissingAltCount === 0 ? 'val-emerald' : 'val-amber'}`;

    valTitle.textContent = metrics.title || 'No <title> detected';
    valWords.textContent = `${metrics.wordCount.toLocaleString()} words`;
    valMeta.textContent = metrics.metaDescription || 'No <meta name="description"> tag found';
  }
});
