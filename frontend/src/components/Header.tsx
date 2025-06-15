"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks";
import { Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                            InboxZero
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/solutions"
                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        >
                            Solutions
                        </Link>
                        <Link
                            href="/enterprise"
                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        >
                            Enterprise
                        </Link>
                        <Link
                            href="/pricing"
                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        >
                            Pricing
                        </Link>
                    </nav>

                    {/* Auth Section */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-gray-600">
                                    Merhaba, {user?.name || user?.email?.split('@')[0]}
                                </span>
                                <Link
                                    href="/inbox"
                                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Panel</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-3 py-2 font-medium transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Çıkış</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                            >
                                Giriş Yap
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="text-gray-700 hover:text-blue-600 p-2"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        <div className="space-y-2">
                            <Link
                                href="/solutions"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Solutions
                            </Link>
                            <Link
                                href="/enterprise"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Enterprise
                            </Link>
                            <Link
                                href="/pricing"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Pricing
                            </Link>

                            <div className="border-t border-gray-200 pt-4">
                                {isAuthenticated ? (
                                    <>
                                        <div className="px-4 py-2 text-sm text-gray-600">
                                            Merhaba, {user?.name || user?.email?.split('@')[0]}
                                        </div>
                                        <Link
                                            href="/inbox"
                                            className="flex items-center space-x-2 mx-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Settings className="h-4 w-4" />
                                            <span>Panel</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center space-x-2 w-full text-left mx-4 mt-2 text-gray-700 hover:text-red-600 px-4 py-2 font-medium transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Çıkış</span>
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="block mx-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium text-center transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Giriş Yap
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
} 