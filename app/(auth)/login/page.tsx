"use client";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden bg-bg-dark">
            {/* Background Decorative Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-600 shadow-xl shadow-indigo-500/20 mb-6 italic text-white font-black text-3xl">
                        Y
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
                        Welcome <span className="text-indigo-500">Back</span>
                    </h1>
                    <p className="text-slate-400 font-medium">
                        Log in to continue your adventure.
                    </p>
                </div>

                <LoginForm />

                <p className="text-center mt-8 text-xs text-slate-500 font-bold uppercase tracking-widest leading-loose">
                    New to YatraSathi?{" "}
                    <a href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">Create Account</a>
                </p>
            </div>
        </div>
    );
}
