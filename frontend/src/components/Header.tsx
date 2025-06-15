"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks";
import { Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import styles from "@/styles/components/Header.module.css";

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme } = useTheme();
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
        <header className={cx(styles.header, isDark ? styles.headerDark : '')}>
            <div className={styles.container}>
                <div className={styles.nav}>
                    {/* Logo */}
                    <div className={styles.logoContainer}>
                        <Link
                            href="/"
                            className={cx(styles.logoLink, isDark ? styles.logoLinkDark : '')}
                        >
                            InboxZero
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className={styles.desktopNav}>
                        <Link
                            href="/solutions"
                            className={cx(styles.navLink, isDark ? styles.navLinkDark : '')}
                        >
                            Solutions
                        </Link>
                        <Link
                            href="/enterprise"
                            className={cx(styles.navLink, isDark ? styles.navLinkDark : '')}
                        >
                            Enterprise
                        </Link>
                        <Link
                            href="/pricing"
                            className={cx(styles.navLink, isDark ? styles.navLinkDark : '')}
                        >
                            Pricing
                        </Link>
                    </nav>

                    {/* Auth Section */}
                    <div className={styles.authSection}>
                        {isAuthenticated ? (
                            <>
                                <span className={cx(styles.userGreeting, isDark ? styles.userGreetingDark : '')}>
                                    Merhaba, {user?.name || user?.email?.split('@')[0]}
                                </span>
                                <Link
                                    href="/inbox"
                                    className={cx(styles.panelButton, isDark ? styles.panelButtonDark : '')}
                                >
                                    <Settings className={styles.icon} />
                                    <span>Panel</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className={cx(styles.logoutButton, isDark ? styles.logoutButtonDark : '')}
                                >
                                    <LogOut className={styles.icon} />
                                    <span>Çıkış</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className={cx(styles.loginButton, isDark ? styles.loginButtonDark : '')}
                            >
                                Giriş Yap
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div>
                        <button
                            onClick={toggleMobileMenu}
                            className={cx(styles.mobileMenuButton, isDark ? styles.mobileMenuButtonDark : '')}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ?
                                <X className={styles.menuIcon} /> :
                                <Menu className={styles.menuIcon} />
                            }
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className={cx(styles.mobileMenu, isDark ? styles.mobileMenuDark : '')}>
                        <div className={styles.mobileMenuList}>
                            <Link
                                href="/solutions"
                                className={cx(styles.mobileNavLink, isDark ? styles.mobileNavLinkDark : '')}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Solutions
                            </Link>
                            <Link
                                href="/enterprise"
                                className={cx(styles.mobileNavLink, isDark ? styles.mobileNavLinkDark : '')}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Enterprise
                            </Link>
                            <Link
                                href="/pricing"
                                className={cx(styles.mobileNavLink, isDark ? styles.mobileNavLinkDark : '')}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Pricing
                            </Link>

                            <div className={cx(styles.mobileAuthSection, isDark ? styles.mobileAuthSectionDark : '')}>
                                {isAuthenticated ? (
                                    <>
                                        <div className={cx(styles.mobileUserGreeting, isDark ? styles.mobileUserGreetingDark : '')}>
                                            Merhaba, {user?.name || user?.email?.split('@')[0]}
                                        </div>
                                        <Link
                                            href="/inbox"
                                            className={cx(styles.mobilePanelButton, isDark ? styles.mobilePanelButtonDark : '')}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Settings className={styles.icon} />
                                            <span>Panel</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={cx(styles.mobileLogoutButton, isDark ? styles.mobileLogoutButtonDark : '')}
                                        >
                                            <LogOut className={styles.icon} />
                                            <span>Çıkış</span>
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        className={cx(styles.mobileLoginButton, isDark ? styles.mobileLoginButtonDark : '')}
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