import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { LayoutDashboard, Users, BookOpen, FileText, CheckSquare, LogOut, Menu, X, Sun, Moon, MessageCircle, Bell } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount, socket, notifications } = useSocket();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!socket) return;

        const handleNewLesson = (data) => {
            if (Notification.permission === 'granted') {
                new Notification(`New Lesson: ${data.title}`, {
                    body: `Instructor ${data.instructor} just posted a new lesson.`,
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(`New Lesson: ${data.title}`, {
                            body: `Instructor ${data.instructor} just posted a new lesson.`,
                        });
                    }
                });
            }
            // Use console log or a less intrusive method than alert to avoid blocking UI on refresh
            // alert(`New Lesson Alert!\n"${data.title}" has been added by ${data.instructor}.`);
        };

        socket.on('newLesson', handleNewLesson);

        return () => {
            socket.off('newLesson', handleNewLesson);
        };
    }, [socket]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/dashboard/users', label: 'Users', icon: Users, role: 'admin' },
        { path: '/dashboard/lessons', label: 'Lessons', icon: BookOpen },
        { path: '/dashboard/quizzes', label: 'Quizzes', icon: CheckSquare },
        { path: '/dashboard/posts', label: 'Blog Posts', icon: FileText },
        { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { path: '/dashboard/profile', label: 'Profile', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Mobile Header with Hamburger */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm md:hidden flex justify-between items-center z-20 fixed top-0 w-full border-b dark:border-gray-700">
                <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">LMS Admin</h1>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-gray-600 hover:text-blue-600 focus:outline-none"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 h-full border-r dark:border-gray-700
                `}
            >
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">LMS Admin</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome, {user?.name}</p>
                    </div>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    {menuItems.map((item) => {
                        if (item.role && user?.role !== item.role) return null;
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)} // Close on click (mobile)
                                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    } justify-between`}
                            >
                                <div className="flex items-center">
                                    <Icon size={20} className="mr-3" />
                                    {item.label}
                                </div>
                                {item.label === 'Notifications' && notifications && notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {notifications.filter(n => !n.isRead).length}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
                    <Link
                        to="/dashboard/chat"
                        className="flex items-center w-full px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors justify-between"
                    >
                        <div className="flex items-center">
                            <MessageCircle size={20} className="mr-3" />
                            Chat
                        </div>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} className="mr-3" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 flex-1 p-4 md:p-8 pt-20 md:pt-8 min-h-screen transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
