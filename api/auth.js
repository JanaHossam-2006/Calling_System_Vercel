// API: Authentication
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
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Query users table
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .ilike('username', username); // Case-insensitive search

        if (error) throw error;

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password (simple comparison - in production use bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Parse available stores
        let availableStores = [];
        if (user.role === 'store') {
            if (user.available_stores) {
                availableStores = user.available_stores.split('-').map(s => s.trim()).filter(s => s);
            }
            if (availableStores.length === 0) {
                availableStores = [user.username]; // Default to username as store
            }
        }

        return res.status(200).json({
            role: user.role || 'employee',
            username: user.username,
            availableStores: availableStores,
            email: user.email,
            phone: user.phone
        });

    } catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
