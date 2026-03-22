import { useState, useEffect } from "react";
import { bookingAPI, counsellorAPI } from "../../services/api";

const DISCLAIMER = "All sessions are strictly confidential. Your information will not be shared without your consent. Please be honest so your counsellor can best support you.";

export default function CounsellingBooking() {
  const [counsellors, setCounsellors] = useState([]);
  const [selectedC, setSelectedC]     = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes]             = useState("");
  const [reason, setReason]           = useState("");
  const [myBookings, setMyBookings]   = useState([]);
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(false);
  const [step, setStep]               = useState(1); // 1=choose counsellor, 2=slot+details, 3=confirm

  useEffect(() => {
    
    counsellorAPI.getAll()
  .then(res => setCounsellors(res.data.counsellors))
  .catch(() => setCounsellors([]));

    bookingAPI.getAll()
      .then(res => setMyBookings(res.data.bookings || []))
      .catch(() => {});
  }, []);

  const book = async () => {
    if (!selectedC || !selectedSlot || submitting) return;
    setSubmitting(true);
    try {
      const res = await bookingAPI.create({
        counsellorName: selectedC.name,
        counsellorSpecialty: selectedC.specialty,
        slot: selectedSlot,
        date: new Date().toISOString(),
        notes: `Reason: ${reason}\n${notes}`,
        isAnonymous: false,
      });
      setMyBookings([res.data.booking, ...myBookings]);
      setSelectedC(null); setSelectedSlot(null);
      setNotes(""); setReason(""); setStep(1);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch {}
    setSubmitting(false);
  };

  const cancel = async (id) => {
    await bookingAPI.cancel(id);
    setMyBookings(myBookings.map(b => b._id === id ? { ...b, status: "cancelled" } : b));
  };

  const activeBookings    = myBookings.filter(b => b.status !== "cancelled");
  const cancelledBookings = myBookings.filter(b => b.status === "cancelled");

  const REASONS = ["Academic stress", "Anxiety or worry", "Relationship issues", "Family problems", "Career confusion", "Grief or loss", "Self-esteem", "Other"];

  return (
    <div style={{ fontFamily: "'Calibri', sans-serif" }}>
      {success && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#166534", marginBottom: 3 }}>Session Booked Successfully!</div>
            <div style={{ fontSize: 13, color: "#16a34a" }}>A confirmation email has been sent to you. Your session is confidential and safe.</div>
          </div>
        </div>
      )}

      {/* Disclaimer banner */}
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: "13px 18px", marginBottom: 22, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
        <p style={{ margin: 0, fontSize: 13, color: "#1e40af", lineHeight: 1.6 }}>{DISCLAIMER}</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
        {[{ n: 1, label: "Choose Counsellor" }, { n: 2, label: "Pick Slot & Details" }, { n: 3, label: "Review & Confirm" }].map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: step >= s.n ? "linear-gradient(135deg,#0f766e,#1d4ed8)" : "#e5e7eb", color: step >= s.n ? "#fff" : "#9ca3af", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.n}</div>
              <span style={{ fontSize: 11, color: step >= s.n ? "#0f766e" : "#94a3b8", fontWeight: step >= s.n ? 700 : 400, whiteSpace: "nowrap" }}>{s.label}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > s.n ? "#0f766e" : "#e5e7eb", margin: "0 8px", marginBottom: 18 }}></div>}
          </div>
        ))}
      </div>

      {/* Step 1 — Choose counsellor */}
      {step === 1 && (
        <div>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>Select a counsellor whose specialty aligns with what you're going through.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {counsellors.map(c => (
              <div key={c._id} onClick={() => setSelectedC(c)} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: `2px solid ${selectedC?._id === c._id ? "#0f766e" : "#e5e7eb"}`, cursor: "pointer", transition: "border 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 50, height: 50, background: "linear-gradient(135deg,#0f766e22,#1d4ed822)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#0f766e", flexShrink: 0 }}>
                    {c.avatarInitials || c.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#0f766e", fontWeight: 600 }}>{c.specialty}</div>
                    {c.bio && <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{c.bio}</div>}
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${selectedC?._id === c._id ? "#0f766e" : "#e5e7eb"}`, background: selectedC?._id === c._id ? "#0f766e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {selectedC?._id === c._id && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => selectedC && setStep(2)} disabled={!selectedC} style={{ marginTop: 20, width: "100%", padding: 13, background: selectedC ? "linear-gradient(135deg,#0f766e,#1d4ed8)" : "#e5e7eb", color: selectedC ? "#fff" : "#9ca3af", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: selectedC ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
            Continue →
          </button>
        </div>
      )}

      {/* Step 2 — Slot + details */}
      {step === 2 && (
        <div>
          <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 38, height: 38, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#166534" }}>
              {selectedC?.avatarInitials}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>{selectedC?.name}</div>
              <div style={{ fontSize: 12, color: "#16a34a" }}>{selectedC?.specialty}</div>
            </div>
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 10px" }}>Available Time Slots</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
            {(selectedC?.slots || []).map(slot => (
              <button key={slot} onClick={() => setSelectedSlot(slot)} style={{ padding: "10px 18px", borderRadius: 10, border: `2px solid ${selectedSlot === slot ? "#0f766e" : "#e5e7eb"}`, background: selectedSlot === slot ? "#0f766e" : "#fff", color: selectedSlot === slot ? "#fff" : "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                📅 {slot}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 10px" }}>What brings you here today?</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            {REASONS.map(r => (
              <button key={r} onClick={() => setReason(r)} style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${reason === r ? "#1d4ed8" : "#e5e7eb"}`, background: reason === r ? "#eff6ff" : "#fff", color: reason === r ? "#1d4ed8" : "#374151", fontSize: 12, fontWeight: reason === r ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                {r}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>Anything else you'd like your counsellor to know? <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Feel free to share anything that would help your counsellor prepare..." style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 13, resize: "none", height: 90, boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: 13, background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
            <button onClick={() => selectedSlot && setStep(3)} disabled={!selectedSlot} style={{ flex: 2, padding: 13, background: selectedSlot ? "linear-gradient(135deg,#0f766e,#1d4ed8)" : "#e5e7eb", color: selectedSlot ? "#fff" : "#9ca3af", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: selectedSlot ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
              Review Booking →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 22, marginBottom: 20 }}>
            <h4 style={{ margin: "0 0 16px", fontSize: 15, color: "#0f172a" }}>Booking Summary</h4>
            {[
              { label: "Counsellor",  value: selectedC?.name },
              { label: "Specialty",   value: selectedC?.specialty },
              { label: "Time Slot",   value: selectedSlot },
              { label: "Reason",      value: reason || "Not specified" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", padding: "10px 0", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}>
                <span style={{ width: 120, fontSize: 13, color: "#64748b" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{row.value}</span>
              </div>
            ))}
            {notes && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, fontSize: 13, color: "#475569" }}>{notes}</div>
            )}
          </div>

          <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#78350f" }}>
            📧 A confirmation email will be sent to your registered email address.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, padding: 13, background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← Edit</button>
            <button onClick={book} disabled={submitting} style={{ flex: 2, padding: 13, background: submitting ? "#94a3b8" : "linear-gradient(135deg,#0f766e,#1d4ed8)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {submitting ? "Booking..." : "🔒 Confirm Booking"}
            </button>
          </div>
        </div>
      )}

      {/* My bookings */}
      {activeBookings.length > 0 && (
        <div style={{ marginTop: 32, background: "#fff", borderRadius: 16, padding: 22, border: "1px solid #e5e7eb" }}>
          <h4 style={{ margin: "0 0 14px", fontSize: 15, color: "#0f172a" }}>Your Sessions</h4>
          {activeBookings.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < activeBookings.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <span style={{ fontSize: 22 }}>📅</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{b.counsellorName}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{b.slot} · {b.counsellorSpecialty}</div>
              </div>
              <span style={{ padding: "4px 10px", background: b.status === "confirmed" ? "#f0fdf4" : "#fef9c3", color: b.status === "confirmed" ? "#166534" : "#854d0e", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{b.status}</span>
              {(b.status === "pending" || b.status === "confirmed") && (
             <button onClick={() => cancel(b._id)} style={{ padding: "5px 12px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
             )}
            </div>
          ))}
        </div>
      )}

      {cancelledBookings.length > 0 && (
        <div style={{ marginTop: 16, background: "#f8fafc", borderRadius: 14, padding: "14px 18px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Cancelled Sessions</div>
          {cancelledBookings.map((b, i) => (
            <div key={i} style={{ fontSize: 13, color: "#94a3b8", padding: "4px 0" }}>{b.counsellorName} · {b.slot}</div>
          ))}
        </div>
      )}
    </div>
  );
}
