export interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    role: 'ADMIN' | 'CLIENT';
    createdAt: string;
}

export interface AuthResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
    };
}

// Safe localStorage wrapper for SSR
const safeLocalStorage = {
    getItem: (key: string): string | null => {
        try {
            return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
        } catch {
            return null;
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem(key, value);
            }
        } catch {
            // Ignore storage errors
        }
    },
    removeItem: (key: string): void => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(key);
            }
        } catch {
            // Ignore storage errors
        }
    },
};

class AuthManager {
    private static instance: AuthManager;
    private user: User | null = null;
    private token: string | null = null;
    private isInitialized = false;

    static getInstance(): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    // Initialize auth state from localStorage - called only on client
    init(): void {
        if (this.isInitialized) return;

        this.token = safeLocalStorage.getItem('auth_token');
        const userStr = safeLocalStorage.getItem('user');
        if (userStr) {
            try {
                this.user = JSON.parse(userStr);
            } catch (error) {
                console.error('Failed to parse user from localStorage:', error);
                this.clearAuth();
            }
        }
        this.isInitialized = true;
    }

    // Set authentication data
    setAuth(response: AuthResponse, user?: User): void {
        this.token = response.access_token;
        safeLocalStorage.setItem('auth_token', response.access_token);

        if (user) {
            this.user = user;
            safeLocalStorage.setItem('user', JSON.stringify(user));
        }
    }

    // Clear authentication data
    clearAuth(): void {
        this.token = null;
        this.user = null;
        safeLocalStorage.removeItem('auth_token');
        safeLocalStorage.removeItem('refresh_token');
        safeLocalStorage.removeItem('user');
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this.token;
    }

    // Get current user
    getUser(): User | null {
        return this.user;
    }

    // Get auth token
    getToken(): string | null {
        return this.token;
    }

    // Update user data
    updateUser(userData: Partial<User>): void {
        if (this.user) {
            this.user = { ...this.user, ...userData };
            safeLocalStorage.setItem('user', JSON.stringify(this.user));
        }
    }

    // Login with email/password
    async login(email: string, password: string): Promise<User> {
        const { apiClient } = await import('./api');
        const response = await apiClient.auth.login(email, password);
        const authData: AuthResponse = response.data;

        this.setAuth(authData);

        // Fetch full user data
        const userResponse = await apiClient.auth.getCurrentUser();
        const user: User = userResponse.data;

        this.updateUser(user);
        return user;
    }

    // Register new user
    async register(email: string, password: string): Promise<User> {
        const { apiClient } = await import('./api');
        const response = await apiClient.auth.register(email, password);
        const authData: AuthResponse = response.data;

        this.setAuth(authData);

        // Fetch full user data
        const userResponse = await apiClient.auth.getCurrentUser();
        const user: User = userResponse.data;

        this.updateUser(user);
        return user;
    }

    // Google OAuth login
    initiateGoogleLogin(): void {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        window.location.href = `${apiUrl}/auth/google`;
    }

    // Handle Google OAuth callback
    async handleGoogleCallback(token: string): Promise<User> {
        this.token = token;
        safeLocalStorage.setItem('auth_token', token);

        // Fetch user data
        const { apiClient } = await import('./api');
        const userResponse = await apiClient.auth.getCurrentUser();
        const user: User = userResponse.data;

        this.updateUser(user);
        return user;
    }

    // Logout
    async logout(): Promise<void> {
        this.clearAuth();
        window.location.href = '/login';
    }

    // Refresh user data
    async refreshUser(): Promise<User | null> {
        if (!this.isAuthenticated()) {
            return null;
        }

        try {
            const { apiClient } = await import('./api');
            const userResponse = await apiClient.auth.getCurrentUser();
            const user: User = userResponse.data;

            this.updateUser(user);
            return user;
        } catch (error) {
            console.error('Failed to refresh user:', error);
            this.clearAuth();
            return null;
        }
    }
}

// Export singleton instance
export const authManager = AuthManager.getInstance();

// Utility functions
export const isAuthenticated = (): boolean => {
    return authManager.isAuthenticated();
};

export const getCurrentUser = (): User | null => {
    return authManager.getUser();
};

export const getAuthToken = (): string | null => {
    return authManager.getToken();
};

export const login = async (email: string, password: string): Promise<User> => {
    return authManager.login(email, password);
};

export const register = async (email: string, password: string): Promise<User> => {
    return authManager.register(email, password);
};

export const logout = async (): Promise<void> => {
    return authManager.logout();
};

export const initiateGoogleLogin = (): void => {
    return authManager.initiateGoogleLogin();
}; 