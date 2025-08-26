export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface NavItem {
  label: string
  href: string
  icon?: string
}

export interface FeatureItem {
  title: string
  description: string
  icon: string
}

// NextAuth type extensions
declare module "next-auth" {
  interface User {
    id: string
    email: string
    role: string
    name: string
    employeeId: string
  }

  interface Session {
    user: {
      id: string
      email: string
      role: string
      name: string
      employeeId: string
    }
  }
}
