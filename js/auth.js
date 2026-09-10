/**
 * Authentication Module
 * نظام المصادقة والأدوار
 */

class Auth {
    static async init() {
        try {
            const authMgr = window.AuthManager || (typeof AuthManager !== 'undefined' ? AuthManager : null);
            if (!authMgr) return false;

            // Check if user is logged in
            const session = await authMgr.getSession();
            if (session && session.user) {
                const user = await UsersAPI.getUserByEmail(session.user.email);
                if (user && user.data) {
                    this.currentUser = user.data;
                    this.currentRole = user.data.role;
                    this.currentUserId = user.data.id;
                    return true;
                } else {
                    const fallbackUser = {
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.email.split('@')[0],
                        role: session.user.email.includes('admin') ? 'admin' : 'employee'
                    };
                    this.currentUser = fallbackUser;
                    this.currentRole = fallbackUser.role;
                    this.currentUserId = fallbackUser.id;
                    return true;
                }
            }
        } catch (e) {
            console.error('Auth.init error:', e);
        }
        return false;
    }

    static async login(email, password) {
        try {
            const authMgr = window.AuthManager || (typeof AuthManager !== 'undefined' ? AuthManager : null);
            if (!authMgr) throw new Error('مكتبة المصادقة غير جاهزة');

            const { data, error } = await authMgr.signIn(email, password);
            if (error) throw error;

            // Get user profile
            const user = await UsersAPI.getUserByEmail(email);
            if (user && user.data) {
                this.currentUser = user.data;
                this.currentRole = user.data.role;
                this.currentUserId = user.data.id;
                return { success: true, user: user.data };
            } else {
                const fallbackUser = {
                    id: data?.user?.id || 'temp-id',
                    email: data?.user?.email || email,
                    name: email.split('@')[0],
                    role: email.includes('admin') ? 'admin' : 'employee'
                };
                this.currentUser = fallbackUser;
                this.currentRole = fallbackUser.role;
                this.currentUserId = fallbackUser.id;
                return { success: true, user: fallbackUser };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'فشل تسجيل الدخول' };
        }
    }

    static async logout() {
        const authMgr = window.AuthManager || (typeof AuthManager !== 'undefined' ? AuthManager : null);
        if (authMgr) {
            await authMgr.signOut();
        }
        this.currentUser = null;
        this.currentRole = null;
        this.currentUserId = null;
        return { success: true };
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
