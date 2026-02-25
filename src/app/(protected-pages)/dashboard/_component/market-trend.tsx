"use client";

import React, { useEffect, useState, useCallback } from "react";
import Card from "@/components/ui/Card/Card";
import { TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import axios from "axios";

interface Coin {
    id: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h: number;
    sparkline_in_7d: { price: number[] };
}

export default function MarketTrend() {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMarkets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await axios.get<Coin[]>('/api/markets');
            setCoins(data);
        } catch (err) {
            setError("Failed to fetch market data. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMarkets();
    }, [fetchMarkets]);

    // ── Chart helpers ─────────────────────────────────────────────
    const chartHeight = 160;
    const chartWidth = 520;
    const paddingX = 50;
    const paddingY = 20;

    const maxPrice = coins.length
        ? Math.max(...coins.map((c) => c.current_price))
        : 1;

    const points = coins
        .map((coin, i) => {
            const x = paddingX + (i * (chartWidth - paddingX * 2)) / Math.max(coins.length - 1, 1);
            const y = chartHeight - (coin.current_price / maxPrice) * (chartHeight - paddingY);
            return `${x},${y}`;
        })
        .join(" ");

    const cardHeader = (
        <div className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span>Market Trends</span>
        </div>
    );

    // ── Skeleton ──────────────────────────────────────────────────
    if (loading) {
        return (
            <Card header={{ content: cardHeader, bordered: true }}>
                <div className="space-y-4 animate-pulse">
                    <div className="h-56 w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700" />
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    // ── Error ─────────────────────────────────────────────────────
    if (error) {
        return (
            <Card header={{ content: cardHeader, bordered: true }}>
                <div className="flex flex-col items-center justify-center gap-4 h-56">
                    <AlertCircle className="h-10 w-10 text-red-400" />
                    <p className="text-sm text-red-400 text-center">{error}</p>
                    <button
                        onClick={fetchMarkets}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                    </button>
                </div>
            </Card>
        );
    }

    // ── Main render ───────────────────────────────────────────────
    return (
        <Card header={{ content: cardHeader, bordered: true }}>
            <div className="space-y-4">

                {/* ── Line Chart ── */}
                <div className="w-full overflow-x-auto">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-56">
                        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                            const y = chartHeight - t * (chartHeight - paddingY);
                            return (
                                <g key={i}>
                                    <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#1e293b" strokeDasharray="4 4" />
                                    <text x={0} y={y + 4} fontSize="11" fill="#94a3b8">
                                        ${(maxPrice * t).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </text>
                                </g>
                            );
                        })}

                        <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points={points} />

                        {coins.map((coin, i) => {
                            const x = paddingX + (i * (chartWidth - paddingX * 2)) / Math.max(coins.length - 1, 1);
                            const y = chartHeight - (coin.current_price / maxPrice) * (chartHeight - paddingY);
                            return (
                                <g key={coin.id}>
                                    <title>{coin.symbol.toUpperCase()} — ${coin.current_price.toLocaleString()}</title>
                                    <circle cx={x} cy={y} r="4" fill="#3b82f6" />
                                </g>
                            );
                        })}

                        {coins.map((coin, i) => {
                            const x = paddingX + (i * (chartWidth - paddingX * 2)) / Math.max(coins.length - 1, 1);
                            return (
                                <text key={coin.id} x={x} y={chartHeight + 24} textAnchor="middle" fontSize="11" fill="#94a3b8">
                                    {coin.symbol.toUpperCase()}
                                </text>
                            );
                        })}
                    </svg>
                </div>

                {/* ── Price Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {coins.slice(0, 4).map((coin) => {
                        const change = coin.price_change_percentage_24h;
                        return (
                            <div key={coin.id} className="border shadow rounded-xl p-4 space-y-1">
                                <div className="text-sm text-slate-400">{coin.symbol.toUpperCase()}</div>
                                <div className="font-semibold">${coin.current_price.toLocaleString()}</div>
                                <div className={`text-sm ${change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-emerald-400"}`}>
                                    {change > 0 ? "▲" : change < 0 ? "▼" : ""}{" "}
                                    {Math.abs(change).toFixed(2)}%
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </Card>
    );
}