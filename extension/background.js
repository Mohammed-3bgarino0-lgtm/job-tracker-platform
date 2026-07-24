// Service Worker for Qaddem AI Chrome Extension Manifest V3

chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ تم تثبيت إضافة قدّم | Qaddem AI بنجاح!");
});

// Open side panel on action click
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});
