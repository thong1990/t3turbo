import { z } from "zod"

export const emailSchema = z.string().email("Invalid email address")

export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(1, { message: "Password is required" })
  .min(6, { message: "Password must be more than 6 characters" })
  .max(32, { message: "Password must be less than 32 characters" })

export const phoneSchema = z.string({ required_error: "Phone is required" })

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type LoginSchema = z.infer<typeof loginSchema>
export type SignupSchema = z.infer<typeof signupSchema>
