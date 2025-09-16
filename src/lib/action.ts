"use server"
import { signInSchema } from "./zod";
import { signIn, LoginError } from "@/auth";

export interface ActionState {
  success: boolean;
  error: string | null;
  data: { email: FormDataEntryValue | null; password: FormDataEntryValue | null };
  redirectTo?: string;
}

export const signInAction = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
  const validatedData = signInSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  const dataForm = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  if (!validatedData.success) {
    return {
      success: false,
      error: validatedData.error.issues[0].message,
      data: dataForm,
    };
  }

  const { email, password } = validatedData.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Return success and let the client handle the redirect
    return { 
      success: true, 
      data: dataForm, 
      error: null,
      redirectTo: "/admin/dashboard" // The middleware will handle role-based redirection
    };
  } catch (error) {
    console.log("SignIn Error:", error);
    // Handle Next.js redirect errors (these should be re-thrown)
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('NEXT_REDIRECT')) {
        // Re-throw redirect errors so they work properly
        throw error;
      }
    }

    if (error instanceof LoginError) {
      if (error.type === "CredentialsSignin") {
        switch (error.code) {
          case "USER_NOT_FOUND":
            return { success: false, data: dataForm, error: "Email tidak ditemukan" };
          case "INVALID_PASSWORD":
            return { success: false, data: dataForm, error: "Password salah" };
          case "USER_NOT_ACTIVE":
            return { success: false, data: dataForm, error: "Akun Anda tidak aktif. Hubungi administrator" };
          default:
            return { success: false, data: dataForm, error: "Email atau password salah" };
        }
      }
      return { success: false, data: dataForm, error: "Terjadi kesalahan saat login" };
    }

    return { success: false, data: dataForm, error: "Terjadi kesalahan saat login" };
  }
};
