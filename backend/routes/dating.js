import express from 'express';
import DatingProfile from '../models/DatingProfile.js';
import ChatMessage from '../models/ChatMessage.js';

const router = express.Router();

// Middleware to get user ID from request
function getUserId(req) {
  return req.headers['x-user-id'] || req.get('userId') || 'anonymous';
}

// CREATE OR UPDATE DATING PROFILE
router.post('/profile', async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      displayName,
      age,
      gender,
      lookingFor,
      bio,
      photos,
      interests,
      occupation,
      education,
      location,
      preferences
    } = req.body;

    let profile = await DatingProfile.findOne({ userId });

    if (profile) {
      // Update existing profile
      Object.assign(profile, {
        displayName,
        age,
        gender,
        lookingFor,
        bio,
        photos,
        interests,
        occupation,
        education,
        location,
        preferences,
        lastActive: new Date()
      });
      await profile.save();
    } else {
      // Create new profile
      profile = new DatingProfile({
        userId,
        displayName,
        age,
        gender,
        lookingFor,
        bio,
        photos: photos || [],
        interests: interests || [],
        occupation,
        education,
        location,
        preferences: preferences || {},
        lastActive: new Date()
      });
      await profile.save();
    }

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error creating/updating dating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET USER'S OWN PROFILE
router.get('/profile', async (req, res) => {
  try {
    const userId = getUserId(req);
    const profile = await DatingProfile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET POTENTIAL MATCHES (with filters)
router.get('/discover', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { lat, lon } = req.query;

    const userProfile = await DatingProfile.findOne({ userId });
    
    if (!userProfile) {
      return res.status(404).json({ error: 'Please create a dating profile first' });
    }

    // Get users that the current user has already liked or passed
    const alreadySeenIds = [
      ...userProfile.likes.map(l => l.userId),
      ...userProfile.passes.map(p => p.userId),
      userId // exclude self
    ];

    // Build query
    let query = {
      userId: { $nin: alreadySeenIds },
      isActive: true,
      age: {
        $gte: userProfile.preferences.minAge || 18,
        $lte: userProfile.preferences.maxAge || 100
      }
    };

    // Filter by gender preference
    if (userProfile.lookingFor !== 'everyone') {
      query.gender = userProfile.lookingFor;
    }

    // Location-based filtering
    if (lat && lon) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)]
          },
          $maxDistance: (userProfile.preferences.maxDistance || 50) * 1000 // Convert km to meters
        }
      };
    }

    // Get profiles, prioritize boosted profiles
    let profiles = await DatingProfile.find(query)
      .select('-likes -passes -matches -superLikes')
      .limit(50)
      .lean();

    // Sort: boosted profiles first, then by lastActive
    profiles = profiles.sort((a, b) => {
      const aBoost = a.boostExpiresAt && new Date(a.boostExpiresAt) > new Date() ? 1 : 0;
      const bBoost = b.boostExpiresAt && new Date(b.boostExpiresAt) > new Date() ? 1 : 0;
      
      if (aBoost !== bBoost) return bBoost - aBoost;
      return new Date(b.lastActive) - new Date(a.lastActive);
    });

    // Calculate distances if location provided
    if (lat && lon) {
      const userLat = parseFloat(lat);
      const userLon = parseFloat(lon);
      
      profiles = profiles.map(profile => {
        if (profile.location && profile.location.coordinates) {
          const [profLon, profLat] = profile.location.coordinates;
          const distance = calculateDistance(userLat, userLon, profLat, profLon);
          return { ...profile, distance: Math.round(distance) };
        }
        return profile;
      });
    }

    res.json({ profiles });
  } catch (error) {
    console.error('Error getting discover profiles:', error);
    res.status(500).json({ error: error.message });
  }
});

