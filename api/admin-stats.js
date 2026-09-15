// API: Admin Dashboard Statistics
const supabase = require('./lib/supabase');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Get all orders
        const { data: allOrders, error: ordersError } = await supabase
            .from('orders')
            .select('*');

        if (ordersError) throw ordersError;

        // Get all users for employee stats
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'employee');

        if (usersError) throw usersError;

        // Calculate employee statistics
        const employees = [];
        const employeeMap = {};

        users.forEach(user => {
            const employeeOrders = allOrders.filter(o => o.employee_name === user.username);
            
            if (employeeOrders.length === 0) {
                return; // Skip employees with no orders
            }

            const stats = {
                name: user.username,
                orders: employeeOrders.length,
                firstOrder: employeeOrders[0]?.order_date,
                lastOrder: employeeOrders[employeeOrders.length - 1]?.order_date,
                statuses: {},
                noAnswerTotal: 0,
                avgNoAnswerTries: 0,
                pendingOrders: 0,
                readyPendingShipment: 0
            };

            // Status breakdown
            employeeOrders.forEach(o => {
                const status = o.customer_status || 'بدون حالة';
                stats.statuses[status] = (stats.statuses[status] || 0) + 1;

                if (status === 'لم يرد') {
                    stats.noAnswerTotal++;
                }

                if (!o.customer_status) {
                    stats.pendingOrders++;
                }

                if (o.customer_status === 'رد و يستلم' && !o.shipment_status) {
                    stats.readyPendingShipment++;
                }
            });

            // Calculate average call attempts for no answer
            const noAnswerOrders = employeeOrders.filter(o => o.customer_status === 'لم يرد');
            if (noAnswerOrders.length > 0) {
                stats.avgNoAnswerTries = Math.round(
                    noAnswerOrders.reduce((sum, o) => sum + (o.call_attempts || 0), 0) / noAnswerOrders.length
                );
            }

            // Duration
            if (stats.firstOrder && stats.lastOrder) {
                const diff = new Date(stats.lastOrder) - new Date(stats.firstOrder);
                stats.duration = Math.floor(diff / (1000 * 60 * 60 * 24)); // days
            }

            employees.push(stats);
            employeeMap[user.username] = stats;
        });

        // Calculate store statistics
        const stores = {};
        allOrders.forEach(o => {
            const storeName = o.store_name || 'unknown';
            if (!stores[storeName]) {
                stores[storeName] = {
                    store: storeName,
                    count: 0,
                    ready: 0,
                    readyPct: 0,
                    done: 0,
                    notDone: 0,
                    pending: 0,
                    oldestStr: '',
                    pendingNormal: 0,
                    pendingReturned: 0,
                    pendingPostponed: 0,
                    pendingExchange: 0
                };
            }

            stores[storeName].count++;

            if (o.customer_status === 'رد و يستلم' || o.customer_status === 'استبدال') {
                stores[storeName].ready++;
            }

            if (o.store_manager_report === 'تم') {
                stores[storeName].done++;
            } else if (o.store_manager_report === 'لم يتم') {
                stores[storeName].notDone++;
            } else if (!o.store_manager_report) {
                stores[storeName].pending++;
                if (o.return_status === 'مرتجع') {
                    stores[storeName].pendingReturned++;
                } else if (o.return_status === 'مؤجل') {
                    stores[storeName].pendingPostponed++;
                } else if (o.customer_status === 'استبدال') {
                    stores[storeName].pendingExchange++;
                } else {
                    stores[storeName].pendingNormal++;
                }
            }
        });

        Object.values(stores).forEach(s => {
            s.readyPct = s.count > 0 ? Math.round((s.ready / s.count) * 100) : 0;
        });

        // Calculate global statuses
        const globalStatuses = {};
        let totalOrders = 0;
        let globalReady = 0;
        let globalCancelled = 0;

        allOrders.forEach(o => {
            totalOrders++;
            const status = o.customer_status || 'بدون حالة';
            globalStatuses[status] = (globalStatuses[status] || 0) + 1;

            if (status === 'رد و يستلم' || status === 'استبدال') {
                globalReady++;
            }
            if (status === 'الغى الطلب') {
                globalCancelled++;
            }
        });

        return res.status(200).json({
            success: true,
            allOrders,
            employees,
            stores: Object.values(stores),
            statuses: globalStatuses,
            totalOrders,
            globalReady,
            globalCancelled
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
