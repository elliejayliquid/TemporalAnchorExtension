// Default settings
const DEFAULTS = {
  temporalAnchorEnabled: true,
  sites: {
    chatgpt: true,
    deepseek: true,
    claude: true,
    gemini: true
  },
  emoji: '⌚',
  showDate: true,
  showTime: true,
  use24Hour: false
};

// Update preview when settings change
function updatePreview() {
  const emoji = document.getElementById('emoji').value || '⌚';
  const showDate = document.getElementById('showDate').checked;
  const showTime = document.getElementById('showTime').checked;
  const use24Hour = document.getElementById('use24Hour').checked;

  const now = new Date();
  const options = {};

  if (showDate) options.dateStyle = 'short';
  if (showTime) options.timeStyle = 'medium';
  if (use24Hour) options.hour12 = false;

  let formatted = '';
  if (showDate || showTime) {
    formatted = now.toLocaleString(undefined, options);
  } else {
    formatted = 'No format selected';
  }

  document.getElementById('preview').textContent = `${emoji} [Sent: ${formatted}]`;
}

// Save settings
document.getElementById('save').onclick = () => {
  const saveBtn = document.getElementById('save');

  const settings = {
    temporalAnchorEnabled: document.getElementById('globalEnabled').checked,
    sites: {
      chatgpt: document.getElementById('site_chatgpt').checked,
      deepseek: document.getElementById('site_deepseek').checked,
      claude: document.getElementById('site_claude').checked,
      gemini: document.getElementById('site_gemini').checked
    },
    emoji: document.getElementById('emoji').value || '⌚',
    showDate: document.getElementById('showDate').checked,
    showTime: document.getElementById('showTime').checked,
    use24Hour: document.getElementById('use24Hour').checked
  };

  chrome.storage.local.set(settings, () => {
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "SAVED!";
    saveBtn.style.boxShadow = "0 0 15px #00d4ff";

    setTimeout(() => {
      saveBtn.innerText = originalText;
      saveBtn.style.boxShadow = "";
    }, 1000);
  });
};

// Load current settings when page opens
chrome.storage.local.get(Object.keys(DEFAULTS), (data) => {
  const settings = { ...DEFAULTS, ...data };

  document.getElementById('globalEnabled').checked = settings.temporalAnchorEnabled;
  document.getElementById('site_chatgpt').checked = settings.sites?.chatgpt ?? true;
  document.getElementById('site_deepseek').checked = settings.sites?.deepseek ?? true;
  document.getElementById('site_claude').checked = settings.sites?.claude ?? true;
  document.getElementById('site_gemini').checked = settings.sites?.gemini ?? true;
  document.getElementById('emoji').value = settings.emoji || '⌚';
  document.getElementById('showDate').checked = settings.showDate ?? true;
  document.getElementById('showTime').checked = settings.showTime ?? true;
  document.getElementById('use24Hour').checked = settings.use24Hour ?? false;

  updatePreview();
});

// Live preview updates
document.getElementById('emoji').addEventListener('input', updatePreview);
document.getElementById('showDate').addEventListener('change', updatePreview);
document.getElementById('showTime').addEventListener('change', updatePreview);
document.getElementById('use24Hour').addEventListener('change', updatePreview);
