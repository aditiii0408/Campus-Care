import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { moodAPI, bookingAPI, noticeAPI } from "../services/api";
import MoodTracker from "../components/modules/MoodTracker";
import CounsellingBooking from "../components/modules/CounsellingBooking";
import PeerForum from "../components/modules/PeerForum";
import Resources from "../components/modules/Resources";
import ScreeningTools from "../components/modules/ScreeningTools";
import FloatingChatbot from "../components/FloatingChatbot";

const TABS = [
  { id: "home",      label: "Dashboard",    icon: "🏠" },
  { id: "mood",      label: "Mood Tracker", icon: "📊" },
  { id: "screening", label: "Screening",    icon: "🧪" },
  { id: "booking",   label: "Book Session", icon: "📅" },
  { id: "forum",     label: "Peer Forum",   icon: "💬" },
  { id: "resources", label: "Resources",    icon: "📚" },
];

const MOOD_EMOJI  = { Happy: "😊", Neutral: "😐", Sad: "😔", Anxious: "😰", Stressed: "😤" };
const MOOD_COLORS = { Happy: "#10b981", Neutral: "#6366f1", Sad: "#3b82f6", Anxious: "#f59e0b", Stressed: "#ef4444" };
const WELLNESS_TIPS = [
  "Take a 5-minute walk outside — sunlight and movement reset your mind.",
  "Drink a glass of water. Dehydration quietly worsens anxiety.",
  "Write down three things you're grateful for today.",
  "Reach out to a friend — connection is medicine.",
  "Take 10 deep breaths: 4 counts in, hold 4, out 4.",
  "Your worth is not measured by your productivity today.",
  "It is okay to ask for help. Strength lies in that ask.",
];

const CATEGORY_STYLES = {
  Session:      { bg: "#eff6ff", color: "#1d4ed8" },
  Workshop:     { bg: "#f0fdf4", color: "#166534" },
  Announcement: { bg: "#fefce8", color: "#92400e" },
  Reminder:     { bg: "#fdf4ff", color: "#7e22ce" },
  Holiday:      { bg: "#fff7ed", color: "#9a3412" },
};

