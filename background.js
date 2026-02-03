// Set default state to ON when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ temporalAnchorEnabled: true });
  updateBadge(true);
});

// Restore badge state on browser startup
chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get('temporalAnchorEnabled');
  const state = data.temporalAnchorEnabled ?? true;
  updateBadge(state);
});

// Also restore immediately when service worker starts
(async () => {
  const data = await chrome.storage.local.get('temporalAnchorEnabled');
  const state = data.temporalAnchorEnabled ?? true;
  updateBadge(state);
})();

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener(async (tab) => {
  const data = await chrome.storage.local.get('temporalAnchorEnabled');
  const currentState = data.temporalAnchorEnabled ?? true;

  const newState = !currentState;

  await chrome.storage.local.set({ temporalAnchorEnabled: newState });
  updateBadge(newState);

  console.log(`Temporal Anchor toggled: ${newState ? 'ON' : 'OFF'}`);
});

function updateBadge(isOn) {
  if (isOn) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#555555' });
  }
}