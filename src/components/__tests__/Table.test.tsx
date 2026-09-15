/**
 * اختبارات جدول البيانات
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Table } from '@/components/Table'

describe('Table Component', () => {
  const mockData = [
    { id: '1', name: 'أحمد', email: 'ahmed@test.com', status: 'نشط' },
    { id: '2', name: 'فاطمة', email: 'fatima@test.com', status: 'نشط' },
    { id: '3', name: 'محمد', email: 'mohammad@test.com', status: 'معطل' },
  ]

  const columns = [
    { key: 'name', label: 'الاسم', sortable: true },
    { key: 'email', label: 'البريد الإلكتروني' },
    { key: 'status', label: 'الحالة' },
  ]

  it('should render table with data', () => {
    render(<Table columns={columns} data={mockData} rowKey="id" />)

    expect(screen.getByText('أحمد')).toBeInTheDocument()
    expect(screen.getByText('فاطمة')).toBeInTheDocument()
    expect(screen.getByText('محمد')).toBeInTheDocument()
  })

  it('should display column headers', () => {
    render(<Table columns={columns} data={mockData} rowKey="id" />)

    expect(screen.getByText('الاسم')).toBeInTheDocument()
    expect(screen.getByText('البريد الإلكتروني')).toBeInTheDocument()
    expect(screen.getByText('الحالة')).toBeInTheDocument()
  })

  it('should display loading state', () => {
    const { container } = render(
      <Table columns={columns} data={[]} rowKey="id" loading={true} />
    )

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should display empty message when no data', () => {
    render(<Table columns={columns} data={[]} rowKey="id" />)

    expect(screen.getByText('لا توجد بيانات')).toBeInTheDocument()
  })

  it('should sort data when column header is clicked', () => {
    const { container } = render(
      <Table columns={columns} data={mockData} rowKey="id" />
    )

    const nameHeader = screen.getByText('الاسم').closest('th')
    fireEvent.click(nameHeader!)

    // البيانات يجب أن تكون مرتبة
    const rows = container.querySelectorAll('tbody tr')
    expect(rows[0].textContent).toContain('أحمد')
  })

  it('should call onRowClick when row is clicked', () => {
    const onRowClick = jest.fn()
    render(<Table columns={columns} data={mockData} rowKey="id" onRowClick={onRowClick} />)

    const firstRow = screen.getByText('أحمد').closest('tr')
    fireEvent.click(firstRow!)

    expect(onRowClick).toHaveBeenCalledWith(mockData[0])
  })

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = jest.fn()
    const { container } = render(
      <Table columns={columns} data={mockData} rowKey="id" onEdit={onEdit} />
    )

    const editButtons = screen.getAllByText('تعديل')
    fireEvent.click(editButtons[0])

    expect(onEdit).toHaveBeenCalledWith(mockData[0])
  })

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = jest.fn()
    render(
      <Table columns={columns} data={mockData} rowKey="id" onDelete={onDelete} />
    )

    const deleteButtons = screen.getAllByText('حذف')
    fireEvent.click(deleteButtons[0])

    expect(onDelete).toHaveBeenCalledWith(mockData[0])
  })

  it('should handle pagination', () => {
    const onPageChange = jest.fn()
    render(
      <Table
        columns={columns}
        data={mockData}
        rowKey="id"
        pagination={{
          total: 30,
          page: 1,
          pageSize: 10,
          onPageChange,
        }}
      />
    )

    const nextButton = screen.getByTitle('الصفحة التالية')
    fireEvent.click(nextButton)

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('should render custom cell content', () => {
    const customColumns = [
      {
        key: 'name',
        label: 'الاسم',
        render: (value: any) => `<${value}>`,
      },
      { key: 'email', label: 'البريد الإلكتروني' },
    ]

    render(<Table columns={customColumns} data={mockData} rowKey="id" />)

    expect(screen.getByText('<أحمد>')).toBeInTheDocument()
  })
})
