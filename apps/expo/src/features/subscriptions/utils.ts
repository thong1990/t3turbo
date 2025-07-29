import { Platform } from 'react-native';
import type { PurchasesOffering, PurchasesPackage, PurchasesCustomerInfo, SubscriptionPlan } from './types';

/**
 * Format price string with currency symbol
 */
export function formatPrice(price: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
    }).format(price);
  } catch (error) {
    // Fallback if Intl is not available or currency code is invalid
    return `${currencyCode} ${price.toFixed(2)}`;
  }
}

/**
 * Calculate savings between packages
 */
export function calculateSavings(monthlyPackage: PurchasesPackage, annualPackage: PurchasesPackage) {
  if (!monthlyPackage || !annualPackage) return null;

  const monthlyYearlyPrice = monthlyPackage.product.price * 12;
  const annualPrice = annualPackage.product.price;
  const savings = monthlyYearlyPrice - annualPrice;
  const savingsPercentage = Math.round((savings / monthlyYearlyPrice) * 100);

  return {
    amount: savings,
    percentage: savingsPercentage,
    monthlyCost: monthlyPackage.product.price,
    annualCost: annualPrice,
    yearlyMonthlyCost: monthlyYearlyPrice,
    formattedAmount: formatPrice(savings, annualPackage.product.currencyCode),
    formattedMonthlyCost: formatPrice(monthlyPackage.product.price, monthlyPackage.product.currencyCode),
    formattedAnnualCost: formatPrice(annualPrice, annualPackage.product.currencyCode),
  };
}

/**
 * Get the best package from an offering based on priority
 */
export function getBestPackage(offering: PurchasesOffering): PurchasesPackage | null {
  // Priority order: Annual -> Monthly -> Lifetime -> First available
  return (
    offering.annual ||
    offering.monthly ||
    offering.lifetime ||
    offering.availablePackages[0] ||
    null
  );
}

/**
 * Sort packages by value (annual first, then monthly, then others)
 */
export function sortPackagesByValue(packages: PurchasesPackage[]): PurchasesPackage[] {
  const packageTypeOrder = {
    'ANNUAL': 1,
    'MONTHLY': 2,
    'LIFETIME': 3,
    'TWO_MONTH': 4,
    'THREE_MONTH': 5,
    'SIX_MONTH': 6,
    'WEEKLY': 7,
    'UNKNOWN': 8,
  };

  return [...packages].sort((a, b) => {
    const aOrder = packageTypeOrder[a.packageType as keyof typeof packageTypeOrder] || 8;
    const bOrder = packageTypeOrder[b.packageType as keyof typeof packageTypeOrder] || 8;
    return aOrder - bOrder;
  });
}

/**
 * Check if a customer has active subscription
 */
export function hasActiveSubscription(customerInfo: PurchasesCustomerInfo | null): boolean {
  if (!customerInfo) return false;
  return Object.keys(customerInfo.entitlements.active).length > 0;
}

/**
 * Get subscription plan from customer info
 */
export function getSubscriptionPlan(customerInfo: PurchasesCustomerInfo | null): SubscriptionPlan {
  if (!customerInfo || !hasActiveSubscription(customerInfo)) {
    return 'free';
  }

  const activeEntitlements = Object.keys(customerInfo.entitlements.active);
  
  // Check for premium features first
  if (activeEntitlements.includes('premium') || activeEntitlements.includes('premium_access')) {
    return 'premium';
  }
  
  // Check for pro features
  if (activeEntitlements.includes('pro') || activeEntitlements.includes('pro_access')) {
    return 'pro';
  }

  // Default to free if no matching entitlements
  return 'free';
}

/**
 * Get days until subscription expires
 */
