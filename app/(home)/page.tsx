import { validateSession } from "@/app/actions/authActions";
import StoreInitializer from "@/components/StoreInitializer";
import { onLogout } from "@/app/actions/authActions";

export default async function HomePage() {
    const user = await validateSession();

    return (
        <div className="relative min-h-full">
            <StoreInitializer user={user || undefined} />

            {/* Background Decorative Elemets */}
            <div className="absolute top-0 right-0 h-[800px] w-full max-w-[1000px] bg-indigo-600/10 blur-[180px] rounded-full -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-[600px] w-full max-w-[800px] bg-purple-600/5 blur-[150px] rounded-full -z-10 pointer-events-none" />

            {/* Navigation */}
            <nav className="sticky top-0 z-50 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <div className="rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl px-6 h-16 flex items-center justify-between shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-indigo-600 p-2 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </div>
                            <span className="text-2xl font-black bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                YatraSathi
                            </span>
                        </div>

                        <div className="flex items-center gap-6">
                            {user ? (
                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:block text-right">
                                        <p className="text-sm font-bold text-white tracking-tight">{user.name}</p>
                                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Account</p>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-black border border-indigo-500/20 shadow-inner">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <form action={onLogout}>
                                        <button
                                            type="submit"
                                            className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-500 active:scale-90"
                                            title="Sign out"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <a
                                        href="/login"
                                        className="hidden sm:block text-sm font-bold text-slate-400 hover:text-white transition-colors px-4"
                                    >
                                        Login
                                    </a>
                                    <a
                                        href="/signup"
                                        className="rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-black text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all active:scale-95"
                                    >
                                        Signup
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/2 p-8 sm:p-16 backdrop-blur-3xl">
                        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 mb-8">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                    <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Join the Future of Travel</span>
                                </div>
                                <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl leading-[1.1]">
                                    Your <span className="text-indigo-500">Perfect</span> <br />
                                    Travel Partner.
                                </h1>
                                <p className="mt-8 text-xl leading-relaxed text-slate-400 max-w-xl font-medium">
                                    Experience a smarter way to move. Secure, fast, and remarkably sleek.
                                    Your journey redefined with YatraSathi.
                                </p>

                                <div className="mt-12 flex flex-wrap gap-5">
                                    {user ? (
                                        <>
                                            <button className="rounded-2xl bg-indigo-600 px-8 py-4 text-base font-black text-white shadow-[0_0_25px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all active:scale-95 flex items-center gap-2">
                                                Book a Journey
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </button>
                                            <button className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-black text-white hover:bg-white/10 transition-all active:scale-95">
                                                Become a Driver
                                            </button>
                                        </>
                                    ) : (
                                        <a href="/signup" className="rounded-2xl bg-indigo-600 px-8 py-4 text-base font-black text-white shadow-[0_0_25px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all inline-flex items-center gap-2 active:scale-95">
                                            Signup
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="relative hidden lg:block">
                                <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full" />
                                <div className="relative h-96 w-full rounded-[3rem] border border-white/20 bg-linear-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-3xl overflow-hidden group">
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#0a0f18] to-transparent" />
                                    {/* Abstract car shape or visual */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-80 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                                    <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-64 border-2 border-indigo-500/30 rounded-full animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: "Next-Gen Tracking",
                                desc: "Proprietary real-time pathfinding and live updates for your peace of mind.",
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
                                color: "indigo"
                            },
                            {
                                title: "Elite Verification",
                                desc: "Advanced vetting process, ensuring only the most reliable individuals join our fleet.",
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                                color: "green"
                            },
                            {
                                title: "AI Price Engine",
                                desc: "Smart algorithmic pricing that ensures fairness and efficiency for everyone.",
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                                color: "amber"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/2 p-8 transition-all hover:bg-white/5 hover:border-white/10">
                                <div className={`mb-6 h-14 w-14 rounded-2xl bg-${feature.color}-500/10 text-${feature.color}-500 flex items-center justify-center border border-${feature.color}-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {feature.icon}
                                    </svg>
                                </div>
                                <h3 className="text-xl font-black text-white mb-3 tracking-wide">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
