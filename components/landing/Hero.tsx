"use client";

import { SafeUser } from "@/app/actions/authActions";
import Link from "next/link";
import { HiArrowRight, HiSearch, HiPlusCircle } from "react-icons/hi";

interface HeroProps {
    user: SafeUser | null;
}

export default function Hero({ user }: HeroProps) {
    return (
        <section className="relative">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 mb-8">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Join the Future of Travel</span>
                </div>
                <h1 className="text-5xl font-black tracking-tight text-white sm:text-8xl leading-[1.1] mb-8">
                    Your <span className="text-indigo-500 italic">Next</span> <br />
                    Adventure Starts Here.
                </h1>
                <p className="text-xl leading-relaxed text-slate-400 max-w-2xl mx-auto font-medium">
                    Experience a smarter way to move. Secure, fast, and remarkably sleek.
                    Your journey redefined with YatraSathi.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Book a Journey Card */}
                <Link href="/trips" className="group relative">
                    <div className="absolute inset-0 bg-indigo-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative glass-card rounded-[2.5rem] p-10 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                            <HiSearch className="w-32 h-32 text-indigo-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                                <HiSearch className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-3">Book a <span className="text-indigo-400">Journey</span></h3>
                            <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                                Find the perfect ride at the best price. Secure, verified, and ready whenever you are.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-indigo-400 group-hover:gap-4 transition-all duration-300">
                                Start Exploring <HiArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Offer a Ride Card */}
                <Link href="/trips/new" className="group relative">
                    <div className="absolute inset-0 bg-emerald-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative glass-card rounded-[2.5rem] p-10 border border-white/10 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                            <HiPlusCircle className="w-32 h-32 text-emerald-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                                <HiPlusCircle className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-3">Offer a <span className="text-emerald-400">Ride</span></h3>
                            <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                                Share your journey and earn. The smartest way to offset your travel costs while meeting new people.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-emerald-400 group-hover:gap-4 transition-all duration-300">
                                {user?.isDriver ? "Post a Trip" : "Start Earning"} <HiArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    );
}
