'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import DataTable, { ColumnDef, OnSortParam } from '@/components/shared/DataTable'
import { Button, Input, Spinner } from '@/components/ui'
import { FaEye } from "react-icons/fa";
import { FaDownload, FaPrint } from 'react-icons/fa6'

// Ticket type definition
type Ticket = {
  id: number
  subject: string
  createdAt: string
  type: 'Solved' | 'Pending'
  customerId: number
  ticketMessage: Array<{
    id: number
    message: string
    ticketId: number
    createdAt: string
    updatedAt: string
  }>
  updatedAt: string
}

// Badge color map
const statusColorMap: Record<string, string> = {
  Solved: 'bg-lime-600 text-white',
  Pending: 'bg-yellow-400 text-white',
}

const TicketTablePage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [tableLoading, setTableLoading] = useState(false)
  const router = useRouter()
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')

  // Pagination and Sorting
  const [pageIndex, setPageIndex] = useState(1) // 1-based
  const [pageSize, setPageSize] = useState(10)
  const [sortConfig, setSortConfig] = useState<{ key: string; order: 'asc' | 'desc' | '' }>({
    key: '',
    order: '',
  })

  // Table ref for Print
  const tableRef = useRef<HTMLDivElement>(null)

  // Columns for the ticket table
  const columns: ColumnDef<Ticket>[] = [
    {
      header: 'Ticket No',
      accessorKey: 'id',
      cell: ({ row }) => <span>{row.original.id}</span>,
    },
    {
      header: 'Subject',
      accessorKey: 'subject',
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => {
        const rawDate = getValue() as string
        const date = new Date(rawDate)

        const formattedDate = new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(date)

        return <span>{formattedDate}</span>
      },
    },
    {
      header: 'Status',
      accessorKey: 'type',
      cell: ({ getValue }) => {
        const value = getValue() as string
        const color = statusColorMap[value] || 'bg-gray-300 text-black'
        return (
          <span
            className={`text-[10px] px-3 py-1 rounded-full font-semibold ${color}`}
          >
            {value}
          </span>
        )
      },
    },
    {
      header: 'View',
      id: 'view',
      cell: ({ row }) => (
        <FaEye
          className='text-primary cursor-pointer'
          size={18}
          onClick={() => handleViewDetail(row.original.id)}
        />
      ),
    },
  ]

  // Client-side search filtering
  const filteredData = useMemo(() => {
    if (!search.trim()) return tickets
    const q = search.toLowerCase()
    return tickets.filter(item => {
      const matchesSubject = item.subject.toLowerCase().includes(q)
      const matchesId = item.id.toString().includes(q)
      return matchesSubject || matchesId
    })
  }, [tickets, search])

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
      if (sortConfig.key === 'createdAt') {
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

  // CSV Export Utility
  const generateCSV = (items: Ticket[]) => {
    const headers = ['Ticket No', 'Subject', 'Date', 'Status']
    const rows = items.map((item) => [
      item.id.toString(),
      `"${item.subject.replace(/"/g, '""')}"`,
      new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(item.createdAt)),
      item.type
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
    link.setAttribute('download', 'tickets.csv')
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
          <title>Tickets Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background: #eee; font-weight: bold; }
            .status-badge { padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
            .solved { background: #65a30d; color: white; }
            .pending { background: #facc15; color: white; }
          </style>
        </head>
        <body>
          <h2>Tickets Report</h2>
          <p>Generated on: ${new Date().toLocaleDateString('en-GB')}</p>
          <div>${tableHTML}</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const handleViewDetail = (ticketId: number) => {
    router.push(`/view-ticket/${ticketId}`)
  }

  // Fetch tickets data
  useEffect(() => {
    const fetchTickets = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

      if (!token) {
        console.warn('No auth token found')
        setLoading(false)
        return
      }

      setTableLoading(true)
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/ticket/fetch`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const ticketsData = response.data.data || []
        setTickets(ticketsData)
        setTotalCount(ticketsData.length)
      } catch (error) {
        console.error('Error fetching tickets:', error)
        setTickets([])
        setTotalCount(0)
      } finally {
        setLoading(false)
        setTableLoading(false)
      }
    }

    fetchTickets()
  }, [])

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#18212F]">
          <Spinner size={40} />
        </div>
      )}

      <div className="p-6 mt-6 shadow-sm bg-white dark:bg-[#18212F] border border-1 border-gray-600 rounded-lg">
        <div className="rounded-lg">
          <div className='flex flex-row items-center justify-between mb-4'>

          <h2 className="text-xl font-semibold mb-4">Tickets</h2>
          <div>
            <Button className='bg-primary rounded-lg  dark:text-white' size='sm' variant='plain' onClick={()=> router.push('/create-ticket')}>Create Ticket</Button>
          </div>
          </div>

          {/* CSV Export, Print, Search */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6">
            <div className="space-x-2 md:space-x-6 flex flex-row items-center">
              <Button
                size="xs"
                className="flex flex-row items-center gap-2 border border-primary hover:bg-primary text-primary hover:text-white px-4 rounded-sm"
                onClick={handleExportCSV}
                disabled={filteredData.length === 0}
              >
                <FaDownload className="text-sm" /> Export CSV
              </Button>
              <Button
                size="xs"
                className="flex flex-row items-center gap-2 border border-primary text-primary hover:bg-primary hover:text-white px-4 rounded-sm"
                onClick={handlePrint}
                disabled={filteredData.length === 0}
              >
                <FaPrint className="text-sm" /> Print Report
              </Button>
            </div>

            <div>
              <Input
                value={search}
                size='sm'
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Ticket No or Subject"
                className="text-sm font-normal rounded-lg"
              />
            </div>
          </div>

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
    </div>
  )
}

export default TicketTablePage