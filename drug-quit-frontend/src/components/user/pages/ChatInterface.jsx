// src/components/user/pages/ChatInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/ChatInterface.css';
import SidebarLayout from '../../layout/SidebarLayout';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch chat history on load
  const fetchHistory = async () => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/profile/${user_id}`);
      if (res.ok) {
        const data = await res.json();
        const chatHistory = data.chat_history || [];
        setMessages(chatHistory);
      }
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle send message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { user: input, bot: '', timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          user_id: localStorage.getItem('user_id'),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((msg, i) =>
            i === prev.length - 1 ? { ...msg, bot: data.reply } : msg
          )
        );
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.error("Chat request failed:", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { ...userMsg, bot: "Sorry, I couldn't reach the AI right now." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="chat-interface-container">
        {/* Header */}
        <header className="chat-header">
          <h1>💬 AI Support Chat</h1>
          <p>Talk to your AI companion anytime for guidance and motivation.</p>
        </header>

        {/* Chat Box */}
        <div className="chat-box">
          {messages.length === 0 && !loading ? (
            <div className="welcome-message">
              Ask me anything about recovery, coping strategies, or motivation!
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="chat-message">
                <div className="user-bubble">
                  <strong>You:</strong> {msg.user}
                </div>
                {msg.bot && (
                  <div className="bot-bubble">
                    <strong>AI:</strong> {msg.bot}
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="bot-bubble typing">
              <strong>AI:</strong> 🧠 Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="chat-input"
          />
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
}

export default ChatInterface;