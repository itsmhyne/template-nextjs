// stores/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string | null;
  gender?: string | null; // ✅ Tambahkan gender jika perlu
  role?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  resetLoading: () => void;

  // ✅ TAMBAHKAN - Helper methods yang berguna
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// ✅ Selectors untuk performance (rekomendasi)
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthName = () => useAuthStore((state) => state.user?.name);
export const useAuthEmail = () => useAuthStore((state) => state.user?.email);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false, // ✅ Default false

      // Basic actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user, // ✅ Auto update isAuthenticated
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearAuth: () =>
        set({
          user: null,
          error: null,
          isLoading: false,
          isAuthenticated: false, // ✅ Reset juga isAuthenticated
        }),

      resetLoading: () => set({ isLoading: false }),

      // ✅ New helper methods
      login: (user) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        // Optional: Clear cookies/session
        document.cookie =
          "session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
    }),
    {
      name: "auth-storage", // Key di localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated, // ✅ Simpan juga isAuthenticated
      }),
    }
  )
);
