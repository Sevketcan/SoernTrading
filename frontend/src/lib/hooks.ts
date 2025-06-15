import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { apiClient } from './api';
import { authManager, User } from './auth';
import { toast } from 'react-hot-toast';

// Types
export interface Email {
    id: string;
    userId: string;
    subject: string;
    body: string;
    fromEmail: string;
    fromName?: string;
    toEmail: string;
    labels: string[];
    receivedAt: string;
    isArchived: boolean;
    isReplied: boolean;
    isRead: boolean;
    threadId?: string;
    messageId: string;
    createdAt: string;
    updatedAt: string;
    replies?: Reply[];
    unsubscribeRequests?: any[];
}

export interface Reply {
    id: string;
    emailId: string;
    userId: string;
    body: string;
    sentAt: string | null;
    aiGenerated: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Label {
    id: string;
    name: string;
    color: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface EmailFilters {
    labels?: string[];
    isArchived?: boolean;
    isReplied?: boolean;
    isRead?: boolean;
    search?: string;
}

// Auth Hook
export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Initialize auth manager on client side only
                authManager.init();
                setIsInitialized(true);

                if (authManager.isAuthenticated()) {
                    const currentUser = authManager.getUser();
                    if (currentUser) {
                        setUser(currentUser);
                    } else {
                        // Try to refresh user data
                        const refreshedUser = await authManager.refreshUser();
                        setUser(refreshedUser);
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                authManager.clearAuth();
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const user = await authManager.login(email, password);
            setUser(user);
            toast.success('Successfully logged in!');
            return user;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const user = await authManager.register(email, password);
            setUser(user);
            toast.success('Account created successfully!');
            return user;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authManager.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const googleLogin = () => {
        authManager.initiateGoogleLogin();
    };

    return {
        user,
        isAuthenticated: isInitialized && !!user,
        isLoading,
        login,
        register,
        logout,
        googleLogin,
    };
}

// Emails Hook
export function useEmails(filters: EmailFilters = {}) {
    return useQuery({
        queryKey: ['emails', filters],
        queryFn: async () => {
            const response = await apiClient.emails.getAll(filters);
            return response.data as Email[];
        },
        staleTime: 30000, // 30 seconds
    });
}

// Single Email Hook
export function useEmail(emailId: string) {
    return useQuery({
        queryKey: ['email', emailId],
        queryFn: async () => {
            const response = await apiClient.emails.getById(emailId);
            return response.data as Email;
        },
        enabled: !!emailId,
    });
}

// Email Stats Hook
export function useEmailStats() {
    return useQuery({
        queryKey: ['email-stats'],
        queryFn: async () => {
            const response = await apiClient.emails.getStats();
            return response.data;
        },
        staleTime: 60000, // 1 minute
    });
}

// Email Mutations
export function useEmailMutations() {
    const queryClient = useQueryClient();

    const archiveEmail = useMutation({
        mutationFn: async (emailId: string) => {
            const response = await apiClient.emails.archive(emailId);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            queryClient.invalidateQueries({ queryKey: ['email-stats'] });
            toast.success('Email archived');
        },
        onError: () => {
            toast.error('Failed to archive email');
        },
    });

    const markAsRead = useMutation({
        mutationFn: async (emailId: string) => {
            const response = await apiClient.emails.markAsRead(emailId);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            queryClient.invalidateQueries({ queryKey: ['email-stats'] });
        },
    });

    const addLabel = useMutation({
        mutationFn: async ({ emailId, label }: { emailId: string; label: string }) => {
            const response = await apiClient.emails.addLabel(emailId, label);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            toast.success('Label added');
        },
        onError: () => {
            toast.error('Failed to add label');
        },
    });

    const removeLabel = useMutation({
        mutationFn: async ({ emailId, label }: { emailId: string; label: string }) => {
            const response = await apiClient.emails.removeLabel(emailId, label);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            toast.success('Label removed');
        },
        onError: () => {
            toast.error('Failed to remove label');
        },
    });

    const syncEmails = useMutation({
        mutationFn: async () => {
            const response = await apiClient.emails.sync();
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            queryClient.invalidateQueries({ queryKey: ['email-stats'] });
            toast.success('Emails synced successfully');
        },
        onError: () => {
            toast.error('Failed to sync emails');
        },
    });

    return {
        archiveEmail,
        markAsRead,
        addLabel,
        removeLabel,
        syncEmails,
    };
}

// Replies Hook
export function useReplies(emailId: string) {
    return useQuery({
        queryKey: ['replies', emailId],
        queryFn: async () => {
            const response = await apiClient.replies.getByEmail(emailId);
            return response.data as Reply[];
        },
        enabled: !!emailId,
    });
}

// Reply Mutations
export function useReplyMutations() {
    const queryClient = useQueryClient();

    const createReply = useMutation({
        mutationFn: async ({ emailId, body, aiGenerated = false }: {
            emailId: string;
            body: string;
            aiGenerated?: boolean;
        }) => {
            const response = await apiClient.replies.create(emailId, body, aiGenerated);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['replies', variables.emailId] });
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            queryClient.invalidateQueries({ queryKey: ['email-stats'] });
            toast.success('Reply sent successfully');
        },
        onError: () => {
            toast.error('Failed to send reply');
        },
    });

    const generateAIReply = useMutation({
        mutationFn: async ({ emailId, context, tone }: {
            emailId: string;
            context?: string;
            tone?: string;
        }) => {
            const response = await apiClient.replies.generateAI(emailId, context, tone);
            return response.data;
        },
        onSuccess: () => {
            toast.success('AI reply generated');
        },
        onError: () => {
            toast.error('Failed to generate AI reply');
        },
    });

    const sendDraftReply = useMutation({
        mutationFn: async (replyId: string) => {
            const response = await apiClient.replies.send(replyId);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['replies'] });
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            toast.success('Draft reply sent');
        },
        onError: () => {
            toast.error('Failed to send draft reply');
        },
    });

    return {
        createReply,
        generateAIReply,
        sendDraftReply,
    };
}

