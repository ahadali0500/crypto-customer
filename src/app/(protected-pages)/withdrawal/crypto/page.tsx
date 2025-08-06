'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import TabList from '@/components/ui/Tabs/TabList';
import Tabs from '@/components/ui/Tabs/Tabs';
import TabNav from '@/components/ui/Tabs/TabNav';
import TabContent from '@/components/ui/Tabs/TabContent';
import Dropdown from '@/components/ui/Dropdown/Dropdown';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import { Button, Dialog, Input, Spinner } from '@/components/ui';
import { CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DataTable, { ColumnDef, OnSortParam } from '@/components/shared/DataTable';

// Add this mapping for CoinGecko API
const SYMBOL_TO_ID_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  LTC: "litecoin",
  USDT: "tether",
  BNB: "binancecoin",
  USDC: "usd-coin",
  ADA: "cardano",
  DOT: "polkadot",
  LINK: "chainlink",
  XRP: "ripple",
  SOL: "solana",
  TRX: "tron",
  AVAX: "avalanche-2",
  DOGE: "dogecoin",
  SHIB: "shiba-inu",
  MATIC: "matic-network",
  UNI: "uniswap",
  WBTC: "wrapped-bitcoin",
  BCH: "bitcoin-cash",
  XLM: "stellar",
  ATOM: "cosmos",
  ETC: "ethereum-classic",
  ICP: "internet-computer",
  FIL: "filecoin",
  LDO: "lido-dao",
  APT: "aptos",
  ARB: "arbitrum",
  NEAR: "near",
  VET: "vechain",
  QNT: "quant-network",
  ALGO: "algorand",
  EGLD: "elrond-erd-2",
  XTZ: "tezos",
  AAVE: "aave",
  SAND: "the-sandbox",
  AXS: "axie-infinity",
  THETA: "theta-token",
  MKR: "maker",
  GRT: "the-graph",
  FTM: "fantom",
  CRV: "curve-dao-token",
  CHZ: "chiliz",
  CAKE: "pancakeswap-token",
  RUNE: "thorchain",
  ENS: "ethereum-name-service",
  ZEC: "zcash",
  KSM: "kusama",
  COMP: "compound-governance-token",
  SNX: "synthetix-network-token",
  USD: "usd",
  EUR: "eur",
  GBP: "gbp",
  JPY: "jpy",
  CAD: "cad",
  AUD: "aud",
  PKR: "pkr"
};

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

interface ConversionData {
  btcAmount: string;
  usdAmount: string;
  rate: number | null;
}

// Define the withdrawal type based on your API response
type Withdrawal = {
  id: number
  withdrawType: 'Bank' | 'Crypto'
  withdrawStatus: string
  amount: string
  fees: string
  total: string
  FeesType: string
  balancetype: string
  createdAt: string
  currency: {
    shortName: string
    fullName: string
  }
  withdrawBank?: Array<{
    country: string
    bankName: string
    accountNumber: string
  }>
  withdrawCrypto?: Array<{
    walletAddress: string
    network: string
  }>
}

