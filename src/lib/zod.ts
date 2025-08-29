import { object, string, enum as zodEnum } from "zod"
 
export const signInSchema = object({
  email: string({message: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({message: "Password is required" })
    .min(5, "Password must be more than 5 characters")
    .max(20, "Password must be less than 20 characters"),
})

export const registerSchema = object({
  name: string({message: "Name is required"})
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: string({message: "Email is required"})
    .min(1, "Email is required")
    .email("Invalid email"),
  employeeId: string({message: "Employee ID is required"})
    .min(1, "Employee ID is required")
    .max(50, "Employee ID must be less than 50 characters"),
  phone: string().optional(),
  password: string({message: "Password is required"})
    .min(5, "Password harus lebih dari 5 karakter")
    .max(20, "Password harus kurang dari 20 karakter"),
  confirmPassword: string({message: "Confirm password is required"})
    .min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const adminRegisterSchema = object({
  name: string({message: "Name is required"})
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: string({message: "Email is required"})
    .min(1, "Email is required")
    .email("Invalid email"),
  employeeId: string({message: "Employee ID is required"})
    .min(1, "Employee ID is required")
    .max(50, "Employee ID must be less than 50 characters"),
  phone: string().optional(),
  password: string({message: "Password is required"})
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
  secretKey: string({message: "Secret key is required"})
    .min(6, "Secret key is required")
    .max(6, "Secret key must be 6 characters"),
})

export const vehicleRegisterSchema = object({
  name: string({message: "Vehicle name is required"})
    .min(1, "Vehicle name is required")
    .max(100, "Vehicle name must be less than 100 characters"),
  plate: string({message: "License plate is required"})
    .min(1, "License plate is required")
    .max(20, "License plate must be less than 20 characters")
    .regex(/^[A-Z0-9\s]+$/, "License plate must contain only uppercase letters, numbers, and spaces"),
  type: zodEnum(["BENSIN", "DIESEL", "ELECTRIC"], {
    message: "Please select a valid vehicle type"
  }),
  year: string({message: "Year is required"})
    .min(4, "Year must be at least 4 characters")
    .max(4, "Year must be 4 characters"),
})

export const profileUpdateSchema = object({
  name: string({message: "Name is required"})
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  phone: string().optional(),
  division: zodEnum(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"], {
    message: "Please select a valid division"
  }),
})

export const passwordChangeSchema = object({
  newPassword: string({message: "New password is required"})
    .min(5, "New password must be at least 5 characters")
    .max(20, "New password must be less than 20 characters"),
})