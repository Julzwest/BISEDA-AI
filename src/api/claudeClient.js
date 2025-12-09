// Anthropic Claude API Client for Intimacy Coaching
import { getBackendUrl } from '@/utils/getBackendUrl';

const backendUrl = getBackendUrl();

/**
 * Send a message to Claude for intimacy coaching
 * This uses Claude's more permissive content policies for educational sexual health content
 */
export async function sendClaudeMessage(messages, systemPrompt, userId) {
  try {
    const response = await fetch(`${backendUrl}/api/claude/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({
        messages,
        systemPrompt,
        model: 'claude-3-sonnet-20240229', // Claude Sonnet - good balance of quality and cost
        max_tokens: 1024,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Claude API request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
}

/**
 * Send a message with image analysis to Claude Vision
 */
export async function sendClaudeVisionMessage(messages, images, systemPrompt, userId) {
  try {
    const response = await fetch(`${backendUrl}/api/claude/vision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({
        messages,
        images,
        systemPrompt,
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Claude Vision API request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Claude Vision API Error:', error);
    throw error;
  }
}

export default {
  sendMessage: sendClaudeMessage,
  sendVisionMessage: sendClaudeVisionMessage
};
