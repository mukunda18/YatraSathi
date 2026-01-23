import { create } from "zustand";

interface AuthStore {
    connecting: boolean,
    name: string,
    email: string,
    phone: string
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    connecting: false,
    name: "",
    email: "",
    phone: "",
}));