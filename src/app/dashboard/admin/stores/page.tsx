'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Table, SectionCard, StatsCard } from '@/components'
import { statsService } from '@/services/statsService'
import { orderService } from '@/services/orderService'
import { BarChart3, Store } from 'lucide-react'

/**
 * صفحة المتاجر والإحصائيات
 */
export default function StoresPage() {
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [storeStats, setStoreStats] = useState<any>(null)
  const [storeOrders, setStoreOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadStores()
  }, [])

  useEffect(() => {
    if (selectedStore) {
      loadStoreDetails()
    }
  }, [selectedStore, page])

  const loadStores = async () => {
    try {
      setLoading(true)
      const stats = await statsService.getAllStoreStats()
      setStores(stats)
      if (stats.length > 0) {
        setSelectedStore(stats[0])
      }
    } catch (error) {
      console.error('خطأ في تحميل المتاجر:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStoreDetails = async () => {
    try {
      if (!selectedStore?.store) return

      const [stats, orders] = await Promise.all([
        statsService.getStoreStats(selectedStore.store),
        orderService.getStoreOrders(selectedStore.store, undefined, 10, (page - 1) * 10),
      ])

      setStoreStats(stats)
      setStoreOrders(orders.orders)
      setTotal(orders.total)
    } catch (error) {
      console.error('خطأ في تحميل بيانات المتجر:', error)
    }
  }

  const navItems = [
    { label: 'لوحة التحكم', href: '/dashboard/admin', icon: <BarChart3 size={20} /> },
    { label: 'جميع الطلبات', href: '/dashboard/admin/orders' },
    { label: 'الموظفات', href: '/dashboard/admin/employees' },
    { label: 'المتاجر', href: '/dashboard/admin/stores' },
  ]

  return (
    <Layout navItems={navItems} title="المتاجر">
      <div className="grid grid-cols-3 gap-6">
        {/* قائمة المتاجر */}
        <div>
          <SectionCard title="قائمة المتاجر">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stores.map((store: any, index: number) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedStore(store)
                    setPage(1)
                  }}
                  className={`w-full p-3 rounded text-right transition ${
                    selectedStore?.store === store.store
                      ? 'bg-blue-100 border-2 border-blue-600'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-900">{store.store}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {store.delivery_percentage}% استلام • {store.total_orders} طلب
                  </p>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* التفاصيل والطلبات */}
        <div className="col-span-2 space-y-6">
          {selectedStore && (
            <>
              {/* الإحصائيات */}
              <div className="grid grid-cols-3 gap-4">
                <StatsCard
                  title="إجمالي الطلبات"
                  value={storeStats?.total_orders || 0}
                  color="blue"
                  compact
                />
                <StatsCard
                  title="المسلمة"
                  value={storeStats?.delivered_count || 0}
                  color="green"
                  compact
                />
                <StatsCard
                  title="معدل التسليم"
                  value={`${storeStats?.delivery_percentage || 0}%`}
                  color="purple"
                  compact
                />
              </div>

              {/* الطلبات */}
              <SectionCard title={`طلبات المتجر (${total})`}>
                <Table
                  columns={[
                    { key: 'order_code', label: 'الكود', sortable: true },
                    { key: 'customer_phone', label: 'الهاتف' },
                    { key: 'employee_name', label: 'الموظفة' },
                    {
                      key: 'client_status',
                      label: 'الحالة',
                      render: (status) => (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            status === 'رد و يستلم'
                              ? 'bg-green-100 text-green-800'
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
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    total,
                    page,
                    pageSize: 10,
                    onPageChange: setPage,
                  }}
                />
              </SectionCard>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
