import { useEffect, useRef, useState } from "react";
import { supabase, type Review } from "./supabase";

// ── Star components ──────────────────────────────────────────────────────────

function Star({ filled, onClick, onHover }: { filled: boolean; onClick?: () => void; onHover?: () => void }) {
  return (
    <svg
      onClick={onClick}
      onMouseEnter={onHover}
      viewBox="0 0 24 24"
      width="28"
      height="28"
      style={{ cursor: onClick ? "pointer" : "default", flexShrink: 0, transition: "transform 0.15s" }}
    >
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill={filled ? "#2CA9BC" : "none"}
        stroke={filled ? "#2CA9BC" : "#2CA9BC"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div
      style={{ display: "flex", gap: "4px" }}
      onMouseLeave={() => setHovered(0)}
      role={onChange ? "radiogroup" : undefined}
      aria-label={onChange ? "Star rating" : undefined}
    >
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          filled={n <= display}
          onClick={onChange ? () => onChange(n) : undefined}
          onHover={onChange ? () => setHovered(n) : undefined}
        />
      ))}
    </div>
  );
}

// ── Review form ──────────────────────────────────────────────────────────────

function ReviewForm({ onSubmitted, onPrivacyClick }: { onSubmitted: () => void; onPrivacyClick: () => void }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setErrorMsg("Please choose a star rating."); return; }
    if (!consent) { setErrorMsg("Please confirm you have read the privacy policy."); return; }
    setStatus("submitting");
    setErrorMsg("");
    const { error } = await supabase.from("reviews").insert({ name: name.trim(), rating, body: body.trim() });
    if (error) {
      setStatus("error");
      setErrorMsg("Something went wrong — please try again.");
    } else {
      setStatus("success");
      setName(""); setRating(0); setBody("");
      onSubmitted();
    }
  };

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: "2rem", marginBottom: "12px", color: "#2CA9BC" }}>✓</div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1.1rem", color: "#0E5C68", fontWeight: 600 }}>Thank you for your review!</p>
        <p style={{ fontSize: "0.95rem", color: "#5C7A80", marginTop: "6px" }}>It means a great deal.</p>
        <button onClick={() => setStatus("idle")} style={{ marginTop: "20px", background: "none", border: "1px solid #2CA9BC", color: "#0E5C68", padding: "8px 20px", borderRadius: "50px", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem", fontWeight: 600 }}>
          Leave another
        </button>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", border: "1px solid rgba(14,92,104,0.25)", borderRadius: "6px",
    fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: "#0E5C68",
    background: "#F7FBFC", outline: "none", transition: "border-color 0.2s",
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div>
        <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "2px", color: "#0E5C68", fontFamily: "'Manrope', sans-serif", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>Your name</label>
        <input
          required minLength={2} maxLength={60}
          value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Sarah M."
          style={inputStyle}
        />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "2px", color: "#0E5C68", fontFamily: "'Manrope', sans-serif", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "2px", color: "#0E5C68", fontFamily: "'Manrope', sans-serif", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>Your review</label>
        <textarea
          required minLength={10} maxLength={500}
          value={body} onChange={e => setBody(e.target.value)}
          placeholder="Tell others about your experience..."
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <p style={{ fontSize: "0.75rem", color: "#9AB4B9", textAlign: "right", marginTop: "4px" }}>{body.length}/500</p>
      </div>
      <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          style={{ marginTop: "3px", accentColor: "#0E5C68", width: "16px", height: "16px", flexShrink: 0 }}
        />
        <span style={{ fontSize: "0.9rem", color: "#4C6B71", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
          I agree that my name, rating and review may be displayed publicly on this website in accordance with the{" "}
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
        {status === "submitting" ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

// ── Review card ──────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(14,92,104,0.15)", borderRadius: "10px", padding: "28px 26px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <StarRating value={review.rating} />
      <p style={{ fontSize: "1rem", color: "#24424C", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
        "{review.body}"
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.9rem", color: "#0E5C68", fontWeight: 600 }}>{review.name}</p>
        <p style={{ fontSize: "0.75rem", color: "#9AB4B9", fontFamily: "'Inter', sans-serif" }}>{date}</p>
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export default function Reviews({ onPrivacyClick }: { onPrivacyClick: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    setReviews(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const recentReviews = reviews.filter(r => new Date(r.created_at) >= cutoff);


  return (
    <section id="reviews" style={{ padding: "88px 0", background: "#EAF4F5" }}>
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "3px", color: "#0E5C68", fontFamily: "'Manrope', sans-serif", marginBottom: "16px", textTransform: "uppercase", fontWeight: 700 }}>Client Experiences</p>
          <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem, 5vw, 2.7rem)", color: "#0E5C68" }}>
            Reviews
          </h2>
          <div style={{ width: "36px", height: "2px", background: "#2CA9BC", margin: "18px auto 0" }} />
          {avgRating && (
            <div style={{ marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              <StarRating value={Math.round(Number(avgRating))} />
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1.1rem", color: "#0E5C68" }}>
                {avgRating}{" "}
                <button
                  onClick={() => setShowAll(v => !v)}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#0E5C68", fontFamily: "'Manrope', sans-serif", fontSize: "1.1rem", fontWeight: 500, textDecoration: "underline", textUnderlineOffset: "3px" }}
                >
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Review display */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#9AB4B9", fontFamily: "'Inter', sans-serif" }}>Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9AB4B9", fontFamily: "'Inter', sans-serif", marginBottom: "40px" }}>No reviews yet — be the first!</p>
      ) : recentReviews.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9AB4B9", fontFamily: "'Inter', sans-serif", marginBottom: "40px" }}>No recent reviews.</p>
      ) : showAll ? (
        /* All reviews grid */
        <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px" }}>
            {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <button
              onClick={() => setShowAll(false)}
              style={{ background: "none", border: "1px solid #2CA9BC", color: "#0E5C68", padding: "10px 28px", borderRadius: "50px", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem", letterSpacing: "0.3px", fontWeight: 600 }}
            >
              Show less
            </button>
          </div>
        </div>
      ) : (
        /* CSS marquee carousel */
        <div style={{
          overflow: "hidden", paddingBottom: "16px",
          maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}>
          <style>{`
            @keyframes marquee {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .reviews-track {
              display: flex;
              gap: 20px;
              width: max-content;
              animation: marquee ${recentReviews.length * 4}s linear infinite;
            }
            .reviews-track:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="reviews-track" ref={scrollRef}>
            {[...recentReviews, ...recentReviews].map((r, i) => (
              <div key={`${r.id}-${i}`} style={{ width: "300px", flexShrink: 0 }}>
                <ReviewCard review={r} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave a review */}
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ background: "#fff", border: "1px solid rgba(14,92,104,0.15)", borderRadius: "10px", padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", padding: 0 }}
            aria-expanded={showForm}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1.15rem", color: "#0E5C68", fontWeight: 600 }}>Leave a Review</h3>
              <span style={{ color: "#2CA9BC", fontSize: "1.4rem", transition: "transform 0.3s", display: "inline-block", transform: showForm ? "rotate(45deg)" : "none" }}>+</span>
            </div>
          </button>
          {showForm && (
            <div style={{ marginTop: "28px" }}>
              <ReviewForm onSubmitted={() => { load(); }} onPrivacyClick={onPrivacyClick} />
            </div>
          )}
        </div>
      </div>

    </section>
  );
}
