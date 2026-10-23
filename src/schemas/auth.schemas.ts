import { email, z } from "zod";

export const registerBodySchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be less than 100 characters long")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/\d/, "Password must contain a number")
    .regex(/[@$!%*?&]/, "Password must contain a special character")
    .regex(/^[A-Za-z\d@$!%*?&]+$/, "Password contains an invalid character"),
  name: z.string().min(3).max(100),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be less than 100 characters long")
    .regex(/^[A-Za-z\d@$!%*?&]+$/, "Password contains an invalid character"),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().nonempty("Refresh token is required"),
});