import { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8,           label: "At least 8 characters" },
  { test: (p) => /[A-Z]/.test(p),         label: "One uppercase letter" },
  { test: (p) => /[a-z]/.test(p),         label: "One lowercase letter" },
  { test: (p) => /[0-9]/.test(p),         label: "One number" },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: "One special character" },
];

export default function ChangePassword() {
  const [form, setForm]     = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  
  const { logout } = useAuth();

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const passed = PASSWORD_RULES.filter(r => r.test(form.newPassword)).length;
  const colors = ["#ef4444","#f97316","#f59e0b","#84cc16","#10b981"];

  const submit = async () => {
    setError(""); setSuccess(false);
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required."); return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match."); return;
    }
    if (passed < 5) {
      setError("New password does not meet all requirements."); return;
    }
    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
          setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
          setTimeout(() => logout(), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password.");
    }
    setLoading(false);
  };

  const inp = { width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit" };
  const lbl = { fontSize: 13, color: "#374151", fontWeight: 600, display: "block", marginBottom: 6 };

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb", fontFamily: "'Calibri', sans-serif", maxWidth: 480 }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>Change Password</h3>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>Choose a strong password to keep your account secure.</p>

      {error && <div style={{ background: "#fef2f2", color: "#dc2626", fontSize: 13, padding: "10px 14px", borderRadius: 8, marginBottom: 16, border: "1px solid #fecaca" }}>{error}</div>}
      {success && <div style={{ background: "#f0fdf4", color: "#166534", fontSize: 13, padding: "10px 14px", borderRadius: 8, marginBottom: 16, border: "1px solid #bbf7d0" }}>✓ Password changed successfully!</div>}

      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Current Password</label>
        <div style={{ position: "relative" }}>
          <input name="currentPassword" type={showCurrent ? "text" : "password"} value={form.currentPassword} onChange={handle} placeholder="••••••••" style={{ ...inp, paddingRight: 44 }} />
          <button onClick={() => setShowCurrent(!showCurrent)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8", padding: 0 }}>
            {showCurrent ? "🙈" : "👁"}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={lbl}>New Password</label>
        <div style={{ position: "relative" }}>
          <input name="newPassword" type={showNew ? "text" : "password"} value={form.newPassword} onChange={handle} placeholder="••••••••" style={{ ...inp, paddingRight: 44 }} />
          <button onClick={() => setShowNew(!showNew)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8", padding: 0 }}>
            {showNew ? "🙈" : "👁"}
          </button>
        </div>
        {form.newPassword && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              {PASSWORD_RULES.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < passed ? colors[passed - 1] : "#e5e7eb" }} />)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {PASSWORD_RULES.map((r, i) => (
                <span key={i} style={{ fontSize: 10, color: r.test(form.newPassword) ? "#10b981" : "#94a3b8" }}>
                  {r.test(form.newPassword) ? "✓" : "○"} {r.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={lbl}>Confirm New Password</label>
        <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handle} placeholder="••••••••" style={{ ...inp, borderColor: form.confirmPassword && form.confirmPassword !== form.newPassword ? "#ef4444" : "#e5e7eb" }} onKeyDown={e => e.key === "Enter" && submit()} />
        {form.confirmPassword && form.confirmPassword !== form.newPassword && (
          <p style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>Passwords do not match</p>
        )}
      </div>

      <button onClick={submit} disabled={loading} style={{ padding: "11px 28px", background: loading ? "#94a3b8" : "linear-gradient(135deg, #0f766e, #1d4ed8)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
        {loading ? "Changing..." : "Change Password"}
      </button>
    </div>
  );
}