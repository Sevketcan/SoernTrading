import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post('/auth/refresh', {
                        refresh_token: refreshToken,
                    });

                    const { access_token } = response.data;
                    localStorage.setItem('auth_token', access_token);

                    // Retry original request
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.');
        } else if (error.response?.status === 403) {
            toast.error('You do not have permission to perform this action.');
        } else if (error.response?.status === 404) {
            toast.error('Resource not found.');
        } else if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error('An unexpected error occurred.');
        }

        return Promise.reject(error);
    }
);

// API client functions
export const apiClient = {
    // Auth endpoints
    auth: {
        login: (email: string, password: string) =>
            api.post('/auth/login', { email, password }),
        register: (email: string, password: string) =>
            api.post('/auth/register', { email, password }),
        getCurrentUser: () => api.get('/auth/me'),
        refreshToken: () => api.post('/auth/refresh'),
        googleLogin: () => {
            window.location.href = `${api.defaults.baseURL}/auth/google`;
        },
    },

    // Email endpoints
    emails: {
        getAll: (params?: any) => api.get('/emails', { params }),
        getById: (id: string) => api.get(`/emails/${id}`),
        archive: (id: string) => api.put(`/emails/${id}/archive`),
        markAsRead: (id: string) => api.put(`/emails/${id}/read`),
        markAsReplied: (id: string) => api.put(`/emails/${id}/replied`),
        addLabel: (id: string, label: string) =>
            api.post(`/emails/${id}/labels`, { label }),
        removeLabel: (id: string, label: string) =>
            api.delete(`/emails/${id}/labels`, { data: { label } }),
        sync: () => api.post('/emails/sync'),
        getStats: () => api.get('/emails/stats'),
    },

    // Reply endpoints
    replies: {
        create: (emailId: string, body: string, aiGenerated = false) =>
            api.post(`/emails/${emailId}/reply`, { body, aiGenerated }),
        getByEmail: (emailId: string) => api.get(`/emails/${emailId}/replies`),
        generateAI: (emailId: string, context?: string, tone?: string) =>
            api.post(`/emails/${emailId}/reply/generate-ai`, { context, tone }),
        update: (replyId: string, body: string) =>
            api.put(`/replies/${replyId}`, { body }),
        delete: (replyId: string) => api.delete(`/replies/${replyId}`),
        send: (replyId: string) => api.post(`/replies/${replyId}/send`),
        getStats: () => api.get('/replies/stats'),
    },

    // Label endpoints
    labels: {
        getAll: () => api.get('/labels'),
        create: (name: string, color?: string) =>
            api.post('/labels', { name, color }),
        update: (id: string, name?: string, color?: string) =>
            api.patch(`/labels/${id}`, { name, color }),
        delete: (id: string) => api.delete(`/labels/${id}`),
        getStats: () => api.get('/labels/stats'),
    },

    // Analytics endpoints
    analytics: {
        getOverview: () => api.get('/analytics/overview'),
        getUserAnalytics: (userId: string, period?: string) =>
            api.get(`/analytics/user/${userId}`, { params: { period } }),
        getTrends: (days?: number) =>
            api.get('/analytics/trends', { params: { days } }),
        getHistory: (limit?: number) =>
            api.get('/analytics/history', { params: { limit } }),
    },

    // Unsubscribe endpoints
    unsubscribe: {
        request: (emailId: string) => api.post(`/emails/${emailId}/unsubscribe`),
        getRequests: () => api.get('/unsubscribe/requests'),
        getStats: () => api.get('/unsubscribe/stats'),
        retry: (requestId: string) => api.post(`/unsubscribe/${requestId}/retry`),
    },
};

export default api; 