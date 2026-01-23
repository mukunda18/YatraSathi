import { setCookie } from "@/utils/cookie";
import { redirect } from "next/navigation";

export async function GET() {
    await setCookie("", 0);
    redirect("/login");
}
