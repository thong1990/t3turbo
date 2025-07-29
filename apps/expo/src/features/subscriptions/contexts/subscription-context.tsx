import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import Purchases, { 
  PurchasesOfferings, 
  PurchasesCustomerInfo, 
  PurchasesPackage,
  LOG_LEVEL 
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { useUser } from '~/features/supabase/hooks';
import type { 
  SubscriptionContextValue, 
  SubscriptionStatus, 
  PurchaseError,
  RestoreError 
} from '../types';

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

interface SubscriptionProviderProps {
  children: ReactNode;
  apiKey?: string;
  userId?: string; // Optional - will auto-detect from useUser() if not provided
  enableDebugLogs?: boolean;
}

export function SubscriptionProvider({ 
  children, 
  apiKey,
  userId: propUserId,
  enableDebugLogs = __DEV__ 
}: SubscriptionProviderProps) {
  const { data: user } = useUser();
  const [customerInfo, setCustomerInfo] = useState<PurchasesCustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use prop userId first, then fall back to authenticated user ID
  const userId = propUserId || user?.id;

  // Configure RevenueCat on mount
  const configureRevenueCat = useCallback(async (rcApiKey?: string, rcUserId?: string) => {
    try {
      setError(null);
      
      const key = rcApiKey || apiKey;
      if (!key) {
        throw new Error('RevenueCat API key is required');
      }

      // Set log level for debugging
      if (enableDebugLogs) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      // Configure with API key
      await Purchases.configure({ apiKey: key });
      
      // Set user ID if provided
      if (rcUserId || userId) {
        await Purchases.logIn(rcUserId || userId!);
      }

      setIsConfigured(true);
      
      // Load initial data
      await Promise.all([
        loadCustomerInfo(),
        loadOfferings()
      ]);
      
    } catch (err) {
      const error = err as Error;
      console.error('Failed to configure RevenueCat:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, userId, enableDebugLogs]);

  // Load customer info
  const loadCustomerInfo = useCallback(async (): Promise<PurchasesCustomerInfo> => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      return info;
    } catch (err) {
      const error = err as Error;
      console.error('Failed to load customer info:', error);
      setError(error);
      throw error;
    }
  }, []);

  // Load offerings
  const loadOfferings = useCallback(async (): Promise<PurchasesOfferings> => {
    try {
      const offers = await Purchases.getOfferings();
      setOfferings(offers);
      return offers;
    } catch (err) {
      const error = err as Error;
      console.error('Failed to load offerings:', error);
      setError(error);
      throw error;
    }
  }, []);

  // Purchase package
  const purchasePackage = useCallback(async (packageItem: PurchasesPackage) => {
    try {
      setError(null);
      const result = await Purchases.purchasePackage(packageItem);
      setCustomerInfo(result.customerInfo);
      return result;
    } catch (err) {
      const error: PurchaseError = {
        ...err as Error,
        code: (err as any).code || 'PURCHASE_ERROR',
        userCancelled: (err as any).userCancelled || false
      };
      console.error('Purchase failed:', error);
      setError(error);
      throw error;
    }
  }, []);

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<PurchasesCustomerInfo> => {
    try {
      setError(null);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return info;
    } catch (err) {
      const error: RestoreError = {
        ...err as Error,
        code: (err as any).code || 'RESTORE_ERROR'
      };
      console.error('Restore failed:', error);
      setError(error);
      throw error;
    }
  }, []);

  // Set user ID
  const setUserId = useCallback(async (newUserId: string): Promise<PurchasesCustomerInfo> => {
    try {
      setError(null);
      const result = await Purchases.logIn(newUserId);
      setCustomerInfo(result.customerInfo);
      return result.customerInfo;
    } catch (err) {
      const error = err as Error;
      console.error('Failed to set user ID:', error);
      setError(error);
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async (): Promise<PurchasesCustomerInfo> => {
    try {
      setError(null);
      const result = await Purchases.logOut();
      setCustomerInfo(result.customerInfo);
      return result.customerInfo;
    } catch (err) {
      const error = err as Error;
      console.error('Failed to logout:', error);
      setError(error);
      throw error;
    }
  }, []);

  // Get subscription status
  const getSubscriptionStatus = useCallback((): SubscriptionStatus => {
    if (!customerInfo) {
      return {
        isSubscribed: false,
        isLoading: true,
        activeEntitlements: [],
        willRenew: false
      };
    }

    const activeEntitlements = Object.keys(customerInfo.entitlements.active);
    const isSubscribed = activeEntitlements.length > 0;
    
    // Get the latest expiration date and renewal status
    let latestExpirationDate: Date | undefined;
    let willRenew = false;
    let managementURL = customerInfo.managementURL;

    if (isSubscribed) {
      const activeEntitlementInfos = Object.values(customerInfo.entitlements.active);
      const latestEntitlement = activeEntitlementInfos.reduce((latest, current) => {
        const currentExpiration = current.expirationDate ? new Date(current.expirationDate) : new Date(0);
        const latestExpiration = latest.expirationDate ? new Date(latest.expirationDate) : new Date(0);
        return currentExpiration > latestExpiration ? current : latest;
      });

      if (latestEntitlement.expirationDate) {
        latestExpirationDate = new Date(latestEntitlement.expirationDate);
      }
      willRenew = latestEntitlement.willRenew;
    }

    return {
      isSubscribed,
      isLoading: false,
      activeEntitlements,
      expirationDate: latestExpirationDate,
      willRenew,
      managementURL
    };
  }, [customerInfo]);

  const checkSubscriptionStatus = useCallback(async (): Promise<SubscriptionStatus> => {
    await loadCustomerInfo();
    return getSubscriptionStatus();
  }, [loadCustomerInfo, getSubscriptionStatus]);

  // Initialize on mount
  useEffect(() => {
    if (apiKey) {
      configureRevenueCat();
    }
  }, [configureRevenueCat]);

  // Handle user authentication changes
  useEffect(() => {
    if (!isConfigured) return;

    const handleUserAuth = async () => {
      try {
        if (userId) {
          // User logged in - set RevenueCat user ID
          console.log('RevenueCat: User logged in, setting user ID:', userId);
          await Purchases.logIn(userId);
          // Refresh customer info after login
          await loadCustomerInfo();
        } else {
          // User logged out - switch to anonymous
          console.log('RevenueCat: User logged out, switching to anonymous');
          await Purchases.logOut();
          // Clear customer info after logout
          setCustomerInfo(null);
        }
      } catch (error) {
        console.error('RevenueCat: Failed to handle user auth change:', error);
        setError(error as Error);
      }
    };

    handleUserAuth();
  }, [userId, isConfigured, loadCustomerInfo]);

  // Set up customer info updates listener
  useEffect(() => {
    if (!isConfigured) return;

    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
    });

    return () => {
      listener.remove();
    };
  }, [isConfigured]);

  const contextValue: SubscriptionContextValue = {
    // State
    customerInfo,
    offerings,
    status: getSubscriptionStatus(),
    isConfigured,
    error,

    // Actions
    purchasePackage,
    restorePurchases,
    getCustomerInfo: loadCustomerInfo,
    refreshOfferings: loadOfferings,
    checkSubscriptionStatus,

    // Configuration
    configureRevenueCat,
    setUserId,
    logout
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export { SubscriptionContext };