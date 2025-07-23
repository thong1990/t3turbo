import { Text } from "~/shared/components/ui/text"

interface RelativeDateTimeProps {
    date: number | string | Date
    className?: string
}

export function RelativeDateTime({ date, className }: RelativeDateTimeProps) {
    const formatTime = (timestamp: number | string | Date) => {
        const messageDate = new Date(timestamp)
        const now = new Date()
        const diffInMs = now.getTime() - messageDate.getTime()
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

        // If it's today, show time
        if (diffInDays === 0) {
            if (diffInMinutes < 1) {
                return "Just now"
            }
            if (diffInMinutes < 60) {
                return `${diffInMinutes}m ago`
            }
            return messageDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        }

        // If it's yesterday
        if (diffInDays === 1) {
            return `Yesterday ${messageDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })}`
        }

        // If it's within this week
        if (diffInDays < 7) {
            return messageDate.toLocaleDateString([], {
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        }

        // Older messages
        return messageDate.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
    }

    return (
        <Text className={className}>
            {formatTime(date)}
        </Text>
    )
} 