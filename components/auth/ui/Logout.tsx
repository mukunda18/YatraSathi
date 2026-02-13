"use client";

import { useState } from "react";
import { onLogout } from "@/app/actions/authActions";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HiLogout, HiExclamation } from "react-icons/hi";
import Overlay from "@/components/UI/Overlay";
import Card from "@/components/UI/Card";

export default function Logout() {
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const router = useRouter();

    const handleLogout = async () => {
        setIsLoading(true);
        const toastId = toast.loading("Logging out...");
        try {
            await onLogout();
            clearAuth();
            toast.success("Logged out successfully", { id: toastId });
            router.push("/login");
        } catch {
            toast.error("Logout failed", { id: toastId });
        } finally {
            setIsLoading(false);
            setShowModal(false);
        }
    };

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-black text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer group/logout"
            >
                <div className="p-2 rounded-xl bg-red-500/10 group-hover/logout:bg-red-500/20 transition-colors">
                    <HiLogout className="w-4 h-4" />
                </div>
                Sign Out
            </button>

            <Overlay isOpen={showModal} onClose={() => setShowModal(false)}>
                <Card className="max-w-md w-full border-white/10 p-6 animate-in zoom-in-95 duration-300 shadow-2xl shadow-black/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <HiExclamation className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-lg font-black text-white">Sign Out</h3>
                    </div>

                    <p className="text-sm text-slate-400 mb-4">
                        Are you sure you want to log out of your account?
                    </p>

                    <div className="flex items-center gap-3 mt-6">
                        <button
                            onClick={() => setShowModal(false)}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-black text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            Sign Out
                        </button>
                    </div>
                </Card>
            </Overlay>
        </>
    );
}
