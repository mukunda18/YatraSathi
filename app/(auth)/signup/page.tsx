"use client";

import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden bg-[#0f172a]">
            {/* Background Decorative Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />
            </div>

            <div className="w-full max-w-xl relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-600 shadow-xl shadow-indigo-500/20 mb-6 italic text-white font-black text-3xl">
                        Y
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
                        Join <span className="text-indigo-500">YatraSathi</span>
                    </h1>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto">
                        Create your account and start your journey today.
                    </p>
                </div>

                <SignupForm />

                <p className="text-center mt-8 text-xs text-slate-500 font-bold uppercase tracking-widest leading-loose">
                    Already have an account?{" "}
                    <a href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign In</a>
                </p>
            </div>
        </div>
    );
}
