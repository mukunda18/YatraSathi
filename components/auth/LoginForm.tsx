"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/authActions";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import Input from "@/components/UI/Input";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Link from "next/link";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const connecting = useAuthStore((state) => state.connecting);
    const setConnecting = useAuthStore((state) => state.setConnecting);
    const setAuthError = useAuthStore((state) => state.setError);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAuthError(null);
        setConnecting(true);

        const result = await loginAction({ email, password });

        if (result.success && result.user) {
            useAuthStore.setState({ ...result.user, connecting: false, error: null });
            toast.success(`Welcome back, ${result.user.name}!`);
            router.push("/");
        } else {
            setErrors(result.errors || {});
            const message = result.message || "Invalid credentials";
            setAuthError(message);
            toast.error(message);
            setConnecting(false);
        }
    };

    return (
        <Card className="p-8 md:p-10 border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label="Email Address"
                    type="email"
                    icon={<HiMail className="w-5 h-5" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    placeholder="you@example.com"
                />

                <div className="space-y-2">
                    <Input
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        icon={<HiLockClosed className="w-5 h-5" />}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        placeholder="••••••••"
                        rightElement={
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-indigo-400 transition-colors">
                                {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                            </button>
                        }
                    />
                    <div className="text-right">
                        <Link href="/forgot-password" className="text-xs font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <Button type="submit" fullWidth loading={connecting} className="mt-4">
                    Sign In
                </Button>
            </form>
        </Card>
    );
}
