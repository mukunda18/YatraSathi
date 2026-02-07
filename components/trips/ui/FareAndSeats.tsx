"use client";

import { HiCurrencyRupee } from "react-icons/hi";
import Input from "@/components/UI/Input";
import { useTripCreationStore } from "@/store/tripCreationStore";

export default function FareAndSeats() {
    const { fare, setFare, seats, setSeats } = useTripCreationStore();

    return (
        <div className="grid grid-cols-2 gap-3">
            <Input
                label="Fare (RS)"
                type="number"
                icon={<HiCurrencyRupee />}
                value={fare}
                onChange={(e) => setFare(e.target.value)}
                placeholder="0.00"
                className="py-2.5 text-xs text-indigo-400 font-bold"
            />
            <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">Available Seats</label>
                <div className="flex items-center justify-between bg-slate-900/40 border border-white/5 rounded-xl p-1.5 h-[42px] transition-all hover:border-white/10">
                    <button type="button" onClick={() => setSeats(Math.max(1, seats - 1))} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-black transition-all active:scale-90 opacity-60 hover:opacity-100 flex items-center justify-center">-</button>
                    <span className="text-xs font-black text-white px-2 tabular-nums">{seats}</span>
                    <button type="button" onClick={() => setSeats(Math.min(10, seats + 1))} className="w-7 h-7 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 text-white text-xs font-black transition-all active:scale-90 flex items-center justify-center">+</button>
                </div>
            </div>
        </div>
    );
}
