import { validateSession } from "@/app/actions/authActions";
import { redirect } from "next/navigation";
import NewTripForm from "@/components/trips/NewTripForm";
import Link from "next/link";
import { HiTruck, HiArrowRight } from "react-icons/hi";

export default async function NewTripPage() {
    const user = await validateSession();

    if (!user) {
        redirect("/login");
    }

    return (
        <main className="h-screen w-screen overflow-hidden relative bg-slate-950">
            {user.isDriver ? (
                <NewTripForm />
            ) : (
                <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
                    <div className="absolute inset-0 bg-indigo-600/5 blur-[120px] rounded-full -z-10" />

                    <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/10">
                        <HiTruck className="w-10 h-10 text-indigo-500" />
                    </div>

                    <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
                        Driver Profile <span className="text-indigo-500 italic">Required</span>
                    </h1>

                    <p className="text-slate-400 max-w-md mb-10 font-medium leading-relaxed">
                        To publish a trip and start earning, you first need to register your vehicle and license information.
                    </p>

                    <Link
                        href="/driver/register"
                        className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                    >
                        Register as Driver
                        <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link href="/" className="mt-8 text-xs font-bold text-slate-500 hover:text-white transition-colors">
                        Return to Home
                    </Link>
                </div>
            )}
        </main>
    );
}
