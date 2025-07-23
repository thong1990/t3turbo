import { Pressable, View } from "react-native"
import { Ionicons } from "~/shared/components/ui/icons"
import { TextField } from "~/shared/components/ui/text-field"

interface MessageInputFieldProps {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  disabled: boolean
  canSend: boolean
  isLoading: boolean
  templateButton: React.ReactNode
}

export function MessageInputField({
  value,
  onChangeText,
  onSend,
  disabled,
  canSend,
  isLoading,
  templateButton,
}: MessageInputFieldProps) {
  return (
    <View className="bg-background">
      <View className="border-border border-t">
        <View className="flex-row items-center gap-3 px-3 py-2">
          <View className="flex-1">
            <TextField
              className="h-11 rounded-full border-2 border-border bg-background px-4 py-2 text-base shadow-sm"
              placeholder={disabled ? "Chat ended" : "Type a message..."}
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChangeText}
              multiline={false}
              editable={!disabled}
              textAlignVertical="center"
              returnKeyType="send"
              onSubmitEditing={onSend}
              submitBehavior="blurAndSubmit"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
              }}
            />
          </View>

          {!disabled && templateButton}

          <Pressable
            onPress={onSend}
            disabled={!canSend}
            className={`rounded-full border-2 p-2 shadow-sm ${
              canSend
                ? "border-primary bg-primary"
                : "border-muted bg-muted opacity-50"
            }`}
            hitSlop={8}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: canSend ? 0.15 : 0.05,
              shadowRadius: 4,
              elevation: canSend ? 4 : 2,
            }}
          >
            <Ionicons
              name={isLoading ? "hourglass" : "send"}
              size={20}
              color={canSend ? "#ffffff" : "#666666"}
            />
          </Pressable>
        </View>
      </View>
    </View>
  )
}
