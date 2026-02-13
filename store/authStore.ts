import { create } from "zustand";

interface AuthStore {
    connecting: boolean,
    error: string | null,
    userId: string,
    name: string,
    email: string,
    phone: string,
    isDriver: boolean,
    setConnecting: (connecting: boolean) => void;
    setError: (error: string | null) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    connecting: false,
    error: null,
    userId: "",
    name: "",
    email: "",
    phone: "",
    isDriver: false,
    setConnecting: (connecting) => set({ connecting }),
    setError: (error) => set({ error }),
    clearAuth: () => set({ userId: "", name: "", email: "", phone: "", connecting: false, isDriver: false, error: null }),
}));
