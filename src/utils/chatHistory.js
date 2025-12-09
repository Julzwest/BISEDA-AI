// Chat History Storage for Biseda.ai
// Saves AI Coach conversations for users to review later

const CHAT_HISTORY_KEY = 'biseda_chat_history';
const MAX_CONVERSATIONS = 50; // Keep last 50 conversations
const MAX_MESSAGES_PER_CONVERSATION = 100;

// Get all chat history
export const getChatHistory = () => {
  try {
    const data = localStorage.getItem(CHAT_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Save chat history
const saveChatHistory = (history) => {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save chat history:', e);
  }
};

// Start a new conversation
export const startNewConversation = (title = null) => {
  const history = getChatHistory();
  const conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: title || 'Bisedë e re',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    preview: ''
  };
  
  // Add to beginning of array
  history.unshift(conversation);
  
  // Limit total conversations
  if (history.length > MAX_CONVERSATIONS) {
    history.pop();
  }
  
  saveChatHistory(history);
  return conversation.id;
};

// Add message to conversation
export const addMessageToConversation = (conversationId, message) => {
  const history = getChatHistory();
  const conversationIndex = history.findIndex(c => c.id === conversationId);
  
  if (conversationIndex === -1) {
    console.warn('Conversation not found:', conversationId);
    return false;
  }
  
  const conversation = history[conversationIndex];
  
  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role: message.role, // 'user' or 'assistant'
    content: message.content,
    timestamp: Date.now()
  };
  
  conversation.messages.push(newMessage);
  conversation.updatedAt = Date.now();
  
  // Update preview with last user message
  if (message.role === 'user') {
    conversation.preview = message.content.substring(0, 100);
    
    // Auto-generate title from first user message if still default
    if (conversation.title === 'Bisedë e re' && conversation.messages.filter(m => m.role === 'user').length === 1) {
      conversation.title = generateTitle(message.content);
    }
  }
  
  // Limit messages per conversation
  if (conversation.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
    conversation.messages = conversation.messages.slice(-MAX_MESSAGES_PER_CONVERSATION);
  }
  
  // Move conversation to top (most recent)
  history.splice(conversationIndex, 1);
  history.unshift(conversation);
  
  saveChatHistory(history);
  return true;
};

// Generate a title from the first message
const generateTitle = (content) => {
  // Remove common greetings and get the essence
  const cleaned = content
    .replace(/^(hej|hi|hello|ckemi|përshëndetje|mirëdita|tungjatjeta)/i, '')
    .trim();
  
  if (cleaned.length < 5) return 'Bisedë e re';
  
  // Take first 40 chars and add ellipsis if needed
  if (cleaned.length > 40) {
    return cleaned.substring(0, 40).trim() + '...';
  }
  
  return cleaned;
};

// Get a specific conversation
export const getConversation = (conversationId) => {
  const history = getChatHistory();
  return history.find(c => c.id === conversationId) || null;
};

// Get recent conversations (for sidebar/list)
export const getRecentConversations = (limit = 10) => {
  const history = getChatHistory();
  return history.slice(0, limit).map(c => ({
    id: c.id,
    title: c.title,
    preview: c.preview,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    messageCount: c.messages.length
  }));
};

// Delete a conversation
export const deleteConversation = (conversationId) => {
  const history = getChatHistory();
  const filtered = history.filter(c => c.id !== conversationId);
  saveChatHistory(filtered);
  return true;
};

// Clear all chat history
export const clearAllChatHistory = () => {
  localStorage.removeItem(CHAT_HISTORY_KEY);
  return true;
};

// Update conversation title
export const updateConversationTitle = (conversationId, newTitle) => {
  const history = getChatHistory();
  const conversation = history.find(c => c.id === conversationId);
  
  if (conversation) {
    conversation.title = newTitle;
    saveChatHistory(history);
    return true;
  }
  
  return false;
};

// Search conversations
export const searchConversations = (query) => {
  if (!query || query.length < 2) return [];
  
  const history = getChatHistory();
  const lowerQuery = query.toLowerCase();
  
  return history.filter(conversation => {
    // Search in title
    if (conversation.title.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in messages
    return conversation.messages.some(msg => 
      msg.content.toLowerCase().includes(lowerQuery)
    );
  });
};

// Get chat statistics
export const getChatStats = () => {
  const history = getChatHistory();
  
  const totalMessages = history.reduce((sum, c) => sum + c.messages.length, 0);
  const userMessages = history.reduce((sum, c) => 
    sum + c.messages.filter(m => m.role === 'user').length, 0
  );
  
  return {
    totalConversations: history.length,
    totalMessages,
    userMessages,
    assistantMessages: totalMessages - userMessages,
    oldestConversation: history.length > 0 
      ? new Date(history[history.length - 1].createdAt).toLocaleDateString('sq-AL')
      : null,
    newestConversation: history.length > 0
      ? new Date(history[0].createdAt).toLocaleDateString('sq-AL')
      : null
  };
};

// Export conversation as text
export const exportConversation = (conversationId) => {
  const conversation = getConversation(conversationId);
  if (!conversation) return null;
  
  let text = `# ${conversation.title}\n`;
  text += `Data: ${new Date(conversation.createdAt).toLocaleDateString('sq-AL')}\n\n`;
  
  conversation.messages.forEach(msg => {
    const time = new Date(msg.timestamp).toLocaleTimeString('sq-AL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const role = msg.role === 'user' ? 'Ti' : 'AI Coach';
    text += `[${time}] ${role}:\n${msg.content}\n\n`;
  });
  
  return text;
};

