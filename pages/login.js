import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Loader2, ArrowRight, Mail, Lock, User } from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("请填写邮箱和密码"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message === "Invalid login credentials" ? "邮箱或密码错误" : error.message);
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password) { setError("请填写邮箱和密码"); return; }
    if (password.length < 6) { setError("密码至少6位"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name: name || email.split("@")[0] } }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const is = {
    width: "100%", background: "#fff", border: "1px solid #E2E8F0",
    borderRadius: 14, padding: "15px 20px", fontSize: 16, outline: "none",
    color: "#1A202C", marginBottom: 14,
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #EBF4FF 0%, #F0F7FF 50%, #E8F0FE 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif" }}>
      <div style={{ width: 420, maxWidth: "90vw" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, #007AFF, #5856D6)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 8px 32px rgba(0,122,255,0.25)" }}>
            <span style={{ fontSize: 32, color: "#fff", fontWeight: 800 }}>G</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1A202C", margin: "0 0 6px" }}>GEO Monitor</h1>
          <p style={{ fontSize: 16, color: "#718096", margin: 0 }}>AI能见度监控平台</p>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 24, padding: "40px 36px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          {/* Tab */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "#F7FAFC", borderRadius: 12, padding: 4 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "10px", borderRadius: 10, border: "none", fontSize: 15, fontWeight: 600,
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#007AFF" : "#A0AEC0",
                boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
              }}>{m === "login" ? "登录" : "注册"}</button>
            ))}
          </div>

          {mode === "register" && (
            <div style={{ position: "relative", marginBottom: 14 }}>
              <User size={18} style={{ position: "absolute", left: 16, top: 16, color: "#A0AEC0" }} />
              <input value={name} onChange={e => setName(e.target.value)} placeholder="昵称（选填）"
                style={{ ...is, paddingLeft: 44, marginBottom: 0 }} />
            </div>
          )}

          <div style={{ position: "relative", marginBottom: 14 }}>
            <Mail size={18} style={{ position: "absolute", left: 16, top: 16, color: "#A0AEC0" }} />
            <input value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="邮箱地址" type="email"
              style={{ ...is, paddingLeft: 44, marginBottom: 0 }} />
          </div>

          <div style={{ position: "relative", marginBottom: 20 }}>
            <Lock size={18} style={{ position: "absolute", left: 16, top: 16, color: "#A0AEC0" }} />
            <input value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="密码" type="password"
              style={{ ...is, paddingLeft: 44, marginBottom: 0 }}
              onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleRegister())} />
          </div>

          {error && <div style={{ color: "#E53E3E", fontSize: 14, marginBottom: 16, textAlign: "center" }}>{error}</div>}

          <button onClick={mode === "login" ? handleLogin : handleRegister} disabled={loading} style={{
            width: "100%", padding: "15px", borderRadius: 14, border: "none", fontSize: 17, fontWeight: 700,
            background: loading ? "#A0AEC0" : "linear-gradient(135deg, #007AFF, #5856D6)",
            color: "#fff", cursor: loading ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 4px 16px rgba(0,122,255,0.3)",
          }}>
            {loading ? <Loader2 size={18} className="spin" /> : <>{mode === "login" ? "登录" : "注册"} <ArrowRight size={18} /></>}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#A0AEC0", marginTop: 24 }}>
          {mode === "login" ? "还没有账号？" : "已有账号？"}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            style={{ background: "none", border: "none", color: "#007AFF", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            {mode === "login" ? "立即注册" : "去登录"}
          </button>
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}.spin{animation:spin 1s linear infinite;}input::placeholder{color:#A0AEC0;}`}</style>
    </div>
  );
}
