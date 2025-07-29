import React from 'react'
import { View, Text, Alert } from 'react-native'
import { Button } from '~/shared/components/ui/button'
import Purchases, { type PurchasesOffering } from 'react-native-purchases'

interface PaywallComponentProps {
  offering?: PurchasesOffering
  onDismiss: () => void
}

export function PaywallComponent({ offering, onDismiss }: PaywallComponentProps) {

  const handlePurchase = async () => {
    const success = true
    if (success) {
      onDismiss()
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Upgrade to Pro
      </Text>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 30 }}>
        Get access to premium features and remove ads
      </Text>
      <Button onPress={handlePurchase} className="w-full mb-4">
        <Text>Subscribe Now</Text>
      </Button>
      <Button variant="outline" onPress={onDismiss} className="w-full">
        <Text>Cancel</Text>
      </Button>
    </View>
  )
}