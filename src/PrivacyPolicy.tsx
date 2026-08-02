import { useEffect, useRef } from "react";

export default function PrivacyPolicy({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, []);

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ marginBottom: "28px" }}>
      <p style={{ fontSize: "0.7rem", letterSpacing: "2px", color: "#0E5C68", fontFamily: "'Manrope', sans-serif", textTransform: "uppercase", marginBottom: "8px", fontWeight: 700 }}>{title}</p>
      <div style={{ fontSize: "1rem", color: "#24424C", lineHeight: 1.75, fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>{children}</div>
    </div>
  );

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-title"
      style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(6,30,34,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#fff", maxWidth: "600px", width: "100%", maxHeight: "88vh", overflowY: "auto", borderRadius: "10px", padding: "48px 40px", position: "relative", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}
      >
        <button ref={closeRef} onClick={onClose} aria-label="Close privacy policy" style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#5C7A80", fontSize: "1.4rem", padding: "8px 12px", minWidth: "44px", minHeight: "44px" }}>×</button>

        <div style={{ width: "24px", height: "2px", background: "#2CA9BC", marginBottom: "16px" }} />
        <h2 id="privacy-title" style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1.5rem", color: "#0E5C68", fontWeight: 600, marginBottom: "6px" }}>Privacy Policy</h2>
        <p style={{ fontSize: "0.85rem", color: "#9AB4B9", fontFamily: "'Inter', sans-serif", marginBottom: "32px" }}>CM Ear Wax Removal · Last updated August 2026</p>

        {section("Who we are", <p>CM Ear Wax Removal is a sole-trader ear health practice operated by Cristiana Mamularu, providing mobile microsuction and ear irrigation visits across Bentley, Hampshire and the surrounding area. This policy explains what personal data we collect through this website and how we use it.</p>)}

        {section("What data we collect", <>
          <p style={{ marginBottom: "10px" }}>When you submit a review through this website we collect your <strong>name</strong>, <strong>star rating</strong>, <strong>review text</strong> and the <strong>date and time</strong> of submission.</p>
          <p style={{ marginBottom: "10px" }}>When you submit an enquiry or booking request, we collect your <strong>name</strong>, the <strong>phone number or email</strong> you provide so we can respond, and your <strong>message</strong> — which may include details about your ear health needs.</p>
          <p>We do not collect your IP address or any other identifying information beyond what you choose to enter into these forms.</p>
        </>)}

        {section("How we use it", <p>Reviews (name and review text) are displayed publicly on this website so that other visitors can read about client experiences. Enquiry form submissions are used only to respond to your booking request or question, and are visible only to Cristiana. We do not use your data for marketing, share it with third parties, or use it for any purpose beyond these two uses.</p>)}

        {section("Where it is stored", <p>Review and enquiry data is stored securely in a database provided by <strong>Supabase</strong> (Supabase Inc.), hosted in the <strong>United Kingdom</strong> (London, eu-west-2 region). Supabase is GDPR-compliant and does not use your data for its own purposes. You can read their privacy policy at <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#0E5C68" }}>supabase.com/privacy</a>.</p>)}

        {section("Cookies & local storage", <>
          <p style={{ marginBottom: "10px" }}>This website does not use cookies for advertising, tracking or analytics, and no cookie consent banner is shown because none are needed for those purposes.</p>
          <p style={{ marginBottom: "10px" }}>The admin panel, used only by Cristiana to manage reviews and enquiries, uses your browser's <strong>local storage</strong> — not a cookie — to keep the admin session signed in between visits. This is essential to the admin login working and is never used to track visitors to the public site.</p>
          <p>The coverage map on this page loads map tiles from <strong>OpenStreetMap</strong>. This means your browser makes a direct request to their servers, which may set their own cookies as part of serving those tiles — this is outside our control. See <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" style={{ color: "#0E5C68" }}>OpenStreetMap's privacy policy</a> for details.</p>
        </>)}

        {section("How long we keep it", <p>Reviews are kept for as long as this website is active. Enquiry messages are kept only as long as needed to respond to your request, and are deleted once actioned. If you would like your review or enquiry removed sooner, please contact us via WhatsApp, phone or email and we will delete it within 5 working days.</p>)}

        {section("Your rights", <>
          <p style={{ marginBottom: "10px" }}>Under UK GDPR you have the right to:</p>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <li><strong>Access</strong> the personal data we hold about you</li>
            <li><strong>Rectify</strong> inaccurate data</li>
            <li><strong>Erase</strong> your data ("right to be forgotten")</li>
            <li><strong>Object</strong> to processing</li>
          </ul>
          <p style={{ marginTop: "10px" }}>To exercise any of these rights, please message us on WhatsApp, phone or email.</p>
        </>)}

        {section("Legal basis", <p>We process review data on the basis of your <strong>consent</strong>, given when you tick the consent checkbox and submit the review form. We process enquiry data on the basis of <strong>legitimate interest</strong> in responding to a request you have initiated. You may withdraw consent for a review, or ask us to delete an enquiry, at any time.</p>)}

        {section("Contact", <p>If you have any questions about this policy or how your data is handled, please get in touch via WhatsApp, phone or email at <a href="mailto:info@cmearwaxremoval.co.uk" style={{ color: "#0E5C68" }}>info@cmearwaxremoval.co.uk</a>. You also have the right to lodge a complaint with the <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: "#0E5C68" }}>Information Commissioner's Office (ICO)</a>.</p>)}
      </div>
    </div>
  );
}
