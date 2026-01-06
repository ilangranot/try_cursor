# WhatsApp AI Summarizer Bot

A WhatsApp bot that automatically summarizes conversations using OpenAI's GPT models.

## Features

- 🤖 Automatic conversation summarization
- 📋 Manual summary generation with `/summary` command
- 💾 Summary storage and download
- 🌐 REST API for accessing summaries
- 📱 Works with WhatsApp Web

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key
- WhatsApp account

### Installation

1. Clone the repository and navigate to the bot directory:
```bash
cd whatsapp-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_actual_api_key_here
WEBSITE_URL=https://ilangranot.github.io/try_cursor
PORT=3000
```

5. Start the bot:
```bash
npm start
```

6. Scan the QR code with your WhatsApp mobile app:
   - Open WhatsApp on your phone
   - Go to Settings > Linked Devices
   - Tap "Link a Device"
   - Scan the QR code shown in the terminal

## Usage

### Manual Summary

Send `/summary` or `/summarize` in any WhatsApp conversation to generate a summary.

### Automatic Summary

The bot automatically generates summaries when a conversation reaches 20 messages (and every 20 messages after that).

### Download Summaries

Summaries are saved and can be accessed via:
- API: `GET /api/summaries` - List all summaries
- API: `GET /api/summaries/:id` - Get specific summary
- API: `GET /api/summaries/:id/download` - Download summary as text file
- Website: Visit the summaries section on the website

## API Endpoints

- `GET /api/summaries` - Get all summaries
- `GET /api/summaries/:id` - Get specific summary by ID
- `GET /api/summaries/:id/download` - Download summary as text file

## Data Storage

Summaries are stored in `data/summaries/` directory as JSON files. Each summary includes:
- Summary text
- Full conversation
- Contact information
- Timestamps
- Message count

## Troubleshooting

- **QR Code not showing**: Make sure you have a stable internet connection
- **Bot not responding**: Check that the bot is connected (look for "WhatsApp bot is ready!" message)
- **Summary generation fails**: Verify your OpenAI API key is correct and has credits

## Security Notes

- Never commit your `.env` file
- Keep your OpenAI API key secure
- The bot stores conversation data locally

## License

MIT
