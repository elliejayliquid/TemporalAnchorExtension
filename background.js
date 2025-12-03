// Set default state to ON when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ temporalAnchorEnabled: true });
  updateBadge(true);
});

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener(async (tab) => {
  // 1. Get current state
  const data = await chrome.storage.local.get('temporalAnchorEnabled');
  const currentState = data.temporalAnchorEnabled ?? true;
  
  // 2. Toggle state
  const newState = !currentState;
  
  // 3. Save new state
  await chrome.storage.local.set({ temporalAnchorEnabled: newState });
  
  // 4. Update the visual badge
  updateBadge(newState);
});

function updateBadge(isOn) {
  if (isOn) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' }); // Green
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#555555' }); // Grey
  }
}