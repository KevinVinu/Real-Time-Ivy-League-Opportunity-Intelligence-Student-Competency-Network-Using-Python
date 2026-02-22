import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
    MessageSquare,
    ThumbsUp,
    Share2,
    Plus,
    TrendingUp,
    Search,
    Hash
} from 'lucide-react';
import toast from 'react-hot-toast';
import ChatWindow from '../components/ChatWindow';

const Community = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('general');
    const [showCreate, setShowCreate] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await api.get('community/posts/', { params: { category } });
            setPosts(res.data.results || res.data);
        } catch (err) {
            toast.error('Failed to load community feed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [category]);

    const handleLike = async (id) => {
        try {
            const res = await api.post(`community/posts/${id}/like/`);
            setPosts(prev => prev.map(p => p.id === id ? { ...p, is_liked: res.data.liked, likes_count: res.data.likes_count } : p));
        } catch (err) {
            toast.error('Failed to update like');
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            await api.post('community/posts/', newPost);
            toast.success('Post shared with the community!');
            setShowCreate(false);
            setNewPost({ title: '', content: '', category: 'general' });
            fetchPosts();
        } catch (err) {
            toast.error('Failed to create post');
        }
    };

    return (
        <div className="community-page">
            <div className="community-grid">
                <div className="feed-section">
                    <div className="feed-header">
                        <h1 className="gradient-text">Academic Feed</h1>
                        <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
                            <Plus size={18} /> New Post
                        </button>
                    </div>

                    <div className="category-tabs">
                        {['general', 'research', 'advice', 'opportunity', 'question'].map(cat => (
                            <button
                                key={cat}
                                className={`tab ${category === cat ? 'active' : ''}`}
                                onClick={() => setCategory(cat)}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>

                    {showCreate && (
                        <div className="glass-card create-post-form">
                            <h3>Share an Insight</h3>
                            <form onSubmit={handleCreatePost}>
                                <input
                                    placeholder="Title"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="What's on your mind? Shared research, advice, or questions..."
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    required
                                ></textarea>
                                <div className="form-footer">
                                    <select
                                        value={newPost.category}
                                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                    >
                                        <option value="general">General</option>
                                        <option value="research">Research</option>
                                        <option value="advice">Advice</option>
                                        <option value="opportunity">Opportunity</option>
                                        <option value="question">Question</option>
                                    </select>
                                    <button type="submit" className="btn-primary">Post Insight</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="loading">Syncing community insights...</div>
                    ) : (
                        <div className="posts-list">
                            {posts.map(post => (
                                <div key={post.id} className="glass-card post-card">
                                    <div className="post-meta">
                                        <span className="author">@{post.author.username}</span>
                                        <span className="dot">•</span>
                                        <span className="time">{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3>{post.title}</h3>
                                    <p className="post-content">{post.content}</p>
                                    <div className="post-footer">
                                        <button
                                            className={`action-btn ${post.is_liked ? 'liked' : ''}`}
                                            onClick={() => handleLike(post.id)}
                                        >
                                            <ThumbsUp size={18} /> {post.likes_count}
                                        </button>
                                        <button className="action-btn">
                                            <MessageSquare size={18} /> {post.comments_count}
                                        </button>
                                        <button className="action-btn">
                                            <Share2 size={18} /> share
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="sidebar-section">
                    <div className="chat-container">
                        <ChatWindow roomSlug="general" />
                    </div>

                    <div className="glass-card trending-card">
                        <h3><TrendingUp size={20} className="icon" /> Trending Topics</h3>
                        <div className="trending-tags">
                            {['#HarvardREU', '#FA2024Match', '#ResearchGrant', '#IvyTips'].map(tag => (
                                <div key={tag} className="tag-item">
                                    <Hash size={14} /> <span>{tag.slice(1)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .community-page { height: calc(100vh - 120px); }
        .community-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
          height: 100%;
        }
        @media (max-width: 1000px) { .community-grid { grid-template-columns: 1fr; } }
        
        .feed-section { display: flex; flex-direction: column; gap: 24px; overflow-y: auto; padding-right: 10px; }
        .feed-header { display: flex; justify-content: space-between; align-items: center; }
        
        .category-tabs { display: flex; gap: 12px; margin-bottom: 8px; border-bottom: 1px solid var(--glass-border); padding-bottom: 12px; }
        .tab { 
          padding: 8px 16px; 
          border-radius: 20px; 
          font-size: 0.9rem; 
          color: var(--text-muted);
          transition: 0.3s;
        }
        .tab.active { background: var(--primary-color); color: white; }
        
        .create-post-form { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .create-post-form input { 
          background: rgba(255, 255, 255, 0.05); 
          border: 1px solid var(--glass-border); 
          padding: 12px; 
          border-radius: 8px; 
          color: white; 
          font-size: 1.1rem;
          margin-bottom: 12px;
          width: 100%;
        }
        .create-post-form textarea {
          background: rgba(255, 255, 255, 0.05); 
          border: 1px solid var(--glass-border); 
          padding: 12px; 
          border-radius: 8px; 
          color: white; 
          min-height: 120px;
          resize: vertical;
          width: 100%;
          font-family: inherit;
        }
        .form-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
        .form-footer select { padding: 8px; border-radius: 6px; background: rgba(0,0,0,0.3); color: white; border: 1px solid var(--glass-border); }
        
        .posts-list { display: flex; flex-direction: column; gap: 20px; }
        .post-card { display: flex; flex-direction: column; gap: 12px; }
        .post-meta { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-muted); }
        .post-meta .author { color: var(--primary-color); font-weight: bold; }
        .post-card h3 { font-size: 1.3rem; color: white; }
        .post-content { color: var(--text-main); line-height: 1.6; }
        
        .post-footer { display: flex; gap: 24px; padding-top: 16px; border-top: 1px solid var(--glass-border); }
        .action-btn { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.9rem; transition: 0.3s; }
        .action-btn:hover { color: var(--primary-color); }
        .action-btn.liked { color: #ff4d4d; }
        
        .sidebar-section { display: flex; flex-direction: column; gap: 24px; position: sticky; top: 0; height: calc(100vh - 120px); }
        .chat-container { flex: 1; min-height: 400px; }
        
        .trending-card h3 { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; margin-bottom: 20px; }
        .trending-tags { display: flex; flex-direction: column; gap: 12px; }
        .tag-item { display: flex; align-items: center; gap: 8px; color: var(--primary-color); font-size: 0.9rem; cursor: pointer; }
        .tag-item:hover { text-decoration: underline; }
        
        .loading { text-align: center; padding: 100px; color: var(--primary-color); }
      `}</style>
        </div>
    );
};

export default Community;
