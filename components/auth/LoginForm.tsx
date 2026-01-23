"use client";

import { useState } from "react";
import { handleLogin } from "@/controller/authController";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { validateLogin } from "@/utils/validation";
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
        <Card className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    id="email"
                    type="email"
                    label="Email address"
                    icon={<HiMail className="h-5 w-5" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    placeholder="you@example.com"
                />

                <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    icon={<HiLockClosed className="h-5 w-5" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    placeholder="••••••••"
                    rightElement={
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                            {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                        </button>
                    }
                />

                <div className="text-right -mt-4">
                    <button type="button" className="text-xs font-medium text-slate-500 hover:text-indigo-400 transition-colors">
                        Forgot password?
                    </button>
                </div>

                <Button
                    type="submit"
                    fullWidth
                    loading={connecting}
                    icon={<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                >
                    Login
                </Button>
            </form>

            <div className="mt-10">
                <div className="text-center">
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-500">First time here?</span>
                </div>

                <div className="mt-8">
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => router.push("/signup")}
                    >
                        Signup
                    </Button>
                </div>
            </div>
        </Card>
    );
}
