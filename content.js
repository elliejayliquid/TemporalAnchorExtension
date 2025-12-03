// Temporal Anchor - Optimized for Large Text & Formatting Preservation

function attachListener(chatInput) {
  console.log('Temporal Anchor: Listener attached (Append Mode)');

  // Ensure we are working with the correct element types
  const isEditable = chatInput.isContentEditable === true;
  const isTextarea = chatInput.tagName === 'TEXTAREA';

  if (!isTextarea && !isEditable) return;

  chatInput.addEventListener('keydown', (event) => {
    // Only trigger on Enter without Shift (Send command)
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;

    // 1. Safety Check: Don't send if the message is actually empty
    // (Prevents sending just a timestamp as a ghost message)
    const currentText = chatInput.innerText || chatInput.value || '';
    if (!currentText.trim()) return;

    event.preventDefault();
    event.stopPropagation();

    // AUTOMATIC SYSTEM TIMEZONE
    // Passing 'undefined' as the first argument uses the browser's default locale.
    // Removing the 'timeZone' option defaults to the system's timezone.
	// Used to have this hard-coded: timeZone: 'Pacific/Auckland'
    const timestamp = new Date().toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    const timestampText = ` ⌚ [Sent: ${timestamp}]`;

    console.log('Appending timestamp...');

    try {
      if (isTextarea) {
        // Standard Textarea (Rare in modern ChatGPT, but good fallback)
        chatInput.value += `\n${timestampText}`;
      } else {
        // ContentEditable (Standard ChatGPT input)
        
        // We wrap the timestamp in a span or p to ensure separation
        const timeContainer = document.createElement('p');
        timeContainer.style.marginTop = '6px';
        timeContainer.style.fontSize = '0.85em';
        timeContainer.style.color = '#6b7280'; // subtle grey
        timeContainer.innerText = timestampText;

        // Append to the end of the chat input DOM
        chatInput.appendChild(timeContainer);
      }

      // 2. Critical: Notify React/Editor that data changed.
      // Without this, the internal state might ignore our DOM append.
      chatInput.dispatchEvent(new Event('input', { bubbles: true }));

    } catch (err) {
      console.error('Could not append timestamp:', err);
    }

    // 3. Trigger Send
    // Use a slight delay to ensure the Input event processes
    requestAnimationFrame(() => {
        // Find the send button (Dynamic lookup is safer as IDs change)
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

// Initialization logic (unchanged, robust)
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