/**
 * Dashboard Main Logic
 * منطق لوحة القيادة الرئيسية
 */

class Dashboard {
    static currentView = 'employees'; // employees, stores, admin
    static currentFilters = {};
    static allOrders = [];
    static refreshInterval = null;

    static async init() {
        try {
            // Check auth
            const hasAuth = await Auth.requireAuth();
            if (!hasAuth) return;

            // Set user info in header
            this.updateHeader();

            // Determine which view to show
            if (Auth.isAdmin()) {
                this.showAdminView();
            } else if (Auth.isEmployee()) {
                this.showEmployeeView();
            } else if (Auth.isStore()) {
                this.showStoreView();
            }

            // Load initial data
            await this.loadData();

            // Show dashboard
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('loading').style.display = 'none';

            // Auto-refresh every 30 seconds
            this.setupAutoRefresh();
        } catch (error) {
            console.error('Dashboard init error:', error);
            this.showError();
        }
    }

    static updateHeader() {
        const userName = Auth.getCurrentUserName();
        const role = Auth.currentRole;
        const roleText = {
            'admin': 'مدير',
            'employee': 'موظفة',
            'store': 'مسؤول متجر'
        }[role] || 'مستخدم';

        const lastUpdated = new Date().toLocaleString('ar-LY');
        document.getElementById('lastUpdated').textContent = lastUpdated;
    }

    static showEmployeeView() {
        // Show employee tabs: All Orders, No Status, Waiting Shipment
        const tabsContainer = document.querySelector('.tabs-container');
        if (tabsContainer) {
            tabsContainer.innerHTML = `
                <button class="tab-button active" onclick="Dashboard.switchTab('all')">
                    <i class="ri-list-ordered"></i> كل الطلبات
                </button>
                <button class="tab-button" onclick="Dashboard.switchTab('no_status')">
                    <i class="ri-close-circle-line"></i> بدون حالة
                    <span class="tab-badge" id="noStatusBadge">0</span>
                </button>
                <button class="tab-button" onclick="Dashboard.switchTab('waiting_shipment')">
                    <i class="ri-truck-line"></i> بانتظار الشحن
                    <span class="tab-badge" id="waitingShipmentBadge">0</span>
                </button>
            `;
        }
    }

    static showStoreView() {
        // Show store tabs
        const tabsContainer = document.querySelector('.tabs-container');
        if (tabsContainer) {
            tabsContainer.innerHTML = `
                <button class="tab-button active" onclick="Dashboard.switchTab('return_receive')">
                    <i class="ri-arrow-down-line"></i> رد و يستلم
                </button>
                <button class="tab-button" onclick="Dashboard.switchTab('exchange')">
                    <i class="ri-repeat-line"></i> استبدال
                </button>
                <button class="tab-button" onclick="Dashboard.switchTab('return')">
                    <i class="ri-arrow-up-line"></i> مرتجع
                </button>
                <button class="tab-button" onclick="Dashboard.switchTab('delayed')">
                    <i class="ri-time-line"></i> مؤجل
                </button>
            `;
        }
    }

    static showAdminView() {
        // Show admin tabs: Stats, Stores, All Orders, Search, Follow-up
        const tabsContainer = document.querySelector('.tabs-container');
        if (tabsContainer) {
            tabsContainer.innerHTML = `
                <button class="tab-button active" onclick="Dashboard.switchTab('stats')">
                    <i class="ri-dashboard-3-line"></i> الإحصائيات
                </button>
                <button class="tab-button" onclick="Dashboard.switchTab('stores')">
                    <i class="ri-store-2-line"></i> المتاجر
                </button>
                <button class="tab-button" onclick="Dashboard.switchTab('all_orders')">
                    <i class="ri-list-ordered"></i> كل الطلبات
                </button>
                <button class="tab-button" onclick="Dashboard.switchTab('search')">
                    <i class="ri-search-line"></i> البحث
                </button>
                <button class="tab-button" onclick="Dashboard.switchTab('follow_up')">
                    <i class="ri-phone-line"></i> المتابعة
                </button>
            `;
        }
    }

    static switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.closest('.tab-button').classList.add('active');

