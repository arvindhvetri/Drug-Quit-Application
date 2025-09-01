import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import '../../styles/Portal.css';

function AdminPortal() {
  return (
    <div className="portal-wrapper">
      <aside className="sidebar">
        <nav>
          <ul>
            <li><Link to="/admin/blogs">Blog Management</Link></li>
            <li><Link to="/admin/page2">Page 2</Link></li>
            <li><Link to="/admin/page3">Page 3</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="content">
        <header className="portal-header">
          <h2>Admin Dashboard</h2>
        </header>
        <div className="portal-content-area">
          <Outlet /> {/* Renders the nested routes for admin */}
        </div>
      </main>
    </div>
  );
}

export default AdminPortal;