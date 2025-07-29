import { Ionicons } from "~/shared/components/ui/icons"
import { Link, router } from "expo-router"
import { View } from "react-native"
import { BannerAd } from "~/features/ads/components/BannerAd"
import { useUserProfile } from "~/features/auth/hooks/use-user-profile"
// import { useSubscription } from "~/features/subscription"
// import { usePaywallPlacements } from "~/features/subscription"
import { Container } from "~/shared/components/container"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/shared/components/ui/avatar"
import { Button } from "~/shared/components/ui/button"
import {
  ListMenu,
  ListMenuItem,
  ListMenuSection,
  ListMenuTitle,
} from "~/shared/components/ui/list-menu"
import { Text } from "~/shared/components/ui/text"
import { useColorScheme } from "~/shared/hooks"
import { useSignOut, useUser } from "~/features/supabase/hooks"

export default function ProfileScreen() {
  const { data: user } = useUser()
  const { mutate: signOut } = useSignOut()
  const { profile } = useUserProfile()
  const { colorScheme } = useColorScheme()
  const isSubscribed = false
  const subscriptionStatus = null
  const triggerProfileSubscribePaywall = () => {}

  const handleEditProfile = () => {
    router.push("/profile/edit")
  }

  const handleSubscribe = () => {
    triggerProfileSubscribePaywall()
  }

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name
    if (user?.email) return user.email.split("@")[0]
    return "User"
  }

  const getAvatarUrl = () => {
    return profile?.avatar_url || user?.user_metadata?.avatar_url
  }

  return (
    <>
      <Container>
        <View className="flex-1 gap-4 px-4 py-4">
          <View className="flex-row items-center gap-4">
            <Avatar alt="User avatar" className="h-20 w-20">
              <AvatarImage src={getAvatarUrl()} />
              <AvatarFallback>
                <Ionicons
                  name="person-circle"
                  size={80}
                  className="text-foreground"
                />
              </AvatarFallback>
            </Avatar>
            {user ? (
              <View className="flex-1">
                <Text variant="title1" className="pb-1">
                  {getDisplayName()}
                </Text>
                <Text
                  className="font-semibold text-foreground text-lg"
                  onPress={handleEditProfile}
                  suppressHighlighting
                >
                  Update profile details
                </Text>
              </View>
            ) : (
              <View className="flex-1">
                <Text variant="title1" className="pb-1">
                  Not logged in
                </Text>
                <View className="flex-row items-center gap-1">
                  <Link href="/login" asChild>
                    <Text
                      className="text-foreground text-lg"
                      suppressHighlighting
                    >
                      Log in to see your profile
                    </Text>
                  </Link>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colorScheme === "dark" ? "#ffffff" : "#6b7280"}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Game Profile Section */}
          {user && (
            <View className="gap-2">
              <ListMenuTitle>Game Profile</ListMenuTitle>

              <ListMenu>
                <ListMenuSection
                  items={[
                    <ListMenuItem
                      key="appId"
                      label="App ID"
                      value={user?.id || "Not available"}
                      showChevron={false}
                    />,
                    <ListMenuItem
                      key="gameId"
                      label="Game ID"
                      value={profile?.game_account_id || "Not set"}
                      showChevron={true}
                      onPress={handleEditProfile}
                    />,
                    <ListMenuItem
                      key="gameName"
                      label="Game Name"
                      value={profile?.game_account_ign || "Not set"}
                      showChevron={true}
                      onPress={handleEditProfile}
                    />,
                  ]}
                />
              </ListMenu>
            </View>
          )}

          {/* Subscription Section */}
          {user && (
            <View className="gap-2">
              <ListMenuTitle>Subscription</ListMenuTitle>
              <View className="rounded-lg bg-card p-4">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text variant="title2" className="text-foreground">
                    {isSubscribed ? "Poketrade Pro" : "Free Plan"}
                  </Text>
                  <View className={`rounded-full px-2 py-1 ${isSubscribed ? "bg-green-100" : "bg-gray-100"}`}>
                    <Text className={`font-medium text-xs ${isSubscribed ? "text-green-700" : "text-gray-600"}`}>
                      {isSubscribed ? "Active" : "Free"}
                    </Text>
                  </View>
                </View>
                
                <Text className="mb-3 text-muted-foreground text-sm">
                  {isSubscribed 
                    ? "You're enjoying ad-free trading and premium features."
                    : "Upgrade to Pro for an ad-free experience and exclusive features."
                  }
                </Text>
                
                {!isSubscribed && (
                  <Button onPress={handleSubscribe} className="w-full">
                    <Text className="font-medium text-primary-foreground">
                      Subscribe to Pro
                    </Text>
                  </Button>
                )}
                
                {isSubscribed && subscriptionStatus && (
                  <View className="mt-2">
                    <Text className="text-muted-foreground text-xs">
                      Status: {subscriptionStatus.status}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View className="gap-2">
            <ListMenuTitle>Settings</ListMenuTitle>
            <ListMenu>
              <ListMenuSection
                items={[
                  <ListMenuItem
                    key="preferences"
                    label="Preferences"
                    onPress={() => router.push("/profile/preferences")}
                  />,
                  <ListMenuItem
                    key="logout"
                    label="Logout"
                    onPress={signOut}
                    disabled={!user}
                  />,
                ]}
              />
            </ListMenu>
          </View>

          {/* About Section */}
          <View>
            <ListMenuTitle>About</ListMenuTitle>
            <ListMenu>
              <ListMenuSection
                items={[
                  <ListMenuItem
                    key="terms"
                    label="Terms of service"
                    onPress={() => {}}
                  />,
                  <ListMenuItem
                    key="privacy"
                    label="Privacy policy"
                    onPress={() => {}}
                  />,
                  <ListMenuItem
                    key="version"
                    label="Version"
                    value="1.0.0"
                    showChevron={false}
                  />,
                ]}
              />
            </ListMenu>
          </View>
        </View>
      </Container>
      <BannerAd placement="profile-bottom" />
    </>
  )
}
