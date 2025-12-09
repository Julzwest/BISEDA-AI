# BISEDA.AI Backend API

Backend server for securely handling OpenAI API calls.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### POST /api/chat
Proxy endpoint for OpenAI chat completions.

**Request Body:**
```json
{
  "prompt": "User message",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "systemPrompt": "Optional system prompt",
  "fileUrls": ["data:image/..."] // Optional image URLs
}
```

**Response:**
```json
{
  "response": "AI response text",
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 50,
    "total_tokens": 150
  }
}
```

## Security Features

- ✅ API key stored server-side only
- ✅ Rate limiting (30 requests per minute)
- ✅ CORS protection
- ✅ Request validation
- ✅ Error handling

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (REQUIRED)
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

