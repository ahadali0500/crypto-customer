'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Graph from './Graph';
import DataTable, { ColumnDef, OnSortParam } from '@/components/shared/DataTable';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui';

type Transaction = {
  id: string;
  type: string;
  date: string;
  sellAsset: string;
  buyAsset: string;
  sellAmount: string;
  buyAmount: string;
  fee: string;
  status: string;
  exchangeBalanceType:string
};

const statusColorMap: Record<string, string> = {
  'Completed': 'bg-green-500 text-white',
  'Success': 'bg-green-500 text-white',
  'Pending': 'bg-yellow-400 text-black',
  'Failed': 'bg-red-500 text-white',
};

const columns: ColumnDef<Transaction>[] = [
  { header: 'ID', accessorKey: 'id', cell: ({ row }) => <span>#{row.original.id}</span> },
  { 
    header: 'Type', 
    accessorKey: 'type', 
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.original.type === 'Sell' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
      }`}>
        {row.original.type}
      </span>
    )
  },
  { header: 'Date', accessorKey: 'date', cell: ({ row }) => <span>{new Date(row.original.date).toLocaleDateString()}</span> },
  { 
    header: 'From Asset', 
    accessorKey: 'sellAsset', 
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.sellAsset}</span>
        <span className="text-sm text-gray-500">{row.original.sellAmount}</span>
      </div>
    )
  },
  { 
    header: 'To Asset', 
    accessorKey: 'buyAsset', 
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.buyAsset}</span>
        <span className="text-sm text-gray-500">{row.original.buyAmount}</span>
      </div>
    )
  },
  { header: 'Fee', accessorKey: 'fee', cell: ({ row }) => <span>{row.original.fee}</span> },
  {
  header: 'Balance Type',
  accessorKey: 'exchangeBalanceType',
  cell: ({ row }) => {
    const value = row.getValue('exchangeBalanceType') as string

    const color =
      value === 'Available'
        ? 'bg-green-100 text-green-800'
        : value === 'Locked'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-gray-100 text-gray-800'

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}
      >
        {value}
      </span>
    )
  },
},

  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.original.status;
      const colorClass = statusColorMap[status] || 'bg-gray-500 text-white';
      return (
        <span className={`text-xs font-semibold px-2 py-1 rounded ${colorClass}`}>
          {status}
        </span>
      );
    },
  },
  
];

const ExchangeHistory = () => {
  const [exchangeData, setExchangeData] = useState<any[]>([]);
  const [processedData, setProcessedData] = useState<Transaction[]>([]);
  
  
  

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  
  // Pagination and Sorting
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; order: 'asc' | 'desc' | '' }>({
    key: '',
    order: '',
  });
  
  // Table ref for Print
  const tableRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // Function to process API data into table format
  const processExchangeData = (data: any[]): Transaction[] => {
    return data.map((item) => ({
      id: item.id.toString(),
      type: 'Exchange', // You can determine this based on your business logic
      date: item.createdAt,
      sellAsset: item.sellAsset?.shortName || 'N/A',
      buyAsset: item.buyAsset?.shortName || 'N/A',
      sellAmount: item.sellAmount,
      buyAmount: item.buyAmount,
      fee: item.fees,
      status: 'Completed',
      exchangeBalanceType:item.exchangeBalanceType
      
    }));
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/exchange/fetch`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });



      setExchangeData(res.data.data);
      const processed = processExchangeData(res.data.data);
      setProcessedData(processed);
      setTotalCount(processed.length);
    } catch (error: any) {
      console.error('Error fetching exchange data:', error);
      setExchangeData([]);
      setProcessedData([]);
      setTotalCount(0);
      toast.error('Failed to fetch exchange data');
    } finally {
      setLoading(false);
    }
  };


  

  useEffect(() => {
    fetchHistory();
  }, []);

  // Client-side search filtering
  const filteredData = useMemo(() => {
    if (!search.trim()) return processedData;
    const q = search.toLowerCase();
    return processedData.filter(item => {
      const matchesSellAsset = item.sellAsset.toLowerCase().includes(q);
      const matchesBuyAsset = item.buyAsset.toLowerCase().includes(q);
      const matchesId = item.id.toString().includes(q);
      return matchesSellAsset || matchesBuyAsset || matchesId;
    });
  }, [processedData, search]);

  // Update total count when filtered data changes
  useEffect(() => {
    setTotalCount(filteredData.length);
    setPageIndex(1);
  }, [filteredData]);

  // Client-side sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key || sortConfig.order === '') {
      return filteredData;
    }
    const direction = sortConfig.order === 'asc' ? 1 : -1;
    return [...filteredData].sort((a, b) => {
      const A = (a as any)[sortConfig.key];
      const B = (b as any)[sortConfig.key];

      // Handle date sorting
      if (sortConfig.key === 'date') {
        return (new Date(A).getTime() - new Date(B).getTime()) * direction;
      }

      // Handle numeric sorting
      if (typeof A === 'number' && typeof B === 'number') {
        return (A - B) * direction;
      }

      // Handle string sorting
      return String(A).localeCompare(String(B)) * direction;
    });
  }, [filteredData, sortConfig]);

  // Client-side pagination
  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, pageIndex, pageSize]);

  // Sorting handler
  const handleSort = (sort: OnSortParam) => {
    setSortConfig({ key: String(sort.key), order: sort.order });
    setPageIndex(1);
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPageIndex(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageIndex(1);
  };

  // CSV Export Utility
  const generateCSV = (items: Transaction[]) => {
    const headers = ['ID', 'Type', 'Date', 'From Asset', 'From Amount', 'To Asset', 'To Amount', 'Fee', 'Status'];
    const rows = items.map((item) => [
      item.id.toString(),
      item.type,
      new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(item.date)),
      item.sellAsset,
      item.sellAmount,
      item.buyAsset,
      item.buyAmount,
      item.fee,
      item.status
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csvContent;
  };

  const handleExportCSV = () => {
    const dataToExport = filteredData;
    const csvString = generateCSV(dataToExport);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'exchange-history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!tableRef.current) return;

    const tableHTML = tableRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Exchange History Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background: #eee; font-weight: bold; }
            .status-badge { padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
            .completed { background: #65a30d; color: white; }
            .pending { background: #facc15; color: white; }
            .failed { background: #dc2626; color: white; }
          </style>
        </head>
        <body>
          <h2>Exchange History Report</h2>
          <p>Generated on: ${new Date().toLocaleDateString('en-GB')}</p>
          <div>${tableHTML}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className=''>
      {/* <div className="h-[500px] mb-10">
        <Graph />
      </div> */}

      <div className='p-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg'>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Exchange History</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              disabled={loading || filteredData.length === 0}
            >
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
              disabled={loading || filteredData.length === 0}
            >
              Print
            </button>
          </div>
        </div>


        <div ref={tableRef}>
          <DataTable
            data={paginatedData}
            columns={columns}
            loading={loading}
            pagingData={{
              total: totalCount,
              pageIndex,
              pageSize,
            }}
            noData={!loading && filteredData.length === 0}
            onPaginationChange={handlePageChange}
            onSelectChange={handlePageSizeChange}
            onSort={handleSort}
          />
        </div>
      </div>
    </div>
  );
};

export default ExchangeHistory;