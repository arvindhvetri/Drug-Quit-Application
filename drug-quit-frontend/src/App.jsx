import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

import UserPortal from "./components/user/UserPortal";
import BlogPage from "./components/user/pages/BlogPage";
import UserDailyTasks from "./components/user/pages/UserDailyTasks";
import ChatInterface from "./components/user/pages/ChatInterface";
import MoodInputPage from './components/user/pages/MoodInputPage';
import TaskDashboard from "./components/user/pages/TaskDashboard";
import UserProfilePage from './components/user/pages/UserProfilePage';

import AdminPortal from "./components/admin/AdminPortal";
import BlogManagement from "./components/admin/pages/BlogManagement";
import AdminPage2 from "./components/admin/pages/Page2";
import AdminPage3 from "./components/admin/pages/Page3";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* User Portal */}
        <Route path="/user/*" element={<UserPortal />}>
          <Route path="blogs" element={<BlogPage />} />
          <Route path="UserDailyTasks" element={<UserDailyTasks />} />
          <Route path="chat" element={<ChatInterface />} />
          <Route path="mood" element={<MoodInputPage />} />
          <Route path="tasks" element={<TaskDashboard />} />
          <Route path="profile" element={<UserProfilePage />} />
        </Route>

        {/* Admin Portal */}
        <Route path="/admin/*" element={<AdminPortal />}>
          <Route path="blogs" element={<BlogManagement />} />
          <Route path="page2" element={<AdminPage2 />} />
          <Route path="page3" element={<AdminPage3 />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
