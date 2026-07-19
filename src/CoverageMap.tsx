import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Centred on Bentley, Hampshire (GU10 5LH), just over a 10 mile radius
const BENTLEY_CENTER: [number, number] = [51.1905, -0.8786];

// Towns within ~12 miles of Bentley
const TOWNS: { name: string; pos: [number, number] }[] = [
  { name: "Bentley", pos: [51.1905, -0.8786] },
  { name: "Farnham", pos: [51.2152, -0.7985] },
  { name: "Alton", pos: [51.1489, -0.9758] },
  { name: "Odiham", pos: [51.2496, -0.9347] },
  { name: "Bordon", pos: [51.1091, -0.8593] },
  { name: "Haslemere", pos: [51.0876, -0.7098] },
  { name: "Liphook", pos: [51.0718, -0.8003] },
  { name: "Hindhead", pos: [51.1133, -0.7333] },
  { name: "Aldershot", pos: [51.2494, -0.7630] },
  { name: "Fleet", pos: [51.2829, -0.8316] },
];

export default function CoverageMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || instanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: BENTLEY_CENTER,
      zoom: 11,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 14,
    }).addTo(map);

    // Coverage circle — just over 10 miles (12mi / ~19.3km) radius from Bentley
    L.circle(BENTLEY_CENTER, {
      radius: 19312,
      color: "#0E5C68",
      weight: 2,
      fillColor: "#2CA9BC",
      fillOpacity: 0.12,
    }).addTo(map);

    // Town markers (small dot + label)
    const dotIcon = L.divIcon({
      className: "",
      html: `<div style="width:8px;height:8px;border-radius:50%;background:#2CA9BC;border:1.5px solid #0E5C68;"></div>`,
      iconSize: [8, 8],
      iconAnchor: [4, 4],
    });

    TOWNS.forEach(({ name, pos }) => {
      L.marker(pos, { icon: dotIcon })
        .addTo(map)
        .bindTooltip(name, {
          permanent: true,
          direction: "top",
          offset: [0, -6],
          className: "coverage-label",
        });
    });

    instanceRef.current = map;
    return () => { map.remove(); instanceRef.current = null; };
  }, []);

  return (
    <>
      <style>{`
        .leaflet-container { font-family: 'Inter', sans-serif; }
        .coverage-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-family: 'Manrope', sans-serif !important;
          font-size: 0.7rem !important;
          color: #0E5C68 !important;
          font-weight: 600 !important;
          letter-spacing: 0.3px !important;
          white-space: nowrap !important;
        }
        .coverage-label::before { display: none !important; }
        .leaflet-attribution-flag { display: none !important; }
      `}</style>
      <div ref={mapRef} style={{ height: "420px", width: "100%", borderRadius: "6px", overflow: "hidden" }} />
    </>
  );
}
