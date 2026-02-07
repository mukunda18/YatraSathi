"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getUserById, getUserByEmail, createUser, createDriver, updateUserById } from "@/db/db";
import { setCookie } from "@/utils/cookie";
import bcrypt from "bcrypt";
import { validateSignup, validateLogin, validateDriverRegistration } from "@/utils/validation";

export async function onLogout() {
    await setCookie("", 0);
    return { success: true };
}

export interface SafeUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    isDriver: boolean;
}

export async function validateSession(): Promise<SafeUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("yatrasathi")?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const user = await getUserById(decoded.userId);

        if (!user) return null;

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isDriver: user.is_driver
        };
    } catch (error) {
        return null;
    }
}

export async function getUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("yatrasathi")?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        return decoded.userId;
    } catch (error) {
        return null;
    }
}
export async function signupAction(data: any) {
    const { name, email, password, phone } = data;

    const validation = validateSignup(data);
    if (!validation.success) {
        return { success: false, errors: validation.errors };
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash(password, salt);

    const profile = await createUser({ name, email, password_hash: hash, phone });
    if (!profile) {
        return { success: false, message: "Failed to create user" };
    }

    await setCookie(profile.id, 60 * 60 * 24 * 7);
    return {
        success: true,
        user: { id: profile.id, name: profile.name, email: profile.email, phone: profile.phone, isDriver: false }
    };
}

export async function registerDriverAction(data: any) {
    const cookieStore = await cookies();
    const token = cookieStore.get("yatrasathi")?.value;

    if (!token) return { success: false, message: "Unauthorized" };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const { licenseNumber, vehicleType, vehicleNumber } = data;

        const validation = validateDriverRegistration(data);
        if (!validation.success) {
            return { success: false, errors: validation.errors };
        }

        const driverProfile = await createDriver({
            user_id: decoded.userId,
            license_number: licenseNumber,
            vehicle_type: vehicleType,
            vehicle_number: vehicleNumber
        });

        if (!driverProfile) {
            return { success: false, message: "Failed to create driver profile" };
        }

        // Also update the user record
        await updateUserById(decoded.userId, { is_driver: true });

        return { success: true };
    } catch (error) {
        return { success: false, message: "Failed to verify session" };
    }
}

export async function loginAction(data: any) {
    const { email, password } = data;

    const validation = validateLogin(data);
    if (!validation.success) {
        return { success: false, errors: validation.errors };
    }

    const profile = await getUserByEmail(email);
    if (!profile || !(await bcrypt.compare(password, profile.password_hash))) {
        return { success: false, message: "Invalid credentials" };
    }

    await setCookie(profile.id, 60 * 60 * 24 * 7);
    return {
        success: true,
        user: { id: profile.id, name: profile.name, email: profile.email, phone: profile.phone, isDriver: profile.is_driver }
    };
}
