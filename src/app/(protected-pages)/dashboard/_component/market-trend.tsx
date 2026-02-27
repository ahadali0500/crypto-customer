"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Card from "@/components/ui/Card/Card";
import { TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import axios from "axios";

interface Coin {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    sparkline_in_7d: { price: number[] };
}

interface TooltipState {
    coin: Coin;
    x: number;
    y: number;
}

export default function MarketTrend() {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

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

    const getCoinCoords = (coin: Coin, i: number) => {
        const x = paddingX + (i * (chartWidth - paddingX * 2)) / Math.max(coins.length - 1, 1);
        const y = chartHeight - (coin.current_price / maxPrice) * (chartHeight - paddingY);
        return { x, y };
    };

    const points = coins
        .map((coin, i) => {
            const { x, y } = getCoinCoords(coin, i);
            return `${x},${y}`;
        })
        .join(" ");

    const handleNodeMouseEnter = (
        e: React.MouseEvent<SVGCircleElement>,
        coin: Coin,
        cx: number,
        cy: number
    ) => {
        if (!svgRef.current) return;
        const svgRect = svgRef.current.getBoundingClientRect();
        const viewBoxWidth = chartWidth;
        const viewBoxHeight = chartHeight + 40;
        const scaleX = svgRect.width / viewBoxWidth;
        const scaleY = svgRect.height / viewBoxHeight;

        // Convert SVG coords to pixel coords relative to SVG element
        const pixelX = cx * scaleX;
        const pixelY = cy * scaleY;

        setTooltip({ coin, x: pixelX, y: pixelY });
    };

    const handleNodeMouseLeave = () => {
        setTooltip(null);
    };

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
                <div className="w-full overflow-x-auto relative">
                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
                        className="w-full h-56"
                    >
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                            const y = chartHeight - t * (chartHeight - paddingY);
                            return (
                                <g key={i}>
                                    <line
                                        x1={paddingX}
                                        y1={y}
                                        x2={chartWidth - paddingX}
                                        y2={y}
                                        stroke="#1e293b"
                                        strokeDasharray="4 4"
                                    />
                                    <text x={0} y={y + 4} fontSize="11" fill="#94a3b8">
                                        ${(maxPrice * t).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Line */}
                        <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points={points} />

                        {/* Nodes */}
                        {coins.map((coin, i) => {
                            const { x, y } = getCoinCoords(coin, i);
                            const isHovered = tooltip?.coin.id === coin.id;
                            return (
                                <g key={coin.id}>
                                    {/* Invisible larger hit area */}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="12"
                                        fill="transparent"
                                        className="cursor-pointer"
                                        onMouseEnter={(e) => handleNodeMouseEnter(e, coin, x, y)}
                                        onMouseLeave={handleNodeMouseLeave}
                                    />
                                    {/* Outer glow ring when hovered */}
                                    {isHovered && (
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="8"
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="2"
                                            opacity="0.4"
                                        />
                                    )}
                                    {/* Main dot */}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={isHovered ? 6 : 4}
                                        fill={isHovered ? "#60a5fa" : "#3b82f6"}
                                        stroke={isHovered ? "#93c5fd" : "none"}
                                        strokeWidth="2"
                                        className="transition-all duration-150 pointer-events-none"
                                    />
                                </g>
                            );
                        })}

                        {/* X-axis labels */}
                        {coins.map((coin, i) => {
                            const { x } = getCoinCoords(coin, i);
                            return (
                                <text
                                    key={coin.id}
                                    x={x}
                                    y={chartHeight + 24}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill="#94a3b8"
                                >
                                    {coin.symbol.toUpperCase()}
                                </text>
                            );
                        })}
                    </svg>

                    {/* ── Hover Tooltip ── */}
                    {tooltip && (() => {
                        const change = tooltip.coin.price_change_percentage_24h;
                        const tooltipWidth = 200;
                        const tooltipHeight = 90;

                        // Clamp tooltip horizontally so it doesn't overflow the container
                        // svgRef gives us the rendered pixel width
                        const svgPixelWidth = svgRef.current?.getBoundingClientRect().width ?? 520;
                        let left = tooltip.x - tooltipWidth / 2;
                        if (left < 0) left = 0;
                        if (left + tooltipWidth > svgPixelWidth) left = svgPixelWidth - tooltipWidth;

                        // Position above the node; flip below if too close to top
                        let top = tooltip.y - tooltipHeight - 16;
                        if (top < 0) top = tooltip.y + 20;

                        return (
                            <div
                                className="pointer-events-none absolute z-10 rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-sm px-4 py-3 shadow-2xl"
                                style={{
                                    left,
                                    top,
                                    width: tooltipWidth,
                                    transition: "left 0.1s ease, top 0.1s ease",
                                }}
                            >
                                {/* Vertical line indicator */}
                                <div
                                    className="absolute top-full left-1/2 -translate-x-px w-px bg-slate-500"
                                    style={{ height: tooltip.y - (top + tooltipHeight) > 0 ? tooltip.y - (top + tooltipHeight) : 16 }}
                                />
                                <p className="text-sm font-semibold text-white mb-0.5">
                                    {tooltip.coin.name}
                                </p>
                                <p className="text-xl font-bold text-white">
                                    ${tooltip.coin.current_price.toLocaleString()}
                                </p>
                                <p className={`text-sm font-medium ${change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-slate-400"}`}>
                                    {change > 0 ? "▲" : change < 0 ? "▼" : ""}
                                    {" "}{Math.abs(change).toFixed(2)}% (24h)
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Market Cap: ${tooltip.coin.market_cap.toLocaleString()}
                                </p>
                            </div>
                        );
                    })()}
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