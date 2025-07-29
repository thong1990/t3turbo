import React from 'react';
import { View, Linking } from 'react-native';
import { Text } from '~/shared/components/ui/text';
import { Button } from '~/shared/components/ui/button';
import { Badge } from '~/shared/components/ui/badge';
import { useSubscriptionFeatures } from '../hooks';

interface SubscriptionStatusProps {
  showManagementButton?: boolean;
  showExpirationWarning?: boolean;
  warningDaysThreshold?: number;
  className?: string;
}

export function SubscriptionStatus({
  showManagementButton = true,
  showExpirationWarning = true,
  warningDaysThreshold = 7,
  className
}: SubscriptionStatusProps) {
  const { subscriptionInfo, currentPlan, isSubscribed } = useSubscriptionFeatures();

  const handleManageSubscription = async () => {
    if (subscriptionInfo.managementURL) {
      try {
        const supported = await Linking.canOpenURL(subscriptionInfo.managementURL);
        if (supported) {
          await Linking.openURL(subscriptionInfo.managementURL);
        }
      } catch (error) {
        console.error('Failed to open management URL:', error);
      }
    }
  };

  const getStatusBadgeVariant = () => {
    if (!isSubscribed) return 'secondary';
    
    const daysUntilExpiration = subscriptionInfo.daysUntilExpiration;
    if (daysUntilExpiration !== null && daysUntilExpiration <= warningDaysThreshold) {
      return 'destructive';
    }
    
    return subscriptionInfo.willRenew ? 'default' : 'secondary';
  };

  const getStatusText = () => {
    if (!isSubscribed) return 'Free Plan';
    
    const planName = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
    
    if (!subscriptionInfo.expirationDate) {
      return `${planName} Plan`;
    }
    
    const daysUntilExpiration = subscriptionInfo.daysUntilExpiration;
    if (daysUntilExpiration !== null && daysUntilExpiration <= 0) {
      return 'Expired';
    }
    
    return subscriptionInfo.willRenew ? `${planName} Plan` : `${planName} Plan (Cancelled)`;
  };

  const shouldShowExpirationWarning = 
    showExpirationWarning && 
    isSubscribed && 
    subscriptionInfo.daysUntilExpiration !== null && 
    subscriptionInfo.daysUntilExpiration <= warningDaysThreshold;

  return (
    <View className={`space-y-3 ${className}`}>
      {/* Status Badge */}
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-medium">Subscription Status</Text>
        <Badge variant={getStatusBadgeVariant()}>
          {getStatusText()}
        </Badge>
      </View>

      {/* Subscription Details */}
      {isSubscribed && subscriptionInfo.expirationDate && (
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted-foreground">
              {subscriptionInfo.willRenew ? 'Next renewal' : 'Expires'}
            </Text>
            <Text className="text-sm">
              {subscriptionInfo.expirationDate.toLocaleDateString()}
            </Text>
          </View>
          
          {subscriptionInfo.daysUntilExpiration !== null && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Days remaining</Text>
              <Text className="text-sm">
                {Math.max(0, subscriptionInfo.daysUntilExpiration)} days
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Expiration Warning */}
      {shouldShowExpirationWarning && (
        <View className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
          <Text className="text-sm font-medium text-orange-800 dark:text-orange-200">
            Subscription {subscriptionInfo.willRenew ? 'Renewal' : 'Expiration'} Notice
          </Text>
          <Text className="mt-1 text-sm text-orange-600 dark:text-orange-300">
            Your subscription {subscriptionInfo.willRenew ? 'will renew' : 'expires'} in{' '}
            {subscriptionInfo.daysUntilExpiration} {subscriptionInfo.daysUntilExpiration === 1 ? 'day' : 'days'}.
            {!subscriptionInfo.willRenew && ' Renew now to continue enjoying premium features.'}
          </Text>
        </View>
      )}

      {/* Management Button */}
      {showManagementButton && subscriptionInfo.managementURL && isSubscribed && (
        <Button
          variant="outline"
          size="sm"
          onPress={handleManageSubscription}
          className="self-start"
        >
          <Text>Manage Subscription</Text>
        </Button>
      )}

      {/* Free Plan Message */}
      {!isSubscribed && (
        <View className="rounded-lg bg-muted p-3">
          <Text className="text-sm text-muted-foreground">
            You're currently on the free plan. Upgrade to unlock premium features and remove limitations.
          </Text>
        </View>
      )}
    </View>
  );
}