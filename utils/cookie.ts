import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const setCookie = async (userId: string, time: number) => {
    const cookieStore = await cookies();

    if (time === 0) {
        cookieStore.set("yatrasathi", "", {
            maxAge: 0,
            path: "/",
        });
        return;
    }

    const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET!, {
        expiresIn: time,
    });

    cookieStore.set("yatrasathi", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: time,
        path: "/",
    });
}
