/**
 * Handles modifying the DOM classes to trigger CSS rules and dynamically generating
 * the pixel-perfect SVGs with accurate WhatsApp Dark/Light color pairs.
 */
class WhatsAppPPDomModifier {
  constructor() {
    this.classes = ['wa-pp-mode-hide', 'wa-pp-mode-replace'];
    this.colorPairs = [
      { bg: '#0A3332', fg: '#3CC4B0' }, // Teal
      { bg: '#1B4A36', fg: '#63E07D' }, // Green
      { bg: '#0F3A5A', fg: '#4B9EEA' }, // Blue
      { bg: '#541715', fg: '#E56D65' }, // Orange/Red
      { bg: '#331B4D', fg: '#9F68E0' }, // Purple
      { bg: '#4A152B', fg: '#D8638B' }, // Burgundy/Pink
      { bg: '#4D3611', fg: '#D9A143' }, // Gold/Brown
      { bg: '#2D353A', fg: '#8C9DA8' }  // Grey
    ];
    this.observer = null;
    this.handleMutations = this.handleMutations.bind(this);

    // Listen for lightning-fast memory updates from the isolated React inspector
    window.addEventListener('wa-pp-update', () => {
      if (this.isActive || document.body.classList.contains('wa-pp-mode-replace') || document.body.classList.contains('wa-pp-mode-hide')) {
        this.classifyAll();
      }
    });
  }

  applyMode(mode) {
    this.classes.forEach(c => document.body.classList.remove(c));
    if (mode === 'hide') {
      document.body.classList.add('wa-pp-mode-hide');
      this.startObserver();
    } else if (mode === 'replace') {
      document.body.classList.add('wa-pp-mode-replace');
      this.startObserver();
    } else {
      this.stopObserver();
      // Clean up injected variables when disabled
      document.querySelectorAll('.wa-classified').forEach(el => {
        el.classList.remove('wa-classified', 'wa-is-group', 'wa-is-single', 'wa-react-checked');
        el.removeAttribute('data-is-group');
        el.style.removeProperty('--wa-avatar-url');
      });
    }
  }

  startObserver() {
    if (!this.observer) {
      this.observer = new MutationObserver(this.handleMutations);
      this.observer.observe(document.body, { childList: true, subtree: true });
    }
    this.classifyAll();
  }

  stopObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  handleMutations(mutations) {
    let shouldClassify = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldClassify = true;
        break;
      }
    }
    if (shouldClassify) {
      this.classifyAll();
    }
  }

  classifyAll() {
    this.classifyRows();
    this.classifyHeader();
  }

  // Generates a stable integer from the contact's name to ensure their color is always the same
  getStringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }

  getSingleSvg(bg, fg) {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="${bg}"/>
      <g fill="${fg}">
        <circle cx="12" cy="8.5" r="2.8"/>
        <path d="M 7 16.5 A 1.5 1.5 0 0 0 8.5 18 H 15.5 A 1.5 1.5 0 0 0 17 16.5 C 17 13.5 14.5 12.5 12 12.5 C 9.5 12.5 7 13.5 7 16.5 Z"/>
      </g>
    </svg>`;
    return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg.trim().replace(/\n/g, ''))}')`;
  }

  getGroupSvg(bg, fg) {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="${bg}"/>
      <defs>
        <mask id="cutout">
          <rect width="24" height="24" fill="white"/>
          <circle cx="9.5" cy="9.5" r="2.8" fill="black" stroke="black" stroke-width="1.5"/>
          <path d="M 4.5 16.5 A 1.5 1.5 0 0 0 6 18 H 13 A 1.5 1.5 0 0 0 14.5 16.5 C 14.5 13.5 12 12.5 9.5 12.5 C 7 12.5 4.5 13.5 4.5 16.5 Z" fill="black" stroke="black" stroke-width="1.5"/>
        </mask>
      </defs>
      <g fill="${fg}">
        <g mask="url(#cutout)">
          <circle cx="15.5" cy="7.5" r="2.3"/>
          <path d="M 11.5 16.5 A 1.5 1.5 0 0 0 13 18 H 18 A 1.5 1.5 0 0 0 19.5 16.5 C 19.5 13.5 17.5 12.5 15.5 12.5 C 13.5 12.5 11.5 13.5 11.5 16.5 Z"/>
        </g>
        <circle cx="9.5" cy="9.5" r="2.8"/>
        <path d="M 4.5 16.5 A 1.5 1.5 0 0 0 6 18 H 13 A 1.5 1.5 0 0 0 14.5 16.5 C 14.5 13.5 12 12.5 9.5 12.5 C 7 12.5 4.5 13.5 4.5 16.5 Z"/>
      </g>
    </svg>`;
    return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg.trim().replace(/\n/g, ''))}')`;
  }

  isGroupChat(row) {
    // 1. Check native DOM hints if present (used when there's no custom PFP)
    if (row.querySelector('[data-testid*="default-group"]')) return true;
    if (row.querySelector('[data-icon*="default-group"]')) return true;

    if (row.querySelector('[data-testid*="default-user"]')) return false;
    if (row.querySelector('[data-icon*="default-user"]')) return false;

    // 2. Read the guaranteed 100% accurate React internal state set by our injected script
    const reactIsGroup = row.getAttribute('data-is-group');
    if (reactIsGroup === 'true') return true;
    if (reactIsGroup === 'false') return false;

    // 3. Very powerful DOM structural fallback for edge cases like deep archived chats
    const textContainer = row.children[1] || row;

    const spans = textContainer.querySelectorAll('span');
    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];
      // A. aria-label check: WhatsApp often uses aria-label="Sender Name: " for the sender span in groups
      const ariaLabel = span.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.trim().endsWith(':')) return true;

      // B. structural text check: If a span's text ends with a colon AND it has a sibling (the actual message)
      const text = span.innerText || span.textContent || "";
      if (text.trim().endsWith(':') && text.trim().length > 1 && text.trim().length < 30) {
        if (span.nextElementSibling || span.nextSibling) return true;
      }
    }

    const titleElement = textContainer.querySelector('span[title]');
    if (titleElement) {
      const title = titleElement.getAttribute('title') || "";
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('group') || lowerTitle.includes('grupa')) return true;
      if (title.includes(',') && title.split(',').length > 1 && !lowerTitle.includes('typing')) return true;
    }

    if (row.tagName.toLowerCase() === 'header') {
      const titleDivs = row.querySelectorAll('div[title], span[title]');
      for (const div of titleDivs) {
        const subtitle = div.getAttribute('title') || div.innerText;
        if (subtitle && subtitle.includes(',') && !subtitle.toLowerCase().includes('typing') && subtitle !== (titleElement?.getAttribute('title'))) {
          return true;
        }
        if (subtitle && subtitle.toLowerCase().includes('group info')) return true;
      }
    }

    return false;
  }

  classifyRows() {
    // Process all rows dynamically, even if previously classified, in case React re-used the node
    const rows = document.querySelectorAll('div[data-testid="cell-frame-container"]');
    rows.forEach(row => {
      const isGroup = this.isGroupChat(row);
      const isClassified = row.classList.contains('wa-classified');
      const wasGroup = row.classList.contains('wa-is-group');
      const wasSingle = row.classList.contains('wa-is-single');

      // Re-apply SVG and classes ONLY if the true status conflicts with its assigned visual class
      if (!isClassified || (isGroup && !wasGroup) || (!isGroup && !wasSingle)) {
        row.classList.add('wa-classified');
        row.classList.remove('wa-is-group', 'wa-is-single');

        if (isGroup) {
          row.classList.add('wa-is-group');
        } else {
          row.classList.add('wa-is-single');
        }

        const textContainer = row.children[1] || row;
        const titleElement = textContainer.querySelector('span[title]') || textContainer;
        const title = titleElement.title || titleElement.innerText || "default";

        const colorIndex = this.getStringHash(title) % this.colorPairs.length;
        const colors = this.colorPairs[colorIndex];

        const svgUrl = isGroup ? this.getGroupSvg(colors.bg, colors.fg) : this.getSingleSvg(colors.bg, colors.fg);
        row.style.setProperty('--wa-avatar-url', svgUrl);
      }
    });
  }

  classifyHeader() {
    const header = document.querySelector('header');
    if (header) {
      const isGroup = this.isGroupChat(header);
      const isClassified = header.classList.contains('wa-classified');
      const wasGroup = header.classList.contains('wa-is-group');
      const wasSingle = header.classList.contains('wa-is-single');

      if (!isClassified || (isGroup && !wasGroup) || (!isGroup && !wasSingle)) {
        header.classList.add('wa-classified');
        header.classList.remove('wa-is-group', 'wa-is-single');

        if (isGroup) {
          header.classList.add('wa-is-group');
        } else {
          header.classList.add('wa-is-single');
        }

        const textContainer = header.children[1] || header;
        const titleElement = textContainer.querySelector('span[title]') || textContainer.querySelector('span[dir="auto"]') || textContainer;
        const title = titleElement.innerText || "default";

        const colorIndex = this.getStringHash(title) % this.colorPairs.length;
        const colors = this.colorPairs[colorIndex];

        const svgUrl = isGroup ? this.getGroupSvg(colors.bg, colors.fg) : this.getSingleSvg(colors.bg, colors.fg);
        header.style.setProperty('--wa-avatar-url', svgUrl);
      }
    }
  }
}

window.WhatsAppPPDomModifier = WhatsAppPPDomModifier;
