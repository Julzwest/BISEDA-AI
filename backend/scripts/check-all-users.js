// Check all users in MongoDB and show their tier status

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://thehiddenclinic_db_user:Biseda2024Atlas@biseda-cluster.litn98m.mongodb.net/biseda?retryWrites=true&w=majority';

// MongoDB User Schema
const userAccountSchema = new mongoose.Schema({
  odId: { type: String, required: true, unique: true },
  username: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  subscriptionTier: { type: String },
  subscriptionStatus: { type: String },
  createdAt: { type: Date }
}, { strict: false }); // Allow extra fields

const UserAccountModel = mongoose.model('UserAccount', userAccountSchema);

async function checkAllUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const allUsers = await UserAccountModel.find({}).select(
      'odId firstName lastName email subscriptionTier subscriptionStatus stripeCustomerId stripeSubscriptionId createdAt'
    ).sort({ createdAt: -1 });
    
    console.log(`📊 TOTAL USERS: ${allUsers.length}\n`);
    console.log('='.repeat(80));
    
    if (allUsers.length === 0) {
      console.log('No users found in database.');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   OD ID: ${user.odId}`);
        console.log(`   Tier: ${user.subscriptionTier || 'NOT SET'}`);
        console.log(`   Status: ${user.subscriptionStatus || 'NOT SET'}`);
        console.log(`   Stripe Customer: ${user.stripeCustomerId || 'NONE'}`);
        console.log(`   Stripe Subscription: ${user.stripeSubscriptionId || 'NONE'}`);
        console.log(`   Created: ${user.createdAt ? user.createdAt.toLocaleDateString() : 'N/A'}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📈 TIER BREAKDOWN:');
    
    const tierCounts = {};
    allUsers.forEach(user => {
      const tier = user.subscriptionTier || 'not_set';
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    });
    
    Object.entries(tierCounts).sort((a, b) => b[1] - a[1]).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} users`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Done\n');
  }
}

checkAllUsers();
