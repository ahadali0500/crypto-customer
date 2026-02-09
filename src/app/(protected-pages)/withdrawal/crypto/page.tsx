'use client';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import TabList from '@/components/ui/Tabs/TabList';
import Tabs from '@/components/ui/Tabs/Tabs';
import TabNav from '@/components/ui/Tabs/TabNav';
import TabContent from '@/components/ui/Tabs/TabContent';
import Dropdown from '@/components/ui/Dropdown/Dropdown';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import { Button, Dialog, Input, Spinner } from '@/components/ui';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import DataTable, { ColumnDef, OnSortParam } from '@/components/shared/DataTable';

// ==================== TYPES ====================
interface Currency {
    currencyId?: number;
    id?: string;
    shortName: string;
    fullName: string;
    symbol?: string;
    type?: string;
    availableBalance?: string;
    lockedBalance?: string;
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

interface UserDetails {
    withdrawFees?: string | null;
}

interface Withdrawal {
    id: number;
    withdrawType: 'Crypto';
    withdrawStatus: string;
    amount: string;
    fees: string;
    total: string;
    FeesType: string;
    balancetype: string;
    createdAt: string;
    currency: {
        shortName: string;
        fullName: string;
    };
    withdrawCrypto?: Array<{
        walletAddress: string;
        network: string;
    }>;
}

// ==================== COMPONENT ====================
const WithdrawalPage = () => {
    // ========== State ==========
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
    const [selectedFeeBundle, setSelectedFeeBundle] = useState<FeeBundle | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [feeBundleError, setFeeBundleError] = useState('');
    const [cryptoCurrencies, setCryptoCurrencies] = useState<Currency[]>([]);
    const [activeTab, setActiveTab] = useState('available');
    const [loading, setLoading] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [conversionLoading, setConversionLoading] = useState(false);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [feeBundles, setFeeBundles] = useState<FeeBundle[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: string; order: 'asc' | 'desc' | '' }>({
        key: '',
        order: '',
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const conversionSeqRef = useRef(0);

    // ========== Computed Values ==========
    const shouldShowBundleForWithdraw = useMemo(
        () => userDetails?.withdrawFees === null || userDetails?.withdrawFees === undefined,
        [userDetails]
    );

    const sortedFeeBundles = useMemo(() => {
        return feeBundles
            .filter((bundle) => bundle.category?.toLowerCase() === 'crypto')
            .sort((a, b) => (a.rangeMin || 0) - (b.rangeMin || 0));
    }, [feeBundles]);

    const feePercent = useMemo(() => {
        if (shouldShowBundleForWithdraw && selectedFeeBundle) {
            return parseFloat(selectedFeeBundle.value || '0');
        }
        if (!shouldShowBundleForWithdraw && userDetails?.withdrawFees) {
            return parseFloat(userDetails.withdrawFees || '0');
        }
        return 0;
    }, [shouldShowBundleForWithdraw, selectedFeeBundle, userDetails]);

    // Adjusted locked balance based on withdrawal status:
    // - Locked balance is only deducted on the client side
    //   when a locked-withdrawal status is Execute / Completed / Approved.
    const adjustedLockedBalance = useMemo(() => {
        if (!selectedCurrency) return 0;

        const rawLocked = parseFloat(selectedCurrency.lockedBalance || '0') || 0;

        // Only consider withdrawals for the currently selected currency
        const relatedLockedWithdrawals = withdrawals.filter((w) => {
            const sameCurrency = w.currency?.shortName === selectedCurrency.shortName;
            return sameCurrency && w.balancetype === 'Locked';
        });

        const executedStatuses = new Set(['Execute', 'Completed', 'Approved']);

        // Sum only amounts that should actually reduce locked balance
        const executedLockedTotal = relatedLockedWithdrawals.reduce((sum, w) => {
            if (!executedStatuses.has(w.withdrawStatus)) return sum;
            const amt = parseFloat(w.amount || '0') || 0;
            return sum + amt;
        }, 0);

        const adjusted = rawLocked - executedLockedTotal;
        return adjusted > 0 ? adjusted : 0;
    }, [selectedCurrency, withdrawals]);

    const balances = useMemo(() => {
        const available = parseFloat(selectedCurrency?.availableBalance || '0') || 0;
        const locked = adjustedLockedBalance;
        return { available, locked };
    }, [selectedCurrency, adjustedLockedBalance]);

const maxBalance = useMemo(() => {
    if (!selectedCurrency) return 0;

    return activeTab === 'locked'
        ? balances.locked
        : balances.available;
}, [balances, selectedCurrency, activeTab]);


    const maxAllowed = useMemo(() => {
    if (!selectedCurrency) return 0;

    const { available, locked } = balances;
    const feeRate = feePercent / 100;

    if (feePercent <= 0) {
        return activeTab === 'locked' ? locked : available;
    }

    if (activeTab === 'locked') {
        const maxByLocked = locked;
        const maxByFee = available / feeRate;
        return Math.max(0, Math.min(maxByLocked, maxByFee));
    }

    return Math.max(0, available / (1 + feeRate));
}, [balances, feePercent, selectedCurrency, activeTab]);


    const computed = useMemo(() => {
        const amount = parseFloat(withdrawAmount || '0') || 0;
        const fee = amount * (feePercent / 100);
        const net = amount - fee;

        const amountUSD = exchangeRate ? amount * exchangeRate : 0;
        const feeUSD = exchangeRate ? fee * exchangeRate : 0;
        const netUSD = exchangeRate ? net * exchangeRate : 0;

        return {
            amount,
            fee,
            net,
            amountUSD,
            feeUSD,
            netUSD,
        };
    }, [withdrawAmount, feePercent, exchangeRate]);

    const sortedWithdrawals = useMemo(() => {
        if (!sortConfig.key || sortConfig.order === '') {
            return withdrawals;
        }

        const direction = sortConfig.order === 'asc' ? 1 : -1;
        return [...withdrawals].sort((a, b) => {
            const valA = (a as any)[sortConfig.key];
            const valB = (b as any)[sortConfig.key];

            if (sortConfig.key === 'createdAt') {
                return (new Date(valA).getTime() - new Date(valB).getTime()) * direction;
            }

            if (['amount', 'fees', 'total'].includes(sortConfig.key)) {
                const numA = parseFloat(String(valA).replace(/[^0-9.-]+/g, ''));
                const numB = parseFloat(String(valB).replace(/[^0-9.-]+/g, ''));
                return (numA - numB) * direction;
            }

            if (typeof valA === 'number' && typeof valB === 'number') {
                return (valA - valB) * direction;
            }

            return String(valA).localeCompare(String(valB)) * direction;
        });
    }, [withdrawals, sortConfig]);

    const paginatedWithdrawals = useMemo(() => {
        const start = (pageIndex - 1) * pageSize;
        const end = start + pageSize;
        return sortedWithdrawals.slice(start, end);
    }, [sortedWithdrawals, pageIndex, pageSize]);

    // ========== API Calls ==========
    const fetchUserDetails = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/fetch`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserDetails(res.data.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    }, [token]);


    
    const fetchFeeBundles = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/fees/bundle/fetch?category=Crypto`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = res.data.data;
            setFeeBundles(Array.isArray(data) ? data : data ? [data] : []);
        } catch (error) {
            console.error('Error fetching fee bundles:', error);
            setFeeBundles([]);
        }
    }, [token]);

