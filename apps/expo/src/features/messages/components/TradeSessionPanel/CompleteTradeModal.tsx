import { Modal, View } from "react-native"
import { Button } from "~/shared/components/ui/button"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"

interface CompleteTradeModalProps {
    visible: boolean
    isLoading: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function CompleteTradeModal({
    visible,
    isLoading,
    onConfirm,
    onCancel,
}: CompleteTradeModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View className="flex-1 items-center justify-center bg-black/50 px-6">
                <View className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
                    {/* Icon */}
                    <View className="mb-4 items-center">
                        <View className="h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <Ionicons
                                name="checkmark-circle"
                                size={32}
                                className="text-green-600"
                            />
                        </View>
                    </View>

                    {/* Title */}
                    <Text className="mb-2 text-center font-semibold text-foreground text-lg">
                        Complete Trade
                    </Text>

                    {/* Description */}
                    <Text className="mb-6 text-center text-muted-foreground text-sm leading-5">
                        Are you sure you want to complete this trade? This action cannot be undone and will finalize the exchange.
                    </Text>

                    {/* Buttons */}
                    <View className="flex-row gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onPress={onCancel}
                            disabled={isLoading}
                        >
                            <Text className="text-muted-foreground">Cancel</Text>
                        </Button>

                        <Button
                            className="flex-1"
                            onPress={onConfirm}
                            disabled={isLoading}
                        >
                            <Text className="text-primary-foreground">
                                {isLoading ? "Completing..." : "Complete Trade"}
                            </Text>
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    )
} 