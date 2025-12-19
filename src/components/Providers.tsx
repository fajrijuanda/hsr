"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/feedback";
import { UidSetupDialog } from "@/components/Auth/UidSetupDialog";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ToastProvider>
                {children}
                <UidSetupDialog />
            </ToastProvider>
        </SessionProvider>
    );
}
