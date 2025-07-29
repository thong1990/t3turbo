import React from 'react';
import { Modal } from 'react-native';
import { View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { usePaywall, type PaywallOptions, type PaywallCallbacks } from '../hooks/use-paywall';

interface PaywallModalProps extends PaywallCallbacks {
  visible: boolean;
  onClose: () => void;
  options?: PaywallOptions;
}

export function PaywallModal({
  visible,
  onClose,
  options,
  onPurchaseStarted,
  onPurchaseCompleted,
  onPurchaseError,
  onPurchaseCancelled,
  onRestoreStarted,
  onRestoreCompleted,
  onRestoreError
}: PaywallModalProps) {
  const { getPaywallProps, isConfigured } = usePaywall();

  const handleDismiss = () => {
    onClose();
  };

  const handlePurchaseCompleted = (params: { customerInfo: any; storeTransaction: any }) => {
    onPurchaseCompleted?.(params);
    onClose(); // Auto-close modal on successful purchase
  };

  if (!isConfigured) {
    return null;
  }

  const paywallProps = getPaywallProps({
    onPurchaseStarted,
    onPurchaseCompleted: handlePurchaseCompleted,
    onPurchaseError,
    onPurchaseCancelled,
    onRestoreStarted,
    onRestoreCompleted,
    onRestoreError,
    onDismiss: handleDismiss
  }, options);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <RevenueCatUI.Paywall {...paywallProps} />
      </View>
    </Modal>
  );
}

// Add displayName for better debugging
PaywallModal.displayName = 'PaywallModal';