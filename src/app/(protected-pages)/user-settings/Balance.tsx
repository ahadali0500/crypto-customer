'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import DataTable, { ColumnDef, OnSortParam } from '@/components/shared/DataTable';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui';

type Balance = {
  id: number;
  customerId: number;
  currencyId: number;
  availableBalance: string;
  lockedBalance: string;
  createdAt: string;
  updatedAt: string;
  currency: {
    id: number;
    shortName: string;
    fullName: string;
    icon: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
};

type BalanceResponse = {
  data: Balance[];
};

type BalanceProps = {
  slug: string;
};

const Balance = () => {
  const [balanceData, setBalanceData] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [search, setSearch] = useState('');
  
  // Pagination and Sorting
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; order: 'asc' | 'desc' | '' }>({
    key: '',
    order: '',
  });

  // Table ref
  const tableRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const res = await axios.get<BalanceResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/balance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (res.data && Array.isArray(res.data.data)) {
        setBalanceData(res.data.data);
      } else {
        setBalanceData([]);
        toast.error('Invalid data format received');
      }
    } catch (error: any) {
      console.error('Error fetching balance data:', error);
      setBalanceData([]);
      toast.error(error.response?.data?.message || 'Error fetching balance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // Client-side search filtering
  const filteredData = useMemo(() => {
    if (!search.trim()) return balanceData;
    const q = search.toLowerCase();
    return balanceData.filter(item => {
      const matchesCurrency = item.currency.shortName.toLowerCase().includes(q) || 
                            item.currency.fullName.toLowerCase().includes(q);
      const matchesId = item.id.toString().includes(q);
      const matchesType = item.currency.type.toLowerCase().includes(q);
      return matchesCurrency || matchesId || matchesType;
    });
  }, [balanceData, search]);

  // Client-side sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key || sortConfig.order === '') {
      return filteredData;
    }
    const direction = sortConfig.order === 'asc' ? 1 : -1;
    return [...filteredData].sort((a, b) => {
      // Handle nested currency properties
      if (sortConfig.key.startsWith('currency.')) {
        const key = sortConfig.key.split('.')[1];
        const A = a.currency[key as keyof typeof a.currency];
        const B = b.currency[key as keyof typeof b.currency];
        
        if (typeof A === 'string' && typeof B === 'string') {
          return A.localeCompare(B) * direction;
        }
        return 0;
      }

      const A = a[sortConfig.key as keyof Balance];
      const B = b[sortConfig.key as keyof Balance];

      // Handle date sorting
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
        return (new Date(A as string).getTime() - new Date(B as string).getTime()) * direction;
      }

      // Handle numeric sorting for balances
      if (sortConfig.key === 'availableBalance' || sortConfig.key === 'lockedBalance') {
        return (parseFloat(A as string) - parseFloat(B as string)) * direction;
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

  // Reset pagination when search or data changes
  useEffect(() => {
    setPageIndex(1);
  }, [filteredData.length]);

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

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0.00';
    return num.toFixed(8).replace(/\.?0+$/, '');
  };

  const columns: ColumnDef<Balance>[] = [
    { 
      header: 'ID', 
      accessorKey: 'id', 
      enableSorting: true,
      cell: ({ row }) => <span>#{row.original.id}</span> 
    },
    { 
      header: 'Currency', 
      accessorKey: 'currency.shortName', 
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.currency.icon && (
            <img 
              src={row.original.currency.icon} 
              alt={row.original.currency.shortName}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span>{row.original.currency.shortName}</span>
        </div>
      )
    },
    { 
      header: 'Type', 
      accessorKey: 'currency.type', 
      enableSorting: true,
      cell: ({ row }) => (
        <span className={`px-2 py-1 text-xs rounded ${
          row.original.currency.type === 'Crypto' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {row.original.currency.type}
        </span>
      )
    },
    { 
      header: 'Available Balance', 
      accessorKey: 'availableBalance', 
      enableSorting: true,
      cell: ({ row }) => (
        <span className={parseFloat(row.original.availableBalance) >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatBalance(row.original.availableBalance)}
        </span>
      )
    },
    { 
      header: 'Locked Balance', 
      accessorKey: 'lockedBalance', 
      enableSorting: true,
      cell: ({ row }) => (
        <span className="">
          {formatBalance(row.original.lockedBalance)}
        </span>
      )
    },
    { 
      header: 'Total Balance', 
      enableSorting: false,
      cell: ({ row }) => {
        const total = parseFloat(row.original.availableBalance) + parseFloat(row.original.lockedBalance);
        return (
          <span className={total >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {formatBalance(total.toString())}
          </span>
        );
      }
    },
    { 
      header: 'Updated At', 
      accessorKey: 'updatedAt', 
      enableSorting: true,
      cell: ({ row }) => (
        <span>{new Date(row.original.updatedAt).toLocaleString()}</span>
      )
    },
  ];

  return (
    <div className='min-h-screen'>
      <div className='p-6 bg-white dark:bg-gray-900 rounded-lg'>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Customer Balances</h2>
         
          {/* Search Input */}
          <div className="">
            <Input
              type="text"
              size='sm'
              placeholder="Search by ID, Currency, or Type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div ref={tableRef}>
          <DataTable
            data={paginatedData}
            columns={columns}
            loading={loading}
            pagingData={{
              total: sortedData.length,
              pageIndex,
              pageSize,
            }}
            noData={!loading && balanceData.length === 0}
            onPaginationChange={handlePageChange}
            onSelectChange={handlePageSizeChange}
            onSort={handleSort}
          />
        </div>
      </div>
    </div>
  );
};

export default Balance;