'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Search, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { EmailCard } from '@/components/email/EmailCard';
import { InlineLoading } from '@/components/shared/LoadingSpinner';
import { InlineError } from '@/components/shared/ErrorMessage';
import { useEmails, useEmailMutations } from '@/lib/hooks';
import type { EmailFilters } from '@/lib/hooks';
import { cn, debounce } from '@/lib/utils';

export default function InboxPage() {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');

    // Build filters from URL params
    const filters = useMemo(() => {
        const urlFilters: EmailFilters = {};

        const filter = searchParams?.get('filter');
        if (filter === 'unread') {
            urlFilters.isRead = false;
        } else if (filter === 'pending') {
            urlFilters.labels = ['needs-reply'];
        }

        const label = searchParams?.get('label');
        if (label) {
            urlFilters.labels = [label];
        }

        if (searchQuery) {
            urlFilters.search = searchQuery;
        }

        urlFilters.isArchived = false;

        return urlFilters;
    }, [searchParams, searchQuery]);

    const { data: emails, isLoading, error, refetch } = useEmails(filters);
    const { syncEmails } = useEmailMutations();

    const debouncedSearch = useMemo(
        () => debounce((query: string) => setSearchQuery(query), 300),
        []
    );

    const handleSync = () => {
        syncEmails.mutate();
    };

    const getPageTitle = () => {
        const filter = searchParams?.get('filter');
        const label = searchParams?.get('label');

        if (filter === 'unread') return 'Unread Emails';
        if (filter === 'pending') return 'Pending Replies';
        if (label) return `Label: ${label}`;
        return 'Inbox';
    };

    if (error) {
        return (
            <ProtectedRoute>
                <AppLayout>
                    <InlineError
                        message="Failed to load emails. Please try again."
                        onRetry={() => refetch()}
                    />
                </AppLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {getPageTitle()}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {isLoading ? 'Loading...' : `${emails?.length || 0} emails`}
                            </p>
                        </div>

                        <button
                            onClick={handleSync}
                            disabled={syncEmails.isPending}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                className={cn(
                                    "h-4 w-4",
                                    syncEmails.isPending && "animate-spin"
                                )}
                            />
                            Sync
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search emails..."
                            onChange={(e) => debouncedSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200">
                        {isLoading ? (
                            <InlineLoading text="Loading emails..." />
                        ) : emails && emails.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {emails.map((email) => (
                                    <EmailCard
                                        key={email.id}
                                        email={email}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No emails found
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {searchQuery ? "Try adjusting your search" : "Your inbox is empty! 🎉"}
                                </p>
                                {!searchQuery && (
                                    <button
                                        onClick={handleSync}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Sync emails
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
} 