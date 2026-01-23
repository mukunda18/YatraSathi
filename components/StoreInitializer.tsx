"use client";

import { useRef } from "react";
import { useAuthStore } from "@/store/authStore";

export default function StoreInitializer({ user }: { user: { name: string, email: string } | undefined }) {
    const initialized = useRef(false);

    if (!initialized.current && user) {
        useAuthStore.setState({ name: user.name, email: user.email });
        initialized.current = true;
    }

    return null;
}
