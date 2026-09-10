/**
 * API Layer - Database Operations
 * جميع عمليات قاعدة البيانات تمر من هنا
 */

class OrdersAPI {
    // ========== READ Operations ==========
    
    static async getAllOrders(filters = {}) {
        let query = supabase
            .from('daily_orders')
            .select('*')
            .neq('dashboard_filter', 'Ignore');

        // Apply filters
        if (filters.employee_name) {
            query = query.eq('employee_name', filters.employee_name);
        }
        if (filters.store) {
            query = query.eq('store', filters.store);
        }
        if (filters.client_status) {
            query = query.eq('client_status', filters.client_status);
        }
        if (filters.shipment_status) {
            query = query.eq('shipment_status', filters.shipment_status);
        }
        if (filters.delivered) {
            query = query.eq('delivered', filters.delivered);
        }
        if (filters.search) {
            query = query.or(`order_code.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`);
        }

        const { data, error } = await query.order('order_date', { ascending: false });
        return { data, error };
    }

    static async getOrderByCode(orderCode) {
        const { data, error } = await supabase
            .from('daily_orders')
            .select('*')
            .eq('order_code', orderCode)
            .single();
        return { data, error };
    }

    static async getEmployeeOrders(employeeName, filters = {}) {
        let query = supabase
            .from('daily_orders')
            .select('*')
            .eq('employee_name', employeeName)
            .neq('dashboard_filter', 'Ignore');

        if (filters.client_status) {
            query = query.eq('client_status', filters.client_status);
        }

        const { data, error } = await query.order('order_date', { ascending: false });
        return { data, error };
    }

    static async getOrdersByStore(store, filters = {}) {
        let query = supabase
            .from('daily_orders')
            .select('*')
            .eq('store', store)
            .neq('dashboard_filter', 'Ignore');

        if (filters.status) {
            query = query.eq('shipment_status', filters.status);
        }

        const { data, error } = await query.order('order_date', { ascending: false });
        return { data, error };
    }

    // ========== CREATE/UPDATE Operations ==========

    static async createOrder(orderData) {
        const { data, error } = await supabase
            .from('daily_orders')
            .insert([orderData])
            .select();
        return { data, error };
    }

    static async updateOrder(orderCode, updates) {
        const { data, error } = await supabase
            .from('daily_orders')
            .update(updates)
            .eq('order_code', orderCode)
            .select();
        return { data, error };
    }

    static async updateOrderStatus(orderCode, status, notes = '') {
        const { data, error } = await supabase
            .from('daily_orders')
            .update({
                client_status: status,
                client_note: notes,
                updated_at: new Date().toISOString()
            })
            .eq('order_code', orderCode)
            .select();
        return { data, error };
    }

    static async updateStoreOrderStatus(orderCode, store, status) {
        // Check if exists
        const { data: existing } = await supabase
            .from('store_orders_status')
            .select('*')
            .eq('order_code', orderCode)
            .single();

        if (existing) {
            // Update
            const { data, error } = await supabase
                .from('store_orders_status')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('order_code', orderCode)
                .select();
            return { data, error };
        } else {
            // Insert
            const { data, error } = await supabase
                .from('store_orders_status')
                .insert([{ order_code: orderCode, store, status }])
                .select();
            return { data, error };
        }
    }

    static async incrementCallAttempts(orderCode) {
        const { data: order } = await this.getOrderByCode(orderCode);
        if (!order) return { error: 'Order not found' };

        const newAttempts = (order.call_attempts || 0) + 1;
        const { data, error } = await supabase
            .from('daily_orders')
            .update({
                call_attempts: newAttempts,
                more_than_5_attempts: newAttempts > 5
            })
            .eq('order_code', orderCode)
            .select();
        return { data, error };
    }

    // ========== DELETE Operations ==========

    static async deleteOrder(orderCode) {
        // Archive first
        const { data: order } = await this.getOrderByCode(orderCode);
        if (order) {
            await supabase
                .from('archived_orders')
                .insert([{
                    ...order,
                    archived_reason: 'Manual delete',
                    archived_at: new Date().toISOString()
                }]);
        }

        const { error } = await supabase
            .from('daily_orders')
            .delete()
            .eq('order_code', orderCode);
        return { error };
    }
}

// ========== Deliveries API ==========

class DeliveriesAPI {
    static async getDeliveries(filters = {}) {
        let query = supabase.from('deliveries').select('*');

        if (filters.store) {
            query = query.eq('store', filters.store);
        }
        if (filters.start_date) {
            query = query.gte('delivery_date', filters.start_date);
        }
        if (filters.end_date) {
            query = query.lte('delivery_date', filters.end_date);
        }

        const { data, error } = await query.order('delivery_date', { ascending: false });
        return { data, error };
    }

    static async addDelivery(orderCode, customerPhone, store = null) {
        const { data, error } = await supabase
            .from('deliveries')
            .insert([{
                order_code: orderCode,
                customer_phone: customerPhone,
                store: store,
                delivery_date: new Date().toISOString()
            }])
            .select();
        return { data, error };
    }

