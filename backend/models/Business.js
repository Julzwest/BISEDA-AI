// Business model for partnerships
// Using in-memory storage for MVP (can be migrated to database later)

class Business {
  constructor(data) {
    this.id = data.id || `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = data.name;
    this.description = data.description;
    this.category = data.category; // restaurants, cafes, bars, etc.
    this.city = data.city;
    this.rating = data.rating || '4.0';
    this.price = data.price || '$$';
    this.imageUrl = data.imageUrl || null;
    this.website = data.website || null;
    this.phone = data.phone || null;
    this.address = data.address || null;
    
    // Partnership status
    this.isSponsored = data.isSponsored || false;
    this.isFeatured = data.isFeatured || false;
    this.partnershipTier = data.partnershipTier || 'none'; // 'none', 'featured', 'sponsored'
    this.partnershipExpiresAt = data.partnershipExpiresAt || null;
    
    // Payment tracking
    this.stripeCustomerId = data.stripeCustomerId || null;
    this.stripeSubscriptionId = data.stripeSubscriptionId || null;
    this.monthlyFee = data.monthlyFee || 0;
    
    // Metadata
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = new Date();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }
  
  // Update partnership status
  setPartnership(tier, expiresAt = null, stripeCustomerId = null, stripeSubscriptionId = null) {
    this.partnershipTier = tier;
    this.isSponsored = tier === 'sponsored';
    this.isFeatured = tier === 'featured' || tier === 'sponsored';
    this.partnershipExpiresAt = expiresAt;
    this.stripeCustomerId = stripeCustomerId;
    this.stripeSubscriptionId = stripeSubscriptionId;
    this.updatedAt = new Date();
    
    // Set monthly fee based on tier
    if (tier === 'sponsored') {
      this.monthlyFee = this.getSponsoredPrice();
    } else if (tier === 'featured') {
      this.monthlyFee = this.getFeaturedPrice();
    } else {
      this.monthlyFee = 0;
    }
  }
  
  // Get pricing based on city tier
  getSponsoredPrice() {
    const tier1Cities = ['tiranë', 'durrës'];
    const tier2Cities = ['vlorë', 'shkodër'];
    
    const cityLower = this.city.toLowerCase();
    if (tier1Cities.includes(cityLower)) {
      return 299;
    } else if (tier2Cities.includes(cityLower)) {
      return 199;
    } else {
      return 99;
    }
  }
  
  getFeaturedPrice() {
    const tier1Cities = ['tiranë', 'durrës'];
    const tier2Cities = ['vlorë', 'shkodër'];
    
    const cityLower = this.city.toLowerCase();
    if (tier1Cities.includes(cityLower)) {
      return 149;
    } else if (tier2Cities.includes(cityLower)) {
      return 99;
    } else {
      return 49;
    }
  }
  
  // Cancel partnership
  cancelPartnership() {
    this.partnershipTier = 'none';
    this.isSponsored = false;
    this.isFeatured = false;
    this.partnershipExpiresAt = null;
    this.monthlyFee = 0;
    this.updatedAt = new Date();
  }
  
  // Check if partnership is active
  isPartnershipActive() {
    if (!this.isSponsored && !this.isFeatured) {
      return false;
    }
    if (this.partnershipExpiresAt && new Date() > this.partnershipExpiresAt) {
      return false;
    }
    return this.isActive;
  }
  
  // Update business info
  update(data) {
    Object.keys(data).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        this[key] = data[key];
      }
    });
    this.updatedAt = new Date();
  }
  
  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      city: this.city,
      rating: this.rating,
      price: this.price,
      imageUrl: this.imageUrl,
      website: this.website,
      phone: this.phone,
      address: this.address,
      isSponsored: this.isSponsored,
      isFeatured: this.isFeatured,
      partnershipTier: this.partnershipTier,
      partnershipExpiresAt: this.partnershipExpiresAt,
      monthlyFee: this.monthlyFee,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }
}

// In-memory storage
const businesses = new Map();

// Get all businesses
export function getAllBusinesses() {
  return Array.from(businesses.values());
}

// Get business by ID
export function getBusiness(id) {
  return businesses.get(id);
}

// Get businesses by city and category
export function getBusinessesByCityAndCategory(city, category) {
  const cityLower = city.toLowerCase();
  return Array.from(businesses.values()).filter(b => 
    b.city.toLowerCase() === cityLower && 
    b.category === category &&
    b.isActive
  );
}

// Create business
export function createBusiness(data) {
  const business = new Business(data);
  businesses.set(business.id, business);
  return business;
}

// Update business
export function updateBusiness(id, data) {
  const business = businesses.get(id);
  if (business) {
    business.update(data);
    return business;
  }
  return null;
}

// Delete business
export function deleteBusiness(id) {
  return businesses.delete(id);
}

// Save business (for persistence - can be extended to save to database)
export function saveBusiness(business) {
  businesses.set(business.id, business);
  return business;
}

// Initialize with sample data
export function initializeSampleBusinesses() {
  const sampleBusinesses = [
    {
      name: 'Mulliri i Vjetër',
      description: 'Restorant tradicionale me atmosferë shqiptare',
      category: 'restaurants',
      city: 'Tiranë',
      rating: '4.5',
      price: '$$',
      isSponsored: true,
      isFeatured: true,
      partnershipTier: 'sponsored'
    },
    {
      name: 'Oda',
      description: 'Restorant modern me kuzhinë mediterane',
      category: 'restaurants',
      city: 'Tiranë',
      rating: '4.7',
      price: '$$$',
      isFeatured: true,
      partnershipTier: 'featured'
    },
    {
      name: 'Komiteti Kafe-Muzeum',
      description: 'Kafene unike me atmosferë vintage',
      category: 'cafes',
      city: 'Tiranë',
      rating: '4.6',
      price: '$',
      isSponsored: true,
      isFeatured: true,
      partnershipTier: 'sponsored'
    },
    {
      name: 'Radio Bar',
      description: 'Rooftop bar me pamje të qytetit',
      category: 'bars',
      city: 'Tiranë',
      rating: '4.6',
      price: '$$',
      isFeatured: true,
      partnershipTier: 'featured'
    }
  ];
  
  sampleBusinesses.forEach(business => {
    if (!businesses.has(business.name.toLowerCase().replace(/\s+/g, '_'))) {
      createBusiness(business);
    }
  });
}

// Initialize on import
initializeSampleBusinesses();

