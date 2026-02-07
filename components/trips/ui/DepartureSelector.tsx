"use client";

interface DepartureSelectorProps {
    travelYear: string;
    travelMonth: string;
    travelDay: string;
    travelHour: string;
    travelMinute: string;
    setTravelYear: (year: string) => void;
    setTravelMonth: (month: string) => void;
    setTravelDay: (day: string) => void;
    setTravelHour: (hour: string) => void;
    setTravelMinute: (minute: string) => void;
}

export default function DepartureSelector({
    travelYear, setTravelYear,
    travelMonth, setTravelMonth,
    travelDay, setTravelDay,
    travelHour, setTravelHour,
    travelMinute, setTravelMinute
}: DepartureSelectorProps) {
    return (
        <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Departure</label>
            <div className="grid grid-cols-3 gap-1.5">
                <select value={travelYear} onChange={(e) => setTravelYear(e.target.value)} className="bg-slate-900/40 border border-white/5 rounded-xl px-2 py-2 text-[10px] text-white outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 transition-all">
                    {[2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={travelMonth} onChange={(e) => setTravelMonth(e.target.value)} className="bg-slate-900/40 border border-white/5 rounded-xl px-2 py-2 text-[10px] text-white outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 transition-all">
                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => <option key={m} value={m}>{new Date(2000, parseInt(m) - 1).toLocaleString('default', { month: 'short' })}</option>)}
                </select>
                <select value={travelDay} onChange={(e) => setTravelDay(e.target.value)} className="bg-slate-900/40 border border-white/5 rounded-xl px-2 py-2 text-[10px] text-white outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 transition-all">
                    {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="flex-1 flex gap-1.5">
                    <select value={travelHour} onChange={(e) => setTravelHour(e.target.value)} className="bg-slate-900/40 border border-white/5 rounded-xl px-2 py-2 text-[10px] text-white flex-1 outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 transition-all">
                        {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="text-slate-600 self-center font-black text-xs">:</span>
                    <select value={travelMinute} onChange={(e) => setTravelMinute(e.target.value)} className="bg-slate-900/40 border border-white/5 rounded-xl px-2 py-2 text-[10px] text-white flex-1 outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 transition-all">
                        {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
}
