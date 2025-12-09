import mongoose from 'mongoose';

const datingProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  displayName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  lookingFor: {
    type: String,
    enum: ['male', 'female', 'everyone'],
    required: true
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  photos: [{
    url: String,
    order: Number,
    uploadedAt: Date
  }],
  interests: [{
    type: String
  }],
  occupation: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    city: String,
    country: String
  },
  preferences: {
    minAge: {
      type: Number,
      default: 18
    },
    maxAge: {
      type: Number,
      default: 100
    },
    maxDistance: {
      type: Number,
      default: 50 // km
    },
    interests: [{
      type: String
    }]
  },
  verified: {
    type: Boolean,
    default: false
  },
  boostExpiresAt: {
    type: Date,
    default: null
  },
  likes: [{
    userId: String,
    likedAt: Date
  }],
  passes: [{
    userId: String,
    passedAt: Date
  }],
  matches: [{
    userId: String,
    matchedAt: Date
  }],
  superLikes: [{
    userId: String,
    superLikedAt: Date
  }],
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Create geospatial index for location-based queries
datingProfileSchema.index({ location: '2dsphere' });

// Create index for faster queries
datingProfileSchema.index({ userId: 1, isActive: 1 });
datingProfileSchema.index({ verified: 1 });
datingProfileSchema.index({ boostExpiresAt: 1 });

const DatingProfile = mongoose.model('DatingProfile', datingProfileSchema);
export default DatingProfile;

