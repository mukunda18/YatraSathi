import DriverRegistrationForm from "@/components/auth/DriverRegistrationForm";
import { validateSession } from "@/app/actions/authActions";
import { redirect } from "next/navigation";

export default async function DriverRegisterPage() {
    const user = await validateSession();

    if (!user) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950">
            <div className="w-full max-w-xl">
                <DriverRegistrationForm />
            </div>
        </main>
    );
}
