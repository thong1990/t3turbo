import React from 'react';
import { View } from 'react-native';
import { Text } from '~/shared/components/ui/text';
import { Button } from '~/shared/components/ui/button';
import { Badge } from '~/shared/components/ui/badge';
import { useSubscriptionFeatures } from '../hooks';
import { SUBSCRIPTION_FEATURES, SubscriptionPlan } from '../types';
import { PaywallButton } from './paywall-button';

interface FeatureGateProps {
  feature: keyof typeof SUBSCRIPTION_FEATURES;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUpgradePress?: (requiredPlan: SubscriptionPlan) => void;
  showUpgradePrompt?: boolean;
  className?: string;
  useRevenueCatPaywall?: boolean; // New prop to use RevenueCat paywall
}

export function FeatureGate({
  feature,
  children,
  fallback,
  onUpgradePress,
  showUpgradePrompt = true,
  className,
  useRevenueCatPaywall = true // Default to true to use RevenueCat dashboard design
}: FeatureGateProps) {
  const { hasFeature, getFeatureStatus } = useSubscriptionFeatures();
  
  const featureStatus = getFeatureStatus(feature);
  const hasAccess = hasFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const getPlanDisplayName = (plan: SubscriptionPlan) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const getFeatureDisplayName = (featureKey: string) => {
    // Convert camelCase to readable format
    return featureKey
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <View className={`rounded-lg border border-dashed border-border bg-muted/50 p-6 ${className}`}>
      <View className="items-center space-y-4">
        {/* Feature Lock Icon */}
        <View className="rounded-full bg-muted p-3">
          <Text className="text-2xl">🔒</Text>
        </View>

        {/* Feature Info */}
        <View className="items-center space-y-2">
          <Text className="text-center font-semibold">
            {getFeatureDisplayName(feature)}
          </Text>
          
          <View className="flex-row items-center space-x-2">
            <Text className="text-sm text-muted-foreground">
              Requires
            </Text>
            {featureStatus.requiredPlan && (
              <Badge variant="secondary">
                {getPlanDisplayName(featureStatus.requiredPlan)} Plan
              </Badge>
            )}
          </View>

          <Text className="text-center text-sm text-muted-foreground">
            Upgrade your plan to access this premium feature
          </Text>
        </View>

        {/* Upgrade Button */}
        {featureStatus.requiredPlan && (
          useRevenueCatPaywall ? (
            <PaywallButton
              title={`Upgrade to ${getPlanDisplayName(featureStatus.requiredPlan)}`}
              className="w-full max-w-xs"
              presentationType="modal"
              onPurchaseComplete={() => {
                console.log(`Feature ${feature} unlocked after purchase`);
              }}
            />
          ) : onUpgradePress ? (
            <Button
              size="sm"
              onPress={() => onUpgradePress(featureStatus.requiredPlan!)}
              className="w-full max-w-xs"
            >
              <Text>Upgrade to {getPlanDisplayName(featureStatus.requiredPlan)}</Text>
            </Button>
          ) : null
        )}
      </View>
    </View>
  );
}

// Hook for checking multiple features at once
export function useFeatureGate(features: (keyof typeof SUBSCRIPTION_FEATURES)[]) {
  const { hasFeature, getUpgradeRecommendation } = useSubscriptionFeatures();
  
  const hasAllFeatures = features.every(feature => hasFeature(feature));
  const recommendedPlan = getUpgradeRecommendation(features);
  
  return {
    hasAccess: hasAllFeatures,
    recommendedPlan,
    blockedFeatures: features.filter(feature => !hasFeature(feature))
  };
}