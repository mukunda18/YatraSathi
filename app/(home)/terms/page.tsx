import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";

export const metadata = {
    title: "Terms of Service | YatraSathi",
    description: "Please read our terms of service carefully before using our platform.",
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-slate-950 relative overflow-hidden py-16 md:py-32 px-6">
            <div className="absolute top-0 right-0 h-100 w-100 bg-indigo-600/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

            <div className="max-w-3xl mx-auto">
                <Link href="/" className="mb-8 md:mb-12 inline-flex items-center px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                    <HiArrowLeft className="mr-2 w-4 h-4" />
                    Back to Home
                </Link>

                <h1 className="text-4xl font-black text-white tracking-tight mb-8">Terms of <span className="text-indigo-500 italic">Service</span></h1>

                <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-400 font-medium leading-loose">
                    <section>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest text-[11px] mb-4 border-l-2 border-indigo-500 pl-4">Acceptance of Terms</h2>
                        <p>By accessing or using YatraSathi, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest text-[11px] mb-4 border-l-2 border-indigo-500 pl-4">User Accounts</h2>
                        <p>You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest text-[11px] mb-4 border-l-2 border-indigo-500 pl-4">Ride-Sharing Conduct</h2>
                        <p>YatraSathi is a platform to connect riders and drivers. We do not provide transportation services. Users are responsible for their own safety and conduct during rides.</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Drivers must possess a valid license and insurance.</li>
                            <li>Passengers must respect driver vehicle rules.</li>
                            <li>All users must adhere to community guidelines.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest text-[11px] mb-4 border-l-2 border-indigo-500 pl-4">Termination</h2>
                        <p>We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our sole discretion.</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
