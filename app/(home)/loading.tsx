export default function Loading() {
    return (
        <div className="relative min-h-full flex flex-col items-center justify-center">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 h-[800px] w-full max-w-[1000px] bg-indigo-600/10 blur-[180px] rounded-full -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-[600px] w-full max-w-[800px] bg-purple-600/5 blur-[150px] rounded-full -z-10 pointer-events-none" />

            <div className="flex flex-col items-center gap-8">
                {/* Animated Logo */}
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-20 animate-pulse" />
                    <div className="relative rounded-3xl bg-indigo-600 p-5 shadow-[0_0_50px_rgba(79,70,229,0.4)] animate-bounce">
                        <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </div>
                </div>

                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-black tracking-tight text-white animate-pulse">
                        YatraSathi
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-[pulse_1s_infinite_0ms]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-[pulse_1s_infinite_200ms]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-[pulse_1s_infinite_400ms]" />
                    </div>
                </div>
            </div>

            {/* Skeleton Navbar */}
            <div className="absolute top-0 w-full p-4 opacity-10">
                <div className="mx-auto max-w-7xl h-16 rounded-3xl border border-white/20 bg-white/5" />
            </div>
        </div>
    );
}
