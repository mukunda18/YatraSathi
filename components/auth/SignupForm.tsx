"use client";

import { useState } from "react";
import { handleSignup } from "@/controller/authController";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { validateSignup } from "@/utils/validation";
import { toast } from "sonner";
import { HiUser, HiMail, HiPhone, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import Input from "@/components/UI/Input";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";

export default function SignupForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const connecting = useAuthStore((state) => state.connecting);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validation = validateSignup({ name, email, password, phone });
        if (!validation.success) {
            setErrors(validation.errors || {});
            toast.error("Please ensure all fields are correctly filled", { id: "signup-validation-error" });
            return;
        }

        setErrors({});
        await handleSignup(name, email, password, phone);

        if (useAuthStore.getState().name) {
            toast.success("Account created successfully! Welcome to YatraSathi.", { id: "signup-success" });
            router.push("/");
        } else {
            toast.error("Signup failed. That email might already be in use.", { id: "signup-error" });
        }
    };

    return (
        <Card className="p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                    label="Full Name"
                    icon={<HiUser className="h-5 w-5" />}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    placeholder="John Doe"
                />

                <Input
                    type="email"
                    label="Email address"
                    icon={<HiMail className="h-5 w-5" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    placeholder="you@example.com"
                />

                <Input
                    type="tel"
                    label="Phone Number"
                    icon={<HiPhone className="h-5 w-5" />}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone}
                    placeholder="+977 98XXXXXXXX"
                />

                <Input
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
                            className="text-slate-500 hover:text-indigo-400 transition-colors z-10"
                        >
                            {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                        </button>
                    }
                />

                <div className="pt-4">
                    <Button
                        type="submit"
                        fullWidth
                        loading={connecting}
                        icon={<svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                    >
                        Signup
                    </Button>
                </div>
            </form>

            <div className="mt-10">
                <div className="text-center">
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Already registered?</span>
                </div>

                <div className="mt-8">
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => router.push("/login")}
                    >
                        Login
                    </Button>
                </div>
            </div>
        </Card>
    );
}
