import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardHome from './pages/DashboardHome';
import UserList from './pages/UserList';
import UserCreate from './pages/UserCreate';
import UserForm from './pages/UserForm';
import Chat from './pages/Chat';
import PostList from './pages/posts/PostList';
import PostForm from './pages/posts/PostForm';
import LessonList from './pages/lessons/LessonList';
import LessonForm from './pages/lessons/LessonForm';
import LessonDetails from './pages/lessons/LessonDetails';
import QuizList from './pages/quizzes/QuizList';
import QuizForm from './pages/quizzes/QuizForm';
import Profile from './pages/Profile';
import Register from './pages/Register';
import NotificationList from './pages/NotificationList';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']} />}>
              <Route path="/dashboard" element={<Layout />}>
                <Route index element={<DashboardHome />} />

                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="users" element={<UserList />} />
                  <Route path="users/new" element={<UserCreate />} />
                  <Route path="users/:id/edit" element={<UserForm />} />
                </Route>

                <Route path="chat" element={<Chat />} />

                {/* Content Routes */}
                <Route path="lessons" element={<LessonList />} />
                <Route path="lessons/new" element={<LessonForm />} />
                <Route path="lessons/:id" element={<LessonDetails />} />

                <Route path="posts" element={<PostList />} />
                <Route path="posts/new" element={<PostForm />} />

                <Route path="quizzes" element={<QuizList />} />
                <Route path="quizzes/new" element={<QuizForm />} />

                <Route path="notifications" element={<NotificationList />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
