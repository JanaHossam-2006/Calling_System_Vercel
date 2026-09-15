// API: Get Orders
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
        const { identifier, role, search, page = 1, limit = 100 } = req.query;

        if (!role) {
            return res.status(400).json({ error: 'Role is required' });
        }

        let query = supabase.from('orders').select('*', { count: 'exact' });

        // Filter by role
        if (role === 'employee') {
            if (!identifier) {
                return res.status(400).json({ error: 'Identifier (employee name) is required for employee role' });
            }
            query = query.eq('employee_name', identifier);
        } else if (role === 'store') {
            if (!identifier) {
                return res.status(400).json({ error: 'Identifier (store name) is required for store role' });
            }
            query = query.eq('store_name', identifier);
            query = query.in('customer_status', ['رد و يستلم', 'استبدال']);
            query = query.order('order_date', { ascending: true });
        }
        // For admin role, return all orders

        // Apply search filter if provided
        if (search) {
            query = query.or(`order_code.ilike.%${search}%,customer_phone.ilike.%${search}%,store_name.ilike.%${search}%`);
        }

        // Pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data: orders, error, count } = await query;

        if (error) throw error;

        return res.status(200).json({
            success: true,
            orders: orders || [],
            count: count || 0,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Orders error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
