// src/components/admin/pages/BlogManagement.jsx
import React, { useState, useEffect } from 'react';
import '../../../styles/BlogManagement.css';
import SidebarLayout from '../../layout/SidebarLayout';

function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [editingId, setEditingId] = useState(null);
  const username = localStorage.getItem('username');

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/admin/blogs');
        if (res.ok) {
          const data = await res.json();
          setBlogs(data.slice(0, 5)); // Only keep 5
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchBlogs();
  }, []);

  // Edit existing blog
  const handleEdit = (blog) => {
    setTitle(blog.title);
    setExcerpt(blog.excerpt);
    setEditingId(blog._id);
  };

  // Add or Update blog
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) return;

    const isEditing = !!editingId;

    // Prevent add if already 5 blogs and not editing
    if (!isEditing && blogs.length >= 5) {
      alert("You can only have 5 blogs. Edit or delete an existing blog to add a new one.");
      return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const endpoint = isEditing ? `/api/admin/blogs/${editingId}` : '/api/admin/blogs';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, title, excerpt })
      });

      if (res.ok) {
        const saved = await res.json();

        if (isEditing) {
          setBlogs((prev) => prev.map(b => b._id === editingId ? saved : b));
        } else {
          setBlogs((prev) => [...prev, saved].slice(0, 5)); // Keep only 5
        }

        // Reset form
        setTitle('');
        setExcerpt('');
        setEditingId(null);
      }
    } catch (err) {
      alert(isEditing ? 'Failed to update blog' : 'Failed to add blog');
    }
  };

  // Delete blog
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBlogs((prev) => prev.filter(b => b._id !== id));
        if (id === editingId) {
          setEditingId(null);
          setTitle('');
          setExcerpt('');
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Live preview
  const previewBlog = {
    title: title || 'Your blog title will appear here',
    excerpt: excerpt || 'Your excerpt will show up here as you type...',
    author: username ? `By ${username}` : 'By Admin',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    readTime: `${Math.ceil((excerpt || '').split(' ').length / 200) || 1} min read`
  };

  return (
    <SidebarLayout>
      <div className="blog-management-container">
        {/* Header */}
        <header className="blog-header">
          <h1>Blog Management</h1>
          <p>Add, edit, or delete stories to inspire the community.</p>
        </header>

        {/* Layout: Preview (Top) | Form (Bottom) | Cards (Right) */}
        <div className="management-grid-layout">
          {/* Left: Preview + Form */}
          <div className="left-panel">
            {/* Top: Live Preview */}
            <div className="preview-section">
              <h3>Live Preview</h3>
              <div className="blog-card preview-card">
                <h3>{previewBlog.title}</h3>
                <p className="blog-excerpt">{previewBlog.excerpt}</p>
                <div className="blog-meta">
                  <span className="blog-author">{previewBlog.author}</span>
                  <span className="blog-date">{previewBlog.date}</span>
                  <span className="blog-readtime">{previewBlog.readTime}</span>
                </div>
              </div>
            </div>

            {/* Bottom: Add/Edit Form */}
            <div className="form-section">
              <h3>{editingId ? 'Edit Blog' : 'Add New Blog'}</h3>
              <form className="blog-form" onSubmit={handleSubmit}>
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
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Right: Blog Cards */}
          <div className="right-panel">
            <h3>Published Stories ({blogs.length}/5)</h3>
            <div className="blog-list">
              <div className="blog-row top">
                {blogs.slice(0, 4).map((blog) => (
                  <div key={blog._id} className="blog-card">
                    <h3>{blog.title}</h3>
                    <p className="blog-excerpt">{blog.excerpt}</p>
                    <div className="blog-meta">
                      <span className="blog-author">By {blog.author}</span>
                      <span className="blog-date">{blog.date}</span>
                      <span className="blog-readtime">{blog.readTime}</span>
                    </div>
                    <div className="card-actions">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="btn btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="btn btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="blog-row bottom">
                {blogs.slice(4).map((blog) => (
                  <div key={blog._id} className="blog-card">
                    <h3>{blog.title}</h3>
                    <p className="blog-excerpt">{blog.excerpt}</p>
                    <div className="blog-meta">
                      <span className="blog-author">By {blog.author}</span>
                      <span className="blog-date">{blog.date}</span>
                      <span className="blog-readtime">{blog.readTime}</span>
                    </div>
                    <div className="card-actions">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="btn btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="btn btn-delete"
                      >
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
    </SidebarLayout>
  );
}

export default BlogManagement;