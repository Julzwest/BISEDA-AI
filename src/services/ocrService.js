/**
 * Screenshot Intelligence Layer™ - OCR Service
 * 
 * Uses OpenAI Vision API to extract real text from chat screenshots.
 * This service properly reads and analyzes the actual image content.
 */

import { getBackendUrl } from '@/utils/getBackendUrl';

/**
 * Extracts text from a chat screenshot image using AI Vision
 * 
 * @param {File|Blob} imageFile - The image file to process
 * @param {Object} options - Optional configuration
 * @param {string} options.platform - Detected platform (tinder, bumble, hinge, etc.)
 * @param {string} options.language - Language hint for OCR
 * @returns {Promise<ExtractedConversation>} Extracted conversation data
 */
export async function extractTextFromImage(imageFile, options = {}) {
  const backendUrl = getBackendUrl();
  
  try {
    // Convert image file to base64 data URL
    const imageDataUrl = await fileToDataUrl(imageFile);
    
    // Call backend API with image for AI Vision processing
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': window.chatSessionId || `ocr_${Date.now()}`,
        'x-user-id': localStorage.getItem('odId') || localStorage.getItem('guestId') || ''
      },
      body: JSON.stringify({
        prompt: 'Extract the conversation from this screenshot',
        conversationHistory: [],
        systemPrompt: getOCRPrompt(),
        fileUrls: [imageDataUrl]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OCR API error:', errorData);
      throw new Error(errorData.error || 'Failed to extract text from image');
    }

    const data = await response.json();
    const aiResponse = data.response;
    
    // Parse the AI response to extract structured messages
    const parsedResult = parseAIResponse(aiResponse);
  
  return {
    success: true,
      rawText: parsedResult.rawText,
      messages: parsedResult.messages,
    metadata: {
      extractedAt: new Date().toISOString(),
        processingTimeMs: 0,
        confidence: parsedResult.confidence,
      detectedPlatform: detectPlatformFromFilename(imageFile?.name),
        ocrEngine: 'openai_vision',
      imageSize: imageFile?.size || 0
    }
  };
    
  } catch (error) {
    console.error('OCR extraction error:', error);
    
    // Return error result
    return {
      success: false,
      rawText: '',
      messages: [],
      metadata: {
        extractedAt: new Date().toISOString(),
        error: error.message,
        ocrEngine: 'openai_vision'
      }
    };
  }
}

/**
 * Converts a File to a data URL
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Gets the OCR extraction prompt for OpenAI Vision
 */
function getOCRPrompt() {
  return `You are an expert at reading chat screenshots and extracting the exact text.

YOUR TASK: Read this screenshot and extract EVERY message you can see.

⚠️ CRITICAL INSTRUCTIONS:
1. READ THE ACTUAL TEXT from the image - do NOT make up or imagine text
2. Identify which messages are from "me" (usually on the right, often in colored bubbles)
3. Identify which messages are from "them" (usually on the left, often in gray/white bubbles)
4. Extract messages in chronological order (oldest first, newest last)
5. Include ALL visible messages, even partial ones

RETURN THIS EXACT JSON FORMAT:
{
  "messages": [
    {"sender": "them", "text": "EXACT text from the screenshot"},
    {"sender": "me", "text": "EXACT text from the screenshot"},
    ...more messages...
  ],
  "confidence": 0.0-1.0,
  "platform": "detected platform or unknown"
}

CONFIDENCE SCORING:
- 1.0 = All text clearly readable
- 0.8-0.9 = Most text readable, some unclear
- 0.5-0.7 = Partial text readable
- Below 0.5 = Very unclear/difficult to read

⚠️ IMPORTANT:
- Extract the REAL text from the image
- If you cannot read something, indicate "unclear" in that message
- Do NOT use placeholder or example text
- Return ONLY valid JSON, no other text`;
}

/**
 * Parses the AI response to extract structured messages
 */
function parseAIResponse(response) {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Format messages
      const messages = (parsed.messages || []).map(msg => ({
        text: msg.text || '',
        sender: msg.sender === 'me' ? 'user' : msg.sender === 'them' ? 'them' : 'unknown',
        confidence: parsed.confidence || 0.8
      }));
      
      // Generate raw text
      const rawText = messages.map(m => {
        const prefix = m.sender === 'user' ? 'Me:' : 'Them:';
        return `${prefix} ${m.text}`;
      }).join('\n');
      
      return {
        messages,
        rawText,
        confidence: parsed.confidence || 0.8
      };
    }
  } catch (e) {
    console.error('Parse error:', e);
  }
  
  // Fallback: try to parse as plain text
  const lines = response.split('\n').filter(l => l.trim());
  const messages = lines.map((line, i) => ({
    text: line.trim(),
    sender: i % 2 === 0 ? 'them' : 'user',
    confidence: 0.5
  }));
  
  return {
    messages,
    rawText: response,
    confidence: 0.5
  };
}

/**
 * Attempts to detect dating platform from filename
 */
function detectPlatformFromFilename(filename) {
  if (!filename) return 'unknown';
  
  const lowerName = filename.toLowerCase();
  
  if (lowerName.includes('tinder')) return 'tinder';
  if (lowerName.includes('bumble')) return 'bumble';
  if (lowerName.includes('hinge')) return 'hinge';
  if (lowerName.includes('whatsapp')) return 'whatsapp';
  if (lowerName.includes('instagram') || lowerName.includes('ig')) return 'instagram';
  if (lowerName.includes('messenger')) return 'messenger';
  
  return 'unknown';
}

/**
 * Validates if a file is a supported image type
 */
export function isValidImageFile(file) {
  if (!file) return false;
  
  const supportedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/heic',
    'image/heif',
    'image/webp'
  ];
  
  return supportedTypes.includes(file.type?.toLowerCase());
}

/**
 * Formats extracted messages into text for the conversation engine
 */
export function formatExtractedMessagesAsText(messages) {
  if (!messages || !Array.isArray(messages)) return '';
  
  return messages.map(msg => {
    const prefix = msg.sender === 'user' ? 'Me:' : 
                   msg.sender === 'them' ? 'Them:' : '';
    return `${prefix} ${msg.text}`;
  }).join('\n');
}

/**
 * Gets extraction confidence level as a human-readable label
 */
export function getConfidenceLabel(confidence) {
  if (confidence >= 0.9) return 'High';
  if (confidence >= 0.7) return 'Medium';
  if (confidence >= 0.5) return 'Low';
  return 'Very Low';
}
