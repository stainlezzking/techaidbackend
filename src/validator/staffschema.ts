import { z } from "zod";

export const staffSignupSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type StaffSignupInput = z.infer<typeof staffSignupSchema>;
