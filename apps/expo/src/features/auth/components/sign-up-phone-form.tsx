import { mergeForm, useTransform } from "@tanstack/react-form"
import { View } from "react-native"
import { useAppForm } from "~/shared/components/ui/form"
import { Text } from "~/shared/components/ui/text"
import { useSignInWithOtp } from "~/features/supabase/hooks"
import { phoneSchema } from "../validation"

const FieldsSchema = phoneSchema

export function SignUpPhoneForm() {
  const { mutateAsync: signUpAction, data, error } = useSignInWithOtp()

  const form = useAppForm({
    defaultValues: {
      phone: "+60123336868",
    },
    onSubmit: async ({ value }) => {
      await signUpAction({
        phone: value.phone,
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
        <form.AppField name="phone">
          {field => (
            <field.Item>
              <field.LeftLabel>Phone number</field.LeftLabel>
              <field.TextInput
                id="phone"
                placeholder="Enter your phone number"
                value={field.state.value}
                onChangeText={text => field.handleChange(text)}
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
      {/* {error && (
        <Muted className="mb-4 text-center text-destructive">
          {error.message}
        </Muted>
      )} */}
    </form.AppForm>
  )
}
