import { z } from 'zod'
import { VALIDATION_RULES } from '~/shared/constants/app'

// Reusable validation schemas
export const emailSchema = z
  .string()
  .min(VALIDATION_RULES.EMAIL.MIN_LENGTH, 'Email is too short')
  .max(VALIDATION_RULES.EMAIL.MAX_LENGTH, 'Email is too long')
  .regex(VALIDATION_RULES.EMAIL.REGEX, 'Please enter a valid email address')

export const passwordSchema = z
  .string()
  .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, 'Password must be at least 8 characters')
  .max(VALIDATION_RULES.PASSWORD.MAX_LENGTH, 'Password is too long')
  .refine((password) => {
    if (VALIDATION_RULES.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      return false
    }
    if (VALIDATION_RULES.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      return false
    }
    if (VALIDATION_RULES.PASSWORD.REQUIRE_NUMBER && !/\d/.test(password)) {
      return false
    }
    return true
  }, {
    message: 'Password must contain uppercase, lowercase, and a number',
  })

export const usernameSchema = z
  .string()
  .min(VALIDATION_RULES.USERNAME.MIN_LENGTH, 'Username is too short')
  .max(VALIDATION_RULES.USERNAME.MAX_LENGTH, 'Username is too long')
  .regex(VALIDATION_RULES.USERNAME.REGEX, 'Username can only contain letters, numbers, underscores, and hyphens')

// Common form schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const profileSchema = z.object({
  username: usernameSchema,
  displayName: z.string().min(1, 'Display name is required').max(50, 'Display name is too long'),
  bio: z.string().max(500, 'Bio is too long').optional(),
})

// Utility functions for validation
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0
  
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z\d]/.test(password)) score++
  if (password.length >= 12) score++
  
  if (score <= 2) return 'weak'
  if (score <= 4) return 'medium'
  return 'strong'
}

export type ValidationResult<T> = {
  success: true
  data: T
} | {
  success: false
  errors: string[]
}

export function safeValidate<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  return {
    success: false,
    errors: result.error.errors.map(err => err.message)
  }
}