const Page = () => {
  const [selectedWithdrawCurrency, setSelectedWithdrawCurrency] = useState<Currency | null>(null);
  const [selectedFeeBundle, setSelectedFeeBundle] = useState<FeeBundle | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [feeBundleError, setFeeBundleError] = useState<string>('');
  const [crypto, setCrypto] = useState<Currency[]>([]);
  const [activeTab, setActiveTab] = useState<string>('Available');
  const [loading, setLoading] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [conversionData, setConversionData] = useState<ConversionData>({
    btcAmount: '',
    usdAmount: '',
    rate: null
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [bundleDetails, setBundleDetails] = useState<FeeBundle[]>([]);
  const [conversionLoading, setConversionLoading] = useState<boolean>(false);

const shouldShowBundleForWithdraw = userDetails?.withdrawFees === null || userDetails?.withdrawFees === undefined;

  // Filter crypto bundles and sort by rangeMin
  const cryptoBundles = useMemo(() => {
    return bundleDetails
      .filter(bundle => bundle.category === 'Crypto')
      .sort((a, b) => (a.rangeMin || 0) - (b.rangeMin || 0));
  }, [bundleDetails]);

  // Fee tier system logic
  const getFeeEligibility = useCallback((amount: string, bundleName: string): boolean => {
    if (!amount) return true; // If no amount entered, show all as available
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return false;

    const bundleNameLower = bundleName.toLowerCase();
    
    // Fee tier system based on amount ranges
    if (numAmount < 1) {
      // Less than 1 BTC - can use any fee option
      return true;
    } else if (numAmount >= 1 && numAmount < 3) {
      // 1-3 BTC - cannot use "low", can use economy, normal, high
      return !bundleNameLower.includes('low');
    } else if (numAmount >= 3 && numAmount < 7) {
      // 3-7 BTC - cannot use "low" or "economy", can use normal, high
      return !bundleNameLower.includes('low') && !bundleNameLower.includes('economy');
    } else {
      // 7+ BTC - can only use "high"
      return bundleNameLower.includes('high');
    }
  }, []);

  // Check if a fee bundle is enabled for the current amount
  const isBundleEnabled = useCallback((bundle: FeeBundle, amount: string): boolean => {
    return getFeeEligibility(amount, bundle.name);
  }, [getFeeEligibility]);

  // Get reason why bundle is disabled
  const getDisabledReason = useCallback((bundleName: string, amount: string): string => {
    if (!amount) return '';
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return '';

    const bundleNameLower = bundleName.toLowerCase();
    
    if (numAmount >= 1 && numAmount < 3) {
      if (bundleNameLower.includes('low')) {
        return 'Low fee option not available for amounts 1-3 BTC';
      }
    } else if (numAmount >= 3 && numAmount < 7) {
      if (bundleNameLower.includes('low')) {
        return 'Low fee option not available for amounts 3-7 BTC';
      }
      if (bundleNameLower.includes('economy')) {
        return 'Economy fee option not available for amounts 3-7 BTC';
      }
    } else if (numAmount >= 7) {
      if (!bundleNameLower.includes('high')) {
        return 'Only High fee option available for amounts 7+ BTC';
      }
    }
    
    return '';
  }, []);

  // Add this function to fetch conversion rate
  const fetchConversionRate = useCallback(async (fromSymbol: string, toSymbol: string): Promise<number | null> => {
    const fromCoinId = SYMBOL_TO_ID_MAP[fromSymbol.toUpperCase()];
    const toCoinId = SYMBOL_TO_ID_MAP[toSymbol.toUpperCase()];

    if (!fromCoinId || !toCoinId) {
      console.warn(`No mapping found for symbols: ${fromSymbol} or ${toSymbol}`);
      return null;
    }

    try {
      setConversionLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${fromCoinId}&vs_currencies=${toCoinId}`,
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const rate = res.data[fromCoinId]?.[toCoinId] || null;

      return rate;
    } catch (err) {
      if (axios.isCancel(err)) {
        console.error('Request timeout for conversion rate');
      } else {
        console.error('Error fetching conversion rate:', err);
      }
      return null;
    } finally {
      setConversionLoading(false);
    }
  }, []);

  // Add this effect to update conversion when withdraw amount changes
  useEffect(() => {
    const updateConversion = async () => {
      if (withdrawAmount && selectedWithdrawCurrency?.shortName === 'BTC') {
        const rate = await fetchConversionRate('BTC', 'USD');
        if (rate) {
          setConversionData({
            btcAmount: withdrawAmount,
            usdAmount: (parseFloat(withdrawAmount) * rate).toString(),
            rate
          });
        }
      }
    };

    const debounceTimer = setTimeout(() => {
      updateConversion();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [withdrawAmount, selectedWithdrawCurrency, fetchConversionRate]);

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/fetch`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setUserDetails(res.data.data);
    } catch (error) {
      console.log('Error occur during fetch user details:', error);
    }
  };

  const fetchBundleDetails = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/fees/bundle/fetch?category=Crypto`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const bundleData = res.data.data;
      if (Array.isArray(bundleData)) {
        setBundleDetails(bundleData);
      } else if (bundleData) {
        setBundleDetails([bundleData]);
      } else {
        setBundleDetails([]);
      }
    } catch (error) {
      console.log('Error occur during fetch bundle details:', error);
      setBundleDetails([]);
    }
  };

  const fetchCrypto = async () => {
    try {
      const cryptoRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/user/fetch?type=Crypto`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCrypto(cryptoRes.data.data || []);

      if (cryptoRes.data.data && cryptoRes.data.data.length > 0) {
        setSelectedWithdrawCurrency(cryptoRes.data.data[0]);
      }

    } catch (error) {
      console.log('Error occur during fetch currencies:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserDetails();
      fetchBundleDetails();
      fetchCrypto();
    }
  }, [token]);

  const getCurrencyKey = (currency: Currency): string => {
    return currency.currencyId?.toString() || currency.id || currency.shortName;
  };

  const handleWithdrawCurrencySelect = (key: string) => {
    const selected = crypto.find(c =>
      (c.currencyId && c.currencyId.toString() === key) ||
      (c.id && c.id === key) ||
      c.shortName === key ||
      c.fullName === key
    );
    if (selected) {
      setSelectedWithdrawCurrency(selected);
      setWithdrawAmount('');
      setErrorMessage('');
      setFeeBundleError('');
      setSelectedFeeBundle(null);
      setConversionData({
        btcAmount: '',
        usdAmount: '',
        rate: null
      });
    }
  };

  // Updated fee bundle selection handler with tier system
  const handleFeeBundleSelect = (bundle: FeeBundle) => {
    setFeeBundleError('');
    
    if (!withdrawAmount) {
      setFeeBundleError('Please enter withdraw amount first');
      setSelectedFeeBundle(bundle);
      return;
    }
    
    const isEligible = isBundleEnabled(bundle, withdrawAmount);
    
    if (!isEligible) {
      const reason = getDisabledReason(bundle.name, withdrawAmount);
      setFeeBundleError(reason);
      setSelectedFeeBundle(bundle);
      return;
    }
    
    setSelectedFeeBundle(bundle);
  };

  // Enhanced amount validation with negative check
  const validateWithdrawAmount = (amount: string): boolean => {
    if (!selectedWithdrawCurrency || !amount) return false;

    const numAmount = parseFloat(amount);
    // Check for negative or zero amounts
    if (isNaN(numAmount) || numAmount <= 0) return false;

    const availableBalance = parseFloat(
      activeTab === 'Locked'
        ? selectedWithdrawCurrency.lockedBalance || "0"
        : selectedWithdrawCurrency.availableBalance || "0"
    );
    return numAmount <= availableBalance;
  };

  const getWithdrawAvailableBalance = (): number => {
    if (!selectedWithdrawCurrency) return 0;
    const balance = activeTab === 'Locked'
      ? selectedWithdrawCurrency.lockedBalance || "0"
      : selectedWithdrawCurrency.availableBalance || "0";
    return parseFloat(balance.toString());
  };

const calculateWithdrawFees = (amount: string): number => {
  if (!amount) return 0;
  const numAmount = parseFloat(amount) || 0;

  if (shouldShowBundleForWithdraw && selectedFeeBundle) {
    const feePercentage = parseFloat(selectedFeeBundle.value) || 0;
    return (numAmount * feePercentage) / 100;
  } else if (userDetails?.withdrawFees) {  // Changed from withdrawFee to withdrawFees
    const feePercentage = parseFloat(userDetails.withdrawFees) || 0;
    return (numAmount * feePercentage) / 100;
  }

  return 0;
};


  const calculateTotalWithdrawAmount = (amount: string): number => {
    const numAmount = parseFloat(amount) || 0;
    const fees = calculateWithdrawFees(amount);
    return numAmount + fees;
  };

  // Enhanced withdraw amount change handler with negative validation
  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWithdrawAmount(value);
    setFeeBundleError('');
    setErrorMessage('');
    setLoading(false);

    if (!value) {
      setConversionData({
        btcAmount: '',
        usdAmount: '',
        rate: null
      });
      setSelectedFeeBundle(null);
      return;
    }

    const numValue = parseFloat(value);
    
    // Enhanced validation for negative and invalid amounts
    if (isNaN(numValue)) {
      setErrorMessage('Please enter a valid numeric amount');
      return;
    }

    if (numValue < 0) {
      setErrorMessage('Amount cannot be negative');
      return;
    }

    if (numValue === 0) {
      setErrorMessage('Amount must be greater than 0');
      return;
    }

    if (!validateWithdrawAmount(value)) {
      const availableBalance = getWithdrawAvailableBalance();
      setErrorMessage(`Amount exceeds available balance. Available: ${availableBalance.toFixed(6)} ${selectedWithdrawCurrency?.shortName}`);
      return;
    }

    // Re-validate selected fee bundle when amount changes
    if (selectedFeeBundle && !isBundleEnabled(selectedFeeBundle, value)) {
      const reason = getDisabledReason(selectedFeeBundle.name, value);
      setFeeBundleError(reason);
    }
  };

  const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value);
    setErrorMessage('');
    setLoading(false);
  };

  // Updated withdraw click handler with enhanced validation
  const handleWithdrawClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!selectedWithdrawCurrency || !withdrawAmount || !walletAddress) {
      const message = 'Please fill in all required fields for withdrawal';
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    // Enhanced amount validation
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

    // Check if selected fee bundle is eligible
    if (shouldShowBundleForWithdraw && selectedFeeBundle) {
      const isEligible = isBundleEnabled(selectedFeeBundle, withdrawAmount);
      if (!isEligible) {
        const message = 'Selected fee option is not eligible for this amount. Please choose a different fee option.';
        setErrorMessage(message);
        toast.error(message);
        return;
      }
    }

    if (!validateWithdrawAmount(withdrawAmount)) {
      const message = `Insufficient balance. Available: ${getWithdrawAvailableBalance().toFixed(6)} ${selectedWithdrawCurrency.shortName}`;
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('balancetype', activeTab);
      formData.append('currencyId', selectedWithdrawCurrency.currencyId?.toString() || selectedWithdrawCurrency.id || '');
      formData.append('walletAddress', walletAddress);
      formData.append('amount', withdrawAmount);

      // For BTC, pass the converted USD amount as total
      if (selectedWithdrawCurrency.shortName === 'BTC' && conversionData.usdAmount) {
        formData.append('total', conversionData.usdAmount);
      } else {
        formData.append('total', calculateTotalWithdrawAmount(withdrawAmount).toString());
      }

 // 4. Update the form data submission part in handleWithdrawClick
if (shouldShowBundleForWithdraw && selectedFeeBundle) {
  formData.append('FeesType', 'Package');
  formData.append('feesBundleId', selectedFeeBundle.id || '');
  formData.append('fees', selectedFeeBundle.value);
} else {
  formData.append('FeesType', 'Default');
  formData.append('fees', userDetails?.withdrawFees || '0');  // Changed from withdrawFee to withdrawFees
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
        setConversionData({
          btcAmount: '',
          usdAmount: '',
          rate: null
        });
        await fetchCrypto();
        toast.success('Withdrawal request submitted successfully!');
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      const errorMsg = error.response?.data?.message || 'Withdrawal failed. Please try again.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setWithdrawAmount('');
    setWalletAddress('');
    setErrorMessage('');
    setFeeBundleError('');
    setLoading(false);
    setSelectedFeeBundle(null);
    setConversionData({
      btcAmount: '',
      usdAmount: '',
      rate: null
    });
  };

  const handleMaxWithdrawAmountClick = () => {
    const maxAmount = getWithdrawAvailableBalance().toString();
    setWithdrawAmount(maxAmount);
    setLoading(false);
  };

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [tableLoading, setTableLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('Pending')
  const [updating, setUpdating] = useState(false)

  // Pagination and Sorting
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortConfig, setSortConfig] = useState<{ key: string; order: 'asc' | 'desc' | '' }>({
    key: '',
    order: '',
  })

  const fetchWithdrawalHistory = async () => {
    setTableLoading(true)
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/withdraw/fetch?withdrawType=Crypto`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setWithdrawals(res.data.data || [])
    } catch (error) {
      console.error('Error fetching withdrawal data', error)
    } finally {
      setLoading(false)
      setTableLoading(false)
    }
  }

  const handleRowSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id])
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(currentPageData.map((w: any) => w.id))
    } else {
      setSelectedRows([])
    }
  }

  // Status color mapping
  const statusColorMap: Record<string, string> = {
    Pending: 'bg-yellow-500 text-white',
    Completed: 'bg-green-500 text-white',
    Rejected: 'bg-red-500 text-white',
    Execute: 'bg-blue-500 text-white',
    Decline: 'bg-red-500 text-white',
  }

  // Type color mapping
  const typeColorMap: Record<string, string> = {
    Bank: 'bg-blue-500 text-white',
    Crypto: 'bg-purple-500 text-white',
  }

  // Client-side sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key || sortConfig.order === '') {
      return withdrawals
    }
    const direction = sortConfig.order === 'asc' ? 1 : -1
    return [...withdrawals].sort((a, b) => {
      const A = (a as any)[sortConfig.key]
      const B = (b as any)[sortConfig.key]

      // Handle date sorting
      if (sortConfig.key === 'createdAt') {
        return (new Date(A).getTime() - new Date(B).getTime()) * direction
      }

      // Handle numeric sorting (for amount, fees, total)
      if (sortConfig.key === 'amount' || sortConfig.key === 'fees' || sortConfig.key === 'total') {
        const numA = parseFloat(String(A).replace(/[^0-9.-]+/g, ''))
        const numB = parseFloat(String(B).replace(/[^0-9.-]+/g, ''))
        return (numA - numB) * direction
      }

      // Handle numeric sorting for id
      if (typeof A === 'number' && typeof B === 'number') {
        return (A - B) * direction
      }

      // Handle string sorting
      return String(A).localeCompare(String(B)) * direction
    })
  }, [withdrawals, sortConfig])

  // Client-side pagination
  const currentPageData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize
    const end = start + pageSize
    return sortedData.slice(start, end)
  }, [sortedData, pageIndex, pageSize])

  // Total count for pagination
  const totalCount = sortedData.length

  // Sorting handler
  const handleSort = (sort: OnSortParam) => {
    setSortConfig({ key: String(sort.key), order: sort.order })
    setPageIndex(1)
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPageIndex(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPageIndex(1)
  }

  useEffect(() => {
    fetchWithdrawalHistory()
  }, [])

  // Columns configuration
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
        <span className='text-nowrap'>
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
        const type = row.original.withdrawType ||
          ((row.original.withdrawBank?.length ?? 0) > 0 ? 'Bank' :
            (row.original.withdrawCrypto?.length ?? 0) > 0 ? 'Crypto' : 'Unknown');
        return (
          <span className={`px-2 py-1 rounded text-xs ${typeColorMap[type] || 'bg-gray-500 text-white'}`}>
            {type}
          </span>
        )
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
  ]

  return (
    <>
      <div className='p-5 '>
        <div className='flex items-center justify-center'>
          <div className='w-full md:w-[60%]  p-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg'>
            <h1 className='text-xl font-semibold mb-4 text-center'>Crypto Withdrawal</h1>

            <Tabs defaultValue='Available' onChange={handleTabChange}>
              <TabList>
                <TabNav value='Available'>Available</TabNav>
                <TabNav value='Locked'>Locked</TabNav>
              </TabList>

              {['Available', 'Locked'].map((tab) => (
                <TabContent key={tab} value={tab}>
                  <form>
                    <div className='w-full mb-4 mt-4'>
                      <label className='text-sm'>Select Crypto Currency:</label>
                      <Dropdown
                        title={selectedWithdrawCurrency ?
                          `${selectedWithdrawCurrency.shortName} - ${selectedWithdrawCurrency.fullName}` :
                          'Select Crypto Currency'}
                        trigger="click"
                        placement="bottom-start"
                        toggleClassName="border border-gray-400 rounded-lg w-full"
                        menuClass='w-full'
                      >
                        {crypto.map((currency) => (
                          <DropdownItem
                            key={getCurrencyKey(currency)}
                            className="text-center w-full "
                            eventKey={getCurrencyKey(currency)}
                            onSelect={handleWithdrawCurrencySelect}
                          >
                            {currency.shortName} - {currency.fullName}
                          </DropdownItem>
                        ))}
                      </Dropdown>
                    </div>

                    {selectedWithdrawCurrency && (
                      <div className='text-sm text-primary dark:text-primary mb-4'>
                        {tab === 'Available' ? 'Available' : 'Locked'} Balance: {parseFloat(
                          tab === 'Locked'
                            ? selectedWithdrawCurrency.lockedBalance || '0'
                            : selectedWithdrawCurrency.availableBalance || '0'
                        ).toFixed(6)} {selectedWithdrawCurrency.shortName}
                      </div>
                    )}

                    <div className='flex items-center gap-2 mb-4 bg-gray-200 dark:bg-gray-700 pl-3 rounded-lg'>
                      <span className='whitespace-nowrap text-sm'>Wallet Address</span>
                      <Input
                        className=' focus:ring-0 border border-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg'
                        placeholder='Enter wallet address'
                        value={walletAddress}
                        onChange={handleWalletAddressChange}
                      />
                    </div>

                    <div className='flex items-center gap-2 mb-4 bg-gray-200 dark:bg-gray-700 pl-3 rounded-lg'>
                      <span className='whitespace-nowrap text-sm'>BTC Amount</span>
                      <Input
                        className='border border-gray-200 focus:ring-0 bg-gray-100 dark:bg-gray-800 rounded-lg'
                        placeholder='0.000000'
                        type='number'
                        step='0.000001'
                        min='0'
                        value={withdrawAmount}
                        onChange={handleWithdrawAmountChange}
                      />
                    </div>

                    {/* Conversion display for BTC */}
                    {selectedWithdrawCurrency?.shortName === 'BTC' && withdrawAmount && (
                      <div className='mb-4'>
                        <div className='text-sm'>
                          {conversionLoading ? (
                            <div>Loading conversion rate...</div>
                          ) : conversionData.rate ? (
                            <>
                              <div className='flex justify-between text-primary'>
                                <span>USD Amount:</span>
                                <span>${parseFloat(conversionData.usdAmount).toFixed(2)}</span>
                              </div>
                            </>
                          ) : (
                            <div>Could not fetch conversion rate</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Fee Bundle Selection UI with tier system */}
                    {shouldShowBundleForWithdraw && (
                      <div className='w-full mb-4'>
                        <label className='text-sm mb-2 block'>Fee Options:</label>
                        
                        {/* Fee tier information */}
                        {/* {withdrawAmount && (
                          <div className='mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg'>
                            <div className='text-sm text-blue-700 dark:text-blue-300'>
                              <strong>Fee Tier System:</strong><br/>
                              • Less than 1 BTC: All fee options available<br/>
                              • 1-3 BTC: Economy, Normal, High available<br/>
                              • 3-7 BTC: Normal, High available<br/>
                              • 7+ BTC: Only High fee available
                            </div>
                          </div>
                        )}
                         */}
                        <div className='grid grid-cols-2 gap-2'>
                          {cryptoBundles.map((bundle) => {
                            const isEligible = isBundleEnabled(bundle, withdrawAmount);
                            const isSelected = selectedFeeBundle?.id === bundle.id;
                            const disabledReason = !isEligible ? getDisabledReason(bundle.name, withdrawAmount) : '';
                            
                            return (
                              <button
                                key={bundle.id}
                                type="button"
                                onClick={() => handleFeeBundleSelect(bundle)}
                                disabled={!isEligible && withdrawAmount}
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
                                <div className='font-medium flex items-center justify-between'>
                                  <span>{bundle.name} ({bundle.value}%)</span>
                                  {!isEligible && withdrawAmount && (
                                    <Lock className="w-4 h-4" />
                                  )}
                                  {isSelected && !isEligible && (
                                    <span className='text-xs bg-red-200 text-red-800 px-1 rounded'>
                                      Not Eligible
                                    </span>
                                  )}
                                  {isSelected && isEligible && (
                                    <span className='text-xs bg-green-200 text-green-800 px-1 rounded'>
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <div className='text-xs mt-1 opacity-80'>
                                  {bundle.descrption || bundle.description}
                                </div>
                                {disabledReason && (
                                  <div className='text-xs mt-2 text-red-600 dark:text-red-400 font-medium'>
                                    {disabledReason}
                                  </div>
                                )}
                                {withdrawAmount && isEligible && (
                                  <div className='text-xs mt-1 font-medium text-green-600 dark:text-green-400'>
                                    ✓ Available for your amount
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Fee Bundle Error Display */}
                        {feeBundleError && (
                          <div className='mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg'>
                            <div className='text-sm text-red-700 dark:text-red-300 flex items-center'>
                              <AlertCircle className="w-4 h-4 mr-2" />
                              {feeBundleError}
                            </div>
                          </div>
                        )}

                        {/* Info message when no fee bundle selected */}
                        {!selectedFeeBundle && withdrawAmount && (
                          <div className='mt-2 p-2 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg'>
                            <div className='text-sm text-blue-700 dark:text-blue-300'>
                              Please select a fee option to proceed with withdrawal
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!shouldShowBundleForWithdraw && userDetails?.withdrawFees && (  // Changed from withdrawFee to withdrawFees
  <div className='mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg'>
    <div className='text-sm text-blue-700 dark:text-blue-300'>
      Your withdrawal fee: {userDetails.withdrawFees}% (Default rate)  {/* Changed from withdrawFee to withdrawFees */}
    </div>
  </div>
)}

                    {errorMessage && (
                      <div className='mb-4 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg'>
                        <div className='text-sm text-red-700 dark:text-red-300'>
                          {errorMessage}
                        </div>
                      </div>
                    )}

                    <hr className='text-primary bg-primary my-6' />

                    <div className='space-y-2 mb-6'>
                      <div className='flex flex-row items-center justify-between gap-4'>
                        <div>Withdrawal Amount:</div>
                        <div>{withdrawAmount ? parseFloat(withdrawAmount).toFixed(6) : '0.000000'} {selectedWithdrawCurrency?.shortName}</div>
                      </div>
                      <div className='flex flex-row items-center justify-between gap-4'>
                    <div>
                      Withdrawal Fees ({shouldShowBundleForWithdraw ?
                        (selectedFeeBundle ? selectedFeeBundle.value : '0') :
                        (userDetails?.withdrawFees || '0')}%)  {/* Changed from withdrawFee to withdrawFees */}
                    </div>
                    <div>{calculateWithdrawFees(withdrawAmount).toFixed(6)} {selectedWithdrawCurrency?.shortName}</div>
                  </div>
                      <div className='flex flex-row items-center justify-between gap-4 font-semibold'>
                        <div>Total Deduction:</div>
                        <div>{calculateTotalWithdrawAmount(withdrawAmount).toFixed(6)} {selectedWithdrawCurrency?.shortName}</div>
                      </div>
                      {/* Conversion display for BTC */}
                    {selectedWithdrawCurrency?.shortName === 'BTC' && withdrawAmount && (
                      <div className='mb-4'>
                        <div className='text-sm'>
                          {conversionLoading ? (
                            <div></div>
                          ) : conversionData.rate ? (
                            <>
                              <div className='flex justify-between text-primary'>
                                <span>USD Amount:</span>
                                <span>${parseFloat(conversionData.usdAmount).toFixed(2)}</span>
                              </div>
                            </>
                          ) : (
                            <div>Could not fetch conversion rate</div>
                          )}
                        </div>
                      </div>
                    )}
                      <div className='flex flex-row items-center justify-between gap-4'>
                        <div>Balance Type:</div>
                        <div className='capitalize'>{tab}</div>
                      </div>
                      <div
                        className='text-primary my-2 cursor-pointer hover:underline'
                        onClick={handleMaxWithdrawAmountClick}
                      >
                        Max amount: {getWithdrawAvailableBalance().toFixed(6)} {selectedWithdrawCurrency?.shortName}
                      </div>
                    </div>

                    <div className='w-full'>
                      <Button
                        variant='solid'
                        className='rounded-lg w-full'
                        size='sm'
                        onClick={handleWithdrawClick}
                        disabled={
                          loading ||
                          !selectedWithdrawCurrency ||
                          !withdrawAmount ||
                          !walletAddress ||
                          (shouldShowBundleForWithdraw && !selectedFeeBundle) ||
                          !validateWithdrawAmount(withdrawAmount) ||
                          !!errorMessage ||
                          !!feeBundleError ||
                          (selectedFeeBundle && !isBundleEnabled(selectedFeeBundle, withdrawAmount))
                        }
                      >
                        {loading ? 'Processing...' : 'Submit Withdrawal'}
                      </Button>
                    </div>
                  </form>
                </TabContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)}>
        <div className='text-center'>
          <CheckCircle2 className='text-green-500 mx-auto mb-4' size={60} />
          <h3 className='text-xl font-semibold'>
            Withdrawal request has been successfully submitted.
          </h3>
        </div>
      </Dialog>

      <div className='p-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg'>
        <div className="text-xl mb-4 font-semibold">Withdrawal History</div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size={40} />
          </div>
        ) : (
          <DataTable
            data={currentPageData}
            columns={columns}
            loading={tableLoading}
            pagingData={{
              total: totalCount,
              pageIndex,
              pageSize,
            }}
            onPaginationChange={handlePageChange}
            onSelectChange={handlePageSizeChange}
            onSort={handleSort}
            noData={!loading && withdrawals.length === 0}
          />
        )}
      </div>
    </>
  );
};

export default Page;