// SWIPE ACTION (LIKE, PASS, SUPER LIKE)
router.post('/swipe', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { targetUserId, action } = req.body; // action: 'like', 'pass', 'superlike'

    const userProfile = await DatingProfile.findOne({ userId });
    const targetProfile = await DatingProfile.findOne({ userId: targetUserId });

    if (!userProfile || !targetProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    let isMatch = false;

    if (action === 'like' || action === 'superlike') {
      // Add to likes
      const likeData = {
        userId: targetUserId,
        likedAt: new Date(),
        ...(action === 'superlike' && { superLike: true })
      };

      if (action === 'superlike') {
        userProfile.superLikes.push(likeData);
      } else {
        userProfile.likes.push(likeData);
      }

      // Check if target user also liked this user
      const targetLikedUser = targetProfile.likes.some(l => l.userId === userId) ||
                              targetProfile.superLikes.some(l => l.userId === userId);

      if (targetLikedUser) {
        // It's a match!
        isMatch = true;
        
        // Add to matches for both users
        const matchData = {
          userId: targetUserId,
          matchedAt: new Date()
        };
        const reverseMatchData = {
          userId: userId,
          matchedAt: new Date()
        };

        if (!userProfile.matches.some(m => m.userId === targetUserId)) {
          userProfile.matches.push(matchData);
        }
        if (!targetProfile.matches.some(m => m.userId === userId)) {
          targetProfile.matches.push(reverseMatchData);
        }

        await targetProfile.save();
      }
    } else if (action === 'pass') {
      // Add to passes
      userProfile.passes.push({
        userId: targetUserId,
        passedAt: new Date()
      });
    }

    await userProfile.save();

    res.json({ 
      success: true, 
      isMatch,
      matchProfile: isMatch ? {
        userId: targetProfile.userId,
        displayName: targetProfile.displayName,
        photos: targetProfile.photos
      } : null
    });
  } catch (error) {
    console.error('Error swiping:', error);
    res.status(500).json({ error: error.message });
  }
});

