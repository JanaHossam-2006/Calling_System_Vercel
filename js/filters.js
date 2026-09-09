/**
 * Filters Management
 * إدارة الفلاتر والتصفية
 */

class Filters {
    static selectedFilters = {
        employees: [],
        stores: [],
        clientStatus: [],
        shipmentStatus: [],
        deliveryStatus: [],
        months: [],
        days: []
    };

    static async initFilters() {
        try {
            await this.loadEmployees();
            await this.loadStores();
            await this.loadClientStatuses();
            await this.loadShipmentStatuses();
            await this.loadDeliveryStatuses();
            this.loadMonthsAndDays();
        } catch (error) {
            console.error('Filter init error:', error);
        }
    }

    static async loadEmployees() {
        const { data: users } = await UsersAPI.getEmployees();
        if (!users) return;

        const optionsDiv = document.getElementById('employeeOptions');
        if (optionsDiv) {
            optionsDiv.innerHTML = users.map(emp => `
                <label class="multi-select-option">
                    <input type="checkbox" value="${emp.name}" onchange="Filters.toggleFilter('employees', '${emp.name}')">
                    <span>${emp.name}</span>
                </label>
            `).join('');
        }
    }

    static async loadStores() {
        const { data: stores } = await UsersAPI.getStores();
        if (!stores) return;

        const optionsDiv = document.getElementById('storeOptions');
        if (optionsDiv) {
            optionsDiv.innerHTML = stores.map(s => `
                <label class="multi-select-option">
                    <input type="checkbox" value="${s.store}" onchange="Filters.toggleFilter('stores', '${s.store}')">
                    <span>${s.store}</span>
                </label>
            `).join('');
        }
    }

    static async loadClientStatuses() {
        const statuses = [
            'رد و يستلم',
            'استبدال',
            'مرتجع',
            'مؤجل',
            'لم يرد',
            'تم التسليم'
        ];

        const optionsDiv = document.getElementById('clientStatusOptions');
        if (optionsDiv) {
            optionsDiv.innerHTML = statuses.map(status => `
                <label class="multi-select-option">
                    <input type="checkbox" value="${status}" onchange="Filters.toggleFilter('clientStatus', '${status}')">
                    <span>${status}</span>
                </label>
            `).join('');
        }
    }

    static async loadShipmentStatuses() {
        const statuses = [
            'بانتظار الشحن',
            'تم الشحن',
            'في الطريق',
            'وصل المخزن'
        ];

        const optionsDiv = document.getElementById('shipmentStatusOptions');
        if (optionsDiv) {
            optionsDiv.innerHTML = statuses.map(status => `
                <label class="multi-select-option">
                    <input type="checkbox" value="${status}" onchange="Filters.toggleFilter('shipmentStatus', '${status}')">
                    <span>${status}</span>
                </label>
            `).join('');
        }
    }

    static async loadDeliveryStatuses() {
        const statuses = [
            'مسلم',
            'غير مسلم',
            'بدون حالة'
        ];

        const optionsDiv = document.getElementById('deliveryStatusOptions');
        if (optionsDiv) {
            optionsDiv.innerHTML = statuses.map(status => `
                <label class="multi-select-option">
                    <input type="checkbox" value="${status}" onchange="Filters.toggleFilter('deliveryStatus', '${status}')">
                    <span>${status}</span>
                </label>
            `).join('');
        }
    }

    static loadMonthsAndDays() {
        const months = [
            { name: 'يناير', value: 1 },
            { name: 'فبراير', value: 2 },
            { name: 'مارس', value: 3 },
            { name: 'أبريل', value: 4 },
            { name: 'مايو', value: 5 },
            { name: 'يونيو', value: 6 },
            { name: 'يوليو', value: 7 },
            { name: 'أغسطس', value: 8 },
            { name: 'سبتمبر', value: 9 },
            { name: 'أكتوبر', value: 10 },
            { name: 'نوفمبر', value: 11 },
            { name: 'ديسمبر', value: 12 }
        ];

        const monthOptions = document.getElementById('monthOptions');
        if (monthOptions) {
            monthOptions.innerHTML = months.map(month => `
                <label class="multi-select-option">
                    <input type="checkbox" value="${month.value}" onchange="Filters.toggleFilter('months', '${month.value}')">
                    <span>${month.name}</span>
                </label>
            `).join('');
        }

        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        const dayOptions = document.getElementById('dayOptions');
        if (dayOptions) {
            dayOptions.innerHTML = days.map(day => `
                <label class="multi-select-option">
                    <input type="checkbox" value="${day}" onchange="Filters.toggleFilter('days', '${day}')">
                    <span>${day}</span>
                </label>
            `).join('');
        }
    }

