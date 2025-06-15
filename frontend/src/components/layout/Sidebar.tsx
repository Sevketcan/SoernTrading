'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Inbox,
    Archive,
    Send,
    Star,
    Tag,
    BarChart3,
    Settings,
    Plus,
    Mail,
    Trash2,
    Clock,
    Unlink
} from 'lucide-react';
import { useEmailStats, useLabels } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { data: emailStats, isLoading: statsLoading } = useEmailStats();
    const { data: labels, isLoading: labelsLoading } = useLabels();

    const mainNavItems = [
        {
            href: '/inbox',
            label: 'Inbox',
            icon: Inbox,
            count: emailStats ? emailStats.totalEmails - emailStats.archivedEmails : 0,
            active: pathname === '/inbox',
        },
        {
            href: '/inbox?filter=unread',
            label: 'Unread',
            icon: Mail,
            count: emailStats?.unreadEmails || 0,
            active: pathname === '/inbox',
        },
        {
            href: '/inbox?filter=starred',
            label: 'Starred',
            icon: Star,
            count: 0,
            active: pathname === '/inbox',
        },
        {
            href: '/inbox?filter=pending',
            label: 'Pending Replies',
            icon: Clock,
            count: emailStats?.pendingReplies || 0,
            active: pathname === '/inbox',
        },
        {
            href: '/sent',
            label: 'Sent',
            icon: Send,
            count: 0,
            active: pathname === '/sent',
        },
        {
            href: '/archive',
            label: 'Archive',
            icon: Archive,
            count: emailStats?.archivedEmails || 0,
            active: pathname === '/archive',
        },
    ];

    const analyticsNavItems = [
        {
            href: '/analytics',
            label: 'Analytics',
            icon: BarChart3,
            active: pathname === '/analytics',
        },
        {
            href: '/unsubscribe',
            label: 'Unsubscribe',
            icon: Unlink,
            active: pathname === '/unsubscribe',
        },
        {
            href: '/settings',
            label: 'Settings',
            icon: Settings,
            active: pathname === '/settings',
        },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto',
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:w-72'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Navigation */}
                    <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
                        {/* Main Navigation */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Mail
                            </h3>
                            <nav className="space-y-1">
                                {mainNavItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                            item.active
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="h-5 w-5" />
                                            <span>{item.label}</span>
                                        </div>
                                        {item.count > 0 && (
                                            <span
                                                className={cn(
                                                    'px-2 py-0.5 text-xs rounded-full font-medium',
                                                    item.active
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-200 text-gray-600'
                                                )}
                                            >
                                                {item.count > 99 ? '99+' : item.count}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Labels */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Labels
                                </h3>
                                <button className="p-1 rounded-md hover:bg-gray-100">
                                    <Plus className="h-3 w-3 text-gray-400" />
                                </button>
                            </div>

                            {labelsLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <nav className="space-y-1">
                                    {labels?.slice(0, 8).map((label) => (
                                        <Link
                                            key={label.id}
                                            href={`/inbox?label=${encodeURIComponent(label.name)}`}
                                            onClick={onClose}
                                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: label.color }}
                                            />
                                            <span className="truncate">{label.name}</span>
                                        </Link>
                                    ))}
                                </nav>
                            )}
                        </div>

                        {/* Tools */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Tools
                            </h3>
                            <nav className="space-y-1">
                                {analyticsNavItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                            item.active
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Stats */}
                    {emailStats && (
                        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="text-xs text-gray-500 mb-2">Summary</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-center">
                                    <div className="font-semibold">{emailStats.totalEmails}</div>
                                    <div className="text-gray-500">Total</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-blue-600">{emailStats.unreadEmails}</div>
                                    <div className="text-gray-500">Unread</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
} 