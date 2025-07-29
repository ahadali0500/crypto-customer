'use client';
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/shared/DataTable';
import Tabs from '@/components/ui/Tabs';
import TabList from '@/components/ui/Tabs/TabList';
import TabNav from '@/components/ui/Tabs/TabNav';
import TabContent from '@/components/ui/Tabs/TabContent';
import { Spinner } from '@/components/ui';
import axios from 'axios';

// Type definitions
interface BalanceData {
  today: number;
  week: number;
  month: number;
  total: number;
}

const statusColorMap: Record<string, string> = {
  Pending: 'bg-gray-300 text-gray-800',
  Processing: 'bg-yellow-300 text-yellow-900',
  Execute: 'bg-green-300 text-green-900',
  Decline: 'bg-red-300 text-red-900',
}

interface CardData {
  totalBalanceUSD: number;
  lockedBalanceUSD: number;
  availableBalanceUSD: number;
  data: BalanceItem[];
}

interface TicketData {
  id: number;
  subject: string;
  customerId: number;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface DepositData {
  id: number;
  customerId: number;
  type: string;
  currencyId: number;
  amount: string;
  total?: string;
  fees?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  customer?: any;
  currency?: any;
}

interface BalanceItem {
  id: number;
  customerId: number;
  currencyId: number;
  availableBalance: string;
  lockedBalance: string;
  availableBalanceUSD: number;
  lockedBalanceUSD: number;
  currency: {
    id: number;
    shortName: string;
    fullName: string;
    icon: string;
    type: string;
  };
}

interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  sparkline_in_7d: { price: number[] };
}

const coinIds = ['bitcoin', 'ethereum', 'dogecoin', 'cardano', 'tether'];

interface WithdrawData {
  id: number;
  withdrawType: string;
  balancetype: string;
  currencyId: number;
  amount: string;
  total?: string;
  customerId: number;
  FeesType?: string;
  feesBundleId?: number;
  fees?: string;
  withdrawStatus?: string;
  createdAt: string;
  updatedAt: string;
  customer?: any;
  currency?: any;
}

interface DashboardData {
  balanceInUSD: BalanceData;
  depositInUSD: BalanceData;
  ticket: TicketData[];
  deposit: DepositData[];
  withdraw: WithdrawData[];
}

interface OnSortParam {
  key: string;
  order: 'asc' | 'desc' | '';
}

interface PaginationState {
  tickets: { pageIndex: number; pageSize: number; sortBy?: string; sortOrder?: 'asc' | 'desc' };
  deposits: { pageIndex: number; pageSize: number; sortBy?: string; sortOrder?: 'asc' | 'desc' };
  withdrawals: { pageIndex: number; pageSize: number; sortBy?: string; sortOrder?: 'asc' | 'desc' };
}

