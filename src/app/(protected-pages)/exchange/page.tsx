'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button, Dialog } from '@/components/ui';
import {
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  RefreshCw,
  Zap,
  Shield,
  TrendingUp,
  ChevronDown,
  ArrowLeft,
  Info,
  Loader2,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import ExchangeHistory from './History';
import { Card } from '@/components/ui/card';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Currency {
  currencyId?: number;
  id?: string;
  shortName: string;
  fullName: string;
  symbol?: string;
  type?: string;
  balance?: string;
  availableBalance?: string;
  lockedBalance?: string;
  icon?: string;
}
interface UserDetails {
  exchangeFees?: string | number | null;
}
interface FeeBundle {
  id?: string;
  category: string;
  description: string;
  value: string;
  name: string;
  rangeMin?: number | null;
  rangeMax?: number | null;
}
interface AdminSetting {
  exchangeFees?: string | number | null;
  withdrawFees?: string | number | null;
}

// ─── Currency Selector Dropdown ──────────────────────────────────────────────
const CurrencySelector = ({
  selected,
  options,
  onSelect,
  label,
}: {
  selected: Currency | null;
  options: Currency[];
  onSelect: (key: string) => void;
  label?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(
    (c) =>
      c.shortName.toLowerCase().includes(search.toLowerCase()) ||
      c.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const getCurrencyColor = (name: string) => {
    const colors: Record<string, string> = {
      BTC: '#F7931A', ETH: '#627EEA', USDT: '#26A17B', BNB: '#F3BA2F',
      AUD: '#00843D', USD: '#1C6B2A', EUR: '#003399', GBP: '#CF142B',
    };
    const upper = name?.toUpperCase();
    return colors[upper] || '#6366f1';
  };

  const getInitials = (name: string) => name?.slice(0, 3).toUpperCase() || '?';

  return (
    <div ref={ref} className="relative">
      {label && <p className="text-xs text-slate-600 dark:text-[#8B95A3] mb-1">{label}</p>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl 
                   bg-white text-slate-900 border border-slate-200 hover:bg-slate-50
                   dark:bg-[#1C2536] dark:text-white dark:border-[#2A3548] dark:hover:bg-[#232F44]
                   transition-all duration-200 min-w-[120px] group"
      >
        {selected ? (
          <>
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: getCurrencyColor(selected.shortName) }}
            >
              {getInitials(selected.shortName)}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white text-sm">{selected.shortName}</span>
          </>
        ) : (
          <span className="text-[#8B95A3] text-sm">Select</span>
        )}
        <ChevronDown
          size={14}
          className={`text-slate-500 dark:text-[#8B95A3] ml-auto transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 right-0 w-64 
                        bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-black/10
                        dark:bg-[#141D2B] dark:border-[#2A3548] dark:shadow-black/50 overflow-hidden">
          <div className="p-3 border-b border-slate-100 dark:border-[#2A3548]">
            <input
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm rounded-lg px-3 py-2 outline-none 
                         bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-[#6366f1]/50
                         dark:bg-[#1C2536] dark:text-white dark:placeholder-[#4B5563] dark:border-[#2A3548]"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-slate-500 dark:text-[#8B95A3] text-sm text-center py-4">No results</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.currencyId || c.id || c.fullName}
                  type="button"
                  onClick={() => {
                    onSelect(c.currencyId?.toString() || c.id || c.shortName);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 
                             hover:bg-slate-50 dark:hover:bg-[#1C2536]
                             transition-colors text-left"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: getCurrencyColor(c.shortName) }}
                  >
                    {getInitials(c.shortName)}
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium">{c.shortName}</p>
                    <p className="text-[#8B95A3] text-xs">{c.fullName}</p>
                  </div>
                  {selected?.shortName === c.shortName && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-[#6366f1]" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Page = () => {
  const [selectedSellCurrency, setSelectedSellCurrency] = useState<Currency | null>(null);
  const [selectedBuyCurrency, setSelectedBuyCurrency] = useState<Currency | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [crypto, setCrypto] = useState<Currency[]>([]);
  const [allCurrency, setAllCurrency] = useState<Currency[]>([]);
  const [sellAmount, setSellAmount] = useState<string>('');
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('available');
  const [loading, setLoading] = useState<boolean>(false);
  const [conversionLoading, setConversionLoading] = useState<boolean>(false);
  const conversionSeqRef = useRef(0);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const [adminSetting, setAdminSetting] = useState<AdminSetting | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [feeBundles, setFeeBundles] = useState<FeeBundle[]>([]);
  const [selectedFeeBundle, setSelectedFeeBundle] = useState<FeeBundle | null>(null);
  const [feeBundleError, setFeeBundleError] = useState('');

  // ─── API calls (unchanged) ──────────────────────────────────────────────
  const fetchAdminSetting = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/system/fetch/settings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const settingRow = Array.isArray(res.data?.data) ? res.data.data[0] : null;
      setAdminSetting(settingRow || null);
    } catch (err) {
      setAdminSetting(null);
    }
  };

  function getCurrencyType(symbol: any) {
    const data = allCurrency.filter((n) => n?.shortName == symbol);
    return data[0]?.type;
  }

  const fetchConversionRates = useCallback(
    async (fromSymbol: string, toSymbol: string): Promise<number | null> => {
      try {
        const fromType = getCurrencyType(fromSymbol);
        const toType = getCurrencyType(toSymbol);
        toSymbol = toSymbol.trim().split(/[\s/-]/)[0].toLowerCase();
        fromSymbol = fromSymbol.trim().split(/[\s/-]/)[0].toLowerCase();
        if (fromSymbol == toSymbol) return 1;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        let conversionRate: number | null = null;
        if (fromType == 'Crypto' && toType == 'Crypto') {
          const res = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${fromSymbol},${toSymbol}&vs_currencies=usd`,
            { signal: controller.signal }
          );
          const fromPriceUSD = res.data[fromSymbol]?.usd;
          const toPriceUSD = res.data[toSymbol]?.usd;
          if (typeof fromPriceUSD === 'number' && typeof toPriceUSD === 'number' && toPriceUSD > 0) {
            conversionRate = fromPriceUSD / toPriceUSD;
          }
        } else if (fromType == 'Crypto' && toType == 'Fiat') {
          const targetCurrency = toSymbol.trim().split(/[\s/-]/)[0].toLowerCase();
          const res = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${fromSymbol}&vs_currencies=${toSymbol}`,
            { signal: controller.signal }
          );
          const rate = res.data[fromSymbol]?.[targetCurrency];
          if (typeof rate === 'number' && rate >= 0) conversionRate = rate;
        } else if (fromType == 'Fiat' && toType == 'Crypto') {
          const res = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${toSymbol}&vs_currencies=${fromSymbol}`,
            { signal: controller.signal }
          );
          const cryptoPriceInFiat = res.data[toSymbol]?.[fromSymbol];
          if (typeof cryptoPriceInFiat === 'number' && cryptoPriceInFiat > 0)
            conversionRate = 1 / cryptoPriceInFiat;
        } else if (fromType == 'Fiat' && toType == 'Fiat') {
          const res = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${toSymbol}&vs_currencies=${fromSymbol}`,
            { signal: controller.signal }
          );
          const cryptoPriceInFiat = res.data[toSymbol]?.[fromSymbol];
          if (typeof cryptoPriceInFiat === 'number' && cryptoPriceInFiat > 0)
            conversionRate = 1 / cryptoPriceInFiat;
        }
        clearTimeout(timeoutId);
        return conversionRate;
      } catch (error) {
        return null;
      }
    },
    [allCurrency]
  );

  const fetchExchangeFeeBundles = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/fees/bundle/fetch?category=Exchange`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data.data;
      setFeeBundles(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err) {
      setFeeBundles([]);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/fetch`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserDetails(res.data.data);
    } catch (error) { }
  };

  const shouldShowBundleForExchange =
    userDetails?.exchangeFees === null || userDetails?.exchangeFees === undefined;

  const feePercent = React.useMemo(() => {
    if (!shouldShowBundleForExchange)
      return parseFloat(String(userDetails?.exchangeFees ?? '0')) || 0;
    if (selectedFeeBundle) return parseFloat(selectedFeeBundle.value || '0') || 0;
    return parseFloat(String(adminSetting?.exchangeFees ?? '0')) || 0;
  }, [shouldShowBundleForExchange, userDetails, selectedFeeBundle, adminSetting]);

  const fetchCrypto = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/user/fetch`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res1 = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/fetch`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCrypto(res.data.data || []);
      setAllCurrency(res1.data.data || []);
      if (res.data.data?.length > 0) setSelectedSellCurrency(res.data.data[0]);
      if (res1.data.data?.length > 0) setSelectedBuyCurrency(res1.data.data[0]);
    } catch (error) { }
  };

  useEffect(() => {
    if (token) {
      fetchUserDetails();
      fetchCrypto();
      fetchExchangeFeeBundles();
      fetchAdminSetting();
    }
  }, [token]);

  // ─── Handlers (unchanged logic) ────────────────────────────────────────
  const handleSellSelect = (key: string) => {
    const selected = crypto.find(
      (c) =>
        (c.currencyId && c.currencyId.toString() === key) ||
        (c.id && c.id === key) ||
        c.shortName === key ||
        c.fullName === key
    );
    if (selected) {
      conversionSeqRef.current += 1;
      debouncedCalculateConversion.cancel();
      setConversionLoading(false);
      setSelectedSellCurrency(selected);
      setSellAmount('');
      setBuyAmount('');
      setErrorMessage('');
    }
  };

  const handleBuySelect = (key: string) => {
    const selected = allCurrency.find(
      (c) =>
        (c.currencyId && c.currencyId.toString() === key) ||
        (c.id && c.id === key) ||
        c.shortName === key ||
        c.fullName === key
    );
    if (selected) {
      conversionSeqRef.current += 1;
      debouncedCalculateConversion.cancel();
      setConversionLoading(false);
      setSelectedBuyCurrency(selected);
      setSellAmount('');
      setBuyAmount('');
      setErrorMessage('');
    }
  };

  const validateSellAmount = (amount: string): boolean => {
    if (!selectedSellCurrency || !amount) return false;
    const sell = parseFloat(amount);
    if (!isFinite(sell) || sell <= 0) return false;
    const available = parseFloat(selectedSellCurrency.availableBalance || '0') || 0;
    const locked = parseFloat(selectedSellCurrency.lockedBalance || '0') || 0;
    const fee = (sell * feePercent) / 100;
    if (activeTab === 'locked') return sell <= locked && fee <= available;
    return sell + fee <= available;
  };

  const getSelectedTabBalance = (): number => {
    if (!selectedSellCurrency) return 0;
    const raw =
      activeTab === 'locked'
        ? selectedSellCurrency.lockedBalance || '0'
        : selectedSellCurrency.availableBalance || '0';
    const n = parseFloat(raw);
    return isNaN(n) ? 0 : n;
  };

  const debouncedCalculateConversion = useCallback(
    debounce(
      async (seq: number, amount: string, fromCurrency: Currency, toCurrency: Currency) => {
        if (!fromCurrency || !toCurrency || !amount || parseFloat(amount) <= 0) {
          if (seq !== conversionSeqRef.current) return;
          setBuyAmount('');
          setConversionLoading(false);
          return;
        }
        try {
          const fromKey = fromCurrency.shortName || fromCurrency.symbol || fromCurrency.fullName;
          const toKey = toCurrency.shortName || toCurrency.symbol || toCurrency.fullName;
          const conversionRate = await fetchConversionRates(fromKey, toKey);
          if (seq !== conversionSeqRef.current) return;
          if (conversionRate !== null && conversionRate > 0 && isFinite(conversionRate)) {
            const convertedAmount = parseFloat(amount) * conversionRate;
            setBuyAmount(convertedAmount.toFixed(8));
            setErrorMessage('');
          } else {
            setBuyAmount('');
            setErrorMessage('Unable to fetch conversion rate. Please try again.');
          }
        } catch (error) {
          if (seq !== conversionSeqRef.current) return;
          setBuyAmount('');
          setErrorMessage('Conversion failed. Please try again.');
        } finally {
          if (seq !== conversionSeqRef.current) return;
          setConversionLoading(false);
        }
      },
      800
    ),
    [fetchConversionRates]
  );

  useEffect(() => () => debouncedCalculateConversion.cancel(), [debouncedCalculateConversion]);

  const calculateConversion = async (amount: string) => {
    if (!selectedSellCurrency || !selectedBuyCurrency || !amount || parseFloat(amount) <= 0) {
      setBuyAmount('');
      return;
    }
    setConversionLoading(true);
    const seq = (conversionSeqRef.current += 1);
    debouncedCalculateConversion(seq, amount, selectedSellCurrency, selectedBuyCurrency);
  };

  const calculateFees = (amount: string): number => {
    const numAmount = parseFloat(amount) || 0;
    return (numAmount * feePercent) / 100;
  };

  const getMaxAllowableAmount = (): number => {
    if (!selectedSellCurrency) return 0;
    const available = parseFloat(selectedSellCurrency.availableBalance || '0') || 0;
    const locked = parseFloat(selectedSellCurrency.lockedBalance || '0') || 0;
    const r = feePercent / 100;
    if (available <= 0) return 0;
    if (feePercent <= 0) return activeTab === 'locked' ? locked : available;
    if (activeTab === 'locked') {
      const maxByLocked = locked;
      const maxByFee = available / r;
      return parseFloat(Math.max(0, Math.min(maxByLocked, maxByFee)).toFixed(8));
    }
    return parseFloat(Math.max(0, available / (1 + r)).toFixed(8));
  };

  const getMaxDisplayAmount = (): number => {
    if (!selectedSellCurrency) return 0;
    const available = parseFloat(selectedSellCurrency.availableBalance || '0') || 0;
    const locked = parseFloat(selectedSellCurrency.lockedBalance || '0') || 0;
    return activeTab === 'locked' ? locked : available;
  };

  const handleSellAmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSellAmount(value);
    setErrorMessage('');
    if (!value) { setBuyAmount(''); return; }
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setErrorMessage('Please enter a valid amount');
      setBuyAmount('');
      return;
    }
    if (!validateSellAmount(value)) {
      const maxAllowable = getMaxAllowableAmount();
      const available = parseFloat(selectedSellCurrency?.availableBalance || '0') || 0;
      const locked = parseFloat(selectedSellCurrency?.lockedBalance || '0') || 0;
      if (activeTab === 'locked') {
        setErrorMessage(
          `Insufficient balance. Locked: ${locked.toFixed(6)} ${selectedSellCurrency?.shortName}, Available for fee: ${available.toFixed(6)}. Max: ${maxAllowable.toFixed(6)} ${selectedSellCurrency?.shortName}`
        );
      } else {
        setErrorMessage(
          `Insufficient balance. Available: ${available.toFixed(6)} ${selectedSellCurrency?.shortName}. Max (after fee): ${maxAllowable.toFixed(6)} ${selectedSellCurrency?.shortName}`
        );
      }
      setBuyAmount('');
      return;
    }
    await calculateConversion(value);
  };

  const getReceiveAmount = (): number => {
    if (!sellAmount || !selectedSellCurrency || !selectedBuyCurrency) return 0;
    const amountNum = parseFloat(sellAmount) || 0;
    const fees = calculateFees(sellAmount);
    const netAmount = amountNum - fees;
    const conversionRate = parseFloat(buyAmount) / amountNum || 0;
    const received = netAmount * conversionRate;
    return isNaN(received) ? 0 : received;
  };

  const getExchangeRate = (): number => {
    if (!sellAmount || !buyAmount || parseFloat(sellAmount) <= 0) return 0;
    return parseFloat(buyAmount) / parseFloat(sellAmount);
  };

  const handleExchangeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedSellCurrency || !selectedBuyCurrency || !sellAmount || !buyAmount) {
      setErrorMessage('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return;
    }
    if (!validateSellAmount(sellAmount)) {
      const maxAllowable = getMaxAllowableAmount();
      const errorMsg = `Insufficient balance. Max: ${maxAllowable.toFixed(6)} ${selectedSellCurrency.shortName}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', activeTab === 'locked' ? 'Locked' : 'Available');
      const sellAssetId = selectedSellCurrency.currencyId?.toString() || selectedSellCurrency.id || '';
      const buyAssetId = selectedBuyCurrency.currencyId?.toString() || selectedBuyCurrency.id || '';
      formData.append('sellAssetId', sellAssetId);
      formData.append('buyAssetId', buyAssetId);
      formData.append('sellAmount', sellAmount);
      formData.append('buyAmount', buyAmount);
      formData.append('fees', `${feePercent}`);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/exchange`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      if (response.data) {
        setDialogOpen(true);
        setSellAmount('');
        setBuyAmount('');
        setErrorMessage('');
        await fetchCrypto();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Exchange failed. Please try again.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    conversionSeqRef.current += 1;
    debouncedCalculateConversion.cancel();
    setConversionLoading(false);
    setSellAmount('');
    setBuyAmount('');
    setErrorMessage('');
  };

  const isSubmitDisabled =
    loading ||
    conversionLoading ||
    !selectedSellCurrency ||
    !selectedBuyCurrency ||
    !sellAmount ||
    !buyAmount ||
    !validateSellAmount(sellAmount) ||
    !!errorMessage ||
    (shouldShowBundleForExchange && feeBundles.length > 0 && !selectedFeeBundle);

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-white">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4 max-w-[1200px] mx-auto">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">

          <button
            type="button"
            className="text-[#8B95A3] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </button>

          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
          >
            <ArrowUpDown size={18} className="text-white sm:w-5 sm:h-5" />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">
              Convert Crypto to Fiat
            </h1>
            <p className="text-[#8B95A3] text-xs sm:text-sm mt-1">
              Instantly exchange your cryptocurrency for traditional currencies
            </p>
          </div>

        </div>
      </div>

      <div className="px-6 max-w-[1200px] mx-auto">
        {/* ── KYC Banner ─────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border border-[#B45309]/40 bg-[#451A03]/30">
          <Info size={16} className="text-[#F59E0B] flex-shrink-0" />
          <p className="text-sm text-[#FCD34D]">
            Complete KYC verification to enable fiat conversions.{' '}
            <a href="#" className="underline font-medium text-[#FBBF24] hover:text-white transition-colors">
              Verify now
            </a>
          </p>
        </div>

        {/* ── Locked / Available Toggle ───────────────────────── */}
        <div className="flex items-center gap-1 mb-6 border border-[#2A3548] rounded-xl p-1 w-fit">
          {['available', 'locked'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${activeTab === tab
                  ? 'bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20'
                  : 'text-[#8B95A3]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Main Two-Column Layout ──────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* ── LEFT: Conversion Card ───────────────────────────── */}
          <Card className="w-full lg:flex-1 border border-slate-200 dark:border-[#1F2D40] rounded-2xl bg-white dark:bg-transparent">
            <div className="p-6">

              {/* You Send Block */}
              <div className="mb-1">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="text-sm font-medium text-slate-900 dark:text-white">You send</h6>
                  {selectedSellCurrency && (
                    <span className="text-xs text-slate-500 dark:text-[#8B95A3]">
                      Balance:{' '}
                      <span className="text-slate-700 dark:text-[#94A3B8]">
                        {getSelectedTabBalance().toFixed(6)} {selectedSellCurrency.shortName}
                      </span>
                    </span>
                  )}
                </div>
                <div className="flex items-center rounded-xl px-4 py-3 gap-3 border border-slate-200 bg-slate-50 focus-within:border-[#6366f1]/60 transition-colors dark:border-[#2A3548] dark:bg-[#0F172A]">
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.000001"
                    min="0"
                    value={sellAmount}
                    onChange={handleSellAmountChange}
                    onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()}
                    className="flex-1 bg-transparent text-xl font-semibold outline-none text-slate-900 placeholder-slate-400 min-w-0 dark:text-white dark:placeholder-[#374151]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const max = getMaxAllowableAmount();
                      if (max < 0.000001) { setErrorMessage('Insufficient balance'); return; }
                      setSellAmount(max.toFixed(8));
                      calculateConversion(max.toFixed(8));
                    }}
                    className="text-xs font-bold text-[#6366f1] hover:text-[#818CF8] transition-colors px-2 py-1 rounded-lg hover:bg-[#6366f1]/10 flex-shrink-0"
                  >
                    MAX
                  </button>
                  <div className="w-px h-6 bg-slate-200 dark:bg-[#2A3548] flex-shrink-0" />
                  <CurrencySelector
                    selected={selectedSellCurrency}
                    options={crypto}
                    onSelect={handleSellSelect}
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-[#450A0A]/50 border border-[#7F1D1D]/50 rounded-xl">
                  <AlertCircle size={15} className="text-[#F87171] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#FCA5A5] leading-relaxed">{errorMessage}</p>
                </div>
              )}

              {/* Swap Icon */}
              <div className="flex items-center justify-center my-4">
                <div className="w-10 h-10 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center hover:border-[#6366f1]/60 hover:bg-[#1E1B4B] transition-all cursor-pointer group shadow-lg">
                  <ArrowUpDown size={16} className="text-[#94A3B8] group-hover:text-[#818CF8] transition-colors" />
                </div>
              </div>

              {/* You Receive Block */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="text-sm font-medium text-slate-900 dark:text-[#CBD5E1]">You receive (est.)</h6>
                  {conversionLoading && (
                    <span className="flex items-center gap-1.5 text-xs text-[#6366f1]">
                      <Loader2 size={12} className="animate-spin" /> Calculating...
                    </span>
                  )}
                </div>
                <div className="flex items-center rounded-xl px-4 py-3 gap-3 border border-slate-200 bg-slate-50 dark:bg-[#0F172A] dark:border-[#2A3548]">
                  <span
                    className={`flex-1 text-xl font-semibold ${buyAmount ? 'text-emerald-500 dark:text-[#4ADE80]' : 'text-slate-400 dark:text-[#374151]'
                      }`}
                  >
                    {buyAmount ? parseFloat(buyAmount).toFixed(2) : '0.00'}
                  </span>
                  <CurrencySelector
                    selected={selectedBuyCurrency}
                    options={allCurrency}
                    onSelect={handleBuySelect}
                  />
                </div>
              </div>

              {/* Fee Bundle Selector */}
              {shouldShowBundleForExchange && feeBundles.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-[#CBD5E1] mb-2">
                    Fee Option <span className="text-red-400">*</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {feeBundles.map((bundle) => {
                      const isSelected = selectedFeeBundle?.id === bundle.id;
                      return (
                        <button
                          key={bundle.id}
                          type="button"
                          onClick={() => { setFeeBundleError(''); setSelectedFeeBundle(bundle); }}
                          className={`p-3 rounded-xl text-left text-sm transition-all border-2 ${isSelected
                              ? 'bg-[#6366f1]/20 border-[#6366f1] text-white'
                              : 'bg-[#0F172A] border-[#2A3548] text-[#94A3B8] hover:border-[#6366f1]/40'
                            }`}
                        >
                          <div className="font-semibold">{bundle.name} ({bundle.value}%)</div>
                          <div className="text-xs mt-0.5 opacity-70">{bundle.description}</div>
                        </button>
                      );
                    })}
                  </div>
                  {feeBundleError && <p className="mt-1.5 text-xs text-red-400">{feeBundleError}</p>}
                </div>
              )}

              {/* Convert Button */}
              <button
                type="button"
                onClick={handleExchangeClick}
                disabled={isSubmitDisabled}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${isSubmitDisabled
                    ? 'bg-[#1F2937] text-[#4B5563] cursor-not-allowed'
                    : 'text-white shadow-lg shadow-[#7C3AED]/20 hover:opacity-90 active:scale-[0.99]'
                  }`}
                style={
                  !isSubmitDisabled
                    ? { background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' }
                    : {}
                }
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Zap size={16} /> Convert Now
                  </>
                )}
              </button>
            </div>
          </Card>

          {/* ── RIGHT: Details + Trust Panels ──────────────────── */}
          <div className="w-full lg:w-[340px] flex flex-col gap-4">

            {/* Conversion Details Card */}
            <Card className=" border border-[#1F2D40] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#4ADE80]" />
                  <h3 className="font-semibold text-sm">Conversion Details</h3>
                </div>
                <button
                  type="button"
                  onClick={() => sellAmount && calculateConversion(sellAmount)}
                  className="text-[#8B95A3] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                >
                  <RefreshCw size={14} className={conversionLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Exchange Rate */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8B95A3]">Exchange Rate</span>
                  <span className="text-xs font-mono text-[#CBD5E1]">
                    1 {selectedSellCurrency?.shortName || '—'}{' '}
                    <span className="text-[#8B95A3]">=</span>{' '}
                    <span className="text-[#8B95A3] font-semibold">
                      {getExchangeRate() > 0 ? getExchangeRate().toFixed(4) : '0.00'}
                    </span>{' '}
                    {selectedBuyCurrency?.shortName || '—'}
                  </span>
                </div>

                {/* Fee */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8B95A3]">Fee ({feePercent}%)</span>
                  <span className="text-xs font-mono text-[#F87171]">
                    – {calculateFees(sellAmount).toFixed(4)} {selectedSellCurrency?.shortName || '—'}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-[#1F2D40] pt-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold">You will receive</h5>
                    <span className="text-sm font-bold text-[#4ADE80] font-mono">
                      {getReceiveAmount().toFixed(4)}{' '}
                      <span className="text-[#86EFAC]">{selectedBuyCurrency?.shortName || '—'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Fixed fee badge */}
              {!shouldShowBundleForExchange && (
                <div className="mt-4 px-3 py-2 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-xl">
                  <p className="text-xs text-[#A5B4FC] text-center">
                    Fixed exchange fee: <span className="font-semibold">{feePercent}%</span>
                  </p>
                </div>
              )}
            </Card>

            {/* Why Convert With Us Card */}
            <Card className="border border-[#1F2D40] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-[#4ADE80]/10 flex items-center justify-center">
                  <span className="text-[#4ADE80] text-xs">$</span>
                </div>
                <h3 className="font-semibold  text-sm">Why Convert with Us?</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: <Zap size={14} className="text-[#4ADE80]" />,
                    title: 'Instant Transactions',
                    desc: 'Your funds are converted and available in seconds.',
                  },
                  {
                    icon: <Shield size={14} className="text-[#4ADE80]" />,
                    title: 'Transparent Low Fees',
                    desc: `A competitive ${feePercent > 0 ? feePercent : '0.5'}% fee with no hidden charges.`,
                  },
                  {
                    icon: <TrendingUp size={14} className="text-[#4ADE80]" />,
                    title: 'Live Market Rates',
                    desc: 'We use up-to-the-minute rates for maximum fairness.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <h6 className="text-sm font-semibold">{item.title}</h6>
                      <p className="text-xs text-[#8B95A3] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* ── Exchange History ──────────────────────────────── */}
        <div className="mt-8 mb-10">
          <ExchangeHistory />
        </div>
      </div>

      {/* ── Success Dialog ─────────────────────────────────── */}
      <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)}>
        <div className="text-center p-4">
          <div className="w-16 h-16 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} className="text-[#4ADE80]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Conversion Successful!</h3>
          <p className="text-[#8B95A3] text-sm">Your exchange transaction has been completed.</p>
        </div>
      </Dialog>
    </div>
  );
};

export default Page;