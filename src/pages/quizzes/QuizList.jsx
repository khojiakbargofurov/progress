import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Trash, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuizList = () => {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const res = await api.get('/quizzes');
            setQuizzes(res.data.data.quizzes);
        } catch (err) {
            setError(err.message || 'Failed to fetch quizzes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this quiz?')) {
            try {
                await api.delete(`/quizzes/${id}`);
                setQuizzes(quizzes.filter(q => q._id !== id));
            } catch {
                setError('Failed to delete quiz');
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Quizzes</h2>
                {user?.role !== 'student' && (
                    <Link
                        to="/dashboard/quizzes/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
                    >
                        <Plus size={20} className="mr-2" />
                        Create Quiz
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                    <div key={quiz._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                                <CheckSquare size={24} />
                            </div>
                            <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                {quiz.questions?.length || 0} Questions
                            </span>
                        </div>

                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{quiz.title}</h3>
                        {quiz.lesson && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Linked to a lesson</p>
                        )}

                        <div className="flex justify-end border-t dark:border-gray-700 pt-4">
                            <button
                                onClick={() => handleDelete(quiz._id)}
                                className="text-gray-400 hover:text-red-600 p-1"
                            >
                                <Trash size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuizList;
