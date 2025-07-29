// Context and Provider
export { SubscriptionProvider, useSubscription } from './contexts/subscription-context';

// Hooks
export {
  useSubscriptionFeatures,
  usePurchases,
  usePaywall,
} from './hooks';

// Components
export {
  SubscriptionPlans,
  PurchaseButton,
  RestorePurchasesButton,
  SubscriptionStatus,
  FeatureGate,
  useFeatureGate,
  PaywallButton,
  PaywallModal,
} from './components';

// Types
export type {
  PurchasesPackage,
  PurchasesStoreProduct,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesCustomerInfo,
  PurchasesEntitlementInfo,
  SubscriptionStatus as SubscriptionStatusType,
  SubscriptionContextValue,
  SubscriptionPlan,
  SubscriptionFeatures,
  PurchaseError,
  RestoreError,
} from './types';

export { SUBSCRIPTION_FEATURES } from './types';

// Utils
export {
  formatPrice,
  calculateSavings,
  getBestPackage,
  sortPackagesByValue,
  hasActiveSubscription,
  getSubscriptionPlan,
  getDaysUntilExpiration,
  willSubscriptionRenew,
  getStoreName,
  getPackageTypeName,
  getPackagePeriod,
  isSubscriptionPackage,
  getEffectiveMonthlyPrice,
  comparePackageValue,
  getTrialInfo,
  hasFreeTrial,
  getSubscriptionManagementUrl,
} from './utils';