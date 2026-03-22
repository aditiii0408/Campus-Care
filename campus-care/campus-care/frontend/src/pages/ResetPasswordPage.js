import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8,           label: "At least 8 characters" },
  { test: (p) => /[A-Z]/.test(p),         label: "One uppercase letter" },
  { test: (p) => /[a-z]/.test(p),         label: "One lowercase letter" },
  { test: (p) => /[0-9]/.test(p),         label: "One number" },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: "One special character" },
];

export default function ResetPasswordPage() {
  const { token }          = useParams();
  const navigate           = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  const colors = ["#ef4444","#f97316","#f59e0b","#84cc16","#10b981"];

  const submit = async () => {
    setError("");
    if (!password || !confirm) { setError("Both fields are required."); return; }
    if (password !== confirm)  { setError("Passwords do not match."); return; }
    if (passed < 5)            { setError("Password does not meet all requirements."); return; }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed. The link may have expired.");
    }
    setLoading(false);
  };

  const inp = { width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 50%, #ede9fe 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Calibri', 'Segoe UI', sans-serif", padding: "20px 0" }}>
      <div style={{ width: 440, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.12)", overflow: "hidden" }}>

        <div style={{ background: "linear-gradient(135deg, #0f766e, #1d4ed8)", padding: "32px 32px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🌿</div>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 24, fontWeight: 700 }}>Reset Password</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", margin: "6px 0 0", fontSize: 13 }}>Campus Care</p>
        </div>

        <div style={{ padding: "28px 32px 32px" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h3 style={{ margin: "0 0 8px", color: "#166534" }}>Password Reset!</h3>
              <p style={{ color: "#64748b", fontSize: 14 }}>Your password has been changed successfully. Redirecting to sign in...</p>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: "#fef2f2", color: "#dc2626", fontSize: 13, padding: "10px 14px", borderRadius: 8, marginBottom: 16, border: "1px solid #fecaca" }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#374151", fontWeight: 600, display: "block", marginBottom: 6 }}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inp, paddingRight: 44 }} />
                  <button onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8", padding: 0 }}>
                    {showPwd ? "🙈" : "👁"}
                  </button>
                </div>
                {password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {PASSWORD_RULES.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < passed ? colors[passed - 1] : "#e5e7eb" }} />)}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {PASSWORD_RULES.map((r, i) => (
                        <span key={i} style={{ fontSize: 10, color: r.test(password) ? "#10b981" : "#94a3b8" }}>
                          {r.test(password) ? "✓" : "○"} {r.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: "#374151", fontWeight: 600, display: "block", marginBottom: 6 }}>Confirm New Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" style={{ ...inp, borderColor: confirm && confirm !== password ? "#ef4444" : "#e5e7eb" }} onKeyDown={e => e.key === "Enter" && submit()} />
                {confirm && confirm !== password && <p style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>Passwords do not match</p>}
              </div>

              <button onClick={submit} disabled={loading} style={{ width: "100%", padding: 13, background: loading ? "#94a3b8" : "linear-gradient(135deg, #0f766e, #1d4ed8)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {loading ? "Resetting..." : "Set New Password"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}