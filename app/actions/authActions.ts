"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getUserById, getUserByEmail, createUser, createDriverAndMarkUser, updateUserById, createPasswordResetToken, getPasswordResetToken, deletePasswordResetToken } from "@/db/db";
import { setCookie } from "@/utils/cookie";
import bcrypt from "bcrypt";
import { validateSignup, validateLogin, validateDriverRegistration } from "@/utils/validation";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mailer";

// Validate JWT_SECRET is set on module load
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
}

export async function onLogout() {
    await setCookie("", 0);
    return { success: true };
}

export interface SafeUser {
    name: string;
    email: string;
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
            name: user.name,
            email: user.email,
            isDriver: user.is_driver
        };
    } catch {
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
    } catch {
        return null;
    }
}

interface SignupPayload {
    name: string;
    email: string;
    password: string;
    phone: string;
}

interface DriverRegistrationPayload {
    licenseNumber: string;
    vehicleType: string;
    vehicleNumber: string;
}

interface LoginPayload {
    email: string;
    password: string;
}

export async function signupAction(data: SignupPayload) {
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
        user: { name: profile.name, email: profile.email, isDriver: false }
    };
}

export async function registerDriverAction(data: DriverRegistrationPayload) {
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

        const driverProfile = await createDriverAndMarkUser({
            user_id: decoded.userId,
            license_number: licenseNumber,
            vehicle_type: vehicleType,
            vehicle_number: vehicleNumber
        });

        if (!driverProfile) {
            return { success: false, message: "Failed to create driver profile" };
        }

        return { success: true };
    } catch {
        return { success: false, message: "Failed to verify session" };
    }
}

export async function loginAction(data: LoginPayload) {
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
        user: { name: profile.name, email: profile.email, isDriver: profile.is_driver }
    };
}

export async function forgotPasswordAction(email: string) {
    if (!email || !email.includes("@")) {
        return { success: false, message: "Please enter a valid email address." };
    }

    try {
        const user = await getUserByEmail(email.toLowerCase().trim());

        // Always return success to prevent email enumeration attacks
        if (!user) {
            return { success: true, message: "If that email exists, you'll receive a reset link shortly." };
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await createPasswordResetToken(user.id, token, expiresAt);

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yatra-sathi-black.vercel.app";
        const resetUrl = `${appUrl}/reset-password?token=${token}`;

        await sendPasswordResetEmail(user.email, user.name, resetUrl);

        return { success: true, message: "If that email exists, you'll receive a reset link shortly." };
    } catch (error) {
        console.error("Error in forgotPasswordAction:", error);
        return { success: false, message: "Something went wrong. Please try again." };
    }
}

export async function resetPasswordAction(token: string, newPassword: string) {
    if (!token) return { success: false, message: "Invalid or missing reset token." };
    if (!newPassword || newPassword.length < 8) {
        return { success: false, message: "Password must be at least 8 characters." };
    }

    try {
        const record = await getPasswordResetToken(token);

        if (!record) {
            return { success: false, message: "This link is invalid or has already been used." };
        }

        if (new Date(record.expires_at) < new Date()) {
            await deletePasswordResetToken(token);
            return { success: false, message: "This link has expired. Please request a new one." };
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        await updateUserById(record.user_id, { password_hash: hash });
        await deletePasswordResetToken(token);

        return { success: true, message: "Password reset successfully. You can now log in." };
    } catch (error) {
        console.error("Error in resetPasswordAction:", error);
        return { success: false, message: "Something went wrong. Please try again." };
    }
}
