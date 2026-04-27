document.addEventListener('DOMContentLoaded', async () => {
  const toggleInput = document.getElementById('pp-toggle');
  const radioInputs = document.querySelectorAll('input[name="effectMode"]');
  const modeContainer = document.getElementById('mode-settings');
  
  // Load initial states from storage
  const isActive = await window.StorageManager.get('isActive', false);
  const effectMode = await window.StorageManager.get('effectMode', 'replace');
  
  // Apply state to UI
  toggleInput.checked = isActive;
  radioInputs.forEach(radio => {
    if (radio.value === effectMode) radio.checked = true;
  });
  updateModeContainerState(isActive);

  // Listen for toggle changes
  toggleInput.addEventListener('change', async (e) => {
    const active = e.target.checked;
    await window.StorageManager.set('isActive', active);
    updateModeContainerState(active);
  });

  // Listen for radio button changes
  radioInputs.forEach(radio => {
    radio.addEventListener('change', async (e) => {
      if (e.target.checked) {
        await window.StorageManager.set('effectMode', e.target.value);
      }
    });
  });

  function updateModeContainerState(active) {
    if (active) {
      modeContainer.classList.remove('disabled');
    } else {
      modeContainer.classList.add('disabled');
    }
  }
});