        // Load tab content
        this.loadTabContent(tabName);
    }

    static async loadTabContent(tabName) {
        const dashboardDiv = document.getElementById('dashboard');
        
        try {
            if (Auth.isEmployee()) {
                await this.loadEmployeeTab(tabName);
            } else if (Auth.isStore()) {
                await this.loadStoreTab(tabName);
            } else if (Auth.isAdmin()) {
                await this.loadAdminTab(tabName);
            }
        } catch (error) {
            console.error('Tab load error:', error);
        }
    }

    static async loadEmployeeTab(tabName) {
        const employeeName = Auth.getCurrentUserName();
        const { data: orders } = await OrdersAPI.getEmployeeOrders(employeeName);

        if (!orders) return;

        let filteredOrders = orders;

        switch (tabName) {
            case 'no_status':
                filteredOrders = orders.filter(o => !o.client_status);
                break;
            case 'waiting_shipment':
                filteredOrders = orders.filter(o => o.shipment_status === 'بانتظار الشحن');
                break;
        }

        this.displayOrdersTable(filteredOrders);
        this.updateBadges(orders);
    }

    static updateBadges(orders) {
        const noStatusCount = orders.filter(o => !o.client_status).length;
        const waitingCount = orders.filter(o => o.shipment_status === 'بانتظار الشحن').length;

        const badge1 = document.getElementById('noStatusBadge');
        const badge2 = document.getElementById('waitingShipmentBadge');

        if (badge1) badge1.textContent = noStatusCount;
        if (badge2) badge2.textContent = waitingCount;
    }

    static async loadStoreTab(tabName) {
        const store = Auth.getCurrentUserStore();
        if (!store) return;

        const statusMap = {
            'return_receive': 'رد و يستلم',
            'exchange': 'استبدال',
            'return': 'مرتجع',
            'delayed': 'مؤجل'
        };

        const { data: orders } = await OrdersAPI.getOrdersByStore(store);
        let filteredOrders = orders;

        if (tabName !== 'all') {
            const status = statusMap[tabName];
            filteredOrders = orders.filter(o => {
                // Get status from store_orders_status table
                return true; // TODO: implement store status check
            });
        }

        this.displayOrdersTable(filteredOrders);
    }

    static async loadAdminTab(tabName) {
        switch (tabName) {
            case 'stats':
                await this.loadStatistics();
                break;
            case 'stores':
                await this.loadStoresStatistics();
                break;
            case 'all_orders':
                await this.loadAllOrders();
                break;
            case 'search':
                this.showSearchInterface();
                break;
            case 'follow_up':
                await this.loadFollowUpOrders();
                break;
        }
    }

    static async loadData() {
        try {
            // Load KPIs
            const { data: kpis } = await StatisticsAPI.getDashboardKPIs();
            if (kpis) {
                this.updateKPIs(kpis);
            }

            // Load employee statistics
            const { data: empStats } = await StatisticsAPI.getEmployeeStats();
            if (empStats) {
                this.displayEmployeeStats(empStats);
            }
        } catch (error) {
            console.error('Data load error:', error);
        }
    }

    static updateKPIs(kpis) {
        document.getElementById('totalOrders').textContent = kpis.total_orders || 0;
        document.getElementById('deliveredOrders').textContent = kpis.delivered_orders || 0;
        document.getElementById('notDeliveredOrders').textContent = kpis.not_delivered_orders || 0;
        document.getElementById('deliveryPercentage').textContent = kpis.delivery_percentage + '%' || '0%';
        document.getElementById('notDeliveredPercentage').textContent = kpis.not_delivered_percentage + '%' || '0%';
        document.getElementById('averageCallAttempts').textContent = kpis.average_call_attempts || '0';
    }

    static displayOrdersTable(orders) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => `
            <tr onclick="Dashboard.showOrderDetails('${order.order_code}')">
                <td>${order.order_code}</td>
                <td>${order.employee_name || '-'}</td>
                <td>${order.customer_phone || '-'}</td>
                <td>${order.store || '-'}</td>
                <td>
                    <span class="status-badge ${order.delivered === 'yes' ? 'delivered' : 'not-delivered'}">
                        ${order.delivered === 'yes' ? 'مسلم' : 'غير مسلم'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    static displayEmployeeStats(stats) {
        const tbody = document.getElementById('employeeTableBody');
        if (!tbody) return;

        tbody.innerHTML = stats.map(emp => `
            <tr>
                <td>${emp.employee_name}</td>
                <td>${emp.total_orders}</td>
                <td>${emp.delivered_count}</td>
                <td>${emp.not_delivered_count}</td>
                <td>
                    <span class="percentage-badge" style="background-color: ${this.getPerformanceColor(emp.delivery_percentage)}">
                        ${emp.delivery_percentage}%
                    </span>
                </td>
            </tr>
        `).join('');
    }

    static getPerformanceColor(percentage) {
        if (percentage >= 26) return 'var(--level-excellent)';
        if (percentage >= 21) return 'var(--level-good)';
        if (percentage >= 16) return 'var(--level-average)';
        if (percentage >= 11) return 'var(--level-poor)';
        return 'var(--level-critical)';
    }

    static async showOrderDetails(orderCode) {
        const { data: order } = await OrdersAPI.getOrderByCode(orderCode);
        if (!order) return;

        const sheet = document.querySelector('.bottom-sheet');
        sheet.innerHTML = `
            <div class="sheet-header">
                <h3>تفاصيل الطلبة</h3>
                <button class="close-btn" onclick="this.closest('.bottom-sheet').classList.remove('active')">&times;</button>
            </div>
            <div class="sheet-content">
                <div class="form-group">
                    <label>كود الطلب:</label>
                    <input type="text" value="${order.order_code}" readonly>
                </div>
                <div class="form-group">
                    <label>رقم العميل:</label>
                    <input type="text" value="${order.customer_phone || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>الموظفة:</label>
                    <input type="text" value="${order.employee_name || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>المتجر:</label>
                    <input type="text" value="${order.store || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>حالة العميل:</label>
                    <input type="text" value="${order.client_status || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>ملاحظات:</label>
                    <textarea readonly>${order.order_note || ''}</textarea>
                </div>
            </div>
        `;

        sheet.classList.add('active');
    }

    static async loadStatistics() {
        // Load and display all statistics
        const { data: empStats } = await StatisticsAPI.getEmployeeStats();
        const { data: storeStats } = await StatisticsAPI.getStoreStats();
        const { data: clientStats } = await StatisticsAPI.getClientStatusStats();

        this.displayEmployeeStats(empStats);
        this.displayStoreStats(storeStats);
        this.displayClientStatusStats(clientStats);
    }

    static async loadAllOrders() {
        const { data: orders } = await OrdersAPI.getAllOrders();
        this.displayOrdersTable(orders);
    }

    static async loadFollowUpOrders() {
        const { data: followUp } = await FollowUpAPI.getFollowUpOrders();
        
        const tbody = document.querySelector('table tbody');
        if (tbody && followUp) {
            tbody.innerHTML = followUp.map(item => `
                <tr>
                    <td>${item.order_code}</td>
                    <td>${item.employee_name || '-'}</td>
                    <td>${item.customer_phone || '-'}</td>
                    <td>${item.notes || '-'}</td>
                    <td>
                        <select onchange="Dashboard.updateFollowUpStatus('${item.id}', this.value)">
                            <option value="pending" ${item.follow_up_status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                            <option value="completed" ${item.follow_up_status === 'completed' ? 'selected' : ''}>مكتمل</option>
                            <option value="failed" ${item.follow_up_status === 'failed' ? 'selected' : ''}>فشل</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        }
    }

    static showSearchInterface() {
        // Show search box for orders or archive
        console.log('Search interface shown');
    }

    static setupAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, 30000); // 30 seconds
    }

    static async exportCSV() {
        const { data: orders } = await OrdersAPI.getAllOrders();
        if (!orders) return;

        // Prepare CSV
        const headers = ['كود_الطلب', 'رقم_العميل', 'الموظفة', 'المتجر', 'حالة_التسليم'];
        const rows = orders.map(o => [
            o.order_code,
            o.customer_phone,
            o.employee_name,
            o.store,
            o.delivered === 'yes' ? 'مسلم' : 'غير مسلم'
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        
        // Download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `orders_${new Date().getTime()}.csv`;
        link.click();
    }

    static retry() {
        document.getElementById('error').style.display = 'none';
        document.getElementById('loading').style.display = 'flex';
        this.init();
    }

    static showError() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'flex';
    }

    static displayStoreStats(stats) {
        const tbody = document.getElementById('storeTableBody');
        if (!tbody || !stats) return;

        tbody.innerHTML = stats.map(store => `
            <tr>
                <td>${store.store}</td>
                <td>${store.total_orders}</td>
                <td>${store.delivered_count}</td>
                <td>${store.not_delivered_count}</td>
                <td>${store.delivery_percentage}%</td>
            </tr>
        `).join('');
    }

    static displayClientStatusStats(stats) {
        const tbody = document.getElementById('clientStatusTableBody');
        if (!tbody || !stats) return;

        tbody.innerHTML = stats.map(status => `
            <tr>
                <td>${status.client_status}</td>
                <td>${status.total_orders}</td>
                <td>${status.percentage_of_total}%</td>
                <td>${status.delivered_count}</td>
                <td>${status.not_delivered_count}</td>
                <td>${status.delivery_percentage}%</td>
            </tr>
        `).join('');
    }

    static async updateFollowUpStatus(id, status) {
        await FollowUpAPI.updateFollowUpStatus(id, status);
        this.loadFollowUpOrders();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', Dashboard.init.bind(Dashboard));
