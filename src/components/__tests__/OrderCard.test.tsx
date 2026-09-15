/**
 * اختبارات بطاقة الطلب
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { OrderCard } from '@/components/OrderCard'
import { Order } from '@/types'

describe('OrderCard Component', () => {
  const mockOrder: Order = {
    id: '1',
    order_code: 'ORD001',
    customer_phone: '01012345678',
    employee_name: 'فاطمة أحمد',
    store: 'متجر الرياض',
    client_status: 'رد و يستلم',
    delivered: 'no',
    order_date: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  }

  it('should render order information correctly', () => {
    render(<OrderCard order={mockOrder} />)

    expect(screen.getByText('ORD001')).toBeInTheDocument()
    expect(screen.getByText('01012345678')).toBeInTheDocument()
    expect(screen.getByText('فاطمة أحمد')).toBeInTheDocument()
    expect(screen.getByText('متجر الرياض')).toBeInTheDocument()
  })

  it('should display correct status badge', () => {
    render(<OrderCard order={mockOrder} />)

    const statusBadge = screen.getByText('رد و يستلم')
    expect(statusBadge).toBeInTheDocument()
    expect(statusBadge).toHaveClass('bg-green-100')
  })

  it('should call onViewDetails when details button is clicked', () => {
    const onViewDetails = jest.fn()
    render(<OrderCard order={mockOrder} onViewDetails={onViewDetails} />)

    const detailsButton = screen.getByText('التفاصيل')
    fireEvent.click(detailsButton)

    expect(onViewDetails).toHaveBeenCalledWith(mockOrder)
  })

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<OrderCard order={mockOrder} onEdit={onEdit} />)

    const editButton = screen.getByText('تعديل')
    fireEvent.click(editButton)

    expect(onEdit).toHaveBeenCalledWith(mockOrder)
  })

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = jest.fn()
    render(<OrderCard order={mockOrder} onDelete={onDelete} />)

    const deleteButton = screen.getByText('حذف')
    fireEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('should render in compact mode', () => {
    const { container } = render(<OrderCard order={mockOrder} compact={true} />)

    const card = container.querySelector('.rounded-lg')
    expect(card).toHaveClass('p-3')
  })

  it('should display delivery status', () => {
    render(<OrderCard order={mockOrder} />)

    const deliveryStatus = screen.getByText('⏳ لم يسلم')
    expect(deliveryStatus).toBeInTheDocument()
  })

  it('should display delivered status when delivered', () => {
    const deliveredOrder = { ...mockOrder, delivered: 'yes' }
    render(<OrderCard order={deliveredOrder} />)

    const deliveryStatus = screen.getByText('✓ تم التسليم')
    expect(deliveryStatus).toBeInTheDocument()
  })
})
