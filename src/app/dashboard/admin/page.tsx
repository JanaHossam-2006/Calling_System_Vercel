'use client'

import React, { useState, useEffect } from 'react'
import { Layout, StatsGrid, StatsCard, Table, SectionCard, EmptyState } from '@/components'
import { statsService } from '@/services/statsService'
import { orderService } from '@/services/orderService'
import { searchService } from '@/services/searchService'
import {
  Package,
  Users,
  Store,
  TrendingUp,
  CheckCircle,
  XCircle,
  Phone,
  BarChart3,
  Calendar,
} from 'lucide-react'

/**
 * لوحة المدير - عرض شامل لجميع الإحصائيات
 */
export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [topEmployees, setTopEmployees] = useState([])
  const [topStores, setTopStores] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [stats, setStats] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadDashboardData()
  }, [selectedDate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // تحميل البيانات
      const [dashboardData, employees, stores, orders, quickStats] = await Promise.all([
        statsService.getAdminDashboard(),
        statsService.getEmployeeRanking(5),
        statsService.getStoreRanking(5),
        orderService.getAllOrders(5),
        statsService.getQuickStats(),
      ])

      setDashboard(dashboardData)
      setTopEmployees(employees)
      setTopStores(stores)
      setRecentOrders(orders.orders)
      setStats(quickStats)
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error)
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { label: 'لوحة التحكم', href: '/dashboard/admin', icon: <BarChart3 size={20} /> },
    { label: 'جميع الطلبات', href: '/dashboard/admin/orders' },
    { label: 'الموظفات', href: '/dashboard/admin/employees' },
    { label: 'المتاجر', href: '/dashboard/admin/stores' },
    { label: 'التقارير', href: '/dashboard/admin/reports' },
    { label: 'الإعدادات', href: '/dashboard/admin/settings' },
  ]

  if (loading) {
    return (
      <Layout navItems={navItems} title="لوحة المدير">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout navItems={navItems} title="لوحة المدير الرئيسية">
      <div className="space-y-6">
        {/* الإحصائيات الرئيسية */}
        <StatsGrid
          stats={[
            {
              title: 'إجمالي الطلبات',
              value: dashboard?.totalOrders || 0,
              icon: <Package size={24} />,
              color: 'blue',
              subtitle: 'جميع الطلبات',
            },
            {
              title: 'المسلمة',
              value: dashboard?.deliveredCount || 0,
              icon: <CheckCircle size={24} />,
              color: 'green',
              subtitle: `${stats?.percentage || 0}% من الإجمالي`,
              trend: 'up',
              trendValue: 5,
            },
            {
              title: 'الملغاة',
              value: dashboard?.cancelledCount || 0,
              icon: <XCircle size={24} />,
              color: 'red',
              subtitle: 'طلبات ملغاة',
            },
            {
              title: 'لم يرد',
              value: dashboard?.noAnswerCount || 0,
              icon: <Phone size={24} />,
              color: 'amber',
              subtitle: 'عملاء لم يردوا',
            },
          ]}
          columns={4}
        />

        {/* الموظفات والمتاجر */}
        <div className="grid grid-cols-2 gap-6">
          <StatsCard
            title="عدد الموظفات"
            value={dashboard?.employeeCount || 0}
            icon={<Users size={24} />}
            color="purple"
          />
          <StatsCard
            title="عدد المتاجر"
            value={dashboard?.storeCount || 0}
            icon={<Store size={24} />}
            color="indigo"
          />
        </div>

        {/* ترتيب الموظفات */}
        <SectionCard title="الموظفات الأفضل أداءً" action={{ label: 'عرض الكل', onClick: () => {} }}>
          {topEmployees.length > 0 ? (
            <div className="space-y-3">
              {topEmployees.map((emp: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-blue-600 w-8 text-center">#{emp.rank}</span>
                    <div>
                      <p className="font-medium text-gray-900">{emp.employee_name}</p>
                      <p className="text-xs text-gray-600">{emp.total_orders} طلب</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{emp.delivery_percentage}%</p>
                    <p className="text-xs text-gray-600">معدل التسليم</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users size={48} />}
              title="لا توجد بيانات"
              description="لا توجد موظفات حالياً"
            />
          )}
        </SectionCard>

        {/* ترتيب المتاجر */}
        <SectionCard title="المتاجر الأفضل أداءً" action={{ label: 'عرض الكل', onClick: () => {} }}>
          {topStores.length > 0 ? (
            <div className="space-y-3">
              {topStores.map((store: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-blue-600 w-8 text-center">#{store.rank}</span>
                    <div>
                      <p className="font-medium text-gray-900">{store.store}</p>
                      <p className="text-xs text-gray-600">{store.total_orders} طلب</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{store.delivery_percentage}%</p>
                    <p className="text-xs text-gray-600">معدل التسليم</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Store size={48} />}
              title="لا توجد بيانات"
              description="لا توجد متاجر حالياً"
            />
          )}
        </SectionCard>

        {/* الطلبات الحديثة */}
        <SectionCard title="الطلبات الحديثة" action={{ label: 'عرض الكل', onClick: () => {} }}>
          {recentOrders.length > 0 ? (
            <Table
              columns={[
                { key: 'order_code', label: 'كود الطلب', sortable: true, width: 'w-24' },
                { key: 'customer_phone', label: 'رقم العميل', width: 'w-32' },
                { key: 'employee_name', label: 'الموظفة', width: 'w-28' },
                { key: 'store', label: 'المتجر', width: 'w-28' },
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
                      {status || 'لم تحدد'}
                    </span>
                  ),
                },
                {
                  key: 'order_date',
                  label: 'التاريخ',
                  render: (date) => new Date(date).toLocaleDateString('ar-EG'),
                },
              ]}
              data={recentOrders}
              rowKey="id"
              loading={loading}
            />
          ) : (
            <EmptyState
              icon={<Package size={48} />}
              title="لا توجد طلبات"
              description="لم تجد أي طلبات حالياً"
            />
          )}
        </SectionCard>

        {/* إحصائيات الحالات */}
        <div className="grid grid-cols-2 gap-6">
          <SectionCard title="حالات العميل">
            {dashboard?.clientStatuses && dashboard.clientStatuses.length > 0 ? (
              <div className="space-y-2">
                {dashboard.clientStatuses.slice(0, 5).map((status: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{status.client_status || 'لم تحدد'}</span>
                    <span className="text-sm font-medium">{status.total_orders}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Phone size={32} />} title="لا توجد بيانات" description="" />
            )}
          </SectionCard>

          <SectionCard title="حالات الشحنة">
            {dashboard?.shipmentStatuses && dashboard.shipmentStatuses.length > 0 ? (
              <div className="space-y-2">
                {dashboard.shipmentStatuses.slice(0, 5).map((status: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{status.shipment_status || 'لم تحدد'}</span>
                    <span className="text-sm font-medium">{status.total_orders}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Package size={32} />} title="لا توجد بيانات" description="" />
            )}
          </SectionCard>
        </div>
      </div>
    </Layout>
  )
}
