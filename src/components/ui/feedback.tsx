"use client";

import { useState, createContext, useContext, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// Toast types
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

const TOAST_ICONS: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
};

const TOAST_COLORS: Record<ToastType, string> = {
    success: "bg-emerald-500/20 border-emerald-500 text-emerald-400",
    error: "bg-red-500/20 border-red-500 text-red-400",
    warning: "bg-yellow-500/20 border-yellow-500 text-yellow-400",
    info: "bg-blue-500/20 border-blue-500 text-blue-400",
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);

        // Auto remove after duration
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, toast.duration || 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({
    toasts,
    removeToast,
}: {
    toasts: Toast[];
    removeToast: (id: string) => void;
}) {
    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        className={`
              p-4 rounded-lg border backdrop-blur-sm shadow-lg
              ${TOAST_COLORS[toast.type]}
            `}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-lg">{TOAST_ICONS[toast.type]}</span>
                            <div className="flex-1">
                                <div className="font-medium">{toast.title}</div>
                                {toast.message && (
                                    <p className="text-sm opacity-80 mt-1">{toast.message}</p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="opacity-60 hover:opacity-100"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// ==================== ALERT DIALOG ====================

interface AlertDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    type?: "info" | "warning" | "error" | "success";
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
}

const ALERT_ICONS: Record<string, string> = {
    info: "ℹ️",
    warning: "⚠️",
    error: "❌",
    success: "✅",
};

export function AlertDialog({
    open,
    onClose,
    title,
    description,
    type = "info",
    confirmText = "OK",
    cancelText = "Cancel",
    onConfirm,
    showCancel = false,
}: AlertDialogProps) {
    const handleConfirm = () => {
        onConfirm?.();
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                        onClick={onClose}
                    />
                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201]
                       bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">{ALERT_ICONS[type]}</span>
                            <h3 className="text-xl font-bold text-white">{title}</h3>
                        </div>
                        {description && (
                            <p className="text-gray-300 mb-6">{description}</p>
                        )}
                        <div className="flex justify-end gap-3">
                            {showCancel && (
                                <Button variant="outline" onClick={onClose}>
                                    {cancelText}
                                </Button>
                            )}
                            <Button onClick={handleConfirm}>{confirmText}</Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ==================== LOADING SCREEN ====================

interface LoadingScreenProps {
    show: boolean;
    message?: string;
}

export function LoadingScreen({ show, message = "Loading..." }: LoadingScreenProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-gray-950/95 backdrop-blur-md z-[300] flex items-center justify-center"
                >
                    <div className="text-center">
                        {/* HSR-themed loading spinner */}
                        <motion.div
                            className="w-16 h-16 mx-auto mb-4 relative"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            {/* Outer ring */}
                            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
                            {/* Spinning arc */}
                            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full" />
                            {/* Inner glow */}
                            <div className="absolute inset-2 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full" />
                        </motion.div>

                        {/* Star particles */}
                        <div className="relative h-8 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <motion.span
                                    key={i}
                                    className="absolute text-yellow-400 text-sm"
                                    style={{ left: `${20 + i * 15}%` }}
                                    animate={{
                                        y: [0, -10, 0],
                                        opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                >
                                    ✦
                                </motion.span>
                            ))}
                        </div>

                        <motion.p
                            className="text-lg text-gray-300"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {message}
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ==================== LOADING SPINNER ====================

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
    const sizes = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-10 h-10",
    };

    return (
        <motion.div
            className={`${sizes[size]} ${className}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
            <div className="w-full h-full border-2 border-purple-500/30 border-t-purple-500 rounded-full" />
        </motion.div>
    );
}
