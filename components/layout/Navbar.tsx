"use client";

import { SafeUser } from "@/app/actions/authActions";
import UserDropdown from "@/components/layout/UserDropdown";
import Link from "next/link";

interface NavbarProps {
    user: SafeUser | null;
}

export default function Navbar({ user }: NavbarProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="glass-card rounded-3xl px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="rounded-xl bg-indigo-600 p-2 shadow-lg shadow-indigo-500/20">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black tracking-tight text-white italic">
                            YatraSathi
                        </span>
                    </Link>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-8">
                                <div className="hidden md:flex items-center gap-6">
                                    <Link href="/trips/join" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                                        Find Rides
                                    </Link>
                                    {user.isDriver ? (
                                        <Link href="/trips/new" className="text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">
                                            Offer Ride
                                        </Link>
                                    ) : (
                                        <Link href="/driver/register" className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                                            Become Driver
                                        </Link>
                                    )}
                                </div>
                                <UserDropdown user={user} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white px-4 transition-colors">
                                    Login
                                </Link>
                                <Link href="/signup" className="rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
                                    Signup
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
