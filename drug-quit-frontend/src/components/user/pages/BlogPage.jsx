// src/components/user/pages/BlogPage.jsx
import React, { useState, useEffect } from 'react';
import '../../../styles/BlogPage.css';
import SidebarLayout from '../../layout/SidebarLayout';

function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('http://localhost:5000/user/blogs');
        if (!res.ok) throw new Error('Failed to load blogs');
        const data = await res.json();
        setBlogs(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="blog-container">
          <p>Loading recovery stories...</p>
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="blog-container">
          <div className="alert alert-error">❌ Failed to load blogs. Please try again later.</div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="blog-container">
        <header className="blog-header">
          <h1>📚 Recovery Stories & Insights</h1>
          <p>Real journeys. Real hope. You're not alone.</p>
        </header>

        <div className="blogs-grid">
          {blogs.length === 0 ? (
            <p className="no-blogs">No stories yet. Check back soon!</p>
          ) : (
            blogs.map((blog) => (
              <article key={blog._id} className="blog-card">
                <h3>{blog.title}</h3>
                <p className="blog-excerpt">{blog.excerpt}</p>
                <div className="blog-meta">
                  <span>By {blog.author}</span>
                  <span>•</span>
                  <span>{blog.date}</span>
                  <span>•</span>
                  <span>{blog.readTime}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

export default BlogPage;