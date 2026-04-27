(function() {
  setInterval(() => {
    // Process chat rows. We don't use .wa-react-checked anymore because WhatsApp 
    // recycles DOM nodes in its virtualized list, meaning the JID changes but the DOM node remains.
    // Pure object traversal is so fast (<1ms) that we can afford to re-check the visible rows.
    const rows = document.querySelectorAll('div[data-testid="cell-frame-container"]');
    rows.forEach(row => {
      try {
        const reactKey = Object.keys(row).find(key => key.startsWith('__reactFiber$'));
        if (reactKey) {
          let current = row[reactKey];
          let isGroup = null;
          let depth = 0;
          
          while (current && depth < 40) {
            const props = current.memoizedProps;
            if (props) {
              // Direct O(1) lookups bypass the massive performance cost of JSON.stringify
              const chat = props.chat || props.data || props.model || props.item;
              if (chat) {
                // Check boolean flag first if available
                if (typeof chat.isGroup === 'boolean') {
                  isGroup = chat.isGroup;
                  break;
                }
                // Check JID structure
                if (chat.id) {
                  const idStr = chat.id._serialized || chat.id.server || chat.id.user || "";
                  if (typeof idStr === 'string') {
                    if (idStr.includes('g.us')) {
                      isGroup = true;
                      break;
                    } else if (idStr.includes('c.us') || idStr.includes('s.whatsapp.net')) {
                      isGroup = false;
                      break;
                    }
                  }
                }
              }
            }
            current = current.return;
            depth++;
          }
          
          if (isGroup !== null) {
            const currentAttr = row.getAttribute('data-is-group');
            const newAttr = isGroup ? 'true' : 'false';
            if (currentAttr !== newAttr) {
              row.setAttribute('data-is-group', newAttr);
              window.dispatchEvent(new CustomEvent('wa-pp-update'));
            }
          }
        }
      } catch(e) {}
    });

    // Process the open chat header
    const header = document.querySelector('header');
    if (header) {
      try {
        const reactKey = Object.keys(header).find(key => key.startsWith('__reactFiber$'));
        if (reactKey) {
          let current = header[reactKey];
          let isGroup = null;
          let depth = 0;
          
          while (current && depth < 40) {
            const props = current.memoizedProps;
            if (props) {
              const chat = props.chat || props.data || props.model || props.item;
              if (chat) {
                if (typeof chat.isGroup === 'boolean') {
                  isGroup = chat.isGroup;
                  break;
                }
                if (chat.id) {
                  const idStr = chat.id._serialized || chat.id.server || chat.id.user || "";
                  if (typeof idStr === 'string') {
                    if (idStr.includes('g.us')) {
                      isGroup = true;
                      break;
                    } else if (idStr.includes('c.us') || idStr.includes('s.whatsapp.net')) {
                      isGroup = false;
                      break;
                    }
                  }
                }
              }
            }
            current = current.return;
            depth++;
          }
          if (isGroup !== null) {
            const currentAttr = header.getAttribute('data-is-group');
            const newAttr = isGroup ? 'true' : 'false';
            if (currentAttr !== newAttr) {
              header.setAttribute('data-is-group', newAttr);
              window.dispatchEvent(new CustomEvent('wa-pp-update'));
            }
          }
        }
      } catch(e) {}
    }
  }, 500); // Polling every 500ms is now safe due to O(1) lookups
})();
