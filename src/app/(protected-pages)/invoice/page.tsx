'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ColumnDef, OnSortParam } from '@/components/shared/DataTable'
import DataTable from '@/components/shared/DataTable'
import { FaEdit, FaMoneyBillWave } from 'react-icons/fa'
import { Button, Input, InputGroup, Spinner } from '@/components/ui'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { FaDownload, FaPrint, FaChevronDown } from 'react-icons/fa6'
import { toast } from 'react-toastify'
import { useSessionContext } from '@/components/auth/AuthProvider/SessionContext'

type Currency = {
  id: number
  shortName: string
  fullName: string
  icon: string
  type: string
}

type Item = {
  name: string
  price: number
  quantity: number
}

type Invoice = {
  id: number
  customerId: number
  fromType: string
  payoutId: number
  currencyId: number
  amount: string
  invoiceDate: string
  dueDate: string
  items: Item[]
  status: 'Pending' | 'Paid' | 'Failed'
  createdAt: string
  updatedAt: string
  currency: Currency
  payout: Currency
}

const InvoiceTable = () => {
  const [invoiceData, setInvoiceData] = useState<Invoice[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [tableLoading, setTableLoading] = useState(false)
  const router = useRouter()
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([])
  const [bulkStatus, setBulkStatus] = useState<'Pending' | 'Paid' | 'Failed'>('Pending')
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const { session, setSession } = useSessionContext();

  // Pagination and Sorting
  const [pageIndex, setPageIndex] = useState(1) // 1-based
  const [pageSize, setPageSize] = useState(10)
  const [sortConfig, setSortConfig] = useState<{ key: string; order: 'asc' | 'desc' | '' }>({
    key: '',
    order: '',
  })

 

  // Table ref for Print
  const tableRef = useRef<HTMLDivElement>(null)

  // Client-side search filtering
  const filteredData = useMemo(() => {
    if (!search.trim()) return invoiceData
    const q = search.toLowerCase()
    return invoiceData?.filter(item => {
      const matchesId = item.id.toString().includes(q)
      const matchesFromType = item.fromType.toLowerCase().includes(q)
      const matchesCurrency = item.currency?.shortName.toLowerCase().includes(q)
      const matchesPayout = item.payout?.shortName.toLowerCase().includes(q)
      const matchesStatus = item.status.toLowerCase().includes(q)
      return matchesId || matchesFromType || matchesCurrency || matchesPayout || matchesStatus
    }) || []
  }, [invoiceData, search])

  // Update total count when filtered data changes
  useEffect(() => {
    setTotalCount(filteredData.length)
    setPageIndex(1) // Reset to first page when search changes
  }, [filteredData])

  // Client-side sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key || sortConfig.order === '') {
      return filteredData
    }
    const direction = sortConfig.order === 'asc' ? 1 : -1
    return [...filteredData].sort((a, b) => {
      const A = (a as any)[sortConfig.key]
      const B = (b as any)[sortConfig.key]

      // Handle date sorting
      if (sortConfig.key === 'invoiceDate' || sortConfig.key === 'dueDate' || sortConfig.key === 'createdAt') {
        return (new Date(A).getTime() - new Date(B).getTime()) * direction
      }

      // Handle numeric sorting
      if (typeof A === 'number' && typeof B === 'number') {
        return (A - B) * direction
      }

      // Handle string sorting
      return String(A).localeCompare(String(B)) * direction
    })
  }, [filteredData, sortConfig])

  // Client-side pagination
  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize
    const end = start + pageSize
    return sortedData.slice(start, end)
  }, [sortedData, pageIndex, pageSize])

  // Sorting handler
  const handleSort = (sort: OnSortParam) => {
    setSortConfig({ key: String(sort.key), order: sort.order })
    setPageIndex(1) // Reset to first page when sorting changes
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPageIndex(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPageIndex(1) // Reset to first page when page size changes
  }

  // Checkbox handlers
  const handleSelectInvoice = (invoiceId: number, checked: boolean) => {
    if (checked) {
      setSelectedInvoices(prev => [...prev, invoiceId])
    } else {
      setSelectedInvoices(prev => prev.filter(id => id !== invoiceId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(paginatedData.map(invoice => invoice.id))
    } else {
      setSelectedInvoices([])
    }
  }

  // Bulk status update
  const handleBulkStatusUpdate = async () => {
    if (selectedInvoices.length === 0) {
      alert('Please select at least one invoice')
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    if (!token) {
      alert('Authentication required')
      return
    }

    setBulkUpdateLoading(true)
    try {
      // Update each selected invoice
      const updatePromises = selectedInvoices.map(async (invoiceId) => {
        const formData = new FormData()
        formData.append('invoiceId', invoiceId.toString())
        formData.append('status', bulkStatus)

        return axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/invoice/status`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        )
      })

      await Promise.all(updatePromises)

      // Update local state
      setInvoiceData(prev =>
        prev.map(invoice =>
          selectedInvoices.includes(invoice.id)
            ? { ...invoice, status: bulkStatus }
            : invoice
        )
      )

      setSelectedInvoices([])
      toast.success('Status successfully updated');
    } catch (error) {
      console.error('Error updating invoice status:', error)
      toast.error('Failed to update invoice status')
    } finally {
      setBulkUpdateLoading(false)
    }
  }

  // CSV Export Utility
  const generateCSV = (items: Invoice[]) => {
    const headers = ['Invoice No', 'From Type', 'Amount', 'Currency', 'Payout', 'Invoice Date', 'Due Date', 'Status']
    const rows = items.map((item) => [
      item.id.toString(),
      `"${item.fromType.replace(/"/g, '""')}"`,
      item.amount,
      item.currency?.shortName || '',
      item.payout?.shortName || '',
      new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(item.invoiceDate)),
      new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(item.dueDate)),
      item.status
    ])
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    return csvContent
  }

  const handleExportCSV = () => {
    const dataToExport = filteredData
    const csvString = generateCSV(dataToExport)
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'invoices.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Print Utility
  const handlePrint = () => {
    if (!tableRef.current) return

    const tableHTML = tableRef.current.innerHTML
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoices Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background: #eee; font-weight: bold; }
            .status-badge { padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
            .paid { background: #65a30d; color: white; }
            .pending { background: #facc15; color: white; }
            .failed { background: #dc2626; color: white; }
          </style>
        </head>
        <body>
          <h2>Invoices Report</h2>
          <p>Generated on: ${new Date().toLocaleDateString('en-GB')}</p>
          <div>${tableHTML}</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  // Fetch invoices data
  useEffect(() => {
    const fetchInvoice = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

      if (!token) {
        console.warn('No auth token found')
        setLoading(false)
        return
      }

      setTableLoading(true)
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/invoice/fetch`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        // console.log('response', response.data);
        const invoicesData = response.data || []
        setInvoiceData(invoicesData)
        setTotalCount(invoicesData.length)
      } catch (error) {
        console.error('Error fetching invoices:', error)
        setInvoiceData([])
        setTotalCount(0)
      } finally {
        setLoading(false)
        setTableLoading(false)
      }
    }

    fetchInvoice()
  }, [])

  // console.log('invoiceData', invoiceData);

  const handleEdit = (row: Invoice) => {
    console.log(`Edit invoice with ID: ${row.id}`)
  }

  const handlePay = (row: Invoice) => {
    console.log(`Pay invoice with ID: ${row.id}`)
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      header: () => (
        <input
          type="checkbox"
          checked={selectedInvoices.length === paginatedData.length && paginatedData.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
      accessorKey: 'select',
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedInvoices.includes(row.original.id)}
          onChange={(e) => handleSelectInvoice(row.original.id, e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
    },
    {
      header: 'Invoice No',
      accessorKey: 'id',
      cell: ({ row }) => `#${row.original.id}`,
    },
    {
      header: 'From Type',
      accessorKey: 'fromType',
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }) => `${row.original.amount}`,
    },

    {
      header: 'Payout Method',
      accessorKey: 'payout',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.payout?.shortName}</span>
        </div>
      ),
    },
    {
      header: 'Invoice Date',
      accessorKey: 'invoiceDate',
      cell: ({ row }) => formatDate(row.original.invoiceDate),
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      cell: ({ row }) => formatDate(row.original.dueDate),
    },

    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status
        let bg = ''
        let text = ''

        switch (status) {
          case 'Paid':
            bg = 'bg-green-200'
            text = 'text-green-900'
            break
          case 'Failed':
            bg = 'bg-red-200'
            text = 'text-red-900'
            break
          case 'Pending':
            bg = 'bg-yellow-200'
            text = 'text-yellow-900'
            break
          default:
            bg = 'bg-gray-100'
            text = 'text-gray-800'
        }

        return (
          <span className={`text-xs px-2 py-1 rounded ${bg} ${text}`}>
            {status}
          </span>
        )
      },
    },
  ]

  return (
    <>
   <div className=" p-6 shadow-sm bg-white dark:bg-[#18212F] border border-gray-600 border-1 rounded-lg">
  {/* Header */}
  <div className="flex flex-col xs:flex-row  xs:items-center justify-between gap-4">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Invoices</h2>

    {/* Status Selector + Bulk Update */}
    <div className="flex flex-row items-center gap-4">
      <div className='flex flex-row items-center gap-3'>
        <label className="block sm:block hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Select Status:
        </label>
        <select
          value={bulkStatus}
          onChange={(e) => setBulkStatus(e.target.value as 'Pending' | 'Paid' | 'Failed')}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm rounded-md px-4 py-2 w-48"
        >
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      <div className=''>
        <Button
        size="xs"
        variant="solid"
        className="w-full sm:w-auto font-normal rounded-lg"
        onClick={handleBulkStatusUpdate}
        disabled={bulkUpdateLoading || selectedInvoices.length === 0}
      >
        {bulkUpdateLoading ? 'Updating...' : `Update (${selectedInvoices.length})`}
      </Button>
      </div>
    </div>
  </div>

  {/* Divider */}
  <hr className="my-6 border-gray-200 dark:border-gray-700" />

  {/* Toolbar */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <div className="flex gap-2 flex-wrap">
      <Button
        size="xs"
        className="flex items-center gap-2 border border-primary text-primary hover:bg-primary hover:text-white px-4 rounded-md"
        onClick={handleExportCSV}
        disabled={filteredData.length === 0}
      >
        <FaDownload className="text-sm" /> Export CSV
      </Button>
      <Button
        size="xs"
        className="flex items-center gap-2 border border-primary text-primary hover:bg-primary hover:text-white px-4 rounded-md"
        onClick={handlePrint}
        disabled={filteredData.length === 0}
      >
        <FaPrint className="text-sm" /> Print Report
      </Button>
    </div>

   <div>
     <Input
      value={search}
      onChange={(e: any) => setSearch(e.target.value)}
      placeholder="Search "
      size='sm'
      className="text-sm rounded-md w-full "
    />
   </div>
  </div>

  {/* Table */}
  <div>
    {!loading && (
      <div ref={tableRef}>
        <DataTable
          data={paginatedData}
          columns={columns}
          loading={tableLoading}
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
    )}
  </div>
</div>

  {bulkUpdateLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
          <Spinner size={40} />
        </div>
      )}


</>
    )
}

export default InvoiceTable