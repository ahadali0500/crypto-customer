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

interface FeeBundle {
    id?: string;
    category: string;
    description: string;
    value: string;
    name: string;
    rangeMin?: number | null;
    rangeMax?: number | null;
    descrption?: string;
}

interface UserDetails {
    withdrawFees?: string | null;
}

type Withdrawal = {
    id: number;
    withdrawType: 'Bank' | 'Crypto';
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
    withdrawBank?: Array<{
        country: string;
        bankName: string;
        accountNumber: string;
    }>;
    withdrawCrypto?: Array<{
        walletAddress: string;
        network: string;
    }>;
};

const WithdrawalPage = () => {
    const [selectedWithdrawCurrency, setSelectedWithdrawCurrency] = useState<Currency | null>(null);
    const [selectedFeeBundle, setSelectedFeeBundle] = useState<FeeBundle | null>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [feeBundleError, setFeeBundleError] = useState<string>('');
    const [crypto, setCrypto] = useState<Currency[]>([]);
    const [allCurrency, setAllCurrency] = useState<Currency[]>([]);
    const [activeTab, setActiveTab] = useState<string>('available');
    const [loading, setLoading] = useState<boolean>(false);
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [conversionLoading, setConversionLoading] = useState<boolean>(false);

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [bundleDetails, setBundleDetails] = useState<FeeBundle[]>([]);
    const [symbolToIdMap, setSymbolToIdMap] = useState<Record<string, string>>({});
    const conversionSeqRef = useRef(0);

    const shouldShowBundleForWithdraw = userDetails?.withdrawFees === null || userDetails?.withdrawFees === undefined;

    const cryptoBundles = useMemo(() => {
        return (bundleDetails || [])
            .filter((bundle) => (bundle.category || '').toLowerCase() === 'crypto')
            .sort((a, b) => (a.rangeMin || 0) - (b.rangeMin || 0));
    }, [bundleDetails]);

    const feePercent = useMemo(() => {
        if (shouldShowBundleForWithdraw && selectedFeeBundle)
            return parseFloat(selectedFeeBundle.value || '0');
        if (!shouldShowBundleForWithdraw && userDetails?.withdrawFees)
            return parseFloat(userDetails.withdrawFees || '0');
        return 0;
    }, [shouldShowBundleForWithdraw, selectedFeeBundle, userDetails]);

    // Calculate all amounts based on exchange rate
    const computed = useMemo(() => {
        const amountInSelectedCurrency = parseFloat(withdrawAmount || '0') || 0;
        const feeInSelectedCurrency = amountInSelectedCurrency * (feePercent / 100);
        const netInSelectedCurrency = amountInSelectedCurrency - feeInSelectedCurrency;

        const amountInUSD = exchangeRate ? amountInSelectedCurrency * exchangeRate : 0;
        const feeInUSD = exchangeRate ? feeInSelectedCurrency * exchangeRate : 0;
        const netInUSD = exchangeRate ? netInSelectedCurrency * exchangeRate : 0;

        return {
            // Selected currency amounts
            amountInSelectedCurrency,
            feeInSelectedCurrency,
            netInSelectedCurrency,
            // USD amounts
            amountInUSD,
            feeInUSD,
            netInUSD,
            // Rate
            rate: exchangeRate,
        };
    }, [withdrawAmount, feePercent, exchangeRate]);

    const balances = useMemo(() => {
        const available = parseFloat(selectedWithdrawCurrency?.availableBalance || '0') || 0;
        const locked = parseFloat(selectedWithdrawCurrency?.lockedBalance || '0') || 0;
        return { available, locked };
    }, [selectedWithdrawCurrency]);

    const maxAllowed = useMemo(() => {
        if (!selectedWithdrawCurrency) return 0;
        const available = balances.available;
        const locked = balances.locked;
        if (feePercent <= 0) {
            return activeTab === 'locked' ? locked : available;
        }
        const feeRate = feePercent / 100;
        if (activeTab === 'locked') {
            const maxByLocked = locked;
            const maxByFee = available / feeRate;
            return Math.max(0, Math.min(maxByLocked, maxByFee));
        }
        return Math.max(0, available / (1 + feeRate));
    }, [balances, feePercent, selectedWithdrawCurrency, activeTab]);

    // Fetch currency symbol to CoinGecko ID mapping
    const fetchAllCurrencies = useCallback(async () => {
        try {
            const cryptoListRes = await axios.get('https://api.coingecko.com/api/v3/coins/list');
            const map: Record<string, string> = {};
            cryptoListRes.data.forEach((coin: any) => {
                map[coin.symbol.toUpperCase()] = coin.id;
            });
            setSymbolToIdMap(map);
        } catch (error) {
            console.error('Error fetching currencies:', error);
        }
    }, []);

    useEffect(() => {
        fetchAllCurrencies();
    }, [fetchAllCurrencies]);

    const getCoinGeckoId = useCallback(
        (symbol: string): string | null => {
            const cleaned = symbol.trim().split(/[\s/-]/)[0].toUpperCase();
            const fromDynamic = typeof symbolToIdMap === 'object' && symbolToIdMap[cleaned];
            return fromDynamic || null;
        },
        [symbolToIdMap]
    );

    const getCurrencyType = useCallback(
        (symbol: string): string | null => {
            const data = allCurrency.filter((n) => n?.shortName === symbol);
            return data[0]?.type || null;
        },
        [allCurrency]
    );

    // Fetch conversion rate - same logic as reference component
    const fetchConversionRate = useCallback(
        async (fromSymbol: string, toSymbol: string): Promise<number | null> => {
            try {
                const fromType = getCurrencyType(fromSymbol);
                const toType = getCurrencyType(toSymbol);

                const cleanFromSymbol = fromSymbol.trim().split(/[\s/-]/)[0].toLowerCase();
                const cleanToSymbol = toSymbol.trim().split(/[\s/-]/)[0].toLowerCase();

                if (cleanFromSymbol === cleanToSymbol) {
                    return 1;
                }

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                let conversionRate: number | null = null;

                // Determine actual types with fallback for common currencies
                const actualFromType = fromType || 'Crypto';
                const actualToType = toType || 'Fiat'; // USD is Fiat

                if (actualFromType === 'Crypto' && actualToType === 'Crypto') {
                    // Crypto to Crypto: Get both prices in USD, then divide
                    const res = await axios.get(
                        `https://api.coingecko.com/api/v3/simple/price?ids=${cleanFromSymbol},${cleanToSymbol}&vs_currencies=usd`,
                        { signal: controller.signal }
                    );
                    const fromPriceUSD = res.data[cleanFromSymbol]?.usd;
                    const toPriceUSD = res.data[cleanToSymbol]?.usd;
                    if (
                        typeof fromPriceUSD === 'number' &&
                        typeof toPriceUSD === 'number' &&
                        toPriceUSD > 0
                    ) {
                        conversionRate = fromPriceUSD / toPriceUSD;
                    }
                } else if (actualFromType === 'Crypto' && actualToType === 'Fiat') {
                    // Crypto to Fiat: Direct conversion (e.g., BTC to USD)
                    const res = await axios.get(
                        `https://api.coingecko.com/api/v3/simple/price?ids=${cleanFromSymbol}&vs_currencies=${cleanToSymbol}`,
                        { signal: controller.signal }
                    );
                    const rate = res.data[cleanFromSymbol]?.[cleanToSymbol];
                    if (typeof rate === 'number' && rate >= 0) {
                        conversionRate = rate;
                    }
                } else if (actualFromType === 'Fiat' && actualToType === 'Crypto') {
                    // Fiat to Crypto: Inverse of crypto price in fiat
                    const res = await axios.get(
                        `https://api.coingecko.com/api/v3/simple/price?ids=${cleanToSymbol}&vs_currencies=${cleanFromSymbol}`,
                        { signal: controller.signal }
                    );
                    const cryptoPriceInFiat = res.data[cleanToSymbol]?.[cleanFromSymbol];
                    if (typeof cryptoPriceInFiat === 'number' && cryptoPriceInFiat > 0) {
                        conversionRate = 1 / cryptoPriceInFiat;
                    }
                }
                else if (actualFromType === 'Fiat' && actualToType === 'Fiat') {
                    const res = await axios.get(
                        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${cleanFromSymbol},${cleanToSymbol}`,
                        { signal: controller.signal }
                    );
                    const btcInFrom = res.data.bitcoin?.[cleanFromSymbol]; // BTC price in EUR
                    const btcInTo = res.data.bitcoin?.[cleanToSymbol];
                    if (typeof btcInFrom === 'number' && typeof btcInTo === 'number' && btcInFrom > 0) {
                        // 1 EUR = (BTC price in USD) / (BTC price in EUR)
                        conversionRate = btcInTo / btcInFrom;
                    }
                }

                clearTimeout(timeoutId);
                return conversionRate;
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.error('Request timeout for conversion rate');
                } else {
                    console.error('Error fetching conversion rate:', error);
                }
                return null;
            }
        },
        [getCurrencyType]
    );

    // Debounced conversion calculation
    const debouncedCalculateConversion = useCallback(
        debounce(async (seq: number, amount: string) => {
            if (!amount || parseFloat(amount) <= 0) {
                if (seq !== conversionSeqRef.current) return;
                setExchangeRate(null);
                setConversionLoading(false);
                return;
            }

            try {
                const fromSymbol = selectedWithdrawCurrency?.shortName || selectedWithdrawCurrency?.symbol || '';

                if (!fromSymbol) {
                    console.warn('No fromSymbol available');
                    setExchangeRate(null);
                    setConversionLoading(false);
                    return;
                }

                console.log('Fetching conversion rate for:', fromSymbol, 'to USD');

                // Get conversion rate to USD
                const conversionRate = await fetchConversionRate(fromSymbol, 'USD');

                if (seq !== conversionSeqRef.current) return;

                console.log('Conversion rate received:', conversionRate);

                if (conversionRate !== null && conversionRate > 0 && isFinite(conversionRate)) {
                    setExchangeRate(conversionRate);
                } else {
                    console.warn('Invalid conversion rate:', conversionRate);
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
        [selectedWithdrawCurrency, fetchConversionRate]
    );

    useEffect(() => {
        return () => {
            debouncedCalculateConversion.cancel();
        };
    }, [debouncedCalculateConversion]);

    const calculateConversion = useCallback(
        async (amount: string) => {
            if (!selectedWithdrawCurrency || !amount || parseFloat(amount) <= 0) {
                setExchangeRate(null);
                return;
            }
            setConversionLoading(true);
            const seq = (conversionSeqRef.current += 1);
            debouncedCalculateConversion(seq, amount);
        },
        [selectedWithdrawCurrency, debouncedCalculateConversion]
    );

    useEffect(() => {
        calculateConversion(withdrawAmount);
    }, [withdrawAmount, selectedWithdrawCurrency, calculateConversion]);

    const fetchUserDetails = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/fetch`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserDetails(res.data.data);
        } catch (error) {
            console.log('Error fetching user details:', error);
        }
    };

    const fetchBundleDetails = async () => {
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/fees/bundle/fetch?category=Crypto`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const bundleData = res.data.data;
            if (Array.isArray(bundleData)) {
                setBundleDetails(bundleData);
            } else if (bundleData) {
                setBundleDetails([bundleData]);
            } else {
                setBundleDetails([]);
            }
        } catch (error) {
            console.log('Error fetching bundle details:', error);
            setBundleDetails([]);
        }
    };

    const fetchCurrencies = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/user/fetch`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const res1 = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/fetch`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setCrypto(res.data.data || []);
            setAllCurrency(res1.data.data || []);

            if (res.data.data && res.data.data.length > 0) {
                setSelectedWithdrawCurrency(res.data.data[0]);
            }
        } catch (error) {
            console.log('Error fetching currencies:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserDetails();
            fetchBundleDetails();
            fetchCurrencies();
        }
    }, [token]);

    const getCurrencyKey = (currency: Currency): string => {
        return currency.currencyId?.toString() || currency.id || currency.shortName;
    };

    const handleWithdrawCurrencySelect = (key: string) => {
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
            setSelectedWithdrawCurrency(selected);
            setWithdrawAmount('');
            setErrorMessage('');
            setFeeBundleError('');
            setSelectedFeeBundle(null);
            setExchangeRate(null);
        }
    };

    const validateWithdrawAmount = (amount: string): boolean => {
        if (!selectedWithdrawCurrency || !amount) return false;
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return false;
        const availableBalance = parseFloat(
            activeTab === 'locked'
                ? selectedWithdrawCurrency.lockedBalance || '0'
                : selectedWithdrawCurrency.availableBalance || '0'
        );
        return numAmount <= availableBalance;
    };

    const getAvailableBalance = (): number => {
        if (!selectedWithdrawCurrency) return 0;
        const balance =
            activeTab === 'locked'
                ? selectedWithdrawCurrency.lockedBalance || '0'
                : selectedWithdrawCurrency.availableBalance || '0';
        return parseFloat(balance.toString());
    };

    const getFeeEligibility = useCallback(
        (amount: string, bundle: FeeBundle): boolean => {
            if (!amount) return true;
            if (selectedWithdrawCurrency?.shortName !== 'BTC') return true;
            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) return false;
            const percent = parseFloat(bundle.value || '0');
            if (percent === 2) return numAmount <= 1;
            if (percent === 3.5) return numAmount <= 3;
            if (percent === 5) return numAmount <= 7;
            if (percent === 7) return true;
            return true;
        },
        [selectedWithdrawCurrency]
    );

    const isBundleEnabled = useCallback(
        (bundle: FeeBundle, amount: string) => getFeeEligibility(amount, bundle),
        [getFeeEligibility]
    );

    const getDisabledReason = useCallback(
        (bundle: FeeBundle, amount: string): string => {
            if (!amount) return '';
            if (selectedWithdrawCurrency?.shortName !== 'BTC') return '';
            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) return '';
            const percent = parseFloat(bundle.value || '0');
            if (percent === 2 && numAmount > 1) return 'Not available above 1 BTC';
            if (percent === 3.5 && numAmount > 3) return 'Not available above 3 BTC';
            if (percent === 5 && numAmount > 7) return 'Not available above 7 BTC';
            return '';
        },
        [selectedWithdrawCurrency]
    );

    const handleFeeBundleSelect = (bundle: FeeBundle) => {
        setFeeBundleError('');
        if (!withdrawAmount) {
            setFeeBundleError('Please enter withdraw amount first');
            setSelectedFeeBundle(bundle);
            return;
        }
        const isEligible = isBundleEnabled(bundle, withdrawAmount);
        if (!isEligible) {
            const reason = getDisabledReason(bundle, withdrawAmount);
            setFeeBundleError(reason);
            setSelectedFeeBundle(bundle);
            return;
        }
        setSelectedFeeBundle(bundle);
    };

    const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        if (!validateWithdrawAmount(value)) {
            const availableBalance = getAvailableBalance();
            setErrorMessage(
                `Amount exceeds available balance. Available: ${availableBalance.toFixed(6)} ${selectedWithdrawCurrency?.shortName}`
            );
            return;
        }

        if (selectedFeeBundle && !isBundleEnabled(selectedFeeBundle, value)) {
            const reason = getDisabledReason(selectedFeeBundle, value);
            setFeeBundleError(reason);
        }
    };

    const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWalletAddress(e.target.value);
        setErrorMessage('');
    };

    const handleWithdrawClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!selectedWithdrawCurrency || !withdrawAmount || !walletAddress) {
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
            const isEligible = isBundleEnabled(selectedFeeBundle, withdrawAmount);
            if (!isEligible) {
                const message = 'Selected fee option is not eligible. Please choose another.';
                setErrorMessage(message);
                toast.error(message);
                return;
            }
        }

        if (!validateWithdrawAmount(withdrawAmount)) {
            const message = `Insufficient balance.`;
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
                selectedWithdrawCurrency.currencyId?.toString() || selectedWithdrawCurrency.id || ''
            );
            formData.append('walletAddress', walletAddress);
            formData.append('amount', withdrawAmount);

            const feeAmount = computed.feeInSelectedCurrency;
            const netAmount = computed.netInSelectedCurrency;

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
                await fetchCurrencies();
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
    };

    const handleTabChange = (value: string) => {
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
    };

    const floorTo = (num: number, decimals: number) => {
        const factor = Math.pow(10, decimals);
        return Math.floor(num * factor) / factor;
    };

    const handleMaxWithdrawAmountClick = () => {
        setWithdrawAmount(floorTo(maxAllowed, 6).toFixed(6));
    };

    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        order: 'asc' | 'desc' | '';
    }>({ key: '', order: '' });

    const fetchWithdrawalHistory = async () => {
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
    };

    const sortedData = useMemo(() => {
        if (!sortConfig.key || sortConfig.order === '') {
            return withdrawals;
        }
        const direction = sortConfig.order === 'asc' ? 1 : -1;
        return [...withdrawals].sort((a, b) => {
            const A = (a as any)[sortConfig.key];
            const B = (b as any)[sortConfig.key];

            if (sortConfig.key === 'createdAt') {
                return (new Date(A).getTime() - new Date(B).getTime()) * direction;
            }

            if (['amount', 'fees', 'total'].includes(sortConfig.key)) {
                const numA = parseFloat(String(A).replace(/[^0-9.-]+/g, ''));
                const numB = parseFloat(String(B).replace(/[^0-9.-]+/g, ''));
                return (numA - numB) * direction;
            }

            if (typeof A === 'number' && typeof B === 'number') {
                return (A - B) * direction;
            }

            return String(A).localeCompare(String(B)) * direction;
        });
    }, [withdrawals, sortConfig]);

    const currentPageData = useMemo(() => {
        const start = (pageIndex - 1) * pageSize;
        const end = start + pageSize;
        return sortedData.slice(start, end);
    }, [sortedData, pageIndex, pageSize]);

    const totalCount = sortedData.length;

    const handleSort = (sort: OnSortParam) => {
        setSortConfig({ key: String(sort.key), order: sort.order });
        setPageIndex(1);
    };

    const handlePageChange = (newPage: number) => {
        setPageIndex(newPage);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPageIndex(1);
    };

    useEffect(() => {
        fetchWithdrawalHistory();
    }, []);

    const statusColorMap: Record<string, string> = {
        Pending: 'bg-yellow-500 text-white',
        Completed: 'bg-green-500 text-white',
        Rejected: 'bg-red-500 text-white',
        Execute: 'bg-blue-500 text-white',
        Decline: 'bg-red-500 text-white',
    };

    const typeColorMap: Record<string, string> = {
        Bank: 'bg-blue-500 text-white',
        Crypto: 'bg-purple-500 text-white',
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
            header: 'Type',
            accessorKey: 'withdrawType',
            cell: ({ row }) => {
                const type = row.original.withdrawType || 'Unknown';
                return (
                    <span className={`px-2 py-1 rounded text-xs ${typeColorMap[type] || 'bg-gray-500 text-white'}`}>
                        {type}
                    </span>
                );
            },
        },
        {
            header: 'Status',
            accessorKey: 'withdrawStatus',
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded text-xs ${statusColorMap[row.original.withdrawStatus] || 'bg-gray-500'}`}>
                    {row.original.withdrawStatus}
                </span>
            ),
        },
    ];

    const exceedsMaxAllowed =
        selectedWithdrawCurrency?.shortName === 'BTC' &&
        withdrawAmount &&
        parseFloat(withdrawAmount) - maxAllowed > 1e-9;

    return (
        <>
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
                                                    selectedWithdrawCurrency
                                                        ? `${selectedWithdrawCurrency.shortName} - ${selectedWithdrawCurrency.fullName}`
                                                        : 'Select Currency'
                                                }
                                                trigger="click"
                                                placement="bottom-start"
                                                toggleClassName="border border-gray-400 rounded-lg w-full"
                                                menuClass="w-full"
                                            >
                                                {crypto.map((currency) => (
                                                    <DropdownItem
                                                        key={getCurrencyKey(currency)}
                                                        className="text-center w-full"
                                                        eventKey={getCurrencyKey(currency)}
                                                        onSelect={handleWithdrawCurrencySelect}
                                                    >
                                                        {currency.shortName} - {currency.fullName}
                                                    </DropdownItem>
                                                ))}
                                            </Dropdown>
                                        </div>

                                        {/* Balance Display */}
                                        {selectedWithdrawCurrency && (
                                            <div className="text-sm text-primary dark:text-primary mb-4">
                                                {tab === 'available' ? 'Available' : 'Locked'} Balance:{' '}
                                                {parseFloat(
                                                    tab === 'locked'
                                                        ? selectedWithdrawCurrency.lockedBalance || '0'
                                                        : selectedWithdrawCurrency.availableBalance || '0'
                                                ).toFixed(6)}{' '}
                                                {selectedWithdrawCurrency.shortName}
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
                                                onChange={handleWithdrawAmountChange}
                                            />
                                        </div>

                                        {/* Fee Bundle Selection */}
                                        {shouldShowBundleForWithdraw && (
                                            <div className="w-full mb-4">
                                                <label className="text-sm mb-2 block">Fee Options:</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {cryptoBundles.map((bundle) => {
                                                        const isEligible = isBundleEnabled(bundle, withdrawAmount);
                                                        const isSelected = selectedFeeBundle?.id === bundle.id;
                                                        const disabledReason = !isEligible
                                                            ? getDisabledReason(bundle, withdrawAmount)
                                                            : '';

                                                        return (
                                                            <button
                                                                key={bundle.id}
                                                                type="button"
                                                                onClick={() => handleFeeBundleSelect(bundle)}
                                                                disabled={!isEligible && withdrawAmount}
                                                                className={`p-3 rounded-lg text-left text-sm transition-all border-2 ${isSelected
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
                                                                {/* DUAL CURRENCY FEE DISPLAY */}
                                                                <div className="text-xs mt-2 space-y-1">
                                                                    <div>
                                                                        {selectedWithdrawCurrency?.shortName}: {(parseFloat(withdrawAmount || '0') * (parseFloat(bundle.value) / 100)).toFixed(6)}
                                                                    </div>
                                                                    {exchangeRate && withdrawAmount && (
                                                                        <div>
                                                                            USD: ${(parseFloat(withdrawAmount || '0') * exchangeRate * (parseFloat(bundle.value) / 100)).toFixed(2)}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {disabledReason && (
                                                                    <div className="text-xs mt-2 font-medium">{disabledReason}</div>
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

                                        {/* Summary Section - DUAL CURRENCY */}
                                        <div className="space-y-2 mb-6">
                                            {/* Withdrawal Amount */}
                                            <div className="flex flex-row items-center justify-between gap-4">
                                                <div>Withdrawal Amount:</div>
                                                <div className="space-y-1 text-right">
                                                    <div>
                                                        {computed.amountInSelectedCurrency.toFixed(6)} {selectedWithdrawCurrency?.shortName}
                                                    </div>
                                                    {exchangeRate && withdrawAmount && (
                                                        <div className="text-sm text-gray-500">
                                                            ${computed.amountInUSD.toFixed(2)} USD
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Fee */}
                                            <div className="flex flex-row items-center justify-between gap-4">
                                                <div>Fee ({feePercent}%):</div>
                                                <div className="space-y-1 text-right">
                                                    <div>
                                                        -{computed.feeInSelectedCurrency.toFixed(6)} {selectedWithdrawCurrency?.shortName}
                                                    </div>
                                                    {exchangeRate && withdrawAmount && (
                                                        <div className="text-sm text-gray-500">
                                                            -${computed.feeInUSD.toFixed(2)} USD
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Net Received */}
                                            <div className="flex flex-row items-center justify-between gap-4 font-semibold">
                                                <div>You Will Receive:</div>
                                                <div className="space-y-1 text-right">
                                                    <div>
                                                        {computed.netInSelectedCurrency.toFixed(6)} {selectedWithdrawCurrency?.shortName}
                                                    </div>
                                                    {exchangeRate && withdrawAmount && (
                                                        <div className="text-sm text-gray-500">
                                                            ${computed.netInUSD.toFixed(2)} USD
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Exchange Rate */}
                                            <div className="flex flex-row items-center justify-between gap-4 text-sm text-gray-500 mt-4">
                                                <div>Exchange Rate:</div>
                                                <div>
                                                    {exchangeRate
                                                        ? `1 ${selectedWithdrawCurrency?.shortName} = $${exchangeRate.toFixed(2)}`
                                                        : 'Loading...'}
                                                </div>
                                            </div>

                                            {/* Max Amount */}
                                            <div
                                                className="text-primary my-2 cursor-pointer hover:underline"
                                                onClick={handleMaxWithdrawAmountClick}
                                            >
                                                Max allowed: {maxAllowed.toFixed(6)} {selectedWithdrawCurrency?.shortName}
                                            </div>

                                            {exceedsMaxAllowed && (
                                                <div className="text-sm text-red-500">
                                                    Amount exceeds max allowed ({maxAllowed.toFixed(6)} {selectedWithdrawCurrency?.shortName})
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            variant="solid"
                                            className="rounded-lg w-full"
                                            size="sm"
                                            onClick={handleWithdrawClick}
                                            disabled={
                                                loading ||
                                                !selectedWithdrawCurrency ||
                                                !withdrawAmount ||
                                                !walletAddress ||
                                                (shouldShowBundleForWithdraw && !selectedFeeBundle) ||
                                                !!errorMessage ||
                                                !!feeBundleError ||
                                                exceedsMaxAllowed
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

            <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="text-center">
                    <CheckCircle2 className="text-green-500 mx-auto mb-4" size={60} />
                    <h3 className="text-xl font-semibold">Withdrawal request has been successfully submitted.</h3>
                </div>
            </Dialog>

            <div className="p-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg m-5">
                <div className="text-xl mb-4 font-semibold">Withdrawal History</div>
                {tableLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner size={40} />
                    </div>
                ) : (
                    <DataTable
                        data={currentPageData}
                        columns={columns}
                        loading={tableLoading}
                        pagingData={{ total: totalCount, pageIndex, pageSize }}
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