import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (user) {
                try {
                    // We need to import api here or assume it's available. 
                    // Since this is a context file, better to pass api or import it.
                    // Let's rely on the socket event for *new* ones, but for initial count we need API.
                    // I'll dynamically import or just use api from services.
                    const api = (await import('../services/api')).default;
                    const res = await api.get('/notifications');
                    setNotifications(res.data.data.notifications || []);
                } catch (err) {
                    console.error("Failed to fetch initial notifications", err);
                }
            }
        };
        fetchInitialData();

        let newSocket;

        if (user) {
            newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
            setSocket(newSocket);

            newSocket.emit('join', user._id);

            newSocket.on('receiveMessage', () => {
                setUnreadCount((prev) => prev + 1);
            });

            newSocket.on('newLesson', (data) => {
                // Add to notification list locally + show alert
                setNotifications(prev => [{
                    _id: Date.now(), // temp id
                    type: 'global',
                    message: `New lesson: "${data.title}" by ${data.instructor}`,
                    link: `/dashboard/lessons/${data.id}`,
                    createdAt: new Date().toISOString(),
                    readBy: [], // explicitly unread
                    isRead: false
                }, ...prev]);
            });

            newSocket.on('onlineUsers', (users) => {
                setOnlineUsers(users);
            });

            return () => {
                newSocket.close();
                setSocket(null);
            };
        }
    }, [user]);

    const resetUnreadCount = () => {
        setUnreadCount(0);
    };

    const markNotificationsRead = () => {
        // This might be intended to clear all notifications or mark all as read?
        // For now, let's just assume it clears the local array or fetches fresh? 
        // Actually, if we rely on derived state for the badge, we need to update the items.
        // Let's leave it empty or doing nothing if we don't have a "mark ALL read" button yet,
        // OR implement it to update the state to isRead=true for all.
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    return (
        <SocketContext.Provider value={{ socket, unreadCount, onlineUsers, notifications, resetUnreadCount, markNotificationsRead, setNotifications }}>
            {children}
        </SocketContext.Provider>
    );
};
