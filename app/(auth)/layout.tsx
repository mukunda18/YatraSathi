import { validateSession } from "@/app/actions/authActions";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const user = await validateSession();
    if (user) redirect("/");
    return <>{children}</>;
}
