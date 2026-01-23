import { NextResponse } from "next/server";
import { setCookie } from "@/utils/cookie";

export async function GET() {
    await setCookie("", 0);
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}

export async function POST() {
    await setCookie("", 0);
    return NextResponse.json({ success: true });
}
