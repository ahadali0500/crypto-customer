'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import Card from '@/components/ui/Card/Card';

interface ExchangeItem {
  id: number;
  sellAmount: string;
  buyAmount: string;
  fees: string;
  createdAt: string;
  sellAsset?: { shortName: string };
  buyAsset?: { shortName: string };
  exchangeBalanceType?: string;
}

interface DepositItem {
  id: number;
  type: string;
  amount: string;
  status?: string;
  createdAt: string;
  currency?: { shortName: string };
}

interface WithdrawItem {
  id: number;
  withdrawType: string;
  amount: string;
  withdrawStatus?: string;
  createdAt: string;
  currency?: { shortName: string };
  balancetype?: string;
}

const fmt = (n: string | number, decimals = 4) =>
  parseFloat(String(n)).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUS_STYLES: Record<string, string> = {
  Pending:
    'bg-zinc-200 text-zinc-800 dark:bg-zinc-700/50 dark:text-zinc-300',

  Processing:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',

  Execute:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',

  Completed:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',

  Success:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',

  Failed:
    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',

  Decline:
    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
};

const StatusBadge = ({ status }: { status?: string }) => {
  const label = status || 'Unknown';
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[label] ?? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700/50 dark:text-zinc-300'
        }`}
    >
      {label}
    </span>
  );
};

const ExchangeRow = ({ item }: { item: ExchangeItem }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-md px-1 group cursor-pointer">
    <div className="shrink-0 w-8 h-8 rounded-full bg-violet-500/15 flex items-center justify-center">
      <ArrowLeftRight className="w-3.5 h-3.5 text-violet-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium leading-tight truncate">
        {item.sellAsset?.shortName ?? '?'} → {item.buyAsset?.shortName ?? '?'}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(item.createdAt)}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-sm font-semibold text-emerald-400 tabular-nums">
        +{fmt(item.buyAmount)} {item.buyAsset?.shortName}
      </p>
      <p className="text-xs text-muted-foreground tabular-nums">
        -{fmt(item.sellAmount)} {item.sellAsset?.shortName}
      </p>
    </div>
    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

const DepositRow = ({ item }: { item: DepositItem }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-md px-1 group cursor-pointer">
    <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 flex-wrap">
        <p className="text-sm font-medium leading-tight">
          {item.currency?.shortName ?? 'Deposit'}
        </p>
        <StatusBadge status={item.status} />
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(item.createdAt)}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-sm font-semibold text-emerald-400 tabular-nums">+{fmt(item.amount)}</p>
    </div>
    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

const WithdrawRow = ({ item }: { item: WithdrawItem }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-md px-1 group cursor-pointer">
    <div className="shrink-0 w-8 h-8 rounded-full bg-rose-500/15 flex items-center justify-center">
      <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 flex-wrap">
        <p className="text-sm font-medium leading-tight">
          {item.currency?.shortName ?? 'Withdraw'}
        </p>
        <StatusBadge status={item.withdrawStatus} />
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(item.createdAt)}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-sm font-semibold text-rose-400 tabular-nums">-{fmt(item.amount)}</p>
    </div>
    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
    <Clock className="w-7 h-7 opacity-30" />
    <p className="text-sm font-medium">No {label} yet</p>
    <p className="text-xs opacity-50">Your {label.toLowerCase()} will appear here</p>
  </div>
);

type TabKey = 'exchanges' | 'deposits' | 'withdrawals';

export default function TransactionHistory() {
  const [activeTab, setActiveTab] = useState<TabKey>('exchanges');
  const [loading, setLoading] = useState(false);
  const [exchanges, setExchanges] = useState<ExchangeItem[]>([]);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawItem[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        if (typeof window !== 'undefined') window.location.href = '/sign-in';
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const base = process.env.NEXT_PUBLIC_BACKEND_URL;
      try {
        const [dashRes, exchRes] = await Promise.all([
          axios.get(`${base}/user/dashboard`, { headers }),
          axios.get(`${base}/user/exchange/fetch`, { headers }),
        ]);
        const dash = dashRes.data.data;
        setDeposits((dash?.deposit ?? []).slice(0, 5));
        setWithdrawals((dash?.withdraw ?? []).slice(0, 5));
        setExchanges((exchRes.data.data ?? []).slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'exchanges', label: 'Exchanges', count: exchanges.length },
    { key: 'deposits', label: 'Deposits', count: deposits.length },
    { key: 'withdrawals', label: 'Withdrawals', count: withdrawals.length },
  ];

  return (
    <Card
      header={{
        content: <h2 className="text-base font-semibold">Transaction History</h2>,
        extra: (
          <Link
            href="/transactions"
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All
            <ExternalLink className="w-3 h-3" />
          </Link>
        ),
        bordered: true,
      }}
    // footer={{
    //   content: (
    //     <Link
    //       href="/transactions"
    //       className="flex items-center justify-center gap-1 w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
    //     >
    //       See full transaction history
    //       <ChevronRight className="w-3.5 h-3.5" />
    //     </Link>
    //   ),
    //   bordered: true,
    // }}
    >
      <div className="flex flex-col gap-3">

        {/* Tab strip */}
        <div className="flex border-b border-white/10">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`
                relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors duration-150
                ${activeTab === t.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'}
              `}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`
                  text-[9px] font-bold px-1 py-px rounded-full leading-none tabular-nums min-w-[16px] text-center
                  ${activeTab === t.key ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'}
                `}>
                  {t.count}
                </span>
              )}
              {activeTab === t.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[200px]">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'exchanges' &&
                (exchanges.length === 0 ? <EmptyState label="Exchanges" /> : exchanges.map((item) => <ExchangeRow key={item.id} item={item} />))}
              {activeTab === 'deposits' &&
                (deposits.length === 0 ? <EmptyState label="Deposits" /> : deposits.map((item) => <DepositRow key={item.id} item={item} />))}
              {activeTab === 'withdrawals' &&
                (withdrawals.length === 0 ? <EmptyState label="Withdrawals" /> : withdrawals.map((item) => <WithdrawRow key={item.id} item={item} />))}
            </>
          )}
        </div>

      </div>
    </Card>
  );
}