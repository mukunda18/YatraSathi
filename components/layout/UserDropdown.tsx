"use client";

import { useState, useRef, useEffect } from "react";
import { SafeUser } from "@/app/actions/authActions";
import { HiUser, HiCog, HiChevronDown } from "react-icons/hi";
import Link from "next/link";
import Logout from "@/components/auth/ui/Logout";
import { useUIStore } from "@/store/uiStore";

interface UserDropdownProps {
    user: SafeUser;
}

export default function UserDropdown({ user }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const activeOverlays = useUIStore((state) => state.activeOverlays);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (activeOverlays > 0) return;

            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, activeOverlays]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 outline-none h-10 select-none group"
            >
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center w-full h-full rounded-full bg-slate-900 border border-white/10 text-white font-black text-sm shadow-xl group-hover:border-indigo-500/30 transition-colors">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                </div>
                <HiChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-300 group-hover:text-white ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full pt-3 z-50" onMouseDown={(e) => e.stopPropagation()}>
                    <div className="w-64 rounded-4xl bg-slate-900 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
                        <div className="px-5 py-5 border-b border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Account Active</p>
                            <p className="text-sm font-black text-white truncate">{user.name}</p>
                            <p className="text-[11px] font-bold text-slate-500 truncate">{user.email}</p>
                        </div>

                        <div className="p-2 space-y-1">
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
                            >
                                <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-indigo-500 group-hover:shadow-lg group-hover:shadow-indigo-500/20 transition-all duration-300">
                                    <HiUser className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                </div>
                                Profile Overview
                            </Link>

                            <Link
                                href="/settings"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
                            >
                                <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-slate-700 transition-colors">
                                    <HiCog className="w-4 h-4 text-slate-400" />
                                </div>
                                Settings
                            </Link>
                        </div>

                        <div className="p-2 bg-red-500/5 mt-2">
                            <Logout />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
