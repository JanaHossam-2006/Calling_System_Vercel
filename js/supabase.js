/**
 * Supabase Client Configuration
 */

const DEFAULT_SUPABASE_URL = 'https://sylulmlqsqhyujprjups.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_mJHllHfX125IsngquC4YJw_G5oIVUDT';

const config = {
    url: localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL,
    anonKey: localStorage.getItem('supabase_key') || DEFAULT_SUPABASE_ANON_KEY
};

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(
    config.url,
    config.anonKey
);

// Export globally
window.supabaseClient = supabaseClient;
window.SUPABASE_CONFIG = config;

// Auth State Manager
window.AuthManager = {
    async getSession() {
        try {
            const { data, error } = await supabaseClient.auth.getSession();
            if (error) throw error;
            return data ? data.session : null;
        } catch (err) {
            console.error('getSession error:', err);
            return null;
        }
    },

    async signIn(email, password) {
        return await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
    },

    async signOut() {
        return await supabaseClient.auth.signOut();
    },

    async getCurrentUser() {
        const { data } = await supabaseClient.auth.getUser();
        return data ? data.user : null;
    },

    onAuthStateChange(callback) {
        return supabaseClient.auth.onAuthStateChange(callback);
    }
};

// Database Connection State
window.DBConnection = {
    async checkConnection() {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('count', { count: 'exact' })
                .limit(1);
            if (error) throw error;
            return { connected: true };
        } catch (error) {
            return { connected: false, error };
        }
    }
};