    static toggleFilter(filterType, value) {
        const arr = this.selectedFilters[filterType];
        const index = arr.indexOf(value);

        if (index > -1) {
            arr.splice(index, 1);
        } else {
            arr.push(value);
        }

        this.updateFilterDisplay();
    }

    static updateFilterDisplay() {
        // Update displayed filter labels
        const updates = {
            'employeeSelected': 'employees',
            'storeSelected': 'stores',
            'clientStatusSelected': 'clientStatus',
            'shipmentStatusSelected': 'shipmentStatus',
            'deliveryStatusSelected': 'deliveryStatus'
        };

        Object.entries(updates).forEach(([elementId, filterKey]) => {
            const element = document.getElementById(elementId);
            if (element) {
                const count = this.selectedFilters[filterKey]?.length || 0;
                element.textContent = count > 0 ? `${count} محدد` : 'جميع البيانات';
            }
        });
    }

    static toggleDropdown(dropdownId) {
        const optionsDiv = document.getElementById(dropdownId.replace('Dropdown', 'Options'));
        if (optionsDiv) {
            optionsDiv.classList.toggle('active');
        }
    }

    static async applyFilters() {
        const filters = {
            employees: this.selectedFilters.employees.length > 0 ? this.selectedFilters.employees : null,
            stores: this.selectedFilters.stores.length > 0 ? this.selectedFilters.stores : null,
            clientStatus: this.selectedFilters.clientStatus.length > 0 ? this.selectedFilters.clientStatus : null,
            shipmentStatus: this.selectedFilters.shipmentStatus.length > 0 ? this.selectedFilters.shipmentStatus : null,
            deliveryStatus: this.selectedFilters.deliveryStatus.length > 0 ? this.selectedFilters.deliveryStatus : null
        };

        // Get all orders and apply client-side filtering
        const { data: allOrders } = await OrdersAPI.getAllOrders();
        if (!allOrders) return;

        let filtered = allOrders;

        if (filters.employees) {
            filtered = filtered.filter(o => filters.employees.includes(o.employee_name));
        }
        if (filters.stores) {
            filtered = filtered.filter(o => filters.stores.includes(o.store));
        }
        if (filters.clientStatus) {
            filtered = filtered.filter(o => filters.clientStatus.includes(o.client_status));
        }
        if (filters.shipmentStatus) {
            filtered = filtered.filter(o => filters.shipmentStatus.includes(o.shipment_status));
        }
        if (filters.deliveryStatus) {
            const statusMap = {
                'مسلم': 'yes',
                'غير مسلم': 'no'
            };
            filtered = filtered.filter(o => {
                if (filters.deliveryStatus.includes('مسلم') && o.delivered === 'yes') return true;
                if (filters.deliveryStatus.includes('غير مسلم') && o.delivered === 'no') return true;
                if (filters.deliveryStatus.includes('بدون حالة') && !o.client_status) return true;
                return false;
            });
        }

        // Update KPIs and display
        this.updateKPIsForFiltered(filtered);
        Dashboard.displayOrdersTable(filtered);
    }

    static updateKPIsForFiltered(orders) {
        const total = orders.length;
        const delivered = orders.filter(o => o.delivered === 'yes').length;
        const notDelivered = total - delivered;
        const percentage = total > 0 ? ((delivered / total) * 100).toFixed(2) : 0;

        document.getElementById('totalOrders').textContent = total;
        document.getElementById('deliveredOrders').textContent = delivered;
        document.getElementById('notDeliveredOrders').textContent = notDelivered;
        document.getElementById('deliveryPercentage').textContent = percentage + '%';
        document.getElementById('notDeliveredPercentage').textContent = (100 - percentage).toFixed(2) + '%';
    }

    static clearFilters() {
        this.selectedFilters = {
            employees: [],
            stores: [],
            clientStatus: [],
            shipmentStatus: [],
            deliveryStatus: [],
            months: [],
            days: []
        };

        // Uncheck all checkboxes
        document.querySelectorAll('.multi-select-option input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        this.updateFilterDisplay();
    }
}

// Initialize filters on page load
document.addEventListener('DOMContentLoaded', Filters.initFilters.bind(Filters));
