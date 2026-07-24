// Content Script Bridge for Chrome Extension v1.4

import { initExtensionBridge } from '../bridge/extension-bridge';

// Initialize bridge listener on active webpage
initExtensionBridge();

// Listen for messages from extension background worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SCRAPE_PAGE') {
    const rawText = document.body.innerText || '';
    const emails = Array.from(new Set(rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []));
    const phones = Array.from(new Set(rawText.match(/(?:05|\+9665)[0-9]{8}/g) || []));

    sendResponse({
      success: true,
      url: window.location.href,
      title: document.title,
      emails,
      phones,
      cardCount: document.querySelectorAll('article, .job-card, .job-listing').length
    });
  }
  return true;
});
