import { useContext, useRef, useState } from "react"
import { Pressable, TextInput, View } from "react-native"

import {
    GroupChannelContexts,
    type GroupChannelModule,
    useSendbirdChat
} from "@sendbird/uikit-react-native"

import { useUser } from "~/features/supabase/hooks"
import { Ionicons } from "~/shared/components/ui/icons"
import { handleError } from "~/shared/utils/error-handler"

import { MessageTemplates } from "./MessageTemplates"

export const MessageInput: GroupChannelModule['Input'] = () => {
    const { channel } = useContext(GroupChannelContexts.Fragment)
    const { sdk } = useSendbirdChat()
    const { data: user } = useUser()
    const [message, setMessage] = useState("")
    const inputRef = useRef<TextInput>(null)

    const sendMessage = async (text: string) => {
        if (!channel || !text.trim()) return

        try {
            const params = {
                message: text.trim(),
            }
            await channel.sendUserMessage(params)
            setMessage("") // Clear the input after sending
        } catch (error) {
            handleError(error instanceof Error ? error : new Error(String(error)), {
                action: 'send_message',
                screen: 'MessageInput'
            })
        }
    }

    return (
        <View className="relative z-[100] bg-background">
            <View className="border-border border-t">
                <View className="flex-row items-center gap-3 px-3 py-2">
                    <View className="flex-1">
                        <TextInput
                            ref={inputRef}
                            className="h-11 rounded-full border-2 border-border bg-background px-4 py-2 text-base text-foreground"
                            placeholder="Type a message..."
                            placeholderTextColor="#999"
                            value={message}
                            onChangeText={setMessage}
                            multiline={false}
                            textAlignVertical="center"
                            returnKeyType="send"
                            onSubmitEditing={() => message.trim() && sendMessage(message)}
                            blurOnSubmit={false}
                            autoCorrect={true}
                            autoCapitalize="sentences"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 2,
                                elevation: 2,
                            }}
                        />
                    </View>

                    <MessageTemplates onTemplateSelect={sendMessage} />

                    <Pressable
                        onPress={() => message.trim() && sendMessage(message)}
                        disabled={!message.trim()}
                        className={`rounded-full border-2 p-2 shadow-sm ${message.trim()
                            ? "border-primary bg-primary"
                            : "border-muted bg-muted opacity-50"
                            }`}
                        hitSlop={8}
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: message.trim() ? 0.15 : 0.05,
                            shadowRadius: 4,
                            elevation: message.trim() ? 4 : 2,
                        }}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={message.trim() ? "#ffffff" : "#666666"}
                        />
                    </Pressable>
                </View>
            </View>
        </View>
    )
} 