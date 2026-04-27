/**
 * Main entry point for the content script.
 * Initializes the modifier and listens to settings changes.
 */
class ExtensionMain {
  constructor() {
    this.modifier = new window.WhatsAppPPDomModifier();
    this.init();
  }

  async init() {
    // Get initial state
    const isHidden = await window.StorageManager.get('hideProfilePictures', false);
    this.updateState(isHidden);

    // Listen for toggle changes from the popup
    window.StorageManager.onToggleChange((newValue) => {
      this.updateState(newValue);
    });
  }

  updateState(isHidden) {
    if (isHidden) {
      this.modifier.hidePictures();
    } else {
      this.modifier.showPictures();
    }
  }
}

// Initialize the content script execution
new ExtensionMain();
