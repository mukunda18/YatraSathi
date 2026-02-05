"use client";

import { ReactNode } from "react";
import Card from "@/components/UI/Card";

interface FeatureCardProps {
    title: string;
    desc: string;
    icon?: ReactNode;
    color?: string;
}

export default function FeatureCard({ title, desc, icon, color = "indigo" }: FeatureCardProps) {
    const colorVariants: Record<string, string> = {
        indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        green: "bg-green-500/10 text-green-500 border-green-500/20",
        amber: "bg-amber-500/10 text-amber-500 border-amber-500/20"
    };

    return (
        <Card className="p-8 group hover:-translate-y-2 transition-all duration-300">
            <div className={`mb-6 h-14 w-14 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-500 ${colorVariants[color]}`}>
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {icon}
                </svg>
            </div>
            <h3 className="font-black text-white mb-3 uppercase tracking-wider text-sm">{title}</h3>
            <p className="text-slate-400 leading-relaxed font-medium">{desc}</p>
        </Card>
    );
}
