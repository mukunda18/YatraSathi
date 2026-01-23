import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
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
                <LoginForm />
            </div>
        </div>
    );
}
