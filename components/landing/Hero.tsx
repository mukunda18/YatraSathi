"use client";

import { SafeUser } from "@/app/actions/authActions";
import Link from "next/link";
import { HiSearch, HiPlusCircle, HiTicket, HiTruck, HiChartBar, HiFilter } from "react-icons/hi";

interface HeroProps {
    user: SafeUser | null;
}

export default function Hero({ user }: HeroProps) {
    if (!user) {
        return (
            <section className="text-center py-16">
                <h1 className="text-4xl font-black tracking-tight text-white mb-4">
                    Welcome to <span className="text-indigo-500 italic">YatraSathi</span>
                </h1>
                <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
                    Share rides, save money, and travel together. Login to get started.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link href="/login" className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors border border-white/10 rounded-xl hover:border-white/20">
                        Login
                    </Link>
                    <Link href="/signup" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-indigo-600/20">
                        Create Account
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-10">
            <header>
                <p className="text-slate-500 text-xs md:text-sm font-medium mb-1">Good to see you,</p>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">{user.name}</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                    <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3 md:mb-4">Passenger</h2>
                    <div className="space-y-3">
                        <Link href="/trips/join" className="group bg-slate-900/50 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-300 flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <HiSearch className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-sm md:text-base font-black text-white">Find a Ride</h3>
                                <p className="text-[10px] md:text-xs text-slate-500">Search available trips near you</p>
                            </div>
                        </Link>

                        <Link href="/trips" className="group bg-slate-900/50 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300 flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <HiTicket className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-sm md:text-base font-black text-white">My Trips</h3>
                                <p className="text-[10px] md:text-xs text-slate-500">View your joined rides</p>
                            </div>
                        </Link>

                        <Link href="/explore" className="group bg-slate-900/50 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <HiFilter className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-sm md:text-base font-black text-white">Explore Trips</h3>
                                <p className="text-[10px] md:text-xs text-slate-500">Browse all trips with filters</p>
                            </div>
                        </Link>
                    </div>
                </div>

                <div>
                    <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3 md:mb-4">Driver</h2>
                    <div className="space-y-3">
                        {user.isDriver ? (
                            <>
                                <Link href="/trips/new" className="group bg-slate-900/50 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 flex items-center gap-3 md:gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <HiPlusCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm md:text-base font-black text-white">Offer a Ride</h3>
                                        <p className="text-[10px] md:text-xs text-slate-500">Post a new trip</p>
                                    </div>
                                </Link>

                                <Link href="/driver/dashboard" className="group bg-slate-900/50 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 flex items-center gap-3 md:gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <HiChartBar className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm md:text-base font-black text-white">Dashboard</h3>
                                        <p className="text-[10px] md:text-xs text-slate-500">Manage your trips</p>
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <Link href="/driver/register" className="group bg-slate-900/50 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300 flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <HiTruck className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-base font-black text-white">Become a Driver</h3>
                                    <p className="text-[10px] md:text-xs text-slate-500">Register your vehicle and start earning</p>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
