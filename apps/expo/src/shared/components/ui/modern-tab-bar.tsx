import { cn } from "@acme/ui"
import * as Haptics from "expo-haptics"
import React from "react"
import { Pressable, View } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated"
import { Ionicons } from "~/shared/components/ui/icons"
import type { CleanTabBarStyle, CleanTabBarMetrics } from "~/shared/hooks/use-adaptive-tab-bar"

interface CleanTabBarProps {
  tabs: Array<{
    name: string
    icon: React.ComponentProps<typeof Ionicons>["name"]
    label: string
  }>
  activeTab: string
  onTabPress: (tabName: string) => void
  style: CleanTabBarStyle
  metrics: CleanTabBarMetrics
  isDarkMode: boolean
}

interface CleanTabItemProps {
  tab: {
    name: string
    icon: React.ComponentProps<typeof Ionicons>["name"]
    label: string
  }
  isActive: boolean
  onPress: () => void
  style: CleanTabBarStyle
  metrics: CleanTabBarMetrics
  isDarkMode: boolean
  index: number
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const CleanTabItem = React.memo(function CleanTabItem({ 
  tab, 
  isActive, 
  onPress, 
  style, 
  metrics, 
  isDarkMode,
  index 
}: CleanTabItemProps) {
  const scale = useSharedValue(1)
  const iconScale = useSharedValue(1)
  const backgroundOpacity = useSharedValue(isActive ? 1 : 0)

  React.useEffect(() => {
    // Simplified animation - only icon scale and background opacity
    iconScale.value = withSpring(
      isActive ? metrics.iconActiveSize / metrics.iconSize : 1,
      style.springConfig
    )
    backgroundOpacity.value = withSpring(
      isActive ? 1 : 0,
      style.springConfig
    )
  }, [isActive, style.springConfig, metrics])

  const handlePress = () => {
    // Lightweight haptic feedback - non-blocking
    if (!isActive && Haptics.impactAsync) {
      // Light impact to prevent main thread blocking
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    
    // Fast, lightweight scale animation
    scale.value = withSpring(0.97, { 
      damping: 25,
      stiffness: 300,
      mass: 0.4
    }, () => {
      scale.value = withSpring(1, { 
        damping: 20,
        stiffness: 280,
        mass: 0.5
      })
    })
    
    // Trigger navigation immediately for responsive feel
    onPress()
  }

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }))
  
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
    // Removed scale animation for better performance
  }))

  const primaryColor = isDarkMode ? "#3B82F6" : "#2563EB"
  const mutedColor = isDarkMode ? "#6B7280" : "#9CA3AF"
  
  // Enhanced background highlight for active tab - bigger and more visible
  const activeBackgroundColor = isDarkMode 
    ? "rgba(59, 130, 246, 0.25)" // More prominent in dark mode
    : "rgba(37, 99, 235, 0.18)"  // More prominent in light mode

  return (
    <AnimatedPressable
      style={[
        containerAnimatedStyle,
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: metrics.minTouchTarget,
          position: 'relative',
        }
      ]}
      onPress={handlePress}
    >
      {/* Bigger background highlight for active tab */}
      <Animated.View
        style={[
          backgroundAnimatedStyle,
          {
            position: 'absolute',
            top: 2,
            left: 2,
            right: 2,
            bottom: 2,
            backgroundColor: activeBackgroundColor,
            borderRadius: 16, // Larger border radius
          }
        ]}
      />
      
      {/* Icon */}
      <Animated.View style={iconAnimatedStyle}>
        <Ionicons
          name={tab.icon}
          size={metrics.iconSize}
          color={isActive ? primaryColor : mutedColor}
        />
      </Animated.View>
    </AnimatedPressable>
  )
})

export const CleanTabBar = React.memo(function CleanTabBar({
  tabs,
  activeTab,
  onTabPress,
  style,
  metrics,
  isDarkMode,
}: CleanTabBarProps) {
  // Simple and clean design - no complex sliding indicator
  
  // Clean solid background colors
  const tabBarBg = isDarkMode 
    ? "#1F2937" // Dark solid gray-800
    : "#FFFFFF" // Clean white
  
  const borderColor = isDarkMode
    ? "#374151" // gray-700
    : "#E5E7EB" // gray-200
    
  // Removed sliding indicator background

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: style.height,
        backgroundColor: tabBarBg,
        borderTopWidth: style.borderTopWidth,
        borderTopColor: borderColor,
        borderTopLeftRadius: style.borderTopLeftRadius,
        borderTopRightRadius: style.borderTopRightRadius,
        paddingBottom: style.paddingBottom,
        paddingTop: style.paddingTop,
        paddingHorizontal: style.paddingHorizontal,
      }}
    >
      {/* Removed complex sliding indicator */}
      
      {/* Tab items container */}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-evenly',
        }}
      >
        {tabs.map((tab, index) => (
          <CleanTabItem
            key={tab.name}
            tab={tab}
            isActive={activeTab === tab.name}
            onPress={() => onTabPress(tab.name)}
            style={style}
            metrics={metrics}
            isDarkMode={isDarkMode}
            index={index}
          />
        ))}
      </View>
    </View>
  )
})

// Legacy export for backward compatibility
export const ModernTabBar = CleanTabBar