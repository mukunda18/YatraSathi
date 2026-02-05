"use client";

import { useState } from "react";
import { onLogout } from "@/app/actions/authActions";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HiLogout, HiX, HiCheck } from "react-icons/hi";

export default function Logout() {
    const [isConfirming, setIsConfirming] = useState(false);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const router = useRouter();

    const handleLogout = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const toastId = toast.loading("Logging out...");
        clearAuth();
        await onLogout();
        toast.success("Logged out successfully", { id: toastId });
        setIsConfirming(false);
        router.push("/login");
    };

    if (isConfirming) {
        return (
            <div
                className="flex items-center gap-2 px-2 py-1 bg-red-500/10 rounded-2xl animate-in slide-in-from-right-2 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="flex-1 text-[10px] font-black uppercase tracking-widest text-red-500 pl-2">Confirm?</p>
                <div className="flex gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsConfirming(false);
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="Cancel"
                    >
                        <HiX className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-all active:scale-95"
                        title="Confirm Sign Out"
                    >
                        <HiCheck className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                setIsConfirming(true);
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-black text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer group/logout"
        >
            <div className="p-2 rounded-xl bg-red-500/10 group-hover/logout:bg-red-500/20 transition-colors">
                <HiLogout className="w-4 h-4" />
            </div>
            Sign Out
        </button>
    );
}
