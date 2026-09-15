'use client'

import React, { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  sortBy?: keyof T
  sortOrder?: 'asc' | 'desc'
  loading?: boolean
  pagination?: {
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number) => void
  }
  rowKey?: keyof T
}

/**
 * جدول متقدم مع الفرز والبحث والتصفح
 */
export function Table<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  onEdit,
  onDelete,
  sortBy,
  sortOrder = 'asc',
  loading = false,
  pagination,
  rowKey = 'id' as keyof T,
}: TableProps<T>) {
  const [sortedBy, setSortedBy] = useState<keyof T | null>(sortBy || null)
  const [order, setOrder] = useState<'asc' | 'desc'>(sortOrder)

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return

    if (sortedBy === column.key) {
      setOrder(order === 'asc' ? 'desc' : 'asc')
    } else {
      setSortedBy(column.key as keyof T)
      setOrder('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortedBy) return 0

    const aVal = a[sortedBy]
    const bVal = b[sortedBy]

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal
    }

    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()

    if (order === 'asc') {
      return aStr.localeCompare(bStr, 'ar')
    } else {
      return bStr.localeCompare(aStr, 'ar')
    }
  })

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null
    if (sortedBy !== column.key) {
      return <ChevronUp size={16} className="text-gray-400" />
    }
    return order === 'asc' ? (
      <ChevronUp size={16} className="text-blue-600" />
    ) : (
      <ChevronDown size={16} className="text-blue-600" />
    )
  }

  return (
    <div className="w-full">
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gray-100 border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-4 py-3 text-right text-sm font-semibold text-gray-700 ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''
                  } ${column.width || ''}`}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center justify-between gap-2">
                    {column.label}
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                  لا توجد بيانات
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr
                  key={String(row[rowKey])}
                  className="border-b hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-4 py-3 text-sm text-gray-900">
                      {column.render
                        ? column.render(row[column.key as keyof T], row)
                        : row[column.key as keyof T]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit(row)
                            }}
                            className="px-2 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 transition"
                          >
                            تعديل
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(row)
                            }}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            عرض <strong>{(pagination.page - 1) * pagination.pageSize + 1}</strong> إلى{' '}
            <strong>
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </strong>{' '}
            من <strong>{pagination.total}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="الصفحة الأولى"
            >
              <ChevronsLeft size={20} />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="الصفحة السابقة"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) })
                .slice(
                  Math.max(0, pagination.page - 3),
                  Math.min(Math.ceil(pagination.total / pagination.pageSize), pagination.page + 2)
                )
                .map((_, i) => {
                  const pageNum = i + Math.max(0, pagination.page - 3) + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => pagination.onPageChange(pageNum)}
                      className={`w-8 h-8 rounded transition ${
                        pageNum === pagination.page
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
            </div>

            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="الصفحة التالية"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() =>
                pagination.onPageChange(Math.ceil(pagination.total / pagination.pageSize))
              }
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="الصفحة الأخيرة"
            >
              <ChevronsRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
