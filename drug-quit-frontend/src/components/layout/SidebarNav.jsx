// src/components/layout/SidebarNav.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './SidebarNav.css';

function SidebarNav() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  // Detect if current route is admin
  useEffect(() => {
    setIsAdmin(location.pathname.startsWith('/admin'));
  }, [location]);

  // Dynamic base path
  const basePath = isAdmin ? '/admin' : '/user';

  return (
    <div className="sidebar-nav">
      <div className="sidebar-header">
        <h2>Quit Hub</h2>
      </div>

      <nav className="sidebar-menu">
        <Link to={`${basePath}/blogs`} className="sidebar-link" end>
          📰 Blogs
        </Link>
        <Link to={`${basePath}/page2`} className="sidebar-link">
          🎯 Page 2
        </Link>
        <Link to={`${basePath}/page3`} className="sidebar-link">
          💬 Page 3
        </Link>
        <Link to="/profile" className="sidebar-link">
          👤 Profile
        </Link>
      </nav>

      <div className="sidebar-footer">
        <Link to="/login" className="btn btn-primary">Logout</Link>
      </div>
    </div>
  );
}

export default SidebarNav;