// API: Update Order
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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id, order_code, archived, ...updateData } = req.body;

        if (!id || !order_code) {
            return res.status(400).json({ error: 'id and order_code are required' });
        }

        const table = archived ? 'archived_orders' : 'orders';

        // Validate that order_code matches to prevent updating wrong row
        const { data: existing, error: selectError } = await supabase
            .from(table)
            .select('order_code')
            .eq('id', id)
            .single();

        if (selectError) throw selectError;

        if (!existing || existing.order_code !== order_code) {
            return res.status(400).json({ error: 'Order code mismatch - order not found or incorrect' });
        }

        // Update the order
        const { data: updated, error: updateError } = await supabase
            .from(table)
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (updateError) throw updateError;

        return res.status(200).json({
            success: true,
            order: updated?.[0] || null
        });

    } catch (error) {
        console.error('Order update error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
