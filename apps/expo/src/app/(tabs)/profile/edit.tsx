import { router } from "expo-router"
import { useState } from "react"
import { View, TextInput, Alert } from "react-native"
import { toast } from "sonner-native"
import * as Haptics from "expo-haptics"

import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"
import { Button } from "~/shared/components/ui/button"
import { Text } from "~/shared/components/ui/text"
import { Ionicons } from "~/shared/components/ui/icons"

import { useUserProfile } from "~/features/auth/hooks/use-user-profile"
import { useUser } from "~/features/supabase/hooks"

export default function QuickEditScreen() {
  const { data: user } = useUser()
  const {
    profile,
    updateProfile,
    createProfile,
    isUpdating,
    isCreating,
  } = useUserProfile()

  const [gameId, setGameId] = useState(profile?.game_account_id ?? "")
  const [gameName, setGameName] = useState(profile?.game_account_ign ?? "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "")

  const isLoading = isUpdating || isCreating

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to update your profile")
      return
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      
      const trimmedData = {
        game_account_id: gameId.trim() || null,
        game_account_ign: gameName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      }

      const action = profile ? updateProfile : createProfile
      
      await new Promise<void>((resolve, reject) => {
        action(trimmedData, {
          onSuccess: () => {
            toast.success("Profile updated successfully!")
            router.back()
            resolve()
          },
          onError: (error: Error) => {
            toast.error(`Failed to update profile: ${error.message}`)
            reject(error)
          },
        })
      })
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  const handleCancel = () => {
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard your changes?",
      [
        { text: "Keep Editing", style: "cancel" },
        { 
          text: "Discard", 
          style: "destructive", 
          onPress: () => router.back() 
        },
      ]
    )
  }

  return (
    <Container>
      <Header title="Quick Edit" hasBackButton />
      
      <View className="flex-1 gap-6 px-4 py-6">
        {/* Header */}
        <View className="items-center">
          <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Ionicons name="create" size={24} className="text-primary" />
          </View>
          <Text variant="title2" className="text-center text-foreground">
            Update Game Info
          </Text>
          <Text className="mt-1 text-center text-muted-foreground text-sm">
            Quick edit your gaming details
          </Text>
        </View>

        {/* Edit Fields */}
        <View className="gap-4">
          {/* Game ID */}
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="person" size={16} className="text-primary" />
              <Text className="font-semibold text-foreground">Game ID</Text>
            </View>
            <TextInput
              value={gameId}
              onChangeText={setGameId}
              placeholder="Enter your game account ID"
              className="rounded-xl bg-card px-4 py-3 text-foreground"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Game Name */}
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="at" size={16} className="text-primary" />
              <Text className="font-semibold text-foreground">Game Name</Text>
            </View>
            <TextInput
              value={gameName}
              onChangeText={setGameName}
              placeholder="Enter your in-game name"
              className="rounded-xl bg-card px-4 py-3 text-foreground"
              placeholderTextColor="#6b7280"
              autoCorrect={false}
            />
          </View>

          {/* Avatar URL */}
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="image" size={16} className="text-primary" />
              <Text className="font-semibold text-foreground">Avatar URL</Text>
              <Text className="text-muted-foreground text-xs">(optional)</Text>
            </View>
            <TextInput
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              placeholder="https://example.com/avatar.jpg"
              className="rounded-xl bg-card px-4 py-3 text-foreground"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-auto gap-3">
          <Button
            onPress={handleSave}
            disabled={isLoading}
            className="flex-row items-center justify-center gap-2 rounded-xl bg-primary py-4"
          >
            {isLoading ? (
              <Ionicons name="refresh" size={16} className="text-primary-foreground animate-spin" />
            ) : (
              <Ionicons name="checkmark" size={16} className="text-primary-foreground" />
            )}
            <Text className="font-semibold text-primary-foreground">
              {isLoading ? "Saving..." : "Save Changes"}
            </Text>
          </Button>
          
          <Button
            onPress={handleCancel}
            variant="ghost"
            className="flex-row items-center justify-center gap-2 rounded-xl py-4"
          >
            <Ionicons name="close" size={16} className="text-muted-foreground" />
            <Text className="font-medium text-muted-foreground">Cancel</Text>
          </Button>
        </View>
      </View>
    </Container>
  )
}