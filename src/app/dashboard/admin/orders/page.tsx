'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Table, SearchForm, Modal, Form, SectionCard } from '@/components'
import { orderService } from '@/services/orderService'
import { searchService } from '@/services/searchService'
import { BarChart3, Package, Trash2 } from 'lucide-react'

/**
 * صفحة جميع الطلبات (للمدير)
 */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(20)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadOrders()
  }, [page, searchQuery])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const offset = (page - 1) * pageSize

      let result
      if (searchQuery) {
        const searchResults = await searchService.advancedSearch({
          limit: pageSize,
          offset,
        })
        result = searchResults
      } else {
        result = await orderService.getAllOrders(pageSize, offset)
      }

      setOrders(result.orders)
      setTotal(result.total)
    } catch (error) {
      console.error('خطأ في تحميل الطلبات:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setPage(1)
  }

  const handleEdit = (order: any) => {
    setSelectedOrder(order)
    setShowEditModal(true)
  }

  const handleDelete = (order: any) => {
    setSelectedOrder(order)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await orderService.deleteOrder(selectedOrder.id)
      setShowDeleteModal(false)
      loadOrders()
    } catch (error) {
      console.error('خطأ في حذف الطلب:', error)
    }
  }

  const handleSaveOrder = async (values: any) => {
    try {
      await orderService.updateOrder(selectedOrder.id, values)
      setShowEditModal(false)
      loadOrders()
    } catch (error) {
      console.error('خطأ في تحديث الطلب:', error)
    }
  }

  const navItems = [
    { label: 'لوحة التحكم', href: '/dashboard/admin', icon: <BarChart3 size={20} /> },
    { label: 'جميع الطلبات', href: '/dashboard/admin/orders' },
    { label: 'الموظفات', href: '/dashboard/admin/employees' },
    { label: 'المتاجر', href: '/dashboard/admin/stores' },
  ]

  return (
    <Layout navItems={navItems} title="جميع الطلبات">
      <div className="space-y-6">
        {/* البحث */}
        <SectionCard title="البحث والتصفية">
          <SearchForm onSearch={handleSearch} placeholder="ابحث برقم الطلب أو رقم العميل..." />
        </SectionCard>

        {/* الجدول */}
        <SectionCard title={`الطلبات (${total})`}>
          <Table
            columns={[
              { key: 'order_code', label: 'كود الطلب', sortable: true, width: 'w-24' },
              { key: 'customer_phone', label: 'رقم العميل', width: 'w-32' },
              { key: 'employee_name', label: 'الموظفة', width: 'w-28' },
              { key: 'store', label: 'المتجر', width: 'w-28' },
              {
                key: 'client_status',
                label: 'الحالة',
                sortable: true,
                render: (status) => (
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      status === 'رد و يستلم'
                        ? 'bg-green-100 text-green-800'
                        : status === 'لم يرد'
                          ? 'bg-yellow-100 text-yellow-800'
                          : status === 'الغى الطلب'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {status || 'لم تحدد'}
                  </span>
                ),
              },
              {
                key: 'delivered',
                label: 'التسليم',
                render: (delivered) => (
                  <span className={delivered === 'yes' ? 'text-green-600 font-medium' : 'text-orange-600'}>
                    {delivered === 'yes' ? '✓ مسلم' : '⏳ معلق'}
                  </span>
                ),
              },
              {
                key: 'order_date',
                label: 'التاريخ',
                sortable: true,
                render: (date) => new Date(date).toLocaleDateString('ar-EG'),
              },
            ]}
            data={orders}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            rowKey="id"
            pagination={{
              total,
              page,
              pageSize,
              onPageChange: setPage,
            }}
          />
        </SectionCard>
      </div>

      {/* Modal التعديل */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`تعديل الطلب: ${selectedOrder?.order_code}`}
        size="lg"
        actions={[
          { label: 'حفظ', onClick: () => {}, variant: 'primary' },
          { label: 'إلغاء', onClick: () => setShowEditModal(false), variant: 'secondary' },
        ]}
      >
        {selectedOrder && (
          <Form
            fields={[
              {
                name: 'client_status',
                label: 'حالة العميل',
                type: 'select',
                value: selectedOrder.client_status,
                options: [
                  { label: 'معلق', value: '' },
                  { label: 'رد و يستلم', value: 'رد و يستلم' },
                  { label: 'لم يرد', value: 'لم يرد' },
                  { label: 'الغى الطلب', value: 'الغى الطلب' },
                  { label: 'تم الاستلام', value: 'تم الاستلام' },
                ],
              },
              {
                name: 'shipment_status',
                label: 'حالة الشحنة',
                type: 'select',
                value: selectedOrder.shipment_status,
                options: [
                  { label: 'معلق', value: '' },
                  { label: 'تم الشحن', value: 'تم الشحن' },
                  { label: 'في الطريق', value: 'في الطريق' },
                  { label: 'تم الاستلام', value: 'تم الاستلام' },
                ],
              },
              {
                name: 'admin_note',
                label: 'ملاحظة إدارية',
                type: 'textarea',
                value: selectedOrder.admin_note,
                placeholder: 'أضف ملاحظة...',
              },
            ]}
            onSubmit={handleSaveOrder}
            submitText="حفظ التعديلات"
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>

      {/* Modal الحذف */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="حذف الطلب"
        size="sm"
        actions={[
          { label: 'حذف', onClick: handleConfirmDelete, variant: 'danger' },
          { label: 'إلغاء', onClick: () => setShowDeleteModal(false), variant: 'secondary' },
        ]}
      >
        <p className="text-gray-700">
          هل أنت متأكد من رغبتك في حذف الطلب <strong>{selectedOrder?.order_code}</strong>؟
        </p>
        <p className="text-sm text-gray-600 mt-2">هذا الإجراء لا يمكن التراجع عنه.</p>
      </Modal>
    </Layout>
  )
}
