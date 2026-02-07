import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";

interface BackButtonProps {
    label?: string;
    href?: string;
    className?: string;
}

export default function BackButton({ label = "Back", href = "/", className = "" }: BackButtonProps) {
    return (
        <Link
            href={href}
            prefetch={true}
            className={`flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white transition-colors ${className}`}
        >
            <HiArrowLeft className="w-4 h-4" />
            {label}
        </Link>
    );
}
