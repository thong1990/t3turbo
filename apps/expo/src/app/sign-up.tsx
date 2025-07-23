import { Link } from "expo-router"
import React from "react"
import { View } from "react-native"
import { SignUpPasswordForm } from "~/features/auth/components/sign-up-password-form"
import { SignUpPhoneForm } from "~/features/auth/components/sign-up-phone-form"
import { Container } from "~/shared/components/container"
// import { View } from "~/shared/components/View"
import { Header } from "~/shared/components/header"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/shared/components/ui/tabs"
import { Text } from "~/shared/components/ui/text"

export default function SignUpScreen() {
  const [activeTab, setActiveTab] = React.useState("password")

  return (
    <Container>
      <Header title="Sign up" hasBackButton />
      <View className="flex-1 gap-y-4 px-4 py-4">
        <Text variant="largeTitle">Create an account</Text>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex-row">
            <TabsTrigger className="flex-1" value="password">
              <Text>Password</Text>
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="phone">
              <Text>Phone</Text>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="password" className="gap-y-4">
            <SignUpPasswordForm />
          </TabsContent>
          <TabsContent value="phone">
            <SignUpPhoneForm />
          </TabsContent>
          <Link asChild href="/login" replace>
            <Text variant="body" className="text-center">
              Already have an account? Sign in
            </Text>
          </Link>
        </Tabs>
      </View>
    </Container>
  )
}
