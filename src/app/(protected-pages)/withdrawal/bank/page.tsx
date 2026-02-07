'use client'

import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import Tabs from '@/components/ui/Tabs/Tabs'
import { Button, Dropdown, Select, Spinner } from '@/components/ui'
import { Input } from '@/components/ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import TabContent from '@/components/ui/Tabs/TabContent'
import { countriesOption } from '@/constants/countries'
import DropdownItem from '@/components/ui/Dropdown/DropdownItem'
import { toast } from 'react-toastify'
import DataTable, { ColumnDef, OnSortParam } from '@/components/shared/DataTable'

interface FormData {
    currencyId: string
    amount: string
    feeType: 'Default' | 'High'
    country: string
    canton: string
    address: string
    postalCode: string
    city: string
    phone: string
    accountHolder: string
    bank: string
    billingCity: string
    accountNumber: string
    iban: string
    swiftCode: string
    paymentReferenceNumber: string
}

interface Currency {
    id: string
    currencyId?: string
    shortName: string
    fullName: string
    availableBalance: string
    lockedBalance: string
}

interface FeeBundle {
    id?: string
    category: string
    description: string
    value: string
    name: string
    descrption?: string
}

type Withdrawal = {
    id: number
    withdrawType: 'Bank' | 'fiatCurrencies'
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
    withdrawfiatCurrencies?: Array<{
        walletAddress: string
        network: string
    }>
}

interface UserDetails {
    withdrawFees?: string | null
}

const INITIAL_FORM_DATA: FormData = {
    currencyId: '',
    amount: '',
    feeType: 'Default',
    country: '',
    canton: '',
    address: '',
    postalCode: '',
    city: '',
    phone: '',
    accountHolder: '',
    bank: '',
    billingCity: '',
    accountNumber: '',
    iban: '',
    swiftCode: '',
    paymentReferenceNumber: '',
}

