/**
 * اختبارات النموذج
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, FormField } from '@/components/Form'

describe('Form Component', () => {
  const mockFields: FormField[] = [
    {
      name: 'email',
      label: 'البريد الإلكتروني',
      type: 'email',
      required: true,
      placeholder: 'example@test.com',
    },
    {
      name: 'password',
      label: 'كلمة المرور',
      type: 'password',
      required: true,
      placeholder: 'أدخل كلمة المرور',
    },
    {
      name: 'name',
      label: 'الاسم',
      type: 'text',
      placeholder: 'أدخل الاسم',
    },
  ]

  it('should render all form fields', () => {
    const onSubmit = jest.fn()
    render(<Form fields={mockFields} onSubmit={onSubmit} />)

    expect(screen.getByLabelText('البريد الإلكتروني')).toBeInTheDocument()
    expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument()
    expect(screen.getByLabelText('الاسم')).toBeInTheDocument()
  })

  it('should display required indicator for required fields', () => {
    const onSubmit = jest.fn()
    render(<Form fields={mockFields} onSubmit={onSubmit} />)

    const emailLabel = screen.getByText('البريد الإلكتروني').closest('label')
    expect(emailLabel).toHaveTextContent('*')
  })

  it('should validate required fields on submit', async () => {
    const onSubmit = jest.fn()
    render(<Form fields={mockFields} onSubmit={onSubmit} />)

    const submitButton = screen.getByText('حفظ')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('البريد الإلكتروني مطلوب')).toBeInTheDocument()
      expect(screen.getByText('كلمة المرور مطلوب')).toBeInTheDocument()
    })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('should validate email format', async () => {
    const onSubmit = jest.fn()
    render(<Form fields={mockFields} onSubmit={onSubmit} />)

    const emailInput = screen.getByPlaceholderText('example@test.com') as HTMLInputElement
    await userEvent.type(emailInput, 'invalid-email')

    const submitButton = screen.getByText('حفظ')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('البريد الإلكتروني غير صحيح')).toBeInTheDocument()
    })
  })

  it('should call onSubmit with valid data', async () => {
    const onSubmit = jest.fn()
    render(<Form fields={mockFields} onSubmit={onSubmit} />)

    const emailInput = screen.getByPlaceholderText('example@test.com')
    const passwordInput = screen.getByPlaceholderText('أدخل كلمة المرور')

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'password123')

    const submitButton = screen.getByText('حفظ')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: '',
      })
    })
  })

  it('should display submit button text', () => {
    const onSubmit = jest.fn()
    render(<Form fields={mockFields} onSubmit={onSubmit} submitText="إرسال" />)

    expect(screen.getByText('إرسال')).toBeInTheDocument()
  })

  it('should display cancel button when onCancel is provided', () => {
    const onSubmit = jest.fn()
    const onCancel = jest.fn()
    render(
      <Form
        fields={mockFields}
        onSubmit={onSubmit}
        cancelText="إلغاء"
        onCancel={onCancel}
      />
    )

    const cancelButton = screen.getByText('إلغاء')
    expect(cancelButton).toBeInTheDocument()

    fireEvent.click(cancelButton)
    expect(onCancel).toHaveBeenCalled()
  })

  it('should handle select field', () => {
    const selectField: FormField = {
      name: 'status',
      label: 'الحالة',
      type: 'select',
      options: [
        { label: 'نشط', value: 'active' },
        { label: 'معطل', value: 'inactive' },
      ],
    }

    const onSubmit = jest.fn()
    render(
      <Form
        fields={[selectField]}
        onSubmit={onSubmit}
      />
    )

    const selectElement = screen.getByDisplayValue('اختر الحالة')
    expect(selectElement).toBeInTheDocument()

    fireEvent.change(selectElement, { target: { value: 'active' } })
    expect((selectElement as HTMLSelectElement).value).toBe('active')
  })

  it('should handle textarea field', () => {
    const textareaField: FormField = {
      name: 'notes',
      label: 'الملاحظات',
      type: 'textarea',
      rows: 4,
    }

    const onSubmit = jest.fn()
    render(
      <Form
        fields={[textareaField]}
        onSubmit={onSubmit}
      />
    )

    const textarea = screen.getByLabelText('الملاحظات')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('rows', '4')
  })

  it('should disable submit button when loading', () => {
    const onSubmit = jest.fn()
    render(<Form fields={mockFields} onSubmit={onSubmit} loading={true} />)

    const submitButton = screen.getByText('جاري الحفظ...')
    expect(submitButton).toBeDisabled()
  })

  it('should handle phone field validation', async () => {
    const phoneField: FormField = {
      name: 'phone',
      label: 'رقم الهاتف',
      type: 'phone',
      required: true,
    }

    const onSubmit = jest.fn()
    render(<Form fields={[phoneField]} onSubmit={onSubmit} />)

    const phoneInput = screen.getByLabelText('رقم الهاتف')
    await userEvent.type(phoneInput, '123')

    const submitButton = screen.getByText('حفظ')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('رقم الهاتف غير صحيح')).toBeInTheDocument()
    })
  })
})
