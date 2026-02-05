"use client";

import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
    rightElement?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    icon,
    rightElement,
    className = "",
    ...props
}, ref) => {
    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={`glass-input w-full rounded-2xl py-3.5 px-5 ${icon ? "pl-11" : ""} ${rightElement ? "pr-11" : ""} text-sm outline-none ${className}`}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-red-500 ml-1 font-medium">{error}</p>}
        </div>
    );
});

Input.displayName = "Input";

export default Input;
