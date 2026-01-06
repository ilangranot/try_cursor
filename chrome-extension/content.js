// Content script for ChatGPT Assistant extension
// This runs on web pages and can interact with the page content

console.log('ChatGPT Assistant content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageContent') {
        sendResponse({
            title: document.title,
            url: window.location.href,
            text: document.body.innerText.substring(0, 2000)
        });
    }
    return true;
});
