"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks";
import { Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import styles from "@/styles/components/Header.module.css";

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isDark = theme === 'dark';

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

    // Helper function to combine classes
    const cx = (...classes: (string | boolean | undefined | null)[]) =>
        classes.filter(Boolean).join(' ');

    return (
        <header className={`${styles.header} ${isDark ? styles.headerDark : ''}`}>
            <div className={styles.container}>
                <nav className={styles.nav}>
                    {/* Logo */}
                    <div className={styles.logoContainer}>
                        <Link
                            href="/"
                            className={`${styles.logoLink} ${isDark ? styles.logoLinkDark : ''}`}
                        >
                            InboxZero
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className={styles.desktopNav}>
                        <Link
                            href="/solutions"
                            className={`${styles.navLink} ${isDark ? styles.navLinkDark : ''}`}
                        >
                            Solutions
                        </Link>
                        <Link
                            href="/enterprise"
                            className={`${styles.navLink} ${isDark ? styles.navLinkDark : ''}`}
                        >
                            Enterprise
                        </Link>
                        <Link
                            href="/pricing"
                            className={`${styles.navLink} ${isDark ? styles.navLinkDark : ''}`}
                        >
                            Pricing
                        </Link>
                    </div>

                    {/* Auth Section */}
                    <div className={styles.authSection}>
                        <Link href="/login" className={`${styles.loginButton} ${isDark ? styles.loginButtonDark : ''}`}>
                            Giriş Yap
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className={styles.mobileMenuContainer}>
                        <button
                            onClick={toggleMobileMenu}
                            className={`${styles.mobileMenuButton} ${isDark ? styles.mobileMenuButtonDark : ''}`}
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className={styles.menuIcon} />
                            ) : (
                                <Menu className={styles.menuIcon} />
                            )}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className={`${styles.mobileMenu} ${isDark ? styles.mobileMenuDark : ''}`}>
                        <div className={styles.mobileMenuList}>
                            <Link
                                href="/solutions"
                                className={`${styles.mobileNavLink} ${isDark ? styles.mobileNavLinkDark : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Solutions
                            </Link>
                            <Link
                                href="/enterprise"
                                className={`${styles.mobileNavLink} ${isDark ? styles.mobileNavLinkDark : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Enterprise
                            </Link>
                            <Link
                                href="/pricing"
                                className={`${styles.mobileNavLink} ${isDark ? styles.mobileNavLinkDark : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Pricing
                            </Link>

                            <div className={cx(styles.mobileAuthSection, isDark ? styles.mobileAuthSectionDark : '')}>
                                <Link
                                    href="/login"
                                    className={styles.mobileLoginButton}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Giriş Yap
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
} 