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

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const connecting = useAuthStore((state) => state.connecting);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        useAuthStore.setState({ connecting: true });

        const result = await loginAction({ email, password });

        if (result.success && result.user) {
            useAuthStore.setState({ ...result.user, connecting: false });
            toast.success(`Welcome back, ${result.user.name}!`);
            router.push("/");
        } else {
            setErrors(result.errors || {});
            toast.error(result.message || "Invalid credentials");
            useAuthStore.setState({ connecting: false });
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
                        <button type="button" className="text-xs font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">
                            Forgot Password?
                        </button>
                    </div>
                </div>

                <Button type="submit" fullWidth loading={connecting} className="mt-4">
                    Sign In
                </Button>
            </form>
        </Card>
    );
}
