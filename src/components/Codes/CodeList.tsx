"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RedemptionCode } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CodeCardProps {
    code: RedemptionCode;
}

function CodeCard({ code }: CodeCardProps) {
    const [copied, setCopied] = useState(false);

    const copyCode = async () => {
        await navigator.clipboard.writeText(code.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const redeemUrl = `https://hsr.hoyoverse.com/gift?code=${code.code}`;

    const statusColors = {
        active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
        expired: "bg-gray-500/20 text-gray-400 border-gray-500/50",
        new: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`
        p-3 rounded-lg border flex items-center justify-between gap-3
        ${code.status === "new"
                    ? "bg-yellow-900/10 border-yellow-500/30"
                    : "bg-gray-800/30 border-gray-700"
                }
      `}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-white">
                        {code.code}
                    </code>
                    <Badge className={statusColors[code.status]}>
                        {code.status === "new" ? "🔥 NEW" : code.status.toUpperCase()}
                    </Badge>
                </div>
                <p className="text-sm text-gray-400 truncate">
                    {code.rewards}
                </p>
                <p className="text-xs text-gray-500">
                    {code.source}
                </p>
            </div>

            <div className="flex gap-2 shrink-0">
                <Button
                    size="sm"
                    variant={copied ? "default" : "outline"}
                    onClick={copyCode}
                    className={copied ? "bg-emerald-600" : ""}
                >
                    {copied ? "✓ Copied" : "Copy"}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="text-purple-400 border-purple-500/50 hover:bg-purple-500/20"
                >
                    <a href={redeemUrl} target="_blank" rel="noopener noreferrer">
                        Redeem
                    </a>
                </Button>
            </div>
        </motion.div>
    );
}

interface CodeListProps {
    codes: RedemptionCode[];
}

export function CodeList({ codes }: CodeListProps) {
    // Sort: new first, then active, then expired
    const sortedCodes = [...codes].sort((a, b) => {
        const order = { new: 0, active: 1, expired: 2 };
        return order[a.status] - order[b.status];
    });

    const activeCodes = sortedCodes.filter(c => c.status !== "expired");

    return (
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>🎁 Redemption Codes</span>
                    <Badge variant="outline" className="text-xs">
                        {activeCodes.length} active
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {sortedCodes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                        No codes available at the moment
                    </p>
                ) : (
                    sortedCodes.map((code, index) => (
                        <motion.div
                            key={code.code}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <CodeCard code={code} />
                        </motion.div>
                    ))
                )}

                <div className="pt-2 text-center">
                    <p className="text-xs text-gray-500">
                        Codes are updated from community sources. Some may expire without notice.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
