import mongoose from 'mongoose';

const userAccountSchema = new mongoose.Schema({
  odId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // In production, this should be hashed!
  phoneNumber: { type: String },
  country: { type: String, default: 'AL' },
  appleId: { type: String },
  googleId: { type: String },
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

// Create indexes for faster lookups
userAccountSchema.index({ email: 1 });
userAccountSchema.index({ username: 1 });
userAccountSchema.index({ odId: 1 });

const UserAccount = mongoose.model('UserAccount', userAccountSchema);

export default UserAccount;

