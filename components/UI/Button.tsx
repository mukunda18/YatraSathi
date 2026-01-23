import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
    icon?: ReactNode;
    fullWidth?: boolean;
    loading?: boolean;
}

export default function Button({
    children,
    variant = "primary",
    icon,
    fullWidth = false,
    loading = false,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "relative inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-black transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden select-none";

    const variants = {
        primary: "bg-indigo-600 text-white shadow-[0_0_25px_rgba(79,70,229,0.3)] hover:bg-indigo-500",
        secondary: "bg-white/10 text-white border border-white/10 hover:bg-white/20",
        outline: "border border-white/20 text-white hover:bg-white/5",
        danger: "bg-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.3)] hover:bg-red-500",
        ghost: "text-slate-400 hover:text-white hover:bg-white/5 px-4 py-2"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : (
                <>
                    {children}
                    {icon && <span className="h-5 w-5">{icon}</span>}
                </>
            )}
        </button>
    );
}
