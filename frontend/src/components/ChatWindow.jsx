import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const ChatWindow = ({ roomSlug = 'general' }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(false);
    const { user } = useAuth();
    const socketRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        // Fetch history
        const fetchHistory = async () => {
            try {
                const res = await api.get(`community/chat/${roomSlug}/history/`);
                setMessages(res.data.reverse());
            } catch (err) {
                console.error('History fetch failed', err);
            }
        };
        fetchHistory();

        // Setup WebSocket
        const wsUrl = `ws://localhost:8000/ws/chat/${roomSlug}/`;
        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onopen = () => {
            setConnected(true);
            console.log('WS Connected');
        };

        socketRef.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'message') {
                setMessages(prev => [...prev, data]);
            }
        };

        socketRef.current.onclose = () => {
            setConnected(false);
            console.log('WS Disconnected');
        };

        return () => {
            if (socketRef.current) socketRef.current.close();
        };
    }, [roomSlug]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() && socketRef.current && connected) {
            socketRef.current.send(JSON.stringify({ message: input }));
            setInput('');
        }
    };

    return (
        <div className="chat-window-container glass-card">
            <div className="chat-header">
                <Hash size={18} className="hash-icon" />
                <h3>{roomSlug.charAt(0).toUpperCase() + roomSlug.slice(1)} Channel</h3>
                <div className={`status-dot ${connected ? 'online' : 'offline'}`}></div>
            </div>

            <div className="messages-area" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`msg-group ${msg.user === user?.email ? 'own' : ''}`}>
                        {msg.user !== user?.email && (
                            <div className="msg-avatar">{msg.username?.[0]?.toUpperCase() || 'U'}</div>
                        )}
                        <div className="msg-content-wrapper">
                            <div className="msg-info">
                                <span className="user">{msg.username}</span>
                                <span className="time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="msg-bubble">{msg.message}</div>
                        </div>
                    </div>
                ))}
            </div>

            <form className="chat-input" onSubmit={sendMessage}>
                <input
                    type="text"
                    placeholder="Message #general"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" disabled={!connected}><Send size={20} /></button>
            </form>

            <style jsx>{`
        .chat-window-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 0 !important;
          overflow: hidden;
        }
        .chat-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .hash-icon { color: var(--text-muted); }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; margin-left: auto; }
        .status-dot.online { background: #50e3c2; box-shadow: 0 0 8px #50e3c2; }
        .status-dot.offline { background: #ff4d4d; }
        
        .messages-area {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
        }
        .msg-group { display: flex; gap: 12px; max-width: 85%; }
        .msg-group.own { align-self: flex-end; flex-direction: row-reverse; }
        
        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        .msg-content-wrapper { display: flex; flex-direction: column; gap: 4px; }
        .msg-group.own .msg-content-wrapper { align-items: flex-end; }
        
        .msg-info { display: flex; gap: 8px; align-items: center; font-size: 0.75rem; color: var(--text-muted); }
        .msg-info .user { font-weight: bold; color: var(--text-main); }
        
        .msg-bubble {
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          font-size: 0.9rem;
          color: white;
          border: 1px solid var(--glass-border);
          line-height: 1.4;
        }
        .msg-group.own .msg-bubble {
          background: rgba(0, 210, 255, 0.1);
          border-color: rgba(0, 210, 255, 0.2);
        }
        
        .chat-input {
          padding: 16px 20px;
          border-top: 1px solid var(--glass-border);
          display: flex;
          gap: 12px;
        }
        .chat-input input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          padding: 10px 16px;
          border-radius: 8px;
          color: white;
          outline: none;
        }
        .chat-input button { color: var(--primary-color); opacity: 0.7; }
        .chat-input button:hover { opacity: 1; }
      `}</style>
        </div>
    );
};

export default ChatWindow;