export function getDaysUntilExpiration(customerInfo: PurchasesCustomerInfo | null): number | null {
  if (!customerInfo || !hasActiveSubscription(customerInfo)) {
    return null;
  }

  const activeEntitlementInfos = Object.values(customerInfo.entitlements.active);
  if (activeEntitlementInfos.length === 0) return null;

  // Find the latest expiration date
  const latestEntitlement = activeEntitlementInfos.reduce((latest, current) => {
    const currentExpiration = current.expirationDate ? new Date(current.expirationDate) : new Date(0);
    const latestExpiration = latest.expirationDate ? new Date(latest.expirationDate) : new Date(0);
    return currentExpiration > latestExpiration ? current : latest;
  });

  if (!latestEntitlement.expirationDate) return null;

  const expirationDate = new Date(latestEntitlement.expirationDate);
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if subscription will renew
 */
export function willSubscriptionRenew(customerInfo: PurchasesCustomerInfo | null): boolean {
  if (!customerInfo || !hasActiveSubscription(customerInfo)) {
    return false;
  }

  const activeEntitlementInfos = Object.values(customerInfo.entitlements.active);
  
  // If any active entitlement will renew, return true
  return activeEntitlementInfos.some(entitlement => entitlement.willRenew);
}

/**
 * Get platform-specific store name
 */
export function getStoreName(): string {
  return Platform.OS === 'ios' ? 'App Store' : 'Google Play';
}

/**
 * Get readable package type name
 */
export function getPackageTypeName(packageType: string): string {
  const packageTypeNames: Record<string, string> = {
    'ANNUAL': 'Annual',
    'MONTHLY': 'Monthly',
    'LIFETIME': 'Lifetime',
    'TWO_MONTH': '2 Month',
    'THREE_MONTH': '3 Month',
    'SIX_MONTH': '6 Month',
    'WEEKLY': 'Weekly',
    'UNKNOWN': 'Custom',
  };

  return packageTypeNames[packageType] || 'Custom';
}

/**
 * Get readable period from package type
 */
export function getPackagePeriod(packageType: string): string {
  const periods: Record<string, string> = {
    'ANNUAL': '/year',
    'MONTHLY': '/month',
    'LIFETIME': 'once',
    'TWO_MONTH': '/2 months',
    'THREE_MONTH': '/3 months',
    'SIX_MONTH': '/6 months',
    'WEEKLY': '/week',
    'UNKNOWN': '',
  };

  return periods[packageType] || '';
}

/**
 * Check if a package is a subscription (not one-time purchase)
 */
export function isSubscriptionPackage(packageType: string): boolean {
  const subscriptionTypes = ['ANNUAL', 'MONTHLY', 'TWO_MONTH', 'THREE_MONTH', 'SIX_MONTH', 'WEEKLY'];
  return subscriptionTypes.includes(packageType);
}

/**
 * Get effective monthly price for any package type
 */
export function getEffectiveMonthlyPrice(packageItem: PurchasesPackage): number {
  const price = packageItem.product.price;
  
  switch (packageItem.packageType) {
    case 'MONTHLY':
      return price;
    case 'ANNUAL':
      return price / 12;
    case 'TWO_MONTH':
      return price / 2;
    case 'THREE_MONTH':
      return price / 3;
    case 'SIX_MONTH':
      return price / 6;
    case 'WEEKLY':
      return price * 4.33; // Average weeks per month
    case 'LIFETIME':
      return 0; // Lifetime doesn't have monthly cost
    default:
      return price;
  }
}

/**
 * Compare packages by value (lower effective monthly price is better)
 */
export function comparePackageValue(a: PurchasesPackage, b: PurchasesPackage): number {
  const aMonthlyPrice = getEffectiveMonthlyPrice(a);
  const bMonthlyPrice = getEffectiveMonthlyPrice(b);
  
  // Lifetime packages have special handling (considered best value if price is reasonable)
  if (a.packageType === 'LIFETIME' && b.packageType !== 'LIFETIME') {
    return -1; // Lifetime is better
  }
  if (b.packageType === 'LIFETIME' && a.packageType !== 'LIFETIME') {
    return 1; // Lifetime is better
  }
  
  return aMonthlyPrice - bMonthlyPrice;
}

/**
 * Get trial information from a package
 */
export function getTrialInfo(packageItem: PurchasesPackage) {
  const introPrice = packageItem.product.introPrice;
  
  if (!introPrice) return null;
  
  return {
    price: introPrice.price,
    priceString: introPrice.priceString,
    period: introPrice.period,
    cycles: introPrice.cycles,
    isFree: introPrice.price === 0,
    formattedPrice: formatPrice(introPrice.price, packageItem.product.currencyCode),
  };
}

/**
 * Check if package has free trial
 */
export function hasFreeTrial(packageItem: PurchasesPackage): boolean {
  const trialInfo = getTrialInfo(packageItem);
  return trialInfo?.isFree || false;
}

/**
 * Get subscription management URL for the current platform
 */
export function getSubscriptionManagementUrl(): string {
  if (Platform.OS === 'ios') {
    return 'https://apps.apple.com/account/subscriptions';
  } else {
    return 'https://play.google.com/store/account/subscriptions';
  }
}