/**
 * src/components/Login.tsx
 * Two-factor auth gate:
 *  1. Gate password (env var) — prevents accidental exposure
 *  2. Supabase Auth (email + password) — actual security layer
 */
import React, { useState } from "react";
import { supabase } from "../lib/supabase";

interface Props { onLogin: () => void; }

export default function Login({ onLogin }: Props) {
  const [step, setStep]         = useState<"gate" | "auth">("gate");
  const [gate, setGate]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleGate = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = import.meta.env.VITE_ADMIN_GATE_PASSWORD as string;
    if (!expected || gate === expected) {
      setStep("auth");
      setError("");
    } else {
      setError("Incorrect access code.");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (import.meta.env.DEV && email === "admin@crewvia.in" && password === "crewvia123") {
      setLoading(false);
      onLogin();
      return;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    onLogin();
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "0.2em", color: "var(--brand-cyan)" }}>
            CREWVIA
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", letterSpacing: "0.12em", marginTop: "4px", textTransform: "uppercase" }}>
            Admin CMS
          </div>
        </div>

        <div className="card" style={{ padding: "28px" }}>
          {step === "gate" ? (
            <>
              <h2 style={{ marginBottom: "6px" }}>Access Code</h2>
              <p style={{ color: "var(--text-dim)", fontSize: "13px", marginBottom: "22px" }}>
                Enter the admin access code to continue.
              </p>
              <form onSubmit={handleGate}>
                <div className="form-group">
                  <label className="form-label">Access Code</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••••••"
                    value={gate}
                    onChange={(e) => setGate(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                {error && <div style={{ color: "var(--brand-yellow)", fontSize: "13px", marginBottom: "12px" }}>{error}</div>}
                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Continue →
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ marginBottom: "6px" }}>Sign In</h2>
              <p style={{ color: "var(--text-dim)", fontSize: "13px", marginBottom: "22px" }}>
                Sign in with your Supabase admin account.
              </p>
              <form onSubmit={handleAuth}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="admin@crewvia.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <div style={{ color: "var(--brand-yellow)", fontSize: "13px", marginBottom: "12px" }}>{error}</div>}
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
                  {loading ? "Signing in…" : "Sign In"}
                </button>
                {import.meta.env.DEV && (
                  <div style={{ marginTop: "12px", padding: "10px", background: "rgba(20, 184, 166, 0.05)", border: "1px dashed rgba(20, 184, 166, 0.2)", borderRadius: "6px", fontSize: "11px", color: "var(--brand-cyan)", lineHeight: "1.4" }}>
                    <strong>Dev Mode Bypass:</strong> You can sign in using <code>admin@crewvia.in</code> and <code>crewvia123</code> to preview the visual design.
                  </div>
                )}
              </form>
              <button
                onClick={() => { setStep("gate"); setError(""); }}
                style={{ display: "block", marginTop: "14px", background: "none", border: "none", color: "var(--text-dim)", fontSize: "12px", cursor: "pointer", textAlign: "center", width: "100%" }}
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
