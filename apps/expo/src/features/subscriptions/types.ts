export interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: PurchasesStoreProduct;
  offeringIdentifier: string;
}

export interface PurchasesStoreProduct {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
  introPrice?: PurchasesIntroPrice;
  discounts?: PurchasesDiscount[];
}

export interface PurchasesIntroPrice {
  price: number;
  priceString: string;
  period: string;
  cycles: number;
  periodUnit: string;
  periodNumberOfUnits: number;
}

export interface PurchasesDiscount {
  identifier: string;
  price: number;
  priceString: string;
  cycles: number;
  period: string;
  periodUnit: string;
  periodNumberOfUnits: number;
}

export interface PurchasesOffering {
  identifier: string;
  serverDescription: string;
  metadata?: Record<string, any>;
  availablePackages: PurchasesPackage[];
  lifetime?: PurchasesPackage;
  annual?: PurchasesPackage;
  sixMonth?: PurchasesPackage;
  threeMonth?: PurchasesPackage;
  twoMonth?: PurchasesPackage;
  monthly?: PurchasesPackage;
  weekly?: PurchasesPackage;
}

export interface PurchasesOfferings {
  all: Record<string, PurchasesOffering>;
  current?: PurchasesOffering;
}

export interface PurchasesCustomerInfo {
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  latestExpirationDate?: string;
  originalAppUserId: string;
  requestDate: string;
  firstSeen: string;
  originalApplicationVersion?: string;
  managementURL?: string;
  entitlements: {
    active: Record<string, PurchasesEntitlementInfo>;
    all: Record<string, PurchasesEntitlementInfo>;
  };
}

export interface PurchasesEntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  latestPurchaseDate: string;
  originalPurchaseDate: string;
  expirationDate?: string;
  store: string;
  productIdentifier: string;
  isSandbox: boolean;
  ownershipType: string;
  periodType?: string;
  unsubscribeDetectedAt?: string;
  billingIssueDetectedAt?: string;
}

export interface PurchasesStoreTransaction {
  transactionIdentifier: string;
  productIdentifier: string;
  purchaseDate: string;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  isLoading: boolean;
  activeEntitlements: string[];
  expirationDate?: Date;
  willRenew: boolean;
  managementURL?: string;
}

export interface SubscriptionContextValue {
  // State
  customerInfo: PurchasesCustomerInfo | null;
  offerings: PurchasesOfferings | null;
  status: SubscriptionStatus;
  isConfigured: boolean;
  error: Error | null;

  // Actions
  purchasePackage: (packageItem: PurchasesPackage) => Promise<{
    customerInfo: PurchasesCustomerInfo;
    transaction: PurchasesStoreTransaction;
  }>;
  restorePurchases: () => Promise<PurchasesCustomerInfo>;
  getCustomerInfo: () => Promise<PurchasesCustomerInfo>;
  refreshOfferings: () => Promise<PurchasesOfferings>;
  checkSubscriptionStatus: () => Promise<SubscriptionStatus>;
  
  // Configuration
  configureRevenueCat: (apiKey: string, userId?: string) => Promise<void>;
  setUserId: (userId: string) => Promise<PurchasesCustomerInfo>;
  logout: () => Promise<PurchasesCustomerInfo>;
}

export type SubscriptionPlan = 'free' | 'pro' | 'premium';

export interface SubscriptionFeatures {
  [key: string]: {
    free: boolean;
    pro: boolean;
    premium: boolean;
  };
}

export const SUBSCRIPTION_FEATURES: SubscriptionFeatures = {
  basicAccess: { free: true, pro: true, premium: true },
  advancedFilters: { free: false, pro: true, premium: true },
  premiumSupport: { free: false, pro: false, premium: true },
  unlimitedTrades: { free: false, pro: true, premium: true },
  priorityMatching: { free: false, pro: false, premium: true },
  deckBuilder: { free: false, pro: true, premium: true },
  analytics: { free: false, pro: false, premium: true },
};

export interface PurchaseError extends Error {
  code: string;
  underlyingErrorMessage?: string;
  userCancelled: boolean;
}

export interface RestoreError extends Error {
  code: string;
  underlyingErrorMessage?: string;
}