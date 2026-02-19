"use client";

import { useState } from "react";
import { resetPasswordAction } from "@/app/actions/authActions";
import { useRouter } from "next/navigation";
import { HiLockClosed, HiEye, HiEyeOff, HiCheckCircle } from "react-icons/hi";
import Input from "@/components/UI/Input";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Link from "next/link";

interface ResetPasswordFormProps {
    token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        const result = await resetPasswordAction(token, password);
        setLoading(false);

        if (result.success) {
            setDone(true);
            setTimeout(() => router.push("/login"), 2500);
        } else {
            setError(result.message || "Something went wrong.");
        }
    };

    if (!token) {
        return (
            <Card className="p-8 md:p-10 border border-red-500/20 bg-slate-900/40 backdrop-blur-2xl shadow-2xl text-center">
                <p className="text-red-400 font-bold mb-4">Invalid or missing reset link.</p>
                <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-bold text-sm">
                    Request a new link →
                </Link>
            </Card>
        );
    }

    if (done) {
        return (
            <Card className="p-8 md:p-10 border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-2xl text-center">
                <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <HiCheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                </div>
                <h2 className="text-xl font-black text-white mb-2">Password Updated!</h2>
                <p className="text-slate-400 text-sm">Redirecting you to login…</p>
            </Card>
        );
    }

    return (
        <Card className="p-8 md:p-10 border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label="New Password"
                    type={showPassword ? "text" : "password"}
                    icon={<HiLockClosed className="w-5 h-5" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    rightElement={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-indigo-400 transition-colors">
                            {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                        </button>
                    }
                />

                <Input
                    label="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    icon={<HiLockClosed className="w-5 h-5" />}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    error={error}
                />

                <Button type="submit" fullWidth loading={loading}>
                    Set New Password
                </Button>
            </form>
        </Card>
    );
}
