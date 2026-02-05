"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline" | "danger";
    fullWidth?: boolean;
    loading?: boolean;
    icon?: ReactNode;
}

export default function Button({
    children,
    variant = "primary",
    fullWidth = false,
    loading = false,
    icon,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "relative inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95";

    const variants = {
        primary: "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500",
        secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md",
        outline: "border border-white/20 text-white hover:bg-white/5",
        danger: "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    {children}
                    {icon}
                </>
            )}
        </button>
    );
}
