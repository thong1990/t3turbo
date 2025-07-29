import React from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from '~/shared/components/ui/text';
import { Button } from '~/shared/components/ui/button';
import { 
  SubscriptionPlans,
  SubscriptionStatus,
  RestorePurchasesButton,
  FeatureGate,
  PaywallButton,
  useSubscriptionFeatures,
  useSubscription 
} from '~/features/subscriptions';
import { useUser } from '~/features/supabase/hooks';
import { getRevenueCatMode, isRevenueCatProductionMode } from '~/shared/config/revenuecat';

export default function SubscriptionTestScreen() {
  const { data: user } = useUser();
  const { status, error, isConfigured } = useSubscription();
  const { currentPlan, hasFeature } = useSubscriptionFeatures();
  
  const revenueCatMode = getRevenueCatMode();
  const isProductionMode = isRevenueCatProductionMode();

  return (
    <>
      <Stack.Screen options={{ title: 'Subscription Test', headerShown: true }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 space-y-6">
          {/* Configuration Status */}
          <View className="rounded-lg border p-4">
            <Text className="text-lg font-semibold mb-2">System Status</Text>
            <Text className="text-sm mb-1">
              User Authenticated: {user ? '✅ Yes' : '❌ No'}
            </Text>
            {user && (
              <Text className="text-sm mb-1">
                User ID: {user.id}
              </Text>
            )}
            <Text className="text-sm mb-1">
              RevenueCat Configured: {isConfigured ? '✅ Yes' : '❌ No'}
            </Text>
            <Text className="text-sm mb-1">
              Mode: {isProductionMode ? '🟢 Production' : '🟡 Preview/Sandbox'}
            </Text>
            <Text className="text-sm mb-1">
              Current Plan: {currentPlan.toUpperCase()}
            </Text>
            <Text className="text-sm mb-1">
              Is Subscribed: {status.isSubscribed ? '✅ Yes' : '❌ No'}
            </Text>
            {error && (
              <Text className="text-sm text-red-600 mt-2">
                Error: {error.message}
              </Text>
            )}
          </View>

          {/* Feature Testing */}
          <View className="rounded-lg border p-4">
            <Text className="text-lg font-semibold mb-2">Feature Access Test</Text>
            <Text className="text-sm mb-1">
              Basic Access: {hasFeature('basicAccess') ? '✅' : '❌'}
            </Text>
            <Text className="text-sm mb-1">
              Advanced Filters: {hasFeature('advancedFilters') ? '✅' : '❌'}
            </Text>
            <Text className="text-sm mb-1">
              Premium Support: {hasFeature('premiumSupport') ? '✅' : '❌'}
            </Text>
            <Text className="text-sm mb-1">
              Analytics: {hasFeature('analytics') ? '✅' : '❌'}
            </Text>
          </View>

          {/* Feature Gate Example */}
          <View className="rounded-lg border p-4">
            <Text className="text-lg font-semibold mb-2">Feature Gate Demo</Text>
            <FeatureGate 
              feature="premiumSupport"
              onUpgradePress={(plan) => Alert.alert('Upgrade', `Upgrade to ${plan} plan`)}
            >
              <View className="rounded-lg bg-green-50 p-4">
                <Text className="text-green-800 font-medium">
                  🎉 Premium Support Unlocked!
                </Text>
                <Text className="text-green-600 text-sm mt-1">
                  You have access to priority customer support.
                </Text>
              </View>
            </FeatureGate>
          </View>

          {/* Subscription Status */}
          <View className="rounded-lg border p-4">
            <Text className="text-lg font-semibold mb-2">Subscription Status</Text>
            <SubscriptionStatus />
          </View>

          {/* Restore Purchases */}
          <View className="rounded-lg border p-4">
            <Text className="text-lg font-semibold mb-2">Restore Purchases</Text>
            <RestorePurchasesButton 
              onRestoreComplete={() => Alert.alert('Success', 'Purchases restored!')}
              onRestoreError={(error) => Alert.alert('Error', error.message)}
            />
          </View>

          {/* RevenueCat Dashboard Paywall */}
          <View className="rounded-lg border p-4">
            <Text className="text-lg font-semibold mb-2">RevenueCat Dashboard Paywall</Text>
            
            {!isProductionMode ? (
              <View className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 mb-4">
                <Text className="text-yellow-800 font-medium text-sm mb-1">
                  ⚠️ Preview Mode Active
                </Text>
                <Text className="text-yellow-700 text-xs mb-2">
                  Paywall UI will return "NOT_PRESENTED" in preview mode.
                </Text>
                <Text className="text-yellow-700 text-xs">
                  To enable production mode:
                  {'\n'}• Get production API keys from RevenueCat dashboard
                  {'\n'}• Update environment variables
                  {'\n'}• Ensure offerings are published
                </Text>
              </View>
            ) : (
              <Text className="text-sm text-muted-foreground mb-4">
                ✅ Production mode - paywall will display your custom design.
              </Text>
            )}
            
            <View className="space-y-2">
              <PaywallButton
                title={isProductionMode ? "Open Paywall (Modal)" : "Test Modal (Preview Mode)"}
                className="w-full"
                presentationType="modal"
                onPurchaseComplete={() => Alert.alert('Success', 'Purchased via dashboard paywall!')}
              />
              <PaywallButton
                title={isProductionMode ? "Open Paywall (Native)" : "Test Native (Preview Mode)"}
                variant="outline"
                className="w-full"
                presentationType="native"
                onPurchaseComplete={() => Alert.alert('Success', 'Purchased via native paywall!')}
              />
            </View>
          </View>

          {/* Custom Subscription Plans */}
          <View className="rounded-lg border p-4">
            <Text className="text-lg font-semibold mb-2">Custom Plans Component</Text>
            <Text className="text-sm text-muted-foreground mb-4">
              Custom-built subscription plans component (alternative to RevenueCat paywall).
            </Text>
            <SubscriptionPlans 
              onPurchaseStart={(pkg) => console.log('Purchase started:', pkg.identifier)}
              onPurchaseComplete={(pkg) => Alert.alert('Success', `Purchased ${pkg.identifier}!`)}
              onPurchaseError={(error, pkg) => Alert.alert('Error', `Failed to purchase ${pkg.identifier}: ${error.message}`)}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}