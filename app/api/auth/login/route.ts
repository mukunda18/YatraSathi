import { NextResponse } from "next/server";
import { setCookie } from "@/utils/cookie";
import { getUser } from "@/db/db";
import bcrypt from "bcrypt";
import { validateLogin } from "@/utils/validation";

interface ProfileResponse {
    name: string,
    email: string;
}

export async function POST(req: Request) {
    const body = await req.json();
    const { email, password } = body;

    const validation = validateLogin(body);
    if (!validation.success) {
        return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
    }

    const profile = await getUser({ email });
    if (!profile) {
        return NextResponse.json({ success: false });
    }

    const checkPassword = await bcrypt.compare(password, profile.passwordhash);
    if (!checkPassword) {
        return NextResponse.json({ success: false });
    }

    const user: ProfileResponse = {
        name: profile.name,
        email: profile.email,
    };

    await setCookie(profile.id, 60 * 60 * 24 * 7);
    return NextResponse.json({ success: true, user: user });
}