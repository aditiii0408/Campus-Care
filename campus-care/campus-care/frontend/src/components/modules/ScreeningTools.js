import { useState } from "react";

const SCREENS = {
  PHQ9: {
    title: "PHQ-9 Depression Screening",
    subtitle: "Over the last 2 weeks, how often have you been bothered by any of the following?",
    color: "#3b82f6",
    questions: [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself — or that you are a failure",
      "Trouble concentrating on things, such as reading or watching TV",
      "Moving or speaking so slowly others could notice, or being fidgety/restless",
      "Thoughts that you would be better off dead, or of hurting yourself",
    ],
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    scoring: [
      { max: 4,  level: "Minimal",  color: "#10b981", advice: "Your score suggests minimal depression symptoms. Keep up healthy routines." },
      { max: 9,  level: "Mild",     color: "#f59e0b", advice: "Mild symptoms detected. Consider mood journaling and stress management techniques." },
      { max: 14, level: "Moderate", color: "#f97316", advice: "Moderate symptoms. We recommend booking a counselling session for professional support." },
      { max: 19, level: "Moderately Severe", color: "#ef4444", advice: "Please book a session with a counsellor. You deserve support and care." },
      { max: 27, level: "Severe",   color: "#dc2626", advice: "Please reach out to a counsellor immediately. You are not alone — help is available." },
    ],
  },
  GAD7: {
    title: "GAD-7 Anxiety Screening",
    subtitle: "Over the last 2 weeks, how often have you been bothered by the following?",
    color: "#f59e0b",
    questions: [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it is hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid as if something awful might happen",
    ],
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    scoring: [
      { max: 4,  level: "Minimal",  color: "#10b981", advice: "Minimal anxiety. Maintain healthy sleep and exercise habits." },
      { max: 9,  level: "Mild",     color: "#f59e0b", advice: "Mild anxiety present. Breathing exercises and mindfulness can help." },
      { max: 14, level: "Moderate", color: "#f97316", advice: "Moderate anxiety detected. A counselling session would be beneficial." },
      { max: 21, level: "Severe",   color: "#dc2626", advice: "Severe anxiety. Please book a session with one of our counsellors right away." },
    ],
  },
  PSS: {
    title: "PSS-10 Perceived Stress Scale",
    subtitle: "In the last month, how often have you felt or thought a certain way?",
    color: "#8b5cf6",
    questions: [
      "Been upset because of something that happened unexpectedly?",
      "Felt unable to control the important things in your life?",
      "Felt nervous and stressed?",
      "Felt confident about your ability to handle personal problems?",
      "Felt that things were going your way?",
      "Found that you could not cope with all the things you had to do?",
      "Been able to control irritations in your life?",
      "Felt that you were on top of things?",
      "Been angered because of things that happened that were outside your control?",
      "Felt difficulties were piling up so high you could not overcome them?",
    ],
    options: ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"],
    reversed: [3, 4, 6, 7], // 0-indexed — these are scored in reverse
    scoring: [
      { max: 13, level: "Low Stress",      color: "#10b981", advice: "Your stress levels appear manageable. Keep up your coping strategies!" },
      { max: 26, level: "Moderate Stress", color: "#f59e0b", advice: "Moderate stress detected. Consider stress management techniques and regular breaks." },
      { max: 40, level: "High Stress",     color: "#dc2626", advice: "High stress levels detected. Please consider booking a counselling session." },
    ],
  },
};

