'use client';

import { useAuth } from '@/lib/hooks';
import { FullPageLoading } from '@/components/shared/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            setShouldRedirect(true);
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return <FullPageLoading text="Loading your inbox..." />;
    }

    if (shouldRedirect || !isAuthenticated) {
        return <FullPageLoading text="Redirecting to login..." />;
    }

    return <>{children}</>;
} 