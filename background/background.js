// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("WhatsApp Profile Picture Toggler extension installed.");
  
  // Initialize default state
  chrome.storage.sync.get({ hideProfilePictures: false }, (result) => {
    chrome.storage.sync.set({ hideProfilePictures: result.hideProfilePictures });
  });
});
