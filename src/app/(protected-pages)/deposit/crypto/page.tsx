'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Dialog, Input } from '@/components/ui'
import Dropdown from '@/components/ui/Dropdown/Dropdown'
import DropdownItem from '@/components/ui/Dropdown/DropdownItem'
import DataTable, {
    ColumnDef,
    OnSortParam,
} from '@/components/shared/DataTable'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useSessionContext } from '@/components/auth/AuthProvider/SessionContext'
import { IoCopyOutline } from 'react-icons/io5'

type Currency = {
    id: number
    fullName: string
    shortName: string
    icon: string
    type: string
    rate?: number
    wallet: {
        id: string
        address: string
        qrImage: string
        name: string
    }[]
}

type Transaction = {
    id: number
    date: string
    asset: string
    amount: string
    value: string
    fee: string
    status: string
    subject?: string
    createdAt?: string
    currency: Currency
}
type DepositData = {
    deposit: {
        id: string
    }
    address: string
}

// ✅ REMOVED: Static SYMBOL_TO_ID_MAP
// The following was deleted:
/*
export const SYMBOL_TO_ID_MAP: Record<string, string> = {
    AAVE: 'aave',
    ADA: 'cardano',
    // ... 50+ entries removed
    BTC: 'bitcoin',
    ETH: 'ethereum',
    // etc
}
*/

const statusColorMap: Record<string, string> = {
    Pending: 'bg-gray-200 text-gray-800',
    Processing: 'bg-yellow-200 text-yellow-800',
    Execute: 'bg-green-200 text-green-800',
    Decline: 'bg-red-200 text-red-800',
}

const columns: ColumnDef<Transaction>[] = [
    {
        header: 'ID',
        accessorKey: 'id',
        cell: ({ row }) => (
            <span className="font-semibold">#{row.original.id}</span>
        ),
    },
    {
        header: 'Date',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => {
            const rawDate = getValue() as string
            const date = new Date(rawDate)
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            })
        },
    },
    {
        header: 'Base Asset',
        accessorKey: 'shortName',
        cell: ({ row }) => <span>{row.original.currency.shortName}</span>,
    },
    {
        header: 'Amount',
        accessorKey: 'amount',
        cell: ({ getValue }) => {
            const value = getValue() as string
            const formattedValue = parseFloat(value).toFixed(6)
            return (
                <span className="text-green-600 font-medium">
                    {formattedValue}
                </span>
            )
        },
    },
    {
        header: 'Fee %',
        accessorKey: 'fees',
    },
    {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
            const value = getValue() as string
            const color = statusColorMap[value] || 'bg-gray-100 text-gray-800'
            return (
                <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}
                >
                    {value}
                </span>
            )
        },
    },
]

