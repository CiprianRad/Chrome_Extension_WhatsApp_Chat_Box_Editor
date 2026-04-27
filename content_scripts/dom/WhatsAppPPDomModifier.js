/**
 * Handles modifying the DOM to hide or show WhatsApp profile pictures.
 * We rely on CSS classes injected into the body tag.
 */
class WhatsAppPPDomModifier {
  constructor() {
    this.className = 'wa-hide-profile-pictures';
  }

  /**
   * Adds the class to body that triggers CSS rules to hide pictures.
   */
  hidePictures() {
    if (!document.body.classList.contains(this.className)) {
      document.body.classList.add(this.className);
    }
  }

  /**
   * Removes the class from body to show pictures.
   */
  showPictures() {
    if (document.body.classList.contains(this.className)) {
      document.body.classList.remove(this.className);
    }
  }
}

// Make it available globally in content scripts
window.WhatsAppPPDomModifier = WhatsAppPPDomModifier;
