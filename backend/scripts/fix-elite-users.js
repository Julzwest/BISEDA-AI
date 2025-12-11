// Automated script to fix Elite users showing incorrect tiers
// This scans all users and corrects any Elite subscribers showing as free_trial

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getAllUsers, saveUser } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function fixEliteUsers() {
  console.log('🔍 Starting Elite user tier fix...\n');
  
  try {
    // Get all users (returns a Map, convert to array)
    const usersMap = getAllUsers();
    const allUsers = Array.from(usersMap.values());
    console.log(`📊 Total users in system: ${allUsers.length}\n`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const user of allUsers) {
      try {
        // Skip if user already has correct paid tier
        if (['pro', 'elite', 'premium', 'starter'].includes(user.subscriptionTier)) {
          skippedCount++;
          continue;
        }
        
        // Check if user has Stripe customer ID
        if (!user.stripeCustomerId) {
          continue;
        }
        
        console.log(`\n🔍 Checking user: ${user.userId}`);
        console.log(`   Current tier: ${user.subscriptionTier}`);
        console.log(`   Stripe Customer: ${user.stripeCustomerId}`);
        
        // Get subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'active',
          limit: 10
        });
        
        if (subscriptions.data.length === 0) {
          console.log(`   ⏭️  No active subscriptions found`);
          continue;
        }
        
        // Get the first active subscription
        const subscription = subscriptions.data[0];
        const priceId = subscription.items.data[0].price.id;
        
        console.log(`   💳 Active subscription found!`);
        console.log(`   Price ID: ${priceId}`);
        
        // Determine correct tier based on price ID
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
          console.log(`   ⚠️  Unknown price ID - skipping`);
          continue;
        }
        
        // Update user tier if incorrect
        if (user.subscriptionTier !== correctTier) {
          const oldTier = user.subscriptionTier;
          user.subscriptionTier = correctTier;
          user.subscriptionStatus = 'active';
          user.subscriptionExpiresAt = new Date(subscription.current_period_end * 1000);
          user.stripeSubscriptionId = subscription.id;
          
          saveUser(user);
          fixedCount++;
          
          console.log(`   ✅ FIXED: ${oldTier} → ${correctTier}`);
          console.log(`   📅 Expires: ${user.subscriptionExpiresAt.toLocaleDateString()}`);
        } else {
          console.log(`   ✓ Already correct tier: ${correctTier}`);
          skippedCount++;
        }
        
      } catch (userError) {
        console.error(`   ❌ Error processing user ${user.userId}:`, userError.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Fixed: ${fixedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users (already correct)`);
    console.log(`❌ Errors: ${errorCount} users`);
    console.log('='.repeat(60));
    
    if (fixedCount > 0) {
      console.log('\n🎉 Elite user tiers have been corrected!');
      console.log('💡 Users will see updated tier on next app launch.\n');
    } else {
      console.log('\n✓ No users needed fixing. All tiers are correct!\n');
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
fixEliteUsers()
  .then(() => {
    console.log('✓ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
