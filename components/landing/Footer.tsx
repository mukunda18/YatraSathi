import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-slate-950/50">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <Image
                                src="/logo.png"
                                alt="YatraSathi logo"
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-xl object-contain"
                            />
                            <span className="text-lg font-black text-white italic">YatraSathi</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                            Your trusted ride-sharing companion. Connect with fellow travelers, share costs, and make every journey memorable.
                        </p>
                    </div>

                    <nav>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/trips/join" className="text-sm text-slate-500 hover:text-white transition-colors">Find a Ride</Link></li>
                            <li><Link href="/trips/new" className="text-sm text-slate-500 hover:text-white transition-colors">Offer a Ride</Link></li>
                            <li><Link href="/trips" className="text-sm text-slate-500 hover:text-white transition-colors">My Trips</Link></li>
                        </ul>
                    </nav>

                    <nav>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li><Link href="/help" className="text-sm text-slate-500 hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="/privacy" className="text-sm text-slate-500 hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-sm text-slate-500 hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </nav>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-600">© 2026 YatraSathi. All rights reserved.</p>
                    <p className="text-xs text-slate-600">Made for Nepal</p>
                </div>
            </div>
        </footer>
    );
}
