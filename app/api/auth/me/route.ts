import { validateSession } from "@/app/actions/authActions";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await validateSession();

        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Error fetching current user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
