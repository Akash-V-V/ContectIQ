chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    const text = window.getSelection().toString().trim();
    sendResponse({ text });
  }
  return true;
});