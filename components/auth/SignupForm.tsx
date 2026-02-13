"use client";

import { useState } from "react";
import { signupAction } from "@/app/actions/authActions";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
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
    const setConnecting = useAuthStore((state) => state.setConnecting);
    const setAuthError = useAuthStore((state) => state.setError);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAuthError(null);
        setConnecting(true);

        const result = await signupAction({
            name, email, password, phone
        });

        if (result.success && result.user) {
            useAuthStore.setState({ ...result.user, connecting: false, error: null });
            toast.success(`Welcome, ${result.user.name}!`);
            router.push("/");
        } else {
            setErrors(result.errors || {});
            const message = result.message || "Failed to create account";
            setAuthError(message);
            toast.error(message);
            setConnecting(false);
        }
    };

    return (
        <Card className="p-8 md:p-10 border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-8 text-center bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text">Create Account</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                        label="Full Name"
                        icon={<HiUser className="w-5 h-5" />}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={errors.name}
                        placeholder="John Doe"
                    />
                    <Input
                        label="Phone Number"
                        icon={<HiPhone className="w-5 h-5" />}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        error={errors.phone}
                        placeholder="98XXXXXXXX"
                    />
                </div>

                <Input
                    label="Email Address"
                    type="email"
                    icon={<HiMail className="w-5 h-5" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    placeholder="john@example.com"
                />

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

                <Button type="submit" fullWidth loading={connecting} className="mt-4">
                    Create Account
                </Button>
            </form>
        </Card>
    );
}
