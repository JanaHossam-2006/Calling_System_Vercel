// API Client for communicating with Vercel backend
// Replaces google.script.run calls with fetch() API calls

const API_BASE = window.location.origin; // e.g., https://calling-system.vercel.app or http://localhost:3000

class CallingSystemAPI {
    static async authenticate(username, password) {
        try {
            const response = await fetch(`${API_BASE}/api/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Authentication failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Auth error:', error);
            throw error;
        }
    }

    static async getOrders(identifier, role, search = null, page = 1) {
        try {
            let url = `${API_BASE}/api/orders?identifier=${encodeURIComponent(identifier)}&role=${encodeURIComponent(role)}&page=${page}`;
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch orders');
            }

            const data = await response.json();
            return data.orders || [];
        } catch (error) {
            console.error('Orders error:', error);
            throw error;
        }
    }

    static async updateOrder(id, orderCode, updates, archived = false) {
        try {
            const response = await fetch(`${API_BASE}/api/order-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    order_code: orderCode,
                    archived,
                    ...updates
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update order');
            }

            const data = await response.json();
            return data.order || null;
        } catch (error) {
            console.error('Order update error:', error);
            throw error;
        }
    }

    static async getAdminStats() {
        try {
            const response = await fetch(`${API_BASE}/api/admin-stats`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch admin stats');
            }

            return await response.json();
        } catch (error) {
            console.error('Admin stats error:', error);
            throw error;
        }
    }

    static async search(query, type = 'admin', identifier = null) {
        try {
            let url = `${API_BASE}/api/search?query=${encodeURIComponent(query)}&type=${type}`;
            if (identifier) {
                url += `&identifier=${encodeURIComponent(identifier)}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Search failed');
            }

            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    static async getDistributionOrders() {
        try {
            const response = await fetch(`${API_BASE}/api/distribution`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch distribution orders');
            }

            const data = await response.json();
            return data.orders || [];
        } catch (error) {
            console.error('Distribution orders error:', error);
            throw error;
        }
    }

    static async deleteDistributionOrder(id) {
        try {
            const response = await fetch(`${API_BASE}/api/distribution`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete order');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }

    static async updateDistributionStatus(id, adminUpdate) {
        try {
            const response = await fetch(`${API_BASE}/api/distribution`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, admin_update: adminUpdate })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update distribution status');
            }

            const data = await response.json();
            return data.order || null;
        } catch (error) {
            console.error('Update distribution error:', error);
            throw error;
        }
    }
}

// Export for use in login.html
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CallingSystemAPI;
}
