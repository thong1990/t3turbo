import React, { useEffect } from "react";
import { Button, Text, View } from "react-native";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import Purchases from "react-native-purchases";

export default function Index() {
  useEffect(() => {
    const showCustomPaywall = async () => {
      try {
        const paywallResult = await RevenueCatUI.presentPaywall({
          requiredEntitlementIdentifier: "premium"
        });

        if (paywallResult === PAYWALL_RESULT.PURCHASED || 
            paywallResult === PAYWALL_RESULT.RESTORED) {
          console.log("✅ User has access to Premium features");
          // Handle successful purchase or restore here
        }
      } catch (error) {
        console.error("❌ Error presenting paywall:", error);
        
        // Fallback to offering-based approach if direct approach fails
        try {
          console.log("🔄 Trying fallback offering-based approach...");
          const offerings = await Purchases.getOfferings();
          
          if (offerings.current) {
            const fallbackResult = await RevenueCatUI.presentPaywall({
              offering: offerings.current,
              displayCloseButton: true
            });
            
            if (fallbackResult === PAYWALL_RESULT.PURCHASED || 
                fallbackResult === PAYWALL_RESULT.RESTORED) {
              console.log("✅ User has access to Premium features (fallback)");
            }
          } else {
            // Final fallback - basic paywall
            await RevenueCatUI.presentPaywall({
              displayCloseButton: true
            });
          }
        } catch (fallbackError) {
          console.error("❌ Fallback paywall also failed:", fallbackError);
        }
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
        title="🎨 Show Custom Paywall" 
        onPress={async () => {
          try {
            console.log("🎨 Showing custom paywall template...");
            
            // Use direct paywall ID approach (confirmed working with custom template)
            const paywallResult = await RevenueCatUI.presentPaywall({
              paywallIdentifier: "default",
              displayCloseButton: true
            });

            if (paywallResult === PAYWALL_RESULT.PURCHASED || 
                paywallResult === PAYWALL_RESULT.RESTORED) {
              console.log("✅ User has access to Premium features");
              // Handle successful purchase or restore here
            }
          } catch (error) {
            console.error("❌ Error presenting paywall:", error);
            
            // Fallback to offering-based approach if direct approach fails
            try {
              console.log("🔄 Trying fallback offering-based approach...");
              const offerings = await Purchases.getOfferings();
              
              if (offerings.current) {
                const fallbackResult = await RevenueCatUI.presentPaywall({
                  offering: offerings.current,
                  displayCloseButton: true
                });
                
                if (fallbackResult === PAYWALL_RESULT.PURCHASED || 
                    fallbackResult === PAYWALL_RESULT.RESTORED) {
                  console.log("✅ User has access to Premium features (fallback)");
                }
              } else {
                // Final fallback - basic paywall
                await RevenueCatUI.presentPaywall({
                  displayCloseButton: true
                });
              }
            } catch (fallbackError) {
              console.error("❌ Fallback paywall also failed:", fallbackError);
            }
          }
        }}
      />
    </View>
  );
}