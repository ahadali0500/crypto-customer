import React from "react";
import Card from "@/components/ui/Card/Card";
import { TrendingUp } from "lucide-react";

const coins = [
  { symbol: "BTC", price: 87699, change: -1.0 },
  { symbol: "ETH", price: 2889.67, change: -1.7 },
  { symbol: "USDT", price: 0.999, change: 0.0 },
  { symbol: "BNB", price: 871.01, change: -1.1 },
  { symbol: "XRP", price: 0.62, change: -0.4 },
  { symbol: "SOL", price: 98.4, change: 0.3 },
  { symbol: "DOGE", price: 0.08, change: -0.2 },
  { symbol: "ADA", price: 0.54, change: 0.1 },
];

export default function MarketTrend() {
  const maxPrice = Math.max(...coins.map(c => c.price));
  const chartHeight = 160;
  const chartWidth = 520;
  const paddingX = 50;
  const paddingY = 20;

  const points = coins
    .map((coin, i) => {
      const x = paddingX + (i * (chartWidth - paddingX * 2)) / (coins.length - 1);
      const y = chartHeight - (coin.price / maxPrice) * (chartHeight - paddingY);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card
      header={{
        content: (
          <div className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span>Market Trends</span>
          </div>
        ),
        bordered: true,
      }}
    >
      <div className="space-y-4">

        {/* Line Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
            className="w-full h-56"
          >
            {/* Y-axis grid + labels */}
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
                    ${(maxPrice * t).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              points={points}
            />

            {/* Dots */}
            {coins.map((coin, i) => {
              const x = paddingX + (i * (chartWidth - paddingX * 2)) / (coins.length - 1);
              const y = chartHeight - (coin.price / maxPrice) * (chartHeight - paddingY);
              return (
                <circle key={coin.symbol} cx={x} cy={y} r="4" fill="#3b82f6" />
              );
            })}

            {/* X-axis labels */}
            {coins.map((coin, i) => {
              const x = paddingX + (i * (chartWidth - paddingX * 2)) / (coins.length - 1);
              return (
                <text
                  key={coin.symbol}
                  x={x}
                  y={chartHeight + 24}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#94a3b8"
                >
                  {coin.symbol}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {coins.slice(0, 4).map((coin) => (
            <div
              key={coin.symbol}
              className="border shadow rounded-xl p-4 space-y-1"
            >
              <div className="text-sm text-slate-400">{coin.symbol}</div>
              <div className="font-semibold">${coin.price.toLocaleString()}</div>
              <div
                className={`text-sm ${
                  coin.change > 0
                    ? "text-green-400"
                    : coin.change < 0
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              >
                {coin.change > 0 ? "▲" : coin.change < 0 ? "▼" : ""} {Math.abs(coin.change)}%
              </div>
            </div>
          ))}
        </div>

      </div>
    </Card>
  );
}