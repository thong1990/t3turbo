import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
  formatDistanceToNow,
} from "date-fns"
import { useEffect, useMemo, useState } from "react"
// import { useTranslation } from "react-i18next"
import { Pressable, type TextProps } from "react-native"
import Animated, { FadeOut } from "react-native-reanimated"

const formatTemplateString = "PPp"

const formatTime = (
  date: string | Date,
  relativeBeforeDay?: number,
  template = formatTemplateString
) => {
  const dateObj = typeof date === "string" ? new Date(date) : date

  if (
    relativeBeforeDay &&
    Math.abs(differenceInDays(dateObj, new Date())) > relativeBeforeDay
  ) {
    return format(dateObj, template)
  }
  return formatDistanceToNow(dateObj)
}

const getUpdateInterval = (date: string | Date, relativeBeforeDay?: number) => {
  if (!relativeBeforeDay) return null
  const dateObj = typeof date === "string" ? new Date(date) : date
  const diffInSeconds = Math.abs(differenceInSeconds(dateObj, new Date()))
  if (diffInSeconds <= 60) {
    return 1000 // Update every second
  }
  const diffInMinutes = Math.abs(differenceInMinutes(dateObj, new Date()))
  if (diffInMinutes <= 60) {
    return 60000 // Update every minute
  }
  const diffInHours = Math.abs(differenceInHours(dateObj, new Date()))
  if (diffInHours <= 24) {
    return 3600000 // Update every hour
  }
  const diffInDays = Math.abs(differenceInDays(dateObj, new Date()))
  if (diffInDays <= relativeBeforeDay) {
    return 86400000 // Update every day
  }
  return null // No need to update
}

interface RelativeDateTimeProps extends TextProps {
  date: string | Date
  displayAbsoluteTimeAfterDay?: number
  dateFormatTemplate?: string
  postfixText?: string
}

export const RelativeDateTime = ({
  date,
  displayAbsoluteTimeAfterDay,
  dateFormatTemplate,
  postfixText,
  ...props
}: RelativeDateTimeProps) => {
  // const { t } = useTranslation("common")
  const [relative, setRelative] = useState<string>(() =>
    formatTime(date, displayAbsoluteTimeAfterDay, dateFormatTemplate)
  )

  const memoizedFormatTime = useMemo(() => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, dateFormatTemplate ?? formatTemplateString)
  }, [date, dateFormatTemplate])

  const [mode, setMode] = useState<"relative" | "absolute">("relative")

  useEffect(() => {
    if (mode === "absolute") return
    if (!displayAbsoluteTimeAfterDay) return
    const interval = setInterval(() => {
      setRelative(
        formatTime(date, displayAbsoluteTimeAfterDay, dateFormatTemplate)
      )
    }, getUpdateInterval(date, displayAbsoluteTimeAfterDay) ?? 1000)
    return () => clearInterval(interval)
  }, [date, displayAbsoluteTimeAfterDay, dateFormatTemplate, mode])

  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        setMode(mode => (mode === "relative" ? "absolute" : "relative"))
      }}
    >
      <Animated.Text {...props} key={mode} exiting={FadeOut}>
        {mode === "relative"
          ? `${relative}${postfixText ?? " ago"}`
          : memoizedFormatTime}
      </Animated.Text>
    </Pressable>
  )
}
