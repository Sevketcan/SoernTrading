import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
    title?: string;
    message: string;
    variant?: 'default' | 'destructive' | 'warning';
    onRetry?: () => void;
    retryText?: string;
    className?: string;
}

export function ErrorMessage({
    title = 'Error',
    message,
    variant = 'default',
    onRetry,
    retryText = 'Try again',
    className,
}: ErrorMessageProps) {
    const variantClasses = {
        default: 'bg-red-50 border-red-200 text-red-800',
        destructive: 'bg-red-100 border-red-300 text-red-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    };

    const iconClasses = {
        default: 'text-red-500',
        destructive: 'text-red-600',
        warning: 'text-yellow-500',
    };

    return (
        <div
            className={cn(
                'rounded-lg border p-4',
                variantClasses[variant],
                className
            )}
        >
            <div className="flex items-start gap-3">
                <AlertCircle className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconClasses[variant])} />
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{title}</h3>
                    <p className="mt-1 text-sm opacity-90">{message}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className={cn(
                                'mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                                variant === 'warning'
                                    ? 'bg-yellow-200 hover:bg-yellow-300 text-yellow-900'
                                    : 'bg-red-200 hover:bg-red-300 text-red-900'
                            )}
                        >
                            <RefreshCw className="h-4 w-4" />
                            {retryText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Full page error component
export function FullPageError({
    title = 'Something went wrong',
    message = 'An unexpected error occurred. Please try refreshing the page.',
    onRetry,
}: {
    title?: string;
    message?: string;
    onRetry?: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
                <ErrorMessage
                    title={title}
                    message={message}
                    onRetry={onRetry}
                    retryText="Refresh page"
                    variant="destructive"
                />
            </div>
        </div>
    );
}

// Inline error component
export function InlineError({
    message,
    onRetry,
}: {
    message: string;
    onRetry?: () => void;
}) {
    return (
        <div className="py-8 px-4">
            <ErrorMessage
                title="Failed to load"
                message={message}
                onRetry={onRetry}
                className="max-w-md mx-auto"
            />
        </div>
    );
} 