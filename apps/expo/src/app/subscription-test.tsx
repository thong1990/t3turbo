import React, { useState } from 'react';
import { ScrollView, View, Alert, Platform, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from '~/shared/components/ui/text';
import { Button } from '~/shared/components/ui/button';
import { 
  SubscriptionPlans,
  SubscriptionStatus,
  RestorePurchasesButton,
  FeatureGate,
  PaywallButton,
  useSubscriptionFeatures,
  useSubscription 
} from '~/features/subscriptions';
import { useUser } from '~/features/supabase/hooks';
import { getRevenueCatMode, isRevenueCatProductionMode } from '~/shared/config/revenuecat';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import env from '~/shared/env';

export default function SubscriptionTestScreen() {
  const { data: user } = useUser();
  const { status, error, isConfigured } = useSubscription();
  const { currentPlan, hasFeature } = useSubscriptionFeatures();
  
  const revenueCatMode = getRevenueCatMode();
  const isProductionMode = isRevenueCatProductionMode();
  
  // Test method state
  const [lastResult, setLastResult] = useState<string>('No method called yet');
  const [showModalPaywall, setShowModalPaywall] = useState(false);
  
  const getPlatformInfo = (): string => {
    if (Platform.OS === 'web') {
      return 'Browser';
    } else if (Constants.executionEnvironment === 'storeClient') {
      return Platform.OS === 'ios' ? 'Expo Go iOS' : 'Expo Go Android';
    } else {
      return Platform.OS === 'ios' ? 'Native iOS' : 'Native Android';
    }
  };
  
  const formatResult = (methodName: string, result: any, error?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    if (error) {
      return `[${timestamp}] ${methodName} ERROR:\n${JSON.stringify(error, null, 2)}`;
    }
    return `[${timestamp}] ${methodName} SUCCESS:\n${JSON.stringify(result, null, 2)}`;
  };
  
  const callMethod = async (methodName: string, method: () => Promise<any>) => {
    try {
      setLastResult(`[${new Date().toLocaleTimeString()}] Calling ${methodName}...`);
      const result = await method();
      setLastResult(formatResult(methodName, result));
    } catch (error) {
      setLastResult(formatResult(methodName, null, error));
    }
  };

  const runAllTests = async () => {
    const timestamp = new Date().toISOString();
    let report = `=== REVENUECAT SDK DIAGNOSTIC REPORT ===\n`;
    report += `Timestamp: ${timestamp}\n`;
    report += `Platform: ${getPlatformInfo()}\n`;
    report += `SDK Version: react-native-purchases ^9.1.0\n`;
    
    // Environment info
    const apiKey = Platform.OS === 'ios' 
      ? env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
      : env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;
    report += `API Key: ${apiKey ? `${apiKey.substring(0, 6)}***[MASKED]***` : 'NOT SET'}\n`;
    report += `Mode: ${isProductionMode ? 'PRODUCTION' : 'SANDBOX/PREVIEW'}\n`;
    report += `User: ${user ? user.id : 'NOT AUTHENTICATED'}\n`;
    report += `─────────────────────────────────────────────────────────────────\n\n`;

    const tests = [
      // CRITICAL: Basic SDK Status
      { name: '🔧 isConfigured', method: () => Purchases.isConfigured(), critical: true },
      { name: '💳 canMakePayments', method: () => Purchases.canMakePayments(), critical: true },
      
      // ESSENTIAL: User & Account
      { name: '👤 getAppUserID', method: () => Purchases.getAppUserID(), critical: true },
      { name: '🔒 isAnonymous', method: () => Purchases.isAnonymous(), critical: false },
      { name: '📱 getStorefront', method: () => Purchases.getStorefront(), critical: false },
      
      // CRITICAL: Customer & Subscriptions  
      { name: '👥 getCustomerInfo', method: () => Purchases.getCustomerInfo(), critical: true },
      { name: '🛍️ getOfferings', method: () => Purchases.getOfferings(), critical: true },
      
      // OPTIONAL: Sync & Cache
      { name: '🔄 syncAttributesAndOfferingsIfNeeded', method: () => Purchases.syncAttributesAndOfferingsIfNeeded(), critical: false },
      { name: '🗑️ invalidateCustomerInfoCache', method: () => Purchases.invalidateCustomerInfoCache(), critical: false },
      
      // PRODUCTION: Force refresh for real offerings
      { name: '🚀 syncPurchases', method: () => Purchases.syncPurchases(), critical: false },
    ];

    setLastResult(`🔍 Running ${tests.length} RevenueCat diagnostic tests...`);
    
    let criticalFailures = 0;
    let totalFailures = 0;

    for (const test of tests) {
      try {
        report += `${test.critical ? '🔴 CRITICAL' : '🟡 OPTIONAL'} ${test.name}:\n`;
        const result = await test.method();
        report += `✅ SUCCESS: ${JSON.stringify(result, null, 2)}\n\n`;
      } catch (error) {
        const errorInfo = {
          message: error.message,
          code: error.code || 'UNKNOWN',
          domain: error.domain || 'N/A'
        };
        report += `❌ FAILED: ${JSON.stringify(errorInfo, null, 2)}\n\n`;
        
        if (test.critical) criticalFailures++;
        totalFailures++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // Summary
    report += `─────────────────────────────────────────────────────────────────\n`;
    report += `📊 DIAGNOSTIC SUMMARY:\n`;
    report += `• Total Tests: ${tests.length}\n`;
    report += `• Failed Tests: ${totalFailures}\n`;
    report += `• Critical Failures: ${criticalFailures}\n`;
    
    if (criticalFailures === 0) {
      report += `🎉 SDK STATUS: HEALTHY - RevenueCat is working properly!\n`;
    } else if (criticalFailures <= 2) {
      report += `⚠️ SDK STATUS: ISSUES DETECTED - Needs attention\n`;
    } else {
      report += `🚨 SDK STATUS: CRITICAL FAILURE - SDK not working\n`;
    }
    
    report += `─────────────────────────────────────────────────────────────────\n`;
    report += `📋 Copy this entire report to share for troubleshooting\n`;
    report += `=== END DIAGNOSTIC REPORT ===\n`;
    
    // Log to console for easy copying from dev tools
    console.log('='.repeat(60));
    console.log('REVENUECAT DIAGNOSTIC REPORT - COPY FROM HERE');
    console.log('='.repeat(60));
    console.log(report);
    console.log('='.repeat(60));
    
    setLastResult(report);
  };

  const forceRefreshOfferings = async () => {
    try {
      setLastResult('🔍 Advanced Preview Mode Troubleshooting...');
      
      // Get current configuration info
      const isConfigured = await Purchases.isConfigured();
      const appUserID = await Purchases.getAppUserID();
      const canMakePayments = await Purchases.canMakePayments();
      
      let result = '🕵️ ADVANCED TROUBLESHOOTING ANALYSIS\n';
      result += `Timestamp: ${new Date().toISOString()}\n`;
      result += '═══════════════════════════════════════════════════════════════\n\n';
      
      result += '📊 CURRENT STATUS:\n';
      result += `- SDK Configured: ${isConfigured}\n`;
      result += `- Can Make Payments: ${canMakePayments}\n`;
      result += `- User ID: ${appUserID}\n`;
      result += `- API Key: ${env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID?.substring(0, 8)}***\n`;
      result += `- Platform: ${Platform.OS}\n`;
      result += `- Environment: ${getPlatformInfo()}\n\n`;
      
      result += '❗ ISSUE: PERSISTENT PREVIEW MODE\n';
      result += 'User completed 5-point checklist but still in preview mode.\n\n';
      
      result += '🔍 ADVANCED TROUBLESHOOTING:\n\n';
      
      result += '6️⃣ API KEY VALIDATION:\n';
      result += '   - API Key format: goog_WFMZ*** (Google Play key)\n';
      result += '   - Verify key is from PRODUCTION section (not sandbox)\n';
      result += '   - Check key permissions in RevenueCat dashboard\n';
      result += '   - Ensure key belongs to correct project\n\n';
      
      result += '7️⃣ APP CONFIGURATION:\n';
      result += '   - Bundle ID: com.futhong.poketradetcg\n';
      result += '   - Verify EXACT match in RevenueCat dashboard\n';
      result += '   - Check case sensitivity and special characters\n';
      result += '   - Ensure project is linked to correct app\n\n';
      
      result += '8️⃣ GOOGLE PLAY CONSOLE ISSUES:\n';
      result += '   - Products must be PUBLISHED in Google Play (not draft)\n';
      result += '   - Check product IDs: premium_monthly, premium_yearly\n';
      result += '   - Verify subscription status is "Active"\n';
      result += '   - Ensure app is linked to correct Google Play account\n\n';
      
      result += '9️⃣ REVENUECAT PROJECT SETTINGS:\n';
      result += '   - Check if using SANDBOX vs PRODUCTION project\n';
      result += '   - Verify project is in correct environment\n';
      result += '   - Check project permissions and access\n';
      result += '   - Ensure no conflicting configurations\n\n';
      
      result += '🔟 PROPAGATION & TIMING:\n';
      result += '   - Changes can take 5-15 minutes to propagate\n';
      result += '   - Try waiting 10 minutes then test again\n';
      result += '   - Clear app cache/restart app completely\n';
      result += '   - Try on different device if possible\n\n';
      
      result += '═══════════════════════════════════════════════════════════════\n';
      result += '🚨 CRITICAL ACTIONS NEEDED:\n';
      result += '1. Double-check Bundle ID match: com.futhong.poketradetcg\n';
      result += '2. Verify API key is from PRODUCTION (not sandbox)\n';
      result += '3. Ensure Google Play products are PUBLISHED (not draft)\n';
      result += '4. Wait 10 minutes for propagation, then test\n';
      result += '5. If still failing, check if using correct RevenueCat project\n\n';
      
      result += '📞 ESCALATION: If still in preview mode after these checks,\n';
      result += 'there may be a RevenueCat account/project configuration issue.\n';
      result += '═══════════════════════════════════════════════════════════════\n';
      
      // Enhanced console logging
      console.log('='.repeat(70));
      console.log('🕵️ ADVANCED REVENUECAT TROUBLESHOOTING - COPY FROM HERE');
      console.log('='.repeat(70));
      console.log(result);
      console.log('='.repeat(70));
      console.log('🔧 ADVANCED CHECKLIST:');
      console.log('□ 6. API Key → Verify from PRODUCTION section (not sandbox)');
      console.log('□ 7. Bundle ID → Exact match: com.futhong.poketradetcg');
      console.log('□ 8. Google Play → Products PUBLISHED (not draft)');
      console.log('□ 9. RevenueCat → Using correct project/environment');
      console.log('□ 10. Timing → Wait 10 minutes for propagation');
      console.log('='.repeat(70));
      
      setLastResult(result);
      
    } catch (error) {
      const errorMsg = `❌ Advanced analysis failed: ${error.message}`;
      console.error('RevenueCat advanced diagnostic error:', error);
      setLastResult(errorMsg);
    }
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(lastResult);
      Alert.alert('✅ Copied!', 'Diagnostic report copied to clipboard. You can now paste it anywhere.');
    } catch (error) {
      Alert.alert('❌ Copy Failed', 'Could not copy to clipboard. Try selecting and copying the text manually.');
    }
  };
  
  const TestButton = ({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) => (
    <Button
      onPress={onPress}
      disabled={disabled}
      variant={disabled ? "outline" : "default"}
      className="w-full mb-2"
    >
      <Text className={disabled ? "text-muted-foreground" : "text-primary-foreground"}>
        {title}
      </Text>
    </Button>
  );
  
  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-lg font-semibold mt-4 mb-2 text-primary">{title}</Text>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Subscription Test', headerShown: true }} />
      <ScrollView className="flex-1 bg-background">
        <View className="p-4 space-y-4">
          {/* Platform Banner */}
          <View className="rounded-lg bg-green-100 border border-green-200 p-3">
            <Text className="text-green-800 font-medium text-center">
              Running on: {getPlatformInfo()}
            </Text>
          </View>
          
          {/* Quick Test Buttons */}
          <View className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <Text className="text-lg font-semibold mb-2 text-blue-800">🚀 Quick Testing</Text>
            <Text className="text-sm text-blue-700 mb-3">
              Comprehensive testing and cache clearing for real offerings.
            </Text>
            <View className="space-y-2">
              <Button
                onPress={runAllTests}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Text className="text-white font-semibold">
                  ⚡ RUN ALL TESTS (One-Click Diagnosis)
                </Text>
              </Button>
              <Button
                onPress={forceRefreshOfferings}
                variant="outline"
                className="w-full border-orange-300 bg-orange-50"
              >
                <Text className="text-orange-700 font-semibold">
                  🔄 FORCE REFRESH (Clear Cache & Get Real Offerings)
                </Text>
              </Button>
            </View>
          </View>

          {/* Results Area */}
          <View className="rounded-lg border p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold">Diagnostic Results</Text>
              {lastResult !== 'No method called yet' && (
                <Button
                  onPress={copyToClipboard}
                  variant="outline"
                  className="px-3 py-1"
                >
                  <Text className="text-sm">📋 Copy</Text>
                </Button>
              )}
            </View>
            <ScrollView className="h-48 bg-gray-50 rounded p-2" nestedScrollEnabled>
              <Text className="text-xs font-mono text-gray-700" selectable>
                {lastResult}
              </Text>
            </ScrollView>
            <Text className="text-xs text-gray-500 mt-1">
              💡 Results are also logged to console (Dev Tools) and can be copied with the button above
            </Text>
          </View>
          
          {/* System Status */}
          <View className="rounded-lg border p-4">
            <Text className="text-lg font-semibold mb-2">System Status</Text>
            <Text className="text-sm mb-1">
              User Authenticated: {user ? '✅ Yes' : '❌ No'}
            </Text>
            {user && (
              <Text className="text-sm mb-1">
                User ID: {user.id}
              </Text>
            )}
            <Text className="text-sm mb-1">
              RevenueCat Configured: {isConfigured ? '✅ Yes' : '❌ No'}
            </Text>
            <Text className="text-sm mb-1">
              Mode: {isProductionMode ? '🟢 Production' : '🟡 Preview/Sandbox'}
            </Text>
            <Text className="text-sm mb-1">
              Current Plan: {currentPlan.toUpperCase()}
            </Text>
            <Text className="text-sm mb-1">
              Is Subscribed: {status.isSubscribed ? '✅ Yes' : '❌ No'}
            </Text>
            {error && (
              <Text className="text-sm text-red-600 mt-2">
                Error: {error.message}
              </Text>
            )}
          </View>
          
          {/* RevenueCat API Testing */}
          <View className="rounded-lg border p-4">
            <SectionHeader title="Configuration & Info" />
            <TestButton 
              title="getAppUserID" 
              onPress={() => callMethod('getAppUserID', () => Purchases.getAppUserID())} 
            />
            <TestButton 
              title="isAnonymous" 
              onPress={() => callMethod('isAnonymous', () => Purchases.isAnonymous())} 
            />
            <TestButton 
              title="isConfigured" 
              onPress={() => callMethod('isConfigured', () => Purchases.isConfigured())} 
            />
            <TestButton 
              title="canMakePayments" 
              onPress={() => callMethod('canMakePayments', () => Purchases.canMakePayments())} 
            />
            <TestButton 
              title="getStorefront" 
              onPress={() => callMethod('getStorefront', () => Purchases.getStorefront())} 
            />
            
            <SectionHeader title="Customer Info & Authentication" />
            <TestButton 
              title="getCustomerInfo" 
              onPress={() => callMethod('getCustomerInfo', () => Purchases.getCustomerInfo())} 
            />
            <TestButton 
              title="invalidateCustomerInfoCache" 
              onPress={() => callMethod('invalidateCustomerInfoCache', () => Purchases.invalidateCustomerInfoCache())} 
            />
            <TestButton 
              title="logIn (test_user)" 
              onPress={() => callMethod('logIn', () => Purchases.logIn('test_user_' + Date.now()))} 
            />
            <TestButton 
              title="logOut" 
              onPress={() => callMethod('logOut', () => Purchases.logOut())} 
            />
            <TestButton 
              title="restorePurchases" 
              onPress={() => callMethod('restorePurchases', () => Purchases.restorePurchases())} 
            />
            
            <SectionHeader title="Offerings & Products" />
            <TestButton 
              title="getOfferings" 
              onPress={() => callMethod('getOfferings', () => Purchases.getOfferings())} 
            />
            <TestButton 
              title="syncAttributesAndOfferingsIfNeeded" 
              onPress={() => callMethod('syncAttributesAndOfferingsIfNeeded', () => Purchases.syncAttributesAndOfferingsIfNeeded())} 
            />
            <TestButton 
              title="getCurrentOfferingForPlacement (test)" 
              onPress={() => callMethod('getCurrentOfferingForPlacement', () => Purchases.getCurrentOfferingForPlacement('test_placement'))} 
            />
            
            <SectionHeader title="Purchasing" />
            <TestButton 
              title="purchasePackage (first package)" 
              onPress={async () => {
                try {
                  const offerings = await Purchases.getOfferings();
                  const currentOffering = offerings.current;
                  if (!currentOffering || !currentOffering.availablePackages[0]) {
                    Alert.alert('Note', 'No current offering or packages found.');
                    return;
                  }
                  callMethod('purchasePackage', () => Purchases.purchasePackage(currentOffering.availablePackages[0]));
                } catch (error) {
                  Alert.alert('Error', 'Error getting offerings: ' + error);
                }
              }} 
            />
            <TestButton 
              title="syncPurchases" 
              onPress={() => callMethod('syncPurchases', () => Purchases.syncPurchases())} 
            />
            
            <SectionHeader title="RevenueCat UI - Paywalls" />
            <TestButton 
              title="presentPaywall (default)" 
              onPress={() => callMethod('presentPaywall', () => RevenueCatUI.presentPaywall())} 
            />
            <TestButton 
              title="presentPaywallIfNeeded (pro entitlement)" 
              onPress={() => callMethod('presentPaywallIfNeeded', () => RevenueCatUI.presentPaywallIfNeeded({ 
                requiredEntitlementIdentifier: 'pro',
                displayCloseButton: false
              }))} 
            />
            <TestButton 
              title="Show Modal Paywall (Fullscreen)" 
              onPress={() => {
                setLastResult('[' + new Date().toLocaleTimeString() + '] Opening modal paywall...');
                setShowModalPaywall(true);
              }} 
            />
            
            <SectionHeader title="RevenueCat UI - Customer Center" />
            <TestButton 
              title="presentCustomerCenter" 
              onPress={() => callMethod('presentCustomerCenter', () => RevenueCatUI.presentCustomerCenter())} 
            />
            
            <SectionHeader title="Subscriber Attributes" />
            <TestButton 
              title="setEmail (test@example.com)" 
              onPress={() => callMethod('setEmail', () => Purchases.setEmail('test@example.com'))} 
            />
            <TestButton 
              title="setDisplayName (Test User)" 
              onPress={() => callMethod('setDisplayName', () => Purchases.setDisplayName('Test User'))} 
            />
            <TestButton 
              title="setAttributes (custom)" 
              onPress={() => callMethod('setAttributes', () => Purchases.setAttributes({
                'test_attribute': 'test_value',
                'timestamp': new Date().toISOString()
              }))} 
            />
          </View>

          {/* Built-in App Components */}
          <View className="rounded-lg border p-4">
            <SectionHeader title="Feature Access Test" />
            <Text className="text-sm mb-1">
              Basic Access: {hasFeature('basicAccess') ? '✅' : '❌'}
            </Text>
            <Text className="text-sm mb-1">
              Advanced Filters: {hasFeature('advancedFilters') ? '✅' : '❌'}
            </Text>
            <Text className="text-sm mb-1">
              Premium Support: {hasFeature('premiumSupport') ? '✅' : '❌'}
            </Text>
            <Text className="text-sm mb-1">
              Analytics: {hasFeature('analytics') ? '✅' : '❌'}
            </Text>

            <SectionHeader title="Feature Gate Demo" />
            <FeatureGate 
              feature="premiumSupport"
              onUpgradePress={(plan) => Alert.alert('Upgrade', `Upgrade to ${plan} plan`)}
            >
              <View className="rounded-lg bg-green-50 p-4">
                <Text className="text-green-800 font-medium">
                  🎉 Premium Support Unlocked!
                </Text>
                <Text className="text-green-600 text-sm mt-1">
                  You have access to priority customer support.
                </Text>
              </View>
            </FeatureGate>

            <SectionHeader title="Subscription Status" />
            <SubscriptionStatus />

            <SectionHeader title="Restore Purchases" />
            <RestorePurchasesButton 
              onRestoreComplete={() => Alert.alert('Success', 'Purchases restored!')}
              onRestoreError={(error) => Alert.alert('Error', error.message)}
            />

            <SectionHeader title="Dashboard Paywall (Production)" />
            {!isProductionMode ? (
              <View className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 mb-4">
                <Text className="text-yellow-800 font-medium text-sm mb-1">
                  ⚠️ Preview Mode Active
                </Text>
                <Text className="text-yellow-700 text-xs mb-2">
                  Paywall UI will return "NOT_PRESENTED" in preview mode.
                </Text>
                <Text className="text-yellow-700 text-xs">
                  To enable production mode:
                  {'\n'}• Get production API keys from RevenueCat dashboard
                  {'\n'}• Update environment variables
                  {'\n'}• Ensure offerings are published
                </Text>
              </View>
            ) : (
              <Text className="text-sm text-muted-foreground mb-4">
                ✅ Production mode - paywall will display your custom design.
              </Text>
            )}
            
            <PaywallButton
              title={isProductionMode ? "Open Paywall (Modal)" : "Test Modal (Preview Mode)"}
              className="w-full mb-2"
              presentationType="modal"
              onPurchaseComplete={() => Alert.alert('Success', 'Purchased via dashboard paywall!')}
            />
            <PaywallButton
              title={isProductionMode ? "Open Paywall (Native)" : "Test Native (Preview Mode)"}
              variant="outline"
              className="w-full mb-2"
              presentationType="native"
              onPurchaseComplete={() => Alert.alert('Success', 'Purchased via native paywall!')}
            />

            <SectionHeader title="Custom Plans Component" />
            <Text className="text-sm text-muted-foreground mb-4">
              Custom-built subscription plans component (alternative to RevenueCat paywall).
            </Text>
            <SubscriptionPlans 
              onPurchaseStart={(pkg) => console.log('Purchase started:', pkg.identifier)}
              onPurchaseComplete={(pkg) => Alert.alert('Success', `Purchased ${pkg.identifier}!`)}
              onPurchaseError={(error, pkg) => Alert.alert('Error', `Failed to purchase ${pkg.identifier}: ${error.message}`)}
            />
          </View>
        </View>
      </ScrollView>
      
      {/* Modal Paywall */}
      <Modal
        visible={showModalPaywall}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowModalPaywall(false)}
      >
        <View className="flex-1 bg-white">
          <RevenueCatUI.Paywall
            options={{
              displayCloseButton: true,
              offering: null,
              fontFamily: null
            }}
            onPurchaseStarted={({ packageBeingPurchased }) => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Purchase started for: ${packageBeingPurchased.identifier}`);
            }}
            onPurchaseCompleted={({ customerInfo, storeTransaction }) => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Purchase completed! Transaction: ${storeTransaction.transactionIdentifier}`);
              setShowModalPaywall(false);
            }}
            onPurchaseError={({ error }) => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Purchase error: ${error.message}`);
            }}
            onPurchaseCancelled={() => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Purchase cancelled`);
            }}
            onRestoreStarted={() => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Restore started`);
            }}
            onRestoreCompleted={({ customerInfo }) => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Restore completed`);
            }}
            onRestoreError={({ error }) => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Restore error: ${error.message}`);
            }}
            onDismiss={() => {
              setLastResult(`[${new Date().toLocaleTimeString()}] Modal paywall dismissed`);
              setShowModalPaywall(false);
            }}
          />
        </View>
      </Modal>
    </>
  );
}