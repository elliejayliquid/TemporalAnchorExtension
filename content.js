// Temporal Anchor - Multi-Provider Support
// Adds timestamps to messages on AI chat platforms

let isEnabled = true;
let settings = {
  sites: { chatgpt: true, deepseek: true, claude: true, gemini: true },
  emoji: '⌚',
  showDate: true,
  showTime: true,
  use24Hour: false
};

// Map hostnames to site keys
const SITE_KEYS = {
  'chatgpt.com': 'chatgpt',
  'chat.deepseek.com': 'deepseek',
  'claude.ai': 'claude',
  'gemini.google.com': 'gemini'
};

const CONFIG = {
  'chatgpt.com': {
    inputSelector: '#prompt-textarea',
    sendButtonSelector: 'button[data-testid="send-button"]',
    isContentEditable: true
  },
  'chat.deepseek.com': {
    inputSelector: 'textarea.ds-scroll-area',
    sendButtonSelector: 'div._7436101[role="button"]',
    isContentEditable: false
  },
  'claude.ai': {
    inputSelector: '[data-testid="chat-input"]',
    sendButtonSelector: 'button[aria-label="Send message"]',
    isContentEditable: true
  },
  'gemini.google.com': {
    inputSelector: '.ql-editor[contenteditable="true"]',
    sendButtonSelector: 'button[aria-label="Send message"]',
    isContentEditable: true
  }
};

const currentHost = window.location.hostname;
const siteConfig = Object.entries(CONFIG).find(([domain]) => currentHost.includes(domain))?.[1];
const siteKey = Object.entries(SITE_KEYS).find(([domain]) => currentHost.includes(domain))?.[1];

// Load settings
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['temporalAnchorEnabled', 'sites', 'emoji', 'showDate', 'showTime', 'use24Hour'], (result) => {
    if (result.temporalAnchorEnabled !== undefined) {
      isEnabled = result.temporalAnchorEnabled;
    }
    if (result.sites) settings.sites = result.sites;
    if (result.emoji) settings.emoji = result.emoji;
    if (result.showDate !== undefined) settings.showDate = result.showDate;
    if (result.showTime !== undefined) settings.showTime = result.showTime;
    if (result.use24Hour !== undefined) settings.use24Hour = result.use24Hour;

    console.log(`Temporal Anchor: Loaded - Global: ${isEnabled ? 'ON' : 'OFF'}, Site (${siteKey}): ${settings.sites[siteKey] ? 'ON' : 'OFF'}`);
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== 'local') return;

    if (changes.temporalAnchorEnabled) {
      isEnabled = changes.temporalAnchorEnabled.newValue;
      console.log(`Temporal Anchor: Global changed to ${isEnabled ? 'ON' : 'OFF'}`);
    }
    if (changes.sites) {
      settings.sites = changes.sites.newValue;
      console.log(`Temporal Anchor: Site settings updated`);
    }
    if (changes.emoji) settings.emoji = changes.emoji.newValue;
    if (changes.showDate !== undefined) settings.showDate = changes.showDate.newValue;
    if (changes.showTime !== undefined) settings.showTime = changes.showTime.newValue;
    if (changes.use24Hour !== undefined) settings.use24Hour = changes.use24Hour.newValue;
  });
}

function formatTimestamp() {
  const now = new Date();
  const options = {};

  if (settings.showDate) options.dateStyle = 'short';
  if (settings.showTime) options.timeStyle = 'medium';
  if (settings.use24Hour) options.hour12 = false;

  // Need at least one format
  if (!settings.showDate && !settings.showTime) {
    options.timeStyle = 'medium';
  }

  const formatted = now.toLocaleString(undefined, options);
  return `${settings.emoji} [Sent: ${formatted}]`;
}

function handleKeydown(event) {
  // Check global toggle
  if (!isEnabled) return;

  // Check per-site toggle
  if (siteKey && !settings.sites[siteKey]) return;

  if (!siteConfig) return;
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;

  // Check if this is from a chat input
  const chatInput = event.target.closest(siteConfig.inputSelector) ||
    (event.target.isContentEditable ? event.target : null);

  if (!chatInput) return;

  // Get text BEFORE blocking
  let currentText = '';
  const paragraphs = chatInput.querySelectorAll('p');
  if (paragraphs.length > 0) {
    currentText = Array.from(paragraphs).map(p => p.textContent).join('\n').trim();
  } else {
    currentText = (chatInput.textContent || chatInput.innerText || chatInput.value || '').trim();
  }

  if (!currentText) return;

  // BLOCK everything
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  const timestampText = formatTimestamp();
  console.log(`Temporal Anchor: Adding "${timestampText}"`);

  try {
    if (siteConfig.isContentEditable) {
      chatInput.focus();

      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(chatInput);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);

      document.execCommand('insertText', false, '\n' + timestampText);

      chatInput.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        composed: true,
        inputType: 'insertText',
        data: timestampText
      }));
    } else {
      chatInput.value += '\n' + timestampText;
      chatInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    setTimeout(() => clickSendButton(), 100);

  } catch (err) {
    console.error('Temporal Anchor: Error:', err);
  }
}

function clickSendButton() {
  let sendButton = document.querySelector(siteConfig.sendButtonSelector);
  if (!sendButton && currentHost.includes('claude.ai')) {
    sendButton = document.querySelector('button[aria-label*="Send"]');
  }

  if (sendButton && !sendButton.disabled) {
    sendButton.click();
  } else {
    let attempts = 0;
    const tryClick = () => {
      sendButton = document.querySelector(siteConfig.sendButtonSelector) ||
        document.querySelector('button[aria-label*="Send"]');
      if (sendButton && !sendButton.disabled) {
        sendButton.click();
      } else if (attempts < 20) {
        attempts++;
        setTimeout(tryClick, 100);
      }
    };
    setTimeout(tryClick, 50);
  }
}

function init() {
  if (!siteConfig) return;
  console.log(`Temporal Anchor: Initialized for ${currentHost}`);
  window.addEventListener('keydown', handleKeydown, true);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
