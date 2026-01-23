import { NextResponse } from "next/server";
import { addUser } from "@/db/db";
import { setCookie } from "@/utils/cookie";
import bcrypt from "bcrypt";
import { validateSignup } from "@/utils/validation";

interface Profile {
    name: string,
    email: string
}

export async function POST(req: Request) {
    const body = await req.json();
    const { name, email, password, phone } = body;

    const validation = validateSignup(body);
    if (!validation.success) {
        return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash(password, salt);

    const profile = await addUser({ name, email, passwordhash: hash, phone });
    if (!profile) {
        return NextResponse.json({ success: false });
    }

    const user: Profile = {
        name: profile.name,
        email: profile.email,
    };

    await setCookie(profile.id, 60 * 60 * 24 * 7);
    return NextResponse.json({ success: true, user: user });
}