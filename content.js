// Temporal Anchor - Multi-Provider Support
// Adds timestamps to messages on AI chat platforms

let isEnabled = true;

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
  }
};

const currentHost = window.location.hostname;
const siteConfig = Object.entries(CONFIG).find(([domain]) => currentHost.includes(domain))?.[1];

if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['temporalAnchorEnabled'], (result) => {
    if (result.temporalAnchorEnabled !== undefined) {
      isEnabled = result.temporalAnchorEnabled;
    }
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.temporalAnchorEnabled) {
      isEnabled = changes.temporalAnchorEnabled.newValue;
      console.log(`Temporal Anchor is now: ${isEnabled ? 'ON' : 'OFF'}`);
    }
  });
}

function handleKeydown(event) {
  if (!isEnabled) return;
  if (!siteConfig) return;
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;

  // Check if this is from a chat input
  const chatInput = event.target.closest(siteConfig.inputSelector) ||
    (event.target.isContentEditable ? event.target : null);

  if (!chatInput) return;

  // Get text BEFORE blocking (this is the race we're trying to win)
  let currentText = '';
  const paragraphs = chatInput.querySelectorAll('p');
  if (paragraphs.length > 0) {
    currentText = Array.from(paragraphs).map(p => p.textContent).join('\n').trim();
  } else {
    currentText = (chatInput.textContent || chatInput.innerText || chatInput.value || '').trim();
  }

  console.log('Temporal Anchor: Enter at window level, text:', JSON.stringify(currentText.substring(0, 50)));

  if (!currentText) {
    console.log('Temporal Anchor: No text found, skipping');
    return;
  }

  // BLOCK everything - we're at window level, highest priority
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  console.log(`Temporal Anchor: Blocked Enter, adding timestamp...`);

  const timestamp = new Date().toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
  const timestampText = `⌚ [Sent: ${timestamp}]`;

  try {
    if (siteConfig.isContentEditable) {
      chatInput.focus();

      // Move cursor to end of content (preserve existing formatting)
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(chatInput);
      range.collapse(false); // false = collapse to end
      sel.removeAllRanges();
      sel.addRange(range);

      // Append timestamp using execCommand (preserves existing content/formatting)
      document.execCommand('insertText', false, '\n' + timestampText);

      // Notify framework
      chatInput.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        composed: true,
        inputType: 'insertText',
        data: timestampText
      }));

      console.log('Temporal Anchor: Timestamp appended');
    } else {
      chatInput.value += '\n' + timestampText;
      chatInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Click send
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
    console.log('Temporal Anchor: Clicking send');
    sendButton.click();
  } else {
    let attempts = 0;
    const tryClick = () => {
      sendButton = document.querySelector(siteConfig.sendButtonSelector) ||
        document.querySelector('button[aria-label*="Send"]');
      if (sendButton && !sendButton.disabled) {
        console.log('Temporal Anchor: SUCCESS');
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
  console.log(`Temporal Anchor: Initialized for ${currentHost} (window-level capture)`);

  // Listen on WINDOW (highest level) in capture phase
  // This should fire before any document/element listeners
  window.addEventListener('keydown', handleKeydown, true);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
