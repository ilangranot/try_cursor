// Popup script for ChatGPT Assistant extension

document.addEventListener('DOMContentLoaded', async () => {
    const apiKeyInput = document.getElementById('apiKey');
    const toggleKeyBtn = document.getElementById('toggleKey');
    const saveKeyBtn = document.getElementById('saveKey');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const responseArea = document.getElementById('response');
    const quickBtns = document.querySelectorAll('.quick-btn');

    // Load saved API key
    const result = await chrome.storage.sync.get(['apiKey']);
    if (result.apiKey) {
        apiKeyInput.value = result.apiKey;
    }

    // Toggle API key visibility
    toggleKeyBtn.addEventListener('click', () => {
        const type = apiKeyInput.type === 'password' ? 'text' : 'password';
        apiKeyInput.type = type;
        toggleKeyBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // Save API key
    saveKeyBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showMessage('Please enter an API key', 'error');
            return;
        }
        
        if (!apiKey.startsWith('sk-')) {
            showMessage('API key should start with "sk-"', 'error');
            return;
        }

        await chrome.storage.sync.set({ apiKey });
        showMessage('API key saved successfully!', 'success');
    });

    // Send message to ChatGPT
    sendBtn.addEventListener('click', async () => {
        await sendToChatGPT();
    });

    // Enter key to send (Shift+Enter for new line)
    userInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await sendToChatGPT();
        }
    });

    // Quick action buttons
    quickBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const prompt = btn.getAttribute('data-prompt');
            userInput.value = prompt;
            await sendToChatGPT();
        });
    });

    async function sendToChatGPT() {
        const apiKey = apiKeyInput.value.trim() || (await chrome.storage.sync.get(['apiKey'])).apiKey;
        const message = userInput.value.trim();

        if (!apiKey) {
            showMessage('Please save your API key first', 'error');
            return;
        }

        if (!message) {
            showMessage('Please enter a message', 'error');
            return;
        }

        // Update UI
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
        responseArea.innerHTML = '<div class="spinner"></div>';
        responseArea.className = 'response-area loading';

        try {
            // Get current page context if available
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            let pageContext = '';
            
            if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                try {
                    const results = await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: () => {
                            return {
                                title: document.title,
                                url: window.location.href,
                                text: document.body.innerText.substring(0, 2000)
                            };
                        }
                    });
                    if (results && results[0] && results[0].result) {
                        pageContext = `\n\nContext from current page:\nTitle: ${results[0].result.title}\nURL: ${results[0].result.url}\nContent: ${results[0].result.text}`;
                    }
                } catch (e) {
                    // Ignore errors from restricted pages
                }
            }

            const fullMessage = message + pageContext;

            // Call ChatGPT API
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'user',
                            content: fullMessage
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Failed to get response from ChatGPT');
            }

            const data = await response.json();
            const chatResponse = data.choices[0].message.content;

            // Display response
            responseArea.className = 'response-area';
            responseArea.textContent = chatResponse;
            userInput.value = '';

        } catch (error) {
            responseArea.className = 'response-area error';
            responseArea.textContent = `Error: ${error.message}\n\nPlease check your API key and try again.`;
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send to ChatGPT';
        }
    }

    function showMessage(message, type) {
        const existing = document.querySelector('.error, .success');
        if (existing) {
            existing.remove();
        }

        const msgDiv = document.createElement('div');
        msgDiv.className = type;
        msgDiv.textContent = message;
        saveKeyBtn.parentElement.appendChild(msgDiv);

        setTimeout(() => {
            msgDiv.remove();
        }, 3000);
    }
});