function Quiz({ screen, onResult }) {
  const [answers, setAnswers] = useState(Array(screen.questions.length).fill(null));
  const allAnswered = answers.every(a => a !== null);

  const score = () => {
    let total = 0;
    answers.forEach((a, i) => {
      const isReversed = screen.reversed?.includes(i);
      total += isReversed ? (screen.options.length - 1 - a) : a;
    });
    const result = screen.scoring.find(s => total <= s.max) || screen.scoring[screen.scoring.length - 1];
    onResult({ score: total, ...result });
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>{screen.subtitle}</p>
      {screen.questions.map((q, qi) => (
        <div key={qi} style={{ background: "#f8fafc", borderRadius: 12, padding: "16px 18px", marginBottom: 12, border: answers[qi] !== null ? `1.5px solid ${screen.color}22` : "1px solid #e5e7eb" }}>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "#1e293b", fontWeight: 600 }}>
            <span style={{ color: screen.color, marginRight: 8 }}>{qi + 1}.</span>{q}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {screen.options.map((opt, oi) => (
              <button key={oi} onClick={() => {
                const updated = [...answers];
                updated[qi] = oi;
                setAnswers(updated);
              }} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${answers[qi] === oi ? screen.color : "#e5e7eb"}`, background: answers[qi] === oi ? screen.color + "18" : "#fff", color: answers[qi] === oi ? screen.color : "#374151", fontSize: 12, fontWeight: answers[qi] === oi ? 700 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={score} disabled={!allAnswered} style={{ marginTop: 8, padding: "12px 28px", background: allAnswered ? `linear-gradient(135deg, ${screen.color}, #1d4ed8)` : "#e5e7eb", color: allAnswered ? "#fff" : "#9ca3af", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: allAnswered ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
        View My Results
      </button>
    </div>
  );
}

function Result({ result, screen, onRetake, onBookSession }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: result.color + "18", border: `3px solid ${result.color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>
        {result.level.includes("Minimal") || result.level.includes("Low") ? "✅" : result.level.includes("Mild") ? "⚠️" : "🚨"}
      </div>
      <h3 style={{ margin: "0 0 4px", fontSize: 20, color: result.color }}>{result.level}</h3>
      <div style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>Score: <strong>{result.score}</strong></div>
      <div style={{ background: result.color + "12", border: `1px solid ${result.color}33`, borderRadius: 12, padding: "14px 20px", marginBottom: 24, textAlign: "left" }}>
        <p style={{ margin: 0, fontSize: 14, color: "#1e293b", lineHeight: 1.6 }}>{result.advice}</p>
      </div>
      <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>
        This screening is not a clinical diagnosis. Please consult a mental health professional for proper assessment.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={onRetake} style={{ padding: "10px 22px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Retake</button>
        {(result.level !== "Minimal" && result.level !== "Low Stress") && (
          <button onClick={onBookSession} style={{ padding: "10px 22px", background: "linear-gradient(135deg, #0f766e, #1d4ed8)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Book a Session →</button>
        )}
      </div>
    </div>
  );
}

export default function ScreeningTools({ onNavigateToBooking }) {
  const [activeScreen, setActiveScreen] = useState(null);
  const [result, setResult]             = useState(null);

  const tools = [
    { key: "PHQ9", icon: "🧠", desc: "9 questions · ~3 min", label: "Depression" },
    { key: "GAD7", icon: "😰", desc: "7 questions · ~2 min", label: "Anxiety" },
    { key: "PSS",  icon: "😤", desc: "10 questions · ~4 min", label: "Stress" },
  ];

  if (activeScreen && result) {
    return (
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb", fontFamily: "'Calibri', sans-serif" }}>
        <button onClick={() => { setActiveScreen(null); setResult(null); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, marginBottom: 16, fontFamily: "inherit" }}>← Back to tools</button>
        <h3 style={{ margin: "0 0 20px", fontSize: 17, color: "#0f172a" }}>{SCREENS[activeScreen].title}</h3>
        <Result result={result} screen={SCREENS[activeScreen]} onRetake={() => setResult(null)} onBookSession={() => { setActiveScreen(null); setResult(null); if (onNavigateToBooking) onNavigateToBooking(); }} />
      </div>
    );
  }

  if (activeScreen) {
    return (
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb", fontFamily: "'Calibri', sans-serif" }}>
        <button onClick={() => { setActiveScreen(null); setResult(null); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, marginBottom: 16, fontFamily: "inherit" }}>← Back to tools</button>
        <h3 style={{ margin: "0 0 4px", fontSize: 17, color: "#0f172a" }}>{SCREENS[activeScreen].title}</h3>
        <Quiz screen={SCREENS[activeScreen]} onResult={setResult} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Calibri', sans-serif" }}>
      <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>ℹ️</span>
        <p style={{ margin: 0, fontSize: 13, color: "#0c4a6e", lineHeight: 1.6 }}>
          These are standardised screening tools used by mental health professionals. They are <strong>not a diagnosis</strong> — they help you understand your current mental state. All responses are private.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {tools.map(t => {
          const s = SCREENS[t.key];
          return (
            <div key={t.key} style={{ background: "#fff", borderRadius: 16, padding: 22, border: "1px solid #e5e7eb", cursor: "pointer", transition: "border 0.2s" }} onClick={() => { setActiveScreen(t.key); setResult(null); }} onMouseEnter={e => e.currentTarget.style.border = `1.5px solid ${s.color}`} onMouseLeave={e => e.currentTarget.style.border = "1px solid #e5e7eb"}>
              <div style={{ fontSize: 34, marginBottom: 12 }}>{t.icon}</div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 700, letterSpacing: "0.5px", marginBottom: 4 }}>{t.label.toUpperCase()}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>{s.title.replace(" Screening", "").replace(" Scale", "")}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>{t.desc}</div>
              <button style={{ width: "100%", padding: "9px 0", background: s.color + "12", color: s.color, border: `1.5px solid ${s.color}33`, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Start Screening →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
