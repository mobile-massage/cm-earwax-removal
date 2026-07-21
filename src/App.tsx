import { useCallback, useEffect, useRef, useState } from "react";

import "./fonts/fonts.css";
import "./hero.css";
import CoverageMap from "./CoverageMap";
import Reviews from "./Reviews";
import ContactForm from "./ContactForm";
import PrivacyPolicy from "./PrivacyPolicy";

const TEAL = "#0E5C68";
const AQUA = "#2CA9BC";
const TEXT = "#24424C";
const MUTED = "#5C7A80";

const services = [
  {
    name: "Microsuction",
    image: "service-microsuction.jpg",
    description: "Gentle, dry removal of wax under magnified vision using a medical-grade suction device — no water involved.",
    prices: [{ duration: "Both ears", price: "TBC" }],
    info: {
      origin: "Developed within ENT departments in the second half of the 20th century as a refinement of ear care carried out under an operating microscope.",
      history: "Before microsuction, ear syringing — flushing the canal with water — was the standard approach, first described as a dedicated syringe technique by the French otologist Jean Marc Gaspard Itard in 1821, itself building on wax-removal methods recorded as far back as the 1st century AD. Microsuction developed later as ENT specialists adapted binocular microscopes and medical suction units to remove wax and debris under direct vision rather than by flushing. Over the past decade it has become the preferred method across NHS and private ear care, valued for being drier, more precise and generally better tolerated than irrigation.",
      intro: "Microsuction uses gentle, controlled suction under bright, magnified vision to lift wax directly out of the ear canal. Because no water or fluid is involved, it's widely considered one of the safest and most comfortable ways to clear a blockage — including for people who are prone to ear infections, or who have a perforated eardrum or grommets.",
      benefits: [
        "No water used, so a lower infection risk than irrigation",
        "Precise, magnified view means only the wax is disturbed",
        "Can be suitable even with a perforated eardrum or grommets",
        "Usually the most comfortable method, over in a few minutes",
        "Relieves hearing loss, tinnitus, blocked or itchy ears and dizziness caused by wax build-up",
      ],
      timing: [
        { label: "Before your visit", text: "A few drops of olive or almond oil in the affected ear for several days beforehand softens the wax and makes removal quicker and more comfortable — though it isn't essential, as microsuction can safely remove harder wax too." },
        { label: "After your visit", text: "Most people notice clearer hearing immediately. Keep cotton buds and anything else out of the ear afterwards — that's usually how wax ends up compacted in the first place." },
      ],
      contraindications: [
        "An active outer or middle ear infection",
        "Current or recent ear discharge",
        "Significant ear pain on the day of your visit",
        "Recent ear surgery — please check with us first",
        "A cold, blocked sinuses, or ear pain from air travel in the last 48 hours",
      ],
    },
  },
  {
    name: "Ear Irrigation",
    image: "service-irrigation.jpg",
    description: "A controlled, pulsed flow of warm water safely flushes softened wax from the ear canal using a modern electronic irrigator.",
    prices: [{ duration: "Both ears", price: "TBC" }],
    info: {
      origin: "Ear syringing dates back at least two thousand years — the Roman physician Aulus Cornelius Celsus described flushing the ear canal in the 1st century AD, with the first dedicated syringe technique recorded by French otologist Jean Marc Gaspard Itard in 1821.",
      history: "For most of the 20th century, manual syringing with a metal syringe and considerable hand pressure was the standard treatment for wax build-up. It has since been replaced almost everywhere by electronic irrigation, which delivers a controlled, low-pressure pulsed water jet instead of manual force — greatly reducing the risk of the pain, perforation and dizziness that made old-style syringing unpopular.",
      intro: "Ear irrigation uses a modern electronic irrigator to deliver a gentle, controlled flow of warm water into the ear canal, safely flushing softened wax out. It's a well-established, effective option when wax is soft enough to clear this way, and can be used alongside microsuction where needed.",
      benefits: [
        "Quick and effective once wax has softened",
        "Warm water is gentle and generally very comfortable",
        "A long-established, well-understood technique",
        "Can clear wax from both ears in a single visit",
        "Relieves blocked or itchy ears, muffled hearing and tinnitus caused by wax",
      ],
      timing: [
        { label: "Before your visit", text: "Irrigation works best once wax has been softened first — use olive or almond oil drops for 3–5 days beforehand for the most comfortable and effective result." },
      ],
      contraindications: [
        "A perforated eardrum or grommets (current or in the past)",
        "An active or recent (within 12 months) ear infection or discharge",
        "Previous problems with irrigation, such as pain, perforation or dizziness",
        "Any history of ear surgery",
        "Only one hearing ear",
      ],
    },
  },
  {
    name: "Manual Removal",
    image: "service-manual-removal.jpg",
    description: "Hard or oddly-positioned wax cleared by hand, using fine precision instruments under close magnification.",
    prices: [{ duration: "Both ears", price: "TBC" }],
    info: {
      origin: "A traditional ENT technique using fine instruments such as curettes and micro forceps under direct or magnified vision — it predates both modern microsuction and electronic irrigation.",
      history: "Long before suction devices or electronic irrigators existed, hooking or scraping wax out by hand — using simple curettes — was the only option ear specialists had. The technique never went away: it's still the best answer whenever wax is too hard, sticky or tucked somewhere suction and water can't reach.",
      intro: "When wax is too hard, dry or awkwardly placed for suction or water to shift on their own, fine hand-held instruments do the job instead — worked in carefully while watching closely through magnification. It's often paired with microsuction or irrigation within the same appointment rather than used on its own.",
      benefits: [
        "Effective on hard, dry or fragmented wax that resists suction or water",
        "Highly precise — only the wax is targeted",
        "No water involved",
        "Can be combined with microsuction or irrigation in the same visit",
        "Useful when wax is positioned awkwardly close to the eardrum",
      ],
      timing: [
        { label: "Before your visit", text: "Softening drops can still help, though manual removal is often the right choice specifically because it works well even on hard wax that hasn't been softened." },
      ],
      contraindications: [
        "An active outer or middle ear infection",
        "Significant ear pain on the day of your visit",
        "A perforated eardrum (extra care needed — please let us know beforehand)",
        "Recent ear surgery — please check with us first",
      ],
    },
  },
];

