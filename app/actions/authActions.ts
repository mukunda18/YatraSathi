"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { getUser } from "@/db/db";
import { setCookie } from "@/utils/cookie";

export async function onLogout() {
    await setCookie("", 0);
    redirect("/login");
}

export interface SafeUser {
    id: string;
    name: string;
    email: string;
    phone: string;
}

export async function validateSession(): Promise<SafeUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("yatrasathi")?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const user = await getUser({ id: decoded.userId });

        if (!user) return null;

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone
        };
    } catch (error) {
        return null;
    }
}
