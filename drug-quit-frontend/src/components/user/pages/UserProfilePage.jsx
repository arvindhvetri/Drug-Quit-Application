// src/components/user/pages/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import '../../../styles/UserProfilePage.css';
import SidebarLayout from '../../layout/SidebarLayout';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('user_id');

  // Sobriety verification
  const [selfie, setSelfie] = useState(null);
  const [sobrietyLoading, setSobrietyLoading] = useState(false);
  const [sobrietyError, setSobrietyError] = useState('');
  const [sobrietyResult, setSobrietyResult] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('User not logged in.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${userId}`);
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Sort mood history by timestamp
  const sortedMoodHistory = user?.mood_history
    ? [...user.mood_history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    : [];

  // Prepare Polarity Trend Chart (Line)
  const getPolarityChartData = () => {
    if (sortedMoodHistory.length === 0) return null;

    const labels = sortedMoodHistory.map(entry => new Date(entry.timestamp).toLocaleDateString());
    const polarities = sortedMoodHistory.map(entry => entry.sentiment?.polarity || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Sentiment Polarity (-1 to +1)',
          data: polarities,
          borderColor: '#FF5722',
          backgroundColor: 'rgba(255, 87, 34, 0.1)',
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  };

  const polarityOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw;
            const mood = sortedMoodHistory[context.dataIndex]?.mood || 'neutral';
            return `Mood: ${mood} (Polarity: ${val.toFixed(2)})`;
          },
        },
      },
    },
    scales: {
      y: {
        min: -1,
        max: 1,
        ticks: {
          stepSize: 0.5,
        },
      },
    },
  };

  // Prepare Emotion Frequency Chart (Bar)
  const getEmotionChartData = () => {
    if (sortedMoodHistory.length === 0) return null;

    const emotionCount = {};
    sortedMoodHistory.forEach(entry => {
      const emotion = entry.emotion || 'unknown';
      emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
    });

    const emotions = Object.keys(emotionCount);
    const counts = Object.values(emotionCount);

    return {
      labels: emotions,
      datasets: [
        {
          label: 'Emotion Frequency',
          data: counts,
          backgroundColor: 'rgba(103, 58, 183, 0.6)',
          borderColor: 'rgba(103, 58, 183, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const emotionOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Frequency',
        },
      },
    },
  };

  // Handle sobriety check submission
  const handleSobrietySubmit = async (e) => {
    e.preventDefault();
    if (!selfie) return;

    setSobrietyLoading(true);
    setSobrietyError('');
    setSobrietyResult(null);

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('selfie', selfie);

    try {
      const res = await fetch('http://localhost:5000/api/sobriety-check', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 429) {
          setSobrietyError(`You can verify again in ${data.available_in_hours} hours.`);
        } else {
          setSobrietyError(data.error || 'Verification failed');
        }
        return;
      }

      const data = await res.json();
      setSobrietyResult(data);
      setUser(prev => ({
        ...prev,
        sobriety_results: [data, ...(prev.sobriety_results || [])],
        last_sobriety_check: data.timestamp
      }));
    } catch (err) {
      setSobrietyError('Network error. Please try again.');
    } finally {
      setSobrietyLoading(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="profile-container">
          <p>Loading your profile...</p>
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="profile-container">
          <div className="alert alert-error">❌ {error}</div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="profile-container">
        {/* Header with Name */}
        <header className="profile-header">
          <h1>
            👤 Hello, {user?.username || 'User'}!
          </h1>
          <p>Track your journey, emotions, and achievements.</p>
        </header>

        {/* Streak & Sobriety */}
        <div className="profile-stats">
          <div className="stat-card">
            <h3>🔥 Current Streak</h3>
            <p className="stat-value">{user?.streak || 0} days</p>
          </div>
          <div className="stat-card">
            <h3>🚭 Sobriety Status</h3>
            <p className={`stat-value ${user?.sobriety_results?.[0]?.is_sober ? 'sober' : 'not-sober'}`}>
              {user?.sobriety_results?.[0]?.is_sober ? '✅ Sober' : '❌ Not Sober'}
            </p>
            {user?.last_sobriety_check && (
              <small>Last verified: {new Date(user.last_sobriety_check).toLocaleDateString()}</small>
            )}
          </div>
        </div>

        {/* Sobriety Verification Section */}
        <section className="sobriety-verification">
          <h2>📷 Verify Sobriety with Selfie</h2>
          <p>Upload a clear selfie to confirm your sobriety. Available once per day.</p>

          <form onSubmit={handleSobrietySubmit} className="sobriety-form">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelfie(e.target.files[0])}
              disabled={sobrietyLoading}
            />
            {selfie && <p className="file-selected">✅ Selected: {selfie.name}</p>}

            <button type="submit" disabled={sobrietyLoading} className="btn btn-primary">
              {sobrietyLoading ? 'Analyzing...' : 'Verify Now'}
            </button>
          </form>

          {sobrietyError && (
            <div className="alert alert-error">⚠️ {sobrietyError}</div>
          )}

          {sobrietyResult && (
            <div className={`alert ${sobrietyResult.is_sober ? 'success' : 'error'}`}>
              <h3>{sobrietyResult.is_sober ? '✅ Verified Sober!' : '⚠️ Signs of Impairment Detected'}</h3>
              {sobrietyResult.flags.length > 0 && (
                <ul>
                  {sobrietyResult.flags.map((flag, i) => (
                    <li key={i}>{flag.replace('_', ' ')}</li>
                  ))}
                </ul>
              )}
              <small>Checked at: {new Date(sobrietyResult.timestamp).toLocaleString()}</small>
            </div>
          )}
        </section>

        {/* Mood Charts Section */}
        <section className="mood-chart-section">
          <h2>📈 Sentiment & Emotion Analytics</h2>

          {/* Polarity Trend Line Chart */}
          <div className="chart-wrapper">
            <h3>📉 Sentiment Polarity Over Time</h3>
            {getPolarityChartData() ? (
              <Line data={getPolarityChartData()} options={polarityOptions} />
            ) : (
              <p className="no-data">No sentiment data yet.</p>
            )}
          </div>

          {/* Emotion Frequency Bar Chart */}
          <div className="chart-wrapper">
            <h3>🎭 Emotion Frequency</h3>
            {getEmotionChartData() ? (
              <Bar data={getEmotionChartData()} options={emotionOptions} />
            ) : (
              <p className="no-data">No emotion data yet.</p>
            )}
          </div>
        </section>

        {/* Badges */}
        <section className="badges-section">
          <h2>🏅 Badges Earned</h2>
          {user?.badges && user.badges.length > 0 ? (
            <div className="badges-grid">
              {user.badges.map((badge, index) => (
                <div key={index} className="badge-card">
                  <div className="badge-icon">🎖️</div>
                  <h4>{badge.badge || 'Achievement'}</h4>
                  <small>{badge.earned_at}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No badges yet. Keep going!</p>
          )}
        </section>

        {/* Flags / AI Insights */}
        <section className="insights-section">
          <h2>🔍 AI Insights & Flags</h2>
          {user?.flags && user.flags.length > 0 ? (
            <ul className="insights-list">
              {user.flags.map((flag, index) => (
                <li key={index} className="insight-item">
                  ⚠️ <strong>{flag.type}:</strong> {flag.description || 'No details'}
                  <br />
                  <small>{new Date(flag.timestamp).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No recent flags. Great progress!</p>
          )}
        </section>
      </div>
    </SidebarLayout>
  );
}

export default UserProfilePage;