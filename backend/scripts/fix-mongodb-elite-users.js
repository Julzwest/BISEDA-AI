// Automated script to fix Elite users in MongoDB
// Scans MongoDB user accounts and corrects tiers based on Stripe subscriptions

import Stripe from 'stripe';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://thehiddenclinic_db_user:Biseda2024Atlas@biseda-cluster.litn98m.mongodb.net/biseda?retryWrites=true&w=majority';

// MongoDB User Schema (from server.js)
const userAccountSchema = new mongoose.Schema({
  odId: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  subscriptionTier: { type: String, default: 'free_trial' },
  subscriptionStatus: { type: String, default: 'active' },
  subscriptionExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

const UserAccountModel = mongoose.model('UserAccount', userAccountSchema);

async function fixEliteUsers() {
  console.log('🔍 Starting Elite user tier fix (MongoDB)...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all users with Stripe customer IDs
    const allUsers = await UserAccountModel.find({ 
      stripeCustomerId: { $exists: true, $ne: null }
    });
    
    console.log(`📊 Total users with Stripe: ${allUsers.length}\n`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const user of allUsers) {
      try {
        console.log(`\n🔍 Checking: ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`   Current tier: ${user.subscriptionTier || 'free_trial'}`);
        console.log(`   Stripe Customer: ${user.stripeCustomerId}`);
        
        // Get subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'active',
          limit: 10
        });
        
        if (subscriptions.data.length === 0) {
          console.log(`   ⏭️  No active subscriptions`);
          skippedCount++;
          continue;
        }
        
        // Get the first active subscription
        const subscription = subscriptions.data[0];
        const priceId = subscription.items.data[0].price.id;
        
        console.log(`   💳 Active subscription found!`);
        console.log(`   Price ID: ${priceId}`);
        
        // Determine correct tier
        let correctTier = null;
        if (priceId === process.env.STRIPE_ELITE_PRICE_ID) {
          correctTier = 'elite';
        } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          correctTier = 'pro';
        } else if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
          correctTier = 'starter';
        } else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
          correctTier = 'premium';
        }
        
        if (!correctTier) {
          console.log(`   ⚠️  Unknown price ID`);
          skippedCount++;
          continue;
        }
        
        // Update if tier is wrong
        const currentTier = user.subscriptionTier || 'free_trial';
        
        if (currentTier !== correctTier) {
          await UserAccountModel.updateOne(
            { _id: user._id },
            {
              $set: {
                subscriptionTier: correctTier,
                subscriptionStatus: 'active',
                subscriptionExpiresAt: new Date(subscription.current_period_end * 1000),
                stripeSubscriptionId: subscription.id
              }
            }
          );
          
          fixedCount++;
          console.log(`   ✅ FIXED: ${currentTier} → ${correctTier}`);
          console.log(`   📅 Expires: ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}`);
        } else {
          console.log(`   ✓ Already correct: ${correctTier}`);
          skippedCount++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (userError) {
        console.error(`   ❌ Error:`, userError.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Fixed: ${fixedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    console.log('='.repeat(60));
    
    if (fixedCount > 0) {
      console.log('\n🎉 Elite user tiers have been corrected in MongoDB!');
      console.log('💡 Changes take effect immediately.\n');
    } else {
      console.log('\n✓ No users needed fixing!\n');
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed');
  }
}

// Run the script
fixEliteUsers()
  .then(() => {
    console.log('\n✓ Script completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
