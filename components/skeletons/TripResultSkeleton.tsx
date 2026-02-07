export default function TripResultSkeleton() {
    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800" />
                    <div className="space-y-2">
                        <div className="h-3 w-24 bg-slate-800 rounded" />
                        <div className="h-2 w-16 bg-slate-800 rounded" />
                    </div>
                </div>
                <div className="h-6 w-16 bg-slate-800 rounded-lg" />
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-800 mt-1.5 shrink-0" />
                    <div className="space-y-1 w-full">
                        <div className="h-2 w-12 bg-slate-800 rounded" />
                        <div className="h-3 w-3/4 bg-slate-800 rounded" />
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-800 mt-1.5 shrink-0" />
                    <div className="space-y-1 w-full">
                        <div className="h-2 w-12 bg-slate-800 rounded" />
                        <div className="h-3 w-3/4 bg-slate-800 rounded" />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                    <div className="h-3 w-20 bg-slate-800 rounded" />
                    <div className="h-3 w-16 bg-slate-800 rounded" />
                </div>
                <div className="h-3 w-12 bg-slate-800 rounded" />
            </div>
        </div>
    );
}
