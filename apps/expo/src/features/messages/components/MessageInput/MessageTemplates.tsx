import { useState } from "react"
import { Pressable, View } from "react-native"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"

interface MessageTemplatesProps {
    onTemplateSelect: (template: string) => void
}

const chatTemplates = [
    {
        text: "Added you as friend",
        icon: "person-add" as const,
        color: "#22c55e",
    },
    {
        text: "Accept you as friend",
        icon: "checkmark-circle" as const,
        color: "#3b82f6",
    },
    {
        text: "Sent my offer",
        icon: "paper-plane" as const,
        color: "#f59e0b",
    },
    {
        text: "Accepted your offer",
        icon: "thumbs-up" as const,
        color: "#10b981",
    },
    {
        text: "Thank you!",
        icon: "heart" as const,
        color: "#ef4444",
    },
]

export function MessageTemplates({ onTemplateSelect }: MessageTemplatesProps) {
    const [showTemplates, setShowTemplates] = useState(false)

    function handleTemplateSelect(template: string) {
        setShowTemplates(false)
        onTemplateSelect(template)
    }

    return (
        <View className="relative">
            {/* Dropdown Menu */}
            {showTemplates && (
                <>
                    {/* Backdrop to close dropdown */}
                    <Pressable
                        className="absolute inset-0 z-40"
                        style={{
                            position: 'absolute',
                            top: -1000,
                            left: -1000,
                            right: -1000,
                            bottom: -1000,
                        }}
                        onPress={() => setShowTemplates(false)}
                    />

                    {/* Dropdown content */}
                    <View
                        className="absolute right-0 bottom-12 z-50 w-48 rounded-xl border border-border bg-background shadow-lg"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 8,
                        }}
                    >
                        <View className="border-border border-b px-3 py-2">
                            <Text className="text-center font-medium text-foreground text-sm">
                                Quick Messages
                            </Text>
                        </View>

                        <View className="py-1">
                            {chatTemplates.map((template, index) => (
                                <View key={template.text}>
                                    <Pressable
                                        onPress={() => handleTemplateSelect(template.text)}
                                        className="mx-1 rounded-lg px-3 py-2.5 active:bg-muted/70"
                                        style={{
                                            minHeight: 40, // Ensure good touch target
                                        }}
                                    >
                                        <View className="flex-row items-center gap-2.5">
                                            <View
                                                className="h-6 w-6 items-center justify-center rounded-full"
                                                style={{ backgroundColor: `${template.color}15` }}
                                            >
                                                <Ionicons
                                                    name={template.icon}
                                                    size={14}
                                                    color={template.color}
                                                />
                                            </View>
                                            <Text className="flex-1 text-foreground text-sm leading-5">
                                                {template.text}
                                            </Text>
                                        </View>
                                    </Pressable>

                                    {/* Divider line - don't show after last item */}
                                    {index < chatTemplates.length - 1 && (
                                        <View className="mx-3 my-0.5 h-px bg-border/50" />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                </>
            )}

            {/* Toggle Button */}
            <Pressable
                onPress={() => setShowTemplates(!showTemplates)}
                className={`rounded-full p-2 ${showTemplates ? "bg-primary" : "bg-muted"
                    }`}
                hitSlop={8}
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
            >
                <Ionicons
                    name={showTemplates ? "close" : "add"}
                    size={20}
                    color={showTemplates ? "#ffffff" : "#666666"}
                />
            </Pressable>
        </View>
    )
} 