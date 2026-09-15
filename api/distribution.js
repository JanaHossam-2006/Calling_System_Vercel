// API: Distribution Orders Management
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
        const { action } = req.query;

        if (req.method === 'GET') {
            // Get all distribution orders
            const { data: orders, error } = await supabase
                .from('distribution_orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return res.status(200).json({
                success: true,
                orders: orders || []
            });
        }

        if (req.method === 'DELETE') {
            // Delete distribution order
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'Order id is required' });
            }

            const { error } = await supabase
                .from('distribution_orders')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return res.status(200).json({ success: true });
        }

        if (req.method === 'PUT') {
            // Update distribution order status
            const { id, admin_update } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'Order id is required' });
            }

            const { data: updated, error } = await supabase
                .from('distribution_orders')
                .update({
                    admin_update: admin_update || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select();

            if (error) throw error;

            return res.status(200).json({
                success: true,
                order: updated?.[0] || null
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Distribution error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
