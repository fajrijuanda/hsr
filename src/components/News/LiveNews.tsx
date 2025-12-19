"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsItem {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    image: string | null;
    views: number;
    likes: number;
    type: string;
    url: string;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
    notice: { bg: "bg-red-500/20", text: "text-red-400", icon: "📢" },
    announcement: { bg: "bg-purple-500/20", text: "text-purple-400", icon: "📣" },
    event: { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: "🎉" },
    info: { bg: "bg-blue-500/20", text: "text-blue-400", icon: "ℹ️" },
    news: { bg: "bg-gray-500/20", text: "text-gray-400", icon: "📰" },
};

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NewsItemCard({ news }: { news: NewsItem }) {
    const style = TYPE_STYLES[news.type] || TYPE_STYLES.news;

    return (
        <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
        >
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="flex gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer"
            >
                {news.image && (
                    <div className="relative w-20 h-14 rounded-md overflow-hidden shrink-0">
                        <Image
                            src={news.image}
                            alt={news.title}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${style.bg} ${style.text} border-0 text-xs`}>
                            {style.icon} {news.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                            {formatTimeAgo(news.createdAt)}
                        </span>
                    </div>
                    <h4 className="text-sm font-medium text-white line-clamp-2">
                        {news.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>👁️ {news.views.toLocaleString()}</span>
                        <span>❤️ {news.likes.toLocaleString()}</span>
                    </div>
                </div>
            </motion.div>
        </a>
    );
}

function NewsSkeleton() {
    return (
        <div className="flex gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700">
            <Skeleton className="w-20 h-14 rounded-md" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    );
}

export function LiveNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>("");

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch("/api/hoyolab/news?type=1&pageSize=5");
                const data = await response.json();

                if (data.success) {
                    setNews(data.data);
                    setLastUpdated(
                        new Date(data.fetchedAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                    );
                    setError(null);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError("Failed to fetch news");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
        // Refresh every 30 minutes
        const interval = setInterval(fetchNews, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        📡 Live News
                        <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                            LIVE
                        </Badge>
                    </span>
                    {lastUpdated && (
                        <span className="text-xs text-gray-500 font-normal">
                            Updated {lastUpdated}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {loading && (
                    <>
                        <NewsSkeleton />
                        <NewsSkeleton />
                        <NewsSkeleton />
                    </>
                )}

                {error && (
                    <div className="text-center py-4 text-red-400">
                        <span>⚠️ {error}</span>
                    </div>
                )}

                {!loading && !error && news.length === 0 && (
                    <div className="text-center py-4 text-gray-400">
                        No news available
                    </div>
                )}

                {!loading &&
                    !error &&
                    news.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <NewsItemCard news={item} />
                        </motion.div>
                    ))}

                <a
                    href="https://www.hoyolab.com/circles/6/officialPost"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-sm text-purple-400 hover:text-purple-300 pt-2"
                >
                    View all on HoYoLAB →
                </a>
            </CardContent>
        </Card>
    );
}
