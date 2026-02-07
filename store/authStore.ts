import { create } from "zustand";

interface AuthStore {
    connecting: boolean,
    userId: string,
    name: string,
    email: string,
    phone: string,
    isDriver: boolean,
    clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    connecting: false,
    userId: "",
    name: "",
    email: "",
    phone: "",
    isDriver: false,
    clearAuth: () => set({ userId: "", name: "", email: "", phone: "", connecting: false, isDriver: false }),
}));