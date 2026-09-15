'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: number
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'indigo'
  onClick?: () => void
  compact?: boolean
}

/**
 * بطاقة الإحصائيات - عرض رقم مهم مع اتجاه
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'blue',
  onClick,
  compact = false,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  }

  const iconColors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    amber: 'text-amber-600 bg-amber-100',
    purple: 'text-purple-600 bg-purple-100',
    indigo: 'text-indigo-600 bg-indigo-100',
  }

  if (compact) {
    return (
      <div
        className={`border rounded-lg p-3 ${colorClasses[color]} cursor-pointer hover:shadow-md transition-shadow`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${iconColors[color]}`}>
            {icon || <Activity size={24} />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-4xl font-bold mb-2">{value}</p>

          {/* Subtitle */}
          {subtitle && <p className="text-xs text-gray-600 mb-2">{subtitle}</p>}

          {/* Trend */}
          {trendValue && (
            <div className="flex items-center gap-1 mt-4 text-sm">
              {trend === 'up' && (
                <>
                  <TrendingUp size={16} className="text-green-600" />
                  <span className="text-green-600 font-medium">
                    +{trendValue}% عن الأسبوع الماضي
                  </span>
                </>
              )}
              {trend === 'down' && (
                <>
                  <TrendingDown size={16} className="text-red-600" />
                  <span className="text-red-600 font-medium">
                    -{trendValue}% عن الأسبوع الماضي
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div className={`p-3 rounded-lg ${iconColors[color]} flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * مجموعة بطاقات الإحصائيات
 */
interface StatsGridProps {
  stats: StatsCardProps[]
  columns?: 1 | 2 | 3 | 4
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, columns = 4 }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-4`}>
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  )
}
