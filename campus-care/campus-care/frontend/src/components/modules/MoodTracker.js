import { useState, useEffect } from "react";
import { moodAPI } from "../../services/api";

const MOODS = ["Happy", "Neutral", "Sad", "Anxious", "Stressed"];
const MOOD_EMOJI = { Happy: "😊", Neutral: "😐", Sad: "😔", Anxious: "😰", Stressed: "😤" };
const MOOD_COLORS = { Happy: "#10b981", Neutral: "#6366f1", Sad: "#3b82f6", Anxious: "#f59e0b", Stressed: "#ef4444" };

export default function MoodTracker() {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [log, setLog] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    moodAPI.getAll().then(res => setLog(res.data.moods)).catch(() => {});
  }, []);

  const save = async () => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      const res = await moodAPI.log({ mood: selected, note });
      setLog([res.data.entry, ...log]);
      setSelected(null); setNote(""); setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
    setSaving(false);
  };

  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb", marginBottom: 20, fontFamily: "'Calibri', sans-serif" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>How are you feeling today?</h3>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: "#64748b" }}>Your mood logs are private and encrypted.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
          {MOODS.map(m => (
            <button key={m} onClick={() => setSelected(m)} style={{ padding: "10px 18px", borderRadius: 24, border: `2px solid ${selected === m ? MOOD_COLORS[m] : "#e5e7eb"}`, background: selected === m ? MOOD_COLORS[m] + "18" : "#fff", cursor: "pointer", fontSize: 14, fontWeight: selected === m ? 700 : 400, color: selected === m ? MOOD_COLORS[m] : "#374151", transition: "all 0.2s", fontFamily: "inherit" }}>
              {MOOD_EMOJI[m]} {m}
            </button>
          ))}
        </div>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)..." style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, resize: "none", height: 70, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
        <button onClick={save} disabled={!selected || saving} style={{ marginTop: 12, padding: "10px 24px", background: selected ? "linear-gradient(135deg, #0f766e, #1d4ed8)" : "#e5e7eb", color: selected ? "#fff" : "#9ca3af", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: selected ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
          {saved ? "✓ Saved!" : saving ? "Saving..." : "Log Mood"}
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb", fontFamily: "'Calibri', sans-serif" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#0f172a" }}>Recent History</h3>
        {log.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 13 }}>No mood logs yet. Start by logging your first mood above.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {log.map((entry, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: MOOD_COLORS[entry.mood], flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{MOOD_EMOJI[entry.mood]} {entry.mood}</div>
                  {entry.note && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{entry.note}</div>}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(entry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
