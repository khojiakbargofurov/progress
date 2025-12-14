import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';

const QuizForm = () => {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        lesson: '',
        questions: [
            {
                question: '',
                options: ['', '', '', ''],
                correctOption: 0
            }
        ]
    });

    useEffect(() => {
        // Fetch lessons to populate dropdown
        api.get('/lessons').then(res => setLessons(res.data.data.lessons)).catch(console.error);
    }, []);

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index][field] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [
                ...formData.questions,
                { question: '', options: ['', '', '', ''], correctOption: 0 }
            ]
        });
    };

    const removeQuestion = (index) => {
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/quizzes', formData);
            navigate('/dashboard/quizzes');
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating quiz');
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Create New Quiz</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 font-semibold"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attached to Lesson (Optional)</label>
                    <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.lesson}
                        onChange={e => setFormData({ ...formData, lesson: e.target.value })}
                    >
                        <option value="">-- No Lesson --</option>
                        {lessons.map(l => (
                            <option key={l._id} value={l._id}>{l.title}</option>
                        ))}
                    </select>
                </div>

                <div className="border-t pt-6">
                    <h3 className="text-lg font-bold mb-4">Questions</h3>
                    <div className="space-y-6">
                        {formData.questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-gray-50 p-4 rounded-lg relative">
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(qIndex)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                >
                                    <X size={20} />
                                </button>
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Question {qIndex + 1}</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter question here..."
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={q.question}
                                        onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    {q.options.map((opt, oIndex) => (
                                        <input
                                            key={oIndex}
                                            type="text"
                                            required
                                            placeholder={`Option ${oIndex + 1}`}
                                            className={`w-full px-3 py-2 border rounded-md ${q.correctOption === oIndex ? 'border-green-500 ring-1 ring-green-500' : ''}`}
                                            value={opt}
                                            onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                                        />
                                    ))}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mr-2">Correct Option (0-3):</label>
                                    <select
                                        className="px-2 py-1 border rounded"
                                        value={q.correctOption}
                                        onChange={e => handleQuestionChange(qIndex, 'correctOption', Number(e.target.value))}
                                    >
                                        <option value={0}>Option 1</option>
                                        <option value={1}>Option 2</option>
                                        <option value={2}>Option 3</option>
                                        <option value={3}>Option 4</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="mt-4 flex items-center text-blue-600 font-medium hover:underline"
                    >
                        <Plus size={20} className="mr-1" />
                        Add Question
                    </button>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/quizzes')}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Save Quiz
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuizForm;
