import { useState, useEffect } from "react";
import { resetPassword } from "../lib/api";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
    else setAlert({ type: "error", msg: "Invalid reset link." });
  }, []);

  const handleReset = async () => {
    setAlert(null);
    if (!password || password.length < 6) return setAlert({ type: "error", msg: "Password must be at least 6 characters." });
    if (password !== confirm) return setAlert({ type: "error", msg: "Passwords do not match." });
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (e: any) {
      setAlert({ type: "error", msg: e.response?.data?.message || "Reset failed. Link may have expired." });
    } finally { setLoading(false); }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a14 0%, #0f0f1e 40%, #12101a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "420px", maxWidth: "calc(100vw - 32px)", background: "rgba(18,18,28,0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "40px", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginBottom: "24px" }}>
            <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>TaskFlow</span>
          </div>

          <h2 style={{ textAlign: "center", color: "#fff", margin: "0 0 6px", fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 700 }}>
            {done ? "Password Reset! 🎉" : "Set New Password"}
          </h2>
          <p style={{ textAlign: "center", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", marginBottom: "28px", color: "#707088" }}>
            {done ? "Your password has been updated." : "Enter your new password below"}
          </p>

          {alert && (
            <div style={{ padding: "11px 14px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", fontFamily: "'DM Sans', sans-serif", background: alert.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", border: `1px solid ${alert.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`, color: alert.type === "error" ? "#fca5a5" : "#86efac" }}>
              {alert.type === "error" ? "⚠️" : "✅"} {alert.msg}
            </div>
          )}

          {!done ? (
            <>
              {["New Password", "Confirm Password"].map((label, i) => (
                <div key={label} style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#a0a0b0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'DM Sans', sans-serif" }}>{label}</label>
                  <input
                    type="password"
                    value={i === 0 ? password : confirm}
                    onChange={e => i === 0 ? setPassword(e.target.value) : setConfirm(e.target.value)}
                    placeholder="Min. 6 characters"
                    style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f0f0f0", fontSize: "15px", fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                  />
                </div>
              ))}
              <button
                onClick={handleReset}
                disabled={loading}
                style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #f97316, #ea580c)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "15px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "⏳ Resetting..." : "Reset Password"}
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
              <a href="/" style={{ display: "block", padding: "14px", background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: "12px", color: "#fff", fontSize: "15px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textDecoration: "none", textAlign: "center" }}>
                Go to Sign In
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
