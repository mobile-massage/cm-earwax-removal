import { useState } from "react";
import { supabase } from "./supabase";

export default function ContactForm({ onPrivacyClick }: { onPrivacyClick: () => void }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) { setErrorMsg("Please confirm you have read the privacy policy."); return; }
    setStatus("submitting");
    setErrorMsg("");
    const { error } = await supabase.from("enquiries").insert({
      name: name.trim(),
      contact: contact.trim(),
      message: message.trim(),
    });
    if (error) {
      setStatus("error");
      setErrorMsg("Something went wrong — please try again, or message us directly on WhatsApp.");
    } else {
      setStatus("success");
      setName(""); setContact(""); setMessage("");
    }
  };

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: "2rem", marginBottom: "12px", color: "#2CA9BC" }}>✓</div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1.1rem", color: "#0E5C68", fontWeight: 600 }}>Thanks — your message is on its way!</p>
        <p style={{ fontSize: "0.95rem", color: "#5C7A80", marginTop: "6px" }}>We usually reply within a day.</p>
        <button onClick={() => setStatus("idle")} style={{ marginTop: "20px", background: "none", border: "1px solid #2CA9BC", color: "#0E5C68", padding: "8px 20px", borderRadius: "50px", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem", fontWeight: 600 }}>
          Send another message
        </button>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", border: "1px solid rgba(14,92,104,0.25)", borderRadius: "6px",
    fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: "#0E5C68",
    background: "#F7FBFC", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.7rem", letterSpacing: "2px", color: "#0E5C68",
    fontFamily: "'Manrope', sans-serif", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600,
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div>
        <label style={labelStyle}>Your name</label>
        <input required minLength={2} maxLength={60} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah M." style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Phone or email</label>
        <input required minLength={5} maxLength={100} value={contact} onChange={e => setContact(e.target.value)} placeholder="So we can get back to you" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          required minLength={10} maxLength={600}
          value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Tell us a bit about what you need — which ear, any symptoms, and when suits you"
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <p style={{ fontSize: "0.75rem", color: "#9AB4B9", textAlign: "right", marginTop: "4px" }}>{message.length}/600</p>
      </div>
      <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          style={{ marginTop: "3px", accentColor: "#0E5C68", width: "16px", height: "16px", flexShrink: 0 }}
        />
        <span style={{ fontSize: "0.9rem", color: "#4C6B71", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
          I agree to my details being used to respond to this enquiry, in accordance with the{" "}
          <button type="button" onClick={onPrivacyClick} style={{ background: "none", border: "none", color: "#0E5C68", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", textDecoration: "underline", padding: 0 }}>
            Privacy Policy
          </button>.
        </span>
      </label>
      {errorMsg && <p style={{ fontSize: "0.9rem", color: "#c0392b" }}>{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        style={{ background: "#0E5C68", color: "#fff", border: "none", padding: "14px 32px", borderRadius: "6px", fontFamily: "'Manrope', sans-serif", fontSize: "1rem", fontWeight: 600, cursor: "pointer", letterSpacing: "0.3px", opacity: status === "submitting" ? 0.6 : 1, transition: "opacity 0.2s, background 0.2s", alignSelf: "flex-start" }}
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
