import { Platform } from 'react-native';
import { configureRevenueCat } from '~/shared/config/revenuecat';

/**
 * Initialize RevenueCat with proper configuration
 * This uses the existing configuration from shared/config/revenuecat.ts
 */
export async function initializeRevenueCat(): Promise<boolean> {
  try {
    return await configureRevenueCat();
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    return false;
  }
}

/**
 * RevenueCat configuration constants
 */
export const REVENUECAT_CONFIG = {
  // Entitlement identifiers - these should match your RevenueCat dashboard
  ENTITLEMENTS: {
    PREMIUM: 'Premium', // Matches your RevenueCat entitlement identifier
  },

  // Product identifiers from RevenueCat dashboard
  PRODUCTS: {
    PREMIUM_YEARLY: 'premium_yearly:yearly', // Your yearly product identifier
    PREMIUM_MONTHLY: 'premium_monthly:monthly', // Your monthly product identifier
  },

  // RevenueCat IDs for API reference
  REVENUECAT_IDS: {
    PREMIUM_YEARLY: 'prodd46f7f1015', // Your yearly RevenueCat ID
    PREMIUM_MONTHLY: 'prodcd3efd51cb', // Your monthly RevenueCat ID
  },

  // Offering identifiers
  OFFERINGS: {
    YEARLY: 'yearly', // Your offering identifier
    MONTHLY: 'monthly',
  },
  
  // Package types from RevenueCat
  PACKAGE_TYPES: {
    MONTHLY: 'MONTHLY',
    ANNUAL: 'ANNUAL',
    LIFETIME: 'LIFETIME',
    TWO_MONTH: 'TWO_MONTH',
    THREE_MONTH: 'THREE_MONTH',
    SIX_MONTH: 'SIX_MONTH',
    WEEKLY: 'WEEKLY',
  },

  // Store information
  STORES: {
    APP_STORE: 'app_store',
    PLAY_STORE: 'play_store',
    STRIPE: 'stripe',
  },

  // Platform-specific settings
  PLATFORM: {
    IOS: {
      STORE_NAME: 'App Store',
      MANAGEMENT_URL: 'https://apps.apple.com/account/subscriptions',
    },
    ANDROID: {
      STORE_NAME: 'Google Play',
      MANAGEMENT_URL: 'https://play.google.com/store/account/subscriptions',
    },
  },
} as const;

/**
 * Get current platform configuration
 */
export function getPlatformConfig() {
  return Platform.OS === 'ios' 
    ? REVENUECAT_CONFIG.PLATFORM.IOS 
    : REVENUECAT_CONFIG.PLATFORM.ANDROID;
}

/**
 * Default feature configuration
 * This maps features to the plans that have access to them
 */
export const DEFAULT_FEATURE_CONFIG = {
  // Basic features available to all plans
  basicAccess: { free: true, premium: true },
  
  // Premium features (hide ads and access feature)
  hideAds: { free: false, premium: true },
  premiumAccess: { free: false, premium: true },
  advancedFilters: { free: false, premium: true },
  unlimitedTrades: { free: false, premium: true },
  deckBuilder: { free: false, premium: true },
  premiumSupport: { free: false, premium: true },
  priorityMatching: { free: false, premium: true },
  analytics: { free: false, premium: true },
  customization: { free: false, premium: true },
  exportData: { free: false, premium: true },
  apiAccess: { free: false, premium: true },
} as const;