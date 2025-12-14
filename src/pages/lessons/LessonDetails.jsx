import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Clock, Calendar, User, Tag, Play, Heart, MessageSquare, Send, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LessonDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lesson, setLesson] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lessonRes, commentsRes] = await Promise.all([
                    api.get(`/lessons/${id}`),
                    api.get(`/lessons/${id}/comments`)
                ]);

                const lessonData = lessonRes.data.data.lesson;
                setLesson(lessonData);
                setLikeCount(lessonData.likes ? lessonData.likes.length : 0);
                if (user && lessonData.likes) {
                    setIsLiked(lessonData.likes.includes(user._id));
                }

                setComments(commentsRes.data.data.comments);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load lesson');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button onClick={() => navigate('/dashboard/lessons')} className="mt-2 text-sm underline">
                Back to Lessons
            </button>
        </div>
    );

    if (!lesson) return <div>Lesson not found</div>;

    const handleLike = async () => {
        try {
            const res = await api.patch(`/lessons/${id}/like`);
            setLikeCount(res.data.data.likes);
            setIsLiked(res.data.data.isLiked);
        } catch (err) {
            console.error('Failed to toggle like', err);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await api.post(`/lessons/${id}/comments`, { text: newComment });
            // Optimistically add comment or re-fetch. Let's add it manually since we populate user in backend but simpler here if we trust return
            // The backend createComment returns the comment but population might be missing name if not handled. 
            // Ideally we should modify backend createComment to populate user. For now let's assume specific fields.
            // Or simpler: push new comment with current user data
            const savedComment = res.data.data.comment;
            savedComment.user = { _id: user._id, name: user.name, photo: user.photo, role: user.role };

            setComments([savedComment, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error('Failed to post comment', err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await api.delete(`/lessons/${id}/comments/${commentId}`);
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            console.error('Failed to delete comment', err);
        }
    };

    const renderVideo = () => {
        if (!lesson.videoUrl) return null;

        if (lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be')) {
            const embedUrl = lesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
            return (
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg mb-6">
                    <iframe
                        src={embedUrl}
                        title={lesson.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            );
        }

        return (
            <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 text-center">
                <a
                    href={lesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                    <Play size={20} className="mr-2" />
                    Watch Video Externally
                </a>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/dashboard/lessons')}
                className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Lessons
            </button>

            {renderVideo()}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-8">
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium uppercase text-xs">
                        {lesson.category}
                    </span>
                    <span className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        {lesson.duration} min
                    </span>
                    <span className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        {new Date(lesson.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    {lesson.title}
                </h1>

                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-8">
                    {lesson.description || 'No description available for this lesson.'}
                </div>

                <div className="flex items-center justify-between mb-8 border-b dark:border-gray-700 pb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isLiked
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                            <span className="font-medium">{likeCount}</span>
                        </button>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <MessageSquare size={20} />
                            <span>{comments.length} Comments</span>
                        </div>
                    </div>
                </div>

                {lesson.instructor && (
                    <div className="flex items-center py-6 border-b dark:border-gray-700 mb-8">
                        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xl mr-4">
                            {lesson.instructor.name ? lesson.instructor.name.charAt(0).toUpperCase() : <User size={24} />}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Instructor</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{lesson.instructor.name || 'Unknown'}</p>
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Comments</h3>

                    <form onSubmit={handleCommentSubmit} className="mb-8">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="3"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-fit flex items-center"
                            >
                                <Send size={18} className="mr-2" />
                                Post
                            </button>
                        </div>
                    </form>

                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment._id} className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center">
                                    {comment.user?.photo ? (
                                        <img src={comment.user.photo} alt={comment.user.name} className="h-10 w-10 rounded-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-gray-500 dark:text-gray-300">
                                            {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <span className="font-semibold text-gray-900 dark:text-white mr-2">
                                                    {comment.user?.name || 'Unknown User'}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {(user?._id === comment.user?._id || user?.role === 'admin' || user?.role === 'teacher') && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                            {comment.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {comments.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                No comments yet. Be the first to share your thoughts!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonDetails;
