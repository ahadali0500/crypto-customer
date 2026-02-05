'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import TabList from '@/components/ui/Tabs/TabList';
import Tabs from '@/components/ui/Tabs/Tabs';
import TabNav from '@/components/ui/Tabs/TabNav';
import TabContent from '@/components/ui/Tabs/TabContent';
import Dropdown from '@/components/ui/Dropdown/Dropdown';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import { Button, Dialog, Input } from '@/components/ui';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import ExchangeHistory from './History';

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

const Page = () => {
  const [selectedSellCurrency, setSelectedSellCurrency] = useState<Currency | null>(null);
  const [selectedBuyCurrency, setSelectedBuyCurrency] = useState<Currency | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [errorDialog, setErrorDialog] = useState<boolean>(false);
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
  const feePercentage = 4;


  function getCurrencyType(symbol:any) {
    const data = allCurrency.filter(n => n?.shortName == symbol);
    return data[0]?.type
  }


  const fetchConversionRates = useCallback(
    async (fromSymbol: string, toSymbol: string): Promise<number | null> => {
      try {

        const fromType = getCurrencyType(fromSymbol);
        const toType = getCurrencyType(toSymbol);

        toSymbol = toSymbol.trim().split(/[\s/-]/)[0].toLowerCase();
        fromSymbol = fromSymbol.trim().split(/[\s/-]/)[0].toLowerCase();
        console.log(fromType, toType, "type");

        if (fromSymbol == toSymbol) {
          return 1;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        let conversionRate: number | null = null;

        if (fromType == "Crypto" && toType == "Crypto") {
          const res = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${fromSymbol},${toSymbol}&vs_currencies=usd`,
            { signal: controller.signal }
          );
          const fromPriceUSD = res.data[fromSymbol]?.usd;
          const toPriceUSD = res.data[toSymbol]?.usd;

          if (
            typeof fromPriceUSD === 'number' &&
            typeof toPriceUSD === 'number' &&
            toPriceUSD > 0
          ) {
            conversionRate = fromPriceUSD / toPriceUSD;
          }
        } else if (fromType == "Crypto" && toType == "Fiat") {
          // Crypto to Fiat
          const targetCurrency = toSymbol.trim().split(/[\s/-]/)[0].toLowerCase();
          const res = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${fromSymbol}&vs_currencies=${toSymbol}`,
            { signal: controller.signal }
          );

          const rate = res.data[fromSymbol]?.[targetCurrency];
          if (typeof rate === 'number' && rate >= 0) {
            conversionRate = rate;
          }
        } else if (fromType == "Fiat" && toType == "Crypto") {
          const res = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${toSymbol}&vs_currencies=${fromSymbol}`,
            { signal: controller.signal }
          );

          const cryptoPriceInFiat = res.data[toSymbol]?.[fromSymbol];

          if (typeof cryptoPriceInFiat === 'number' && cryptoPriceInFiat > 0) {
            conversionRate = 1 / cryptoPriceInFiat;
          }
        } else if (fromType == "Fiat" && toType == "Fiat") {
          const res = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${toSymbol}&vs_currencies=${fromSymbol}`,
            { signal: controller.signal }
          );

          const cryptoPriceInFiat = res.data[toSymbol]?.[fromSymbol];

          if (typeof cryptoPriceInFiat === 'number' && cryptoPriceInFiat > 0) {
            conversionRate = 1 / cryptoPriceInFiat;
          }
        }


        clearTimeout(timeoutId);
        return conversionRate;
      } catch (error) {
        if (axios.isCancel(error)) {
          console.error("Request timeout for conversion rate");
        } else {
          console.error("Error fetching conversion rate:", error);
        }
        return null;
      }
    },
    [allCurrency]
  );

  const [userDetails, setUserDetails] = useState(false);

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/fetch`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setUserDetails(res.data.data);
    } catch (error) {
      console.log('Error occur during fetch', error);
    }
  }

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchCrypto = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/user/fetch`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const res1 = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/fetch`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCrypto(res.data.data || []);
      setAllCurrency(res1.data.data || []);

      // Set default selections if data is available
      if (res.data.data && res.data.data.length > 0) {
        setSelectedSellCurrency(res.data.data[0]);
      }
      if (res1.data.data && res1.data.data.length > 0) {
        setSelectedBuyCurrency(res1.data.data[0]);
      }

    } catch (error) {
      console.log('Error occur during fetch', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCrypto();
    }
  }, [token]);

  const handleSellSelect = (key: string) => {
    const selected = crypto.find(c =>
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
    const selected = allCurrency.find(c =>
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

  // FIXED: Validation now includes fees in calculation
  const validateSellAmount = (amount: string): boolean => {
    if (!selectedSellCurrency || !amount) return false;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return false;

    // Calculate total amount including fees
    const fees = (numAmount * feePercentage) / 100;
    const totalAmountWithFees = numAmount + fees;

    const availableBalance = parseFloat(
      activeTab === 'locked'
        ? selectedSellCurrency.lockedBalance || "0"
        : selectedSellCurrency.availableBalance || "0"
    );

    // Check if total amount (including fees) is within available balance
    return totalAmountWithFees <= availableBalance;
  };

  const getAvailableBalance = (): number => {
    if (!selectedSellCurrency) return 0;

    const balance = activeTab === 'locked'
      ? selectedSellCurrency.lockedBalance || "0"
      : selectedSellCurrency.availableBalance || "0";

    const numericBalance = typeof balance === 'string' ? parseFloat(balance) : Number(balance);
    return isNaN(numericBalance) ? 0 : numericBalance;
  };

  const getCurrentBalanceForDisplay = (): number => {
    if (!selectedSellCurrency) return 0;

    const availableBalance = selectedSellCurrency.availableBalance || "0";
    const numericBalance = typeof availableBalance === 'string' ? parseFloat(availableBalance) : Number(availableBalance);
    return isNaN(numericBalance) ? 0 : numericBalance;
  };

  // Debounced conversion: guard against stale async results overwriting latest input.
  const debouncedCalculateConversion = useCallback(
    debounce(async (seq: number, amount: string, fromCurrency: Currency, toCurrency: Currency) => {
      if (!fromCurrency || !toCurrency || !amount || parseFloat(amount) <= 0) {
        if (seq !== conversionSeqRef.current) return;
        setBuyAmount('');
        setConversionLoading(false);
        return;
      }

      try {
        // Prefer ticker-like fields (shortName), NOT unicode symbols (₿/Ξ) to avoid wrong mapping.
        const fromKey = fromCurrency.shortName || fromCurrency.symbol || fromCurrency.fullName;
        const toKey = toCurrency.shortName || toCurrency.symbol || toCurrency.fullName;

        const conversionRate = await fetchConversionRates(fromKey, toKey);

        // Ignore late responses from older debounced calls
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
        console.error('Conversion error:', error);
        setBuyAmount('');
        setErrorMessage('Conversion failed. Please try again.');
      } finally {
        if (seq !== conversionSeqRef.current) return;
        setConversionLoading(false);
      }
    }, 800),
    [fetchConversionRates]
  );

  useEffect(() => {
    return () => {
      debouncedCalculateConversion.cancel();
    };
  }, [debouncedCalculateConversion]);

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
    return (numAmount * feePercentage) / 100;
  };

  const calculateTotalSellAmount = (amount: string): number => {
    const numAmount = parseFloat(amount) || 0;
    const fees = calculateFees(amount);
    return numAmount + fees;
  };

  // FIXED: Calculate max amount considering fees
  const getMaxAllowableAmount = (): number => {
    const availableBalance = getAvailableBalance();
    // Calculate max amount that user can enter (considering 4% will be added as fee)
    // If available balance is X, then max amount = X / 1.04
    return availableBalance / (1 + feePercentage / 100);
  };

  const handleSellAmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSellAmount(value);
    setErrorMessage('');

    if (!value) {
      setBuyAmount('');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setErrorMessage('Please enter a valid amount');
      setBuyAmount('');
      return;
    }

    // FIXED: Better validation message including fees
    if (!validateSellAmount(value)) {
      const maxAllowable = getMaxAllowableAmount();
      const totalWithFees = calculateTotalSellAmount(value);
      const availableBalance = getAvailableBalance();

      setErrorMessage(
        `Amount + fees (${totalWithFees.toFixed(6)}) exceeds available balance (${availableBalance.toFixed(6)}). Max amount you can enter: ${maxAllowable.toFixed(6)} ${selectedSellCurrency?.shortName}`
      );
      setBuyAmount('');
      return;
    }

    await calculateConversion(value);
  };

  const handleBuyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyAmount(e.target.value);
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
      const errorMsg = `Insufficient balance. Max amount you can enter: ${maxAllowable.toFixed(6)} ${selectedSellCurrency.shortName}`;
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
      formData.append('fees', `${feePercentage}`);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/exchange`,
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
        setSellAmount('');
        setBuyAmount('');
        setErrorMessage('');
        await fetchCrypto();
      }
    } catch (error: any) {
      console.error('Exchange error:', error);
      const errorMsg = error.response?.data?.message || 'Exchange failed. Please try again.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    setActiveTab(value);
    conversionSeqRef.current += 1;
    debouncedCalculateConversion.cancel();
    setConversionLoading(false);
    setSellAmount('');
    setBuyAmount('');
    setErrorMessage('');
  };


  const getReceiveAmount = (): number => {
    if (!sellAmount || !selectedSellCurrency || !selectedBuyCurrency) return 0;

    const amountNum = parseFloat(sellAmount) || 0;
    const fees = calculateFees(sellAmount); // fees in sell asset
    const netAmount = amountNum + fees;

    const conversionRate = parseFloat(buyAmount) / amountNum || 0; // existing conversion rate

    const received = netAmount * conversionRate;
    return isNaN(received) ? 0 : received;
  };

  return (
    <>
      <div className=' '>
        <div className='flex items-center justify-center'>
          <div className='w-full md:w-[60%] p-6  shadow-sm bg-white dark:bg-gray-800 rounded-lg'>
            <Tabs defaultValue='available' onChange={handleTabChange}>
              <TabList>
                <TabNav value='locked'>Locked</TabNav>
                <TabNav value='available'>Available</TabNav>
              </TabList>

              {['locked', 'available'].map((tab) => (
                <TabContent key={tab} value={tab}>
                  <form>
                    <div className='flex flex-row items-center gap-4 mt-4'>
                      <div className='w-full'>
                        <label className='text-sm'>Sell asset:</label>
                        <Dropdown
                          title={selectedSellCurrency ?
                            `${selectedSellCurrency.shortName} - ${selectedSellCurrency.fullName}` :
                            'Select Crypto Currency'}
                          trigger="click"
                          placement="bottom-start"
                          toggleClassName="border border-gray-400 rounded-lg w-full"
                          menuClass='w-full'
                        >
                          {crypto.map((currency) => (
                            <DropdownItem
                              key={currency.currencyId || currency.id || currency.fullName}
                              className="text-center w-full"
                              eventKey={currency.currencyId?.toString() || currency.id || currency.shortName}
                              onSelect={handleSellSelect}
                            >
                              {currency.shortName} - {currency.fullName}
                            </DropdownItem>
                          ))}
                        </Dropdown>
                      </div>

                      <div className='w-full'>
                        <label className='text-sm'>Buy asset (Fiat & Crypto):</label>
                        <Dropdown
                          title={selectedBuyCurrency ?
                            `${selectedBuyCurrency.shortName} - ${selectedBuyCurrency.fullName}` :
                            'Select Currency'}
                          trigger="click"
                          placement="bottom-start"
                          toggleClassName="border border-gray-400 rounded-lg w-full"
                          menuClass='w-full'
                        >
                          {allCurrency.map((currency) => (
                            <DropdownItem
                              key={currency.currencyId || currency.id || currency.fullName}
                              className="text-center w-full"
                              eventKey={currency.currencyId?.toString() || currency.id || currency.shortName}
                              onSelect={handleBuySelect}
                            >
                              {currency.shortName} - {currency.fullName}
                            </DropdownItem>
                          ))}
                        </Dropdown>
                      </div>
                    </div>

                    {/* {selectedSellCurrency && (
                      <div className='text-sm text-primary dark:text-primary mt-2'>
                        Available: {getCurrentBalanceForDisplay().toFixed(6)} {selectedSellCurrency.shortName}
                      </div>
                    )} */}

                    <div className='flex items-center gap-2 mt-4 bg-gray-200 dark:bg-gray-700 pl-3 rounded-lg'>
                      <span className='whitespace-nowrap text-sm'>Sell amount</span>
                      <Input
                        className='border border-gray-200 focus:ring-0 bg-gray-100 dark:bg-gray-800 rounded-lg'
                        placeholder='0.000000'
                        type='number'
                        step='0.000001'
                        min="0"
                        onKeyDown={(e) => {
                          if (['-', 'e', 'E', '+'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        value={sellAmount}
                        onChange={handleSellAmountChange}
                      />
                    </div>

                    <div className='flex items-center gap-2 mt-4 bg-gray-200 dark:bg-gray-700 pl-3 rounded-lg'>
                      <span className='whitespace-nowrap text-sm'>Buy amount</span>
                      <Input
                        className='border border-gray-200 focus:ring-0 bg-gray-100 dark:bg-gray-800 rounded-lg'
                        placeholder='0.000000'
                        type='number'
                        step='0.000001'
                        min="0"
                        onKeyDown={(e) => {
                          if (['-', 'e', 'E', '+'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        value={buyAmount}
                        onChange={handleBuyAmountChange}
                        disabled={conversionLoading}
                      />
                      {conversionLoading && (
                        <div className='text-sm text-blue-600'>Converting...</div>
                      )}
                    </div>

                    {errorMessage && (
                      <div className='mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg'>
                        <div className='text-sm text-red-700 dark:text-red-300'>
                          {errorMessage}
                        </div>
                      </div>
                    )}

                    <hr className='text-primary bg-primary my-8' />

                    <div className='space-y-2'>
                      <div className='flex flex-row items-center justify-between gap-4'>
                        <div>Transaction Fees ({feePercentage}%)</div>
                        <div>{calculateFees(sellAmount).toFixed(6)} {selectedSellCurrency?.shortName}</div>
                      </div>
                      <div className='flex flex-row items-center justify-between gap-4'>
                        <div>Total sell amount:</div>
                        <div>{calculateTotalSellAmount(sellAmount).toFixed(6)} {selectedSellCurrency?.shortName}</div>
                      </div>
                      <div className='flex flex-row items-center justify-between gap-4'>
                        <div>{tab === 'locked' ? 'Total pay amount:' : 'You receive:'}</div>
                        <div>{getReceiveAmount().toFixed(6)} {selectedBuyCurrency?.shortName}</div>
                      </div>
                      <div
                        className='text-primary my-2 cursor-pointer hover:underline'
                        onClick={() => {
                          const maxAmount = getMaxAllowableAmount().toString();
                          setSellAmount(maxAmount);
                          calculateConversion(maxAmount);
                        }}
                      >
                        Max amount: {getMaxAllowableAmount().toFixed(6)} {selectedSellCurrency?.shortName}
                      </div>
                    </div>

                    <div className='w-full mt-4'>
                      <Button
                        variant='solid'
                        className='rounded-lg w-full'
                        size='sm'
                        onClick={handleExchangeClick}
                        disabled={
                          loading ||
                          conversionLoading ||
                          !selectedSellCurrency ||
                          !selectedBuyCurrency ||
                          !sellAmount ||
                          !buyAmount ||
                          !validateSellAmount(sellAmount) ||
                          !!errorMessage
                        }
                      >
                        {loading ? 'Processing...' : 'Exchange'}
                      </Button>
                    </div>
                  </form>
                </TabContent>
              ))}
            </Tabs>
          </div>
        </div>


        <div className='mt-7'>
          <ExchangeHistory />
        </div>
      </div>

      <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)}>
        <div className='text-center'>
          <CheckCircle2 className='text-green-500 mx-auto mb-4' size={60} />
          <h3 className='text-xl font-semibold'>Exchange transaction has been successfully completed.</h3>
        </div>
      </Dialog>

    </>
  );
};

export default Page;