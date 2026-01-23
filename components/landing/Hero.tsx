import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import { SafeUser } from "@/app/actions/authActions";

interface HeroProps {
    user: SafeUser | null;
}

export default function Hero({ user }: HeroProps) {
    return (
        <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/2 p-8 sm:p-16 backdrop-blur-3xl">
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 mb-8">
                        <span className="h-2 w-2 rounded-full bg-indigo-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Join the Future of Travel</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl leading-[1.1]">
                        Your <span className="text-indigo-500">Perfect</span> <br />
                        Travel Partner.
                    </h1>
                    <p className="mt-8 text-xl leading-relaxed text-slate-400 max-w-xl font-medium">
                        Experience a smarter way to move. Secure, fast, and remarkably sleek.
                        Your journey redefined with YatraSathi.
                    </p>

                    <div className="mt-12 flex flex-wrap gap-5">
                        {user ? (
                            <>
                                <Button
                                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
                                >
                                    Book a Journey
                                </Button>
                                <Button variant="secondary">
                                    Become a Driver
                                </Button>
                            </>
                        ) : (
                            <a href="/signup">
                                <Button
                                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
                                >
                                    Signup
                                </Button>
                            </a>
                        )}
                    </div>
                </div>

                <div className="relative hidden lg:block">
                    <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full" />
                    <Card variant="outline" className="relative h-96 w-full bg-linear-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-3xl overflow-hidden group">
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#0a0f18] to-transparent" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-80 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-64 border-2 border-indigo-500/30 rounded-full animate-pulse" />
                    </Card>
                </div>
            </div>
        </section>
    );
}
