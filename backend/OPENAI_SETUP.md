# OpenAI Integration Setup Guide

This guide explains how to set up OpenAI API integration for BISEDA.AI.

## Prerequisites

1. An OpenAI API account (sign up at https://platform.openai.com/)
2. An OpenAI API key (get it from https://platform.openai.com/api-keys)

## Setup Instructions

### 1. Create `.env` File

In the `backend/` directory, create a `.env` file:

```bash
cd backend
touch .env
```

### 2. Add Your OpenAI API Key

Edit the `.env` file and add your OpenAI API key:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o-mini

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Available Models

You can use any of these OpenAI models:

- `gpt-4o-mini` (Recommended - Fast and cost-effective)
- `gpt-4o` (More capable, higher cost)
- `gpt-4-turbo` (High quality, higher cost)
- `gpt-3.5-turbo` (Legacy, cheaper)

### 4. Start the Backend Server

```bash
npm run backend:dev
```

The server will automatically:
- ✅ Use OpenAI if API key is configured
- ✅ Fall back to Custom AI if OpenAI fails or is not configured
- ✅ Show which system is active in the console

## How It Works

### Primary: OpenAI API
- Uses OpenAI's GPT models for high-quality responses
- Handles conversation context professionally
- Tracks token usage
- Automatic error handling and retries

### Fallback: Custom AI System
- Uses comprehensive Albanian dictionary
- Works even without OpenAI API key
- No API costs
- Always available as backup

## Error Handling

The system automatically handles:

- **Invalid API Key**: Falls back to Custom AI
- **Rate Limits**: Falls back to Custom AI
- **Service Unavailable**: Falls back to Custom AI
- **Network Errors**: Falls back to Custom AI

## Cost Management

OpenAI charges per token usage. The system:
- Uses `gpt-4o-mini` by default (most cost-effective)
- Limits context to last 6 messages
- Sets appropriate max_tokens limits
- Tracks usage for monitoring

## Monitoring

Check the backend console for:
- Which system is active (OpenAI or Custom AI)
- Token usage per request
- Error messages if OpenAI fails

## Security

✅ API key is stored server-side only (never exposed to client)
✅ Rate limiting prevents abuse
✅ CORS protection enabled
✅ Request validation

## Troubleshooting

### OpenAI Not Working?

1. Check `.env` file exists in `backend/` directory
2. Verify API key is correct (starts with `sk-`)
3. Check API key has credits/quota
4. Look at backend console for error messages
5. System will automatically use Custom AI as fallback

### Want to Disable OpenAI?

Simply remove or comment out `OPENAI_API_KEY` in `.env`:
```env
# OPENAI_API_KEY=sk-...
```

The system will automatically use Custom AI.


