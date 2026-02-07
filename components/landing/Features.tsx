import { HiShieldCheck, HiCurrencyRupee, HiUserGroup, HiLightningBolt } from "react-icons/hi";

const features = [
    {
        icon: HiShieldCheck,
        title: "Verified Users",
        description: "All drivers and passengers are verified for your safety",
        color: "indigo"
    },
    {
        icon: HiCurrencyRupee,
        title: "Save Money",
        description: "Share travel costs and reduce your expenses",
        color: "emerald"
    },
    {
        icon: HiUserGroup,
        title: "Community",
        description: "Connect with travelers going your way",
        color: "blue"
    },
    {
        icon: HiLightningBolt,
        title: "Quick Booking",
        description: "Find and book rides in seconds",
        color: "amber"
    }
];

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" }
};

export default function Features() {
    return (
        <section className="mt-12">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4">Why YatraSathi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {features.map((feature) => {
                    const colors = colorMap[feature.color];
                    return (
                        <div
                            key={feature.title}
                            className="bg-slate-900/30 border border-white/5 rounded-xl p-4"
                        >
                            <div className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center mb-3`}>
                                <feature.icon className={`w-4 h-4 ${colors.text}`} />
                            </div>
                            <h3 className="text-xs font-black text-white mb-1">{feature.title}</h3>
                            <p className="text-[10px] text-slate-500 leading-relaxed">{feature.description}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
