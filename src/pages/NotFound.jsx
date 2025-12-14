import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                        <AlertTriangle size={64} className="text-red-500 dark:text-red-400" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Oops! The page you are looking for doesn't exist or has been moved.
                </p>

                <div className="space-y-3">
                    <Link
                        to="/dashboard"
                        className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Home size={20} className="mr-2" />
                        Back to Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
