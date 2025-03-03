import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const permissionSchema = z.object({
    name: z.string().min(3, "Permission name must be at least 3 characters").max(50, "Permission name must be less than 50 characters"),
    description: z.string().min(5, "Description must be at least 5 characters").optional(),
});


export const loanRequestSchema = z.object({
    amount: z
        .coerce.number()
        .min(1000, "Minimum loan amount is ₦1,000")
        .max(1000000, "Maximum loan amount is ₦1,000,000")
        .refine((val) => val % 100 === 0, {
            message: "Loan amount must be in multiples of ₦100",
        }),
});
