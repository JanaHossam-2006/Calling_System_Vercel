'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Form, SectionCard, StatsCard } from '@/components'
import { statsService } from '@/services/statsService'
import { BarChart3, TrendingUp, Calendar } from 'lucide-react'

/**
 * صفحة التقارير
 */
export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyReport, setDailyReport] = useState<any>(null)
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadReportData()
  }, [selectedDate])

  const loadReportData = async () => {
    try {
      setLoading(true)
      const [report, performanceTrends] = await Promise.all([
        statsService.getDailyReport(selectedDate),
        statsService.getPerformanceTrend(7),
      ])

      setDailyReport(report)
      setTrends(performanceTrends)
    } catch (error) {
      console.error('خطأ في تحميل التقارير:', error)
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { label: 'لوحة التحكم', href: '/dashboard/admin', icon: <BarChart3 size={20} /> },
    { label: 'التقارير', href: '/dashboard/admin/reports' },
  ]

  return (
    <Layout navItems={navItems} title="التقارير">
      <div className="space-y-6">
        {/* اختيار التاريخ */}
        <SectionCard title="اختر التاريخ">
          <div className="flex gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              اليوم
            </button>
          </div>
        </SectionCard>

        {/* التقرير اليومي */}
        {dailyReport && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <StatsCard
                title="إجمالي الطلبات"
                value={dailyReport.total}
                color="blue"
                compact
              />
              <StatsCard
                title="المسلمة"
                value={dailyReport.delivered}
                color="green"
                compact
              />
              <StatsCard
                title="معدل النجاح"
                value={`${dailyReport.percentage}%`}
                color="purple"
                compact
              />
            </div>

            {/* إحصائيات الموظفات */}
            <SectionCard title="إحصائيات الموظفات">
              <div className="space-y-3">
                {Object.entries(dailyReport.byEmployee).map(([empName, stats]: any) => (
                  <div key={empName} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{empName}</p>
                      <p className="text-xs text-gray-600">{stats.total} طلب</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{stats.percentage}%</p>
                      <p className="text-xs text-gray-600">{stats.delivered} مسلم</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* إحصائيات المتاجر */}
            <SectionCard title="إحصائيات المتاجر">
              <div className="space-y-3">
                {Object.entries(dailyReport.byStore).map(([storeName, stats]: any) => (
                  <div key={storeName} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{storeName}</p>
                      <p className="text-xs text-gray-600">{stats.total} طلب</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{stats.percentage}%</p>
                      <p className="text-xs text-gray-600">{stats.delivered} مسلم</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </>
        )}

        {/* اتجاهات الأداء */}
        <SectionCard title="اتجاهات الأداء (آخر 7 أيام)">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-sm font-semibold">التاريخ</th>
                  <th className="px-4 py-2 text-sm font-semibold">الطلبات</th>
                  <th className="px-4 py-2 text-sm font-semibold">المسلمة</th>
                  <th className="px-4 py-2 text-sm font-semibold">النسبة</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((trend: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(trend.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-4 py-3 text-sm">{trend.total}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      {trend.delivered}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold">{trend.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* إجراءات التقرير */}
        <SectionCard title="خيارات">
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
              تحميل PDF
            </button>
            <button className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
              تحميل Excel
            </button>
            <button className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
              إرسال بالبريد
            </button>
          </div>
        </SectionCard>
      </div>
    </Layout>
  )
}