    static async uploadDeliveriesCSV(csvData) {
        // Parse CSV and insert
        const deliveries = csvData.map(row => ({
            order_code: row.كود_الطلب,
            customer_phone: row.رقم_العميل,
            store: row.المتجر || null,
            delivery_date: new Date(row.تاريخ_التسليم).toISOString()
        }));

        const { data, error } = await supabase
            .from('deliveries')
            .insert(deliveries, { onConflict: 'order_code' })
            .select();

        // Recalculate if successful
        if (!error) {
            await DatabaseFunctions.recalculateColumns();
        }

        return { data, error };
    }
}

// ========== Follow Up Orders API ==========

class FollowUpAPI {
    static async getFollowUpOrders(filters = {}) {
        let query = supabase
            .from('follow_up_orders')
            .select('*')
            .eq('follow_up_status', 'pending');

        if (filters.store) {
            query = query.eq('store', filters.store);
        }
        if (filters.employee) {
            query = query.eq('employee_name', filters.employee);
        }

        const { data, error } = await query.order('follow_up_date', { ascending: true });
        return { data, error };
    }

    static async addFollowUp(orderCode, customerPhone, store, employeeName, notes = '') {
        const { data, error } = await supabase
            .from('follow_up_orders')
            .insert([{
                order_code: orderCode,
                customer_phone: customerPhone,
                store,
                employee_name: employeeName,
                notes,
                follow_up_date: new Date().toISOString()
            }])
            .select();
        return { data, error };
    }

    static async updateFollowUpStatus(id, status) {
        const { data, error } = await supabase
            .from('follow_up_orders')
            .update({ follow_up_status: status })
            .eq('id', id)
            .select();
        return { data, error };
    }
}

// ========== Statistics API ==========

class StatisticsAPI {
    static async getEmployeeStats() {
        try {
            const { data: orders, error } = await supabase
                .from('daily_orders')
                .select('employee_name, delivered, dashboard_filter')
                .neq('dashboard_filter', 'Ignore');

            if (error) throw error;
            if (!orders) return { data: [], error: null };

            const map = {};
            orders.forEach(o => {
                if (!o.employee_name) return;
                if (!map[o.employee_name]) {
                    map[o.employee_name] = {
                        employee_name: o.employee_name,
                        total_orders: 0,
                        delivered_count: 0,
                        not_delivered_count: 0
                    };
                }
                map[o.employee_name].total_orders++;
                if (o.delivered === 'yes') {
                    map[o.employee_name].delivered_count++;
                } else {
                    map[o.employee_name].not_delivered_count++;
                }
            });

            const data = Object.values(map).map(e => ({
                ...e,
                delivery_percentage: e.total_orders > 0 ? parseFloat(((e.delivered_count / e.total_orders) * 100).toFixed(2)) : 0
            })).sort((a, b) => b.delivery_percentage - a.delivery_percentage);

            return { data, error: null };
        } catch (error) {
            console.error('getEmployeeStats error:', error);
            return { data: [], error };
        }
    }

    static async getStoreStats() {
        try {
            const { data: orders, error } = await supabase
                .from('daily_orders')
                .select('store, delivered, dashboard_filter')
                .neq('dashboard_filter', 'Ignore');

            if (error) throw error;
            if (!orders) return { data: [], error: null };

            const map = {};
            orders.forEach(o => {
                if (!o.store) return;
                if (!map[o.store]) {
                    map[o.store] = {
                        store: o.store,
                        total_orders: 0,
                        delivered_count: 0,
                        not_delivered_count: 0
                    };
                }
                map[o.store].total_orders++;
                if (o.delivered === 'yes') {
                    map[o.store].delivered_count++;
                } else {
                    map[o.store].not_delivered_count++;
                }
            });

            const data = Object.values(map).map(s => ({
                ...s,
                delivery_percentage: s.total_orders > 0 ? parseFloat(((s.delivered_count / s.total_orders) * 100).toFixed(2)) : 0
            })).sort((a, b) => b.delivery_percentage - a.delivery_percentage);

            return { data, error: null };
        } catch (error) {
            console.error('getStoreStats error:', error);
            return { data: [], error };
        }
    }

    static async getClientStatusStats() {
        try {
            const { data: orders, error } = await supabase
                .from('daily_orders')
                .select('client_status, delivered, dashboard_filter')
                .neq('dashboard_filter', 'Ignore');

            if (error) throw error;
            if (!orders) return { data: [], error: null };

            const totalAll = orders.length || 1;
            const map = {};
            orders.forEach(o => {
                const status = o.client_status || 'بدون حالة';
                if (!map[status]) {
                    map[status] = {
                        client_status: status,
                        total_orders: 0,
                        delivered_count: 0,
                        not_delivered_count: 0
                    };
                }
                map[status].total_orders++;
                if (o.delivered === 'yes') {
                    map[status].delivered_count++;
                } else {
                    map[status].not_delivered_count++;
                }
            });

            const data = Object.values(map).map(s => ({
                ...s,
                delivery_percentage: s.total_orders > 0 ? parseFloat(((s.delivered_count / s.total_orders) * 100).toFixed(2)) : 0,
                percentage_of_total: parseFloat(((s.total_orders / totalAll) * 100).toFixed(2))
            })).sort((a, b) => b.total_orders - a.total_orders);

            return { data, error: null };
        } catch (error) {
            console.error('getClientStatusStats error:', error);
            return { data: [], error };
        }
    }

