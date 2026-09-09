/**
 * Authentication Module
 * نظام المصادقة والأدوار
 */

class Auth {
    static async init() {
        // Check if user is logged in
        const session = await AuthManager.getSession();
        if (session) {
            const user = await UsersAPI.getUserByEmail(session.user.email);
            if (user.data) {
                this.currentUser = user.data;
                this.currentRole = user.data.role;
                this.currentUserId = user.data.id;
                return true;
            }
        }
        return false;
    }

    static async login(email, password) {
        try {
            const { data, error } = await AuthManager.signIn(email, password);
            if (error) throw error;

            // Get user profile
            const user = await UsersAPI.getUserByEmail(email);
            if (user.error) throw user.error;

            this.currentUser = user.data;
            this.currentRole = user.data.role;
            this.currentUserId = user.data.id;

            return { success: true, user: user.data };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    static async logout() {
        const { error } = await AuthManager.signOut();
        this.currentUser = null;
        this.currentRole = null;
        this.currentUserId = null;
        return { success: !error };
    }

    static isAdmin() {
        return this.currentRole === 'admin';
    }

    static isEmployee() {
        return this.currentRole === 'employee';
    }

    static isStore() {
        return this.currentRole === 'store';
    }

    static getCurrentUserName() {
        return this.currentUser?.name || 'User';
    }

    static getCurrentUserStore() {
        return this.currentUser?.store || null;
    }

    static hasPermission(action) {
        const permissions = {
            'view_dashboard': ['admin', 'employee', 'store'],
            'view_employee_orders': ['employee', 'admin'],
            'view_store_orders': ['store', 'admin'],
            'view_admin_panel': ['admin'],
            'edit_order': ['admin'],
            'delete_order': ['admin'],
            'update_store_status': ['store', 'admin'],
            'view_statistics': ['admin'],
            'upload_data': ['admin'],
            'archive_orders': ['admin']
        };

        return permissions[action]?.includes(this.currentRole) || false;
    }

    static requireAuth(role = null) {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return false;
        }
        if (role && this.currentRole !== role && this.currentRole !== 'admin') {
            alert('ليس لديك الصلاحية للوصول إلى هذه الصفحة');
            return false;
        }
        return true;
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = await Auth.init();
    if (!isLoggedIn && !window.location.pathname.includes('login')) {
        // Don't redirect if on login page
        if (document.body.id !== 'login-page') {
            // window.location.href = 'login.html';
        }
    }
});