type ExtraSection = { label: string; text?: string; items?: string[] };
type ServiceInfo = {
  origin: string; history: string; benefits: string[]; contraindications: string[];
  intro?: string; timing?: { label: string; text: string }[]; extraSections?: ExtraSection[];
};

const InfoModal = ({ service, onClose }: { service: { name: string; info: ServiceInfo }; onClose: () => void }) => {
  const headingId = `modal-title-${service.name.replace(/\s+/g, "-").toLowerCase()}`;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, []); // onClose is stable via useCallback in parent

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(6,30,34,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
    >
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", maxWidth: "560px", width: "100%", maxHeight: "85vh", overflowY: "auto", borderRadius: "10px", padding: "44px 40px", position: "relative", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
        <button ref={closeRef} onClick={onClose} style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: "1.4rem", lineHeight: 1, padding: "8px 12px", minWidth: "44px", minHeight: "44px" }} aria-label="Close dialog">×</button>

        <div style={{ width: "24px", height: "2px", background: AQUA, marginBottom: "16px" }} />
        <h3 id={headingId} style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1.4rem", color: TEAL, fontWeight: 600, marginBottom: "24px" }}>{service.name}</h3>

        {service.info.intro && (
          <p style={{ fontSize: "1rem", color: TEXT, lineHeight: 1.75, fontFamily: "'Inter', sans-serif", fontWeight: 400, marginBottom: "24px" }}>{service.info.intro}</p>
        )}

        <p style={{ fontSize: "0.7rem", letterSpacing: "2px", color: TEAL, fontFamily: "'Manrope', sans-serif", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Benefits</p>
        <ul style={{ paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
          {service.info.benefits.map((b, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "1rem", color: TEXT, lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
              <span style={{ color: AQUA, marginTop: "2px", flexShrink: 0 }}>—</span>{b}
            </li>
          ))}
        </ul>

        {service.info.timing && (
          <div style={{ borderTop: "1px solid rgba(14,92,104,0.15)", paddingTop: "22px", marginBottom: "22px" }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: "2px", color: TEAL, fontFamily: "'Manrope', sans-serif", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>Before &amp; After</p>
            {service.info.timing.map((t, i) => (
              <div key={i} style={{ marginBottom: "14px" }}>
                <p style={{ fontSize: "0.75rem", color: TEAL, fontFamily: "'Manrope', sans-serif", fontWeight: 700, marginBottom: "4px" }}>{t.label}</p>
                <p style={{ fontSize: "1rem", color: TEXT, lineHeight: 1.75, fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>{t.text}</p>
              </div>
            ))}
          </div>
        )}

        {service.info.extraSections?.map((s, i) => (
          <div key={i} style={{ borderTop: "1px solid rgba(14,92,104,0.15)", paddingTop: "22px", marginBottom: "22px" }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: "2px", color: TEAL, fontFamily: "'Manrope', sans-serif", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>{s.label}</p>
            {s.text && <p style={{ fontSize: "1rem", color: TEXT, lineHeight: 1.75, fontFamily: "'Inter', sans-serif", fontWeight: 400, marginBottom: s.items ? "12px" : 0 }}>{s.text}</p>}
            {s.items && (
              <ul style={{ paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                {s.items.map((item, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "1rem", color: TEXT, lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                    <span style={{ color: AQUA, marginTop: "2px", flexShrink: 0 }}>—</span>{item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div style={{ borderTop: "1px solid rgba(14,92,104,0.15)", paddingTop: "22px" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "2px", color: TEAL, fontFamily: "'Manrope', sans-serif", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Please consult your GP before booking if you have</p>
          <ul style={{ paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            {service.info.contraindications.map((c, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "1rem", color: TEXT, lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                <span style={{ color: AQUA, marginTop: "2px", flexShrink: 0 }}>—</span>{c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const LogoBadge = ({ size = 112 }: { size?: number }) => (
  <img src="logo-badge.png" alt="CM Ear Wax Removal" width={size} height={size} loading="lazy" style={{ display: "block", margin: "0 auto", objectFit: "contain", borderRadius: "50%" }} />
);

const WaIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const WA_NUMBER = "447491024311";

export default function App() {
  useScrollAnimation();
  const [activeInfo, setActiveInfo] = useState<typeof services[0] | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeModal = useCallback(() => setActiveInfo(null), []);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > window.innerHeight * 0.6;
      setScrolled(prev => prev === next ? prev : next);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let currentVersion: string | null = null;
    const check = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`);
        const data = await res.json();
        if (currentVersion === null) { currentVersion = data.v; return; }
        if (data.v !== currentVersion) window.location.reload();
      } catch { /* offline or error — ignore */ }
    };
    check();
    const id = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", backgroundColor: "#F4F9FA", minHeight: "100vh" }}>
      {activeInfo && <InfoModal service={activeInfo} onClose={closeModal} />}
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        .fade-up { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .fade-up.visible { opacity: 1; transform: translateY(0); }

        .service-card { background: #fff; border: 1px solid rgba(14,92,104,0.15); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .service-card:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(14,92,104,0.13); }

        .wa-btn { background: #25D366; color: #fff; display: inline-flex; align-items: center; gap: 10px; padding: 16px 36px; border-radius: 50px; font-size: 1.1rem; font-family: 'Manrope', sans-serif; font-weight: 600; letter-spacing: 0.3px; text-decoration: none; transition: background 0.2s, transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 20px rgba(37,211,102,0.35); }
        .wa-btn:hover { background: #1da851; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(37,211,102,0.45); }

        /* Floating right WA button — desktop only, shown when scrolled past hero */
        .wa-float-left { position: fixed; right: 0; top: 50%; transform: translateY(-50%); z-index: 200; display: flex; flex-direction: column; align-items: center; background: #25D366; color: #fff; text-decoration: none; border-radius: 8px 0 0 8px; padding: 14px 8px 14px 10px; gap: 8px; box-shadow: -3px 0 16px rgba(37,211,102,0.3); transition: background 0.2s, padding 0.2s; }
        .wa-float-left:hover { background: #1da851; padding-left: 14px; }
        .wa-float-left span { writing-mode: vertical-rl; transform: rotate(180deg); font-family: 'Manrope', sans-serif; font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; opacity: 0.9; }
        @media (max-width: 768px) { .wa-float-left { display: none; } }

        /* Mobile WA icon in nav top-left */
        .wa-nav-icon { display: none; align-items: center; justify-content: center; background: #25D366; border-radius: 50%; width: 34px; height: 34px; flex-shrink: 0; }
        @media (max-width: 768px) { .wa-nav-icon { display: flex; } }

        nav a { text-decoration: none; font-family: 'Inter', sans-serif; font-size: 0.95rem; letter-spacing: 0.2px; opacity: 0.85; transition: opacity 0.2s, color 0.4s; }
        nav a:hover { opacity: 1; }
        @media (max-width: 520px) { .nav-hide-sm { display: none; } }
        @media (max-width: 400px) { nav { padding: 14px 16px; } }

        .price-pill { background: #EAF4F5; border: 1px solid rgba(14,92,104,0.2); padding: 6px 14px; border-radius: 50px; font-size: 0.9rem; color: ${TEXT}; font-family: 'Manrope', sans-serif; font-weight: 500; }

        .grid-services { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 24px; }

        .info-btn { background: none; border: 1.5px solid ${AQUA}; color: ${AQUA}; border-radius: 50%; width: 20px; height: 20px; font-size: 0.7rem; font-family: 'Manrope', sans-serif; font-style: italic; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.2s, color 0.2s; vertical-align: middle; padding: 0; line-height: 1; position: relative; }
        .info-btn::before { content: ''; position: absolute; inset: -12px; border-radius: 50%; }
        .info-btn:hover { background: ${AQUA}; color: #fff; }

        /* Circular hero badge — desktop size */
        .hero-badge { width: 200px; height: 200px; }

        @media (max-width: 600px) {
          .grid-services { grid-template-columns: 1fr; }
          .hero-badge { width: 160px; height: 160px; }
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Floating WA button — desktop left side, visible when scrolled past hero */}
      {scrolled && (
        <a href={`https://wa.me/${WA_NUMBER}`} className="wa-float-left" target="_blank" rel="noopener noreferrer" aria-label="Book via WhatsApp">
          <WaIcon size={20} />
          <span>Book</span>
        </a>
      )}

      {/* Navigation */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? "rgba(244,249,250,0.96)" : "rgba(10,45,50,0.55)", backdropFilter: "blur(10px)", borderBottom: scrolled ? "1px solid rgba(14,92,104,0.12)" : "1px solid rgba(255,255,255,0.1)", padding: "15px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "background 0.4s, border-color 0.4s" }}>
        <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: scrolled ? TEAL : "#fff", fontSize: "1.05rem", letterSpacing: "0.2px", transition: "color 0.4s", textDecoration: "none", cursor: "pointer" }}>CM Ear Wax Removal</a>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <a href="#services" className="nav-hide-sm" style={{ color: scrolled ? TEAL : "#fff" }}>Services</a>
          <a href="#coverage" className="nav-hide-sm" style={{ color: scrolled ? TEAL : "#fff" }}>Area</a>
          <a href="#reviews" className="nav-hide-sm" style={{ color: scrolled ? TEAL : "#fff" }}>Reviews</a>
          <a href="#about" className="nav-hide-sm" style={{ color: scrolled ? TEAL : "#fff" }}>About</a>
          <a href="#book" className="nav-hide-sm" style={{ color: scrolled ? TEAL : "#fff" }}>Book</a>
          <a href={`https://wa.me/${WA_NUMBER}`} className="wa-nav-icon" target="_blank" rel="noopener noreferrer" aria-label="Book via WhatsApp">
            <WaIcon size={18} />
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", paddingTop: "80px", paddingBottom: "60px", backgroundSize: "cover", backgroundPosition: "center 30%" }}>
        {/* Clinical teal overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(7,38,43,0.80) 0%, rgba(14,92,104,0.72) 50%, rgba(20,110,124,0.65) 100%)", zIndex: 0 }} />

        <div style={{ textAlign: "center", position: "relative", padding: "0 20px", zIndex: 2 }}>

          {/* Visually hidden — page's primary heading */}
          <h1 style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
            CM Ear Wax Removal — Mobile Microsuction, Ear Irrigation & Manual Removal by Cristiana Mamularu across Hampshire & Surrey, for adult patients
          </h1>

          {/* ── Circular badge logo ── */}
          <div className="hero-badge" style={{ position: "relative", display: "inline-block" }}>
            <img
              src="logo-badge.png"
              alt="CM Ear Wax Removal"
              width={480}
              height={480}
              style={{ display: "block", width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%", filter: "drop-shadow(0 2px 16px rgba(0,0,0,0.5))" }}
            />
          </div>

          <div style={{ marginTop: "18px" }}>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", letterSpacing: "0.5px" }}>CM Ear Wax Removal</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", color: AQUA, letterSpacing: "2px", marginTop: "4px", textTransform: "uppercase" }}>Cristiana Mamularu · Ear Health Practitioner</p>
          </div>

          {/* Tagline */}
          <p style={{ marginTop: "24px", fontSize: "1.15rem", color: "rgba(255,255,255,0.9)", maxWidth: "380px", margin: "24px auto 0", lineHeight: 1.7, fontWeight: 500 }}>
            Ear wax removal, in the comfort of your home.
          </p>
          <p style={{ marginTop: "10px", fontSize: "0.95rem", color: "rgba(255,255,255,0.72)", maxWidth: "420px", margin: "10px auto 0", lineHeight: 1.7 }}>
            Microsuction, ear irrigation &amp; manual removal for adult patients, at private homes, residential homes and care homes.
          </p>

          {/* CTA */}
          <div style={{ marginTop: "36px" }}>
            <a href="#book" className="wa-btn" style={{ fontSize: "1.05rem" }}>
              <WaIcon size={22} /> Book via WhatsApp
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)", textAlign: "center", opacity: 0.55, zIndex: 2 }}>
          <p style={{ fontSize: "0.65rem", letterSpacing: "3px", color: "#fff", fontFamily: "'Manrope', sans-serif", marginBottom: "8px" }}>SCROLL</p>
          <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="1,1 9,9 17,1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: "88px 24px", background: "#fff" }}>
        <div style={{ maxWidth: "980px", margin: "0 auto" }} className="fade-up">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: "3px", color: TEAL, fontFamily: "'Manrope', sans-serif", marginBottom: "16px", textTransform: "uppercase", fontWeight: 700 }}>About</p>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem, 5vw, 2.7rem)", color: TEAL, lineHeight: 1.25 }}>
              Gentle ear care, brought to you
            </h2>
            <div style={{ width: "36px", height: "2px", background: AQUA, margin: "24px auto 0" }} />
          </div>

          <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <div style={{ display: "inline-flex", alignItems: "baseline", gap: "8px", background: "#EAF4F5", border: "1px solid rgba(14,92,104,0.15)", borderRadius: "50px", padding: "10px 22px" }}>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1.15rem", color: TEAL }}>100+</span>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem", color: TEAL, fontWeight: 600 }}>Happy customers</span>
                </div>
              </div>
              <img src="ear-examination.jpg" alt="Close-up of an ear examination using an otoscope" loading="lazy" width={1600} height={1067} style={{ width: "100%", height: "auto", borderRadius: "10px", display: "block", objectFit: "cover" }} />
            </div>
            <div>
              <p style={{ fontSize: "1.1rem", color: TEXT, lineHeight: 1.9, fontWeight: 400 }}>
                I'm Cristiana, a fully trained, qualified and insured Ear Health Practitioner, certified by UK Microsuction. I provide safe, gentle ear wax removal using microsuction, ear irrigation and manual removal — in the comfort of your own home, a residential home or a care home.
              </p>
              <p style={{ fontSize: "1.1rem", color: TEXT, lineHeight: 1.9, fontWeight: 400, marginTop: "18px" }}>
                Every visit is unhurried and explained clearly, with your comfort and safety as the priority — no travel, no waiting rooms, and clearer hearing by the time I leave. I see adult patients of all ages, from younger adults through to elderly residents in care homes.
              </p>
              <p style={{ fontSize: "1.1rem", color: TEXT, lineHeight: 1.9, fontWeight: 400, marginTop: "18px" }}>
                Every visit includes a video otoscope, so your ear appears live on a small screen — you can follow along as the wax is found and cleared.
              </p>
              <div style={{ marginTop: "24px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#EAF4F5", border: "1px solid rgba(14,92,104,0.15)", borderRadius: "50px", padding: "10px 20px" }}>
                  <span style={{ color: AQUA, fontSize: "1.1rem" }}>✓</span>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem", color: TEAL, fontWeight: 600 }}>Fully trained, qualified and insured — Certified by UK Microsuction</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#EAF4F5", border: "1px solid rgba(14,92,104,0.15)", borderRadius: "50px", padding: "10px 20px" }}>
                  <span style={{ color: AQUA, fontSize: "1.1rem" }}>✓</span>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem", color: TEAL, fontWeight: 600 }}>Video otoscope used at every visit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO I WORK WITH ── */}
      <section style={{ padding: "88px 24px", background: "#F4F9FA" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }} className="fade-up">
            <p style={{ fontSize: "0.7rem", letterSpacing: "3px", color: TEAL, fontFamily: "'Manrope', sans-serif", marginBottom: "16px", textTransform: "uppercase", fontWeight: 700 }}>Ways to Book</p>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem, 5vw, 2.7rem)", color: TEAL }}>
              Who I Work With
            </h2>
            <div style={{ width: "36px", height: "2px", background: AQUA, margin: "18px auto 0" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }} className="fade-up">
            <div style={{ background: "#fff", border: "1px solid rgba(14,92,104,0.15)", borderRadius: "10px", padding: "32px", display: "flex", flexDirection: "column" }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1.1rem", color: TEAL, fontWeight: 600, marginBottom: "12px" }}>Private Clients</p>
              <p style={{ fontSize: "0.95rem", color: TEXT, lineHeight: 1.75, marginBottom: "20px" }}>
                One-to-one home visits for adult clients. Book directly via WhatsApp or the enquiry form below — no referral needed, and appointments are arranged around what suits you.
              </p>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" style={{ marginTop: "auto", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "8px", background: "#25D366", color: "#fff", padding: "10px 20px", borderRadius: "50px", fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                <WaIcon size={16} /> WhatsApp
              </a>
            </div>
            <div style={{ background: "#fff", border: "1px solid rgba(14,92,104,0.15)", borderRadius: "10px", padding: "32px", display: "flex", flexDirection: "column" }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1.1rem", color: TEAL, fontWeight: 600, marginBottom: "12px" }}>GP Surgery Patients</p>
              <p style={{ fontSize: "0.95rem", color: TEXT, lineHeight: 1.75, marginBottom: "20px" }}>
                Many GP surgeries no longer offer ear wax removal on the NHS, or have long waits for it — it was dropped from the standard GP contract in many areas some years ago. You don't need a referral to book with me directly; if I find anything beyond straightforward wax build-up, I'll always point you back to your GP or an ENT specialist.
              </p>
              <a href="#contact" style={{ marginTop: "auto", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: `1.5px solid ${TEAL}`, color: TEAL, padding: "9px 20px", borderRadius: "50px", fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                Send an Enquiry
              </a>
            </div>
            <div style={{ background: "#fff", border: "1px solid rgba(14,92,104,0.15)", borderRadius: "10px", padding: "32px", display: "flex", flexDirection: "column" }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1.1rem", color: TEAL, fontWeight: 600, marginBottom: "12px" }}>Retirement &amp; Care Homes</p>
              <p style={{ fontSize: "0.95rem", color: TEXT, lineHeight: 1.75, marginBottom: "20px" }}>
                Visits arranged directly with home managers or family members, seeing several residents in a single trip. A calm, unhurried approach that works well for residents with mobility challenges, memory conditions, or anyone who finds a trip to a clinic difficult.
              </p>
              <a href="#contact" style={{ marginTop: "auto", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: `1.5px solid ${TEAL}`, color: TEAL, padding: "9px 20px", borderRadius: "50px", fontFamily: "'Manrope', sans-serif", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                Send an Enquiry
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY IT MATTERS ── */}
      <section style={{ padding: "72px 24px", background: "#0E5C68" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }} className="fade-up">
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: "3px", color: AQUA, fontFamily: "'Manrope', sans-serif", marginBottom: "16px", textTransform: "uppercase", fontWeight: 700 }}>Why It Matters</p>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "clamp(1.7rem, 4.5vw, 2.3rem)", color: "#fff" }}>
              More than just a blocked ear
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "28px" }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1rem", color: "#fff", fontWeight: 600, marginBottom: "10px" }}>Hearing aid users</p>
              <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.78)", lineHeight: 1.75 }}>
                Hearing aid moulds and the natural ageing process both increase wax build-up — a common cause of whistling, feedback and muffled performance. Regular checks help keep hearing aids working as they should.
              </p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "28px" }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1rem", color: "#fff", fontWeight: 600, marginBottom: "10px" }}>Hearing &amp; healthy ageing</p>
              <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.78)", lineHeight: 1.75 }}>
                Hearing loss is recognised as one of the most significant modifiable risk factors for dementia, and research shows treating it can meaningfully reduce that risk. Keeping ears clear is a simple part of looking after long-term hearing health — especially for older relatives.
              </p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "28px" }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1rem", color: "#fff", fontWeight: 600, marginBottom: "10px" }}>Tinnitus &amp; dizziness</p>
              <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.78)", lineHeight: 1.75 }}>
                Blocked ears are a common, treatable cause of tinnitus, a feeling of fullness, and dizziness — symptoms that can often be resolved simply by having the wax safely removed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: "88px 24px", background: "#F4F9FA" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }} className="fade-up">
            <p style={{ fontSize: "0.7rem", letterSpacing: "3px", color: TEAL, fontFamily: "'Manrope', sans-serif", marginBottom: "16px", textTransform: "uppercase", fontWeight: 700 }}>Treatments</p>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem, 5vw, 2.7rem)", color: TEAL }}>
              Services &amp; Pricing
            </h2>
            <div style={{ width: "36px", height: "2px", background: AQUA, margin: "18px auto 0" }} />
          </div>

          <div className="grid-services">
            {services.map((service, i) => (
              <div
                key={service.name}
                className="service-card fade-up"
                style={{ padding: 0, borderRadius: "10px", transitionDelay: `${i * 70}ms`, overflow: "hidden" }}
              >
                {service.image && (
                  <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                    <img
                      src={service.image}
                      alt={service.name}
                      loading="lazy"
                      width={800}
                      height={450}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,38,43,0.45) 0%, transparent 50%)" }} />
                  </div>
                )}
                <div style={{ padding: "22px 26px 26px" }}>
                  <div style={{ width: "24px", height: "2px", background: AQUA, marginBottom: "14px" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "1.15rem", color: TEAL, fontWeight: 600 }}>
                      {service.name}
                    </h3>
                    <button className="info-btn" onClick={() => setActiveInfo(service)} aria-label={`About ${service.name}`} title="How it works & benefits">i</button>
                  </div>
                  <p style={{ fontSize: "0.95rem", color: MUTED, lineHeight: 1.75, marginBottom: "18px", fontWeight: 400 }}>
                    {service.description}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {service.prices.map((p) => (
                      <span key={p.duration} className="price-pill">
                        {p.duration} — <strong style={{ color: TEAL, fontWeight: 700 }}>{p.price}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Safety advisory */}
          <div className="fade-up" style={{ marginTop: "24px", background: "#fff", border: "1px solid rgba(14,92,104,0.15)", borderLeft: `3px solid ${AQUA}`, borderRadius: "10px", padding: "32px 36px" }}>
            <p style={{ fontSize: "0.65rem", letterSpacing: "2.5px", color: TEAL, fontFamily: "'Manrope', sans-serif", textTransform: "uppercase", marginBottom: "14px", fontWeight: 700 }}>Before You Book — Please Read</p>
            <p style={{ fontSize: "1.05rem", color: TEXT, lineHeight: 1.85, fontFamily: "'Inter', sans-serif", fontWeight: 400, marginBottom: "22px" }}>
              Resist the urge to clear wax yourself with cotton buds or anything similar — it almost always compacts the wax deeper rather than shifting it, making the blockage harder to treat. Softening drops (olive or almond oil) used for a few days beforehand make any professional removal quicker and more comfortable, though they are not always essential.
            </p>
            <p style={{ fontSize: "0.9rem", color: TEAL, fontFamily: "'Manrope', sans-serif", fontWeight: 600, marginBottom: "14px" }}>
              Please consult your GP before booking if you have any of the following:
            </p>
            <ul style={{ paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
              {["An active ear infection or discharge", "A perforated eardrum or grommets", "Significant ear pain", "Recent ear surgery", "Dizziness or vertigo alongside your symptoms"].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "1rem", color: TEXT, lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                  <span style={{ color: AQUA, marginTop: "2px", flexShrink: 0 }}>—</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── COVERAGE AREA ── */}
      <section id="coverage" style={{ padding: "88px 24px", background: "#fff" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }} className="fade-up">
            <p style={{ fontSize: "0.7rem", letterSpacing: "3px", color: TEAL, fontFamily: "'Manrope', sans-serif", marginBottom: "16px", textTransform: "uppercase", fontWeight: 700 }}>Where I Visit</p>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem, 5vw, 2.7rem)", color: TEAL }}>
              Coverage Area
            </h2>
            <div style={{ width: "36px", height: "2px", background: AQUA, margin: "18px auto 24px" }} />
            <p style={{ fontSize: "1.1rem", color: TEXT, lineHeight: 1.85, fontWeight: 400, maxWidth: "620px", margin: "0 auto" }}>
              Covering <strong style={{ fontWeight: 600, color: TEAL }}>Hampshire and Surrey</strong>, I bring professional ear care directly to your home, residential home or care home. Whether you're in Farnham, Alton, Odiham, Bordon, Haslemere, Liphook, Hindhead, Aldershot, Godalming, Guildford or Winchester — I come to you.
            </p>
            <p style={{ fontSize: "1rem", color: MUTED, lineHeight: 1.8, fontWeight: 400, maxWidth: "560px", margin: "16px auto 0" }}>
              Not sure if you're in range? Just send a message on WhatsApp and I'll confirm.
            </p>
          </div>

          <div className="fade-up" style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(14,92,104,0.15)", boxShadow: "0 4px 24px rgba(14,92,104,0.08)" }}>
            <CoverageMap />
          </div>

          {/* Town chips */}
          <div className="fade-up" style={{ marginTop: "32px", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
            {["Bentley", "Farnham", "Alton", "Odiham", "Bordon", "Haslemere", "Liphook", "Hindhead", "Aldershot", "Godalming", "Guildford", "Winchester"].map(town => (
              <span key={town} style={{ background: "#EAF4F5", border: "1px solid rgba(14,92,104,0.2)", padding: "6px 16px", borderRadius: "50px", fontSize: "0.85rem", color: TEXT, fontFamily: "'Manrope', sans-serif", fontWeight: 500 }}>
                {town}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Reviews onPrivacyClick={() => setShowPrivacy(true)} />

      {/* ── CONTACT / ENQUIRY FORM ── */}
      <section id="contact" style={{ padding: "88px 24px", background: "#F4F9FA" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }} className="fade-up">
            <p style={{ fontSize: "0.7rem", letterSpacing: "3px", color: TEAL, fontFamily: "'Manrope', sans-serif", marginBottom: "16px", textTransform: "uppercase", fontWeight: 700 }}>Get In Touch</p>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "clamp(1.9rem, 5vw, 2.7rem)", color: TEAL }}>
              Send an Enquiry
            </h2>
            <div style={{ width: "36px", height: "2px", background: AQUA, margin: "18px auto 24px" }} />
            <p style={{ fontSize: "1rem", color: MUTED, lineHeight: 1.8, fontWeight: 400 }}>
              Prefer not to use WhatsApp? Send a message here and we'll get back to you directly.
            </p>
          </div>
          <div className="fade-up" style={{ background: "#fff", border: "1px solid rgba(14,92,104,0.15)", borderRadius: "10px", padding: "40px" }}>
            <ContactForm onPrivacyClick={() => setShowPrivacy(true)} />
          </div>
        </div>
      </section>

      {/* ── BOOKING CTA ── */}
      <section id="book" style={{ padding: "96px 24px", background: "linear-gradient(140deg, #073A42 0%, #0E5C68 55%, #146E7C 100%)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="fade-up" style={{ position: "relative" }}>
          <LogoBadge size={80} />
          <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "clamp(2rem, 5vw, 3rem)", color: "#fff", marginTop: "16px", marginBottom: "16px" }}>
            Ready for clearer hearing?
          </h2>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.78)", maxWidth: "460px", margin: "0 auto 40px", lineHeight: 1.8, fontWeight: 400 }}>
            Message me on WhatsApp to check availability and arrange your visit. I'll come to you.
          </p>
          <a href={`https://wa.me/${WA_NUMBER}`} className="wa-btn" target="_blank" rel="noopener noreferrer" style={{ fontSize: "1.15rem", padding: "18px 44px" }}>
            <WaIcon size={26} /> Message on WhatsApp
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#071E22", padding: "40px 24px", textAlign: "center" }}>
        <LogoBadge size={44} />
        <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "1.2rem", color: "#EAF4F5", marginTop: "14px", marginBottom: "6px" }}>
          CM Ear Wax Removal
        </p>
        <p style={{ fontSize: "0.7rem", letterSpacing: "2px", color: "#6C949B", fontFamily: "'Manrope', sans-serif", textTransform: "uppercase" }}>
          Cristiana Mamularu · Ear Health Practitioner
        </p>
        <p style={{ marginTop: "16px", fontSize: "0.75rem", color: "#4C6B71", fontFamily: "'Inter', sans-serif" }}>
          <button onClick={() => setShowPrivacy(true)} style={{ background: "none", border: "none", color: "#4FC3D9", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", textDecoration: "underline", padding: 0 }}>
            Privacy Policy
          </button>
          <span style={{ margin: "0 8px", color: "#33474C" }}>·</span>
          <a href="/admin.html" style={{ color: "#4FC3D9", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", textDecoration: "underline" }}>
            Admin
          </a>
        </p>
        <p style={{ marginTop: "12px", fontSize: "0.7rem", color: "#33474C", fontFamily: "'Inter', sans-serif", letterSpacing: "0.5px" }}>
          &copy; 2026 CM Ear Wax Removal
        </p>
      </footer>
    </div>
  );
}
