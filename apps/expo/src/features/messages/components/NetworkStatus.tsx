import NetInfo from "@react-native-community/netinfo"
import { useEffect, useState } from "react"
import { View } from "react-native"
import { Ionicons } from "~/shared/components/ui/icons"
import { Text } from "~/shared/components/ui/text"

interface NetworkStatusProps {
    showWhenOnline?: boolean
}

export function NetworkStatus({ showWhenOnline = false }: NetworkStatusProps) {
    const [isConnected, setIsConnected] = useState(true)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? false)
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [])

    if (isLoading) {
        return null
    }

    if (isConnected && !showWhenOnline) {
        return null
    }

    return (
        <View
            className={`flex-row items-center justify-center px-3 py-2 ${isConnected ? "bg-green-50" : "bg-red-50"
                }`}
        >
            <Ionicons
                name={isConnected ? "checkmark-circle-outline" : "alert-circle-outline"}
                size={16}
                className={isConnected ? "text-green-600" : "text-red-600"}
            />
            <Text
                className={`ml-2 text-xs ${isConnected ? "text-green-800" : "text-red-800"
                    }`}
            >
                {isConnected ? "Connected" : "You're offline"}
            </Text>
        </View>
    )
} 