import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Session } from "@supabase/supabase-js";

type Review = {
  id: string;
  name: string;
  rating: number;
  body: string;
  created_at: string;
  status: "pending" | "approved" | "declined";
};

type Enquiry = {
  id: string;
  name: string;
  contact: string;
  message: string;
  created_at: string;
  read: boolean;
};

const teal = "#0E5C68";
const aqua = "#2CA9BC";

function Stars({ n }: { n: number }) {
  return (
    <span style={{ color: aqua, fontSize: "1rem" }}>
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </span>
  );
}

function LoginForm({ onLogin: _ }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: "https://cmearwaxremoval.co.uk/auth-confirm.html" },
    });
    if (error) setError(error.message || "Something went wrong — please try again.");
    else setSent(true);
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", border: "1px solid rgba(14,92,104,0.25)",
    borderRadius: "6px", fontSize: "1rem", background: "#F7FBFC",
    color: teal, outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0E2A30", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: "10px", padding: "48px 40px", width: "100%", maxWidth: "380px", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img src="logo-badge.png" width={56} height={56} alt="CM Ear Wax Removal" style={{ display: "block", margin: "0 auto 16px", borderRadius: "50%" }} />
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1.4rem", color: teal, margin: 0 }}>Admin</h1>
          <p style={{ fontSize: "0.8rem", color: "#8FA9AE", marginTop: "6px", letterSpacing: "2px", textTransform: "uppercase" }}>CM Ear Wax Removal</p>
        </div>
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", color: aqua, marginBottom: "16px" }}>✉</div>
            <p style={{ fontFamily: "'Manrope', sans-serif", color: teal, fontSize: "1.05rem", marginBottom: "8px", fontWeight: 600 }}>Check your email</p>
            <p style={{ fontSize: "0.875rem", color: "#8FA9AE", lineHeight: 1.6 }}>A sign-in link has been sent to <strong>{email}</strong>. Click it to access the admin panel.</p>
            <button onClick={() => setSent(false)} style={{ marginTop: "20px", background: "none", border: "none", color: teal, cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline", fontFamily: "'Inter', sans-serif" }}>
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "0.875rem", color: "#8FA9AE", margin: 0, lineHeight: 1.6 }}>Enter your email and we'll send you a sign-in link — no password needed.</p>
            <input type="email" required placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            {error && <p style={{ color: "#c0392b", fontSize: "0.9rem", margin: 0 }}>{error}</p>}
            <button
              type="submit" disabled={loading}
              style={{ background: teal, color: "#fff", border: "none", padding: "13px", borderRadius: "6px", fontSize: "1rem", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontWeight: 600, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Sending…" : "Send sign-in link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ReviewsPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "declined" | "all">("pending");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id: string, status: "approved" | "declined") => {
    setBusy(id);
    await supabase.from("reviews").update({ status, approved: status === "approved" }).eq("id", id);
    setBusy(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setBusy(id);
    await supabase.from("reviews").delete().eq("id", id);
    setBusy(null);
    load();
  };

  const borderColor = (status: string) =>
    status === "approved" ? "#1F8A5A" : status === "declined" ? "#c0392b" : aqua;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 20px", borderRadius: "50px", border: "1px solid",
    borderColor: active ? teal : "rgba(0,0,0,0.15)",
    background: active ? teal : "transparent",
    color: active ? "#fff" : "#666",
    cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Inter', sans-serif",
  });

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
        <button style={tabStyle(filter === "pending")} onClick={() => setFilter("pending")}>Pending</button>
        <button style={tabStyle(filter === "approved")} onClick={() => setFilter("approved")}>Approved</button>
        <button style={tabStyle(filter === "declined")} onClick={() => setFilter("declined")}>Declined</button>
        <button style={tabStyle(filter === "all")} onClick={() => setFilter("all")}>All</button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#999" }}>Loading…</p>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
          <p style={{ fontSize: "2rem", margin: "0 0 12px" }}>✓</p>
          <p style={{ fontFamily: "'Manrope', sans-serif" }}>No {filter === "all" ? "" : filter} reviews</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reviews.map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: `4px solid ${borderColor(r.status)}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <strong style={{ fontFamily: "'Manrope', sans-serif", color: teal }}>{r.name}</strong>
                    <Stars n={r.rating} />
                    <span style={{ fontSize: "0.75rem", color: "#aaa" }}>
                      {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p style={{ color: "#24424C", margin: 0, lineHeight: 1.6 }}>"{r.body}"</p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
                  {r.status !== "approved" && (
                    <button onClick={() => setStatus(r.id, "approved")} disabled={busy === r.id}
                      style={{ background: "#1F8A5A", color: "#fff", border: "none", padding: "8px 18px", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", opacity: busy === r.id ? 0.5 : 1 }}>
                      Approve
                    </button>
                  )}
                  {r.status !== "declined" && (
                    <button onClick={() => setStatus(r.id, "declined")} disabled={busy === r.id}
                      style={{ background: "#fff", color: "#c0392b", border: "1px solid #c0392b", padding: "8px 18px", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", opacity: busy === r.id ? 0.5 : 1 }}>
                      Decline
                    </button>
                  )}
                  <button onClick={() => remove(r.id)} disabled={busy === r.id}
                    style={{ background: "#fff", color: "#999", border: "1px solid #ddd", padding: "8px 18px", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", opacity: busy === r.id ? 0.5 : 1 }}>
                    Delete
                  </button>
                  {r.status === "approved" && <span style={{ fontSize: "0.75rem", color: "#1F8A5A", background: "#E9F6EF", padding: "4px 12px", borderRadius: "50px", whiteSpace: "nowrap", alignSelf: "center" }}>✓ Live</span>}
                  {r.status === "declined" && <span style={{ fontSize: "0.75rem", color: "#c0392b", background: "#fdecea", padding: "4px 12px", borderRadius: "50px", whiteSpace: "nowrap", alignSelf: "center" }}>✗ Declined</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EnquiriesPanel() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"unread" | "all">("unread");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("enquiries").select("*").order("created_at", { ascending: false });
    if (filter === "unread") q = q.eq("read", false);
    const { data } = await q;
    setEnquiries((data as Enquiry[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const markRead = async (id: string) => {
    setBusy(id);
    await supabase.from("enquiries").update({ read: true }).eq("id", id);
    setBusy(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this enquiry permanently?")) return;
    setBusy(id);
    await supabase.from("enquiries").delete().eq("id", id);
    setBusy(null);
    load();
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 20px", borderRadius: "50px", border: "1px solid",
    borderColor: active ? teal : "rgba(0,0,0,0.15)",
    background: active ? teal : "transparent",
    color: active ? "#fff" : "#666",
    cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Inter', sans-serif",
  });

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
        <button style={tabStyle(filter === "unread")} onClick={() => setFilter("unread")}>Unread</button>
        <button style={tabStyle(filter === "all")} onClick={() => setFilter("all")}>All</button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#999" }}>Loading…</p>
      ) : enquiries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
          <p style={{ fontSize: "2rem", margin: "0 0 12px" }}>✓</p>
          <p style={{ fontFamily: "'Manrope', sans-serif" }}>No {filter === "all" ? "" : filter} enquiries</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {enquiries.map(en => (
            <div key={en.id} style={{ background: "#fff", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: `4px solid ${en.read ? "#B7CDD1" : aqua}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <strong style={{ fontFamily: "'Manrope', sans-serif", color: teal }}>{en.name}</strong>
                    <span style={{ fontSize: "0.8rem", color: "#5C7A80" }}>{en.contact}</span>
                    <span style={{ fontSize: "0.75rem", color: "#aaa" }}>
                      {new Date(en.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p style={{ color: "#24424C", margin: 0, lineHeight: 1.6, maxWidth: "500px" }}>{en.message}</p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
                  {!en.read && (
                    <button onClick={() => markRead(en.id)} disabled={busy === en.id}
                      style={{ background: teal, color: "#fff", border: "none", padding: "8px 18px", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", opacity: busy === en.id ? 0.5 : 1 }}>
                      Mark read
                    </button>
                  )}
                  <button onClick={() => remove(en.id)} disabled={busy === en.id}
                    style={{ background: "#fff", color: "#999", border: "1px solid #ddd", padding: "8px 18px", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", opacity: busy === en.id ? 0.5 : 1 }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<"reviews" | "enquiries">("reviews");

  const sectionTabStyle = (active: boolean): React.CSSProperties => ({
    background: "none", border: "none", cursor: "pointer",
    color: active ? "#fff" : "rgba(255,255,255,0.6)",
    fontFamily: "'Manrope', sans-serif", fontSize: "1rem", fontWeight: 600,
    padding: "0", borderBottom: active ? `2px solid ${aqua}` : "2px solid transparent",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F4F9FA" }}>
      <div style={{ background: teal, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="logo-badge.png" width={32} height={32} alt="" style={{ borderRadius: "50%" }} />
            <span style={{ color: "#fff", fontFamily: "'Manrope', sans-serif", fontSize: "1.05rem", fontWeight: 600 }}>CM Ear Wax Removal</span>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <button style={sectionTabStyle(section === "reviews")} onClick={() => setSection("reviews")}>Reviews</button>
            <button style={sectionTabStyle(section === "enquiries")} onClick={() => setSection("enquiries")}>Enquiries</button>
          </div>
        </div>
        <button onClick={onLogout} style={{ background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "6px 16px", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>
          Sign out
        </button>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>
        {section === "reviews" ? <ReviewsPanel /> : <EnquiriesPanel />}
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (checking) return null;
  if (!session) return <LoginForm onLogin={() => supabase.auth.getSession().then(({ data }) => setSession(data.session))} />;
  return <AdminDashboard onLogout={logout} />;
}
