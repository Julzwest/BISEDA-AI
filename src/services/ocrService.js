/**
 * Screenshot Intelligence Layer™ - OCR Service
 * 
 * Abstraction layer for extracting text from chat screenshots.
 * This service isolates OCR logic so it can be upgraded independently.
 * 
 * Current: Mock implementation (placeholder)
 * Future: Apple Vision / Google ML Kit / Tesseract.js / Cloud OCR
 */

/**
 * Extracts text from a chat screenshot image
 * 
 * @param {File|Blob} imageFile - The image file to process
 * @param {Object} options - Optional configuration
 * @param {string} options.platform - Detected platform (tinder, bumble, hinge, etc.)
 * @param {string} options.language - Language hint for OCR
 * @returns {Promise<ExtractedConversation>} Extracted conversation data
 * 
 * @typedef {Object} ExtractedConversation
 * @property {boolean} success - Whether extraction was successful
 * @property {string} rawText - Raw extracted text
 * @property {Array<ExtractedMessage>} messages - Parsed messages
 * @property {Object} metadata - Extraction metadata
 * 
 * @typedef {Object} ExtractedMessage
 * @property {string} text - Message content
 * @property {string} sender - "user" | "them" | "unknown"
 * @property {number} confidence - Confidence score 0-1
 */
export async function extractTextFromImage(imageFile, options = {}) {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MOCK IMPLEMENTATION
  // Replace with real OCR (Apple Vision / Google ML Kit / Tesseract) later
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Simulate processing delay (real OCR takes 1-3 seconds)
  await simulateProcessingDelay(800, 1500);
  
  // Return mock conversation data
  // In production, this would be real OCR output
  const mockConversation = generateMockConversation(options);
  
  return {
    success: true,
    rawText: mockConversation.rawText,
    messages: mockConversation.messages,
    metadata: {
      extractedAt: new Date().toISOString(),
      processingTimeMs: Math.floor(Math.random() * 500) + 800,
      confidence: 0.85, // Overall confidence score
      detectedPlatform: detectPlatformFromFilename(imageFile?.name),
      ocrEngine: 'mock_v1', // Track which engine was used
      imageSize: imageFile?.size || 0
    }
  };
}

/**
 * Simulates processing delay for realistic UX
 */
function simulateProcessingDelay(minMs, maxMs) {
  const delay = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Generates mock conversation data
 * Uses variety to make testing more realistic
 */
function generateMockConversation(options = {}) {
  // Multiple conversation templates for variety
  const conversationTemplates = [
    {
      rawText: "Hey, how was your day?\nGood! You?\nBusy but good 🙂\nSame here. What are you up to tonight?",
      messages: [
        { text: "Hey, how was your day?", sender: "them", confidence: 0.9 },
        { text: "Good! You?", sender: "user", confidence: 0.88 },
        { text: "Busy but good 🙂", sender: "them", confidence: 0.92 },
        { text: "Same here. What are you up to tonight?", sender: "user", confidence: 0.85 }
      ]
    },
    {
      rawText: "I love that show too!\nWhich season is your favorite?\nDefinitely season 2. The plot twists were insane\nRight?! I couldn't stop watching",
      messages: [
        { text: "I love that show too!", sender: "them", confidence: 0.91 },
        { text: "Which season is your favorite?", sender: "user", confidence: 0.87 },
        { text: "Definitely season 2. The plot twists were insane", sender: "them", confidence: 0.89 },
        { text: "Right?! I couldn't stop watching", sender: "user", confidence: 0.86 }
      ]
    },
    {
      rawText: "That hiking trail sounds amazing\nIt is! I go every weekend\nWe should go together sometime 😊\nI'd like that",
      messages: [
        { text: "That hiking trail sounds amazing", sender: "user", confidence: 0.88 },
        { text: "It is! I go every weekend", sender: "them", confidence: 0.92 },
        { text: "We should go together sometime 😊", sender: "user", confidence: 0.9 },
        { text: "I'd like that", sender: "them", confidence: 0.94 }
      ]
    },
    {
      rawText: "Haha you're funny\nI try my best 😄\nSo what do you do for work?\nI'm a designer. You?",
      messages: [
        { text: "Haha you're funny", sender: "them", confidence: 0.93 },
        { text: "I try my best 😄", sender: "user", confidence: 0.89 },
        { text: "So what do you do for work?", sender: "them", confidence: 0.91 },
        { text: "I'm a designer. You?", sender: "user", confidence: 0.87 }
      ]
    },
    {
      rawText: "Just got back from the gym\nNice! I should start working out more\nIt's addicting once you start\nMaybe you could show me some exercises?",
      messages: [
        { text: "Just got back from the gym", sender: "them", confidence: 0.9 },
        { text: "Nice! I should start working out more", sender: "user", confidence: 0.86 },
        { text: "It's addicting once you start", sender: "them", confidence: 0.91 },
        { text: "Maybe you could show me some exercises?", sender: "user", confidence: 0.88 }
      ]
    }
  ];
  
  // Select random template for variety
  const template = conversationTemplates[Math.floor(Math.random() * conversationTemplates.length)];
  
  return template;
}

/**
 * Attempts to detect dating platform from filename
 * Real implementation would use image analysis
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
