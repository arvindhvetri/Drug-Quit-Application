// src/components/user/pages/MoodInputPage.jsx
import React, { useState } from 'react';
import '../../../styles/MoodInputPage.css';
import SidebarLayout from '../../layout/SidebarLayout';

function MoodInputPage() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    const formData = new FormData();
    formData.append('user_id', localStorage.getItem('user_id'));
    formData.append('text', text);
    if (file) {
      formData.append('voice', file);
    }

    try {
      const res = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to analyze input');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to analyze input');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="mood-input-container">
        {/* Header */}
        <header className="mood-header">
          <h1>🌤️ How Are You Feeling Today?</h1>
          <p>Share your thoughts with text or a voice note — we’re here to help.</p>
        </header>

        {/* Error Banner */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Success Result */}
        {result && (
          <div className="alert alert-success">
            <h3>
              Your Mood: <strong>{result.mood}</strong>
            </h3>
            <p><strong>Emotion:</strong> {result.emotion}</p>
            {result.detected_issues && Object.keys(result.detected_issues).length > 0 && (
              <p><strong>Issues Detected:</strong> {Object.keys(result.detected_issues).join(', ')}</p>
            )}
            <small>Analysis saved at {new Date(result.timestamp).toLocaleTimeString()}</small>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mood-form">
          <div className="form-group">
            <label htmlFor="text">Write Freely</label>
            <textarea
              id="text"
              placeholder="I’ve been feeling anxious lately…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>🎙️ Upload Voice Note (MP3)</label>
            <input
              type="file"
              accept="audio/mp3,audio/mpeg"
              onChange={handleFileChange}
              disabled={loading}
            />
            {file && <p className="file-selected">✅ Selected: {file.name}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Analyzing...' : 'Submit & Get Analysis'}
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
}

export default MoodInputPage;