function HomeDashboard({ user, setTab }) {
  const [moods, setMoods]       = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notices, setNotices]   = useState([]);
  const [tip]                   = useState(WELLNESS_TIPS[Math.floor(Math.random() * WELLNESS_TIPS.length)]);
  const [musicOn, setMusicOn]   = useState(false);
  const audioRef                = useRef(null);

  useEffect(() => {
    moodAPI.getAll().then(r => setMoods(r.data.moods?.slice(0, 5) || [])).catch(() => {});
    bookingAPI.getAll().then(r => setBookings(r.data.bookings?.filter(b => b.status !== "cancelled").slice(0, 3) || [])).catch(() => {});
    noticeAPI.getAll().then(r => setNotices(r.data.notices?.slice(0, 5) || [])).catch(() => {});
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicOn) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setMusicOn(!musicOn);
  };

  const card = { background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid #e5e7eb" };

  return (
    <div>
      {/* Welcome banner */}
      <div style={{ background: "linear-gradient(135deg, #0f766e, #1d4ed8)", borderRadius: 18, padding: "24px 28px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 4 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
          <h2 style={{ color: "#fff", margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>Welcome back, {user?.name?.split(" ")[0]} 👋</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: 13 }}>How are you feeling today? Your wellness matters.</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <button onClick={toggleMusic} style={{ background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: "50%", width: 56, height: 56, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
            {musicOn ? "⏸" : "🎵"}
          </button>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 6 }}>{musicOn ? "Pause lofi" : "Play lofi"}</div>
          <audio ref={audioRef} loop>
            <source src="https://streams.ilovemusic.de/iloveradio17.mp3" type="audio/mpeg" />
          </audio>
        </div>
      </div>

      {/* Wellness tip */}
      <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <div>
          <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700, marginBottom: 3 }}>WELLNESS TIP OF THE DAY</div>
          <div style={{ fontSize: 14, color: "#78350f", lineHeight: 1.6 }}>{tip}</div>
        </div>
      </div>

      {/* Noticeboard from admin */}
      {notices.length > 0 && (
        <div style={{ ...card, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>📌</span>
            <h3 style={{ margin: 0, fontSize: 15, color: "#0f172a" }}>Noticeboard</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notices.map((n, i) => {
              const s = CATEGORY_STYLES[n.category] || CATEGORY_STYLES.Announcement;
              return (
                <div key={i} style={{ padding: "12px 14px", background: s.bg, borderRadius: 12, border: `1px solid ${s.bg}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {n.isPinned && <span style={{ fontSize: 12 }}>📌</span>}
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{n.category}</span>
                    {n.eventDate && <span style={{ fontSize: 11, color: "#64748b", marginLeft: "auto" }}>📅 {new Date(n.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 3 }}>{n.title}</div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{n.body}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Recent moods */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, color: "#0f172a" }}>Recent Moods</h3>
            <button onClick={() => setTab("mood")} style={{ fontSize: 12, color: "#0f766e", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>+ Log mood</button>
          </div>
          {moods.length === 0 ? (
            <div style={{ textAlign: "center", padding: "18px 0", color: "#94a3b8", fontSize: 13 }}><div style={{ fontSize: 28, marginBottom: 6 }}>📊</div>No moods logged yet</div>
          ) : moods.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < moods.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: MOOD_COLORS[m.mood], flexShrink: 0 }}></div>
              <span style={{ fontSize: 15 }}>{MOOD_EMOJI[m.mood]}</span>
              <span style={{ flex: 1, fontSize: 13, color: "#374151", fontWeight: 600 }}>{m.mood}</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, color: "#0f172a" }}>Appointments</h3>
            <button onClick={() => setTab("booking")} style={{ fontSize: 12, color: "#0f766e", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>+ Book session</button>
          </div>
          {bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "18px 0", color: "#94a3b8", fontSize: 13 }}><div style={{ fontSize: 28, marginBottom: 6 }}>📅</div>No upcoming sessions</div>
          ) : bookings.map((b, i) => (
            <div key={i} style={{ padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, marginBottom: 8, border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>{b.counsellorName}</div>
              <div style={{ fontSize: 12, color: "#16a34a", marginBottom: 4 }}>{b.slot}</div>
              <span style={{ fontSize: 11, background: b.status === "confirmed" ? "#dcfce7" : "#fef9c3", color: b.status === "confirmed" ? "#166534" : "#854d0e", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>{b.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={card}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, color: "#0f172a" }}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { icon: "📊", label: "Log Mood",     tab: "mood",      color: "#6366f1" },
            { icon: "🧪", label: "Self Screen",  tab: "screening", color: "#0f766e" },
            { icon: "📅", label: "Book Session", tab: "booking",   color: "#1d4ed8" },
            { icon: "💬", label: "Peer Forum",   tab: "forum",     color: "#dc2626" },
          ].map(a => (
            <button key={a.tab} onClick={() => setTab(a.tab)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 8px", background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 14, cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ fontSize: 24 }}>{a.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: a.color }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab]           = useState("home");
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Calibri', 'Segoe UI', sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #0f766e, #1d4ed8)", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>🌿</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>Campus Care</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>Your wellness companion</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>Hi, {user?.name?.split(" ")[0]} 👋</span>
          <button onClick={logout} style={{ padding: "7px 16px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 100px" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#fff", padding: 6, borderRadius: 14, border: "1px solid #e5e7eb", overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "none", background: tab === t.id ? "linear-gradient(135deg, #0f766e, #1d4ed8)" : "transparent", color: tab === t.id ? "#fff" : "#64748b", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", fontFamily: "inherit" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "home"      && <HomeDashboard user={user} setTab={setTab} />}
        {tab === "mood"      && <MoodTracker />}
        {tab === "screening" && <ScreeningTools />}
        {tab === "booking"   && <CounsellingBooking />}
        {tab === "forum"     && <PeerForum />}
        {tab === "resources" && <Resources />}
      </div>

      <FloatingChatbot open={chatOpen} setOpen={setChatOpen} />
    </div>
  );
}