    static async getShipmentStatusStats() {
        try {
            const { data: orders, error } = await supabase
                .from('daily_orders')
                .select('shipment_status, delivered, dashboard_filter')
                .neq('dashboard_filter', 'Ignore');

            if (error) throw error;
            if (!orders) return { data: [], error: null };

            const map = {};
            orders.forEach(o => {
                const status = o.shipment_status || 'بدون حالة شحن';
                if (!map[status]) {
                    map[status] = {
                        shipment_status: status,
                        total_orders: 0,
                        delivered_count: 0,
                        not_delivered_count: 0
                    };
                }
                map[status].total_orders++;
                if (o.delivered === 'yes') {
                    map[status].delivered_count++;
                } else {
                    map[status].not_delivered_count++;
                }
            });

            const data = Object.values(map).map(s => ({
                ...s,
                delivery_percentage: s.total_orders > 0 ? parseFloat(((s.delivered_count / s.total_orders) * 100).toFixed(2)) : 0
            })).sort((a, b) => b.total_orders - a.total_orders);

            return { data, error: null };
        } catch (error) {
            console.error('getShipmentStatusStats error:', error);
            return { data: [], error };
        }
    }

    static async getDashboardKPIs() {
        const { data: orders, error } = await supabase
            .from('daily_orders')
            .select('*')
            .neq('dashboard_filter', 'Ignore');

        if (error || !orders) return { error: error?.message || 'Failed to fetch data' };

        const total = orders.length;
        const delivered = orders.filter(o => o.delivered === 'yes').length;
        const notDelivered = total - delivered;
        const percentage = total > 0 ? ((delivered / total) * 100).toFixed(2) : 0;

        return {
            data: {
                total_orders: total,
                delivered_orders: delivered,
                not_delivered_orders: notDelivered,
                delivery_percentage: percentage,
                not_delivered_percentage: (100 - percentage).toFixed(2),
                average_call_attempts: total > 0 ? (orders.reduce((sum, o) => sum + (o.call_attempts || 0), 0) / total).toFixed(2) : 0
            }
        };
    }
}

// ========== Database Functions ==========

class DatabaseFunctions {
    static async recalculateColumns() {
        try {
            const { error } = await supabase.rpc('recalculate_calculated_columns');
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Recalculation error:', error);
            return { success: false, error };
        }
    }
}

// ========== Users API ==========

class UsersAPI {
    static async getUser(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    }

    static async getUserByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        return { data, error };
    }

    static async getAllUsers(role = null) {
        let query = supabase.from('users').select('*');
        
        if (role) {
            query = query.eq('role', role);
        }

        const { data, error } = await query;
        return { data, error };
    }

    static async getEmployees() {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'employee');
        return { data, error };
    }

    static async getStores() {
        const { data, error } = await supabase
            .from('users')
            .select('DISTINCT store')
            .eq('role', 'store');
        return { data, error };
    }

    static async createUser(userData) {
        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select();
        return { data, error };
    }

    static async updateUser(userId, updates) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select();
        return { data, error };
    }
}

// ========== Archive API ==========

class ArchiveAPI {
    static async searchArchivedOrders(query) {
        const { data, error } = await supabase
            .from('archived_orders')
            .select('*')
            .or(`order_code.ilike.%${query}%,customer_phone.ilike.%${query}%`)
            .limit(20);
        return { data, error };
    }

    static async archiveOrder(orderCode, reason = '') {
        // Get order
        const { data: order } = await OrdersAPI.getOrderByCode(orderCode);
        if (!order) return { error: 'Order not found' };

        // Archive it
        const { error } = await supabase
            .from('archived_orders')
            .insert([{
                ...order,
                archived_reason: reason,
                archived_at: new Date().toISOString()
            }]);

        if (!error) {
            // Delete from active
            await OrdersAPI.deleteOrder(orderCode);
        }

        return { error };
    }

    static async getArchivedOrder(orderCode) {
        const { data, error } = await supabase
            .from('archived_orders')
            .select('*')
            .eq('order_code', orderCode)
            .single();
        return { data, error };
    }

    static async updateArchivedOrder(orderCode, updates) {
        const { data, error } = await supabase
            .from('archived_orders')
            .update(updates)
            .eq('order_code', orderCode)
            .select();
        return { data, error };
    }
}
