import React from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { Button } from '~/shared/components/ui/button';
import { Text } from '~/shared/components/ui/text';
import { usePurchases } from '../hooks';

interface RestorePurchasesButtonProps {
  onRestoreStart?: () => void;
  onRestoreComplete?: () => void;
  onRestoreError?: (error: Error) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  showSuccessAlert?: boolean;
  showErrorAlert?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function RestorePurchasesButton({
  onRestoreStart,
  onRestoreComplete,
  onRestoreError,
  variant = 'outline',
  size = 'default',
  disabled = false,
  showSuccessAlert = true,
  showErrorAlert = true,
  className,
  children
}: RestorePurchasesButtonProps) {
  const { restorePurchases, isRestoring, restoreError } = usePurchases();

  const handleRestore = async () => {
    try {
      onRestoreStart?.();
      
      const customerInfo = await restorePurchases();
      
      onRestoreComplete?.();
      
      if (showSuccessAlert) {
        const hasActiveSubscriptions = customerInfo.activeSubscriptions.length > 0;
        
        Alert.alert(
          'Restore Complete',
          hasActiveSubscriptions 
            ? 'Your purchases have been restored successfully!'
            : 'No active purchases found to restore.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      onRestoreError?.(error as Error);
      
      if (showErrorAlert) {
        Alert.alert(
          'Restore Failed',
          'Failed to restore purchases. Please try again or contact support if the problem persists.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onPress={handleRestore}
      disabled={disabled || isRestoring}
      className={className}
    >
      {isRestoring ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? undefined : 'white'} 
        />
      ) : (
        <Text className={variant === 'outline' ? 'text-foreground' : 'text-primary-foreground'}>
          {children || 'Restore Purchases'}
        </Text>
      )}
    </Button>
  );
}