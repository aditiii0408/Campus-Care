import { useState } from "react";

const RESOURCES = [
  {
    title: "5-Minute Breathing Exercise",
    titleHi: "5 मिनट की सांस लेने की कसरत",
    type: "Video", tag: "Stress", icon: "🎥", duration: "5 min",
    lang: ["en", "hi"],
    url: "https://www.youtube.com/watch?v=tybOi4hjZFQ",
  },
  {
    title: "Managing Academic Pressure",
    titleHi: "शैक्षणिक दबाव कैसे संभालें",
    type: "Guide", tag: "Academics", icon: "📖", duration: "10 min read",
    lang: ["en", "hi"],
    url: "https://www.headspace.com/articles/student-stress",
  },
  {
    title: "Sleep Hygiene for Students",
    titleHi: "विद्यार्थियों के लिए नींद के टिप्स",
    type: "Article", tag: "Wellness", icon: "📄", duration: "7 min read",
    lang: ["en"],
    url: "https://www.sleepfoundation.org/sleep-hygiene",
  },
  {
    title: "Mindfulness Meditation",
    titleHi: "माइंडफुलनेस मेडिटेशन",
    type: "Audio", tag: "Mindfulness", icon: "🎧", duration: "15 min",
    lang: ["en", "hi"],
    url: "https://www.youtube.com/watch?v=inpok4MKVLM",
  },
  {
    title: "Journaling for Mental Health",
    titleHi: "मानसिक स्वास्थ्य के लिए जर्नलिंग",
    type: "Guide", tag: "Self-Care", icon: "✍️", duration: "8 min read",
    lang: ["en", "hi"],
    url: "https://www.mind.org.uk/information-support/tips-for-everyday-living/wellbeing/wellbeing/",
  },
  {
    title: "Understanding Anxiety",
    titleHi: "चिंता को समझें",
    type: "Article", tag: "Anxiety", icon: "📄", duration: "6 min read",
    lang: ["en", "hi"],
    url: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/anxiety-and-panic-attacks/",
  },
  {
    title: "Progressive Muscle Relaxation",
    titleHi: "मांसपेशी विश्राम तकनीक",
    type: "Audio", tag: "Stress", icon: "🎧", duration: "12 min",
    lang: ["en"],
    url: "https://www.youtube.com/watch?v=1nZEdqcGVzo",
  },
  {
    title: "Building Healthy Habits",
    titleHi: "स्वस्थ आदतें कैसे बनाएं",
    type: "Guide", tag: "Wellness", icon: "📖", duration: "9 min read",
    lang: ["en", "hi"],
    url: "https://www.headspace.com/articles/healthy-habits",
  },
  {
    title: "Coping with Exam Stress",
    titleHi: "परीक्षा के तनाव से कैसे निपटें",
    type: "Guide", tag: "Academics", icon: "📝", duration: "5 min read",
    lang: ["en", "hi"],
    url: "https://icallhelpline.org",
  },
  {
    title: "When to Seek Professional Help",
    titleHi: "कब पेशेवर सहायता लें",
    type: "Article", tag: "Wellness", icon: "🩺", duration: "4 min read",
    lang: ["en", "hi"],
    url: "https://icallhelpline.org",
  },
];

const TAGS = ["All", "Stress", "Academics", "Wellness", "Mindfulness", "Self-Care", "Anxiety"];

const TYPE_LABELS = {
  Video:   { bg: "#fef2f2", color: "#dc2626" },
  Audio:   { bg: "#f0fdf4", color: "#16a34a" },
  Guide:   { bg: "#eff6ff", color: "#1d4ed8" },
  Article: { bg: "#fefce8", color: "#92400e" },
};

export default function Resources() {
  const [filter, setFilter] = useState("All");
  const [lang, setLang]     = useState("en");

  const filtered = RESOURCES
    .filter(r => r.lang.includes(lang))
    .filter(r => filter === "All" || r.tag === filter);

  const open = (url) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, color: "#0f172a" }}>Wellness Resources</h3>
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 3, gap: 2 }}>
          {[{ code: "en", label: "English" }, { code: "hi", label: "हिंदी" }].map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: lang === l.code ? "#0f766e" : "transparent", color: lang === l.code ? "#fff" : "#64748b", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {TAGS.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${filter === t ? "#0f766e" : "#e5e7eb"}`, background: filter === t ? "#0f766e" : "#fff", color: filter === t ? "#fff" : "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 13 }}>
          No resources found for this filter.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14 }}>
          {filtered.map((r, i) => (
            <div
              key={i}
              onClick={() => open(r.url)}
              style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e5e7eb", cursor: "pointer", transition: "all 0.2s", position: "relative" }}
              onMouseEnter={e => { e.currentTarget.style.border = "1.5px solid #0f766e"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,118,110,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.border = "1px solid #e5e7eb"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {/* External link indicator */}
              <div style={{ position: "absolute", top: 12, right: 12, fontSize: 11, color: "#94a3b8" }}>↗</div>

              <div style={{ fontSize: 30, marginBottom: 12 }}>{r.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 6, lineHeight: 1.4, paddingRight: 16 }}>
                {lang === "hi" ? r.titleHi : r.title}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>{r.duration}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ padding: "3px 10px", background: TYPE_LABELS[r.type]?.bg || "#f1f5f9", color: TYPE_LABELS[r.type]?.color || "#374151", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{r.type}</span>
                <span style={{ padding: "3px 10px", background: "#e0f2fe", color: "#0369a1", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{r.tag}</span>
                {r.lang.includes("hi") && <span style={{ padding: "3px 8px", background: "#f0fdf4", color: "#166534", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>हिंदी</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}