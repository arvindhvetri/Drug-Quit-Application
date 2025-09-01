// src/components/user/pages/BlogPage.jsx
import React, { useState, useEffect } from 'react';
import '@styles/BlogPage.css';
import SidebarLayout from '../../layout/SidebarLayout';

function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blogs from backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/user/blogs'); // Your Flask route
        if (!res.ok) throw new Error('Failed to fetch blogs');
        const data = await res.json();
        // Only show first 5
        setBlogs(data.slice(0, 5));
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Could not load stories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const topRow = blogs.slice(0, 3);
  const bottomRow = blogs.slice(3, 5);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="blog-page-container">
          <div className="loading">Loading stories...</div>
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="blog-page-container">
          <div className="error">{error}</div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="blog-page-container">
        {/* === Page Title Section === */}
        <header className="blog-header">
          <h1>Stories of Strength</h1>
          <p>Real journeys from people who’ve walked the path — one day at a time.</p>
        </header>

        {/* === Top Row: 3 Cards === */}
        <div className="blog-row top">
          {topRow.map((blog) => (
            <div key={blog._id} className="blog-card">
              <h3>{blog.title}</h3>
              <p className="blog-excerpt">{blog.excerpt}</p>
              <div className="blog-meta">
                <span className="blog-author">By {blog.author}</span>
                <span className="blog-date">{blog.date}</span>
                <span className="blog-readtime">{blog.readTime}</span>
              </div>
              {blog.link && (
                <div className="blog-link">
                  <a href={blog.link} target="_blank" rel="noopener noreferrer">
                    🔗 Resource
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* === Bottom Row: 2 Cards === */}
        <div className="blog-row bottom">
          {bottomRow.map((blog) => (
            <div key={blog._id} className="blog-card">
              <h3>{blog.title}</h3>
              <p className="blog-excerpt">{blog.excerpt}</p>
              <div className="blog-meta">
                <span className="blog-author">By {blog.author}</span>
                <span className="blog-date">{blog.date}</span>
                <span className="blog-readtime">{blog.readTime}</span>
              </div>
              {blog.link && (
                <div className="blog-link">
                  <a href={blog.link} target="_blank" rel="noopener noreferrer">
                    🔗 Resource
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}

export default BlogPage;