import { Platform, Dimensions } from "react-native"
import { useSafeAreaInsets, useSafeAreaFrame } from "react-native-safe-area-context"

export interface CleanTabBarStyle {
  // Simple attached bar styles
  height: number
  paddingBottom: number
  paddingTop: number
  paddingHorizontal: number
  
  // Clean visual styling
  borderTopWidth: number
  borderTopLeftRadius: number
  borderTopRightRadius: number
  
  // Active indicator styles
  indicatorBorderRadius: number
  indicatorPadding: number
  
  // Optimized animation configs
  springConfig: {
    tension: number
    friction: number
    mass: number
  }
  transitionDuration: number
}

export interface CleanTabBarMetrics {
  iconSize: number
  iconActiveSize: number
  minTouchTarget: number
  tabWidth: number
  screenWidth: number
  totalTabs: number
  isGestureNavigation: boolean
  platform: 'ios' | 'android'
}

/**
 * 🎯 Clean, user-friendly tab bar hook
 * Simple, practical design that users expect and love
 */
export function useCleanTabBar(totalTabs: number = 5): {
  tabBarStyle: CleanTabBarStyle
  metrics: CleanTabBarMetrics
} {
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = Dimensions.get('window')
  
  // Platform detection
  const platform = Platform.OS as 'ios' | 'android'
  
  // Device and navigation detection
  const isGestureNavigation = platform === 'ios' 
    ? insets.bottom > 0 // iOS: home indicator present
    : insets.bottom <= 20 // Android: gesture nav typically has smaller insets
  
  // Clean design metrics (no fancy ratios, just practical)
  const baseIconSize = 24 // Slightly larger for better visibility
  const iconActiveScale = 1.2 // Increased from 1.1 to 1.2 for more visible active state
  const minTouchTarget = 44
  
  // Calculate clean, attached dimensions
  const calculateCleanDimensions = (): CleanTabBarStyle => {
    const tabWidth = screenWidth / totalTabs
    
    // Clean height calculation - just what's needed
    const contentHeight = Math.max(minTouchTarget, 52) // 52px is a good practical height
    
    // Safe area padding but attached to bottom
    const bottomPadding = platform === 'ios' 
      ? Math.max(8, insets.bottom) // iOS: respect home indicator
      : Math.max(12, insets.bottom + 4) // Android: slightly more padding
    
    const totalHeight = contentHeight + bottomPadding
    
    return {
      // Simple attached bar styles
      height: totalHeight,
      paddingBottom: bottomPadding,
      paddingTop: 8, // Just enough top padding
      paddingHorizontal: 16,
      
      // Clean visual styling
      borderTopWidth: 1, // Subtle separation
      borderTopLeftRadius: 8, // Modern but not excessive
      borderTopRightRadius: 8,
      
      // Active indicator styles (keep the pills - users like them)
      indicatorBorderRadius: 12,
      indicatorPadding: 6,
      
      // Performance-optimized spring animations for fast, smooth transitions
      springConfig: {
        damping: 20,     // Higher damping for faster completion
        stiffness: 280,  // Higher stiffness for snappy response
        mass: 0.6,       // Lighter mass for quick animations
      },
      transitionDuration: 150, // Faster transitions to prevent lag
    }
  }
  
  const tabBarStyle = calculateCleanDimensions()
  
  const metrics: CleanTabBarMetrics = {
    iconSize: baseIconSize,
    iconActiveSize: Math.round(baseIconSize * iconActiveScale),
    minTouchTarget,
    tabWidth: screenWidth / totalTabs,
    screenWidth,
    totalTabs,
    isGestureNavigation,
    platform,
  }
  
  return {
    tabBarStyle,
    metrics,
  }
}

// Legacy support - updated to use clean implementation
export function useAdaptiveTabBar() {
  const clean = useCleanTabBar()
  
  // Transform to legacy format for backward compatibility
  return {
    tabBarStyle: {
      height: clean.tabBarStyle.height,
      paddingBottom: clean.tabBarStyle.paddingBottom,
      paddingTop: clean.tabBarStyle.paddingTop,
      paddingHorizontal: clean.tabBarStyle.paddingHorizontal,
    },
    metrics: {
      iconSize: clean.metrics.iconSize,
      minTouchTarget: clean.metrics.minTouchTarget,
      baseHeight: clean.tabBarStyle.height - clean.tabBarStyle.paddingBottom - clean.tabBarStyle.paddingTop,
      isGestureNavigation: clean.metrics.isGestureNavigation,
      platform: clean.metrics.platform,
    }
  }
}

// Keep the modern function for legacy but point to clean
export function useModernTabBar(totalTabs: number = 5) {
  return useCleanTabBar(totalTabs)
}

/**
 * Helper hook for debugging tab bar calculations
 * Only use in development for troubleshooting
 */
export function useTabBarDebugInfo() {
  const insets = useSafeAreaInsets()
  const frame = useSafeAreaFrame()
  const { tabBarStyle, metrics } = useAdaptiveTabBar()
  
  if (__DEV__) {
    return {
      insets,
      frame,
      tabBarStyle,
      metrics,
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version,
        isGestureNavigation: metrics.isGestureNavigation,
      }
    }
  }
  
  return null
}