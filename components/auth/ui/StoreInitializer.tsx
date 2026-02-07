"use client";

import { useRef } from "react";
import { useAuthStore } from "@/store/authStore";

export default function StoreInitializer({ user }: { user: { id: string, name: string, email: string, phone: string, isDriver: boolean } | undefined }) {
    const initialized = useRef(false);

    if (!initialized.current && user) {
        useAuthStore.setState({ userId: user.id, name: user.name, email: user.email, phone: user.phone, isDriver: user.isDriver });
        initialized.current = true;
    }

    return null;
}
