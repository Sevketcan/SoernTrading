'use client';

import { useState } from 'react';
import {
    Search,
    Bell,
    Settings,
    User,
    LogOut,
    RefreshCw,
    Menu,
    X,
    Mail,
    ChevronDown
} from 'lucide-react';
import { useAuth, useEmailMutations } from '@/lib/hooks';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { getInitials } from '@/lib/utils';

interface NavbarProps {
    onMenuClick?: () => void;
    isMobileMenuOpen?: boolean;
}

export function Navbar({ onMenuClick, isMobileMenuOpen }: NavbarProps) {
    const { user, logout } = useAuth();
    const { syncEmails } = useEmailMutations();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSync = () => {
        syncEmails.mutate();
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
            <div className="flex items-center justify-between">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>

                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-600 rounded-lg">
                            <Mail className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
                            Inbox Zero
                        </h1>
                    </div>

                    {/* Search bar */}
                    <div className="hidden md:flex relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search emails..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 w-64 lg:w-96 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* Sync button */}
                    <button
                        onClick={handleSync}
                        disabled={syncEmails.isPending}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        title="Sync emails"
                    >
                        {syncEmails.isPending ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <RefreshCw className="h-5 w-5 text-gray-600" />
                        )}
                    </button>

                    {/* Mobile search button */}
                    <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Search className="h-5 w-5 text-gray-600" />
                    </button>

                    {/* Notifications */}
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                        <Bell className="h-5 w-5 text-gray-600" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Settings */}
                    <button className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Settings className="h-5 w-5 text-gray-600" />
                    </button>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name || user.email}
                                    className="h-6 w-6 rounded-full"
                                />
                            ) : (
                                <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                                    {getInitials(user?.name || user?.email)}
                                </div>
                            )}
                            <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-32 truncate">
                                {user?.name || user?.email}
                            </span>
                            <ChevronDown className="hidden sm:block h-4 w-4 text-gray-500" />
                        </button>

                        {/* User dropdown menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <div className="p-3 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-sm text-gray-600 truncate">
                                        {user?.email}
                                    </p>
                                </div>

                                <div className="py-1">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                        <User className="h-4 w-4" />
                                        Profile
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 py-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Click outside to close user menu */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                />
            )}
        </nav>
    );
} 