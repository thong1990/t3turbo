import { useCallback } from 'react';
import RevenueCatUI from 'react-native-purchases-ui';
import { useSubscription } from '../contexts/subscription-context';

export interface PaywallOptions {
  requiredEntitlementIdentifier?: string;
  offering?: string | null;
  displayCloseButton?: boolean;
  fontFamily?: string | null;
}

export interface PaywallCallbacks {
  onPurchaseStarted?: (params: { packageBeingPurchased: any }) => void;
  onPurchaseCompleted?: (params: { customerInfo: any; storeTransaction: any }) => void;
  onPurchaseError?: (params: { error: Error }) => void;
  onPurchaseCancelled?: () => void;
  onRestoreStarted?: () => void;
  onRestoreCompleted?: (params: { customerInfo: any }) => void;
  onRestoreError?: (params: { error: Error }) => void;
  onDismiss?: () => void;
}

export function usePaywall() {
  const { offerings, isConfigured } = useSubscription();

  const presentPaywall = useCallback(async (options?: PaywallOptions) => {
    if (!isConfigured) {
      throw new Error('RevenueCat is not configured');
    }

    try {
      if (options?.requiredEntitlementIdentifier) {
        // Present paywall only if user doesn't have the required entitlement
        return await RevenueCatUI.presentPaywallIfNeeded({
          requiredEntitlementIdentifier: options.requiredEntitlementIdentifier,
          displayCloseButton: options.displayCloseButton ?? true
        });
      } else {
        // Present paywall with optional offering
        return await RevenueCatUI.presentPaywall({
          displayCloseButton: options?.displayCloseButton ?? true,
          offering: options?.offering ?? null
        });
      }
    } catch (error) {
      console.error('Failed to present paywall:', error);
      throw error;
    }
  }, [isConfigured]);

  const getPaywallProps = useCallback((callbacks?: PaywallCallbacks, options?: PaywallOptions) => {
    return {
      options: {
        displayCloseButton: options?.displayCloseButton ?? true,
        offering: options?.offering ?? null,
        fontFamily: options?.fontFamily ?? null
      },
      onPurchaseStarted: callbacks?.onPurchaseStarted,
      onPurchaseCompleted: callbacks?.onPurchaseCompleted,
      onPurchaseError: callbacks?.onPurchaseError,
      onPurchaseCancelled: callbacks?.onPurchaseCancelled,
      onRestoreStarted: callbacks?.onRestoreStarted,
      onRestoreCompleted: callbacks?.onRestoreCompleted,
      onRestoreError: callbacks?.onRestoreError,
      onDismiss: callbacks?.onDismiss
    };
  }, []);

  const getDefaultOffering = useCallback(() => {
    return offerings?.current || null;
  }, [offerings]);

  const getOfferingById = useCallback((offeringId: string) => {
    return offerings?.all[offeringId] || null;
  }, [offerings]);

  return {
    // Actions
    presentPaywall,
    getPaywallProps,
    
    // Data
    offerings,
    getDefaultOffering,
    getOfferingById,
    
    // State
    isConfigured,
    hasOfferings: !!offerings?.current
  };
}