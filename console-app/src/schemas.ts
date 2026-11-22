import { z } from 'zod';

// Validation schemas for the onboarding form, powered by Zod (no hand-rolled
// regex). Each field carries its own message; the form shows the first issue.
// Checks run in order, so "required" fires before "invalid format".

export const accountSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Password is required.')
    .min(8, 'Password must be at least 8 characters.'),
});

export const collectiveSchema = z.object({
  collectiveName: z.string().trim().min(1, 'Collective name is required.'),
});

// Adding a member from the console — same email rule as signup.
export const newMemberSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
});

// Login only needs a well-formed email and a non-empty password — it must not
// enforce the signup password policy (existing passwords predate any rule).
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

// Returns the first validation error message, or null if the input is valid.
export function firstError(schema: z.ZodTypeAny, value: unknown): string | null {
  const result = schema.safeParse(value);
  return result.success ? null : result.error.issues[0].message;
}
