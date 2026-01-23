import { NextResponse } from "next/server";
import { getUser } from "@/db/db";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        const { token } = await req.json();
        if (!token) return NextResponse.json({ valid: false }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const user = await getUser({ id: decoded.userId });

        if (!user) return NextResponse.json({ valid: false }, { status: 401 });

        return NextResponse.json({ valid: true });
    } catch (error) {
        return NextResponse.json({ valid: false }, { status: 401 });
    }
}
