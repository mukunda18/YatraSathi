import { create } from "zustand";

interface AuthStore {
    connecting: boolean,
    name: string,
    email: string,
    phone: string,
    clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    connecting: false,
    name: "",
    email: "",
    phone: "",
    clearAuth: () => set({ name: "", email: "", phone: "", connecting: false }),
}));