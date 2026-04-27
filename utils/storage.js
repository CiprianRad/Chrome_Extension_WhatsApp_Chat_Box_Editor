/**
 * Utility class for interacting with Chrome storage.
 * It is available globally for content scripts and the popup.
 */
class StorageManager {
  /**
   * Get a value from storage.
   * @param {string} key 
   * @param {any} defaultValue 
   * @returns {Promise<any>}
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
   * @param {string} key 
   * @param {any} value 
   * @returns {Promise<void>}
   */
  static async set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    });
  }
  
  /**
   * Listen for changes to the hideProfilePictures toggle.
   * @param {Function} callback 
   */
  static onToggleChange(callback) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.hideProfilePictures) {
        callback(changes.hideProfilePictures.newValue);
      }
    });
  }
}

// Make it available globally in content scripts and anywhere this file is loaded.
window.StorageManager = StorageManager;
