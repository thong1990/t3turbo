import { mergeForm, useTransform } from "@tanstack/react-form"
import { View } from "react-native"
import { useAppForm } from "~/shared/components/ui/form"
import { Text } from "~/shared/components/ui/text"
import { useSignUpWithEmailAndPassword } from "~/features/supabase/hooks"
import { signupSchema } from "../validation"
import { toast } from "sonner-native"

const FieldsSchema = signupSchema

export function SignUpPasswordForm() {
  const {
    mutateAsync: signUpAction,
    data,
    error,
  } = useSignUpWithEmailAndPassword({
    onError: () => {
      toast.error("Error signing up")
    },
  })

  const form = useAppForm({
    defaultValues: {
      email: "aaa@gmail.com",
      password: "123qwe",
      confirmPassword: "123qwe",
    },
    validators: {
      onBlur: ({ value }) => {
        if (
          value.password &&
          value.confirmPassword &&
          value.password !== value.confirmPassword
        ) {
          return {
            fields: {
              confirmPassword: { message: "Passwords don't match" },
            },
          }
        }

        return null
      },
    },
    onSubmit: async ({ value }) => {
      await signUpAction({
        email: value.email,
        password: value.password,
        emailRedirectTo: "http://localhost:3000/auth/callback",
      })
    },
    transform: useTransform(
      baseForm =>
        mergeForm(baseForm, {
          errorMap: {
            onServer: error,
          },
        }),
      [data]
    ),
  })

  return (
    <form.AppForm>
      <View className="w-full max-w-md gap-y-2">
        <form.AppField name="email">
          {field => (
            <field.Item>
              <field.LeftLabel>Email address</field.LeftLabel>
              <field.TextInput
                id="email"
                placeholder="Enter your email"
                value={field.state.value}
                onChangeText={text => field.handleChange(text)}
              />
            </field.Item>
          )}
        </form.AppField>
        <form.AppField
          name="password"
          validators={{ onBlur: FieldsSchema.shape.password }}
        >
          {field => (
            <field.Item>
              <field.LeftLabel>Password</field.LeftLabel>
              <field.TextInput
                id="password"
                placeholder="Enter your password"
                value={field.state.value}
                onChangeText={text => field.handleChange(text)}
                secureTextEntry
              />
            </field.Item>
          )}
        </form.AppField>
        <form.AppField
          name="confirmPassword"
          validators={{
            onBlur: FieldsSchema.shape.confirmPassword,
          }}
        >
          {field => (
            <field.Item>
              <field.LeftLabel>Confirm Password</field.LeftLabel>
              <field.TextInput
                id="confirmPassword"
                placeholder="Confirm your password"
                value={field.state.value}
                onChangeText={text => field.handleChange(text)}
                secureTextEntry
              />
            </field.Item>
          )}
        </form.AppField>
        <form.SubmitButton
          className="w-full"
          loadingText="Signing up..."
          onPress={() => form.handleSubmit()}
        >
          <Text>Create account</Text>
        </form.SubmitButton>
      </View>
    </form.AppForm>
  )
}
