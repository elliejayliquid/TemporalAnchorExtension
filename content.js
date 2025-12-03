// Temporal Anchor with guaranteed timestamp insertion
// Updated to use <p> and &nbsp; for reliable visual spacing even if renderer strips Markdown.

function attachListener(chatInput) {
  console.log('Temporal Anchor: Listener attached (<p> spacing mode)');

  const isTextarea = chatInput instanceof HTMLTextAreaElement;
  const isEditable = chatInput.isContentEditable === true;

  if (!isTextarea && !isEditable) {
    console.warn('No valid input element found for listener.');
    return;
  }

  if (isEditable) chatInput.style.whiteSpace = 'pre-line';

  chatInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;

    event.preventDefault();
    event.stopPropagation();

    const timestamp = new Date().toLocaleString('en-NZ', {
      timeZone: 'Pacific/Auckland',
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    let text = '';
    try {
      text = isTextarea ? chatInput.value : chatInput.innerText;
    } catch (err) {
      console.warn('Could not read text:', err);
      text = '';
    }

    console.log('--- BEFORE ---');
    console.log('Text before modification:', JSON.stringify(text));

    const hasTimestamp = /\u231A?\s*\[Sent:\s*.+\]\s*$/.test(text);

    // Ensure visible spacing before timestamp using paragraph tags and non-breaking space.
    if (text.trim().length > 0 && !/\n$/.test(text)) {
      text = text.replace(/\s*$/, '');
      text += '\n';
    }

    if (!hasTimestamp) {
      text += `⌚ [Sent: ${timestamp}]`;
    } else {
      text = text.replace(/\u231A?\s*\[Sent:\s*.+\]\s*$/, `⌚ [Sent: ${timestamp}]`);
    }

    console.log('Appending timestamp...');

    try {
      if (isTextarea) {
        chatInput.value = text;
      } else {
        // Convert to HTML with <p> wrapping for reliable visual spacing
        chatInput.textContent = text; // ensures captured plain text
        chatInput.innerHTML = text
          .replace(/\n\n/g, '<p>&nbsp;</p>') // extra blank paragraph for spacing
          .replace(/\n/g, '<br>')
          .replace(/⌚ \[Sent: (.+?)\]/, '<p style="margin-top:6px;">⌚ [Sent: $1]</p>');
      }
    } catch (err) {
      console.error('Could not update input:', err);
    }

    console.log('--- AFTER ---');
    console.log('Updated text:', JSON.stringify(text));

    try {
      if (isTextarea) {
        chatInput.selectionStart = chatInput.selectionEnd = text.length;
      } else {
        const range = document.createRange();
        range.selectNodeContents(chatInput);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch (e) {
      console.warn('Caret positioning failed:', e);
    }

    chatInput.dispatchEvent(new Event('input', { bubbles: true }));

    console.log('Timestamp successfully added:', timestamp);

    requestAnimationFrame(() => {
      const sendButton = document.querySelector('button[data-testid="send-button"]');
      if (sendButton) {
        sendButton.click();
        console.log('Message sent!');
      } else {
        console.warn('Send button not found, but timestamp applied.');
      }
    });
  }, true);
}

function initTemporalAnchor() {
  console.log('Temporal Anchor: Initializing (<p> spacing mode)');

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