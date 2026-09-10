/**
 * Supabase Client Configuration
 * يتم التحكم في اتصالات قاعدة البيانات من هنا
 */

// Supabase project config
const DEFAULT_SUPABASE_URL = 'https://sylulmlqsqhyujprjups.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_mJHllHfX125IsngquC4YJw_G5oIVUDT';

const SUPABASE_URL = localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = localStorage.getItem('supabase_key') || DEFAULT_SUPABASE_ANON_KEY;

// Safe Supabase client initialization helper
function initSupabase() {
    if (window.supabaseInstance) return window.supabaseInstance;
    
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        window.supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return window.supabaseInstance;
    }
    
    // Fallback if window.supabase is a client instance
    if (window.supabase && typeof window.supabase.from === 'function') {
        window.supabaseInstance = window.supabase;
        return window.supabaseInstance;
    }
    
    console.warn('Supabase JS library not loaded yet');
    return null;
}

// Initial client instance
const supabase = initSupabase() || (window.supabase && typeof window.supabase.createClient === 'function' ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null);
window.supabase = supabase || window.supabase;

// Auth State Manager
class AuthManager {
    static getClient() {
        return window.supabaseInstance || initSupabase() || window.supabase;
    }

    static async getSession() {
        const client = this.getClient();
        if (!client || typeof client.auth?.getSession !== 'function') {
            console.error('Supabase client not ready for getSession');
            return null;
        }
        const { data: { session } } = await client.auth.getSession();
        return session;
    }

    static async signUp(email, password, userData) {
        const client = this.getClient();
        if (!client || typeof client.auth?.signUp !== 'function') {
            return { error: { message: 'Supabase client not initialized' } };
        }
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        return { data, error };
    }

    static async signIn(email, password) {
        const client = this.getClient();
        if (!client || typeof client.auth?.signInWithPassword !== 'function') {
            return { error: { message: 'Supabase client not initialized' } };
        }
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    }

    static async signOut() {
        const client = this.getClient();
        if (!client || typeof client.auth?.signOut !== 'function') return { error: null };
        const { error } = await client.auth.signOut();
        return { error };
    }

    static async getCurrentUser() {
        const client = this.getClient();
        if (!client || typeof client.auth?.getUser !== 'function') return null;
        const { data: { user } } = await client.auth.getUser();
        return user;
    }

    static async getUserProfile(userId) {
        const client = this.getClient();
        if (!client || typeof client.from !== 'function') return { data: null, error: 'Supabase not ready' };
        const { data, error } = await client
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    }

    static onAuthStateChange(callback) {
        const client = this.getClient();
        if (!client || typeof client.auth?.onAuthStateChange !== 'function') return null;
        return client.auth.onAuthStateChange(callback);
    }
}

window.AuthManager = AuthManager;

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
