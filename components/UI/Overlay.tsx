"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUIStore } from "@/store/uiStore";

interface OverlayProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    showBackdrop?: boolean;
    closeOnBackdropClick?: boolean;
    zIndex?: number;
}

export default function Overlay({
    isOpen,
    onClose,
    children,
    showBackdrop = true,
    closeOnBackdropClick = true,
    zIndex = 9999
}: OverlayProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleEscape);
        }

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            useUIStore.getState().incrementOverlays();
            return () => {
                useUIStore.getState().decrementOverlays();
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const overlayContent = (
        <div
            className="fixed inset-0 flex items-center justify-center p-4 transition-all duration-300"
            style={{ zIndex }}
        >
            {/* Backdrop */}
            {showBackdrop && (
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={closeOnBackdropClick ? onClose : undefined}
                    onMouseDown={(e) => e.stopPropagation()}
                />
            )}

            {/* Content Container */}
            <div
                className="relative z-10 w-full flex items-center justify-center pointer-events-none"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="pointer-events-auto w-full flex justify-center">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(overlayContent, document.body);
}
