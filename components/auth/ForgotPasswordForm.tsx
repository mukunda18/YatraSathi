"use client";

import { useState } from "react";
import { forgotPasswordAction } from "@/app/actions/authActions";
import { HiMail, HiCheckCircle } from "react-icons/hi";
import Input from "@/components/UI/Input";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Link from "next/link";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await forgotPasswordAction(email);

        setLoading(false);
        if (result.success) {
            setSent(true);
        } else {
            setError(result.message || "Something went wrong.");
        }
    };

    if (sent) {
        return (
            <Card className="p-8 md:p-10 border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-2xl text-center">
                <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <HiCheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                </div>
                <h2 className="text-xl font-black text-white mb-2">Check Your Inbox</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    If an account exists for <span className="text-white font-bold">{email}</span>, we&apos;ve sent a password reset link. It expires in 1 hour.
                </p>
                <Link
                    href="/login"
                    className="inline-block w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm text-center transition-all"
                >
                    Back to Login
                </Link>
            </Card>
        );
    }

    return (
        <Card className="p-8 md:p-10 border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label="Email Address"
                    type="email"
                    icon={<HiMail className="w-5 h-5" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    error={error}
                />

                <Button type="submit" fullWidth loading={loading}>
                    Send Reset Link
                </Button>

                <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
                    Remembered it?{" "}
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                        Back to Login
                    </Link>
                </p>
            </form>
        </Card>
    );
}
