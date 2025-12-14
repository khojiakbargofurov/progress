import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Edit, Trash, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const PostList = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data.data.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this post?')) {
            try {
                await api.delete(`/posts/${id}`);
                setPosts(posts.filter(p => p._id !== id));
                setError(null);
            } catch {
                setError('Failed to delete post');
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Blog Posts</h2>
                {user?.role !== 'student' && (
                    <Link
                        to="/dashboard/posts/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
                    >
                        <Plus size={20} className="mr-2" />
                        Create Post
                    </Link>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {posts.map((post) => (
                        <li key={post._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 transition-colors">
                            <div className="flex items-start w-full sm:w-auto">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <FileText size={20} />
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-1">{post.title}</h3>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-2">
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs uppercase">{post.category}</span>
                                        <span>By {post.author?.name || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end w-full sm:w-auto space-x-2 border-t sm:border-t-0 pt-4 sm:pt-0">
                                <button className="text-gray-400 hover:text-blue-600 p-2 sm:p-0">
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(post._id)}
                                    className="text-gray-400 hover:text-red-600 p-2 sm:p-0"
                                >
                                    <Trash size={20} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PostList;
