// Background service worker for ChatGPT Assistant extension

chrome.runtime.onInstalled.addListener(() => {
    console.log('ChatGPT Assistant extension installed');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getApiKey') {
        chrome.storage.sync.get(['apiKey'], (result) => {
            sendResponse({ apiKey: result.apiKey });
        });
        return true; // Will respond asynchronously
    }
});
