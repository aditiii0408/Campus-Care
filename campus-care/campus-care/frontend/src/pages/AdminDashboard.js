import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { adminAPI, counsellorAPI, noticeAPI, alertAPI } from "../services/api";
import api from "../services/api";

const ADMIN_TABS = [
  { id: "overview",    label: "Overview",    icon: "📊" },
  { id: "alerts",      label: "Alerts",      icon: "🚨" },
  { id: "noticeboard", label: "Noticeboard", icon: "📌" },
  { id: "users",       label: "Users",       icon: "👥" },
  { id: "counsellors", label: "Counsellors", icon: "👩‍⚕️" },
  { id: "bookings",    label: "Sessions",    icon: "📅" },
  { id: "forum",       label: "Forum",       icon: "💬" },
  { id: "report",      label: "Report",      icon: "📋" },
];

const CATEGORY_STYLES = {
  Session:      { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  Workshop:     { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
  Announcement: { bg: "#fefce8", color: "#92400e", border: "#fde68a" },
  Reminder:     { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" },
  Holiday:      { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
};

function UserManager({ currentUserId }) {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");

  useEffect(() => {
    api.get("/manage-users")
      .then(r => setUsers(r.data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateRole = async (id, role) => {
    try {
      const res = await api.patch(`/manage-users/${id}/role`, { role });
      setUsers(users.map(u => u._id === id ? res.data.user : u));
    } catch (e) {
      alert(e.response?.data?.error || "Failed to update role.");
    }
  };

  const toggleActive = async (id) => {
    try {
      const res = await api.patch(`/manage-users/${id}/toggle-active`);
      setUsers(users.map(u => u._id === id ? res.data.user : u));
    } catch (e) {
      alert(e.response?.data?.error || "Failed to update status.");
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase()) ||
                        (u.rollNumber || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.role === filter || (filter === "inactive" && !u.isActive);
    return matchSearch && matchFilter;
  });

  const counts = {
    all: users.length,
    student: users.filter(u => u.role === "student").length,
    admin: users.filter(u => u.role === "admin").length,
    inactive: users.filter(u => !u.isActive).length,
  };

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading users...</div>;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>Manage Users</h3>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Promote students to admin, or deactivate accounts.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Users",  value: counts.all,      color: "#0f766e" },
          { label: "Students",     value: counts.student,  color: "#1d4ed8" },
          { label: "Admins",       value: counts.admin,    color: "#7c3aed" },
          { label: "Inactive",     value: counts.inactive, color: "#dc2626" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or roll number..."
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", fontFamily: "inherit" }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "student", "admin", "inactive"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${filter === f ? "#0f766e" : "#e5e7eb"}`, background: filter === f ? "#0f766e" : "#fff", color: filter === f ? "#fff" : "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
              {f} {f !== "all" && `(${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      {/* User list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
          No users found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(u => (
            <div key={u._id} style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: `1px solid ${!u.isActive ? "#fecaca" : "#e5e7eb"}`, display: "flex", alignItems: "center", gap: 14, opacity: u.isActive ? 1 : 0.7 }}>
              {/* Avatar */}
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: u.role === "admin" ? "linear-gradient(135deg,#7c3aed22,#1d4ed822)" : "linear-gradient(135deg,#0f766e22,#1d4ed822)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: u.role === "admin" ? "#7c3aed" : "#0f766e", flexShrink: 0 }}>
                {u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{u.name}</span>
                  <span style={{ padding: "2px 8px", background: u.role === "admin" ? "#fdf4ff" : "#eff6ff", color: u.role === "admin" ? "#7e22ce" : "#1d4ed8", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{u.role}</span>
                  {!u.isActive && <span style={{ padding: "2px 8px", background: "#fef2f2", color: "#dc2626", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Inactive</span>}
                  {u._id === currentUserId && <span style={{ padding: "2px 8px", background: "#f0fdf4", color: "#166534", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>You</span>}
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#64748b" }}>
                  <span>📧 {u.email}</span>
                  {u.rollNumber  && <span>🎓 {u.rollNumber}</span>}
                  {u.department  && <span>🏛 {u.department}</span>}
                  {u.year        && <span>Year {u.year}</span>}
                  {u.lastLogin   && <span>Last login: {new Date(u.lastLogin).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                </div>
              </div>

              {/* Actions — disabled for self */}
              {u._id !== currentUserId && (
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {u.role === "student" ? (
                    <button
                      onClick={() => { if (window.confirm(`Promote ${u.name} to Admin?`)) updateRole(u._id, "admin"); }}
                      style={{ padding: "6px 14px", background: "#fdf4ff", color: "#7e22ce", border: "1px solid #e9d5ff", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
                    >
                      ↑ Make Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => { if (window.confirm(`Demote ${u.name} to Student?`)) updateRole(u._id, "student"); }}
                      style={{ padding: "6px 14px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
                    >
                      ↓ Make Student
                    </button>
                  )}
                  <button
                    onClick={() => { if (window.confirm(`${u.isActive ? "Deactivate" : "Activate"} ${u.name}'s account?`)) toggleActive(u._id); }}
                    style={{ padding: "6px 14px", background: u.isActive ? "#fef2f2" : "#f0fdf4", color: u.isActive ? "#dc2626" : "#166534", border: `1px solid ${u.isActive ? "#fecaca" : "#bbf7d0"}`, borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CounsellorManager() {
  const [list, setList]         = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]         = useState({ name: "", specialty: "", bio: "", email: "", slots: "" });
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState("");

  useEffect(() => {
    counsellorAPI.getAll().then(r => setList(r.data.counsellors)).catch(() => {});
  }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    if (!form.name || !form.specialty) { setErr("Name and specialty are required."); return; }
    setSaving(true); setErr("");
    try {
      const payload = { ...form, slots: form.slots.split(",").map(s => s.trim()).filter(Boolean) };
      if (editTarget) {
        const res = await counsellorAPI.update(editTarget._id, payload);
        setList(list.map(c => c._id === editTarget._id ? res.data.counsellor : c));
      } else {
        const res = await counsellorAPI.create(payload);
        setList([...list, res.data.counsellor]);
      }
      setShowForm(false); setEditTarget(null);
      setForm({ name: "", specialty: "", bio: "", email: "", slots: "" });
    } catch (e) { setErr(e.response?.data?.error || "Failed to save."); }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this counsellor?")) return;
    await counsellorAPI.remove(id);
    setList(list.filter(c => c._id !== id));
  };

  const startEdit = (c) => {
    setEditTarget(c);
    setForm({ name: c.name, specialty: c.specialty, bio: c.bio || "", email: c.email || "", slots: (c.slots || []).join(", ") });
    setShowForm(true);
  };

  const inp = { width: "100%", padding: "9px 13px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, boxSizing: "border-box", outline: "none", fontFamily: "inherit" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>Manage Counsellors</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Counsellors added here appear on the student booking page.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditTarget(null); setForm({ name: "", specialty: "", bio: "", email: "", slots: "" }); setErr(""); }} style={{ padding: "9px 18px", background: "linear-gradient(135deg,#0f766e,#1d4ed8)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Add Counsellor</button>
      </div>
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 22, border: "1.5px solid #0f766e", marginBottom: 20 }}>
          <h4 style={{ margin: "0 0 16px", fontSize: 15, color: "#0f172a" }}>{editTarget ? "Edit Counsellor" : "Add New Counsellor"}</h4>
          {err && <div style={{ background: "#fef2f2", color: "#dc2626", fontSize: 13, padding: "8px 12px", borderRadius: 8, marginBottom: 12, border: "1px solid #fecaca" }}>{err}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>Full Name *</label><input name="name" value={form.name} onChange={handle} placeholder="Dr. Priya Mehta" style={inp} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>Specialty *</label><input name="specialty" value={form.specialty} onChange={handle} placeholder="Anxiety & Stress" style={inp} /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>Bio</label><input name="bio" value={form.bio} onChange={handle} placeholder="Brief description..." style={inp} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div><label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>Email</label><input name="email" value={form.email} onChange={handle} placeholder="counsellor@campus.edu" style={inp} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>Slots (comma separated)</label><input name="slots" value={form.slots} onChange={handle} placeholder="Mon 10am, Wed 2pm" style={inp} /></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={save} disabled={saving} style={{ padding: "9px 22px", background: "linear-gradient(135deg,#0f766e,#1d4ed8)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{saving ? "Saving..." : editTarget ? "Save Changes" : "Add Counsellor"}</button>
            <button onClick={() => { setShowForm(false); setEditTarget(null); setErr(""); }} style={{ padding: "9px 18px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 10, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          </div>
        </div>
      )}
      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb" }}><div style={{ fontSize: 36, marginBottom: 10 }}>👩‍⚕️</div>No counsellors added yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {list.map(c => (
            <div key={c._id} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, background: "linear-gradient(135deg,#0f766e22,#1d4ed822)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#0f766e", flexShrink: 0 }}>{c.avatarInitials || c.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#0f766e", fontWeight: 600 }}>{c.specialty}</div>
                {c.bio && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{c.bio}</div>}
                {c.slots?.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>{c.slots.map(s => <span key={s} style={{ padding: "2px 8px", background: "#e0f2fe", color: "#0369a1", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{s}</span>)}</div>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(c)} style={{ padding: "6px 14px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Edit</button>
                <button onClick={() => remove(c._id)} style={{ padding: "6px 14px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Noticeboard() {
  const [notices, setNotices]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: "", body: "", category: "Announcement", isPinned: false, eventDate: "" });
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    noticeAPI.getAll().then(r => setNotices(r.data.notices)).catch(() => {});
  }, []);

  const handle = e => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const save = async () => {
    if (!form.title || !form.body) return;
    setSaving(true);
    try {
      const res = await noticeAPI.create(form);
      setNotices([res.data.notice, ...notices]);
      setShowForm(false);
      setForm({ title: "", body: "", category: "Announcement", isPinned: false, eventDate: "" });
    } catch {}
    setSaving(false);
  };

  const remove = async (id) => {
    await noticeAPI.remove(id);
    setNotices(notices.filter(n => n._id !== id));
  };

  const togglePin = async (id) => {
    const res = await noticeAPI.togglePin(id);
    setNotices(prev => prev.map(n => n._id === id ? res.data.notice : n).sort((a, b) => b.isPinned - a.isPinned));
  };

  const inp = { width: "100%", padding: "9px 13px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, boxSizing: "border-box", outline: "none", fontFamily: "inherit" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>Noticeboard</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Post announcements, upcoming sessions and events for students.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "9px 18px", background: "linear-gradient(135deg,#0f766e,#1d4ed8)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ New Notice</button>
      </div>
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 22, border: "1.5px solid #0f766e", marginBottom: 20 }}>
          <h4 style={{ margin: "0 0 16px", fontSize: 15, color: "#0f172a" }}>Create Notice</h4>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>Title *</label><input name="title" value={form.title} onChange={handle} placeholder="e.g. Group Therapy Session — March 30" style={inp} /></div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>Details *</label><textarea name="body" value={form.body} onChange={handle} placeholder="Describe the session, venue, timings..." style={{ ...inp, height: 90, resize: "none" }} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div><label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>Category</label><select name="category" value={form.category} onChange={handle} style={inp}>{["Session", "Workshop", "Announcement", "Reminder", "Holiday"].map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>Event Date (optional)</label><input name="eventDate" type="date" value={form.eventDate} onChange={handle} style={inp} /></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <input name="isPinned" type="checkbox" checked={form.isPinned} onChange={handle} id="pin" style={{ width: 16, height: 16, cursor: "pointer" }} />
            <label htmlFor="pin" style={{ fontSize: 13, color: "#374151", cursor: "pointer" }}>📌 Pin this notice to the top</label>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={save} disabled={saving || !form.title || !form.body} style={{ padding: "9px 22px", background: form.title && form.body ? "linear-gradient(135deg,#0f766e,#1d4ed8)" : "#e5e7eb", color: form.title && form.body ? "#fff" : "#9ca3af", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{saving ? "Posting..." : "Post Notice"}</button>
            <button onClick={() => setShowForm(false)} style={{ padding: "9px 18px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 10, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          </div>
        </div>
      )}
      {notices.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb" }}><div style={{ fontSize: 36, marginBottom: 10 }}>📌</div>No notices posted yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notices.map(n => {
            const style = CATEGORY_STYLES[n.category] || CATEGORY_STYLES.Announcement;
            return (
              <div key={n._id} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${n.isPinned ? "#fbbf24" : "#e5e7eb"}`, overflow: "hidden" }}>
                {n.isPinned && <div style={{ background: "#fef9c3", padding: "4px 16px", fontSize: 11, fontWeight: 700, color: "#92400e" }}>📌 PINNED</div>}
                <div style={{ padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ padding: "3px 10px", background: style.bg, color: style.color, border: `1px solid ${style.border}`, borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{n.category}</span>
                      {n.eventDate && <span style={{ fontSize: 12, color: "#64748b" }}>📅 {new Date(n.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{n.title}</div>
                    <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 6 }}>{n.body}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Posted by {n.postedByName} · {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => togglePin(n._id)} style={{ padding: "5px 12px", background: n.isPinned ? "#fef9c3" : "#f1f5f9", color: n.isPinned ? "#92400e" : "#64748b", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{n.isPinned ? "Unpin" : "📌 Pin"}</button>
                    <button onClick={() => remove(n._id)} style={{ padding: "5px 12px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Remove</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout }        = useAuth();
  const [tab, setTab]           = useState("overview");
  const [stats, setStats]       = useState(null);
  const [posts, setPosts]       = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [pastAlerts, setPastAlerts]     = useState([]);
  const [alertCount, setAlertCount]     = useState(0);
  const [loading, setLoading]   = useState(true);
  const pollRef                 = useRef(null);

  const fetchAlerts = async () => {
    try {
      const [activeRes, allRes] = await Promise.all([alertAPI.getActive(), alertAPI.getAll()]);
      setActiveAlerts(activeRes.data.alerts);
      setAlertCount(activeRes.data.alerts.length);
      setPastAlerts(allRes.data.alerts.filter(a => a.isResolved));
    } catch {}
  };

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getAllPosts()])
      .then(([s, p]) => { setStats(s.data); setPosts(p.data.posts); })
      .finally(() => setLoading(false));
    fetchAlerts();
    pollRef.current = setInterval(fetchAlerts, 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  const resolveAlert = async (id) => {
    await alertAPI.resolve(id);
    await fetchAlerts();
  };

  const removePost = async (id) => {
    await adminAPI.removePost(id);
    setPosts(posts.filter(p => p._id !== id));
  };

  const updateBooking = async (id, status) => {
    await adminAPI.updateBookingStatus(id, status);
    setStats(prev => ({ ...prev, upcomingBookings: prev.upcomingBookings.map(b => b._id === id ? { ...b, status } : b) }));
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "'Calibri', sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div><div style={{ color: "#64748b" }}>Loading...</div></div>
    </div>
  );

  const statCards = [
    { label: "Active Students", value: stats?.totalStudents ?? 0, icon: "👥", color: "#0f766e" },
    { label: "Sessions Booked", value: stats?.totalBookings ?? 0, icon: "📅", color: "#1d4ed8" },
    { label: "Mood Logs Today", value: stats?.moodLogsToday ?? 0, icon: "📊", color: "#7c3aed" },
    { label: "Forum Posts",     value: stats?.totalPosts ?? 0,    icon: "💬", color: "#dc2626" },
  ];
  const card = { background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1px solid #e5e7eb" };
  const MOOD_COLORS = { Happy: "#10b981", Neutral: "#6366f1", Sad: "#3b82f6", Anxious: "#f59e0b", Stressed: "#ef4444" };

  const AlertCard = ({ a, isResolved }) => (
    <div style={{ background: "#fff", borderRadius: 16, border: `2px solid ${isResolved ? "#e5e7eb" : a.severity === "critical" ? "#dc2626" : "#f97316"}`, overflow: "hidden", opacity: isResolved ? 0.85 : 1 }}>
      <div style={{ background: isResolved ? "#f1f5f9" : a.severity === "critical" ? "#dc2626" : "#f97316", padding: "8px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 15 }}>{isResolved ? "✅" : a.severity === "critical" ? "🚨" : "⚠️"}</span>
        <span style={{ color: isResolved ? "#475569" : "#fff", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>{isResolved ? "Resolved" : a.severity === "critical" ? "Critical Alert" : "High Alert"}</span>
        <span style={{ marginLeft: "auto", color: isResolved ? "#94a3b8" : "rgba(255,255,255,0.8)", fontSize: 12 }}>{new Date(a.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, background: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👤</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{a.studentName}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {a.studentEmail && <span>📧 {a.studentEmail}</span>}
              {a.rollNumber   && <span>🎓 {a.rollNumber}</span>}
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 5, textTransform: "uppercase" }}>Trigger Words</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{a.triggerWords.map(w => <span key={w} style={{ padding: "2px 10px", background: "#fef2f2", color: "#dc2626", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid #fecaca" }}>{w}</span>)}</div>
        </div>
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: isResolved ? 0 : 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 3, textTransform: "uppercase" }}>Message</div>
          <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6, fontStyle: "italic" }}>"{a.triggerMessage}"</div>
        </div>
        {isResolved && a.resolvedAt && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Resolved on {new Date(a.resolvedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>}
        {!isResolved && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#64748b", flex: 1 }}>⚡ Reach out to this student immediately.</div>
            <button onClick={() => resolveAlert(a._id)} style={{ padding: "8px 18px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✓ Mark Resolved</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Calibri', 'Segoe UI', sans-serif" }}>
      {alertCount > 0 && (
        <div onClick={() => setTab("alerts")} style={{ background: "#dc2626", padding: "12px 32px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{alertCount} CRISIS ALERT{alertCount > 1 ? "S" : ""} — Click to review immediately.</span>
          <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>View Alerts →</span>
        </div>
      )}

      <div style={{ background: "linear-gradient(135deg, #0f766e, #1d4ed8)", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: alertCount > 0 ? 44 : 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>🌿</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>Campus Care</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>Admin Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>{user?.name}</span>
          <button onClick={logout} style={{ padding: "7px 16px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "#fff", padding: 6, borderRadius: 14, border: "1px solid #e5e7eb", overflowX: "auto" }}>
          {ADMIN_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "none", background: tab === t.id ? "linear-gradient(135deg,#0f766e,#1d4ed8)" : "transparent", color: tab === t.id ? "#fff" : "#64748b", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {t.icon} {t.label}
              {t.id === "alerts" && alertCount > 0 && <span style={{ background: "#dc2626", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{alertCount}</span>}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              {statCards.map((s, i) => <div key={i} style={card}><div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div><div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: 13, color: "#64748b" }}>{s.label}</div></div>)}
            </div>
            <div style={card}>
              <h3 style={{ margin: "0 0 18px", fontSize: 15, color: "#0f172a" }}>Mood Distribution (Anonymous)</h3>
              {stats?.moodDist?.length > 0 ? stats.moodDist.map((m, i) => {
                const total = stats.moodDist.reduce((s, x) => s + x.count, 0);
                const pct = Math.round((m.count / total) * 100);
                return <div key={i} style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}><span style={{ color: "#374151" }}>{m._id}</span><span style={{ color: "#64748b", fontWeight: 600 }}>{pct}%</span></div><div style={{ height: 8, background: "#f1f5f9", borderRadius: 4 }}><div style={{ height: "100%", width: `${pct}%`, background: MOOD_COLORS[m._id] || "#94a3b8", borderRadius: 4 }}></div></div></div>;
              }) : <div style={{ color: "#94a3b8", fontSize: 13 }}>No mood data yet.</div>}
            </div>
          </>
        )}

        {tab === "alerts" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>Crisis Alerts</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Students who used distressing language in the chatbot.</p>
            </div>
            <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>🚨 Active Alerts <span style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 20, padding: "2px 10px", fontSize: 12 }}>{activeAlerts.length}</span></h4>
            {activeAlerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", marginBottom: 28 }}><div style={{ fontSize: 36, marginBottom: 8 }}>✅</div><div style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>No active alerts — all students appear safe.</div></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>{activeAlerts.map(a => <AlertCard key={a._id} a={a} isResolved={false} />)}</div>
            )}
            <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>📁 Past Alerts (Resolved) <span style={{ background: "#f1f5f9", color: "#64748b", borderRadius: 20, padding: "2px 10px", fontSize: 12 }}>{pastAlerts.length}</span></h4>
            {pastAlerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb" }}><div style={{ fontSize: 13, color: "#94a3b8" }}>No resolved alerts yet.</div></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{pastAlerts.map(a => <AlertCard key={a._id} a={a} isResolved={true} />)}</div>
            )}
          </div>
        )}

        {tab === "noticeboard" && <Noticeboard />}
        {tab === "users"       && <UserManager currentUserId={user?._id} />}
        {tab === "counsellors" && <CounsellorManager />}

        {tab === "bookings" && (
          <div style={card}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, color: "#0f172a" }}>Upcoming Sessions</h3>
            {stats?.upcomingBookings?.length > 0 ? stats.upcomingBookings.map((b, i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: i < stats.upcomingBookings.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📅</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>{b.student?.name || "Anonymous"}</div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#64748b", marginBottom: 3 }}>
                      {b.student?.email && <span>📧 {b.student.email}</span>}
                      {b.student?.rollNumber && <span>🎓 {b.student.rollNumber}</span>}
                      {b.student?.department && <span>🏛 {b.student.department}</span>}
                      {b.student?.year && <span>Year {b.student.year}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>Counsellor: {b.counsellorName} · Slot: {b.slot}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {b.status === "pending" && <button onClick={() => updateBooking(b._id, "confirmed")} style={{ padding: "5px 12px", background: "#f0fdf4", color: "#166534", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Confirm</button>}
                    <span style={{ padding: "5px 12px", background: b.status === "confirmed" ? "#f0fdf4" : "#fef9c3", color: b.status === "confirmed" ? "#166534" : "#854d0e", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{b.status}</span>
                  </div>
                </div>
              </div>
            )) : <div style={{ color: "#94a3b8", fontSize: 13 }}>No upcoming sessions.</div>}
          </div>
        )}

        {tab === "forum" && (
          <div style={card}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, color: "#0f172a" }}>Forum Moderation</h3>
            {posts.length > 0 ? posts.slice(0, 20).map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#f8fafc", borderRadius: 10, marginBottom: 8, border: "1px solid #e5e7eb" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Anonymous · {p.likes?.length || 0} likes · {p.replies?.length || 0} replies</div>
                </div>
                <span style={{ padding: "3px 10px", background: "#e0f2fe", color: "#0369a1", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{p.tag}</span>
                <button onClick={() => removePost(p._id)} style={{ padding: "5px 12px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Remove</button>
              </div>
            )) : <div style={{ color: "#94a3b8", fontSize: 13 }}>No posts yet.</div>}
          </div>
        )}

        {tab === "report" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div><h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>Wellness Report</h3><p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Anonymous mental health snapshot of the student community.</p></div>
              <button onClick={() => window.print()} style={{ padding: "9px 18px", background: "linear-gradient(135deg,#0f766e,#1d4ed8)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>🖨️ Print / Save PDF</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
              {statCards.map((s, i) => <div key={i} style={{ ...card, textAlign: "center" }}><div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div><div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div></div>)}
            </div>
            <div style={{ ...card, marginBottom: 20 }}>
              <h4 style={{ margin: "0 0 16px", fontSize: 15, color: "#0f172a" }}>Mood Distribution Across Campus</h4>
              {stats?.moodDist?.length > 0 ? stats.moodDist.map((m, i) => {
                const total = stats.moodDist.reduce((s, x) => s + x.count, 0);
                const pct = Math.round((m.count / total) * 100);
                return <div key={i} style={{ marginBottom: 14 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}><span style={{ fontWeight: 600, color: "#374151" }}>{m._id}</span><span style={{ color: "#64748b" }}>{m.count} logs ({pct}%)</span></div><div style={{ height: 10, background: "#f1f5f9", borderRadius: 6 }}><div style={{ height: "100%", width: `${pct}%`, background: MOOD_COLORS[m._id] || "#94a3b8", borderRadius: 6 }}></div></div></div>;
              }) : <p style={{ color: "#94a3b8", fontSize: 13 }}>No mood data yet.</p>}
            </div>
            <div style={card}>
              <h4 style={{ margin: "0 0 8px", fontSize: 15, color: "#0f172a" }}>Observations & Recommendations</h4>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>Auto-generated based on current platform data.</p>
              {stats && (() => {
                const total    = stats.moodDist?.reduce((s, x) => s + x.count, 0) || 1;
                const stressed = stats.moodDist?.find(m => m._id === "Stressed")?.count || 0;
                const anxious  = stats.moodDist?.find(m => m._id === "Anxious")?.count || 0;
                const happy    = stats.moodDist?.find(m => m._id === "Happy")?.count || 0;
                const negPct   = Math.round(((stressed + anxious) / total) * 100);
                const happyPct = Math.round((happy / total) * 100);
                return [
                  alertCount > 0 ? { icon: "🚨", bg: "#fef2f2", border: "#fecaca", text: `${alertCount} unresolved crisis alert${alertCount > 1 ? "s" : ""} detected. Immediate follow-up required.` } : { icon: "✅", bg: "#f0fdf4", border: "#bbf7d0", text: "No active crisis alerts. Community appears stable." },
                  negPct > 40 ? { icon: "⚠️", bg: "#fefce8", border: "#fde68a", text: `${negPct}% of mood logs indicate stress or anxiety. Consider organizing workshops.` } : { icon: "✅", bg: "#f0fdf4", border: "#bbf7d0", text: `Stress and anxiety at ${negPct}% — manageable.` },
                  happyPct > 40 ? { icon: "😊", bg: "#f0fdf4", border: "#bbf7d0", text: `${happyPct}% of students report feeling happy.` } : { icon: "⚠️", bg: "#fefce8", border: "#fde68a", text: `Only ${happyPct}% report positive moods. Consider wellness campaigns.` },
                  { icon: "📅", bg: "#eff6ff", border: "#bfdbfe", text: `${stats.totalBookings} counselling sessions booked.` },
                ].map((o, i) => (
                  <div key={i} style={{ background: o.bg, border: `1px solid ${o.border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 10, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{o.icon}</span>
                    <p style={{ margin: 0, fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>{o.text}</p>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}