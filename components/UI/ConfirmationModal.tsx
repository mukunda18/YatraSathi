"use client";

import Overlay from "./Overlay";
import Button from "./Button";
import { HiExclamation } from "react-icons/hi";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    variant?: "primary" | "danger";
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isLoading = false,
    variant = "primary"
}: ConfirmationModalProps) {
    return (
        <Overlay isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'} flex items-center justify-center mb-6`}>
                        <HiExclamation className="w-8 h-8" />
                    </div>

                    <h2 className="text-xl font-black text-white mb-2">{title}</h2>
                    <p className="text-slate-500 text-sm font-medium mb-8">
                        {message}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <Button
                            variant={variant === 'danger' ? 'danger' : 'primary'}
                            fullWidth
                            onClick={onConfirm}
                            loading={isLoading}
                        >
                            {confirmLabel}
                        </Button>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </Overlay>
    );
}
