// Apple In-App Purchases Integration
// Uses Capacitor for iOS native purchases

import { Capacitor } from '@capacitor/core';
import { SUBSCRIPTION_TIERS, getPaidTiers } from '../config/subscriptions';
import { upgradeSubscription } from './credits';

// Product IDs for App Store Connect
export const PRODUCT_IDS = {
  lite: 'com.biseda.lite.monthly',
  plus: 'com.biseda.plus.monthly',
  vip: 'com.biseda.vip.monthly',
};

// Check if running on iOS
export const isIOSDevice = () => {
  return Capacitor.getPlatform() === 'ios';
};

// Initialize purchases (call on app start)
export const initializePurchases = async () => {
  if (!isIOSDevice()) {
    console.log('📱 Not on iOS - purchases disabled');
    return { success: false, reason: 'not_ios' };
  }

  try {
    // Check if StoreKit is available
    if (typeof window.webkit?.messageHandlers?.storeKit === 'undefined') {
      console.log('⚠️ StoreKit not available');
      return { success: false, reason: 'storekit_unavailable' };
    }

    console.log('✅ Apple purchases initialized');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to initialize purchases:', error);
    return { success: false, error: error.message };
  }
};

// Get available products from App Store
export const getProducts = async () => {
  if (!isIOSDevice()) {
    // Return mock products for testing on web
    return getPaidTiers().map(tier => ({
      id: tier.appleProductId,
      title: tier.name,
      price: tier.price,
      priceDisplay: tier.priceDisplay,
      description: `${tier.credits} credits per month`,
    }));
  }

  try {
    // This will be implemented with actual StoreKit calls
    // For now, return tier data as products
    return getPaidTiers().map(tier => ({
      id: tier.appleProductId,
      title: tier.name,
      price: tier.price,
      priceDisplay: tier.priceDisplay,
      description: `${tier.credits} credits per month`,
    }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

// Purchase a subscription
export const purchaseSubscription = async (productId) => {
  console.log('🛒 Attempting purchase:', productId);

  if (!isIOSDevice()) {
    // Simulate purchase for testing on web
    console.log('🧪 Simulating purchase on web');
    return simulatePurchase(productId);
  }

  try {
    // This is where the actual StoreKit purchase would happen
    // Using postMessage to communicate with native iOS code
    
    return new Promise((resolve, reject) => {
      // Set up listener for purchase result
      window.handlePurchaseResult = (result) => {
        if (result.success) {
          // Update local subscription
          const tierName = getTierFromProductId(productId);
          const tier = SUBSCRIPTION_TIERS[tierName];
          upgradeSubscription(tierName, tier.credits);
          
          resolve({
            success: true,
            tier: tierName,
            transactionId: result.transactionId,
          });
        } else {
          reject(new Error(result.error || 'Purchase failed'));
        }
      };

      // Trigger native purchase
      if (window.webkit?.messageHandlers?.purchase) {
        window.webkit.messageHandlers.purchase.postMessage({
          productId: productId,
        });
      } else {
        reject(new Error('Native purchase handler not available'));
      }

      // Timeout after 60 seconds
      setTimeout(() => {
        reject(new Error('Purchase timeout'));
      }, 60000);
    });
  } catch (error) {
    console.error('Purchase failed:', error);
    return { success: false, error: error.message };
  }
};

// Restore purchases
export const restorePurchases = async () => {
  console.log('🔄 Restoring purchases...');

  if (!isIOSDevice()) {
    console.log('🧪 Restore not available on web');
    return { success: false, reason: 'not_ios' };
  }

  try {
    return new Promise((resolve, reject) => {
      window.handleRestoreResult = (result) => {
        if (result.success && result.activeSubscription) {
          const tierName = getTierFromProductId(result.activeSubscription);
          const tier = SUBSCRIPTION_TIERS[tierName];
          upgradeSubscription(tierName, tier.credits);
          
          resolve({
            success: true,
            tier: tierName,
            restored: true,
          });
        } else {
          resolve({
            success: true,
            tier: null,
            restored: false,
            message: 'No active subscriptions found',
          });
        }
      };

      if (window.webkit?.messageHandlers?.restorePurchases) {
        window.webkit.messageHandlers.restorePurchases.postMessage({});
      } else {
        reject(new Error('Native restore handler not available'));
      }

      setTimeout(() => {
        reject(new Error('Restore timeout'));
      }, 30000);
    });
  } catch (error) {
    console.error('Restore failed:', error);
    return { success: false, error: error.message };
  }
};

// Get tier name from product ID
const getTierFromProductId = (productId) => {
  for (const [tierName, tier] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (tier.appleProductId === productId) {
      return tierName;
    }
  }
  return 'lite'; // Default
};

// Simulate purchase for web testing
const simulatePurchase = async (productId) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const tierName = getTierFromProductId(productId);
  const tier = SUBSCRIPTION_TIERS[tierName];
  
  if (!tier) {
    return { success: false, error: 'Invalid product' };
  }

  // Update subscription
  upgradeSubscription(tierName, tier.credits);

  return {
    success: true,
    tier: tierName,
    transactionId: `test_${Date.now()}`,
    simulated: true,
  };
};

// Cancel subscription (redirects to App Store settings)
export const openSubscriptionManagement = () => {
  if (isIOSDevice()) {
    // Open iOS subscription management
    window.location.href = 'itms-apps://apps.apple.com/account/subscriptions';
  } else {
    // For web, show instructions
    alert('To manage your subscription, go to Settings > Apple ID > Subscriptions on your iPhone.');
  }
};

export default {
  PRODUCT_IDS,
  isIOSDevice,
  initializePurchases,
  getProducts,
  purchaseSubscription,
  restorePurchases,
  openSubscriptionManagement,
};