// UNDO LAST SWIPE
router.post('/undo', async (req, res) => {
  try {
    const userId = getUserId(req);
    const userProfile = await DatingProfile.findOne({ userId });

    if (!userProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Find the most recent action (like or pass)
    const lastLike = userProfile.likes[userProfile.likes.length - 1];
    const lastPass = userProfile.passes[userProfile.passes.length - 1];
    const lastSuperLike = userProfile.superLikes[userProfile.superLikes.length - 1];

    let lastAction = null;
    let lastActionTime = null;

    if (lastLike && (!lastActionTime || lastLike.likedAt > lastActionTime)) {
      lastAction = 'like';
      lastActionTime = lastLike.likedAt;
    }
    if (lastPass && (!lastActionTime || lastPass.passedAt > lastActionTime)) {
      lastAction = 'pass';
      lastActionTime = lastPass.passedAt;
    }
    if (lastSuperLike && (!lastActionTime || lastSuperLike.superLikedAt > lastActionTime)) {
      lastAction = 'superlike';
      lastActionTime = lastSuperLike.superLikedAt;
    }

    if (!lastAction) {
      return res.status(400).json({ error: 'No action to undo' });
    }

    // Remove the last action
    if (lastAction === 'like') {
      userProfile.likes.pop();
    } else if (lastAction === 'pass') {
      userProfile.passes.pop();
    } else if (lastAction === 'superlike') {
      userProfile.superLikes.pop();
    }

    await userProfile.save();

    res.json({ success: true, undoneAction: lastAction });
  } catch (error) {
    console.error('Error undoing swipe:', error);
    res.status(500).json({ error: error.message });
  }
});

// BOOST PROFILE
router.post('/boost', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { duration = 30 } = req.body; // duration in minutes, default 30

    const userProfile = await DatingProfile.findOne({ userId });

    if (!userProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Set boost expiration time
    const boostExpiresAt = new Date(Date.now() + duration * 60 * 1000);
    userProfile.boostExpiresAt = boostExpiresAt;
    await userProfile.save();

    res.json({ 
      success: true, 
      boostExpiresAt,
      message: `Profile boosted for ${duration} minutes!`
    });
  } catch (error) {
    console.error('Error boosting profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// VERIFY PROFILE
router.post('/verify', async (req, res) => {
  try {
    const userId = getUserId(req);
    const userProfile = await DatingProfile.findOne({ userId });

    if (!userProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // In production, you'd have verification logic here
    // For now, just mark as verified
    userProfile.verified = true;
    await userProfile.save();

    res.json({ success: true, message: 'Profile verified!' });
  } catch (error) {
    console.error('Error verifying profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET MATCHES
router.get('/matches', async (req, res) => {
  try {
    const userId = getUserId(req);
    const userProfile = await DatingProfile.findOne({ userId });

    if (!userProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const matchUserIds = userProfile.matches.map(m => m.userId);
    const matchProfiles = await DatingProfile.find({ userId: { $in: matchUserIds } })
      .select('userId displayName age photos location lastActive verified')
      .lean();

    // Get last message for each match
    const matchesWithLastMessage = await Promise.all(
      matchProfiles.map(async (profile) => {
        const lastMessage = await ChatMessage.findOne({
          $or: [
            { senderId: userId, receiverId: profile.userId },
            { senderId: profile.userId, receiverId: userId }
          ]
        })
        .sort({ sentAt: -1 })
        .limit(1)
        .lean();

        // Count unread messages
        const unreadCount = await ChatMessage.countDocuments({
          senderId: profile.userId,
          receiverId: userId,
          read: false
        });

        return {
          ...profile,
          lastMessage,
          unreadCount
        };
      })
    );

    res.json({ matches: matchesWithLastMessage });
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({ error: error.message });
  }
});

// SEND MESSAGE
router.post('/message', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { receiverId, message } = req.body;

    console.log('📤 SEND MESSAGE REQUEST:', { userId, receiverId, message: message?.substring(0, 50) });

    if (!receiverId || !message) {
      console.log('❌ Missing receiverId or message');
      return res.status(400).json({ success: false, error: 'Missing receiverId or message' });
    }

    // Allow mock users to send messages (for demo)
    const isMockUser = receiverId.startsWith('mock-user-');
    
    if (!isMockUser) {
      // Check if they're matched (for real users)
      const userProfile = await DatingProfile.findOne({ userId });
      
      if (!userProfile) {
        console.log('❌ User profile not found:', userId);
        return res.status(404).json({ success: false, error: 'Dating profile not found' });
      }

      const isMatch = userProfile.matches.some(m => m.userId === receiverId);

      if (!isMatch) {
        console.log('❌ Not matched:', { userId, receiverId });
        return res.status(403).json({ success: false, error: 'You can only message your matches' });
      }
    } else {
      console.log('🎭 Mock user detected - allowing message for demo');
    }

    // Create match ID (sorted user IDs for consistency)
    const matchId = [userId, receiverId].sort().join('-');

    const chatMessage = new ChatMessage({
      matchId,
      senderId: userId,
      receiverId,
      message,
      sentAt: new Date()
    });

    await chatMessage.save();
    
    console.log('✅ Message sent successfully:', chatMessage._id);

    res.json({ success: true, message: chatMessage });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET MESSAGES FOR A MATCH
router.get('/messages/:matchUserId', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { matchUserId } = req.params;

    const messages = await ChatMessage.find({
      $or: [
        { senderId: userId, receiverId: matchUserId },
        { senderId: matchUserId, receiverId: userId }
      ]
    })
    .sort({ sentAt: 1 })
    .limit(100)
    .lean();

    // Mark messages as read
    await ChatMessage.updateMany(
      { senderId: matchUserId, receiverId: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE LOCATION
router.post('/location', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { latitude, longitude, city, country } = req.body;

    const userProfile = await DatingProfile.findOne({ userId });

    if (!userProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    userProfile.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
      city,
      country
    };
    userProfile.lastActive = new Date();

    await userProfile.save();

    res.json({ success: true, location: userProfile.location });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

export default router;

