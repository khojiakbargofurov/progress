import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Edit, Trash, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

import ConfirmationModal from '../../components/ConfirmationModal';

const LessonList = () => {
    const { user } = useAuth();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState(null);

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const res = await api.get('/lessons');
            setLessons(res.data.data.lessons);
        } catch (err) {
            setError(err.message || 'Error'); // Updated to use setError
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (id) => {
        setLessonToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!lessonToDelete) return;
        try {
            await api.delete(`/lessons/${lessonToDelete}`);
            setLessons(lessons.filter(l => l._id !== lessonToDelete));
            setDeleteModalOpen(false);
            setLessonToDelete(null);
        } catch {
            setError('Failed to delete lesson');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>; // Display error

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Video Lessons</h2>
                {user?.role !== 'student' && (
                    <Link
                        to="/dashboard/lessons/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
                    >
                        <Plus size={20} className="mr-2" />
                        Add Lesson
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson) => (
                    <div key={lesson._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-black rounded-md mb-4 overflow-hidden relative group cursor-pointer">
                            <Link to={`/dashboard/lessons/${lesson._id}`} className="block w-full h-full">
                                {lesson.videoUrl && (lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be')) ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={`https://img.youtube.com/vi/${lesson.videoUrl.split('v=')[1]?.split('&')[0] || lesson.videoUrl.split('youtu.be/')[1]}/hqdefault.jpg`}
                                            alt={lesson.title}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full group-hover:scale-110 transition-transform">
                                                <Video size={32} className="text-white fill-white" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-600 bg-gray-200 dark:bg-gray-700">
                                        <Video size={48} />
                                    </div>
                                )}
                            </Link>
                        </div>
                        <h3 className="font-bold text-lg mb-2 truncate text-gray-900 dark:text-white">{lesson.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{lesson.description}</p>

                        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
                            <span>{lesson.duration} min</span>
                            {/* Admin/Teacher Actions */}
                            {user?.role !== 'student' && (
                                <div className="space-x-2">
                                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 p-1">
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(lesson._id)}
                                        className="text-red-600 dark:text-red-400 hover:text-red-800 p-1"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Lesson"
                message="Are you sure you want to delete this lesson? This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
            />
        </div>
    );
};

export default LessonList;
