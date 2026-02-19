"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function StoreInitializer({ user }: { user: { id: string, name: string, email: string, phone: string, isDriver: boolean } | undefined }) {
    useEffect(() => {
        if (user) {
            useAuthStore.setState({ userId: user.id, name: user.name, email: user.email, phone: user.phone, isDriver: user.isDriver });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
