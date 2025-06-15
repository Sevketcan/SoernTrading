'use client';

import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <Navbar
                onMenuClick={toggleMobileMenu}
                isMobileMenuOpen={isMobileMenuOpen}
            />

            <div className="flex">
                {/* Sidebar */}
                <Sidebar
                    isOpen={isMobileMenuOpen}
                    onClose={closeMobileMenu}
                />

                {/* Main content */}
                <main className="flex-1 lg:ml-0">
                    <div className="container mx-auto px-4 py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
} 