import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Button } from '~/shared/components/ui/button';
import { Text } from '~/shared/components/ui/text';
import { usePurchases, useSubscriptionFeatures } from '../hooks';
import type { PurchasesPackage } from '../types';

interface PurchaseButtonProps {
  packageItem: PurchasesPackage;
  onPurchaseStart?: (packageItem: PurchasesPackage) => void;
  onPurchaseComplete?: (packageItem: PurchasesPackage) => void;
  onPurchaseError?: (error: Error, packageItem: PurchasesPackage) => void;
  variant?: 'primary' | 'muted' | 'tonal' | 'outline' | 'ghost' | 'destructive' | 'link' | 'plain';
  size?: 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function PurchaseButton({
  packageItem,
  onPurchaseStart,
  onPurchaseComplete,
  onPurchaseError,
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  className
}: PurchaseButtonProps) {
  const { purchasePackage, isPurchasing, purchaseError } = usePurchases();
  const { isSubscribed, currentPlan } = useSubscriptionFeatures();

  const handlePurchase = async () => {
    try {
      onPurchaseStart?.(packageItem);
      await purchasePackage(packageItem);
      onPurchaseComplete?.(packageItem);
    } catch (error) {
      onPurchaseError?.(error as Error, packageItem);
    }
  };

  // Determine if this package represents the current subscription
  const isCurrentSubscription = isSubscribed && (
    (packageItem.packageType === 'ANNUAL' && currentPlan === 'premium') ||
    (packageItem.packageType === 'MONTHLY' && currentPlan === 'pro') ||
    (packageItem.packageType === 'LIFETIME' && currentPlan === 'premium')
  );

  const getButtonText = () => {
    if (children) return children;
    
    if (isPurchasing) return null; // Show loading indicator
    
    if (isCurrentSubscription) return 'Current Plan';
    
    // Default text based on package type
    switch (packageItem.packageType) {
      case 'ANNUAL':
        return `Subscribe ${packageItem.product.priceString}/year`;
      case 'MONTHLY':
        return `Subscribe ${packageItem.product.priceString}/month`;
      case 'LIFETIME':
        return `Buy ${packageItem.product.priceString}`;
      default:
        return `Purchase ${packageItem.product.priceString}`;
    }
  };

  const isDisabled = disabled || isPurchasing || isCurrentSubscription;

  return (
    <Button
      variant={variant}
      size={size}
      onPress={handlePurchase}
      disabled={isDisabled}
      className={className}
    >
      {isPurchasing ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? undefined : 'white'} 
        />
      ) : (
        <Text className={`
          ${variant === 'outline' ? 'text-foreground' : 'text-primary-foreground'}
          ${isCurrentSubscription ? 'opacity-60' : ''}
        `}>
          {getButtonText()}
        </Text>
      )}
    </Button>
  );
}