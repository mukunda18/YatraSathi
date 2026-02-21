import { create } from "zustand";

interface AuthStore {
    connecting: boolean,
    error: string | null,
    name: string,
    email: string,
    isDriver: boolean,
    setConnecting: (connecting: boolean) => void;
    setError: (error: string | null) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    connecting: false,
    error: null,
    name: "",
    email: "",
    isDriver: false,
    setConnecting: (connecting) => set({ connecting }),
    setError: (error) => set({ error }),
    clearAuth: () => set({ name: "", email: "", connecting: false, isDriver: false, error: null }),
}));
