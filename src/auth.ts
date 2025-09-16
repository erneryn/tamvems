import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import {db} from "./lib/db"
import { signInSchema } from "./lib/zod"
import { compareSync } from "bcrypt-ts"

export class LoginError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;             // v5 exposes this on the thrown AuthError
  }
}


export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
        
          // Validate input with Zod schema
          const validatedData = signInSchema.safeParse(credentials)
          
          if (!validatedData.success) {
            console.log('Validation failed:', validatedData.error.issues)
            // Store validation error in a way NextAuth can access
            throw new LoginError("VALIDATION_ERROR")
          }
          
          const { email, password } = validatedData.data
          
          // Find user in database
          const user = await db.user.findUnique({
            where: { email: email as string },
            select: {
              id: true,
              email: true,
              password: true,
              isActive: true,
              role: true,
              name: true,
            },
          })
          
          if (!user) {
            throw new LoginError("USER_NOT_FOUND")
          }
          
          // Check if user is active
          if (!user.isActive) {
            throw new LoginError("USER_NOT_ACTIVE")
          }
          
          // Verify password
          const isValid = compareSync(password as string, user.password as string)
          if (!isValid) {
            throw new LoginError("INVALID_PASSWORD")
          }
          
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
          }
        } catch (error) {          
          // Re-throw our custom errors so they can be handled properly
          if (error instanceof Error) {
            throw error
          }
          
          // For any unexpected errors, throw a generic error
          throw new LoginError("UNKNOWN_ERROR")
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      return !!user
    },
    async jwt({ token, user }) {
      // Include role in JWT token when user signs in
      if (user) {
        token.role = user.role
        token.id = user.id
        token.name = user.name  
        token.employeeId = user.employeeId
      }
      return token
    },
    session({ session, token }) { 
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string
      }
      return session
    },
  },
})