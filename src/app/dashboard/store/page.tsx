'use client'

import React, { useState, useEffect } from 'react'
import { Layout, StatsGrid, Table, SectionCard } from '@/components'
import { orderService } from '@/services/orderService'
import { statsService } from '@/services/statsService'
import { Package, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react'

/**
 * لوحة مدير المتجر
 */
export default function StoreDashboard() {
  const [storeStats, setStoreStats] = useState<any>(null)
  const [storeOrders, setStoreOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(15)
  const [filterStatus, setFilterStatus] = useState<string>()

  // Note: في بيئة الإنتاج، سيتم الحصول على اسم المتجر من جلسة المستخدم
  const storeName = 'متجر الرياض'

  useEffect(() => {
    loadDashboardData()
  }, [page, filterStatus])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const offset = (page - 1) * pageSize

      const [stats, orders] = await Promise.all([
        statsService.getStoreStats(storeName),
        orderService.getStoreOrders(storeName, filterStatus, pageSize, offset),
      ])

      setStoreStats(stats)
      setStoreOrders(orders.orders)
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error)
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { label: 'لوحتي', href: '/dashboard/store', icon: <BarChart3 size={20} /> },
    { label: 'الطلبات', href: '/dashboard/store/orders' },
    { label: 'الموظفات', href: '/dashboard/store/employees' },
  ]

  return (
    <Layout
      navItems={navItems}
      title="لوحة مدير المتجر"
      userName={storeName}
      userRole="مدير متجر"
    >
      <div className="space-y-6">
        {/* الإحصائيات الرئيسية */}
        <StatsGrid
          stats={[
            {
              title: 'إجمالي الطلبات',
              value: storeStats?.total_orders || 0,
              icon: <Package size={24} />,
              color: 'blue',
            },
            {
              title: 'المسلمة',
              value: storeStats?.delivered_count || 0,
              icon: <CheckCircle size={24} />,
              color: 'green',
            },
            {
              title: 'معدل التسليم',
              value: `${storeStats?.delivery_percentage || 0}%`,
              icon: <TrendingUp size={24} />,
              color: 'purple',
            },
          ]}
          columns={3}
        />

        {/* التصفية */}
        <SectionCard title="الطلبات">
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => {
                setFilterStatus(undefined)
                setPage(1)
              }}
              className={`px-4 py-2 rounded text-sm transition ${
                !filterStatus ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => {
                setFilterStatus('رد و يستلم')
                setPage(1)
              }}
              className={`px-4 py-2 rounded text-sm transition ${
                filterStatus === 'رد و يستلم'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              رد و يستلم
            </button>
            <button
              onClick={() => {
                setFilterStatus('لم يرد')
                setPage(1)
              }}
              className={`px-4 py-2 rounded text-sm transition ${
                filterStatus === 'لم يرد'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              لم يرد
            </button>
          </div>

          <Table
            columns={[
              { key: 'order_code', label: 'الكود', sortable: true },
              { key: 'customer_phone', label: 'رقم العميل' },
              { key: 'employee_name', label: 'الموظفة' },
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
            data={storeOrders}
            loading={loading}
            rowKey="id"
            pagination={{
              total: storeStats?.total_orders || 0,
              page,
              pageSize,
              onPageChange: setPage,
            }}
          />
        </SectionCard>
      </div>
    </Layout>
  )
}
