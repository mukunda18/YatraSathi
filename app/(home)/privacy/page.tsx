export const metadata = {
    title: "Privacy Policy | YatraSathi",
    description: "Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-slate-950 relative overflow-hidden py-32 px-6">
            <div className="absolute top-0 right-0 h-100 w-100 bg-indigo-600/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-black text-white tracking-tight mb-8">Privacy <span className="text-indigo-500 italic">Policy</span></h1>

                <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-400 font-medium leading-loose">
                    <section>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest text-[11px] mb-4 border-l-2 border-indigo-500 pl-4">Introduction</h2>
                        <p>At YatraSathi, your privacy is important to us. This Privacy Policy explains how we collect, use, and share information about you when you use our mobile applications, websites, and other online products and services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest text-[11px] mb-4 border-l-2 border-indigo-500 pl-4">Information We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Account Information: Name, email address, phone number.</li>
                            <li>KYC Data: License information and government ID for driver verification.</li>
                            <li>Location Data: Precise or approximate location to connect you with rides.</li>
                            <li>Usage Information: How you interact with our services.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest text-[11px] mb-4 border-l-2 border-indigo-500 pl-4">How We Use Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, such as to facilitate ride-sharing, verify driver accounts, and send support messages.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest text-[11px] mb-4 border-l-2 border-indigo-500 pl-4">Data Security</h2>
                        <p>We use industry-standard security measures to protect your information. However, no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
