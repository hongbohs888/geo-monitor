import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Login from "./login";
import "../styles.css";

export default function App({ Component, pageProps }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ height: "100vh", background: "#EBF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #007AFF, #5856D6)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 24, color: "#fff", fontWeight: 800 }}>G</span>
          </div>
          <div style={{ fontSize: 16, color: "#718096" }}>加载中...</div>
        </div>
      </div>
    );
  }

  if (!session) return <Login />;

  return <Component {...pageProps} session={session} />;
}
