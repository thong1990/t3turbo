import { Ionicons } from "~/shared/components/ui/icons"
import { Link, router } from "expo-router"
import { View, TouchableOpacity, TextInput, Modal, Alert } from "react-native"
import * as Clipboard from "expo-clipboard"
import * as Haptics from "expo-haptics"
import * as ImagePicker from "expo-image-picker"
import { useState } from "react"
import { BannerAd } from "~/features/ads/components/BannerAd"
import { useUserProfile } from "~/features/auth/hooks/use-user-profile"

import { Container } from "~/shared/components/container"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/shared/components/ui/avatar"
import { Text } from "~/shared/components/ui/text"
import { Button } from "~/shared/components/ui/button"
import { useProfileUtils } from "~/shared/hooks/use-profile-utils"
import { useSignOut, useUser } from "~/features/supabase/hooks"
import { toast } from "sonner-native"


export default function ProfileScreen() {
  const { data: user } = useUser()
  const { mutate: signOut } = useSignOut()
  const { profile, updateProfile, createProfile, isUpdating } = useUserProfile()
  const { getAvatarUrl } = useProfileUtils()

  // Inline editing states
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [showAvatarSheet, setShowAvatarSheet] = useState(false)

  const handleCopyAppId = async () => {
    if (user?.id) {
      try {
        await Clipboard.setStringAsync(user.id)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        toast.success("App ID copied to clipboard!")
      } catch {
        toast.error("Failed to copy App ID")
      }
    }
  }

  const handleUpgrade = () => {
    // Navigate to paywall screen
    router.push('/profile/revenuecat-paywall')
  }

  const startInlineEdit = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue || "")
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const cancelInlineEdit = () => {
    setEditingField(null)
    setEditValue("")
  }

  const saveInlineEdit = async () => {
    if (!user || !editingField) return

    try {
      const trimmedValue = editValue.trim()
      const updateData = {
        [editingField]: trimmedValue || null,
      }

      const action = profile ? updateProfile : createProfile
      
      await new Promise<void>((resolve, reject) => {
        action(updateData, {
          onSuccess: () => {
            toast.success("Profile updated successfully!")
            setEditingField(null)
            setEditValue("")
            resolve()
          },
          onError: (error: Error) => {
            toast.error(`Failed to update: ${error.message}`)
            reject(error)
          },
        })
      })
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  const handleAvatarEdit = () => {
    setShowAvatarSheet(true)
    setShowIconGrid(true) // Go straight to icon grid
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      toast.error('Permission to access media library is required!')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      await updateAvatar(result.assets[0].uri)
    }
    setShowAvatarSheet(false)
  }

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      toast.error('Permission to access camera is required!')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      await updateAvatar(result.assets[0].uri)
    }
    setShowAvatarSheet(false)
  }

  // Avatar icons selection
  const avatarIcons = [
    "person-circle", "happy-outline", "heart-circle", "star-outline", "diamond-outline", 
    "flash-outline", "shield-checkmark-outline", "game-controller-outline",
    "trophy-outline", "thumbs-up-outline", "rocket-outline", "leaf-outline",
    "moon-outline", "sunny-outline", "cloud-outline", "water-outline"
  ]
  
  const [showIconGrid, setShowIconGrid] = useState(false)

  const selectAvatarIcon = async (iconName: string) => {
    // Store icon name as avatar_url with special prefix
    await updateAvatar(`icon:${iconName}`)
    setShowAvatarSheet(false)
    setShowIconGrid(false)
  }

  const setAvatarUrl = () => {
    Alert.prompt(
      "Avatar URL",
      "Enter the URL of your avatar image:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Save", onPress: async (url) => {
          if (url && url.trim()) {
            await updateAvatar(url.trim())
          }
        }},
      ],
      "plain-text",
      profile?.avatar_url && !profile.avatar_url.startsWith('icon:') ? profile.avatar_url : ""
    )
    setShowAvatarSheet(false)
    setShowIconGrid(false)
  }

  const updateAvatar = async (avatarUrl: string) => {
    if (!user) return

    try {
      const action = profile ? updateProfile : createProfile
      
      await new Promise<void>((resolve, reject) => {
        action({ avatar_url: avatarUrl }, {
          onSuccess: () => {
            toast.success("Avatar updated successfully!")
            resolve()
          },
          onError: (error: Error) => {
            toast.error(`Failed to update avatar: ${error.message}`)
            reject(error)
          },
        })
      })
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  return (
    <>
      <Container>
        <View className="flex-1">
          {/* Top Section */}
          <View className="gap-3">
            {/* Profile Header */}
            {user ? (
              <View className="rounded-3xl bg-primary/10 border border-primary/20 p-4 shadow-lg">
                <View className="items-center gap-3">
                  <TouchableOpacity onPress={handleAvatarEdit}>
                    <View className="relative">
                      <View className="h-20 w-20 items-center justify-center rounded-full border-3 border-primary/20 bg-card shadow-md overflow-hidden">
                        {(() => {
                          const avatarUrl = getAvatarUrl(user, profile)
                          if (avatarUrl?.startsWith('icon:')) {
                            // Display icon avatar
                            const iconName = avatarUrl.replace('icon:', '') as any
                            return <Ionicons name={iconName} size={50} className="text-primary" />
                          } else if (avatarUrl) {
                            // Display image avatar
                            return (
                              <Avatar alt="User avatar" className="h-full w-full">
                                <AvatarImage src={avatarUrl} className="h-full w-full object-cover" />
                              </Avatar>
                            )
                          } else {
                            // Default avatar
                            return <Ionicons name="person" size={40} className="text-primary/60" />
                          }
                        })()}
                      </View>
                      <View className="absolute -bottom-1 -right-1 h-7 w-7 items-center justify-center rounded-full bg-primary shadow-sm border-2 border-background">
                        <Ionicons name="pencil" size={12} className="text-primary-foreground" />
                      </View>
                    </View>
                  </TouchableOpacity>
                  
                  
                </View>
                
                {/* Profile Info Rows */}
                <View className="mt-8 gap-4">
                  {/* App ID Row */}
                  <TouchableOpacity 
                    onPress={user?.id ? handleCopyAppId : undefined}
                    className="flex-row items-center justify-between rounded-xl bg-card/70 px-4 py-4"
                  >
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="id-card" size={14} className="text-primary" />
                      <Text className="font-medium text-foreground text-sm">App ID</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="font-mono text-muted-foreground text-xs">
                        {user?.id ? `${user.id.slice(0, 8)}...` : "Not available"}
                      </Text>
                      {user?.id && (
                        <Ionicons name="copy" size={12} className="text-primary" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Game ID Row */}
                  {editingField === 'game_account_id' ? (
                    <View className="rounded-xl bg-primary/5 border border-primary/30 p-4">
                      <View className="mb-2">
                        <View className="flex-row items-center gap-2">
                          <Ionicons name="person" size={16} className="text-primary" />
                          <Text className="font-semibold text-primary">Edit Game ID</Text>
                        </View>
                        <Text className="mt-1 text-muted-foreground text-xs">
                          Enter your unique game account identifier
                        </Text>
                      </View>
                      <View className="gap-3">
                        <TextInput
                          value={editValue}
                          onChangeText={setEditValue}
                          placeholder="e.g., 123456789"
                          className="rounded-lg bg-background border border-border px-4 py-4 text-foreground"
                          placeholderTextColor="#6b7280"
                          autoFocus
                          selectTextOnFocus
                          autoCapitalize="none"
                          autoCorrect={false}
                          returnKeyType="done"
                          onSubmitEditing={saveInlineEdit}
                        />
                        <View className="flex-row gap-2">
                          <TouchableOpacity 
                            onPress={saveInlineEdit} 
                            disabled={isUpdating}
                            className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2"
                          >
                            <Ionicons name="checkmark" size={16} className="text-primary-foreground" />
                            <Text className="font-medium text-primary-foreground">
                              {isUpdating ? "Saving..." : "Save"}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={cancelInlineEdit}
                            className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-muted px-3 py-2"
                          >
                            <Ionicons name="close" size={16} className="text-muted-foreground" />
                            <Text className="font-medium text-muted-foreground">Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => startInlineEdit('game_account_id', profile?.game_account_id || '')}
                      className="flex-row items-center justify-between rounded-xl bg-card/70 px-3 py-2.5 border border-transparent hover:border-primary/20"
                    >
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="person" size={14} className="text-primary" />
                        <Text className="font-medium text-foreground text-sm">Game ID</Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Text className={`text-xs ${profile?.game_account_id ? 'text-foreground font-mono' : 'text-muted-foreground italic'}`}>
                          {profile?.game_account_id ?? "Tap to add"}
                        </Text>
                        <Ionicons name="pencil" size={12} className="text-primary" />
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Game Name Row */}
                  {editingField === 'game_account_ign' ? (
                    <View className="rounded-xl bg-primary/5 border border-primary/30 p-3">
                      <View className="mb-2">
                        <View className="flex-row items-center gap-2">
                          <Ionicons name="at" size={16} className="text-primary" />
                          <Text className="font-semibold text-primary">Edit Game Name</Text>
                        </View>
                        <Text className="mt-1 text-muted-foreground text-xs">
                          Enter your in-game display name (IGN)
                        </Text>
                      </View>
                      <View className="gap-3">
                        <TextInput
                          value={editValue}
                          onChangeText={setEditValue}
                          placeholder="e.g., PlayerName123"
                          className="rounded-lg bg-background border border-border px-3 py-3 text-foreground"
                          placeholderTextColor="#6b7280"
                          autoFocus
                          selectTextOnFocus
                          autoCorrect={false}
                          returnKeyType="done"
                          onSubmitEditing={saveInlineEdit}
                        />
                        <View className="flex-row gap-2">
                          <TouchableOpacity 
                            onPress={saveInlineEdit} 
                            disabled={isUpdating}
                            className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2"
                          >
                            <Ionicons name="checkmark" size={16} className="text-primary-foreground" />
                            <Text className="font-medium text-primary-foreground">
                              {isUpdating ? "Saving..." : "Save"}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={cancelInlineEdit}
                            className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-muted px-3 py-2"
                          >
                            <Ionicons name="close" size={16} className="text-muted-foreground" />
                            <Text className="font-medium text-muted-foreground">Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => startInlineEdit('game_account_ign', profile?.game_account_ign || '')}
                      className="flex-row items-center justify-between rounded-xl bg-card/70 px-3 py-2.5 border border-transparent hover:border-primary/20"
                    >
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="at" size={14} className="text-primary" />
                        <Text className="font-medium text-foreground text-sm">Game Name</Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Text className={`text-xs ${profile?.game_account_ign ? 'text-foreground font-medium' : 'text-muted-foreground italic'}`}>
                          {profile?.game_account_ign ?? "Tap to add"}
                        </Text>
                        <Ionicons name="pencil" size={12} className="text-primary" />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <View className="rounded-3xl bg-muted/30 p-6">
                <View className="flex-row items-center gap-4">
                  <Avatar alt="User avatar" className="h-16 w-16">
                    <AvatarFallback>
                      <Ionicons name="person-circle" size={64} className="text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <View className="flex-1">
                    <Text variant="title2" className="mb-2 text-foreground">Welcome!</Text>
                    <Link href="/login" asChild>
                      <TouchableOpacity className="rounded-full bg-primary px-4 py-2">
                        <Text className="font-semibold text-primary-foreground text-center">Sign In</Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </View>
              </View>
            )}

            {/* Subscription Card */}
            {user && (
              <View className={`rounded-2xl p-4 bg-green-500/10 border border-green-500/20 shadow-sm`}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="star" size={16} className="text-green-600" />
                      <Text className="font-semibold text-foreground">Pro Plan</Text>
                    </View>
                    <Text className="mt-1 text-muted-foreground text-xs">
                      Premium features active
                    </Text>
                  </View>
                  <Button onPress={handleUpgrade} className="px-3 py-1">
                    <Text>Upgrade</Text>
                  </Button>
                </View>
              </View>
            )}
          </View>

          {/* Quick Actions Grid */}
          <View className="flex-1 justify-center">
            <View className="gap-3">
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={() => router.push("/profile/preferences")}
                  className="flex-1 items-center rounded-2xl bg-card p-4 shadow-sm"
                >
                  <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Ionicons name="options" size={20} className="text-primary" />
                  </View>
                  <Text className="font-medium text-foreground">Preferences</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => router.push("/terms-of-service")}
                  className="flex-1 items-center rounded-2xl bg-card p-4 shadow-sm"
                >
                  <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <Ionicons name="document-text" size={20} className="text-blue-600" />
                  </View>
                  <Text className="font-medium text-foreground">Terms</Text>
                </TouchableOpacity>
              </View>
              
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={() => router.push("/privacy-policy")}
                  className="flex-1 items-center rounded-2xl bg-card p-4 shadow-sm"
                >
                  <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <Ionicons name="shield-checkmark" size={20} className="text-green-600" />
                  </View>
                  <Text className="font-medium text-foreground">Privacy</Text>
                </TouchableOpacity>
                
                {user && (
                  <TouchableOpacity 
                    onPress={() => signOut()}
                    className="flex-1 items-center rounded-2xl bg-card p-4 shadow-sm"
                  >
                    <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                      <Ionicons name="log-out" size={20} className="text-red-600" />
                    </View>
                    <Text className="font-medium text-red-600">Logout</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* App Version Footer */}
          <View className="items-center py-2">
            <Text className="font-mono text-muted-foreground text-xs">Version 1.0.0</Text>
          </View>
        </View>
      </Container>
      
      {/* Avatar Edit Bottom Sheet */}
      <Modal
        visible={showAvatarSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarSheet(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View 
            className="rounded-t-3xl bg-background p-6 pb-8"
            style={{ 
              minHeight: 500,
              maxHeight: '85%'
            }}
          >
            <View className="mb-4 items-center">
              <View className="mb-2 h-1 w-10 rounded-full bg-muted-foreground/30" />
              <Text variant="title2" className="text-foreground">
                Choose Avatar Icon
              </Text>
            </View>
            
            <View style={{ height: 320 }}>
              <View className="flex-row flex-wrap gap-3 justify-center">
                {avatarIcons.map((iconName) => (
                  <TouchableOpacity
                    key={iconName}
                    onPress={() => selectAvatarIcon(iconName)}
                    className="h-16 w-16 items-center justify-center rounded-full bg-card border-2 border-border shadow-sm active:border-primary m-1"
                  >
                    <Ionicons name={iconName as any} size={30} className="text-primary" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Future: Image upload will go here */}
            <View className="mt-4 items-center">
              <Text className="text-muted-foreground text-sm text-center">
                Round image upload feature coming soon...
              </Text>
            </View>
            
            <Button
              onPress={() => {
                setShowAvatarSheet(false)
                setShowIconGrid(false)
              }}
              variant="ghost"
              className="mt-4 rounded-xl py-3"
            >
              <Text className="font-medium text-muted-foreground">Cancel</Text>
            </Button>
          </View>
        </View>
      </Modal>
      
      <BannerAd placement="profile-bottom" />
    </>
  )
}
