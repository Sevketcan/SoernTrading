'use client';

import { X } from 'lucide-react';
import { cn, getLabelColor } from '@/lib/utils';

interface LabelBadgeProps {
    label: string;
    color?: string;
    size?: 'xs' | 'sm' | 'md';
    removable?: boolean;
    onRemove?: () => void;
    className?: string;
}

export function LabelBadge({
    label,
    color,
    size = 'sm',
    removable = false,
    onRemove,
    className
}: LabelBadgeProps) {
    const sizeClasses = {
        xs: 'px-1.5 py-0.5 text-xs',
        sm: 'px-2 py-1 text-xs',
        md: 'px-2.5 py-1 text-sm',
    };

    const badgeColor = color || getLabelColor(label);

    // Convert hex color to RGB for alpha transparency
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgb = hexToRgb(badgeColor);
    const backgroundColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : badgeColor + '20';
    const borderColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` : badgeColor + '40';

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 font-medium rounded-full border',
                sizeClasses[size],
                className
            )}
            style={{
                backgroundColor,
                borderColor,
                color: badgeColor,
            }}
        >
            <span className="truncate max-w-24">{label}</span>
            {removable && onRemove && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="flex-shrink-0 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                    title={`Remove ${label} label`}
                >
                    <X className="h-2.5 w-2.5" />
                </button>
            )}
        </span>
    );
} 