// Modal component for showing details
const DetailsModal = ({ isOpen, onClose, data, type }) => {
  if (!isOpen || !data) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount) => {
    return parseFloat(amount).toFixed(6);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {type === 'ticket' && 'Support Ticket Details'}
            {type === 'deposit' && 'Deposit Details'}
            {type === 'withdrawal' && 'Withdrawal Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            {type === 'ticket' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">#{data.id}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</label>
                  <p className="text-sm text-gray-900 dark:text-white">{data.subject}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className={`text-base font-medium ${data.type === 'Pending' ? 'text-red-500' : 'text-green-500'}`}>
                    {data.type}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer ID</label>
                  <p className="text-sm text-gray-900 dark:text-white">{data.customerId}</p>
                </div>

                {data.priority && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</label>
                    <p className="text-sm text-gray-900 dark:text-white">{data.priority}</p>
                  </div>
                )}

                {data.department && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</label>
                    <p className="text-sm text-gray-900 dark:text-white">{data.department}</p>
                  </div>
                )}

                {data.createdAt && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                    <p className="text-sm text-gray-900 dark:text-white">{data.createdAt}</p>
                  </div>
                )}

                {data.updatedAt && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</label>
                    <p className="text-sm text-gray-900 dark:text-white">{data.updatedAt}</p>
                  </div>
                )}
              </>
            )}

            {(type === 'deposit' || type === 'withdrawal') && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction ID</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">#{data.id}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {type === 'deposit' ? data.type : data.withdrawType}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                  <p className={`text-xl font-bold ${type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                    ${formatAmount(data.amount)}
                  </p>
                </div>

                {data.total && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</label>
                    <p className="text-sm text-gray-900 dark:text-white">${formatAmount(data.total)}</p>
                  </div>
                )}

                {data.fees && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fees</label>
                    <p className="text-sm text-gray-900 dark:text-white">${formatAmount(data.fees)}</p>
                  </div>
                )}

                {data.status && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <p className={`text-base font-medium ${data.status === 'Pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {data.status}
                    </p>
                  </div>
                )}

                {type === 'withdrawal' && data.balancetype && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance Type</label>
                    <p className="text-sm text-gray-900 dark:text-white">{data.balancetype}</p>
                  </div>
                )}

                {data.method && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Method</label>
                    <p className="text-sm text-gray-900 dark:text-white">{data.method}</p>
                  </div>
                )}

                {data.reference && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference</label>
                    <p className="text-sm text-gray-900 dark:text-white">{data.reference}</p>
                  </div>
                )}

                {data.createdAt && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                    <p className="text-sm text-gray-900 dark:text-white">{data.createdAt}</p>
                  </div>
                )}

                {data.processedAt && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Processed At</label>
                    <p className="text-sm text-gray-900 dark:text-white">{data.processedAt}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Description/Message */}
          {data.message && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {type === 'ticket' ? 'Message' : 'Description'}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{data.message}</p>
              </div>
            </div>
          )}

          {/* Customer Details */}
          {data.customer && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-gray-900 dark:text-white">{data.customer.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white">{data.customer.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-gray-900 dark:text-white">{data.customer.phone}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Country</label>
                  <p className="text-gray-900 dark:text-white">{data.customer.country}</p>
                </div>
                {data.customer.address && (
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                    <p className="text-gray-900 dark:text-white">{data.customer.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Currency Details */}
          {data.currency && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Currency Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Currency</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900 dark:text-white font-medium">{data.currency.shortName}</span>
                    <span className="text-gray-500 dark:text-gray-400">({data.currency.fullName})</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                  <p className="text-gray-900 dark:text-white">{data.currency.type}</p>
                </div>
                {data.currency.rate && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Exchange Rate</label>
                    <p className="text-gray-900 dark:text-white">{data.currency.rate}</p>
                  </div>
                )}
                {data.currency.symbol && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Symbol</label>
                    <p className="text-gray-900 dark:text-white">{data.currency.symbol}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    tickets: { pageIndex: 1, pageSize: 10 },
    deposits: { pageIndex: 1, pageSize: 10 },
    withdrawals: { pageIndex: 1, pageSize: 10 }
  });

  const handleItemClick = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setModalType('');
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      if (!token) {
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const [cardData, setCardData] = useState<CardData>();

  const fetchDasboard = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      if (!token) {
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      setCardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setCardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchDasboard();
  }, []);

  console.log('setCardData', cardData);
  console.log('setData', data);

  // Helper function to sort data
  const sortData = (data: any[], sortBy: string, sortOrder: 'asc' | 'desc') => {
    if (!sortBy) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  // Helper function to paginate data
  const paginateData = (data: any[], pageIndex: number, pageSize: number) => {
    const startIndex = (pageIndex - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };

  // Get processed data for current tab
  const getProcessedData = (tabKey: keyof PaginationState) => {
    if (!data) return { paginatedData: [], total: 0 };

    let rawData: any[] = [];
    switch (tabKey) {
      case 'tickets':
        rawData = data.ticket || [];
        break;
      case 'deposits':
        rawData = data.deposit || [];
        break;
      case 'withdrawals':
        rawData = data.withdraw || [];
        break;
    }

    const { sortBy, sortOrder, pageIndex, pageSize } = pagination[tabKey];

    // Sort data if needed
    const sortedData = sortBy && sortOrder ? sortData(rawData, sortBy, sortOrder) : rawData;

    // Paginate data
    const paginatedData = paginateData(sortedData, pageIndex, pageSize);

    return {
      paginatedData,
      total: rawData.length
    };
  };

  // Handle pagination change
  const handlePaginationChange = (tabKey: keyof PaginationState, page: number) => {
    setPagination(prev => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        pageIndex: page
      }
    }));
  };

  // Handle page size change
  const handlePageSizeChange = (tabKey: keyof PaginationState, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        pageSize,
        pageIndex: 1 // Reset to first page
      }
    }));
  };

  // Handle sorting
  const handleSort = (tabKey: keyof PaginationState, { key, order }: { key: string; order: 'asc' | 'desc' | '' }) => {
    setPagination(prev => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        sortBy: order ? key : undefined,
        sortOrder: order || undefined,
        pageIndex: 1 // Reset to first page when sorting
      }
    }));
  };

  // Column definitions for Tickets
  const ticketColumns = [
    {
      accessorKey: 'id',
      header: 'Ticket ID',
      cell: ({ row }) => (
        <button
          onClick={() => handleItemClick(row.original, 'ticket')}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
        >
          #{row.getValue('id')}
        </button>
      ),
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate block">{row.getValue('subject')}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.getValue('type') === 'Pending'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-green-100 text-green-800'
          }`}>
          {row.getValue('type')}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => (
        <span className="">
          {new Date(row.getValue('createdAt')).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Column definitions for Deposits
  const depositColumns = [
    {
      accessorKey: 'id',
      header: 'Deposit ID',
      cell: ({ row }) => (
        <button
          onClick={() => handleItemClick(row.original, 'deposit')}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
        >
          #{row.getValue('id')}
        </button>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue, row }) => {
        const value = getValue() as string
        const color = statusColorMap[value] || 'bg-gray-100 text-gray-800'
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 ${color}`}
          >
            {value}
          </span>
        )
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
          {row.getValue('type')}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-medium text-green-600">
          ${parseFloat(row.getValue('amount')).toFixed(6)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="">
          {new Date(row.getValue('createdAt')).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Column definitions for Withdrawals
  const withdrawColumns = [
    {
      accessorKey: 'id',
      header: 'Withdrawal ID',
      cell: ({ row }) => (
        <button
          onClick={() => handleItemClick(row.original, 'withdrawal')}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
        >
          #{row.getValue('id')}
        </button>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'withdrawStatus',
      cell: ({ getValue, row }) => {
        const value = getValue() as string
        const color = statusColorMap[value] || 'bg-gray-100 text-gray-800'
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 ${color}`}
          >
            {value}
          </span>
        )
      },
    },
    {
      accessorKey: 'withdrawType',
      header: 'Type',
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
          {row.getValue('withdrawType')}
        </span>
      ),
    },
    {
      accessorKey: 'balancetype',
      header: 'Balance Type',
      cell: ({ row }) => (
        <span className="">{row.getValue('balancetype')}</span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-medium text-red-600">
          ${parseFloat(row.getValue('amount')).toFixed(6)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="">
          {new Date(row.getValue('createdAt')).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'tickets',
      label: 'Support Tickets',
      count: data?.ticket?.length || 0,
      content: (
        <div className="overflow-x-auto">
          <DataTable
            columns={ticketColumns}
            data={getProcessedData('tickets').paginatedData}
            loading={loading}
            noData={!data?.ticket?.length}
            pagingData={{
              total: getProcessedData('tickets').total,
              pageIndex: pagination.tickets.pageIndex,
              pageSize: pagination.tickets.pageSize,
            }}
            onPaginationChange={(page) => handlePaginationChange('tickets', page)}
            onSelectChange={(pageSize) => handlePageSizeChange('tickets', pageSize)}
            onSort={(sortParams: OnSortParam) => handleSort('tickets', sortParams)}
          />
        </div>
      )
    },
    {
      key: 'deposits',
      label: 'Deposits',
      count: data?.deposit?.length || 0,
      content: (
        <div className="overflow-x-auto">
          <DataTable
            columns={depositColumns}
            data={getProcessedData('deposits').paginatedData}
            loading={loading}
            noData={!data?.deposit?.length}
            pagingData={{
              total: getProcessedData('deposits').total,
              pageIndex: pagination.deposits.pageIndex,
              pageSize: pagination.deposits.pageSize,
            }}
            onPaginationChange={(page) => handlePaginationChange('deposits', page)}
            onSelectChange={(pageSize) => handlePageSizeChange('deposits', pageSize)}
            onSort={(sortParams: OnSortParam) => handleSort('deposits', sortParams)}
          />
        </div>
      )
    },
    {
      key: 'withdrawals',
      label: 'Withdrawals',
      count: data?.withdraw?.length || 0,
      content: (
        <div className="overflow-x-auto">
          <DataTable
            columns={withdrawColumns}
            data={getProcessedData('withdrawals').paginatedData}
            loading={loading}
            noData={!data?.withdraw?.length}
            pagingData={{
              total: getProcessedData('withdrawals').total,
              pageIndex: pagination.withdrawals.pageIndex,
              pageSize: pagination.withdrawals.pageSize,
            }}
            onPaginationChange={(page) => handlePaginationChange('withdrawals', page)}
            onSelectChange={(pageSize) => handlePageSizeChange('withdrawals', pageSize)}
            onSort={(sortParams: OnSortParam) => handleSort('withdrawals', sortParams)}
          />
        </div>
      )
    }
  ];

  return (
    <>
      <div className="">
        {/* Tabs Section */}
        <div className="p-6 mt-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg">
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            className=""
          >
            <TabList>
              {tabItems.map((item) => (
                <TabNav key={item.key} value={item.key}>
                  {item.label}
                  {item.count > 0 && (
                    <span className="ml-1">({item.count})</span>
                  )}
                </TabNav>
              ))}
            </TabList>

            <div className="mt-4">
              {tabItems.map((item) => (
                <TabContent key={item.key} value={item.key}>
                  {item.content}
                </TabContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>

      {/* Details Modal */}
      <DetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={selectedItem}
        type={modalType}
      />

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
          <Spinner size={40} />
        </div>
      )}
    </>
  );
};

export default Page;