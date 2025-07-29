import { useMemo } from 'react';
import { useSubscription } from '../contexts/subscription-context';
import { SUBSCRIPTION_FEATURES, SubscriptionPlan } from '../types';

export function useSubscriptionFeatures() {
  const { status, customerInfo } = useSubscription();

  const currentPlan: SubscriptionPlan = useMemo(() => {
    if (!status.isSubscribed || !customerInfo) {
      return 'free';
    }

    const activeEntitlements = status.activeEntitlements;
    
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
  }, [status.isSubscribed, status.activeEntitlements, customerInfo]);

  const hasFeature = useMemo(() => {
    return (featureKey: keyof typeof SUBSCRIPTION_FEATURES): boolean => {
      const feature = SUBSCRIPTION_FEATURES[featureKey];
      if (!feature) return false;
      
      return feature[currentPlan];
    };
  }, [currentPlan]);

  const getFeatureStatus = useMemo(() => {
    return (featureKey: keyof typeof SUBSCRIPTION_FEATURES) => {
      const feature = SUBSCRIPTION_FEATURES[featureKey];
      if (!feature) {
        return { hasAccess: false, requiredPlan: null };
      }

      const hasAccess = feature[currentPlan];
      
      if (hasAccess) {
        return { hasAccess: true, requiredPlan: null };
      }

      // Find the minimum plan required for this feature
      let requiredPlan: SubscriptionPlan | null = null;
      if (feature.pro) requiredPlan = 'pro';
      if (feature.premium) requiredPlan = 'premium';

      return { hasAccess: false, requiredPlan };
    };
  }, [currentPlan]);

  const getAllFeatures = useMemo(() => {
    return Object.keys(SUBSCRIPTION_FEATURES).reduce((acc, featureKey) => {
      const key = featureKey as keyof typeof SUBSCRIPTION_FEATURES;
      acc[key] = getFeatureStatus(key);
      return acc;
    }, {} as Record<keyof typeof SUBSCRIPTION_FEATURES, { hasAccess: boolean; requiredPlan: SubscriptionPlan | null }>);
  }, [getFeatureStatus]);

  const getUpgradeRecommendation = useMemo(() => {
    return (requestedFeatures: (keyof typeof SUBSCRIPTION_FEATURES)[]): SubscriptionPlan | null => {
      if (currentPlan === 'premium') return null;

      let recommendedPlan: SubscriptionPlan = currentPlan;

      for (const feature of requestedFeatures) {
        const featureConfig = SUBSCRIPTION_FEATURES[feature];
        if (!featureConfig) continue;

        if (!featureConfig[currentPlan]) {
          if (featureConfig.premium) {
            recommendedPlan = 'premium';
          } else if (featureConfig.pro && recommendedPlan !== 'premium') {
            recommendedPlan = 'pro';
          }
        }
      }

      return recommendedPlan === currentPlan ? null : recommendedPlan;
    };
  }, [currentPlan]);

  const getPlanFeatures = useMemo(() => {
    return (plan: SubscriptionPlan) => {
      return Object.keys(SUBSCRIPTION_FEATURES).filter(
        featureKey => SUBSCRIPTION_FEATURES[featureKey as keyof typeof SUBSCRIPTION_FEATURES][plan]
      ) as (keyof typeof SUBSCRIPTION_FEATURES)[];
    };
  }, []);

  const subscriptionInfo = useMemo(() => {
    return {
      currentPlan,
      isSubscribed: status.isSubscribed,
      expirationDate: status.expirationDate,
      willRenew: status.willRenew,
      managementURL: status.managementURL,
      daysUntilExpiration: status.expirationDate 
        ? Math.ceil((status.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null
    };
  }, [currentPlan, status]);

  return {
    // Current state
    currentPlan,
    subscriptionInfo,
    
    // Feature checking
    hasFeature,
    getFeatureStatus,
    getAllFeatures,
    
    // Plan utilities
    getPlanFeatures,
    getUpgradeRecommendation,
    
    // Convenience flags
    isPro: currentPlan === 'pro' || currentPlan === 'premium',
    isPremium: currentPlan === 'premium',
    isFree: currentPlan === 'free'
  };
}