import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import '../../styles/Portal.css';

function UserPortal() {
  return (
    <div className="portal-wrapper">
      <aside className="sidebar">
        <nav>
          <ul>
            <li><Link to="/user/blogs">Blogs</Link></li>
            <li><Link to="/user/page2">Page 2</Link></li>
            <li><Link to="/user/page3">Page 3</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="content">
        <header className="portal-header">
          <h2>User Dashboard</h2>
        </header>
        <div className="portal-content-area">
          <Outlet /> {/* Renders the nested routes like BlogPage, Page2, etc. */}
        </div>
      </main>
    </div>
  );
}

export default UserPortal;