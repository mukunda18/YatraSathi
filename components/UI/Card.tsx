import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: "glass" | "glass-alt" | "outline";
}

export default function Card({ children, className = "", variant = "glass" }: CardProps) {
    const variants = {
        glass: "bg-white/3 backdrop-blur-3xl border-white/10",
        "glass-alt": "bg-white/2 backdrop-blur-2xl border-white/5 hover:bg-white/5 transition-all duration-500",
        outline: "border border-white/10"
    };

    return (
        <div className={`rounded-[2.5rem] border ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}
