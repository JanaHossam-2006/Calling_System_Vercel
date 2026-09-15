'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Table, SectionCard, StatsCard } from '@/components'
import { statsService } from '@/services/statsService'
import { orderService } from '@/services/orderService'
import { BarChart3, Users, TrendingUp } from 'lucide-react'

/**
 * صفحة الموظفات والإحصائيات
 */
export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [employeeStats, setEmployeeStats] = useState<any>(null)
  const [employeeOrders, setEmployeeOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadEmployees()
  }, [])

  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeDetails()
    }
  }, [selectedEmployee, page])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const stats = await statsService.getAllEmployeeStats()
      setEmployees(stats)
      if (stats.length > 0) {
        setSelectedEmployee(stats[0])
      }
    } catch (error) {
      console.error('خطأ في تحميل الموظفات:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEmployeeDetails = async () => {
    try {
      if (!selectedEmployee?.employee_name) return

      const [stats, orders] = await Promise.all([
        statsService.getEmployeeStats(selectedEmployee.employee_name),
        orderService.getEmployeeOrders(selectedEmployee.employee_name, 10, (page - 1) * 10),
      ])

      setEmployeeStats(stats)
      setEmployeeOrders(orders.orders)
    } catch (error) {
      console.error('خطأ في تحميل بيانات الموظفة:', error)
    }
  }

  const navItems = [
    { label: 'لوحة التحكم', href: '/dashboard/admin', icon: <BarChart3 size={20} /> },
    { label: 'جميع الطلبات', href: '/dashboard/admin/orders' },
    { label: 'الموظفات', href: '/dashboard/admin/employees' },
    { label: 'المتاجر', href: '/dashboard/admin/stores' },
  ]

  return (
    <Layout navItems={navItems} title="الموظفات">
      <div className="grid grid-cols-3 gap-6">
        {/* قائمة الموظفات */}
        <div>
          <SectionCard title="قائمة الموظفات">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {employees.map((emp: any, index: number) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedEmployee(emp)
                    setPage(1)
                  }}
                  className={`w-full p-3 rounded text-right transition ${
                    selectedEmployee?.employee_name === emp.employee_name
                      ? 'bg-blue-100 border-2 border-blue-600'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-900">{emp.employee_name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {emp.delivery_percentage}% استلام • {emp.total_orders} طلب
                  </p>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* التفاصيل والطلبات */}
        <div className="col-span-2 space-y-6">
          {selectedEmployee && (
            <>
              {/* الإحصائيات */}
              <div className="grid grid-cols-3 gap-4">
                <StatsCard
                  title="إجمالي الطلبات"
                  value={employeeStats?.total_orders || 0}
                  color="blue"
                  compact
                />
                <StatsCard
                  title="المسلمة"
                  value={employeeStats?.delivered_count || 0}
                  color="green"
                  compact
                />
                <StatsCard
                  title="معدل التسليم"
                  value={`${employeeStats?.delivery_percentage || 0}%`}
                  color="purple"
                  compact
                />
              </div>

              {/* الطلبات الحديثة */}
              <SectionCard title="الطلبات الحديثة">
                <Table
                  columns={[
                    { key: 'order_code', label: 'الكود', sortable: true },
                    { key: 'customer_phone', label: 'الهاتف' },
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
                  data={employeeOrders}
                  rowKey="id"
                  loading={loading}
                />
              </SectionCard>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
