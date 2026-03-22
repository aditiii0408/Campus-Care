import { useState, useRef, useEffect } from "react";
import { chatbotAPI } from "../../services/api";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi there 👋 I'm CareBot. I'm here to listen and support you. How are you feeling today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const updated = [...messages, { role: "user", content: userMsg }];
    setMessages(updated);
    setLoading(true);
    try {
      const history = updated.map(m => ({ role: m.role, content: m.content }));
      const res = await chatbotAPI.send(history);
      setMessages([...updated, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", background: "linear-gradient(135deg, #0f766e, #1d4ed8)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>CareBot</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>AI Mental Health Support · Confidential</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, background: "#4ade80", borderRadius: "50%" }}></div>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12, minHeight: 320, maxHeight: 420 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? "linear-gradient(135deg, #0f766e, #1d4ed8)" : "#f1f5f9", color: m.role === "user" ? "#fff" : "#1e293b", fontSize: 14, lineHeight: 1.5 }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "10px 16px", background: "#f1f5f9", borderRadius: "18px 18px 18px 4px", fontSize: 14, color: "#94a3b8" }}>Typing...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Share how you're feeling..."
          style={{ flex: 1, padding: "10px 16px", border: "1.5px solid #e5e7eb", borderRadius: 24, fontSize: 14, outline: "none", fontFamily: "inherit" }}
        />
        <button onClick={send} disabled={loading} style={{ width: 42, height: 42, background: loading ? "#94a3b8" : "linear-gradient(135deg, #0f766e, #1d4ed8)", border: "none", borderRadius: "50%", color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
      </div>
    </div>
  );
}
