// src/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/Auth.css";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/login", {
        identifier,
        password,
      });

      // ✅ Extract username and role from response
      const { username, role } = res.data;

      // ✅ Save to localStorage
      localStorage.setItem("username", username);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);

      // ✅ Navigate based on role
      if (role === "admin") {
        navigate("/admin/blogs");
      } else {
        navigate("/user/blogs");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      {/* Left Side: Branding */}
      <div className="auth-left">
        <div className="project-info">
          <h1>Welcome Back</h1>
          <p>Log in to continue sharing your stories and ideas.</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="auth-right">
        <form className="auth-form" onSubmit={handleLogin}>
          <h2>Login</h2>
          {error && <div className="error-toast">{error}</div>}

          <div className="form-group">
            <label htmlFor="identifier">Username or Email</label>
            <input
              id="identifier"
              type="text"
              placeholder="Enter username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <button type="submit" className="btn-auth">
            Login
          </button>

          <p className="auth-link">
            Don’t have an account? <a href="/signup">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;