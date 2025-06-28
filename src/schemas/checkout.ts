import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(7, "Phone is required")
    .regex(/^[+0-9\s-]+$/, "Invalid phone number"),
  address: z.string().min(5, "Address is required"),
  note: z.string().max(500, "Note is too long").optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
