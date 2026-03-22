import { useState, useRef, useEffect } from "react";
import { chatbotAPI } from "../services/api";

const SIZES = {
  normal:  { width: 340, height: 380 },
  tall:    { width: 380, height: 560 },
  large:   { width: 440, height: 680 },
};

export default function FloatingChatbot({ open, setOpen }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi 👋 I'm CareBot. How are you feeling right now?" }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [size, setSize]       = useState("normal");
  const endRef                = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const updated = [...messages, { role: "user", content: userMsg }];
    setMessages(updated);
    setLoading(true);
    try {
      const res = await chatbotAPI.send(updated.map(m => ({ role: m.role, content: m.content })));
      setMessages([...updated, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Sorry, I'm having trouble right now. Please try again." }]);
    }
    setLoading(false);
  };

  const cycleSize = () => {
    setSize(prev => prev === "normal" ? "tall" : prev === "tall" ? "large" : "normal");
  };

  const sizeLabel = { normal: "⬆ Expand", tall: "⬆ Larger", large: "⬇ Shrink" };
  const { width, height } = SIZES[size];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: 28, right: 28,
          width: 58, height: 58,
          background: "linear-gradient(135deg, #0f766e, #1d4ed8)",
          border: "none", borderRadius: "50%", fontSize: 24,
          cursor: "pointer", boxShadow: "0 4px 20px rgba(15,118,110,0.4)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s",
        }}
        title="Open CareBot"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: 100, right: 28,
          width, background: "#fff", borderRadius: 18,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          border: "1px solid #e5e7eb", zIndex: 999,
          display: "flex", flexDirection: "column", overflow: "hidden",
          fontFamily: "'Calibri', sans-serif",
          transition: "width 0.3s, height 0.3s",
        }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #0f766e, #1d4ed8)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>CareBot</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Always here to listen</div>
            </div>
            {/* Size toggle button */}
            <button
              onClick={cycleSize}
              title={sizeLabel[size]}
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "4px 10px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
            >
              {sizeLabel[size]}
            </button>
            <div style={{ width: 8, height: 8, background: "#4ade80", borderRadius: "50%" }}></div>
          </div>

          {/* Messages */}
          <div style={{ overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10, height: height - 130, minHeight: 150 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%", padding: "9px 13px",
                  borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: m.role === "user" ? "linear-gradient(135deg, #0f766e, #1d4ed8)" : "#f1f5f9",
                  color: m.role === "user" ? "#fff" : "#1e293b",
                  fontSize: 13, lineHeight: 1.5,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex" }}>
                <div style={{ padding: "9px 13px", background: "#f1f5f9", borderRadius: "16px 16px 16px 4px", fontSize: 13, color: "#94a3b8" }}>Typing...</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, flexShrink: 0 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Type a message..."
              style={{ flex: 1, padding: "9px 13px", border: "1.5px solid #e5e7eb", borderRadius: 20, fontSize: 13, outline: "none", fontFamily: "inherit" }}
            />
            <button
              onClick={send}
              disabled={loading}
              style={{ width: 36, height: 36, background: loading ? "#94a3b8" : "linear-gradient(135deg, #0f766e, #1d4ed8)", border: "none", borderRadius: "50%", color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontSize: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            >→</button>
          </div>
        </div>
      )}
    </>
  );
}