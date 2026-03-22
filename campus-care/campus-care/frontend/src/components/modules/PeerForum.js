import { useState, useEffect } from "react";
import { forumAPI } from "../../services/api";

const TAGS = ["All", "Anxiety", "Stress", "Motivation", "Gratitude", "Academic", "Relationships", "General"];

export default function PeerForum() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [newPost, setNewPost] = useState({ title: "", body: "", tag: "General" });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (tag) => {
    setLoading(true);
    try {
      const res = await forumAPI.getPosts({ tag });
      setPosts(res.data.posts);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPosts(filter); }, [filter]);

  const submit = async () => {
    if (!newPost.title || !newPost.body || submitting) return;
    setSubmitting(true);
    try {
      const res = await forumAPI.createPost({ ...newPost, isAnonymous: true });
      setPosts([res.data.post, ...posts]);
      setNewPost({ title: "", body: "", tag: "General" }); setShowForm(false);
    } catch {}
    setSubmitting(false);
  };

  const like = async (id) => {
    await forumAPI.like(id);
    setPosts(posts.map(p => p._id === id ? { ...p, likes: [...(p.likes || []), "me"] } : p));
  };

  return (
    <div style={{ fontFamily: "'Calibri', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>All posts are anonymous. Be kind and supportive.</p>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #0f766e, #1d4ed8)", color: "#fff", border: "none", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ New Post</button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1.5px solid #0f766e", marginBottom: 16 }}>
          <input value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} placeholder="Post title..." style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, marginBottom: 10, boxSizing: "border-box", fontFamily: "inherit" }} />
          <textarea value={newPost.body} onChange={e => setNewPost({ ...newPost, body: e.target.value })} placeholder="Share your thoughts..." style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, height: 90, resize: "none", boxSizing: "border-box", marginBottom: 10, fontFamily: "inherit" }} />
          <select value={newPost.tag} onChange={e => setNewPost({ ...newPost, tag: e.target.value })} style={{ padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, marginBottom: 12, fontFamily: "inherit" }}>
            {TAGS.filter(t => t !== "All").map(t => <option key={t}>{t}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={submit} disabled={submitting} style={{ padding: "9px 20px", background: "#0f766e", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{submitting ? "Posting..." : "Post Anonymously"}</button>
            <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {TAGS.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${filter === t ? "#0f766e" : "#e5e7eb"}`, background: filter === t ? "#0f766e" : "#fff", color: filter === t ? "#fff" : "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading posts...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No posts yet. Be the first to share!</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {posts.map(p => (
            <div key={p._id} style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, background: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>👤</div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Anonymous</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
                <span style={{ marginLeft: "auto", padding: "3px 10px", background: "#e0f2fe", color: "#0369a1", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{p.tag}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", marginBottom: 6 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6, marginBottom: 14 }}>{p.body}</div>
              <div style={{ display: "flex", gap: 16 }}>
                <button onClick={() => like(p._id)} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>❤️ {p.likes?.length || 0}</button>
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: 13 }}>💬 {p.replies?.length || 0} replies</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
