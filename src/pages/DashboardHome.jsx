import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const DashboardHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setStats(res.data.data.stats);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading stats...</div>;

    const data = [
        { name: 'Users', count: stats?.users || 0 },
        { name: 'Lessons', count: stats?.lessons || 0 },
        { name: 'Posts', count: stats?.posts || 0 },
        { name: 'Resources', count: stats?.resources || 0 },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {data.map((item) => (
                    <div key={item.name} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">{item.name}</h3>
                        <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{item.count}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 h-96">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Content Overview</h3>
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis allowDecimals={false} stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                                    itemStyle={{ color: '#F9FAFB' }}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart - Admin Only */}
                {user?.role === 'admin' && stats?.userDistribution && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 h-96">
                        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">User Distribution</h3>
                        <div className="w-full h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Students', value: stats.userDistribution.student || 0 },
                                            { name: 'Teachers', value: stats.userDistribution.teacher || 0 },
                                            { name: 'Admins', value: stats.userDistribution.admin || 0 },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#3B82F6" /> {/* Blue for Student */}
                                        <Cell fill="#10B981" /> {/* Green for Teacher */}
                                        <Cell fill="#EF4444" /> {/* Red for Admin */}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                                        itemStyle={{ color: '#F9FAFB' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardHome;
