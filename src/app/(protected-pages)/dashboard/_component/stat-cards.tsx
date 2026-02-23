import React from "react";
import { BarChart2, DollarSign, CreditCard, Activity, Eye } from "lucide-react";

interface CardData {
  totalBalanceUSD: number;
  lockedBalanceUSD: number;
  availableBalanceUSD: number;
  // account/trading status fields from your API
  accountStatus?: string;       // e.g. "Active" | "Suspended"
  tradingStatus?: string;       // e.g. "Active" | "Restricted"
  hasDeposit?: boolean;
  hasWithdrawal?: boolean;
}

interface StatCardsProps {
  cardData?: CardData;
}

export default function StatCards({ cardData }: StatCardsProps) {
  // Card 1: sum of locked + available (API returns strings, so coerce to Number)
  const totalBalance =
    (Number(cardData?.lockedBalanceUSD ?? 0) + Number(cardData?.availableBalanceUSD ?? 0)).toFixed(2);

  // Card 2: account status — default Active, admin can change
  const accountStatus = cardData?.accountStatus || "Active";
  const isAccountActive = accountStatus === "Active";

  // Card 3: trading status — Active only if user has deposit OR withdrawal history
  const hasActivity = cardData?.hasDeposit || cardData?.hasWithdrawal;
  const tradingStatus = hasActivity ? "Active" : "Restricted";
  const isTradingActive = tradingStatus === "Active";

  const cards = [
    {
      id: 1,
      title: "Total Portfolio Balance",
      value: `$${totalBalance}`,
      subtitle: `Locked $${cardData?.lockedBalanceUSD ?? "0.00"} · Available $${cardData?.availableBalanceUSD ?? "0.00"}`,
      footer: "Live prices · USD",
      dotColor: "bg-green-400",
      bg: "from-blue-600 to-purple-600",
      glowHover: "rgba(99,102,241,0.45)",
      glowBase: "rgba(99,102,241,0.2)",
      icon: <DollarSign className="h-4 w-4" />,
      extraIcon: <Eye className="h-4 w-4 cursor-pointer" />,
    },
    {
      id: 2,
      title: "Account Status",
      value: accountStatus,
      subtitle: isAccountActive
        ? "Your account is fully verified and active"
        : "Contact support to reactivate your account",
      footer: isAccountActive ? "KYC · Verified" : "Action required",
      dotColor: isAccountActive ? "bg-green-400" : "bg-red-400",
      bg: "from-orange-500 to-orange-600",
      glowHover: "rgba(249,115,22,0.45)",
      glowBase: "rgba(249,115,22,0.2)",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      id: 3,
      title: "Trading Status",
      value: tradingStatus,
      subtitle: isTradingActive
        ? "Deposits and withdrawals detected on your account"
        : "Make a deposit or withdrawal to unlock trading",
      footer: isTradingActive ? "Full access" : "Limited access",
      dotColor: isTradingActive ? "bg-green-400" : "bg-yellow-400",
      bg: "from-slate-700 to-slate-800",
      glowHover: "rgba(100,116,139,0.5)",
      glowBase: "rgba(100,116,139,0.25)",
      icon: <Activity className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <style>{`
        .bal-card {
          position: relative;
          overflow: hidden;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease;
          cursor: pointer;
        }
        .bal-card::before {
          content: '';
          position: absolute;
          top: 0; left: -75%;
          width: 50%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.11), transparent);
          transform: skewX(-20deg);
          transition: left 0.55s ease;
          z-index: 2;
          pointer-events: none;
        }
        .bal-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0);
          transition: border-color 0.35s ease;
          pointer-events: none;
          z-index: 3;
        }
        .bal-card:hover { transform: translateY(-4px) scale(1.01); }
        .bal-card:hover::before { left: 125%; }
        .bal-card:hover::after { border-color: rgba(255,255,255,0.18); }
        .bal-card:active { transform: translateY(-1px) scale(0.99); transition: transform 0.1s ease; }
        .bal-orb {
          position: absolute; bottom: -40px; right: -40px;
          width: 140px; height: 140px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%);
          filter: blur(20px); opacity: 0.45;
          transition: opacity 0.4s ease, transform 0.4s ease;
          pointer-events: none; z-index: 1;
        }
        .bal-card:hover .bal-orb { opacity: 0.7; transform: scale(1.15) translate(-4px, -4px); }
        .bal-icon {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease;
        }
        .bal-card:hover .bal-icon { transform: rotate(-8deg) scale(1.1); background: rgba(255,255,255,0.25) !important; }
        .bal-value { transition: letter-spacing 0.3s ease; }
        .bal-card:hover .bal-value { letter-spacing: 0.02em; }
        .bal-dot { animation: bal-pulse 2.2s ease-in-out infinite; }
        @keyframes bal-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }
      `}</style>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`bal-card rounded-xl p-6 text-white bg-gradient-to-br ${card.bg}`}
            style={{ boxShadow: `0 6px 28px ${card.glowBase}` }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                `0 14px 36px ${card.glowHover}, 0 4px 12px rgba(0,0,0,0.2)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                `0 6px 28px ${card.glowBase}`;
            }}
          >
            <div className="bal-orb" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between">
              <p className="text-sm font-medium opacity-90">{card.title}</p>
              <div className="flex items-center gap-2">
                {card.extraIcon && (
                  <span className="opacity-80 hover:opacity-100 transition-opacity">
                    {card.extraIcon}
                  </span>
                )}
                <div className="bal-icon rounded-md bg-white/15 p-1.5">
                  {card.icon}
                </div>
              </div>
            </div>

            {/* Value */}
            <div className="bal-value relative z-10 mt-4 text-3xl font-semibold">
              {card.value}
            </div>

            {/* Subtitle */}
            <p className="relative z-10 mt-2 text-xs opacity-80">{card.subtitle}</p>

            {/* Footer */}
            {card.footer && (
              <div className="relative z-10 mt-4 flex items-center gap-2 text-xs opacity-90">
                {card.dotColor && (
                  <span className={`bal-dot h-2 w-2 rounded-full ${card.dotColor}`} />
                )}
                {card.footer}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}