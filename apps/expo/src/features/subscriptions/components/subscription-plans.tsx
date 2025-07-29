import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '~/shared/components/ui/text';
import { Button } from '~/shared/components/ui/button';
import { Badge } from '~/shared/components/ui/badge';
import { usePurchases, useSubscriptionFeatures } from '../hooks';
import type { PurchasesPackage } from '../types';

interface SubscriptionPlansProps {
  onPurchaseStart?: (packageItem: PurchasesPackage) => void;
  onPurchaseComplete?: (packageItem: PurchasesPackage) => void;
  onPurchaseError?: (error: Error, packageItem: PurchasesPackage) => void;
  showCurrentPlan?: boolean;
}

export function SubscriptionPlans({
  onPurchaseStart,
  onPurchaseComplete,
  onPurchaseError,
  showCurrentPlan = true
}: SubscriptionPlansProps) {
  const { 
    purchasePackage,
    getMonthlyPackage,
    getAnnualPackage,
    getLifetimePackage,
    getAnnualSavings,
    isPurchasing,
    purchaseError,
    hasOfferings
  } = usePurchases();
  
  const { currentPlan, isSubscribed, subscriptionInfo } = useSubscriptionFeatures();

  const monthlyPackage = getMonthlyPackage();
  const annualPackage = getAnnualPackage();
  const lifetimePackage = getLifetimePackage();
  const annualSavings = getAnnualSavings();

  const handlePurchase = async (packageItem: PurchasesPackage) => {
    try {
      onPurchaseStart?.(packageItem);
      await purchasePackage(packageItem);
      onPurchaseComplete?.(packageItem);
    } catch (error) {
      onPurchaseError?.(error as Error, packageItem);
    }
  };

  if (!hasOfferings) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-center text-muted-foreground">
          Loading subscription plans...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        {/* Current Plan Status */}
        {showCurrentPlan && isSubscribed && (
          <View className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-semibold text-green-800 dark:text-green-200">
                  Current Plan: {currentPlan.toUpperCase()}
                </Text>
                {subscriptionInfo.expirationDate && (
                  <Text className="mt-1 text-sm text-green-600 dark:text-green-300">
                    {subscriptionInfo.willRenew ? 'Renews' : 'Expires'} on{' '}
                    {subscriptionInfo.expirationDate.toLocaleDateString()}
                  </Text>
                )}
              </View>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </View>
          </View>
        )}

        {/* Plans */}
        <View className="space-y-4">
          {/* Annual Plan */}
          {annualPackage && (
            <View className="relative rounded-lg border-2 border-primary bg-card p-6">
              {annualSavings && (
                <Badge 
                  className="absolute -top-2 left-4 bg-primary text-primary-foreground"
                >
                  Save {annualSavings.percentage}%
                </Badge>
              )}
              
              <View className="mb-4">
                <Text className="text-xl font-bold">Annual Plan</Text>
                <Text className="text-muted-foreground">
                  Best value for committed users
                </Text>
              </View>

              <View className="mb-4 flex-row items-baseline">
                <Text className="text-3xl font-bold">
                  {annualPackage.product.priceString}
                </Text>
                <Text className="ml-2 text-muted-foreground">/year</Text>
                {annualSavings && (
                  <Text className="ml-2 text-sm text-muted-foreground line-through">
                    {annualSavings.yearlyMonthlyCost.toFixed(2)}
                  </Text>
                )}
              </View>

              <View className="mb-6">
                <Text className="text-sm text-muted-foreground">
                  • Unlock all premium features
                </Text>
                <Text className="text-sm text-muted-foreground">
                  • Priority customer support
                </Text>
                <Text className="text-sm text-muted-foreground">
                  • Advanced analytics and insights
                </Text>
                {annualSavings && (
                  <Text className="text-sm font-medium text-green-600">
                    • Save ${annualSavings.amount.toFixed(2)} vs monthly
                  </Text>
                )}
              </View>

              <Button
                onPress={() => handlePurchase(annualPackage)}
                disabled={isPurchasing || (isSubscribed && currentPlan === 'premium')}
                className="w-full"
              >
                {isPurchasing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : isSubscribed && currentPlan === 'premium' ? (
                  'Current Plan'
                ) : (
                  'Choose Annual'
                )}
              </Button>
            </View>
          )}

          {/* Monthly Plan */}
          {monthlyPackage && (
            <View className="rounded-lg border bg-card p-6">
              <View className="mb-4">
                <Text className="text-xl font-bold">Monthly Plan</Text>
                <Text className="text-muted-foreground">
                  Flexible monthly billing
                </Text>
              </View>

              <View className="mb-4 flex-row items-baseline">
                <Text className="text-3xl font-bold">
                  {monthlyPackage.product.priceString}
                </Text>
                <Text className="ml-2 text-muted-foreground">/month</Text>
              </View>

              <View className="mb-6">
                <Text className="text-sm text-muted-foreground">
                  • Unlock all premium features
                </Text>
                <Text className="text-sm text-muted-foreground">
                  • Cancel anytime
                </Text>
                <Text className="text-sm text-muted-foreground">
                  • Standard customer support
                </Text>
              </View>

              <Button
                variant="outline"
                onPress={() => handlePurchase(monthlyPackage)}
                disabled={isPurchasing || (isSubscribed && currentPlan === 'pro')}
                className="w-full"
              >
                {isPurchasing ? (
                  <ActivityIndicator size="small" />
                ) : isSubscribed && currentPlan === 'pro' ? (
                  'Current Plan'
                ) : (
                  'Choose Monthly'
                )}
              </Button>
            </View>
          )}

          {/* Lifetime Plan */}
          {lifetimePackage && (
            <View className="rounded-lg border bg-card p-6">
              <View className="mb-4">
                <Text className="text-xl font-bold">Lifetime Access</Text>
                <Text className="text-muted-foreground">
                  One-time payment, lifetime access
                </Text>
              </View>

              <View className="mb-4 flex-row items-baseline">
                <Text className="text-3xl font-bold">
                  {lifetimePackage.product.priceString}
                </Text>
                <Text className="ml-2 text-muted-foreground">once</Text>
              </View>

              <View className="mb-6">
                <Text className="text-sm text-muted-foreground">
                  • All premium features forever
                </Text>
                <Text className="text-sm text-muted-foreground">
                  • No recurring payments
                </Text>
                <Text className="text-sm text-muted-foreground">
                  • Priority support included
                </Text>
                <Text className="text-sm text-muted-foreground">
                  • Future updates included
                </Text>
              </View>

              <Button
                variant="outline"
                onPress={() => handlePurchase(lifetimePackage)}
                disabled={isPurchasing}
                className="w-full"
              >
                {isPurchasing ? (
                  <ActivityIndicator size="small" />
                ) : (
                  'Buy Lifetime'
                )}
              </Button>
            </View>
          )}
        </View>

        {/* Error Display */}
        {purchaseError && !purchaseError.userCancelled && (
          <View className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <Text className="text-red-800 dark:text-red-200">
              Purchase failed: {purchaseError.message}
            </Text>
            {purchaseError.underlyingErrorMessage && (
              <Text className="mt-1 text-sm text-red-600 dark:text-red-300">
                {purchaseError.underlyingErrorMessage}
              </Text>
            )}
          </View>
        )}

        {/* Free Plan Info */}
        {!isSubscribed && (
          <View className="mt-6 rounded-lg bg-muted p-4">
            <Text className="font-medium">Free Plan</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              You're currently on the free plan with limited features.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}