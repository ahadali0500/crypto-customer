"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DollarSign, CreditCard, Activity, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { log } from "console";

interface CardData {
  totalBalanceUSD: number;
  lockedBalanceUSD: number;
  availableBalanceUSD: number;
}

interface StatCardsProps {
  cardData?: CardData;
}

// ✅ minimal types (we only need status)
type Deposit = { status?: string };
type Withdrawal = { withdrawStatus?: string };

export default function StatCards({ cardData }: StatCardsProps) {
  const router = useRouter();
  const [balanceVisible, setBalanceVisible] = useState(true);

  const [kycData, setKycData] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);

  // ✅ histories for trading status
  const [depositHistory, setDepositHistory] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  const [loading, setLoading] = useState(false);

  const token = useMemo(() => {
    if (typeof window !== "undefined") return localStorage.getItem("authToken");
    return null;
  }, []);

  // -------------------------
  // Fetch user details
  // -------------------------
  const fetchUserDetails = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/fetch`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserDetails(res.data.data);
    } catch (error) {
      console.error("Failed to fetch user details", error);
    }
  }, [token]);

  // -------------------------
  // Fetch kyc status
  // -------------------------
  const fetchKycStatus = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/kyc/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const customer = res.data?.data?.customer;
      const docs = res.data?.data?.docs || [];
      setKycData({ customer, docs });
    } catch (e) {
      console.error("Failed to fetch KYC status", e);
    }
  }, [token]);

  // -------------------------
  // ✅ Fetch deposit history
  // -------------------------
  const fetchDepositHistory = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/deposit/crytpo/fetch`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
   
      setDepositHistory(res.data.data || []);
    } catch (error) {
      console.error("Error fetching deposit history:", error);
      setDepositHistory([]);
    }
  }, [token]);

  // -------------------------
  // ✅ Fetch withdrawal history
  // -------------------------
  const fetchWithdrawalHistory = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/withdraw/fetch?withdrawType=Crypto`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      
      setWithdrawals(res.data.data || []);
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      setWithdrawals([]);
    }
  }, [token]);

  // ✅ Call all APIs together
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    Promise.all([
      fetchKycStatus(),
      fetchUserDetails(),
      fetchDepositHistory(),
      fetchWithdrawalHistory(),
    ]).finally(() => setLoading(false));
  }, [
    token,
    fetchKycStatus,
    fetchUserDetails,
    fetchDepositHistory,
    fetchWithdrawalHistory,
  ]);

  // -------------------------
  // Values
  // -------------------------
  const totalBalance = (
    Number(cardData?.lockedBalanceUSD ?? 0) +
    Number(cardData?.availableBalanceUSD ?? 0)
  ).toFixed(2);

  const kycStatus = kycData?.customer?.kycStatus ?? "NotStarted";
  const displayStatus = kycStatus === "NotStarted" ? "Not Started" : kycStatus;

  // -------------------------
  // ✅ Trading status rule
  // Active ONLY if (deposit Executed) AND (withdraw Executed)
  // -------------------------
  const hasExecutedDeposit = depositHistory.some(
    (d) => String(d?.status)=== "Executed"
  );

  const hasExecutedWithdrawal = withdrawals.some(
    (w) => String(w?.withdrawStatus)=== "Executed"
  );

  const isTradingActive = hasExecutedDeposit && hasExecutedWithdrawal;
  const tradingStatus = isTradingActive ? "Active" : "Restricted";

  const cards = [
    {
      id: 1,
      title: "Total Portfolio Balance",
      value: balanceVisible ? `$${totalBalance}` : "••••••",
      subtitle: `Locked $${cardData?.lockedBalanceUSD ?? "0.00"} · Available $${cardData?.availableBalanceUSD ?? "0.00"}`,
      footer: "Live prices · USD",
      dotColor: "bg-green-400",
      bg: "from-blue-600 to-purple-600",
      glowHover: "rgba(99,102,241,0.45)",
      glowBase: "rgba(99,102,241,0.2)",
      icon: <DollarSign className="h-4 w-4" />,
      extraIcon: (
        <span
          className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setBalanceVisible((prev) => !prev);
          }}
        >
          {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </span>
      ),
    },
    {
      id: 2,
      title: "Account Status",
      value: loading ? "Loading..." : displayStatus,
      subtitle:
        kycStatus === "Approved"
          ? "Your account is fully verified and active"
          : "Complete KYC to unlock full access",
      footer: "KYC Verification",
      dotColor:
        kycStatus === "Approved"
          ? "bg-green-400"
          : kycStatus === "Rejected"
          ? "bg-red-400"
          : "bg-yellow-400",
      bg: "from-orange-500 to-orange-600",
      glowHover: "rgba(249,115,22,0.45)",
      glowBase: "rgba(249,115,22,0.2)",
      icon: <CreditCard className="h-4 w-4" />,
      onClick: () => router.push("/kyc-verification"),
    },
    {
      id: 3,
      title: "Trading Status",
      value: loading ? "Loading..." : tradingStatus,
      subtitle: isTradingActive
        ? "Deposit and withdrawal executed on your account"
        : "Need 1 executed deposit and 1 executed withdrawal",
      footer: isTradingActive ? "Full access" : "Limited access",
      dotColor: isTradingActive ? "bg-green-400" : "bg-yellow-400",
      bg: "from-slate-700 to-slate-800",
      glowHover: "rgba(100,116,139,0.5)",
      glowBase: "rgba(100,116,139,0.25)",
      icon: <Activity className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`rounded-xl p-6 text-white bg-gradient-to-br ${card.bg}`}
          style={{ boxShadow: `0 6px 28px ${card.glowBase}` }}
          onClick={card.onClick}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium opacity-90">{card.title}</p>
            <div className="flex items-center gap-2">
              {card.extraIcon && card.extraIcon}
              <div className="rounded-md bg-white/15 p-1.5">{card.icon}</div>
            </div>
          </div>

          <div className="mt-4 text-xl font-semibold">{card.value}</div>
          <p className="mt-2 text-xs opacity-80">{card.subtitle}</p>

          {card.footer && (
            <div className="mt-4 flex items-center gap-2 text-xs opacity-90">
              {card.dotColor && <span className={`h-2 w-2 rounded-full ${card.dotColor}`} />}
              {card.footer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}