    const fetchCryptoCurrencies = useCallback(async () => {
        if (!token) return;
        try {
            const [userCurrenciesRes, allCurrenciesRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/user/fetch`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/fetch`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const userCurrencies = userCurrenciesRes.data.data || [];
            const allCurrencies = allCurrenciesRes.data.data || [];

            // Filter only crypto currencies
            const cryptoOnly = userCurrencies.filter((currency: Currency) => {
                const currencyInfo = allCurrencies.find(
                    (c: Currency) => c.shortName === currency.shortName || c.id === currency.id
                );
                return currencyInfo?.type?.toLowerCase() === 'crypto';
            });

            setCryptoCurrencies(cryptoOnly);

            // Auto-select first crypto currency
            if (cryptoOnly.length > 0 && !selectedCurrency) {
                setSelectedCurrency(cryptoOnly[0]);
            }
        } catch (error) {
            console.error('Error fetching currencies:', error);
        }
    }, [token, selectedCurrency]);

    const fetchWithdrawalHistory = useCallback(async () => {
        if (!token) return;
        setTableLoading(true);
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/withdraw/fetch?withdrawType=Crypto`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWithdrawals(res.data.data || []);
        } catch (error) {
            console.error('Error fetching withdrawal history:', error);
        } finally {
            setTableLoading(false);
        }
    }, [token]);

    const fetchConversionRate = useCallback(async (cryptoSymbol: string): Promise<number | null> => {
        try {
            const cleanSymbol = cryptoSymbol.trim().split(/[\s/-]/)[0].toLowerCase();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const res = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${cleanSymbol}&vs_currencies=usd`,
                { signal: controller.signal }
            );

            clearTimeout(timeoutId);
            const rate = res.data[cleanSymbol]?.usd;
            return typeof rate === 'number' && rate >= 0 ? rate : null;
        } catch (error) {
            if (axios.isCancel(error)) {
                console.error('Request timeout for conversion rate');
            } else {
                console.error('Error fetching conversion rate:', error);
            }
            return null;
        }
    }, []);

    // ========== Effects ==========
    useEffect(() => {
        if (token) {
            fetchUserDetails();
            fetchFeeBundles();
            fetchCryptoCurrencies();
            fetchWithdrawalHistory();
        }
    }, [token, fetchUserDetails, fetchFeeBundles, fetchCryptoCurrencies, fetchWithdrawalHistory]);

    const debouncedCalculateConversion = useCallback(
        debounce(async (seq: number, amount: string) => {
            if (!amount || parseFloat(amount) <= 0) {
                if (seq !== conversionSeqRef.current) return;
                setExchangeRate(null);
                setConversionLoading(false);
                return;
            }

            try {
                const cryptoSymbol = selectedCurrency?.shortName || selectedCurrency?.symbol || '';

                if (!cryptoSymbol) {
                    setExchangeRate(null);
                    setConversionLoading(false);
                    return;
                }

                const conversionRate = await fetchConversionRate(cryptoSymbol);

                if (seq !== conversionSeqRef.current) return;

                if (conversionRate !== null && conversionRate > 0 && isFinite(conversionRate)) {
                    setExchangeRate(conversionRate);
                } else {
                    setExchangeRate(null);
                }
            } catch (error) {
                if (seq !== conversionSeqRef.current) return;
                console.error('Conversion error:', error);
                setExchangeRate(null);
            } finally {
                if (seq !== conversionSeqRef.current) return;
                setConversionLoading(false);
            }
        }, 800),
        [selectedCurrency, fetchConversionRate]
    );

    useEffect(() => {
        return () => {
            debouncedCalculateConversion.cancel();
        };
    }, [debouncedCalculateConversion]);

    useEffect(() => {
        if (selectedCurrency && withdrawAmount && parseFloat(withdrawAmount) > 0) {
            setConversionLoading(true);
            const seq = (conversionSeqRef.current += 1);
            debouncedCalculateConversion(seq, withdrawAmount);
        } else {
            setExchangeRate(null);
        }
    }, [withdrawAmount, selectedCurrency, debouncedCalculateConversion]);

    // ========== Validation ==========
    const validateWithdrawAmount = useCallback(
        (amount: string): boolean => {
            if (!selectedCurrency || !amount) return false;

            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) return false;

            const { available, locked } = balances;
            const feeRate = feePercent / 100;
            const feeNeeded = feeRate > 0 ? numAmount * feeRate : 0;

            if (activeTab === 'locked') {
                if (numAmount > locked) return false;
                if (available < feeNeeded) return false;
                return true;
            }

            if (feeRate > 0) {
                return numAmount <= available / (1 + feeRate);
            }
            return numAmount <= available;
        },
        [selectedCurrency, balances, feePercent, activeTab]
    );

    const getFeeEligibility = useCallback(
        (amount: string, bundle: FeeBundle): boolean => {
            if (!amount) return true;
            if (selectedCurrency?.shortName !== 'BTC') return true;

            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) return false;

            const percent = parseFloat(bundle.value || '0');
            if (percent === 2) return numAmount <= 1;
            if (percent === 3.5) return numAmount <= 3;
            if (percent === 5) return numAmount <= 7;
            if (percent === 7) return true;

            return true;
        },
        [selectedCurrency]
    );

    const getDisabledReason = useCallback(
        (bundle: FeeBundle, amount: string): string => {
            if (!amount || selectedCurrency?.shortName !== 'BTC') return '';

            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) return '';

            const percent = parseFloat(bundle.value || '0');
            if (percent === 2 && numAmount > 1) return 'Not available above 1 BTC';
            if (percent === 3.5 && numAmount > 3) return 'Not available above 3 BTC';
            if (percent === 5 && numAmount > 7) return 'Not available above 7 BTC';

            return '';
        },
        [selectedCurrency]
    );

    // ========== Event Handlers ==========
    const handleCurrencySelect = useCallback(
        (key: string) => {
            const selected = cryptoCurrencies.find(
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
                setSelectedCurrency(selected);
                setWithdrawAmount('');
                setErrorMessage('');
                setFeeBundleError('');
                setSelectedFeeBundle(null);
                setExchangeRate(null);
            }
        },
        [cryptoCurrencies, debouncedCalculateConversion]
    );

    const handleFeeBundleSelect = useCallback(
        (bundle: FeeBundle) => {
            setFeeBundleError('');

            if (!withdrawAmount) {
                setFeeBundleError('Please enter withdraw amount first');
                setSelectedFeeBundle(bundle);
                return;
            }

            const isEligible = getFeeEligibility(withdrawAmount, bundle);
            if (!isEligible) {
                const reason = getDisabledReason(bundle, withdrawAmount);
                setFeeBundleError(reason);
            }

            setSelectedFeeBundle(bundle);
        },
        [withdrawAmount, getFeeEligibility, getDisabledReason]
    );

    const handleAmountChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setWithdrawAmount(value);
            setFeeBundleError('');
            setErrorMessage('');

            if (!value) {
                setExchangeRate(null);
                setSelectedFeeBundle(null);
                return;
            }

            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) {
                setErrorMessage('Please enter a valid amount');
                return;
            }

            if (!selectedCurrency) return;

            const { available, locked } = balances;
            const feeRate = feePercent / 100;
            const feeNeeded = feeRate > 0 ? numValue * feeRate : 0;

            if (activeTab === 'locked') {
                if (numValue > locked) {
                    setErrorMessage(
                        `Amount exceeds locked balance. Locked: ${locked.toFixed(6)} ${selectedCurrency.shortName}`
                    );
                    return;
                }
                if (available < feeNeeded) {
                    setErrorMessage(
                        `Insufficient available balance to deduct fee. Fee needed: ${feeNeeded.toFixed(6)} ${selectedCurrency.shortName}, Available: ${available.toFixed(6)}`
                    );
                    return;
                }
            } else {
                if (numValue - maxAllowed > 1e-9) {
                    setErrorMessage(
                        `Amount exceeds max allowed. Max: ${maxAllowed.toFixed(6)} ${selectedCurrency.shortName}`
                    );
                    return;
                }
            }

            if (selectedFeeBundle && !getFeeEligibility(value, selectedFeeBundle)) {
                const reason = getDisabledReason(selectedFeeBundle, value);
                setFeeBundleError(reason);
            }
        },
        [selectedCurrency, balances, feePercent, activeTab, maxAllowed, selectedFeeBundle, getFeeEligibility, getDisabledReason]
    );

    const handleWalletAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setWalletAddress(e.target.value);
        setErrorMessage('');
    }, []);

    const handleTabChange = useCallback(
        (value: string) => {
            setActiveTab(value);
            conversionSeqRef.current += 1;
            debouncedCalculateConversion.cancel();
            setConversionLoading(false);
            setWithdrawAmount('');
            setWalletAddress('');
            setErrorMessage('');
            setFeeBundleError('');
            setLoading(false);
            setSelectedFeeBundle(null);
            setExchangeRate(null);
        },
        [debouncedCalculateConversion]
    );

    const handleMaxClick = useCallback(() => {
        const floored = Math.floor(maxAllowed * 1e6) / 1e6;
        setWithdrawAmount(floored.toFixed(6));
    }, [maxAllowed]);

    const handleWithdrawSubmit = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();

            // Validation
            if (!selectedCurrency || !withdrawAmount || !walletAddress) {
                const message = 'Please fill in all required fields';
                setErrorMessage(message);
                toast.error(message);
                return;
            }

            const numAmount = parseFloat(withdrawAmount);
            if (isNaN(numAmount) || numAmount <= 0) {
                const message = 'Please enter a valid positive amount';
                setErrorMessage(message);
                toast.error(message);
                return;
            }

            if (shouldShowBundleForWithdraw && !selectedFeeBundle) {
                const message = 'Please select a fee option';
                setErrorMessage(message);
                toast.error(message);
                return;
            }

            if (shouldShowBundleForWithdraw && selectedFeeBundle) {
                const isEligible = getFeeEligibility(withdrawAmount, selectedFeeBundle);
                if (!isEligible) {
                    const message = 'Selected fee option is not eligible. Please choose another.';
                    setErrorMessage(message);
                    toast.error(message);
                    return;
                }
            }

            if (!validateWithdrawAmount(withdrawAmount)) {
                const message = 'Insufficient balance.';
                setErrorMessage(message);
                toast.error(message);
                return;
            }

            setLoading(true);
            setErrorMessage('');

            try {
                const formData = new FormData();
                formData.append('balancetype', activeTab === 'locked' ? 'Locked' : 'Available');
                formData.append(
                    'currencyId',
                    selectedCurrency.currencyId?.toString() || selectedCurrency.id || ''
                );
                formData.append('walletAddress', walletAddress);
                formData.append('amount', withdrawAmount);

                const netAmount = computed.net;
                if (exchangeRate && exchangeRate > 0) {
                    const netUSD = netAmount * exchangeRate;
                    formData.append('total', netUSD.toFixed(2));
                } else {
                    formData.append('total', netAmount.toFixed(6));
                }

                if (shouldShowBundleForWithdraw && selectedFeeBundle) {
                    formData.append('FeesType', 'Package');
                    formData.append('feesBundleId', selectedFeeBundle.id || '');
                    formData.append('fees', selectedFeeBundle.value);
                } else {
                    formData.append('FeesType', 'Default');
                    formData.append('fees', userDetails?.withdrawFees || '0');
                }

                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/withdraw/crytpo/create`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                if (response.data) {
                    setDialogOpen(true);
                    setWithdrawAmount('');
                    setWalletAddress('');
                    setErrorMessage('');
                    setFeeBundleError('');
                    setSelectedFeeBundle(null);
                    setExchangeRate(null);
                    await fetchCryptoCurrencies();
                    await fetchWithdrawalHistory();
                    toast.success('Withdrawal submitted successfully!');
                }
            } catch (error: any) {
                console.error('Withdrawal error:', error);
                const errorMsg = error.response?.data?.message || 'Withdrawal failed.';
                setErrorMessage(errorMsg);
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        },
        [
            selectedCurrency,
            withdrawAmount,
            walletAddress,
            shouldShowBundleForWithdraw,
            selectedFeeBundle,
            getFeeEligibility,
            validateWithdrawAmount,
            activeTab,
            computed.net,
            exchangeRate,
            userDetails,
            token,
            fetchCryptoCurrencies,
            fetchWithdrawalHistory,
        ]
    );

    const handleSort = useCallback((sort: OnSortParam) => {
        setSortConfig({ key: String(sort.key), order: sort.order });
        setPageIndex(1);
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setPageIndex(newPage);
    }, []);

    const handlePageSizeChange = useCallback((newSize: number) => {
        setPageSize(newSize);
        setPageIndex(1);
    }, []);

    // ========== Helper Functions ==========
    const getCurrencyKey = (currency: Currency): string => {
        return currency.currencyId?.toString() || currency.id || currency.shortName;
    };

    const exceedsMaxAllowed =
        selectedCurrency?.shortName === 'BTC' &&
        withdrawAmount &&
        parseFloat(withdrawAmount) - maxAllowed > 1e-9;

    const insufficientFeeBalance = activeTab === 'locked' && computed.fee > balances.available;

    // ========== Table Configuration ==========
    const statusColorMap: Record<string, string> = {
        Pending: 'bg-yellow-500 text-white',
        Completed: 'bg-green-500 text-white',
        Rejected: 'bg-red-500 text-white',
        Execute: 'bg-blue-500 text-white',
        Decline: 'bg-red-500 text-white',
    };

    const columns: ColumnDef<Withdrawal>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: ({ row }) => `#${row.original.id}`,
        },
        {
            header: 'Amount',
            accessorKey: 'amount',
            cell: ({ row }) => (
                <span className="text-nowrap">
                    {Number(row.original.amount).toFixed(6)} {row.original.currency?.shortName}
                </span>
            ),
        },
        {
            header: 'Fees',
            accessorKey: 'fees',
            cell: ({ row }) => (
                <span className="text-red-500 text-nowrap">
                    -{row.original.fees} {row.original.currency?.shortName}
                </span>
            ),
        },
        {
            header: 'Total',
            accessorKey: 'total',
            cell: ({ row }) => (
                <span className="font-semibold text-nowrap">
                    {row.original.total} {row.original.currency?.shortName}
                </span>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'withdrawStatus',
            cell: ({ row }) => (
                <span
                    className={`px-2 py-1 rounded text-xs ${
                        statusColorMap[row.original.withdrawStatus] || 'bg-gray-500'
                    }`}
                >
                    {row.original.withdrawStatus}
                </span>
            ),
        },

         {
    header: 'Balance Type',
    accessorKey: 'balancetype',
    cell: ({ row }) => {
        const balanceType = row.original.balancetype;

        const isAvailable = balanceType === 'Available';

        const bgColor = isAvailable ? 'bg-green-100' : 'bg-yellow-100';
        const textColor = isAvailable ? 'text-green-800' : 'text-yellow-800';
        const statusText = isAvailable ? 'Available' : 'Locked';

        return (
            <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}
            >
                {statusText}
            </span>
        );
    },
},
    ];

    // ========== Render ==========
    return (
        <>
            {/* Withdrawal Form */}
            <div className="p-5">
                <div className="flex items-center justify-center">
                    <div className="w-full md:w-[60%] p-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg">
                        <h1 className="text-xl font-semibold mb-4">Crypto Withdrawal</h1>

                        <Tabs defaultValue="available" onChange={handleTabChange}>
                            <TabList>
                                <TabNav value="locked">Locked</TabNav>
                                <TabNav value="available">Available</TabNav>
                            </TabList>

                            {['locked', 'available'].map((tab) => (
                                <TabContent key={tab} value={tab}>
                                    <form className="space-y-4">
                                        {/* Currency Selection */}
                                        <div className="w-full mb-4 mt-4">
                                            <label className="text-sm">Select Crypto Currency:</label>
                                            <Dropdown
                                                title={
                                                    selectedCurrency
                                                        ? `${selectedCurrency.shortName} - ${selectedCurrency.fullName}`
                                                        : 'Select Currency'
                                                }
                                                trigger="click"
                                                placement="bottom-start"
                                                toggleClassName="border border-gray-400 rounded-lg w-full"
                                                menuClass="w-full"
                                            >
                                                {cryptoCurrencies.map((currency) => (
                                                    <DropdownItem
                                                        key={getCurrencyKey(currency)}
                                                        className="text-center w-full"
                                                        eventKey={getCurrencyKey(currency)}
                                                        onSelect={handleCurrencySelect}
                                                    >
                                                        {currency.shortName} - {currency.fullName}
                                                    </DropdownItem>
                                                ))}
                                            </Dropdown>
                                        </div>

                                        {/* Balance Display */}
                                        {selectedCurrency && (
                                            <div className="text-sm text-primary dark:text-primary mb-4">
                                                {tab === 'available' ? 'Available' : 'Locked'} Balance:{' '}
                                                {(tab === 'locked' ? balances.locked : balances.available).toFixed(6)}{' '}
                                                {selectedCurrency.shortName}
                                            </div>
                                        )}

                                        {/* Wallet Address */}
                                        <div className="flex items-center gap-2 mb-4 bg-gray-200 dark:bg-gray-700 pl-3 rounded-lg">
                                            <span className="whitespace-nowrap text-sm">Wallet Address</span>
                                            <Input
                                                className="border border-gray-200 focus:ring-0 bg-gray-100 dark:bg-gray-800 rounded-lg"
                                                placeholder="Enter wallet address"
                                                value={walletAddress}
                                                onChange={handleWalletAddressChange}
                                            />
                                        </div>

                                        {/* Withdraw Amount */}
                                        <div className="flex items-center gap-2 mb-4 bg-gray-200 dark:bg-gray-700 pl-3 rounded-lg">
                                            <span className="whitespace-nowrap text-sm">Amount</span>
                                            <Input
                                                className="border border-gray-200 focus:ring-0 bg-gray-100 dark:bg-gray-800 rounded-lg"
                                                placeholder="0.000000"
                                                type="number"
                                                step="0.000001"
                                                min="0"
                                                value={withdrawAmount}
                                                onChange={handleAmountChange}
                                            />
                                        </div>

                                        {/* Fee Bundle Selection */}
                                        {shouldShowBundleForWithdraw && (
                                            <div className="w-full mb-4">
                                                <label className="text-sm mb-2 block">Fee Options:</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {sortedFeeBundles.map((bundle) => {
                                                        const isEligible = getFeeEligibility(withdrawAmount, bundle);
                                                        const isSelected = selectedFeeBundle?.id === bundle.id;
                                                        const disabledReason = !isEligible
                                                            ? getDisabledReason(bundle, withdrawAmount)
                                                            : '';

                                                        return (
                                                            <button
                                                                key={bundle.id}
                                                                type="button"
                                                                onClick={() => handleFeeBundleSelect(bundle)}
                                                                disabled={!isEligible && !!withdrawAmount}
                                                                className={`p-3 rounded-lg text-left text-sm transition-all border-2 ${
                                                                    isSelected
                                                                        ? isEligible
                                                                            ? 'bg-blue-500 text-white border-blue-600'
                                                                            : 'bg-red-500 text-white border-red-600'
                                                                        : !isEligible && withdrawAmount
                                                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-60'
                                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                                }`}
                                                            >
                                                                <div className="font-medium flex items-center justify-between">
                                                                    <span>
                                                                        {bundle.name} ({bundle.value}%)
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs mt-2 space-y-1">
                                                                    <div>
                                                                        {selectedCurrency?.shortName}:{' '}
                                                                        {(
                                                                            parseFloat(withdrawAmount || '0') *
                                                                            (parseFloat(bundle.value) / 100)
                                                                        ).toFixed(6)}
                                                                    </div>
                                                                    {exchangeRate && withdrawAmount && (
                                                                        <div>
                                                                            USD: $
                                                                            {(
                                                                                parseFloat(withdrawAmount || '0') *
                                                                                exchangeRate *
                                                                                (parseFloat(bundle.value) / 100)
                                                                            ).toFixed(2)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {disabledReason && (
                                                                    <div className="text-xs mt-2 font-medium">
                                                                        {disabledReason}
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Error Messages */}
                                        {errorMessage && (
                                            <div className="p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                                                <div className="text-sm text-red-700 dark:text-red-300 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-2" />
                                                    {errorMessage}
                                                </div>
                                            </div>
                                        )}

                                        {feeBundleError && (
                                            <div className="p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                                                <div className="text-sm text-red-700 dark:text-red-300 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-2" />
                                                    {feeBundleError}
                                                </div>
                                            </div>
                                        )}

                                        <hr className="text-primary bg-primary my-6" />

                                        {/* Summary Section */}
                                        <div className="space-y-2 mb-6">
                                            {/* Withdrawal Amount */}
                                            <div className="flex flex-row items-center justify-between gap-4">
                                                <div>Withdrawal Amount:</div>
                                                <div className="space-y-1 text-right">
                                                    <div>
                                                        {computed.amount.toFixed(6)} {selectedCurrency?.shortName}
                                                    </div>
                                                    {exchangeRate && withdrawAmount && (
                                                        <div className="text-sm text-gray-500">
                                                            ${computed.amountUSD.toFixed(2)} USD
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Fee Information */}
                                            <div className="flex flex-row items-center justify-between gap-4">
                                                <div>
                                                    <span>Fee ({feePercent}%):</span>
                                                    {activeTab === 'locked' && (
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            (from Available)
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <div>
                                                        -{computed.fee.toFixed(6)} {selectedCurrency?.shortName}
                                                    </div>
                                                    {exchangeRate && withdrawAmount && (
                                                        <div className="text-sm text-gray-500">
                                                            -${computed.feeUSD.toFixed(2)} USD
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {insufficientFeeBalance && (
                                                <div className="p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg mt-2">
                                                    <div className="text-sm text-red-700 dark:text-red-300 flex items-start">
                                                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                                        <span>
                                                            Insufficient available balance to deduct the fee ({computed.fee.toFixed(6)} {selectedCurrency?.shortName}). 
                                                            Please add funds to Available balance.
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Divider */}
                                            <div className="border-t border-gray-300 dark:border-gray-600 my-3"></div>

                                            {/* You Will Receive */}
                                            <div className="flex flex-row items-center justify-between gap-4 font-semibold bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                                <div>
                                                    <span>You Will Receive:</span>
                                                    {activeTab === 'locked' && (
                                                        <span className="text-xs text-green-700 dark:text-green-300 ml-2 font-normal">
                                                            (Full Amount)
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <div className="text-green-700 dark:text-green-300">
                                                        {activeTab === 'locked' 
                                                            ? computed.amount.toFixed(6) 
                                                            : computed.net.toFixed(6)} {selectedCurrency?.shortName}
                                                    </div>
                                                    {exchangeRate && withdrawAmount && (
                                                        <div className="text-sm text-gray-500">
                                                            ${activeTab === 'locked' 
                                                                ? computed.amountUSD.toFixed(2)
                                                                : computed.netUSD.toFixed(2)} USD
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        

                                           

                                            {/* Max Amount */}
                                            <div
                                                className="text-primary my-2 cursor-pointer hover:underline text-sm"
                                                onClick={handleMaxClick}
                                            >
                                                 Max balance: {maxBalance.toFixed(6)} {selectedCurrency?.shortName}
                                            </div>

                                            {exceedsMaxAllowed && (
                                                <div className="text-sm text-red-500">
                                                    Amount exceeds max allowed ({maxAllowed.toFixed(6)}{' '}
                                                    {selectedCurrency?.shortName})
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            variant="solid"
                                            className="rounded-lg w-full"
                                            size="sm"
                                            onClick={handleWithdrawSubmit}
                                            disabled={
                                                loading ||
                                                !selectedCurrency ||
                                                !withdrawAmount ||
                                                !walletAddress ||
                                                (shouldShowBundleForWithdraw && !selectedFeeBundle) ||
                                                !!errorMessage ||
                                                !!feeBundleError ||
                                                exceedsMaxAllowed ||
                                                insufficientFeeBalance
                                            }
                                        >
                                            {loading ? 'Processing...' : 'Submit Withdrawal'}
                                        </Button>
                                    </form>
                                </TabContent>
                            ))}
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Success Dialog */}
            <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="text-center">
                    <CheckCircle2 className="text-green-500 mx-auto mb-4" size={60} />
                    <h3 className="text-xl font-semibold">
                        Withdrawal request has been successfully submitted.
                    </h3>
                </div>
            </Dialog>

            {/* Withdrawal History Table */}
            <div className="p-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg m-5">
                <div className="text-xl mb-4 font-semibold">Withdrawal History</div>
                {tableLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner size={40} />
                    </div>
                ) : (
                    <DataTable
                        data={paginatedWithdrawals}
                        columns={columns}
                        loading={tableLoading}
                        pagingData={{ total: sortedWithdrawals.length, pageIndex, pageSize }}
                        onPaginationChange={handlePageChange}
                        onSelectChange={handlePageSizeChange}
                        onSort={handleSort}
                        noData={!tableLoading && withdrawals.length === 0}
                    />
                )}
            </div>
        </>
    );
};

export default WithdrawalPage;