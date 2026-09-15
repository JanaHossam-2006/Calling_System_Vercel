'use client'

import React, { useState, useEffect } from 'react'
import { Layout, StatsGrid, StatsCard, Table, SectionCard, OrderCard } from '@/components'
import { orderService } from '@/services/orderService'
import { statsService } from '@/services/statsService'
import { followUpService } from '@/services/followUpService'
import { searchService } from '@/services/searchService'
import { Package, CheckCircle, Phone, Calendar, AlertCircle, BarChart3 } from 'lucide-react'

/**
 * لوحة الموظفة
 */
export default function EmployeeDashboard() {
  const [employeeStats, setEmployeeStats] = useState<any>(null)
  const [myOrders, setMyOrders] = useState([])
  const [pendingOrders, setPendingOrders] = useState([])
  const [followUps, setFollowUps] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  // Note: في بيئة الإنتاج، سيتم الحصول على اسم الموظفة من جلسة المستخدم
  const employeeName = 'فاطمة أحمد'

  useEffect(() => {
    loadDashboardData()
  }, [page])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const offset = (page - 1) * pageSize

      const [stats, orders, pending, ups] = await Promise.all([
        statsService.getEmployeeStats(employeeName),
        orderService.getEmployeeOrders(employeeName, pageSize, offset),
        searchService.searchPendingOrders(employeeName),
        followUpService.getEmployeeFollowUps(employeeName, 5),
      ])

      setEmployeeStats(stats)
      setMyOrders(orders.orders)
      setPendingOrders(pending)
      setFollowUps(ups.followUps)
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error)
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { label: 'لوحتي', href: '/dashboard/employee', icon: <BarChart3 size={20} /> },
    { label: 'طلباتي', href: '/dashboard/employee/orders' },
    { label: 'المتابعات', href: '/dashboard/employee/follow-ups' },
  ]

  return (
    <Layout
      navItems={navItems}
      title="لوحة الموظفة"
      userName={employeeName}
      userRole="موظفة"
    >
      <div className="space-y-6">
        {/* الإحصائيات الرئيسية */}
        <StatsGrid
          stats={[
            {
              title: 'إجمالي طلباتي',
              value: employeeStats?.total_orders || 0,
              icon: <Package size={24} />,
              color: 'blue',
            },
            {
              title: 'المسلمة',
              value: employeeStats?.delivered_count || 0,
              icon: <CheckCircle size={24} />,
              color: 'green',
              trendValue: 5,
              trend: 'up',
            },
            {
              title: 'المعلقة',
              value: employeeStats?.not_delivered_count || 0,
              icon: <Phone size={24} />,
              color: 'amber',
            },
            {
              title: 'معدل التسليم',
              value: `${employeeStats?.delivery_percentage || 0}%`,
              icon: <BarChart3 size={24} />,
              color: 'purple',
            },
          ]}
          columns={4}
        />

        {/* الطلبات المعلقة (التي تحتاج متابعة) */}
        {pendingOrders.length > 0 && (
          <SectionCard title={`طلبات تحتاج متابعة (${pendingOrders.length})`}>
            <div className="space-y-4">
              {pendingOrders.slice(0, 3).map((order: any) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  compact
                  onViewDetails={() => console.log('View details')}
                />
              ))}
            </div>
          </SectionCard>
        )}

        {/* المتابعات القادمة */}
        {followUps.length > 0 && (
          <SectionCard title="المتابعات القادمة">
            <div className="space-y-3">
              {followUps.map((followUp: any) => (
                <div
                  key={followUp.id}
                  className="p-3 bg-blue-50 border border-blue-200 rounded flex items-start gap-3"
                >
                  <Calendar size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">الطلب: {followUp.order_code}</p>
                    <p className="text-sm text-gray-600">
                      {followUp.customer_phone} • {new Date(followUp.follow_up_date).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* جميع الطلبات */}
        <SectionCard title={`طلباتي (${employeeStats?.total_orders || 0})`}>
          <Table
            columns={[
              { key: 'order_code', label: 'الكود', sortable: true },
              { key: 'customer_phone', label: 'رقم العميل' },
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
            data={myOrders}
            loading={loading}
            rowKey="id"
            pagination={{
              total: employeeStats?.total_orders || 0,
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
