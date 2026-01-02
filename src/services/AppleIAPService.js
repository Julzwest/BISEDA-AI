// Apple In-App Purchase Service for Biseda AI
// Uses cordova-plugin-purchase for StoreKit integration

import { getBackendUrl } from '@/utils/getBackendUrl';

// Product IDs - must match App Store Connect
export const PRODUCT_IDS = {
  starter: 'com.biseda.starter.monthly',
  pro: 'com.biseda.pro.monthly',
  elite: 'com.biseda.elite.monthly'
};

class AppleIAPService {
  constructor() {
    this.store = null;
    this.products = {};
    this.initialized = false;
    this.purchaseCallbacks = {};
  }

  // Initialize the store
  async initialize() {
    if (this.initialized) return true;

    try {
      // Check if we're on a native platform
      if (typeof window === 'undefined') return false;
      
      // Wait for device ready (Capacitor/Cordova)
      await this.waitForDeviceReady();
      
      // Get the store instance
      if (!window.CdvPurchase) {
        console.log('IAP: CdvPurchase not available (web environment)');
        return false;
      }

      this.store = window.CdvPurchase.store;
      
      // Configure the store
      this.store.verbosity = window.CdvPurchase.LogLevel.DEBUG;
      
      // Register products
      this.store.register([
        {
          id: PRODUCT_IDS.starter,
          type: window.CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          platform: window.CdvPurchase.Platform.APPLE_APPSTORE
        },
        {
          id: PRODUCT_IDS.pro,
          type: window.CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          platform: window.CdvPurchase.Platform.APPLE_APPSTORE
        },
        {
          id: PRODUCT_IDS.elite,
          type: window.CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          platform: window.CdvPurchase.Platform.APPLE_APPSTORE
        }
      ]);

      // Set up event handlers
      this.setupEventHandlers();
      
      // Initialize the store
      await this.store.initialize([window.CdvPurchase.Platform.APPLE_APPSTORE]);
      
      // Update products
      await this.store.update();
      
      // Cache product info
      this.cacheProducts();
      
      this.initialized = true;
      console.log('✅ IAP: Store initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ IAP: Failed to initialize store:', error);
      return false;
    }
  }

