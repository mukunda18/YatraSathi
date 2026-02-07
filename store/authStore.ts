import { create } from "zustand";

interface AuthStore {
    connecting: boolean,
    name: string,
    email: string,
    phone: string,
    isDriver: boolean,
    clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    connecting: false,
    name: "",
    email: "",
    phone: "",
    isDriver: false,
    clearAuth: () => set({ name: "", email: "", phone: "", connecting: false, isDriver: false }),
}));