export default function TripsSidebarSkeleton() {
    return (
        <aside className="w-80 shrink-0 sticky top-28">
            <div className="flex items-center justify-between mb-4">
                <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-12 bg-slate-800 rounded animate-pulse" />
            </div>

            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="block bg-slate-900/30 border border-white/5 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse" />
                                <div className="h-2 w-12 bg-slate-800 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="h-4 w-24 bg-slate-800 rounded animate-pulse mb-1" />
                        <div className="h-3 w-20 bg-slate-800 rounded animate-pulse mb-2" />
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-slate-800 animate-pulse" />
                            <div className="h-2 w-16 bg-slate-800 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
