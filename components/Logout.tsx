"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { handleLogout } from "@/controller/authController";

export default function Logout() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowConfirm(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const onConfirmLogout = async () => {
        await handleLogout();
        setShowConfirm(false);
    };

    const modalContent = showConfirm && mounted ? createPortal(
        <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-[#0a0f18]/90 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowConfirm(false)}
        >
            <div
                className="relative w-[90%] max-w-sm rounded-[2.5rem] border border-white/10 bg-[#0f172a] p-8 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Sign Out</h3>
                <p className="text-slate-400 font-medium mb-8">
                    Are you sure you want to log out of your YatraSathi account?
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 rounded-2xl border border-white/5 bg-white/5 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirmLogout}
                        className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all hover:bg-red-500 active:scale-95"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className="relative">
            <button
                onClick={() => setShowConfirm(true)}
                className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-500 active:scale-90"
                title="Sign out"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
            {modalContent}
        </div>
    );
}
