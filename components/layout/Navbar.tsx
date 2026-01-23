import { SafeUser } from "@/app/actions/authActions";
import Logout from "@/components/Logout";

interface NavbarProps {
    user: SafeUser | null;
}

export default function Navbar({ user }: NavbarProps) {
    return (
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
                                <Logout />
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
    );
}
