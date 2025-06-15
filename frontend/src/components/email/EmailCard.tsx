'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Archive,
    Star,
    Reply,
    MoreHorizontal,
    Clock,
    Tag,
    Mail,
    MailOpen,
    Trash2,
    Unlink
} from 'lucide-react';
import { useEmailMutations, useUnsubscribeMutations } from '@/lib/hooks';
import type { Email } from '@/lib/hooks';
import { cn, formatRelativeTime, getEmailPreview, getInitials } from '@/lib/utils';
import { LabelBadge } from '@/components/labels/LabelBadge';

interface EmailCardProps {
    email: Email;
}

export function EmailCard({ email }: EmailCardProps) {
    const [showActions, setShowActions] = useState(false);
    const { archiveEmail, markAsRead } = useEmailMutations();
    const { requestUnsubscribe } = useUnsubscribeMutations();

    const handleArchive = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        archiveEmail.mutate(email.id);
    };

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!email.isRead) {
            markAsRead.mutate(email.id);
        }
    };

    const handleUnsubscribe = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        requestUnsubscribe.mutate(email.id);
    };

    const handleToggleActions = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowActions(!showActions);
    };

    return (
        <div className="relative group">
            <Link
                href={`/email/${email.id}`}
                className={cn(
                    'block p-4 hover:bg-gray-50 transition-colors',
                    !email.isRead && 'bg-blue-50/30'
                )}
            >
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                                {getInitials(email.fromName || email.fromEmail)}
                            </span>
                        </div>
                    </div>

                    {/* Email content */}
                    <div className="flex-1 min-w-0">
                        {/* Header row */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className={cn(
                                    'font-medium text-sm truncate',
                                    !email.isRead ? 'text-gray-900' : 'text-gray-600'
                                )}>
                                    {email.fromName || email.fromEmail}
                                </span>
                                {!email.isRead && (
                                    <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0" />
                                )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-gray-500">
                                    {formatRelativeTime(email.receivedAt)}
                                </span>
                                {email.isReplied && (
                                    <Reply className="h-3 w-3 text-green-600" />
                                )}
                            </div>
                        </div>

                        {/* Subject */}
                        <h3 className={cn(
                            'text-sm mb-1 truncate',
                            !email.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                        )}>
                            {email.subject || '(no subject)'}
                        </h3>

                        {/* Preview */}
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {getEmailPreview(email.body, 120)}
                        </p>

                        {/* Labels */}
                        {email.labels && email.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {email.labels.slice(0, 3).map((label) => (
                                    <LabelBadge
                                        key={label}
                                        label={label}
                                        size="sm"
                                    />
                                ))}
                                {email.labels.length > 3 && (
                                    <span className="text-xs text-gray-500 px-2 py-1">
                                        +{email.labels.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Footer indicators */}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            {email.threadId && (
                                <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <span>Thread</span>
                                </div>
                            )}
                            {email.replies && email.replies.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <Reply className="h-3 w-3" />
                                    <span>{email.replies.length} replies</span>
                                </div>
                            )}
                            {email.labels?.includes('needs-reply') && (
                                <div className="flex items-center gap-1 text-orange-600">
                                    <Clock className="h-3 w-3" />
                                    <span>Needs reply</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                            {/* Mark as read/unread */}
                            <button
                                onClick={handleMarkAsRead}
                                className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                                title={email.isRead ? 'Mark as unread' : 'Mark as read'}
                            >
                                {email.isRead ? (
                                    <Mail className="h-4 w-4 text-gray-600" />
                                ) : (
                                    <MailOpen className="h-4 w-4 text-gray-600" />
                                )}
                            </button>

                            {/* Archive */}
                            <button
                                onClick={handleArchive}
                                disabled={archiveEmail.isPending}
                                className="p-1.5 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                                title="Archive"
                            >
                                <Archive className="h-4 w-4 text-gray-600" />
                            </button>

                            {/* More actions */}
                            <div className="relative">
                                <button
                                    onClick={handleToggleActions}
                                    className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                                    title="More actions"
                                >
                                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                                </button>

                                {/* Actions dropdown */}
                                {showActions && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                        <div className="py-1">
                                            <button
                                                onClick={handleUnsubscribe}
                                                disabled={requestUnsubscribe.isPending}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <Unlink className="h-4 w-4" />
                                                Unsubscribe
                                            </button>
                                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                <Star className="h-4 w-4" />
                                                Star
                                            </button>
                                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                <Tag className="h-4 w-4" />
                                                Add label
                                            </button>
                                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Click outside to close actions menu */}
            {showActions && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowActions(false)}
                />
            )}
        </div>
    );
} 