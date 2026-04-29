# WhatsApp Profile Picture Toggler

A fast, lightweight Chrome Extension (Manifest V3) that gives you control over profile pictures on WhatsApp Web. Whether you're sharing your screen, working in a public space, or just prefer a cleaner interface, this extension lets you seamlessly hide or replace user and group avatars.

## Features

* **Instant Toggling:** Turn profile picture modifications on or off with a single click from the extension popup.
* **Two Visual Modes:**
  * **Hide Completely:** Makes profile pictures transparent, leaving an empty space.
  * **Default WhatsApp Icon (Replace):** Replaces user and group images with dynamically generated SVG placeholders that mimic WhatsApp's native default avatars.
* **Deterministic Avatar Colors:** When in "Replace" mode, the extension calculates a hash based on the contact/group name, ensuring they get a consistent background color from WhatsApp's official light/dark color palette.
* **Smart Chat Detection:** Accurately distinguishes between individual chats and group chats. It injects a script into the `MAIN` world to rapidly read WhatsApp's internal React Fiber tree, guaranteeing high performance (<1ms) without relying solely on fragile DOM scraping.
* **Native Shape Support:** Properly respects WhatsApp's specific UI choices, including circular avatars for users and rounded "squircles" for Communities.

## Installation

Because this is a custom extension, you can install it manually in developer mode:

1. Download or clone the repository containing the extension files.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** by toggling the switch in the top right corner.
4. Click the **"Load unpacked"** button in the top left.
5. Select the folder containing the `manifest.json` file.
6. The extension is now installed! You can pin it to your toolbar for easy access.

## How it Works

WhatsApp Web relies heavily on a virtualized React DOM, which can make reliable styling difficult. This extension solves that using a multi-tiered architecture:

* **React Inspector (`react-inspector.js`):** Runs in the page's main context. It walks the `__reactFiber$` tree of visible chat rows to accurately determine if a chat is an individual or a group (checking `.isGroup` or `g.us`/`c.us` JIDs), safely bypassing complex DOM guessing.
* **DOM Modifier (`WhatsAppPPDomModifier.js`):** Listens for structural mutations and custom `wa-pp-update` events. It generates pixel-perfect SVG data URIs dynamically to avoid external asset requests.
* **Storage Manager (`storage.js`):** Syncs your preferences across tabs in real-time.
* **CSS Overrides (`content.css`):** Targets the specific parent containers and applies the injected SVG variables or opacity adjustments using `!important` to override WhatsApp's native styling.

## File Structure

```text
├── manifest.json                           # Extension configuration (Manifest V3)
├── background/
│   └── background.js                       # Service worker for default state initialization
├── content_scripts/
│   ├── main.js                             # Entry point linking storage state to DOM logic
│   ├── styles/
│   │   └── content.css                     # CSS selectors for applying hide/replace rules
│   └── dom/
│       ├── WhatsAppPPDomModifier.js        # Core logic: SVG generation, color hashing, DOM observation
│       └── react-inspector.js              # MAIN world script to read React state
├── popup/
│   ├── popup.html                          # Extension menu UI
│   ├── popup.css                           # Styling for the toggle and radio inputs
│   └── popup.js                            # Logic for updating Chrome storage based on user input
└── utils/
    └── storage.js                          # Reusable Chrome storage wrapper
