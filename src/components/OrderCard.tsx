'use client'

import React from 'react'
import { Order } from '@/types'
import { Phone, MapPin, User, Calendar, AlertCircle } from 'lucide-react'

interface OrderCardProps {
  order: Order
  onEdit?: (order: Order) => void
  onDelete?: (orderId: string) => void
  onViewDetails?: (order: Order) => void
  compact?: boolean
}

/**
 * بطاقة الطلب - عرض ملخص معلومات الطلب
 */
export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onEdit,
  onDelete,
  onViewDetails,
  compact = false,
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'رد و يستلم':
        return 'bg-green-50 border-green-200'
      case 'لم يرد':
        return 'bg-yellow-50 border-yellow-200'
      case 'الغى الطلب':
        return 'bg-red-50 border-red-200'
      case 'تم الاستلام':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'رد و يستلم':
        return 'bg-green-100 text-green-800'
      case 'لم يرد':
        return 'bg-yellow-100 text-yellow-800'
      case 'الغى الطلب':
        return 'bg-red-100 text-red-800'
      case 'تم الاستلام':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (compact) {
    return (
      <div
        className={`border rounded-lg p-3 ${getStatusColor(order.client_status)} cursor-pointer hover:shadow-md transition-shadow`}
        onClick={() => onViewDetails?.(order)}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">{order.order_code}</p>
            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
              <Phone size={14} />
              {order.customer_phone}
            </p>
          </div>
          {order.client_status && (
            <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(order.client_status)}`}>
              {order.client_status}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor(order.client_status)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{order.order_code}</h3>
          <p className="text-xs text-gray-500 mt-1">
            <Calendar size={14} className="inline mr-1" />
            {new Date(order.order_date).toLocaleDateString('ar-EG')}
          </p>
        </div>
        {order.client_status && (
          <span className={`text-xs px-3 py-1 rounded-full ${getStatusBadgeColor(order.client_status)}`}>
            {order.client_status}
          </span>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-600">العميل</p>
          <p className="text-sm font-medium flex items-center gap-1">
            <Phone size={14} />
            {order.customer_phone}
          </p>
        </div>
        {order.employee_name && (
          <div>
            <p className="text-xs text-gray-600">الموظفة</p>
            <p className="text-sm font-medium flex items-center gap-1">
              <User size={14} />
              {order.employee_name}
            </p>
          </div>
        )}
        {order.store && (
          <div>
            <p className="text-xs text-gray-600">المتجر</p>
            <p className="text-sm font-medium flex items-center gap-1">
              <MapPin size={14} />
              {order.store}
            </p>
          </div>
        )}
        {order.product_name && (
          <div>
            <p className="text-xs text-gray-600">المنتج</p>
            <p className="text-sm font-medium truncate">{order.product_name}</p>
          </div>
        )}
      </div>

      {/* Notes */}
      {order.order_note && (
        <div className="mb-4 p-2 bg-white bg-opacity-60 rounded">
          <p className="text-xs text-gray-700">
            <AlertCircle size={14} className="inline mr-1" />
            {order.order_note}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs mb-4 py-2 border-t border-b border-gray-200">
        <span>
          {order.delivered === 'yes' ? (
            <span className="text-green-600 font-medium">✓ تم التسليم</span>
          ) : (
            <span className="text-orange-600">⏳ لم يسلم</span>
          )}
        </span>
        {order.call_attempts && (
          <span className="text-gray-600">
            محاولات: <strong>{order.call_attempts}</strong>
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(order)}
            className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 transition"
          >
            التفاصيل
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(order)}
            className="flex-1 bg-amber-600 text-white text-sm py-2 rounded hover:bg-amber-700 transition"
          >
            تعديل
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(order.id)}
            className="flex-1 bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700 transition"
          >
            حذف
          </button>
        )}
      </div>
    </div>
  )
}
