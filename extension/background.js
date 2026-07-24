// Service Worker - Qaddem AI Chrome Extension Manifest V3
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ تم تثبيت إضافة قدّم | Qaddem AI بنجاح!");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveJobPosting") {
    chrome.storage.local.get({ savedJobs: [] }, (res) => {
      const jobs = res.savedJobs;
      jobs.unshift(request.jobData);
      if (jobs.length > 100) jobs.pop();
      chrome.storage.local.set({ savedJobs: jobs }, () => {
        sendResponse({ success: true, count: jobs.length });
      });
    });
    return true;
  }
});
