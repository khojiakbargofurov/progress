import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, User, MessageCircle } from 'lucide-react';

const Chat = () => {
    const { user } = useAuth();
    const { socket, resetUnreadCount } = useSocket(); // Use global socket
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Reset unread count when entering chat
    useEffect(() => {
        resetUnreadCount();
        return () => resetUnreadCount();
    }, []);

    // Socket Listeners - use global socket
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            if (selectedUser && (message.sender === selectedUser._id || message.receiver === selectedUser._id)) {
                setMessages((prev) => [...prev, message]);
            }
        };

        const handleMessageSent = (message) => {
            if (selectedUser && (message.receiver === selectedUser._id || message.sender === selectedUser._id)) {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('messageSent', handleMessageSent);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('messageSent', handleMessageSent);
        };
    }, [socket, selectedUser]);

    // Fetch Users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/chats/users');
                setUsers(res.data.data.users);
            } catch (err) {
                console.error('Failed to fetch users', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Fetch Messages when User Selected
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedUser) return;
            try {
                const res = await api.get(`/chats/${selectedUser._id}`);
                setMessages(res.data.data.messages);
            } catch (err) {
                console.error('Failed to fetch messages', err);
            }
        };
        fetchMessages();
    }, [selectedUser]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser || !socket) return;

        const messageData = {
            sender: user._id,
            receiver: selectedUser._id,
            message: newMessage
        };

        socket.emit('sendMessage', messageData);
        setNewMessage('');
        // Optimistically add message? No, wait for 'messageSent' or 'receiveMessage' for definitive state, 
        // or add locally. 'messageSent' listener handles this above.
    };

    if (loading) return <div>Loading chat...</div>;

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border dark:border-gray-700">
            {/* Sidebar */}
            <div className="w-1/3 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
                <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold dark:text-white flex items-center">
                        <MessageCircle className="mr-2" size={20} /> Chats
                    </h2>
                </div>
                <ul>
                    {users.map((u) => (
                        <li
                            key={u._id}
                            onClick={() => setSelectedUser(u)}
                            className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center ${selectedUser?._id === u._id ? 'bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500' : ''
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3 overflow-hidden">
                                {u.avatar ? (
                                    <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-gray-600 dark:text-gray-300" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Chat Window */}
            <div className="w-2/3 flex flex-col bg-white dark:bg-gray-800">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b dark:border-gray-700 flex items-center bg-gray-50 dark:bg-gray-900">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedUser.name}</h3>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map((msg, index) => {
                                const isMe = msg.sender === user._id;
                                return (
                                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${isMe
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                                                }`}
                                        >
                                            <p className="text-sm">{msg.message}</p>
                                            <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 p-2 border dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <MessageCircle size={64} className="mb-4 opacity-50" />
                        <p className="text-lg">Select a user to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