// Labels Hook
export function useLabels() {
    return useQuery({
        queryKey: ['labels'],
        queryFn: async () => {
            const response = await apiClient.labels.getAll();
            return response.data as Label[];
        },
        staleTime: 300000, // 5 minutes
    });
}

// Label Mutations
export function useLabelMutations() {
    const queryClient = useQueryClient();

    const createLabel = useMutation({
        mutationFn: async ({ name, color }: { name: string; color?: string }) => {
            const response = await apiClient.labels.create(name, color);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labels'] });
            toast.success('Label created');
        },
        onError: () => {
            toast.error('Failed to create label');
        },
    });

    const updateLabel = useMutation({
        mutationFn: async ({ id, name, color }: {
            id: string;
            name?: string;
            color?: string;
        }) => {
            const response = await apiClient.labels.update(id, name, color);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labels'] });
            toast.success('Label updated');
        },
        onError: () => {
            toast.error('Failed to update label');
        },
    });

    const deleteLabel = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.labels.delete(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labels'] });
            queryClient.invalidateQueries({ queryKey: ['emails'] }); // Labels might be removed from emails
            toast.success('Label deleted');
        },
        onError: () => {
            toast.error('Failed to delete label');
        },
    });

    return {
        createLabel,
        updateLabel,
        deleteLabel,
    };
}

// Analytics Hook
export function useAnalytics() {
    return useQuery({
        queryKey: ['analytics-overview'],
        queryFn: async () => {
            const response = await apiClient.analytics.getOverview();
            return response.data;
        },
        staleTime: 60000, // 1 minute
    });
}

// Analytics Trends Hook
export function useAnalyticsTrends(days: number = 30) {
    return useQuery({
        queryKey: ['analytics-trends', days],
        queryFn: async () => {
            const response = await apiClient.analytics.getTrends(days);
            return response.data;
        },
        staleTime: 300000, // 5 minutes
    });
}

// Unsubscribe Hook
export function useUnsubscribeMutations() {
    const queryClient = useQueryClient();

    const requestUnsubscribe = useMutation({
        mutationFn: async (emailId: string) => {
            const response = await apiClient.unsubscribe.request(emailId);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            toast.success('Unsubscribe request submitted');
        },
        onError: () => {
            toast.error('Failed to submit unsubscribe request');
        },
    });

    return {
        requestUnsubscribe,
    };
} 