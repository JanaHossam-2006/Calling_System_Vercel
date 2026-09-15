'use client'

import React, { useState } from 'react'
import { AlertCircle } from 'lucide-react'

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'phone' | 'number'
  value?: any
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: { label: string; value: any }[]
  rows?: number
  pattern?: string
  min?: number
  max?: number
  onChange?: (value: any) => void
  error?: string
}

interface FormProps {
  fields: FormField[]
  onSubmit: (values: Record<string, any>) => void | Promise<void>
  submitText?: string
  loading?: boolean
  cancelText?: string
  onCancel?: () => void
  direction?: 'rtl' | 'ltr'
}

/**
 * نموذج متقدم مع معالجة الأخطاء والتحقق
 */
export const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  submitText = 'حفظ',
  loading = false,
  cancelText,
  onCancel,
  direction = 'rtl',
}) => {
  const [values, setValues] = useState<Record<string, any>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: field.value || '' }), {})
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    // تنظيف الخطأ عند التغيير
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = values[field.name]

      if (field.required && !value) {
        newErrors[field.name] = `${field.label} مطلوب`
      } else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          newErrors[field.name] = 'البريد الإلكتروني غير صحيح'
        }
      } else if (field.type === 'phone' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/
        if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
          newErrors[field.name] = 'رقم الهاتف غير صحيح'
        }
      } else if (field.pattern && value) {
        const regex = new RegExp(field.pattern)
        if (!regex.test(value)) {
          newErrors[field.name] = `${field.label} غير صحيح`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error: any) {
      setErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} dir={direction} className="space-y-4">
      {/* General Error */}
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Fields */}
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-600 ml-1">*</span>}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 4}
              disabled={field.disabled || loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors[field.name]
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              } disabled:bg-gray-50 disabled:cursor-not-allowed`}
            />
          ) : field.type === 'select' ? (
            <select
              name={field.name}
              value={values[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={field.disabled || loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors[field.name]
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              } disabled:bg-gray-50 disabled:cursor-not-allowed`}
            >
              <option value="">اختر {field.label}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              name={field.name}
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || loading}
              pattern={field.pattern}
              min={field.min}
              max={field.max}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors[field.name]
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              } disabled:bg-gray-50 disabled:cursor-not-allowed`}
            />
          )}

          {/* Field Error */}
          {errors[field.name] && (
            <p className="text-red-600 text-sm mt-1">{errors[field.name]}</p>
          )}
        </div>
      ))}

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
              جاري الحفظ...
            </span>
          ) : (
            submitText
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || loading}
            className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText || 'إلغاء'}
          </button>
        )}
      </div>
    </form>
  )
}

/**
 * نموذج بسيط للبحث
 */
interface SearchFormProps {
  onSearch: (query: string) => void
  placeholder?: string
  loading?: boolean
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  placeholder = 'ابحث...',
  loading = false,
}) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        disabled={loading}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
      />
      <button
        type="submit"
        disabled={loading || !query}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
        ) : (
          'بحث'
        )}
      </button>
    </form>
  )
}
