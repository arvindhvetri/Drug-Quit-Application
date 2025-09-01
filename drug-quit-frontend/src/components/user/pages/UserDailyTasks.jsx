// src/components/user/pages/UserUserDailyTasks.jsx
import React, { useState } from 'react';
import SidebarLayout from '../../layout/SidebarLayout';
import '@styles/UserDailyTasks.css'; // Optional: custom styles

function UserDailyTasks() {
  const [inputText, setInputText] = useState('');
  const [detectedIssues, setDetectedIssues] = useState([]);
  const [task, setTask] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Simulate issue detection (in real app, use NLP or backend)
  const detectIssues = (text) => {
    const lower = text.toLowerCase();
    const issues = [];
    if (lower.includes('smoke') || lower.includes('drink') || lower.includes('craving')) issues.push('substance');
    if (lower.includes('angry') || lower.includes('mad') || lower.includes('frustrated')) issues.push('angry');
    if (lower.includes('anxious') || lower.includes('nervous') || lower.includes('panic')) issues.push('anxious');
    if (lower.includes('stress') || lower.includes('overwhelm')) issues.push('stress');
    if (lower.includes('sad') || lower.includes('depressed') || lower.includes('cry')) issues.push('sad');
    return issues.length ? issues : ['default'];
  };

  // Step 1: Get Task
  const handleGetTask = async () => {
    if (!inputText.trim()) {
      setError('Please describe how you’re feeling.');
      return;
    }

    setError('');
    setLoading(true);
    setVerification(null);

    const issues = detectIssues(inputText);
    setDetectedIssues(issues);

    try {
      const res = await fetch('/api/tasks/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issues, text: inputText })
      });

      if (res.ok) {
        const data = await res.json();
        setTask(data);
      } else {
        throw new Error('Failed to get task');
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Photo Upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhoto(file);
    setVerification(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const uploadRes = await fetch('/api/tasks/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();

      // Step 3: Verify Task
      const verifyRes = await fetch('/api/tasks/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_text: task.title,
          photo_path: uploadData.photo_path
        })
      });

      const verifyData = await verifyRes.json();
      setVerification(verifyData);
    } catch (err) {
      setError('Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="UserDailyTasks-container">
        <header className="UserDailyTasks-header">
          <h1>Need Support Right Now?</h1>
          <p>Share how you’re feeling, and get a small, healing task.</p>
        </header>

        {/* Input Section */}
        <div className="input-section">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="How are you feeling right now? (e.g., 'I’m craving a drink' or 'I feel so anxious')"
            rows="4"
          />
          <button onClick={handleGetTask} disabled={loading} className="btn-primary">
            {loading ? 'Loading...' : 'Get My Task'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </div>

        {/* Detected Issues */}
        {detectedIssues.length > 0 && (
          <div className="detected-issues">
            <strong>Triggers detected:</strong> {detectedIssues.join(', ')}
          </div>
        )}

        {/* Task Display */}
        {task && (
          <div className="task-card">
            <h3>🎯 Your Task</h3>
            <p>{task.title}</p>
            <p><em>Difficulty: {task.difficulty} | Badge: {task.badge}</em></p>

            {/* Photo Upload */}
            <div className="photo-upload">
              <label htmlFor="photo-upload" className="btn-secondary">
                📸 Take or Upload Photo
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                capture="environment" // Opens camera on mobile
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Uploaded Photo Preview */}
            {verification?.url && (
              <div className="photo-preview">
                <img src={verification.url} alt="Your submission" />
              </div>
            )}
          </div>
        )}

        {/* Verification Result */}
        {verification && (
          <div className={`verification-result ${verification.verified ? 'success' : 'fail'}`}>
            {verification.verified ? (
              <>
                <h3>✅ Verified! Great job!</h3>
                <p>You’ve taken a powerful step. Keep going — you’re stronger than you know.</p>
              </>
            ) : (
              <>
                <h3>❌ Not Verified</h3>
                <p>{verification.reason || "Try again with a clearer photo of the task."}</p>
              </>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

export default UserDailyTasks;