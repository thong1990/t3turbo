import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "~/shared/components/ui/avatar"
import { cn } from "@acme/ui"
import { Ionicons } from "~/shared/components/ui/icons"

interface UserAvatarProps {
  src?: string
  alt?: string
  size?: number // We'll use numeric size
  radius?: "none" | "sm" | "md" | "lg" | "full"
  isActive?: boolean
  isBot?: boolean
  className?: string
}

export const getInitials = (name?: string) => {
  if (!name) return ""
  const [firstName, lastName] = name.split(" ")
  return firstName[0] + (lastName?.[0] ?? "")
}

const getIconSize = (size?: number) => {
  if (!size) return 16
  return Math.max(12, size * 0.6) // scale icon size relative to avatar
}

export const UserAvatar = ({
  src,
  alt,
  size = 32,
  radius = "md",
  isActive,
  isBot,
  className,
}: UserAvatarProps) => {
  return (
    <span
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      <Avatar
        style={{
          width: size,
          height: size,
          borderRadius:
            radius === "full"
              ? 9999
              : radius === "lg"
                ? 12
                : radius === "md"
                  ? 8
                  : radius === "sm"
                    ? 4
                    : 0,
          backgroundColor: color,
        }}
        className={cn(className)}
      >
        {src ? (
          <AvatarImage source={{ uri: src }} alt={alt} />
        ) : (
          <AvatarFallback>{getInitials(alt)}</AvatarFallback>
        )}
      </Avatar>

      {isActive && (
        <span
          className={cn(
            "absolute block translate-x-1/2 translate-y-1/2 transform rounded-full",
            radius === "full" ? "right-1 bottom-1" : "right-0.5 bottom-0.5"
          )}
        >
          <span className="block h-2 w-2 rounded-full border border-slate-200 bg-green-600 shadow-md" />
        </span>
      )}

      {isBot && (
        <span
          className={cn(
            "absolute block translate-x-1/2 translate-y-1/2 transform rounded-full",
            radius === "full" ? "right-1 bottom-1" : "right-0.5 bottom-0.5"
          )}
        >
          <Ionicons
            name="robot-outline"
            className="text-accent-11 dark:text-accent-11"
            size={getIconSize(size)}
          />
        </span>
      )}
    </span>
  )
}
