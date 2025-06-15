/**
 * CSS Utilities for CSS Modules
 * Provides helper functions for managing CSS classes in a modular architecture
 */

import { useTheme } from 'next-themes';

/**
 * Combines multiple CSS classes, filtering out falsy values
 * Similar to the popular 'clsx' library but optimized for our CSS Modules approach
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Creates a class name combiner with theme support
 * Usage: const cx = createThemeClassCombiner(); cx(baseClass, isDark && darkClass)
 */
export function createThemeClassCombiner() {
    return (...classes: (string | boolean | undefined | null)[]): string => {
        return classes.filter(Boolean).join(' ');
    };
}

/**
 * Hook for managing theme-aware CSS classes
 * Returns utilities for combining base and theme-specific classes
 */
export function useThemeClasses() {
    const { theme, resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    /**
     * Combines base class with theme-specific variant
     * @param baseClass - The base CSS class
     * @param darkClass - The dark theme variant class
     * @param lightClass - Optional light theme variant class
     */
    const themeClass = (
        baseClass: string,
        darkClass?: string,
        lightClass?: string
    ): string => {
        const classes = [baseClass];

        if (isDark && darkClass) {
            classes.push(darkClass);
        } else if (!isDark && lightClass) {
            classes.push(lightClass);
        }

        return classes.join(' ');
    };

    /**
     * Combines multiple theme-aware classes
     */
    const cx = (...classes: (string | boolean | undefined | null)[]): string => {
        return classes.filter(Boolean).join(' ');
    };

    return {
        isDark,
        theme,
        themeClass,
        cx,
    };
}

/**
 * Variants helper for creating component variations
 * Similar to class-variance-authority but lightweight
 */
export function createVariants<T extends Record<string, Record<string, string>>>(
    variants: T
) {
    return function getVariant<K extends keyof T>(
        variant: K,
        value: keyof T[K]
    ): string {
        return variants[variant][value] || '';
    };
}

/**
 * CSS Module class extractor
 * Helps extract specific classes from CSS modules with better TypeScript support
 */
export function extractClasses<T extends Record<string, string>>(
    styles: T,
    classNames: (keyof T)[]
): string {
    return classNames
        .map(className => styles[className])
        .filter(Boolean)
        .join(' ');
}

/**
 * Responsive class helper
 * Creates responsive class combinations for CSS modules
 */
export function responsive(classes: {
    base?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
}): string {
    const classArray: string[] = [];

    Object.entries(classes).forEach(([breakpoint, className]) => {
        if (className) {
            if (breakpoint === 'base') {
                classArray.push(className);
            } else {
                classArray.push(`${breakpoint}:${className}`);
            }
        }
    });

    return classArray.join(' ');
}

/**
 * Animation state manager
 * Helps manage component animation states with CSS modules
 */
export function useAnimationClasses(
    baseClass: string,
    states: {
        entering?: string;
        entered?: string;
        exiting?: string;
        exited?: string;
    }
) {
    const getAnimationClass = (state: keyof typeof states): string => {
        return cn(baseClass, states[state]);
    };

    return { getAnimationClass };
}

/**
 * CSS custom properties helper
 * Manages CSS custom properties dynamically
 */
export function setCSSCustomProperty(property: string, value: string, element?: HTMLElement) {
    const target = element || document.documentElement;
    target.style.setProperty(`--${property}`, value);
}

export function getCSSCustomProperty(property: string, element?: HTMLElement): string {
    const target = element || document.documentElement;
    return getComputedStyle(target).getPropertyValue(`--${property}`).trim();
}

/**
 * Media query helper for JavaScript
 */
export function useMediaQuery(query: string): boolean {
    if (typeof window === 'undefined') return false;

    const mediaQuery = window.matchMedia(query);
    return mediaQuery.matches;
}

/**
 * Common breakpoint queries
 */
export const breakpoints = {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',
} as const;

/**
 * Color opacity helper
 * Helps create color variations with opacity
 */
export function withOpacity(colorVar: string, opacity: number): string {
    return `rgb(from ${colorVar} r g b / ${opacity})`;
} 