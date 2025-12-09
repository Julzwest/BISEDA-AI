# Quick OpenAI Setup Guide

## Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy your API key (starts with `sk-`)

## Step 2: Add API Key to .env File

Open `backend/.env` and add your API key:

```env
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4o-mini
```

## Step 3: Restart Backend Server

The backend server needs to be restarted to load the new API key.

## Verify It's Working

After restarting, check the backend console. You should see:
```
🤖 OpenAI: ✅ Active - Using gpt-4o-mini
```

If you see:
```
🤖 OpenAI: ❌ Not configured - Using Custom AI system
```

Then check:
- .env file exists in backend/ directory
- API key is correct (starts with `sk-`)
- No extra spaces around the `=` sign
- Backend server was restarted after adding the key

