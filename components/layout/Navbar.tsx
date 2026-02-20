"use client";

import { SafeUser } from "@/app/actions/authActions";
import UserDropdown from "@/components/layout/UserDropdown";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
    user: SafeUser | null;
}

export default function Navbar({ user }: NavbarProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 p-2 md:p-6">
            <div className="mx-auto max-w-7xl">
                <div className="glass-card rounded-2xl md:rounded-3xl px-4 md:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 md:gap-3">
                        <Image
                            src="/logo.png"
                            alt="YatraSathi logo"
                            width={36}
                            height={36}
                            className="h-8 w-8 md:h-9 md:w-9 rounded-lg md:rounded-xl object-contain"
                        />
                        <span className="text-xl md:text-2xl font-black tracking-tight text-white italic">
                            YatraSathi
                        </span>
                    </Link>

                    <div className="flex items-center gap-3 md:gap-6">
                        {user ? (
                            <div className="flex items-center gap-4 md:gap-8">
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
                            <div className="flex items-center gap-2 md:gap-3">
                                <Link href="/login" className="text-xs md:text-sm font-bold text-slate-400 hover:text-white px-2 md:px-4 transition-colors">
                                    Login
                                </Link>
                                <Link href="/signup" className="rounded-xl md:rounded-2xl bg-indigo-600 px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-black text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
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
