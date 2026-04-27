// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("WhatsApp Profile Picture Toggler installed.");
  
  // Initialize default states for the new schema
  chrome.storage.sync.get({ isActive: false, effectMode: 'replace' }, (result) => {
    chrome.storage.sync.set(result);
  });
});
