/**
 * Supabase Client Configuration
 * يتم التحكم في اتصالات قاعدة البيانات من هنا
 */

const SUPABASE_URL = localStorage.getItem('supabase_url') || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = localStorage.getItem('supabase_key') || 'your-anon-key';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth State Manager
class AuthManager {
    static async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    }

    static async signUp(email, password, userData) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        return { data, error };
    }

    static async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    }

    static async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    }

    static async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }

    static async getUserProfile(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    }

    static onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
}

// Database Connection State
class DBConnection {
    static async checkConnection() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('count', { count: 'exact' })
                .limit(1);
            
            if (error) throw error;
            return { connected: true };
        } catch (error) {
            console.error('Database connection error:', error);
            return { connected: false, error };
        }
    }

    static async setCredentials(url, key) {
        localStorage.setItem('supabase_url', url);
        localStorage.setItem('supabase_key', key);
        location.reload();
    }

    static getCredentials() {
        return {
            url: localStorage.getItem('supabase_url'),
            key: localStorage.getItem('supabase_key')
        };
    }
}
