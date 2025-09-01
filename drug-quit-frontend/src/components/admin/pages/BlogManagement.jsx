// src/components/admin/pages/BlogManagement.jsx
import React, { useState, useEffect } from 'react';
import '../../../styles/BlogManagement.css';
import SidebarLayout from '../../layout/SidebarLayout';

function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [link, setLink] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'info' });
  const username = localStorage.getItem('username');

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, msg: '', type: 'info' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/admin/blogs');
        if (res.ok) {
          const data = await res.json();
          setBlogs(data.slice(0, 5));
        } else {
          setToast({ show: true, msg: 'Failed to load blogs', type: 'error' });
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setToast({ show: true, msg: 'Network error', type: 'error' });
      }
    };
    fetchBlogs();
  }, []);

  // Edit existing blog
  const handleEdit = (blog) => {
    setTitle(blog.title);
    setExcerpt(blog.excerpt);
    setLink(blog.link || '');
    setEditingId(blog._id);
  };

  // Add or Update blog
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) {
      setToast({ show: true, msg: 'Title and excerpt are required', type: 'error' });
      return;
    }

    const isEditing = !!editingId;

    if (!isEditing && blogs.length >= 5) {
      setToast({ show: true, msg: 'Max 5 blogs. Edit or delete first.', type: 'warning' });
      return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const endpoint = isEditing ? `/api/admin/blogs/${editingId}` : '/api/admin/blogs';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, title, excerpt, link })
      });

      if (res.ok) {
        const saved = await res.json();
        if (isEditing) {
          setBlogs((prev) => prev.map(b => b._id === editingId ? saved : b));
          setToast({ show: true, msg: 'Blog updated!', type: 'success' });
        } else {
          setBlogs((prev) => [...prev, saved].slice(0, 5));
          setToast({ show: true, msg: 'Blog added!', type: 'success' });
        }

        setTitle('');
        setExcerpt('');
        setLink('');
        setEditingId(null);
      } else {
        const data = await res.json();
        setToast({ show: true, msg: data.message || 'Save failed', type: 'error' });
      }
    } catch (err) {
      console.error('Save error:', err);
      setToast({ show: true, msg: 'Network error', type: 'error' });
    }
  };

  // Delete blog
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog?')) return;

    if (!username) {
      setToast({ show: true, msg: 'Not logged in', type: 'error' });
      return;
    }

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      if (res.ok) {
        setBlogs((prev) => prev.filter(b => b._id !== id));
        setToast({ show: true, msg: 'Blog deleted!', type: 'success' });
      } else {
        const data = await res.json();
        setToast({ show: true, msg: data.message || 'Delete failed', type: 'error' });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setToast({ show: true, msg: 'Network error', type: 'error' });
    }
  };

  return (
    <SidebarLayout>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <div className="blog-management-container">
        {/* Header */}
        <header className="blog-header">
          <h1>Blog Management</h1>
          <p>Add, edit, or delete stories to inspire the community.</p>
        </header>

        {/* Layout: Form (1/4) | Cards (3/4) */}
        <div className="management-grid-layout">
          {/* Left: Add/Edit Form */}
          <div className="form-panel">
            <form className="blog-form" onSubmit={handleSubmit}>
              <h3>{editingId ? 'Edit Blog' : 'Add New Blog'}</h3>

              <input
                type="text"
                placeholder="Enter blog title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <textarea
                placeholder="Write a short excerpt..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
              />

              <input
                type="url"
                placeholder="Enter relevant link (optional)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />

              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Blog' : 'Add Blog'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setExcerpt('');
                    setLink('');
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          {/* Right: Blog Cards (Scrollable) */}
          <div className="cards-panel">
            <h3>Published Stories ({blogs.length}/5)</h3>

            {/* Scrollable Container */}
            <div className="cards-scroll-container">
              <div className="blog-list">
                {/* Top Row: 2 Cards */}
                <div className="blog-row top">
                  {blogs.slice(0, 2).map((blog) => (
                    <div key={blog._id} className="blog-card">
                      <h3>{blog.title}</h3>
                      <p className="blog-excerpt">{blog.excerpt}</p>
                      {blog.link && (
                        <div className="blog-link">
                          <a href={blog.link} target="_blank" rel="noopener noreferrer">
                            🔗 Resource
                          </a>
                        </div>
                      )}
                      <div className="blog-meta">
                        <span className="blog-author">By {blog.author}</span>
                        <span className="blog-date">{blog.date}</span>
                        <span className="blog-readtime">{blog.readTime}</span>
                      </div>
                      <div className="card-actions">
                        <button onClick={() => handleEdit(blog)} className="btn btn-action">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(blog._id)} className="btn btn-action">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Row: 3 Cards */}
                <div className="blog-row bottom">
                  {blogs.slice(2, 5).map((blog) => (
                    <div key={blog._id} className="blog-card">
                      <h3>{blog.title}</h3>
                      <p className="blog-excerpt">{blog.excerpt}</p>
                      {blog.link && (
                        <div className="blog-link">
                          <a href={blog.link} target="_blank" rel="noopener noreferrer">
                            🔗 Resource
                          </a>
                        </div>
                      )}
                      <div className="blog-meta">
                        <span className="blog-author">By {blog.author}</span>
                        <span className="blog-date">{blog.date}</span>
                        <span className="blog-readtime">{blog.readTime}</span>
                      </div>
                      <div className="card-actions">
                        <button onClick={() => handleEdit(blog)} className="btn btn-edit" >
                          Edit
                        </button>
                        <button onClick={() => handleDelete(blog._id)} className="btn btn-delete" >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

export default BlogManagement;