/**
 * Main entry point for the content script.
 * Initializes the modifier and listens to setting changes from popup.
 */
class ExtensionMain {
  constructor() {
    this.modifier = new window.WhatsAppPPDomModifier();
    this.init();
  }

  async init() {
    // Get initial state
    const isActive = await window.StorageManager.get('isActive', false);
    const effectMode = await window.StorageManager.get('effectMode', 'replace');
    
    this.updateState(isActive, effectMode);

    // Listen for storage changes directly
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync') {
        // Fetch fresh state to ensure consistency
        chrome.storage.sync.get(['isActive', 'effectMode'], (result) => {
          this.updateState(result.isActive, result.effectMode);
        });
      }
    });
  }

  updateState(isActive, effectMode) {
    this.modifier.applyMode(isActive ? effectMode : 'off');
  }
}

// Initialize the content script
new ExtensionMain();
