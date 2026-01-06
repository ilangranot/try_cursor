const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const OpenAI = require('openai');
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data', 'summaries');
fs.ensureDirSync(dataDir);

// Store conversations
const conversations = new Map(); // phoneNumber -> { messages: [], lastActivity: Date }

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Generate QR code
client.on('qr', (qr) => {
    console.log('QR Code received, scan it with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Client ready
client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

// Handle incoming messages
client.on('message', async (message) => {
    const contact = await message.getContact();
    const phoneNumber = contact.number;
    const messageBody = message.body;
    const timestamp = new Date();

    // Initialize conversation if it doesn't exist
    if (!conversations.has(phoneNumber)) {
        conversations.set(phoneNumber, {
            messages: [],
            lastActivity: timestamp,
            contactName: contact.pushname || phoneNumber
        });
    }

    const conversation = conversations.get(phoneNumber);
    
    // Add message to conversation
    conversation.messages.push({
        from: message.fromMe ? 'bot' : 'user',
        text: messageBody,
        timestamp: timestamp.toISOString()
    });
    conversation.lastActivity = timestamp;

    // Check for summary command
    if (messageBody.toLowerCase().includes('/summary') || messageBody.toLowerCase().includes('/summarize')) {
        await generateAndSendSummary(phoneNumber, message);
    }

    // Auto-summarize if conversation has more than 20 messages
    if (conversation.messages.length >= 20 && conversation.messages.length % 20 === 0) {
        await generateAndSendSummary(phoneNumber, message, true);
    }
});

// Generate summary function
async function generateAndSendSummary(phoneNumber, message, auto = false) {
    const conversation = conversations.get(phoneNumber);
    
    if (!conversation || conversation.messages.length === 0) {
        await message.reply('No conversation found to summarize.');
        return;
    }

    try {
        // Format conversation for summarization
        const conversationText = conversation.messages
            .map(msg => `${msg.from === 'user' ? 'User' : 'Bot'}: ${msg.text}`)
            .join('\n');

        // Generate summary using OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that creates concise, well-structured summaries of WhatsApp conversations. Include key points, decisions made, and important information.'
                },
                {
                    role: 'user',
                    content: `Please summarize the following WhatsApp conversation:\n\n${conversationText}`
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        const summary = completion.choices[0].message.content;

        // Save summary to file
        const summaryId = uuidv4();
        const summaryData = {
            id: summaryId,
            phoneNumber: phoneNumber,
            contactName: conversation.contactName,
            summary: summary,
            messageCount: conversation.messages.length,
            createdAt: new Date().toISOString(),
            conversation: conversation.messages
        };

        const filePath = path.join(dataDir, `${summaryId}.json`);
        await fs.writeJson(filePath, summaryData, { spaces: 2 });

        // Send summary to user
        const summaryMessage = auto 
            ? `📋 *Auto-Summary Generated*\n\n${summary}\n\n💾 Summary ID: ${summaryId}\nDownload at: ${process.env.WEBSITE_URL || 'https://ilangranot.github.io/try_cursor'}/summaries/${summaryId}`
            : `📋 *Conversation Summary*\n\n${summary}\n\n💾 Summary ID: ${summaryId}\nDownload at: ${process.env.WEBSITE_URL || 'https://ilangranot.github.io/try_cursor'}/summaries/${summaryId}`;

        await message.reply(summaryMessage);

        // Clear conversation after summary (optional)
        // conversation.messages = [];

    } catch (error) {
        console.error('Error generating summary:', error);
        await message.reply('Sorry, I encountered an error while generating the summary. Please try again.');
    }
}

// API Routes
app.get('/api/summaries', async (req, res) => {
    try {
        const files = await fs.readdir(dataDir);
        const summaries = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(dataDir, file);
                const data = await fs.readJson(filePath);
                summaries.push({
                    id: data.id,
                    contactName: data.contactName,
                    summary: data.summary,
                    messageCount: data.messageCount,
                    createdAt: data.createdAt
                });
            }
        }

        summaries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(summaries);
    } catch (error) {
        console.error('Error fetching summaries:', error);
        res.status(500).json({ error: 'Failed to fetch summaries' });
    }
});

app.get('/api/summaries/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const filePath = path.join(dataDir, `${id}.json`);

        if (await fs.pathExists(filePath)) {
            const data = await fs.readJson(filePath);
            res.json(data);
        } else {
            res.status(404).json({ error: 'Summary not found' });
        }
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

app.get('/api/summaries/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        const filePath = path.join(dataDir, `${id}.json`);

        if (await fs.pathExists(filePath)) {
            const data = await fs.readJson(filePath);
            
            // Generate downloadable text file
            const downloadContent = `WhatsApp Conversation Summary
================================

Contact: ${data.contactName}
Phone: ${data.phoneNumber}
Date: ${new Date(data.createdAt).toLocaleString()}
Messages: ${data.messageCount}

SUMMARY:
--------
${data.summary}

FULL CONVERSATION:
------------------
${data.conversation.map(msg => `[${new Date(msg.timestamp).toLocaleString()}] ${msg.from === 'user' ? 'User' : 'Bot'}: ${msg.text}`).join('\n\n')}
`;

            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="summary-${id}.txt"`);
            res.send(downloadContent);
        } else {
            res.status(404).json({ error: 'Summary not found' });
        }
    } catch (error) {
        console.error('Error downloading summary:', error);
        res.status(500).json({ error: 'Failed to download summary' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});

// Initialize WhatsApp client
client.initialize();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await client.destroy();
    process.exit(0);
});
