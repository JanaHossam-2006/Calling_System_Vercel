/**
 * Supabase Client Configuration
 * يتم التحكم في اتصالات قاعدة البيانات من هنا
 */

const DEFAULT_SUPABASE_URL = 'https://sylulmlqsqhyujprjups.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_mJHllHfX125IsngquC4YJw_G5oIVUDT';

const SUPABASE_URL = localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = localStorage.getItem('supabase_key') || DEFAULT_SUPABASE_ANON_KEY;

// Create client using the Supabase library
function getSupabaseClient() {
    if (window.supabaseClient) {
        return window.supabaseClient;
    }
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return window.supabaseClient;
    }
    return null;
}

// Initial client instance
const supabase = getSupabaseClient();
window.supabaseClient = supabase;

// Auth State Manager
class AuthManager {
    static getClient() {
        return window.supabaseClient || getSupabaseClient();
    }

    static async getSession() {
        try {
            const client = this.getClient();
            if (!client || !client.auth) return null;
            const { data, error } = await client.auth.getSession();
            if (error) throw error;
            return data ? data.session : null;
        } catch (err) {
            console.error('getSession error:', err);
            return null;
        }
    }

    static async signUp(email, password, userData) {
        const client = this.getClient();
        if (!client || !client.auth) {
            return { data: null, error: { message: 'تعذر الاتصال بخدمة Supabase' } };
        }
        return await client.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
    }

    static async signIn(email, password) {
        const client = this.getClient();
        if (!client || !client.auth) {
            return { data: null, error: { message: 'تعذر الاتصال بخدمة Supabase' } };
        }
        return await client.auth.signInWithPassword({
            email,
            password
        });
    }

    static async signOut() {
        const client = this.getClient();
        if (!client || !client.auth) return { error: null };
        return await client.auth.signOut();
    }

    static async getCurrentUser() {
        const client = this.getClient();
        if (!client || !client.auth) return null;
        const { data } = await client.auth.getUser();
        return data ? data.user : null;
    }

    static async getUserProfile(userId) {
        const client = this.getClient();
        if (!client) return { data: null, error: 'No client' };
        return await client
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
    }

    static onAuthStateChange(callback) {
        const client = this.getClient();
        if (!client || !client.auth) return null;
        return client.auth.onAuthStateChange(callback);
    }
}

// Attach globally
window.AuthManager = AuthManager;

// Database Connection State
class DBConnection {
    static async checkConnection() {
        try {
            const client = AuthManager.getClient();
            if (!client) throw new Error('Supabase client not initialized');
            const { data, error } = await client
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
            url: localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL,
            key: localStorage.getItem('supabase_key') || DEFAULT_SUPABASE_ANON_KEY
        };
    }
}

window.DBConnection = DBConnection;
