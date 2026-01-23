import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: ReactNode;
    error?: string;
    rightElement?: ReactNode;
}

export default function Input({
    label,
    icon,
    error,
    rightElement,
    className = "",
    id,
    ...props
}: InputProps) {
    return (
        <div className="space-y-2">
            {label && (
                <label htmlFor={id} className="block text-xs font-bold uppercase tracking-widest text-indigo-400">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    className={`block w-full rounded-2xl border-0 bg-white/5 py-4 ${icon ? "pl-12" : "pl-5"} ${rightElement ? "pr-12" : "pr-5"} text-white shadow-inner ring-1 ring-inset ${error ? 'ring-red-500/50' : 'ring-white/10'} placeholder-slate-500 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-all outline-none ${className}`}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && <p className="mt-2 text-xs text-red-400 font-semibold animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
}
