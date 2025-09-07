import React, { useEffect } from "react";
import { Button, Text, View } from "react-native";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import Purchases from "react-native-purchases";

export default function Index() {
  useEffect(() => {
    const showCustomPaywall = async () => {
      try {
        // Get offerings to use custom paywall template
        const offerings = await Purchases.getOfferings();
        
        if (offerings.current) {
          console.log("🎨 Showing custom paywall template for offering:", offerings.current.identifier);
          
          // Show custom paywall template linked to current offering
          const paywallResult = await RevenueCatUI.presentPaywall({
            offering: offerings.current,
            displayCloseButton: true
          });

          if (paywallResult === PAYWALL_RESULT.PURCHASED || 
              paywallResult === PAYWALL_RESULT.RESTORED) {
            console.log("✅ User has access to Premium features");
            // Handle successful purchase or restore here
          }
        } else {
          console.warn("⚠️ No current offering found - showing default paywall");
          // Fallback to basic paywall if no offering configured
          await RevenueCatUI.presentPaywall({
            displayCloseButton: true
          });
        }
      } catch (error) {
        console.error("❌ Error presenting paywall:", error);
      }
    };

    showCustomPaywall();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ marginBottom: 20 }}>RevenueCat Custom Paywall</Text>
      <Button 
        title="Show Custom Paywall" 
        onPress={async () => {
          try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current) {
              console.log("🎨 Button: Showing custom paywall template");
              await RevenueCatUI.presentPaywall({
                offering: offerings.current,
                displayCloseButton: true
              });
            } else {
              console.log("🎨 Button: Showing default paywall");
              await RevenueCatUI.presentPaywall({
                displayCloseButton: true
              });
            }
          } catch (error) {
            console.error("❌ Button paywall error:", error);
          }
        }}
      />
    </View>
  );
}