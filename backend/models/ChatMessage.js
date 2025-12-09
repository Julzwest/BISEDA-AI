import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true,
    index: true
  },
  receiverId: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  read: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for faster message queries
chatMessageSchema.index({ matchId: 1, sentAt: -1 });
chatMessageSchema.index({ receiverId: 1, read: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;

