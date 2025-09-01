// src/components/user/pages/BlogPage.jsx
import React from 'react';
import '@styles/BlogPage.css';
import SidebarLayout from '../../layout/SidebarLayout';

const blogs = [
  {
    id: 1,
    title: "My First Week Sober",
    excerpt: "The first seven days were the hardest. I cried, I doubted, but I didn’t give up.",
    author: "Alex M.",
    date: "May 10, 2025",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "How I Found My Tribe",
    excerpt: "I felt alone until I joined a support group. Now I have friends who truly get it.",
    author: "Jamie L.",
    date: "May 8, 2025",
    readTime: "6 min read",
  },
  {
    id: 3,
    title: "Running Saved Me",
    excerpt: "Every morning, I run. It clears my mind and reminds me I’m strong.",
    author: "Sam T.",
    date: "May 6, 2025",
    readTime: "4 min read",
  },
  {
    id: 4,
    title: "Relapse Is Not Failure",
    excerpt: "I slipped. I felt shame. But I learned — recovery isn’t a straight line.",
    author: "Riley K.",
    date: "May 5, 2025",
    readTime: "7 min read",
  },
  {
    id: 5,
    title: "Meditation & Mindfulness",
    excerpt: "Five minutes a day changed how I handle stress and cravings.",
    author: "Casey J.",
    date: "May 3, 2025",
    readTime: "5 min read",
  },
  {
    id: 6,
    title: "Cooking My Way to Clarity",
    excerpt: "Focusing on recipes helped me redirect urges into creativity.",
    author: "Morgan P.",
    date: "May 1, 2025",
    readTime: "4 min read",
  },
  {
    id: 7,
    title: "Letters to My Future Self",
    excerpt: "Writing letters keeps me connected to why I started this journey.",
    author: "Jordan L.",
    date: "Apr 28, 2025",
    readTime: "6 min read",
  },
];

function BlogPage() {
  const topRow = blogs.slice(0, 4);
  const bottomRow = blogs.slice(4, 7);

  return (
    <SidebarLayout>
      <div className="blog-page-container">
        {/* === Page Title Section === */}
        <header className="blog-header">
          <h1>Stories of Strength</h1>
          <p>Real journeys from people who’ve walked the path — one day at a time.</p>
        </header>

        {/* === Top Row: 4 Cards === */}
        <div className="blog-row top">
          {topRow.map((blog) => (
            <div key={blog.id} className="blog-card">
              <h3>{blog.title}</h3>
              <p className="blog-excerpt">{blog.excerpt}</p>
              <div className="blog-meta">
                <span className="blog-author">By {blog.author}</span>
                <span className="blog-date">{blog.date}</span>
                <span className="blog-readtime">{blog.readTime}</span>
              </div>
            </div>
          ))}
        </div>

        {/* === Bottom Row: 3 Cards === */}
        <div className="blog-row bottom">
          {bottomRow.map((blog) => (
            <div key={blog.id} className="blog-card">
              <h3>{blog.title}</h3>
              <p className="blog-excerpt">{blog.excerpt}</p>
              <div className="blog-meta">
                <span className="blog-author">By {blog.author}</span>
                <span className="blog-date">{blog.date}</span>
                <span className="blog-readtime">{blog.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}

export default BlogPage;