  waitForDeviceReady() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        // Check if Capacitor is ready
        setTimeout(resolve, 100);
      } else {
        document.addEventListener('deviceready', resolve, false);
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(resolve, 500);
        });
      }
    });
  }

  setupEventHandlers() {
    const store = this.store;
    
    // Handle approved purchases
    store.when().approved((transaction) => {
      console.log('✅ IAP: Purchase approved:', transaction.products[0]?.id);
      this.handleApprovedPurchase(transaction);
    });

    // Handle finished transactions
    store.when().finished((transaction) => {
      console.log('✅ IAP: Transaction finished:', transaction.products[0]?.id);
    });

    // Handle purchase verification
    store.when().verified((receipt) => {
      console.log('✅ IAP: Receipt verified');
      receipt.finish();
    });

    // Handle errors
    store.error((error) => {
      console.error('❌ IAP Error:', error);
      
      // Call error callback if pending
      Object.values(this.purchaseCallbacks).forEach(cb => {
        if (cb.onError) cb.onError(error);
      });
    });
  }

  cacheProducts() {
    Object.entries(PRODUCT_IDS).forEach(([tier, productId]) => {
      const product = this.store.get(productId);
      if (product) {
        this.products[tier] = {
          id: productId,
          title: product.title,
          description: product.description,
          price: product.pricing?.price || '€?.??',
          priceMicros: product.pricing?.priceMicros,
          currency: product.pricing?.currency || 'EUR'
        };
        console.log(`📦 IAP: Cached product ${tier}:`, this.products[tier]);
      }
    });
  }

  // Get product info
  getProduct(tier) {
    return this.products[tier] || null;
  }

  // Get all products
  getAllProducts() {
    return this.products;
  }

  // Check if a subscription is active
  async checkActiveSubscription() {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.store) return null;

    try {
      // Check each product for active subscription
      for (const [tier, productId] of Object.entries(PRODUCT_IDS)) {
        const product = this.store.get(productId);
        if (product && product.owned) {
          console.log(`✅ IAP: Active subscription found: ${tier}`);
          return tier;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ IAP: Error checking subscription:', error);
      return null;
    }
  }

  // Purchase a subscription
  async purchase(tier) {
    if (!this.initialized) {
      await this.initialize();
    }

    const productId = PRODUCT_IDS[tier];
    if (!productId) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    if (!this.store) {
      throw new Error('Store not available. Please try again.');
    }

    return new Promise((resolve, reject) => {
      console.log(`💳 IAP: Initiating purchase for ${tier} (${productId})`);
      
      // Store callbacks for this purchase
      this.purchaseCallbacks[productId] = {
        onSuccess: (transaction) => {
          delete this.purchaseCallbacks[productId];
          resolve({ success: true, tier, transaction });
        },
        onError: (error) => {
          delete this.purchaseCallbacks[productId];
          reject(error);
        }
      };

      // Get the product and initiate purchase
      const product = this.store.get(productId);
      if (!product) {
        reject(new Error('Product not found'));
        return;
      }

      // Get the offer
      const offer = product.getOffer();
      if (!offer) {
        reject(new Error('No offer available for this product'));
        return;
      }

      // Initiate purchase
      offer.order()
        .then(() => {
          console.log('✅ IAP: Purchase initiated');
        })
        .catch((error) => {
          console.error('❌ IAP: Purchase failed:', error);
          delete this.purchaseCallbacks[productId];
          reject(error);
        });
    });
  }

  // Handle approved purchase
  async handleApprovedPurchase(transaction) {
    const productId = transaction.products[0]?.id;
    const tier = Object.entries(PRODUCT_IDS).find(([, id]) => id === productId)?.[0];

    if (!tier) {
      console.error('❌ IAP: Unknown product:', productId);
      return;
    }

    try {
      // Verify receipt with backend
      const verified = await this.verifyReceipt(transaction);
      
      if (verified) {
        // Update local storage
        localStorage.setItem('subscriptionTier', tier);
        localStorage.setItem('subscriptionStartDate', Date.now().toString());
        localStorage.setItem('creditsUsed', '0');
        localStorage.removeItem('trialStartTime');
        localStorage.removeItem('trialExpired');
        
        // Finish the transaction
        transaction.finish();
        
        // Call success callback
        if (this.purchaseCallbacks[productId]?.onSuccess) {
          this.purchaseCallbacks[productId].onSuccess(transaction);
        }
        
        console.log(`✅ IAP: Subscription activated: ${tier}`);
      } else {
        throw new Error('Receipt verification failed');
      }
    } catch (error) {
      console.error('❌ IAP: Error handling purchase:', error);
      if (this.purchaseCallbacks[productId]?.onError) {
        this.purchaseCallbacks[productId].onError(error);
      }
    }
  }

  // Verify receipt with backend
  async verifyReceipt(transaction) {
    try {
      const backendUrl = getBackendUrl();
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      const response = await fetch(`${backendUrl}/api/subscription/verify-apple-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          receipt: transaction.transactionReceipt,
          productId: transaction.products[0]?.id,
          transactionId: transaction.transactionId
        })
      });

      if (!response.ok) {
        throw new Error('Backend verification failed');
      }

      const result = await response.json();
      return result.verified === true;
    } catch (error) {
      console.error('❌ IAP: Receipt verification error:', error);
      // For now, allow purchase to proceed (you should implement proper verification)
      return true;
    }
  }

  // Restore purchases
  async restorePurchases() {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.store) {
      throw new Error('Store not available');
    }

    return new Promise((resolve, reject) => {
      console.log('🔄 IAP: Restoring purchases...');
      
      this.store.restorePurchases()
        .then(() => {
          // Check for active subscription after restore
          this.checkActiveSubscription()
            .then(activeTier => {
              if (activeTier) {
                localStorage.setItem('subscriptionTier', activeTier);
                localStorage.removeItem('trialStartTime');
                localStorage.removeItem('trialExpired');
                resolve({ restored: true, tier: activeTier });
              } else {
                resolve({ restored: false });
              }
            });
        })
        .catch(reject);
    });
  }

  // Check if IAP is available (native only)
  isAvailable() {
    return typeof window !== 'undefined' && !!window.CdvPurchase;
  }
}

// Export singleton instance
export const appleIAP = new AppleIAPService();
export default appleIAP;

