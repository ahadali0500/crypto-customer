'use client';
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/shared/DataTable';
import Tabs from '@/components/ui/Tabs';
import TabList from '@/components/ui/Tabs/TabList';
import TabNav from '@/components/ui/Tabs/TabNav';
import TabContent from '@/components/ui/Tabs/TabContent';
import { Spinner } from '@/components/ui';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import Graph from '../exchange/Graph';
import CryptoCard from './CryptoCards';
import { motion } from 'framer-motion';
import BalanceCard from './BalanceCard';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Type definitions
interface BalanceData {
  today: number;
  week: number;
  month: number;
  total: number;
}
// Update your CardData interface to include the data array
interface CardData {
  totalBalanceUSD: number;
  lockedBalanceUSD: number;
  availableBalanceUSD: number;
  data: BalanceItem[];
}


interface CardData{
  totalBalanceUSD: number;
  lockedBalanceUSD: number;
  availableBalanceUSD: number
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
  createdAt: string;
  updatedAt: string;
}

// Add this interface for balance data
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
  customerId: number;
  createdAt: string;
  updatedAt: string;
}

interface DashboardData {
  balanceInUSD: BalanceData;
  depositInUSD: BalanceData;
  ticket: TicketData[];
  deposit: DepositData[];
  withdraw: WithdrawData[];
}

interface OnSortParam {
  key: string; // Changed from string | number to just string
  order: 'asc' | 'desc' | '';
}

interface PaginationState {
  tickets: { pageIndex: number; pageSize: number; sortBy?: string; sortOrder?: 'asc' | 'desc' };
  deposits: { pageIndex: number; pageSize: number; sortBy?: string; sortOrder?: 'asc' | 'desc' };
  withdrawals: { pageIndex: number; pageSize: number; sortBy?: string; sortOrder?: 'asc' | 'desc' };
}

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState('tickets');

  const [pagination, setPagination] = useState<PaginationState>({
    tickets: { pageIndex: 1, pageSize: 10 },
    deposits: { pageIndex: 1, pageSize: 10 },
    withdrawals: { pageIndex: 1, pageSize: 10 }
  });

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

      // const result = await response.json();
      // console.log('Dashboard data:', response);
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const [cardData, setCardData]= useState<CardData>();

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

      // const result = await response.json();
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
        <span className="font-medium">#{row.getValue('id')}</span>
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
        <span className="font-medium">#{row.getValue('id')}</span>
      ),
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
        <span className="font-medium">#{row.getValue('id')}</span>
      ),
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

  // Chart options and data for Balance (USD) - Area Chart
  const balanceChartOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ['#3B82F6'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      },
    },
    xaxis: {
      categories: ['Today', 'Week', 'Month', 'Total'],
      labels: { style: { colors: '#6B7280' } },
    },
    yaxis: {
      labels: { style: { colors: '#6B7280' } },
    },
    tooltip: {
      y: { formatter: (val) => `$${val.toFixed(2)}` },
    },
  };

  const balanceChartSeries = [
    {
      name: 'Balance (USD)',
      data: [
        data?.balanceInUSD?.today || 0,
        data?.balanceInUSD?.week || 0,
        data?.balanceInUSD?.month || 0,
        data?.balanceInUSD?.total || 0,
      ],
    },
  ];

  // Chart options and data for Deposits (USD) - Bar Chart
  const depositsChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false },
    },
    colors: ['#109368', '#120fda', '#f93e06', '#7906e4'], // Different colors
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '45%',
        distributed: true,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Today', 'Week', 'Month', 'Total'],
      labels: { style: { colors: '#6B7280' } },
    },
    yaxis: {
      labels: { style: { colors: '#6B7280' } },
    },
    tooltip: {
      y: { formatter: (val) => `$${val.toFixed(2)}` },
    },
  };

  const depositsChartSeries = [
    {
      name: 'Deposits (USD)',
      data: [
        data?.depositInUSD?.today || 0,
        data?.depositInUSD?.week || 0,
        data?.depositInUSD?.month || 0,
        data?.depositInUSD?.total || 0,
      ],
    },
  ];

  // Chart options for Activity Overview - Donut Chart
  const activityChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 300,
    },
    colors: ['#5c1cee', '#0ba329', '#bedc05'],
    labels: ['Tickets', 'Deposits', 'Withdrawals'],
    legend: {
      position: 'bottom',
      labels: { colors: '#6B7280' },
      fontSize: '10px'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: 'bottom' },
      },
    }],
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: '#6B7280',
              fontSize: '12px'
            },
          },
        },
      },
    },
    // 👇 This removes the white border lines
    stroke: {
      show: false,
      width: 0,
    },
  };

  const activityChartSeries = [
    data?.ticket?.length || 0,
    data?.deposit?.length || 0,
    data?.withdraw?.length || 0,
  ];

  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              ids: coinIds.join(','),
              sparkline: true,
            },
          }
        );
        setCoins(res.data);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // auto-refresh every 1 minute
    return () => clearInterval(interval);
  }, []);




  return (
    <>
      <div className="">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Today's Deposit Card */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Available Balance</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {cardData?.availableBalanceUSD || '0.00'}$
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Weekly Deposit Card */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Locked Balance</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {cardData?.lockedBalanceUSD || '0.00'}$
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Monthly Deposit Card */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {cardData?.totalBalanceUSD || '0.00'}$
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-12 md:grid-cols-12 gap-4 sm:gap-6 mb-6 sm:mb-8">

          {/* Balance Chart */}
          <div className="col-span-12 md:col-span-5 rounded-lg shadow">
            <BalanceCard cardData={cardData} />
          </div>


          {/* Deposits Chart */}
         {/* <div className="col-span-12 md:col-span-6 rounded-lg shadow  bg-white dark:bg-gray-800 p-4">
            <h3 className="text-lg font-semibold mb-2">Activity Overview</h3>
            <Chart
              options={activityChartOptions}
              series={activityChartSeries}
              type="donut"
              height={300}
            />
          </div> */}
          
            <div className="col-span-12 md:col-span-7   rounded-lg shadow">
            <div className='md:h-full '>
              <Graph />
            </div>
           
          </div>

        </div>

        {/* <div className="grid grid-cols-6 md:grid-cols-12 gap-4"> */}
          {/* Activity Chart */}
         

            {/* <div className="col-span-12 md:col-span-12   rounded-lg shadow">
            <div className='md:h-[400px] '>
              <Graph />
            </div>
           
          </div> */}

          {/* New Graph */}
          {/* <div className="col-span-12 md:col-span-6  rounded-lg shadow bg-white dark:bg-gray-800 p-4">
             <h3 className="text-lg font-semibold mb-2">Deposits Overview (USD)</h3>
            <Chart
              options={depositsChartOptions}
              series={depositsChartSeries}
              type="bar"
              height={300}
            />
          </div> */}
        {/* </div> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ">
          {coins.map((coin) => (
            <CryptoCard
              key={coin.id}
              name={coin.name}
              symbol={coin.symbol}
              price={coin.current_price}
              change={coin.price_change_percentage_24h}
              icon={coin.image}
              sparkline={coin.sparkline_in_7d.price.slice(-20)} // Last 20 points for visual clarity
            />
          ))}
        </div>



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


      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
          <Spinner size={40} />
        </div>
      )}
    </>
  );
};

export default Page;