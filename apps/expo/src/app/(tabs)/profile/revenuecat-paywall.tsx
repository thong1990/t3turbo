import { useEffect } from "react";
import { Button, Text, View } from "react-native";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

export default function Index() {
  useEffect(() => {
    const checkPaywall = async () => {
      try {
        const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
          requiredEntitlementIdentifier: "Premium"
        });

        if (paywallResult === PAYWALL_RESULT.PURCHASED || 
            paywallResult === PAYWALL_RESULT.RESTORED) {
          console.log("User has access to pro features");
          // Handle successful purchase or restore here
        }
      } catch (error) {
        console.error("Error presenting paywall:", error);
      }
    };

    checkPaywall();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ marginBottom: 20 }}>RevenueCat Paywall Example</Text>
      <Button 
        title="Show Paywall" 
        onPress={() => RevenueCatUI.presentPaywallIfNeeded({
          requiredEntitlementIdentifier: "Premium"
        })}
      />
    </View>
  );
}