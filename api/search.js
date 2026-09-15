// API: Search Orders
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
        const { query, type = 'admin', identifier } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        let result;

        if (type === 'employee') {
            // Employee search in their own orders
            if (!identifier) {
                return res.status(400).json({ error: 'Identifier required for employee search' });
            }

            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .eq('employee_name', identifier)
                .or(`order_code.ilike.%${query}%,customer_phone.ilike.%${query}%`);

            if (error) throw error;
            result = orders;
        } else {
            // Admin search in all orders
            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .or(`order_code.ilike.%${query}%,customer_phone.ilike.%${query}%,store_name.ilike.%${query}%`);

            if (error) throw error;
            result = orders;
        }

        return res.status(200).json({
            success: true,
            results: result || []
        });

    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
