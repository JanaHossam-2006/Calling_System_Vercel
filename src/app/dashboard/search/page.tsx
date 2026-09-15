'use client'

import React, { useState } from 'react'
import { Layout, Form, Table, SectionCard, EmptyState } from '@/components'
import { searchService } from '@/services/searchService'
import { Search, BarChart3 } from 'lucide-react'

/**
 * صفحة البحث المتقدم
 */
export default function SearchPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const handleSearch = async (values: any) => {
    try {
      setLoading(true)
      setPage(1)

      const result = await searchService.advancedSearch({
        orderCode: values.orderCode,
        customerPhone: values.customerPhone,
        employeeName: values.employeeName,
        store: values.store,
        clientStatus: values.clientStatus,
        fromDate: values.fromDate,
        toDate: values.toDate,
        limit: 20,
      })

      setResults(result.orders)
      setTotal(result.total)
      setSearched(true)
    } catch (error) {
      console.error('خطأ في البحث:', error)
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { label: 'البحث المتقدم', href: '/dashboard/search', icon: <Search size={20} /> },
  ]

  return (
    <Layout navItems={navItems} title="البحث المتقدم">
      <div className="space-y-6">
        {/* نموذج البحث */}
        <SectionCard title="معايير البحث">
          <Form
            fields={[
              {
                name: 'orderCode',
                label: 'كود الطلب',
                type: 'text',
                placeholder: 'مثال: ORD001',
              },
              {
                name: 'customerPhone',
                label: 'رقم العميل',
                type: 'phone',
                placeholder: 'مثال: 01012345678',
              },
              {
                name: 'employeeName',
                label: 'اسم الموظفة',
                type: 'text',
                placeholder: 'اسم الموظفة',
              },
              {
                name: 'store',
                label: 'المتجر',
                type: 'text',
                placeholder: 'اسم المتجر',
              },
              {
                name: 'clientStatus',
                label: 'حالة العميل',
                type: 'select',
                options: [
                  { label: 'جميع الحالات', value: '' },
                  { label: 'رد و يستلم', value: 'رد و يستلم' },
                  { label: 'لم يرد', value: 'لم يرد' },
                  { label: 'الغى الطلب', value: 'الغى الطلب' },
                  { label: 'تم الاستلام', value: 'تم الاستلام' },
                ],
              },
              {
                name: 'fromDate',
                label: 'من التاريخ',
                type: 'date',
              },
              {
                name: 'toDate',
                label: 'إلى التاريخ',
                type: 'date',
              },
            ]}
            onSubmit={handleSearch}
            submitText="بحث"
            loading={loading}
          />
        </SectionCard>

        {/* النتائج */}
        {searched && (
          <SectionCard title={`النتائج (${total})`}>
            {results.length > 0 ? (
              <Table
                columns={[
                  { key: 'order_code', label: 'الكود', sortable: true },
                  { key: 'customer_phone', label: 'رقم العميل' },
                  { key: 'employee_name', label: 'الموظفة' },
                  { key: 'store', label: 'المتجر' },
                  {
                    key: 'client_status',
                    label: 'الحالة',
                    render: (status) => (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          status === 'رد و يستلم'
                            ? 'bg-green-100 text-green-800'
                            : status === 'لم يرد'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {status || 'معلق'}
                      </span>
                    ),
                  },
                  {
                    key: 'order_date',
                    label: 'التاريخ',
                    render: (date) => new Date(date).toLocaleDateString('ar-EG'),
                  },
                ]}
                data={results}
                rowKey="id"
                loading={loading}
              />
            ) : (
              <EmptyState
                icon={<Search size={48} />}
                title="لا توجد نتائج"
                description="لم نجد أي طلبات تطابق معايير البحث"
              />
            )}
          </SectionCard>
        )}
      </div>
    </Layout>
  )
}
