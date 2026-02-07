import { validateSession } from "@/app/actions/authActions";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await validateSession();

    if (!user) {
        redirect("/login");
    }

    return <>{children}</>;
}
