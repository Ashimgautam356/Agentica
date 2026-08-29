"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, getApiError, type ApiResponse } from "@/lib/api";

type Customer = {
  id: string;
  email: string;
  apiKey: string | null;
  firstName: string | null;
  lastName: string | null;
  imageId: string | null;
};

type AuthResult = {
  token: string;
  customer: Customer;
};

type SignupInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

type AuthState = {
  customer: Customer | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
};

function rememberAuth(result: AuthResult) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("agentica_token", result.token);
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      customer: null,
      token: null,
      isLoading: false,
      error: null,
      message: null,

      async login(email, password) {
        set({ isLoading: true, error: null, message: null });

        try {
          const response = await api.post<ApiResponse<AuthResult>>("/auth/login", {
            email,
            password,
          });
          rememberAuth(response.data.data);
          set({
            customer: response.data.data.customer,
            token: response.data.data.token,
            isLoading: false,
          });
        } catch (error) {
          set({ error: getApiError(error, "Login failed."), isLoading: false });
          throw error;
        }
      },

      async signup(data) {
        set({ isLoading: true, error: null, message: null });

        try {
          const response = await api.post<ApiResponse<AuthResult>>("/auth/signup", data);
          rememberAuth(response.data.data);
          set({
            customer: response.data.data.customer,
            token: response.data.data.token,
            isLoading: false,
          });
        } catch (error) {
          set({ error: getApiError(error, "Signup failed."), isLoading: false });
          throw error;
        }
      },

      async forgotPassword(email) {
        set({ isLoading: true, error: null, message: null });

        try {
          await api.post<ApiResponse<{ email: string }>>("/auth/forgot-password", { email });
          set({
            isLoading: false,
            message: "Password reset instructions have been sent to your email.",
          });
        } catch (error) {
          set({
            error: getApiError(error, "Could not send reset instructions."),
            isLoading: false,
          });
          throw error;
        }
      },

      logout() {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("agentica_token");
        }

        set({ customer: null, token: null, error: null, message: null });
      },
    }),
    {
      name: "agentica_auth",
      partialize: (state) => ({ customer: state.customer, token: state.token }),
    },
  ),
);
