"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, getApiError, type ApiResponse } from "@/lib/api";

export type Customer = {
  id: string;
  email: string;
  apiKey: string | null;
  firstName: string | null;
  lastName: string | null;
  imageId: string | null;
  dob: string | null;
  gender: string | null;
  age: number | null;
  contact: string | null;
  address: string | null;
  emailVerifiedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
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

type PasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type AuthState = {
  customer: Customer | null;
  token: string | null;
  hasHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  setHasHydrated: (hasHydrated: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  fetchCurrentCustomer: () => Promise<void>;
  updateCustomer: (data: Partial<Customer>) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  verifyEmail: (pin: string) => Promise<void>;
  regenerateApiKey: () => Promise<void>;
  updatePassword: (data: PasswordInput) => Promise<void>;
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
      hasHydrated: false,
      isLoading: false,
      error: null,
      message: null,

      setHasHydrated(hasHydrated) {
        set({ hasHydrated });
      },

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

      async fetchCurrentCustomer() {
        set({ isLoading: true, error: null });

        try {
          const response = await api.get<ApiResponse<Customer>>("/auth/me");
          set({ customer: response.data.data, isLoading: false });
        } catch (error) {
          set({ error: getApiError(error, "Could not load profile."), isLoading: false });
          throw error;
        }
      },

      async updateCustomer(data) {
        const customer = useAuthStore.getState().customer;

        if (!customer) {
          throw new Error("You must be signed in to update your profile.");
        }

        set({ isLoading: true, error: null, message: null });

        try {
          const response = await api.patch<ApiResponse<Customer>>(`/users/${customer.id}`, data);
          set({
            customer: response.data.data,
            isLoading: false,
            message: "Profile updated.",
          });
        } catch (error) {
          set({ error: getApiError(error, "Could not update profile."), isLoading: false });
          throw error;
        }
      },

      async resendEmailVerification() {
        set({ isLoading: true, error: null, message: null });

        try {
          const response = await api.post<ApiResponse<Customer>>("/auth/verify-email/resend");
          set({
            customer: response.data.data,
            isLoading: false,
            message: "Verification PIN sent to your email.",
          });
        } catch (error) {
          set({
            error: getApiError(error, "Could not send verification email."),
            isLoading: false,
          });
          throw error;
        }
      },

      async verifyEmail(pin) {
        set({ isLoading: true, error: null, message: null });

        try {
          const response = await api.post<ApiResponse<Customer>>("/auth/verify-email", { pin });
          set({
            customer: response.data.data,
            isLoading: false,
            message: "Email verified.",
          });
        } catch (error) {
          set({ error: getApiError(error, "Could not verify email."), isLoading: false });
          throw error;
        }
      },

      async regenerateApiKey() {
        set({ isLoading: true, error: null, message: null });

        try {
          const response = await api.post<ApiResponse<Customer>>("/auth/api-key");
          set({
            customer: response.data.data,
            isLoading: false,
            message: "API key generated.",
          });
        } catch (error) {
          set({ error: getApiError(error, "Could not generate API key."), isLoading: false });
          throw error;
        }
      },

      async updatePassword(data) {
        set({ isLoading: true, error: null, message: null });

        try {
          const response = await api.patch<ApiResponse<Customer>>("/auth/password", data);
          set({
            customer: response.data.data,
            isLoading: false,
            message: "Password updated.",
          });
        } catch (error) {
          set({ error: getApiError(error, "Could not update password."), isLoading: false });
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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
