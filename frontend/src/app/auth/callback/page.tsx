'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authManager } from '@/lib/auth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the access_token from URL fragment (after #)
                const fragment = window.location.hash.substring(1);
                const params = new URLSearchParams(fragment);

                // Also check if it's in search params (after ?)
                const searchToken = searchParams.get('access_token');
                const fragmentToken = params.get('access_token');

                const token = searchToken || fragmentToken;

                if (!token) {
                    // Check if we have error parameters
                    const error = searchParams.get('error') || params.get('error');
                    if (error) {
                        toast.error(`Authentication failed: ${error}`);
                    } else {
                        toast.error('No authentication token received');
                    }
                    router.push('/login');
                    return;
                }

                // ✅ 1. Store token in localStorage
                localStorage.setItem('auth_token', token);

                // Initialize auth manager
                authManager.init();

                // ✅ 4. Validate token with /auth/me and get user data
                const userResponse = await fetch('http://localhost:4000/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!userResponse.ok) {
                    throw new Error('Failed to validate token');
                }

                const userData = await userResponse.json();

                // ✅ 1. Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(userData));

                // Update auth manager with user data
                authManager.updateUser(userData);

                toast.success(`Welcome back, ${userData.name || userData.email}!`);

                // ✅ 2. Redirect to protected pages (/inbox)
                router.push('/inbox');

            } catch (error) {
                console.error('OAuth callback error:', error);
                toast.error('Authentication failed. Please try again.');
                router.push('/login');
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                    Completing authentication...
                </h2>
                <p className="mt-2 text-gray-600">
                    Please wait while we log you in
                </p>
            </div>
        </div>
    );
} 