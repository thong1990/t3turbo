import { useState, useCallback } from 'react';
import { useSubscription } from '../contexts/subscription-context';
import type { PurchasesPackage, PurchaseError, RestoreError } from '../types';

export function usePurchases() {
  const { 
    purchasePackage: contextPurchase,
    restorePurchases: contextRestore,
    offerings,
    status,
    error: contextError
  } = useSubscription();

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [purchaseError, setPurchaseError] = useState<PurchaseError | null>(null);
  const [restoreError, setRestoreError] = useState<RestoreError | null>(null);

  const purchasePackage = useCallback(async (packageItem: PurchasesPackage) => {
    if (isPurchasing) return;
    
    try {
      setIsPurchasing(true);
      setPurchaseError(null);
      
      const result = await contextPurchase(packageItem);
      
      // Success callback could be handled here
      return result;
    } catch (error) {
      const purchaseErr = error as PurchaseError;
      setPurchaseError(purchaseErr);
      
      // Don't throw if user cancelled
      if (!purchaseErr.userCancelled) {
        throw error;
      }
    } finally {
      setIsPurchasing(false);
    }
  }, [contextPurchase, isPurchasing]);

  const restorePurchases = useCallback(async () => {
    if (isRestoring) return;
    
    try {
      setIsRestoring(true);
      setRestoreError(null);
      
      const result = await contextRestore();
      return result;
    } catch (error) {
      const restoreErr = error as RestoreError;
      setRestoreError(restoreErr);
      throw error;
    } finally {
      setIsRestoring(false);
    }
  }, [contextRestore, isRestoring]);

  const getPackageByType = useCallback((packageType: string) => {
    if (!offerings?.current) return null;
    
    return offerings.current.availablePackages.find(
      pkg => pkg.packageType === packageType
    ) || null;
  }, [offerings]);

  const getPackageById = useCallback((identifier: string) => {
    if (!offerings?.current) return null;
    
    return offerings.current.availablePackages.find(
      pkg => pkg.identifier === identifier
    ) || null;
  }, [offerings]);

  const getAvailablePackages = useCallback(() => {
    return offerings?.current?.availablePackages || [];
  }, [offerings]);

  const getMonthlyPackage = useCallback(() => {
    return offerings?.current?.monthly || getPackageByType('MONTHLY');
  }, [offerings, getPackageByType]);

  const getAnnualPackage = useCallback(() => {
    return offerings?.current?.annual || getPackageByType('ANNUAL');
  }, [offerings, getPackageByType]);

  const getLifetimePackage = useCallback(() => {
    return offerings?.current?.lifetime || getPackageByType('LIFETIME');
  }, [offerings, getPackageByType]);

  // Calculate savings for annual vs monthly
  const getAnnualSavings = useCallback(() => {
    const monthly = getMonthlyPackage();
    const annual = getAnnualPackage();
    
    if (!monthly || !annual) return null;
    
    const monthlyYearlyPrice = monthly.product.price * 12;
    const annualPrice = annual.product.price;
    const savings = monthlyYearlyPrice - annualPrice;
    const savingsPercentage = Math.round((savings / monthlyYearlyPrice) * 100);
    
    return {
      amount: savings,
      percentage: savingsPercentage,
      monthlyCost: monthly.product.price,
      annualCost: annual.product.price,
      yearlyMonthlyCost: monthlyYearlyPrice
    };
  }, [getMonthlyPackage, getAnnualPackage]);

  const clearErrors = useCallback(() => {
    setPurchaseError(null);
    setRestoreError(null);
  }, []);

  return {
    // State
    isPurchasing,
    isRestoring,
    purchaseError,
    restoreError,
    offerings,
    subscriptionStatus: status,
    
    // Actions
    purchasePackage,
    restorePurchases,
    clearErrors,
    
    // Package utilities
    getPackageByType,
    getPackageById,
    getAvailablePackages,
    getMonthlyPackage,
    getAnnualPackage,
    getLifetimePackage,
    
    // Pricing utilities
    getAnnualSavings,
    
    // Convenience
    hasOfferings: !!offerings?.current,
    isSubscribed: status.isSubscribed,
    contextError
  };
}