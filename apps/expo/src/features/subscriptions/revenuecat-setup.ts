import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

/**
 * Initialize RevenueCat SDK with simple Android-only setup
 * Following official RevenueCat documentation for minimal implementation
 */
export const initializeRevenueCat = async () => {
  try {
    // Only initialize for Android platform
    if (Platform.OS === 'android') {
      // Set debug logging for development
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      
      // Configure RevenueCat with Android API key
      await Purchases.configure({
        apiKey: 'goog_WFMZBvxnKhlWgglzHnvPScdbFoA'
      });
      
      console.log('✅ RevenueCat initialized successfully for Android');
    } else {
      console.log('ℹ️ RevenueCat: Skipping initialization for non-Android platform');
    }
  } catch (error) {
    console.error('❌ RevenueCat initialization failed:', error);
  }
};