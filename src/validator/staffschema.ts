import { z } from "zod";

export const staffSignupSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Za-z]/, { message: "Password must contain at least one letter (A-Z or a-z)" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[@$!%*?&]/, { message: "Password must contain at least one special character (@$!%*?&)" }),
});

export const staffLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

export type StaffSignupType = z.infer<typeof staffSignupSchema>;
export type staffLoginType = z.infer<typeof staffLoginSchema>;
