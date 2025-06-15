'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { CheckCircle, XCircle, User, Mail, Shield, Database } from 'lucide-react';

export default function TestAuthPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [tests, setTests] = useState({
        tokenStorage: false,
        userValidation: false,
        protectedRequest: false,
        apiConnection: false,
    });
    const [testResults, setTestResults] = useState<any>({});
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            runTests();
        }
    }, [isAuthenticated]);

    const runTests = async () => {
        setIsRunning(true);
        const results: any = {};

        try {
            // ✅ 1. Test Token Storage
            const token = localStorage.getItem('auth_token');
            const storedUser = localStorage.getItem('user');

            results.tokenStorage = {
                success: !!(token && storedUser),
                token: token ? `${token.substring(0, 20)}...` : 'Not found',
                user: storedUser ? JSON.parse(storedUser) : null,
            };
            setTests(prev => ({ ...prev, tokenStorage: results.tokenStorage.success }));

            // ✅ 4. Test /auth/me endpoint
            const userResponse = await apiClient.auth.getCurrentUser();
            results.userValidation = {
                success: true,
                data: userResponse.data,
            };
            setTests(prev => ({ ...prev, userValidation: true }));

            // ✅ 3. Test Protected API Request (emails)
            const emailsResponse = await apiClient.emails.getAll();
            results.protectedRequest = {
                success: true,
                emailCount: emailsResponse.data.length,
                data: emailsResponse.data.slice(0, 2), // First 2 emails
            };
            setTests(prev => ({ ...prev, protectedRequest: true }));

            // Test API connection
            const statsResponse = await apiClient.emails.getStats();
            results.apiConnection = {
                success: true,
                stats: statsResponse.data,
            };
            setTests(prev => ({ ...prev, apiConnection: true }));

        } catch (error: any) {
            console.error('Test error:', error);
            results.error = error.message;
        }

        setTestResults(results);
        setIsRunning(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading authentication..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Authenticated</h1>
                    <p className="text-gray-600 mb-4">Please log in to test authentication</p>
                    <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Test Dashboard</h1>
                    <p className="text-gray-600 mb-8">Testing all 4 authentication steps</p>

                    {/* Test Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <TestCard
                            title="1. Token Storage"
                            icon={<Shield className="h-6 w-6" />}
                            success={tests.tokenStorage}
                            description="localStorage token & user data"
                        />
                        <TestCard
                            title="4. User Validation"
                            icon={<User className="h-6 w-6" />}
                            success={tests.userValidation}
                            description="GET /auth/me endpoint"
                        />
                        <TestCard
                            title="3. Protected Request"
                            icon={<Mail className="h-6 w-6" />}
                            success={tests.protectedRequest}
                            description="Bearer token API calls"
                        />
                        <TestCard
                            title="API Connection"
                            icon={<Database className="h-6 w-6" />}
                            success={tests.apiConnection}
                            description="Backend connectivity"
                        />
                    </div>

                    {/* Current User Info */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">✅ 2. Current User Info</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">User ID</label>
                                <p className="text-sm text-gray-900 font-mono">{user?.id}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <p className="text-sm text-gray-900">{user?.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <p className="text-sm text-gray-900">{user?.name || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <p className="text-sm text-gray-900">{user?.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Test Results */}
                    {testResults && (
                        <div className="space-y-6">
                            {testResults.tokenStorage && (
                                <TestResult
                                    title="✅ 1. Token Storage Test"
                                    success={testResults.tokenStorage.success}
                                    data={testResults.tokenStorage}
                                />
                            )}

                            {testResults.userValidation && (
                                <TestResult
                                    title="✅ 4. User Validation Test"
                                    success={testResults.userValidation.success}
                                    data={testResults.userValidation.data}
                                />
                            )}

                            {testResults.protectedRequest && (
                                <TestResult
                                    title="✅ 3. Protected API Request Test"
                                    success={testResults.protectedRequest.success}
                                    data={{
                                        emailCount: testResults.protectedRequest.emailCount,
                                        sampleEmails: testResults.protectedRequest.data,
                                    }}
                                />
                            )}

                            {testResults.apiConnection && (
                                <TestResult
                                    title="API Connection Test"
                                    success={testResults.apiConnection.success}
                                    data={testResults.apiConnection.stats}
                                />
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={runTests}
                            disabled={isRunning}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isRunning ? 'Running Tests...' : 'Run Tests Again'}
                        </button>

                        <a
                            href="/inbox"
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Go to Inbox
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TestCard({ title, icon, success, description }: {
    title: string;
    icon: React.ReactNode;
    success: boolean;
    description: string;
}) {
    return (
        <div className={`p-4 rounded-lg border-2 ${success
            ? 'border-green-200 bg-green-50'
            : 'border-gray-200 bg-gray-50'
            }`}>
            <div className="flex items-center gap-2 mb-2">
                <div className={`${success ? 'text-green-600' : 'text-gray-400'}`}>
                    {icon}
                </div>
                <h3 className="font-semibold text-sm">{title}</h3>
                {success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                )}
            </div>
            <p className="text-xs text-gray-600">{description}</p>
        </div>
    );
}

function TestResult({ title, success, data }: {
    title: string;
    success: boolean;
    data: any;
}) {
    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">{title}</h3>
            <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
} 