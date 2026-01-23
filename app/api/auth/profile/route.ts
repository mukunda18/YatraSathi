import { NextResponse } from "next/server";
import { validateSession } from "@/app/actions/authActions";
import { setCookie } from "@/utils/cookie";

export async function GET() {
    try {
        const profile = await validateSession();

        if (!profile) {
            await setCookie("", 0);
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const user = {
            name: profile.name,
            email: profile.email
        }

        return NextResponse.json({ success: true, user: user });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
