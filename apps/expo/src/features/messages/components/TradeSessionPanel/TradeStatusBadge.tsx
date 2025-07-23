import { View } from "react-native"
import { Text } from "~/shared/components/ui/text"

interface TradeStatusBadgeProps {
    status: string | null
}

export function TradeStatusBadge({ status }: TradeStatusBadgeProps) {
    // Map database status values to display config
    const getStatusConfig = (dbStatus: string | null) => {
        switch (dbStatus) {
            case "pending_acceptance":
                return {
                    color: "bg-orange-100",
                    text: "text-orange-800",
                    label: "Awaiting Response"
                }
            case "active":
                return {
                    color: "bg-blue-100",
                    text: "text-blue-800",
                    label: "Active"
                }
            case "completed":
                return {
                    color: "bg-green-100",
                    text: "text-green-800",
                    label: "Completed"
                }
            case "cancelled_by_initiator":
            case "rejected_by_receiver":
                return {
                    color: "bg-red-100",
                    text: "text-red-800",
                    label: "Cancelled"
                }
            case "expired":
                return {
                    color: "bg-gray-100",
                    text: "text-gray-800",
                    label: "Expired"
                }
            default:
                return {
                    color: "bg-gray-100",
                    text: "text-gray-800",
                    label: dbStatus || "Unknown"
                }
        }
    }

    const config = getStatusConfig(status)

    return (
        <View className={`rounded-full px-2 py-1 ${config.color}`}>
            <Text className={`font-medium text-xs ${config.text}`}>
                {config.label}
            </Text>
        </View>
    )
} 