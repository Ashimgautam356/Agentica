"use client";

import { create } from "zustand";
import { api, getApiError, type ApiResponse, type Paginated } from "@/lib/api";

export type Category = {
  id: string;
  name: string;
  imageId: string | null;
  _count?: {
    products: number;
  };
};

type CategoryState = {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  async fetchCategories() {
    if (get().isLoading || get().categories.length > 0) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await api.get<ApiResponse<Paginated<Category>>>("/categories", {
        params: { pageSize: 30 },
      });
      set({ categories: response.data.data.items, isLoading: false });
    } catch (error) {
      set({ error: getApiError(error, "Could not load categories."), isLoading: false });
    }
  },
}));
