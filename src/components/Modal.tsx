'use client'

import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  actions?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'danger'
    loading?: boolean
  }[]
}

/**
 * نافذة منبثقة (Modal)
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  actions,
}) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-xl',
  }

  const getButtonColor = (variant?: string) => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-300 text-gray-900 hover:bg-gray-400'
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700'
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative ${sizeClasses[size]} bg-white rounded-lg shadow-xl`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition"
              title="إغلاق"
            >
              <X size={24} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-4">{children}</div>

        {/* Footer */}
        {actions && actions.length > 0 && (
          <div className="flex gap-2 justify-end p-4 border-t">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.loading}
                className={`px-4 py-2 rounded font-medium transition ${getButtonColor(
                  action.variant
                )} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {action.loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
                    {action.label}
                  </span>
                ) : (
                  action.label
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * نافذة التأكيد
 */
interface ConfirmModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  loading?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'نعم، تأكيد',
  cancelText = 'إلغاء',
  isDangerous = false,
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      actions={[
        {
          label: cancelText,
          onClick: onCancel,
          variant: 'secondary',
        },
        {
          label: confirmText,
          onClick: onConfirm,
          variant: isDangerous ? 'danger' : 'primary',
          loading,
        },
      ]}
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  )
}
