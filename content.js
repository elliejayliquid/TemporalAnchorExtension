// Temporal Anchor - Optimized for Large Text & Formatting Preservation

// Global state variable
let isEnabled = true;

// 1. Sync state immediately on load
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['temporalAnchorEnabled'], (result) => {
    if (result.temporalAnchorEnabled !== undefined) {
      isEnabled = result.temporalAnchorEnabled;
    }
  });

  // 2. Listen for changes (real-time toggle support)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.temporalAnchorEnabled) {
      isEnabled = changes.temporalAnchorEnabled.newValue;
      console.log(`Temporal Anchor is now: ${isEnabled ? 'ON' : 'OFF'}`);
    }
  });
}

function attachListener(chatInput) {
  console.log('Temporal Anchor: Listener attached (Append Mode)');

  const isEditable = chatInput.isContentEditable === true;
  const isTextarea = chatInput.tagName === 'TEXTAREA';

  if (!isTextarea && !isEditable) return;

  chatInput.addEventListener('keydown', (event) => {
    // 0. CHECK STATE: If disabled, stop immediately.
    if (!isEnabled) return;

    // Only trigger on Enter without Shift (Send command)
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;

    // Safety Check: Don't send if the message is actually empty
    const currentText = chatInput.innerText || chatInput.value || '';
    if (!currentText.trim()) return;

    event.preventDefault();
    event.stopPropagation();

    // AUTOMATIC SYSTEM TIMEZONE
    const timestamp = new Date().toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    const timestampText = `⌚ [Sent: ${timestamp}]`;

    console.log('Appending timestamp...');

    try {
      if (isTextarea) {
        // Standard Textarea
        chatInput.value += `\n${timestampText}`;
      } else {
        // ContentEditable (Standard ChatGPT input)
        const timeContainer = document.createElement('p');
        timeContainer.style.marginTop = '6px';
        timeContainer.style.fontSize = '0.85em';
        timeContainer.style.color = '#6b7280'; // subtle grey
        timeContainer.innerText = timestampText;

        chatInput.appendChild(timeContainer);
      }

      // Notify React/Editor that data changed.
      chatInput.dispatchEvent(new Event('input', { bubbles: true }));

    } catch (err) {
      console.error('Could not append timestamp:', err);
    }

    // Trigger Send
    requestAnimationFrame(() => {
        const sendButton = document.querySelector('button[data-testid="send-button"]');
        if (sendButton) {
          sendButton.click();
          console.log('Message sent with timestamp!');
        } else {
          console.warn('Send button not found.');
        }
    });
  }, true);
}

// Initialization logic
function initTemporalAnchor() {
  const bind = () => {
    const chatInput = document.querySelector('#prompt-textarea');
    if (chatInput && !chatInput.dataset.temporalAnchorBound) {
      chatInput.dataset.temporalAnchorBound = 'true';
      attachListener(chatInput);
    }
  };

  const observer = new MutationObserver(bind);
  observer.observe(document.body, { childList: true, subtree: true });
  bind();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTemporalAnchor);
  } else {
    initTemporalAnchor();
  }
}