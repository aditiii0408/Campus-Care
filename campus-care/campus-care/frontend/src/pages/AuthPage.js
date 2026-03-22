import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8,            label: "At least 8 characters" },
  { test: (p) => /[A-Z]/.test(p),          label: "One uppercase letter" },
  { test: (p) => /[a-z]/.test(p),          label: "One lowercase letter" },
  { test: (p) => /[0-9]/.test(p),          label: "One number" },
  { test: (p) => /[^A-Za-z0-9]/.test(p),  label: "One special character (!@#$...)" },
];

function PasswordStrength({ password }) {
  if (!password) return null;
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981"];
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {PASSWORD_RULES.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < passed ? colors[passed - 1] : "#e5e7eb", transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: colors[passed - 1] || "#94a3b8", fontWeight: 600 }}>
          {passed > 0 ? labels[passed - 1] : "Enter a password"}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {PASSWORD_RULES.map((r, i) => (
            <span key={i} style={{ fontSize: 10, color: r.test(password) ? "#10b981" : "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
              {r.test(password) ? "✓" : "○"} {r.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [tab, setTab]           = useState("login");
  const [form, setForm]         = useState({ name: "", email: "", password: "", rollNumber: "", department: "", year: "" });
  const [error, setError]       = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register }     = useAuth();
  const navigate                = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const passwordStrong = () => PASSWORD_RULES.every(r => r.test(form.password));

  const submit = async () => {
    setError(""); setIsSuccess(false); setLoading(true);
    try {
      if (tab === "login") {
        const user = await login(form.email, form.password);
        navigate(user.role === "admin" ? "/admin" : "/dashboard");
      } else {
        if (!form.name || !form.email || !form.password) {
          setError("Name, email and password are required.");
          setLoading(false);
          return;
        }
        if (!passwordStrong()) {
          setError("Please choose a stronger password — meet all 5 requirements below.");
          setLoading(false);
          return;
        }
        // Role is always student — admins are created separately
        await register({ ...form, role: "student" });
        setTab("login");
        setForm({ name: "", email: "", password: "", rollNumber: "", department: "", year: "" });
        setIsSuccess(true);
        setError("Account created successfully! Please sign in.");
      }
    } catch (err) {
      setIsSuccess(false);
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const inputStyle = { width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 13, color: "#374151", fontWeight: 600, display: "block", marginBottom: 6 };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 50%, #ede9fe 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Calibri', 'Segoe UI', sans-serif", padding: "20px 0" }}>
      <div style={{ width: 460, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.12)", overflow: "hidden" }}>

        <div style={{ background: "linear-gradient(135deg, #0f766e, #1d4ed8)", padding: "32px 32px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🌿</div>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 26, fontWeight: 700 }}>Campus Care</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", margin: "6px 0 0", fontSize: 13 }}>Your mental wellness companion</p>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); setIsSuccess(false); }} style={{ flex: 1, padding: 14, border: "none", background: tab === t ? "#fff" : "#f9fafb", color: tab === t ? "#0f766e" : "#6b7280", fontWeight: tab === t ? 700 : 400, fontSize: 14, cursor: "pointer", borderBottom: tab === t ? "2px solid #0f766e" : "none", fontFamily: "inherit" }}>
              {t === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <div style={{ padding: "28px 32px 32px" }}>
          {error && (
            <div style={{ background: isSuccess ? "#f0fdf4" : "#fef2f2", color: isSuccess ? "#166534" : "#dc2626", fontSize: 13, padding: "10px 14px", borderRadius: 8, marginBottom: 16, border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}` }}>
              {error}
            </div>
          )}

          {tab === "register" && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Full Name</label>
                <input name="name" value={form.name} onChange={handle} placeholder="Your full name" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Roll Number</label>
                  <input name="rollNumber" value={form.rollNumber} onChange={handle} placeholder="e.g. A-57" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Year</label>
                  <select name="year" value={form.year} onChange={handle} style={inputStyle}>
                    <option value="">Select year</option>
                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Department</label>
                <input name="department" value={form.department} onChange={handle} placeholder="e.g. Computer Engineering" style={inputStyle} />
              </div>
            </>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email Address</label>
            <input name="email" value={form.email} onChange={handle} placeholder="you@campus.edu" style={inputStyle} />
          </div>

          <div style={{ marginBottom: tab === "register" ? 6 : 20 }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handle}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 44 }}
                onKeyDown={e => e.key === "Enter" && submit()}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8", padding: 0 }}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            {tab === "register" && <PasswordStrength password={form.password} />}
          </div>

          {tab === "register" && (
            <div style={{ marginBottom: 20, padding: "10px 14px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, fontSize: 12, color: "#0369a1", lineHeight: 1.6 }}>
              🎓 Registering as a <strong>Student</strong>. If you are an administrator, please contact the system administrator for access.
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading}
            style={{ width: "100%", padding: 13, background: loading ? "#94a3b8" : "linear-gradient(135deg, #0f766e, #1d4ed8)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {loading ? "Please wait..." : tab === "login" ? "Sign In" : "Create Student Account"}
          </button>
        </div>
      </div>
    </div>
  );
}