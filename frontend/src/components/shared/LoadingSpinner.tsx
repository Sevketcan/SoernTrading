import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
            <div
                className={cn(
                    'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
                    sizeClasses[size]
                )}
            />
            {text && (
                <p className="text-sm text-gray-600 animate-pulse">{text}</p>
            )}
        </div>
    );
}

// Full page loading component
export function FullPageLoading({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
}

// Inline loading component
export function InlineLoading({ text }: { text?: string }) {
    return (
        <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" text={text} />
        </div>
    );
} 