const BankTransferForm = () => {
    const [activeTab, setActiveTab] = useState('currency')
    const [balanceType, setBalanceType] = useState('Available')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
    const [errors, setErrors] = useState<Partial<FormData>>({})
    const [success, setSuccess] = useState<{
        amount: number
        currency: string
        fee: number
    } | null>(null)
    const [formLocked, setFormLocked] = useState(false)

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    const [fiatCurrencies, setFiatCurrencies] = useState<Currency[]>([])
    const [selectedWithdrawCurrency, setSelectedWithdrawCurrency] = useState<Currency | null>(null)
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
    const [bundleDetails, setBundleDetails] = useState<FeeBundle[]>([])
    const [selectedFeeBundle, setSelectedFeeBundle] = useState<FeeBundle | null>(null)

    const shouldShowBundleForWithdraw = userDetails?.withdrawFees === null || userDetails?.withdrawFees === undefined

    const bankBundles = useMemo(() => {
        return bundleDetails.filter((bundle) => bundle.category === 'Bank')
    }, [bundleDetails])

    const updateFormData = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const resetFormCompletely = () => {
        setFormData({ ...INITIAL_FORM_DATA })
        setErrors({})
        setSelectedFeeBundle(null)
        setSelectedWithdrawCurrency(null)
        setSuccess(null)
    }

    const validateCurrentTab = () => {
        const newErrors: Partial<FormData> = {}

        if (activeTab === 'currency') {
            if (!formData.amount) {
                newErrors.amount = 'Amount is required'
            } else if (selectedWithdrawCurrency) {
                const balance = parseFloat(selectedWithdrawCurrency.availableBalance)
                const amount = parseFloat(formData.amount)

                if (amount > balance) {
                    newErrors.amount = `Amount cannot exceed available balance. Available: ${balance.toFixed(2)} ${selectedWithdrawCurrency.shortName}`
                    setErrors(newErrors)
                    return false
                }

                if (amountFiat > availableFiat) {
                    newErrors.amount = `Amount exceeds available balance. Available: ${availableFiat.toFixed(2)} ${selectedWithdrawCurrency.shortName}`
                    setErrors(newErrors)
                    return false
                }
            }
            if (!formData.currencyId) {
                newErrors.currencyId = 'Currency is required'
            }
            if (shouldShowBundleForWithdraw && !selectedFeeBundle) {
                toast.error('Please select a fee bundle')
                return false
            }
        } else if (activeTab === 'contacts') {
            if (!formData.country) newErrors.country = 'Country is required'
            if (!formData.canton) newErrors.canton = 'Canton is required'
            if (!formData.address) newErrors.address = 'Address is required'
            if (!formData.postalCode) newErrors.postalCode = 'Postal code is required'
            if (!formData.city) newErrors.city = 'City is required'
            if (!formData.phone) newErrors.phone = 'Phone is required'
        } else if (activeTab === 'billing') {
            if (!formData.accountHolder) newErrors.accountHolder = 'Account holder is required'
            if (!formData.bank) newErrors.bank = 'Bank is required'
            if (!formData.billingCity) newErrors.billingCity = 'City is required'
            if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required'
            if (!formData.iban) newErrors.iban = 'IBAN is required'
            if (!formData.swiftCode) newErrors.swiftCode = 'Swift code is required'
            if (!formData.paymentReferenceNumber) newErrors.paymentReferenceNumber = 'Payment reference is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const fetchUserDetails = async () => {
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/fetch`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            setUserDetails(res.data.data)
        } catch (error) {
            console.log('Error fetching user details:', error)
        }
    }

    const fetchBundleDetails = async () => {
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/fees/bundle/fetch?category=Bank`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            const bundleData = res.data.data
            setBundleDetails(Array.isArray(bundleData) ? bundleData : bundleData ? [bundleData] : [])
        } catch (error) {
            console.log('Error fetching bundle details:', error)
            setBundleDetails([])
        }
    }

    const feePercent = useMemo(() => {
        if (shouldShowBundleForWithdraw && selectedFeeBundle)
            return parseFloat(selectedFeeBundle.value || '0')
        if (!shouldShowBundleForWithdraw && userDetails?.withdrawFees)
            return parseFloat(userDetails.withdrawFees || '0')
        return 0
    }, [shouldShowBundleForWithdraw, selectedFeeBundle, userDetails])

    const amountFiat = useMemo(
        () => parseFloat(formData.amount || '0') || 0,
        [formData.amount],
    )

    const availableFiat = useMemo(() => {
        if (!selectedWithdrawCurrency) return 0
        return parseFloat(selectedWithdrawCurrency.availableBalance || '0') || 0
    }, [selectedWithdrawCurrency])

    const feeFiat = useMemo(
        () => amountFiat * (feePercent / 100),
        [amountFiat, feePercent],
    )

    const netAmountFiat = useMemo(
        () => Math.max(amountFiat - feeFiat, 0),
        [amountFiat, feeFiat]
    )

    const totalDeductedFiat = useMemo(
        () => amountFiat,
        [amountFiat]
    )

    const remainingAfterSubmit = useMemo(() => {
        return Math.max(availableFiat - amountFiat, 0)
    }, [availableFiat, amountFiat])

    const isCurrencyStepValid = useMemo(() => {
        if (!formData.currencyId) return false
        if (!formData.amount || amountFiat <= 0) return false
        if (shouldShowBundleForWithdraw && !selectedFeeBundle) return false
        if (!selectedWithdrawCurrency) return false
        if (amountFiat > availableFiat) return false
        return true
    }, [
        formData.currencyId,
        formData.amount,
        amountFiat,
        shouldShowBundleForWithdraw,
        selectedFeeBundle,
        selectedWithdrawCurrency,
        availableFiat,
    ])

    const isContactsStepValid = useMemo(() => {
        return !!(
            formData.country &&
            formData.canton &&
            formData.address &&
            formData.postalCode &&
            formData.city &&
            formData.phone
        )
    }, [formData])

    const [stepWarning, setStepWarning] = useState('')

    const goToContacts = () => {
        if (!isCurrencyStepValid) {
            setStepWarning('Complete previous step to continue.')
            return
        }
        setStepWarning('')
        setActiveTab('contacts')
    }

    const goToBilling = () => {
        if (!isCurrencyStepValid) {
            setStepWarning('Complete previous step to continue.')
            return
        }
        if (!isContactsStepValid) {
            setStepWarning('Complete previous step to continue.')
            return
        }
        setStepWarning('')
        setActiveTab('billing')
    }

    const handleNext = () => {
        if (!validateCurrentTab()) return
        if (activeTab === 'currency') {
            setActiveTab('contacts')
        } else if (activeTab === 'contacts') {
            setActiveTab('billing')
        }
    }

    const handlePrevious = () => {
        if (activeTab === 'contacts') {
            setActiveTab('currency')
        } else if (activeTab === 'billing') {
            setActiveTab('contacts')
        }
    }

    const handleSetMaxAmount = () => {
        updateFormData('amount', availableFiat.toString())
        setErrors((prev) => ({ ...prev, amount: undefined }))
    }

    const handleSubmit = async () => {
        if (!validateCurrentTab()) return

        setIsSubmitting(true)

        try {
            // DEBUG: Log submission data
            console.log('=== WITHDRAWAL SUBMISSION ===')
            console.log('Entered amount:', formData.amount)
            console.log('Calculated net (user receives):', netAmountFiat.toFixed(2))
            console.log('Fee:', feeFiat.toFixed(2))
            console.log('Total deducted:', amountFiat.toFixed(2))
            console.log('==============================')

            const submitData = new FormData()

            submitData.append('balancetype', balanceType)
            submitData.append('currencyId', formData.currencyId)
            submitData.append('amount', netAmountFiat.toString())
            submitData.append('total', amountFiat.toString())
            submitData.append('feeAmount', feeFiat.toFixed(2))

            if (shouldShowBundleForWithdraw && selectedFeeBundle) {
                submitData.append('FeesType', 'Package')
                submitData.append('feesBundleId', selectedFeeBundle.id || '')
                submitData.append('fees', selectedFeeBundle.value)
            } else {
                submitData.append('FeesType', 'Default')
                submitData.append('fees', userDetails?.withdrawFees || '0')
            }

            submitData.append('country', formData.country)
            submitData.append('canton', formData.canton)
            submitData.append('address', formData.address)
            submitData.append('postalCode', formData.postalCode)
            submitData.append('city', formData.city)
            submitData.append('phone', formData.phone)
            submitData.append('accountHolder', formData.accountHolder)
            submitData.append('Bank', formData.bank)
            submitData.append('billingCity', formData.billingCity)
            submitData.append('accountNumber', formData.accountNumber)
            submitData.append('IBAN', formData.iban)
            submitData.append('swiftCode', formData.swiftCode)
            submitData.append('paymentReferenceNumber', formData.paymentReferenceNumber)

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/withdraw/bank/create`,
                submitData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            console.log('Backend Response:', response.data)

            setSuccess({
                amount: netAmountFiat,
                currency: selectedWithdrawCurrency?.shortName || '',
                fee: feeFiat,
            })

            setFormLocked(true)
            setActiveTab('currency')

            // CRITICAL: Reset everything completely
            resetFormCompletely()

            // Refresh balances
            setTimeout(() => {
                fetchfiatCurrencies()
                fetchUserDetails()
                fetchBundleDetails()
            }, 500)
        } catch (error) {
            console.error('Error submitting form:', error)
            toast.error('Error submitting form. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const fetchfiatCurrencies = async () => {
        try {
            const fiatCurrenciesRes = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/currency/user/fetch?type=Fiat`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )

            setFiatCurrencies(fiatCurrenciesRes.data.data || [])

            if (fiatCurrenciesRes.data.data && fiatCurrenciesRes.data.data.length > 0) {
                const first = fiatCurrenciesRes.data.data[0]
                setSelectedWithdrawCurrency(first)
                updateFormData('currencyId', (first.id ?? first.currencyId ?? '').toString())
            }
        } catch (error) {
            console.log('Error fetching currencies:', error)
        }
    }

    useEffect(() => {
        if (token) {
            fetchUserDetails()
            fetchBundleDetails()
            fetchfiatCurrencies()
        }
    }, [token])

    const handleBalanceTypeChange = (value: string) => {
        setBalanceType(value)
    }

    const getCurrencyKey = (currency: Currency): string => {
        return currency.currencyId?.toString() || currency.id || currency.shortName
    }

    const handleWithdrawCurrencySelect = (key: string) => {
        const selected = fiatCurrencies.find(
            (c) =>
                (c.currencyId && c.currencyId.toString() === key) ||
                (c.id && c.id === key) ||
                c.shortName === key ||
                c.fullName === key,
        )

        if (!selected) return

        setSelectedWithdrawCurrency(selected)
        updateFormData('currencyId', (selected.id ?? selected.currencyId ?? '').toString())
        updateFormData('amount', '')
        setErrors({})
    }

    const handleFeeBundleSelect = (bundle: FeeBundle) => {
        setSelectedFeeBundle(bundle)
    }

    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [loading, setLoading] = useState(false)
    const [tableLoading, setTableLoading] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [sortConfig, setSortConfig] = useState<{
        key: string
        order: 'asc' | 'desc' | ''
    }>({
        key: '',
        order: '',
    })

    const fetchWithdrawalHistory = async () => {
        setTableLoading(true)
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/withdraw/fetch?withdrawType=Bank`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            setWithdrawals(res.data.data || [])
        } catch (error) {
            console.error('Error fetching withdrawal data', error)
        } finally {
            setLoading(false)
            setTableLoading(false)
        }
    }

    const statusColorMap: Record<string, string> = {
        Pending: 'bg-yellow-500 text-white',
        Completed: 'bg-green-500 text-white',
        Rejected: 'bg-red-500 text-white',
        Execute: 'bg-blue-500 text-white',
        Decline: 'bg-red-500 text-white',
    }

    const typeColorMap: Record<string, string> = {
        Bank: 'bg-blue-500 text-white',
        fiatCurrencies: 'bg-purple-500 text-white',
    }

    const sortedData = useMemo(() => {
        if (!sortConfig.key || sortConfig.order === '') return withdrawals
        
        const direction = sortConfig.order === 'asc' ? 1 : -1
        return [...withdrawals].sort((a, b) => {
            const A = (a as any)[sortConfig.key]
            const B = (b as any)[sortConfig.key]

            if (sortConfig.key === 'createdAt') {
                return (new Date(A).getTime() - new Date(B).getTime()) * direction
            }

            if (['amount', 'fees', 'total'].includes(sortConfig.key)) {
                const numA = parseFloat(String(A).replace(/[^0-9.-]+/g, ''))
                const numB = parseFloat(String(B).replace(/[^0-9.-]+/g, ''))
                return (numA - numB) * direction
            }

            if (typeof A === 'number' && typeof B === 'number') {
                return (A - B) * direction
            }

            return String(A).localeCompare(String(B)) * direction
        })
    }, [withdrawals, sortConfig])

    const currentPageData = useMemo(() => {
        const start = (pageIndex - 1) * pageSize
        const end = start + pageSize
        return sortedData.slice(start, end)
    }, [sortedData, pageIndex, pageSize])

    const totalCount = sortedData.length

    const handleSort = (sort: OnSortParam) => {
        setSortConfig({ key: String(sort.key), order: sort.order })
        setPageIndex(1)
    }

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
                <span>
                    {row.original.amount} {row.original.currency?.shortName}
                </span>
            ),
        },
        {
            header: 'Fees',
            accessorKey: 'fees',
            cell: ({ row }) => (
                <span className="text-red-500">
                    -{row.original.fees} {row.original.currency?.shortName}
                </span>
            ),
        },
        {
            header: 'Total',
            accessorKey: 'total',
            cell: ({ row }) => (
                <span className="font-semibold">
                    {row.original.total} {row.original.currency?.shortName}
                </span>
            ),
        },
        {
            header: 'Type',
            accessorKey: 'withdrawType',
            cell: ({ row }) => {
                const type =
                    row.original.withdrawType ||
                    ((row.original.withdrawBank?.length ?? 0) > 0
                        ? 'Bank'
                        : (row.original.withdrawfiatCurrencies?.length ?? 0) > 0
                            ? 'fiatCurrencies'
                            : 'Unknown')
                return (
                    <span
                        className={`px-2 py-1 rounded text-xs ${typeColorMap[type] || 'bg-gray-500 text-white'}`}
                    >
                        {type}
                    </span>
                )
            },
        },
        {
            header: 'Status',
            accessorKey: 'withdrawStatus',
            cell: ({ row }) => (
                <span
                    className={`px-2 py-1 rounded text-xs ${statusColorMap[row.original.withdrawStatus] || 'bg-gray-500'}`}
                >
                    {row.original.withdrawStatus}
                </span>
            ),
        },
    ]

    return (
        <>
            <div className="min-h-screen p-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg">
                <Tabs defaultValue="Available" onChange={handleBalanceTypeChange}>
                    <TabList>
                        <TabNav value="Available" className={balanceType === 'Available' ? 'active' : ''}>
                            Available
                        </TabNav>
                    </TabList>

                    {['Available', 'Locked'].map((tab) => (
                        <TabContent
                            key={tab}
                            value={tab}
                            className={balanceType === tab ? 'block' : 'hidden'}
                        >
                            <div className="max-w-4xl mx-auto">
                                <div className="mt-4">
                                    <div className="text-2xl font-semibold mb-2">Bank Transfer</div>
                                    <div className="mb-4">Enter payment information</div>
                                </div>

                                {success && (
                                    <div className="p-4 mb-4 rounded-lg bg-green-100 border border-green-300 text-green-800">
                                        <div className="font-semibold">✅ Successfully submitted your bank withdrawal.</div>
                                        <div className="text-sm mt-1">
                                            You will receive: {success.amount.toFixed(2)} {success.currency}
                                        </div>
                                        <div className="text-sm">
                                            Fee deducted: {success.fee.toFixed(2)} {success.currency}
                                        </div>
                                    </div>
                                )}

                                <div className="flex border-b border-gray-200 mb-4">
                                    <button
                                        onClick={() => setActiveTab('currency')}
                                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                            activeTab === 'currency'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent'
                                        }`}
                                    >
                                        Currency
                                    </button>
                                    <button
                                        onClick={goToContacts}
                                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                            activeTab === 'contacts'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent'
                                        }`}
                                    >
                                        Contacts
                                    </button>
                                    <button
                                        onClick={goToBilling}
                                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                            activeTab === 'billing'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent'
                                        }`}
                                    >
                                        Billing info
                                    </button>
                                </div>

                                {stepWarning && (
                                    <div className="text-sm text-red-500 mt-2">{stepWarning}</div>
                                )}

                                {/* Currency Tab */}
                                {activeTab === 'currency' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Currency</label>
                                            <Dropdown
                                                title={
                                                    selectedWithdrawCurrency
                                                        ? `${selectedWithdrawCurrency.shortName} - ${selectedWithdrawCurrency.fullName}`
                                                        : 'Select FIAT Currency'
                                                }
                                                trigger="click"
                                                placement="bottom-start"
                                                toggleClassName="border border-gray-400 rounded-lg w-full"
                                                menuClass="w-full"
                                            >
                                                {selectedWithdrawCurrency && (
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        Available:{" "}
                                                        <span className="font-semibold">
                                                            {parseFloat(selectedWithdrawCurrency.availableBalance || '0').toFixed(2)}
                                                        </span>{" "}
                                                        {selectedWithdrawCurrency.shortName}
                                                    </div>
                                                )}

                                                {fiatCurrencies.map((currency) => (
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
                                            {errors.currencyId && (
                                                <p className="text-red-500 text-sm mt-1">{errors.currencyId}</p>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-medium">
                                                    Amount ({selectedWithdrawCurrency?.shortName || 'Fiat'})
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    Max: {availableFiat.toFixed(2)} {selectedWithdrawCurrency?.shortName}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    placeholder="Enter amount"
                                                    value={formData.amount}
                                                    size="sm"
                                                    min="0"
                                                    onKeyDown={(e) => {
                                                        if (['-', 'e', 'E', '+'].includes(e.key)) {
                                                            e.preventDefault()
                                                        }
                                                    }}
                                                    onChange={(e: any) => {
                                                        const value = e.target.value
                                                        console.log('User entered amount:', value)
                                                        updateFormData('amount', value)

                                                        const num = parseFloat(value)

                                                        if (!value) {
                                                            setErrors((prev) => ({ ...prev, amount: undefined }))
                                                            return
                                                        }

                                                        if (isNaN(num) || num <= 0) {
                                                            setErrors((prev) => ({
                                                                ...prev,
                                                                amount: 'Please enter a valid amount',
                                                            }))
                                                            return
                                                        }

                                                        if (num > availableFiat) {
                                                            setErrors((prev) => ({
                                                                ...prev,
                                                                amount: `Max amount is ${availableFiat.toFixed(2)} ${selectedWithdrawCurrency?.shortName}`,
                                                            }))
                                                            return
                                                        }

                                                        setErrors((prev) => ({ ...prev, amount: undefined }))
                                                    }}
                                                    className="border border-gray-300 focus:ring-0 dark:bg-gray-800 rounded-lg flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleSetMaxAmount}
                                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    MAX
                                                </button>
                                            </div>
                                            {errors.amount && (
                                                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                                            )}
                                        </div>

                                        {shouldShowBundleForWithdraw && (
                                            <div className="w-full mb-4">
                                                <label className="text-sm mb-2 block">
                                                    Fee Options: <span className="text-red-500">*</span>
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {bankBundles.map((bundle) => {
                                                        const isSelected = selectedFeeBundle?.id === bundle.id

                                                        return (
                                                            <button
                                                                key={bundle.id}
                                                                type="button"
                                                                onClick={() => handleFeeBundleSelect(bundle)}
                                                                className={`p-3 rounded-lg text-left text-sm transition-all ${
                                                                    isSelected
                                                                        ? 'bg-blue-500 text-white border-2 border-blue-600'
                                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                                }`}
                                                            >
                                                                <div className="font-medium">
                                                                    {bundle.name} ({bundle.value}%)
                                                                </div>
                                                                <div className="text-xs mt-1 opacity-80">
                                                                    {bundle.descrption || bundle.description}
                                                                </div>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                                {bankBundles.length === 0 && (
                                                    <div className="mt-2 text-sm text-gray-500">
                                                        No fee bundles available for Bank transfers
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {!shouldShowBundleForWithdraw && userDetails?.withdrawFees && (
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
                                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                                    Your withdrawal fee: {userDetails.withdrawFees}% (Default rate)
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2 pt-4 border-t border-gray-300">
                                            <div className="flex justify-between">
                                                <span>Amount to Withdraw</span>
                                                <span className="font-semibold">
                                                    {amountFiat.toFixed(2)} {selectedWithdrawCurrency?.shortName}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-red-600">
                                                <span>Fee ({feePercent}%)</span>
                                                <span>-{feeFiat.toFixed(2)} {selectedWithdrawCurrency?.shortName}</span>
                                            </div>

                                            <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                                <span className="font-semibold">You Receive</span>
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    {netAmountFiat.toFixed(2)} {selectedWithdrawCurrency?.shortName}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Remaining Balance</span>
                                                <span>
                                                    {remainingAfterSubmit.toFixed(2)} {selectedWithdrawCurrency?.shortName}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="solid"
                                            block
                                            onClick={handleNext}
                                            className="bg-primary rounded-lg text-white py-3 mt-8"
                                            icon={<ChevronRight size={20} />}
                                            iconAlignment="end"
                                            disabled={!isCurrencyStepValid}
                                        >
                                            NEXT
                                        </Button>
                                    </div>
                                )}

                                {/* Contacts Tab */}
                                {activeTab === 'contacts' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Country <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                options={countriesOption}
                                                value={countriesOption.find((option) => option.value === formData.country)}
                                                onChange={(option) => {
                                                    updateFormData('country', option?.value || '')
                                                }}
                                                placeholder="Select Country"
                                                isClearable
                                            />
                                            {errors.country && (
                                                <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Canton <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="Canton"
                                                value={formData.canton}
                                                onChange={(e: any) => updateFormData('canton', e.target.value)}
                                                className="w-full text-gray-300"
                                            />
                                            {errors.canton && (
                                                <p className="text-red-500 text-sm mt-1">{errors.canton}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Address <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="Address"
                                                value={formData.address}
                                                onChange={(e: any) => updateFormData('address', e.target.value)}
                                                className="w-full text-gray-300"
                                            />
                                            {errors.address && (
                                                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Postal/ZIP code <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    placeholder="Postal/ZIP code"
                                                    value={formData.postalCode}
                                                    onChange={(e: any) => updateFormData('postalCode', e.target.value)}
                                                    className="w-full text-gray-300"
                                                />
                                                {errors.postalCode && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    City <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    placeholder="City"
                                                    value={formData.city}
                                                    onChange={(e: any) => updateFormData('city', e.target.value)}
                                                    className="w-full text-gray-300"
                                                />
                                                {errors.city && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <h3 className="text-lg font-medium mb-2">Contact</h3>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Phone <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    placeholder="Enter phone with country code"
                                                    value={formData.phone}
                                                    onChange={(e: any) => updateFormData('phone', e.target.value)}
                                                    className="w-full text-gray-300"
                                                />
                                                {errors.phone && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 mt-8">
                                            <Button
                                                variant="plain"
                                                onClick={handlePrevious}
                                                className="flex-1 bg-orange-500 hover:bg-orange-600 hover:text-white rounded-lg text-white py-3"
                                                icon={<ChevronLeft size={20} />}
                                                iconAlignment="start"
                                            >
                                                PREVIOUS
                                            </Button>
                                            <Button
                                                variant="solid"
                                                onClick={handleNext}
                                                className="flex-1 bg-primary rounded-lg text-white py-3"
                                                icon={<ChevronRight size={20} />}
                                                iconAlignment="end"
                                            >
                                                NEXT
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Billing Info Tab */}
                                {activeTab === 'billing' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Account holder <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="Account holder"
                                                value={formData.accountHolder}
                                                onChange={(e: any) => updateFormData('accountHolder', e.target.value)}
                                                className="w-full text-gray-300"
                                            />
                                            {errors.accountHolder && (
                                                <p className="text-red-500 text-sm mt-1">{errors.accountHolder}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Bank <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="Bank"
                                                value={formData.bank}
                                                onChange={(e: any) => updateFormData('bank', e.target.value)}
                                                className="w-full text-gray-300"
                                            />
                                            {errors.bank && (
                                                <p className="text-red-500 text-sm mt-1">{errors.bank}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                City <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="City"
                                                value={formData.billingCity}
                                                onChange={(e: any) => updateFormData('billingCity', e.target.value)}
                                                className="w-full text-gray-300"
                                            />
                                            {errors.billingCity && (
                                                <p className="text-red-500 text-sm mt-1">{errors.billingCity}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Account number <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="Account number"
                                                value={formData.accountNumber}
                                                onChange={(e: any) => updateFormData('accountNumber', e.target.value)}
                                                className="w-full text-gray-300"
                                            />
                                            {errors.accountNumber && (
                                                <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                IBAN <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="IBAN"
                                                value={formData.iban}
                                                onChange={(e: any) => updateFormData('iban', e.target.value)}
                                                className="w-full text-gray-300"
                                            />
                                            {errors.iban && (
                                                <p className="text-red-500 text-sm mt-1">{errors.iban}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Swift code <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="Swift code"
                                                value={formData.swiftCode}
                                                onChange={(e: any) => updateFormData('swiftCode', e.target.value)}
                                                className="w-full text-gray-300"
                                            />
                                            {errors.swiftCode && (
                                                <p className="text-red-500 text-sm mt-1">{errors.swiftCode}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Payment reference number <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="Payment reference number"
                                                value={formData.paymentReferenceNumber}
                                                onChange={(e: any) => updateFormData('paymentReferenceNumber', e.target.value)}
                                                className="w-full text-gray-300"
                                            />
                                            {errors.paymentReferenceNumber && (
                                                <p className="text-red-500 text-sm mt-1">{errors.paymentReferenceNumber}</p>
                                            )}
                                        </div>

                                        <div className="flex gap-4 mt-4">
                                            <Button
                                                variant="plain"
                                                onClick={handlePrevious}
                                                className="flex-1 bg-orange-500 hover:bg-orange-600 hover:text-white rounded-lg text-white py-3"
                                                icon={<ChevronLeft size={20} />}
                                                iconAlignment="start"
                                            >
                                                PREVIOUS
                                            </Button>
                                            <Button
                                                variant="solid"
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="flex-1 bg-primary rounded-lg text-white py-3 disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabContent>
                    ))}
                </Tabs>
            </div>

            {isSubmitting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
                    <Spinner size={40} />
                </div>
            )}

            <div className="p-6 mt-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-xl font-semibold mb-4">Withdrawal History</div>
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
    )
}

export default BankTransferForm