const Page = () => {
    // State declarations
    const [copiedMap, setCopiedMap] = useState<{ [id: string]: boolean }>({})
    const [currencies, setCurrencies] = useState<Currency[]>([])
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
        null,
    )
    const [usdAmount, setUsdAmount] = useState<string>('')
    const [cryptoAmount, setCryptoAmount] = useState<string>('')
    const [showStatus, setShowStatus] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [depositData, setDepositData] = useState<DepositData | null>(null)
    const [conversionLoading, setConversionLoading] = useState(false)
    const [depositHistory, setDepositHistory] = useState<Transaction[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [search, setSearch] = useState('')
    const [dataLoading, setDataLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { session } = useSessionContext()

    // Pagination and Sorting
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [sortConfig, setSortConfig] = useState<{
        key: string
        order: 'asc' | 'desc' | ''
    }>({
        key: '',
        order: '',
    })

    // Hooks
    const searchParams = useSearchParams()
    const router = useRouter()
    const tableRef = useRef<HTMLDivElement>(null)

    // Rate caching
    const [rateCache, setRateCache] = useState<{
        [key: string]: { rate: number; timestamp: number }
    }>({})
    const [isLoadingRates, setIsLoadingRates] = useState(false)

    // Get token safely
    const token = useMemo(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken')
        }
        return null
    }, [])

    // Memoized filtered data
    const filteredData = useMemo(() => {
        if (!search.trim()) return depositHistory
        const query = search.toLowerCase()
        return depositHistory.filter((item) => {
            const matchesSubject =
                item.subject?.toLowerCase().includes(query) || false
            const matchesId = item.id.toString().includes(query)
            const matchesAsset =
                item.asset?.toLowerCase().includes(query) || false
            return matchesSubject || matchesId || matchesAsset
        })
    }, [depositHistory, search])

    // Update total count when filtered data changes
    useEffect(() => {
        setTotalCount(filteredData?.length)
        setPageIndex(1)
    }, [filteredData])

    // Memoized sorted data
    const sortedData = useMemo(() => {
        if (!sortConfig.key || sortConfig.order === '') {
            return filteredData
        }
        const direction = sortConfig.order === 'asc' ? 1 : -1
        return [...filteredData].sort((a, b) => {
            const A = (a as any)[sortConfig.key]
            const B = (b as any)[sortConfig.key]

            // Handle date sorting
            if (sortConfig.key === 'createdAt' || sortConfig.key === 'date') {
                return (
                    (new Date(A).getTime() - new Date(B).getTime()) * direction
                )
            }

            // Handle numeric sorting
            if (typeof A === 'number' && typeof B === 'number') {
                return (A - B) * direction
            }

            // Handle string sorting
            return String(A || '').localeCompare(String(B || '')) * direction
        })
    }, [filteredData, sortConfig])

    // Memoized paginated data
    const paginatedData = useMemo(() => {
        const start = (pageIndex - 1) * pageSize
        const end = start + pageSize
        return sortedData?.slice(start, end)
    }, [sortedData, pageIndex, pageSize])

    // ✅ ONLY dynamic symbol mapping (no static object)
    const [symbolToIdMap, setSymbolToIdMap] = useState({})

    const fetchAllCurrencies = async () => {
        const [vsCurrenciesRes, cryptoListRes] = await Promise.all([
            axios.get(
                'https://api.coingecko.com/api/v3/simple/supported_vs_currencies',
            ),
            axios.get('https://api.coingecko.com/api/v3/coins/list'),
        ])

        // Create mapping from SYMBOL to ID
        const map = {}
        cryptoListRes.data.forEach((coin) => {
            map[coin.symbol.toUpperCase()] = coin.id
        })

        setSymbolToIdMap(map)
    }

    useEffect(() => {
        fetchAllCurrencies()
    }, [])

    // fetch conversion rate
    const fetchConversionRate = useCallback(
        async (coinGeckoId: string, useCache = true): Promise<number | null> => {
            const cleanId = coinGeckoId.toLowerCase()
            const cacheKey = `${cleanId}_USD`

            if (useCache && rateCache[cacheKey]) {
                const cached = rateCache[cacheKey]
                if (Date.now() - cached.timestamp < 300000) {
                    return cached.rate
                }
            }

            try {
                const res = await axios.get(
                    'https://api.coingecko.com/api/v3/simple/price',
                    {
                        params: {
                            ids: cleanId,
                            vs_currencies: 'usd',
                        },
                    }
                )

                const rate = res.data?.[cleanId]?.usd ?? null

                if (rate) {
                    setRateCache((prev) => ({
                        ...prev,
                        [cacheKey]: { rate, timestamp: Date.now() },
                    }))
                }

                return rate
            } catch (e) {
                console.error('Rate fetch failed:', e)
                return null
            }
        },
        [rateCache]
    )


    // Fetch deposit history
    const fetchDepositHistory = useCallback(async () => {
        if (!token) return

        setDataLoading(true)
        setError(null)
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/deposit/crytpo/fetch`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
            setDepositHistory(res.data.data || [])
        } catch (error) {
            console.error('Error fetching deposit history:', error)
            setError('Failed to fetch deposit history')
        } finally {
            setDataLoading(false)
        }
    }, [token])

    // Fetch cryptocurrencies with rates
    const fetchCryptocurrencies = useCallback(async () => {
        if (!token) return

        setIsLoadingRates(true)
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/fetch?type=Crypto`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            const currencyData = response.data.data || []

            // Sequential processing with delay to avoid rate limiting
            const currenciesWithRates: Currency[] = []

            for (let i = 0; i < currencyData.length; i++) {
                const currency = currencyData[i]

                try {
                    console.log(
                        `Fetching rate for ${currency.shortName} (${i + 1}/${currencyData.length})`,
                    )
                    const rate = await fetchConversionRate(currency.shortName)

                    currenciesWithRates.push({
                        ...currency,
                        rate: rate || 0,
                    })

                    // Add delay between requests (except for last one)
                    if (i < currencyData.length - 1) {
                        await new Promise((resolve) => setTimeout(resolve, 200))
                    }
                } catch (error) {
                    console.error(
                        `Error fetching rate for ${currency.shortName}:`,
                        error,
                    )
                    currenciesWithRates.push({
                        ...currency,
                        rate: 0,
                    })
                }
            }

            setCurrencies(currenciesWithRates)

            if (currenciesWithRates.length > 0) {
                setSelectedCurrency(currenciesWithRates[0])
            }
        } catch (error) {
            console.error('Error fetching currencies:', error)
            setError('Failed to fetch currencies')
        } finally {
            setIsLoadingRates(false)
        }
    }, [token, fetchConversionRate])

    // Currency conversion effect
    useEffect(() => {
        const convertCurrency = async () => {
            if (
                !selectedCurrency ||
                !usdAmount ||
                isNaN(parseFloat(usdAmount)) ||
                parseFloat(usdAmount) <= 0
            ) {
                setCryptoAmount('')
                return
            }

            setConversionLoading(true)

            try {
                let rate = selectedCurrency.rate

                // Only fetch fresh rate if cached rate is 0 or very old
                if (!rate || rate === 0) {
                    console.log('Fetching fresh rate for conversion...')
                    rate = await fetchConversionRate(
                        selectedCurrency.shortName,
                        true,
                    )
                }

                if (rate && rate > 0) {
                    const usdValue = parseFloat(usdAmount)
                    const cryptoValue = usdValue / rate
                    setCryptoAmount(cryptoValue.toFixed(8))
                } else {
                    console.error('Unable to get conversion rate')
                    setCryptoAmount('0')
                }
            } catch (error) {
                console.error('Error in conversion:', error)
                setCryptoAmount('0')
            } finally {
                setConversionLoading(false)
            }
        }

        // Debounce to reduce API calls
        const timeoutId = setTimeout(convertCurrency, 1000)
        return () => clearTimeout(timeoutId)
    }, [selectedCurrency, usdAmount, fetchConversionRate])

    // Initial data fetch
    useEffect(() => {
        if (token) {
            fetchCryptocurrencies()
            fetchDepositHistory()
        }
    }, [token, fetchCryptocurrencies, fetchDepositHistory])

    // Check URL params for success status
    useEffect(() => {
        if (searchParams.get('isDone') === 'success') {
            setShowStatus(true)
        }
    }, [searchParams])

    // Event handlers
    const handleSort = useCallback((sort: OnSortParam) => {
        setSortConfig({ key: String(sort.key), order: sort.order })
        setPageIndex(1)
    }, [])

    const handlePageChange = useCallback((newPage: number) => {
        setPageIndex(newPage)
    }, [])

    const handlePageSizeChange = useCallback((newSize: number) => {
        setPageSize(newSize)
        setPageIndex(1)
    }, [])

    const handleCurrencySelect = useCallback(
        (key: string) => {
            const currency = currencies.find((c) => c.id.toString() === key)
            if (currency) {
                setSelectedCurrency(currency)
                setUsdAmount('')
                setCryptoAmount('')
            }
        },
        [currencies],
    )

    const handleUsdAmountChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            if (
                value === '' ||
                (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)
            ) {
                setUsdAmount(value)
            }
        },
        [],
    )

    const handleDeposit = useCallback(async () => {
        if (!selectedCurrency || !usdAmount || !cryptoAmount) {
            toast.error('Please fill all fields')
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('type', 'Crypto')
            formData.append('currencyId', String(selectedCurrency.id))
            formData.append('amount', String(cryptoAmount))
            formData.append('total', String(usdAmount))
            formData.append('fees', '0')
            formData.append('status', 'Pending')

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/deposit/crytpo/create`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                },
            )

            setDepositData(response.data.data)

            const url = new URL(window.location.href)
            url.searchParams.set('isDone', 'success')
            router.push(url.toString())

            setShowStatus(true)
            toast.success('Deposit created successfully!')
        } catch (error) {
            console.error('Error creating deposit:', error)
            toast.error('Error creating deposit. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [selectedCurrency, usdAmount, cryptoAmount, token, router])

    const handleConfirmPaid = useCallback(() => {
        if (!depositData) return

        setLoading(true)

        setTimeout(() => {
            setShowModal(true)
            toast.success('Payment confirmation submitted!')
            setLoading(false)
        }, 500)
    }, [depositData])

    const handleModalClose = useCallback(() => {
        setShowModal(false)
        setShowStatus(false)
        setUsdAmount('')
        setCryptoAmount('')
        setDepositData(null)

        // Clean URL
        const url = new URL(window.location.href)
        url.searchParams.delete('isDone')
        router.push(url.toString())

        // Refresh deposit history
        fetchDepositHistory()
    }, [router, fetchDepositHistory])

    // Show error state
    if (error && !token) {
        return (
            <div className="lg:w-[70%] mx-auto p-6 bg-white dark:bg-gray-900 shadow rounded-lg">
                <div className="text-center text-red-600">
                    <p>Please log in to access the deposit feature.</p>
                </div>
            </div>
        )
    }

    const getWalletData = useCallback((currency: Currency | null) => {
        if (
            !currency ||
            !currency.wallet ||
            !Array.isArray(currency.wallet) ||
            currency.wallet.length === 0
        ) {
            return null
        }
        return currency.wallet[0]
    }, [])

    const walletData = getWalletData(selectedCurrency)

    const handleCopy = async (walletId: string, address: string) => {
        try {
            await navigator.clipboard.writeText(address)
            setCopiedMap((prev) => ({ ...prev, [walletId]: true }))
            setTimeout(() => {
                setCopiedMap((prev) => ({ ...prev, [walletId]: false }))
            }, 1500)
        } catch (err) {
            console.error('Failed to copy address:', err)
        }
    }

    return (
        <>
            <div className="lg:w-[70%] mx-auto space-y-4 font-inter p-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg">
                {!showStatus ? (
                    <>
                        <h2 className="text-lg font-bold mb-4">Deposit Form</h2>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 items-center gap-2">
                            <label className="col-span-1 text-base font-semibold">
                                Currency
                                {isLoadingRates && (
                                    <span className="text-xs text-blue-500 ml-2">
                                        (Loading rates...)
                                    </span>
                                )}
                            </label>
                            <Dropdown
                                title={
                                    selectedCurrency
                                        ? `${selectedCurrency.fullName} (${selectedCurrency.shortName})`
                                        : 'Select Currency'
                                }
                                trigger="click"
                                placement="bottom-start"
                                toggleClassName="border border-gray-400 rounded-lg w-full"
                                disabled={isLoadingRates}
                            >
                                {currencies.map((currency) => (
                                    <DropdownItem
                                        key={currency.id}
                                        className="text-center w-full"
                                        eventKey={currency.id.toString()}
                                        onSelect={handleCurrencySelect}
                                    >
                                        {currency.fullName} (
                                        {currency.shortName})
                                        {currency.rate > 0 && (
                                            <span className="text-xs text-gray-500">
                                                - $
                                                {currency.rate.toLocaleString()}
                                            </span>
                                        )}
                                    </DropdownItem>
                                ))}
                            </Dropdown>
                        </div>

                        <div className="grid grid-cols-2 items-center gap-2">
                            <label className="col-span-1 text-base font-semibold">
                                Amount (USD)
                            </label>
                            <Input
                                placeholder="0.00"
                                className="w-full"
                                type="number"
                                min="0"
                                step="0.01"
                                value={usdAmount}
                                onChange={handleUsdAmountChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 items-center gap-2">
                            <label className="col-span-1 text-base font-semibold">
                                Amount Crypto
                                {conversionLoading && (
                                    <span className="text-xs text-blue-500 ml-2">
                                        (Converting...)
                                    </span>
                                )}
                            </label>
                            <Input
                                placeholder="0.00000000"
                                className="w-full"
                                value={cryptoAmount}
                                readOnly
                            />
                        </div>

                        {selectedCurrency &&
                            selectedCurrency.rate &&
                            selectedCurrency.rate > 0 && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Rate: 1 {selectedCurrency.shortName} = $
                                    {selectedCurrency.rate.toLocaleString()}
                                </div>
                            )}

                        <Button
                            size="sm"
                            onClick={handleDeposit}
                            variant="solid"
                            className="rounded-lg w-full"
                            disabled={
                                loading ||
                                !selectedCurrency ||
                                !usdAmount ||
                                conversionLoading
                            }
                        >
                            {loading ? 'Processing...' : 'Deposit'}
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="flex flex-row gap-6">
                            <div className="w-[30%]">
                                <div className="text-lg font-semibold pb-2">
                                    {selectedCurrency?.shortName || 'Crypto'}{' '}
                                    Address
                                </div>

                                <img
                                    src={`https://server.bexchange.io${walletData?.qrImage}`}
                                    width={300}
                                    height={300}
                                    alt="crypto address qr code"
                                />
                            </div>
                            <div className="w-full">
                                <h2 className="text-lg font-bold">
                                    Deposit Details
                                </h2>
                                <hr className="my-4 border-2 border-primary" />
                                <div className="grid grid-cols-[150px_1fr] gap-y-3 text-sm">
                                    <div className="text-xs font-semibold">
                                        {walletData?.name}:
                                    </div>
                                    <code
                                        onClick={() =>
                                            handleCopy(
                                                walletData?.id,
                                                walletData?.address,
                                            )
                                        }
                                        className="dark:bg-lime-700/30 flex justify-between items-center p-1 rounded-lg text-xs text-gray-600 break-words dark:text-white cursor-pointer hover:text-blue-600 transition"
                                        title="Click to copy"
                                    >
                                        <span>{walletData?.address}</span>

                                        <div
                                            onClick={() =>
                                                handleCopy(
                                                    walletData?.id,
                                                    walletData?.address,
                                                )
                                            }
                                            className="ml-2 flex items-center text-lg"
                                        >
                                            {copiedMap[walletData?.id] ? (
                                                <span className="text-green-500 text-xs font-semibold animate-pulse">
                                                    Copied!
                                                </span>
                                            ) : (
                                                <IoCopyOutline className="hover:text-green-600 transition" />
                                            )}
                                        </div>
                                    </code>

                                    <div className="text-xs font-semibold">
                                        AMOUNT IN ASSET:
                                    </div>
                                    <div>
                                        {cryptoAmount}{' '}
                                        {selectedCurrency?.shortName}
                                    </div>

                                    <div className="text-xs font-semibold">
                                        AMOUNT IN USD:
                                    </div>
                                    <div>${usdAmount}</div>

                                    <div className="text-xs font-semibold">
                                        FEE:
                                    </div>
                                    <div>0%</div>

                                    <div className="text-xs font-semibold">
                                        STATUS:
                                    </div>
                                    <div>
                                        <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
                                            Pending
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full mt-4 bg-primary rounded-lg"
                                    size="sm"
                                    variant="solid"
                                    onClick={handleConfirmPaid}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Confirm Paid'}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className=" p-6 mt-10 shadow-sm bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Recent Transactions</h2>
                    <div className="w-64">
                        <Input
                            placeholder="Search transactions..."
                            value={search}
                            size="sm"
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

                <div ref={tableRef}>
                    <DataTable
                        data={paginatedData}
                        columns={columns}
                        selectable={false}
                        loading={dataLoading}
                        pagingData={{
                            total: totalCount,
                            pageIndex,
                            pageSize,
                        }}
                        noData={!dataLoading && filteredData?.length === 0}
                        onPaginationChange={handlePageChange}
                        onSelectChange={handlePageSizeChange}
                        onSort={handleSort}
                    />
                </div>
            </div>

            {showModal && (
                <Dialog onClose={handleModalClose} isOpen width={400}>
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 p-2 flex items-center justify-center mx-auto mb-3.5">
                            <svg
                                aria-hidden="true"
                                className="w-12 h-12 text-green-500 dark:text-green-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="sr-only">Success</span>
                        </div>
                        <div className="text-center font-semibold text-xl">
                            Your payment is being processed.
                        </div>
                        <div className="text-center text-sm text-gray-600">
                            We will notify you once the transaction is
                            confirmed.
                        </div>
                        <div className="flex items-center justify-center">
                            <Button
                                onClick={handleModalClose}
                                size="sm"
                                variant="solid"
                                className="px-6 rounded-lg"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </Dialog>
            )}
        </>
    )
}

export default Page
