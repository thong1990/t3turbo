import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Button } from '~/shared/components/ui/button';
import { Text } from '~/shared/components/ui/text';
import { usePaywall, type PaywallOptions } from '../hooks/use-paywall';
import { REVENUECAT_CONFIG } from '../config';
import { PaywallModal } from './paywall-modal';

interface PaywallButtonProps {
  title?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  disabled?: boolean;
  options?: PaywallOptions;
  presentationType?: 'modal' | 'native';
  onPurchaseComplete?: () => void;
  onPurchaseError?: (error: Error) => void;
}

export function PaywallButton({
  title = 'Upgrade',
  variant = 'default',
  className,
  disabled,
  options,
  presentationType = 'modal',
  onPurchaseComplete,
  onPurchaseError
}: PaywallButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { presentPaywall, isConfigured } = usePaywall();

  const handlePress = async () => {
    if (!isConfigured) {
      Alert.alert('Error', 'Subscription service is not available');
      return;
    }

    if (presentationType === 'native') {
      try {
        await presentPaywall(options);
      } catch (error) {
        console.error('Failed to present paywall:', error);
        onPurchaseError?.(error as Error);
      }
    } else {
      setShowModal(true);
    }
  };

  const handlePurchaseCompleted = () => {
    console.log('Purchase completed successfully');
    onPurchaseComplete?.();
    Alert.alert('Success', 'Subscription activated!');
  };

  const handlePurchaseError = ({ error }: { error: Error }) => {
    console.error('Purchase failed:', error);
    onPurchaseError?.(error);
    
    // Don't show alert for user cancellations
    if (!(error as any).userCancelled) {
      Alert.alert('Purchase Failed', error.message);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        className={className}
        disabled={disabled || !isConfigured}
        onPress={handlePress}
      >
        <Text>{title}</Text>
      </Button>

      {presentationType === 'modal' && (
        <PaywallModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          options={options}
          onPurchaseCompleted={handlePurchaseCompleted}
          onPurchaseError={handlePurchaseError}
          onPurchaseCancelled={() => console.log('Purchase cancelled')}
        />
      )}
    </>
  );
}

// Add displayName for better debugging
PaywallButton.displayName = 'PaywallButton';