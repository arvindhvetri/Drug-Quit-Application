// src/auth/Signup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/signup', {
        email,
        username,
        password,
        token,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-container">
      {/* Left Side: Branding */}
      <div className="auth-left">
        <div className="project-info">
          <h1>Join BlogMaster</h1>
          <p>Create your account and start blogging in seconds.</p>
          {/*<img
            src="https://source.unsplash.com/random/600x400/?signup,people"
            alt="Sign Up"
            className="welcome-image"
          />*/}
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="auth-right">
        <form className="auth-form" onSubmit={handleSignup}>
          <h2>Sign Up</h2>
          {error && <div className="error-toast">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="token">Admin Token (optional)</label>
            <input
              id="token"
              type="text"
              placeholder="Leave blank for user"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-auth">
            Sign Up
          </button>

          <p className="auth-link">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;