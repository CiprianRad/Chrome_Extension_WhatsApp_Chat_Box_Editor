/**
 * Utility class for interacting with Chrome storage.
 * It is available globally for content scripts and the popup.
 */
class StorageManager {
  /**
   * Get a value from storage.
   */
  static async get(key, defaultValue = null) {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ [key]: defaultValue }, (result) => {
        resolve(result[key]);
      });
    });
  }

  /**
   * Set a value in storage.
   */
  static async set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    });
  }
}

// Make it available globally
window.StorageManager = StorageManager;
