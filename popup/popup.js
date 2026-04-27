document.addEventListener('DOMContentLoaded', async () => {
  const toggleInput = document.getElementById('pp-toggle');
  
  // Load initial state from storage
  const isHidden = await window.StorageManager.get('hideProfilePictures', false);
  toggleInput.checked = isHidden;

  // Listen for changes from the user
  toggleInput.addEventListener('change', async (e) => {
    await window.StorageManager.set('hideProfilePictures', e.target.checked);
  });
});
