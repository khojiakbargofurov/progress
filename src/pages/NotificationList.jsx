import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Bell, Check, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.data.notifications);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Bell className="mr-3" />
                Notifications
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No notifications yet.
                    </div>
                ) : (
                    <div className="divide-y dark:divide-gray-700">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex gap-4 ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                    }`}
                            >
                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-blue-600' : 'bg-transparent'
                                    }`} />

                                <div className="flex-1">
                                    <p className="text-gray-900 dark:text-white font-medium mb-1">
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-4">
                                        <span className="flex items-center">
                                            <Clock size={14} className="mr-1" />
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </span>
                                        {notification.type === 'global' && (
                                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                                                Global
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {notification.link && (
                                        <Link
                                            to={notification.link}
                                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full"
                                            title="View Link"
                                        >
                                            <ExternalLink size={18} />
                                        </Link>
                                    )}
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification._id)}
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full"
                                            title="Mark as Read"
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationList;
