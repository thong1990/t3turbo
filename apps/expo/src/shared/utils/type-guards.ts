// Type guards for safer type checking

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function isString(value: unknown): value is string {
  return typeof value === "string"
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value)
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function isNonEmptyArray<T>(value: T[]): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export function hasProperty<T, K extends string>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return obj !== null && typeof obj === "object" && prop in obj
}

// Card-specific type guards
export function isValidCard(obj: unknown): obj is { id: string; name: string } {
  return (
    isObject(obj) &&
    hasProperty(obj, "id") &&
    hasProperty(obj, "name") &&
    isNonEmptyString(obj.id) &&
    isNonEmptyString(obj.name)
  )
}

// User-specific type guards
export function isValidUser(obj: unknown): obj is { id: string; email?: string } {
  return (
    isObject(obj) &&
    hasProperty(obj, "id") &&
    isNonEmptyString(obj.id)
  )
}

// Utility for safely accessing nested properties
export function safeGet<T>(
  obj: unknown,
  path: string[],
  defaultValue?: T
): T | undefined {
  let current = obj
  for (const key of path) {
    if (!isObject(current) || !hasProperty(current, key)) {
      return defaultValue
    }
    current = current[key]
  }
  return current as T
}