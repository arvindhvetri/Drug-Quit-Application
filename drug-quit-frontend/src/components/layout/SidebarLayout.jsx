// src/components/layout/SidebarLayout.jsx
import React from 'react';
import SidebarNav from './SidebarNav';
import './SidebarLayout.css';

function SidebarLayout({ children }) {
  return (
    <div className="sidebar-layout">
      <SidebarNav />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default SidebarLayout;