import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  token: string;
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => {
        if (user) Cookies.set("urbn_token", user.token, { expires: 7 });
        set({ user });
      },
      logout: () => {
        Cookies.remove("urbn_token");
        set({ user: null });
      },
    }),
    { name: "urbn-auth" }
  )
);
