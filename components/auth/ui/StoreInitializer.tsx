"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function StoreInitializer({ user }: { user: { name: string, email: string, isDriver: boolean } | undefined }) {
    useEffect(() => {
        if (user) {
            useAuthStore.setState({ name: user.name, email: user.email, isDriver: user.isDriver });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
