"use client";

import { useState } from "react";
import { handleLogin } from "@/controller/authController";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { validateLogin } from "@/utils/validation";
import { toast } from "sonner";
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const connecting = useAuthStore((state) => state.connecting);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validation = validateLogin({ email, password });
        if (!validation.success) {
            setErrors(validation.errors || {});
            toast.error("Please fix the errors in the form", { id: "login-validation-error" });
            return;
        }

        setErrors({});
        await handleLogin(email, password);

        if (useAuthStore.getState().name) {
            toast.success(`Welcome back, ${useAuthStore.getState().name}!`, { id: "login-success" });
            router.push("/");
        } else {
            toast.error("Invalid credentials. Please try again.", { id: "login-error" });
        }
    };

    return (
        <div className="relative flex min-h-full flex-col justify-center py-12 px-6 lg:px-8">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-[800px] bg-indigo-600/20 blur-[120px] rounded-full -z-10 pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 p-3 shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-transform hover:scale-105">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </div>
                <h1 className="mt-8 text-4xl font-black tracking-tight text-white sm:text-5xl">
                    Welcome <span className="text-indigo-500">Back</span>
                </h1>
                <p className="mt-3 text-slate-400 font-medium">
                    Secure access to your journey.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/3 p-8 backdrop-blur-xl transition-all hover:bg-white/5">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-indigo-400">
                                Email address
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <HiMail className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`block w-full rounded-2xl border-0 bg-white/5 py-4 pl-12 pr-5 text-white shadow-inner ring-1 ring-inset ${errors.email ? 'ring-red-500/50' : 'ring-white/10'} placeholder-slate-500 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-all outline-none`}
                                    placeholder="you@example.com"
                                />
                                {errors.email && <p className="mt-2 text-xs text-red-400 font-semibold">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-indigo-400">
                                Password
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <HiLockClosed className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`block w-full rounded-2xl border-0 bg-white/5 py-4 pl-12 pr-12 text-white shadow-inner ring-1 ring-inset ${errors.password ? 'ring-red-500/50' : 'ring-white/10'} placeholder-slate-500 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-all outline-none`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-500 hover:text-indigo-400 transition-colors"
                                >
                                    {showPassword ? (
                                        <HiEyeOff className="h-5 w-5" />
                                    ) : (
                                        <HiEye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-2 text-xs text-red-400 font-semibold">{errors.password}</p>}
                            <div className="text-right mt-2">
                                <button type="button" className="text-xs font-medium text-slate-500 hover:text-indigo-400 transition-colors">
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={connecting}
                                className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 py-4 px-6 text-sm font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50"
                            >
                                {connecting ? (
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Login
                                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-10">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest uppercase text-slate-500">First time here?</span>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => router.push("/signup")}
                                className="flex w-full justify-center rounded-2xl border border-white/5 bg-white/5 py-4 px-6 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/10 active:scale-[0.98]"
                            >
                                Signup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
