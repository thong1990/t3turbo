import { router } from "expo-router"
import { ScrollView, View } from "react-native"
import { toast } from "sonner-native"

import { Container } from "~/shared/components/container"
import { Header } from "~/shared/components/header"
import { useAppForm } from "~/shared/components/ui/form"
import { Text } from "~/shared/components/ui/text"

import { useUserProfile } from "~/features/auth/hooks/use-user-profile"
import { useUser } from "~/features/supabase/hooks"

export default function EditProfileScreen() {
  const { data: user } = useUser()
  const {
    profile,
    updateProfile,
    createProfile,
    isUpdating,
    isCreating,
    updateError,
    createError,
  } = useUserProfile()

  const form = useAppForm({
    defaultValues: {
      display_name: profile?.display_name ?? "",
      game_account_id: profile?.game_account_id ?? "",
      game_account_ign: profile?.game_account_ign ?? "",
      avatar_url: profile?.avatar_url ?? "",
    },
    onSubmit: async ({ value }) => {
      if (!user) {
        toast.error("You must be logged in to update your profile")
        return
      }

      try {
        const trimmedData = {
          display_name: value.display_name.trim() || null,
          game_account_id: value.game_account_id.trim() || null,
          game_account_ign: value.game_account_ign.trim() || null,
          avatar_url: value.avatar_url.trim() || null,
        }

        if (profile) {
          // Update existing profile
          await new Promise<void>((resolve, reject) => {
            updateProfile(trimmedData, {
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
        } else {
          // Create new profile
          await new Promise<void>((resolve, reject) => {
            createProfile(trimmedData, {
              onSuccess: () => {
                toast.success("Profile created successfully!")
                router.back()
                resolve()
              },
              onError: (error: Error) => {
                toast.error(`Failed to create profile: ${error.message}`)
                reject(error)
              },
            })
          })
        }
      } catch (error) {
        toast.error("Something went wrong. Please try again.")
      }
    },
  })

  const isLoading = isUpdating || isCreating
  const hasError = updateError || createError

  return (
    <>
      <Container>
        <Header title="Edit Profile" hasBackButton />
        <form.AppForm>
          <ScrollView
            className="gap-y-4 px-4 py-4"
            showsVerticalScrollIndicator={false}
          >
            <View>
              <Text variant="title1" className="mb-2">
                Personal Information
              </Text>
              <Text className="mb-6 text-muted-foreground">
                Update your profile information and game details
              </Text>
            </View>

            <form.Section>
              <form.AppField name="display_name">
                {field => (
                  <field.Item>
                    <field.TextInput placeholder="Enter your display name" />
                  </field.Item>
                )}
              </form.AppField>

              <form.AppField name="game_account_id">
                {field => (
                  <field.Item>
                    <field.TextInput placeholder="Enter your game account ID" />
                    <Text className="text-muted-foreground text-sm">
                      Your unique game account identifier
                    </Text>
                  </field.Item>
                )}
              </form.AppField>

              <form.AppField name="game_account_ign">
                {field => (
                  <field.Item>
                    <field.TextInput placeholder="Enter your in-game name" />
                    <Text className="text-muted-foreground text-sm">
                      Your display name in the game
                    </Text>
                  </field.Item>
                )}
              </form.AppField>

              <form.AppField name="avatar_url">
                {field => (
                  <field.Item>
                    <field.TextInput
                      placeholder="https://example.com/avatar.jpg"
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                    <Text className="text-muted-foreground text-sm">
                      Link to your profile picture
                    </Text>
                  </field.Item>
                )}
              </form.AppField>
            </form.Section>

            {/* Error Message */}
            {hasError && (
              <View className="rounded-lg bg-destructive/10 p-4">
                <Text className="text-destructive text-sm">
                  {updateError?.message ||
                    createError?.message ||
                    "An error occurred"}
                </Text>
              </View>
            )}

            {/* Save Button */}
            <form.SubmitButton
              variant="primary"
              disabled={isLoading}
              className="mt-4"
              loadingText="Saving..."
            >
              <Text className="font-semibold text-primary-foreground">
                {profile ? "Update Profile" : "Create Profile"}
              </Text>
            </form.SubmitButton>
          </ScrollView>
        </form.AppForm>
      </Container>
    </>
  )
}
