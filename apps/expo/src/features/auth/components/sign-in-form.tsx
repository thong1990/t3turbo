import { Platform, View } from "react-native"
import { useSignInWithEmailPassword } from "~/features/supabase/hooks"
import { useAppForm } from "~/shared/components/ui/form"
import { Text } from "~/shared/components/ui/text"
import { loginSchema } from "../validation"

const FieldsSchema = loginSchema

export function SignInForm() {
  const { mutateAsync: signInWithPassword } = useSignInWithEmailPassword()

  const form = useAppForm({
    defaultValues: { email: "darris@mindworks.xyz", password: "123qwe" },
    validators: { onSubmit: FieldsSchema },
    onSubmit: async ({ value }) => {
      await signInWithPassword({
        email: value.email,
        password: value.password,
      })
    },
  })

  return (
    <form.AppForm>
      <View className="w-full max-w-md gap-y-2">
        <form.AppField
          name="email"
          validators={{ onBlur: FieldsSchema.shape.email }}
        >
          {field => (
            <field.Item>
              <field.TextInput
                label={Platform.select({
                  ios: "Email",
                  default: "Email",
                })}
                placeholder="Required"
              />
            </field.Item>
          )}
        </form.AppField>
        <form.Separator />
        <form.AppField
          name="password"
          validators={{ onBlur: FieldsSchema.shape.password }}
        >
          {field => (
            <field.Item>
              <field.TextInput
                label={Platform.select({
                  ios: "Password",
                  default: "Password",
                })}
                placeholder="Required"
                secureTextEntry
              />
            </field.Item>
          )}
        </form.AppField>
      </View>
      <form.SubmitButton className="w-full" loadingText="Signing in...">
        <Text>Sign in</Text>
      </form.SubmitButton>
      {form.state.errors && Object.keys(form.state.errors).length > 0 && (
        <Text className="my-4 text-center text-destructive">
          {Object.values(form.state.errors).flat().join(", ")}
        </Text>
      )}
      <Text>{form.state.isSubmitting ? "Pending" : "Not pending"}</Text>
    </form.AppForm>
  )
}
