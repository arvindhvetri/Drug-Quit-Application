// src/components/user/pages/TaskDashboard.jsx
import React, { useState, useEffect } from 'react';
import '../../../styles/TaskDashboard.css';
import SidebarLayout from '../../layout/SidebarLayout';

function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [photos, setPhotos] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const userId = localStorage.getItem('user_id');

  // Fetch all pending tasks
  const fetchTasks = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/profile/${userId}`);
      const data = await res.json();
      const pendingTasks = (data.tasks || []).filter(t => t.status === 'pending');
      setTasks(pendingTasks);
    } catch (err) {
      setMessage('Failed to load tasks');
    }
  };

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle photo change for a specific task
  const handlePhotoChange = (taskId, file) => {
    setPhotos(prev => ({
      ...prev,
      [taskId]: file
    }));
  };

  // Submit proof for a specific task
  const handleSubmit = async (e, task) => {
    e.preventDefault();
    const photo = photos[task.task_id];
    if (!photo) return;

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('task_id', task.task_id);
    formData.append('photo', photo);

    try {
      const res = await fetch('/api/submit-task', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.reason || 'Verification failed');
      }

      const result = await res.json();
      setMessage(`🎉 ${result.message} +${result.streak} day streak!`);

      // Remove submitted task
      setTasks(prev => prev.filter(t => t.task_id !== task.task_id));
      setPhotos(prev => {
        const updated = { ...prev };
        delete updated[task.task_id];
        return updated;
      });
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Suggest a new task
  const suggestNewTask = async () => {
    try {
      const res = await fetch(`/api/suggest-task?user_id=${userId}`);
      if (!res.ok) throw new Error('Failed to suggest task');
      const newTask = await res.json();

      setTasks(prev => [
        ...prev,
        {
          title: newTask.task,
          difficulty: newTask.difficulty,
          category: newTask.category || ['general'],
          badge: newTask.badge_awarded || 'Default Step I',
          task_id: newTask.task_id,
          status: 'pending',
          assigned_at: new Date().toISOString()
        }
      ]);
      setMessage("New task added!");
    } catch (err) {
      setMessage("Could not suggest new task");
    }
  };

  return (
    <SidebarLayout>
      <div className="task-dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <h1>🎯 Daily Recovery Tasks</h1>
          <p>Complete small actions to build strength and earn badges.</p>
        </header>

        {/* Action Button */}
        <button onClick={suggestNewTask} className="btn btn-primary">
          + Suggest New Task
        </button>

        {/* Message Alert */}
        {message && (
          <div className={`alert ${message.includes('🎉') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Task List */}
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No pending tasks. Click above to get started!</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map(task => {
              const photo = photos[task.task_id];
              return (
                <div key={task.task_id} className="task-card">
                  <h3>{task.title}</h3>
                  <p><strong>Difficulty:</strong> {task.difficulty}</p>
                  <p><strong>Assigned:</strong> {new Date(task.assigned_at).toLocaleDateString()}</p>

                  {/* Badge */}
                  <div className="task-badge">
                    <strong>Badge Reward:</strong>
                    <span className="badge-name">{task.badge}</span>
                  </div>

                  {/* Submit Form */}
                  <form onSubmit={(e) => handleSubmit(e, task)} className="task-form">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(task.task_id, e.target.files[0])}
                      disabled={loading}
                    />
                    {photo && <p className="photo-selected">✅ Selected: {photo.name}</p>}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Proof'}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

export default TaskDashboard;