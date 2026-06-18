import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/src/lib/site";

export const alt = `${SITE_NAME} - ${SITE_TAGLINE}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#11161d",
          color: "#ece6d9",
          fontFamily: "Arial, sans-serif",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "52%" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
                <path d="M6 14.5L17.8 9.2L29.6 14.5L42 9V33.5L29.6 39L17.8 33.7L6 39V14.5Z" stroke="#4fa89a" strokeWidth="2.7" strokeLinejoin="round" />
                <path d="M17.8 9.2V33.7M29.6 14.5V39" stroke="#4fa89a" strokeWidth="2.7" strokeLinecap="round" />
                <path d="M30 6.5C25.9 6.5 22.6 9.8 22.6 13.8C22.6 19.6 30 26.6 30 26.6C30 26.6 37.4 19.6 37.4 13.8C37.4 9.8 34.1 6.5 30 6.5Z" fill="#11161d" stroke="#4fa89a" strokeWidth="2.7" strokeLinejoin="round" />
                <circle cx="30" cy="13.8" r="2.6" stroke="#4fa89a" strokeWidth="2.3" />
              </svg>
              <div style={{ color: "#ece6d9", fontSize: 30, fontWeight: 800, letterSpacing: 5, textTransform: "uppercase" }}>
                {SITE_NAME}
              </div>
            </div>
            <div style={{ color: "#4fa89a", fontSize: 24, letterSpacing: 4, textTransform: "uppercase" }}>
              {SITE_TAGLINE}
            </div>
            <div style={{ marginTop: 24, fontSize: 86, fontWeight: 800, lineHeight: 0.95 }}>
              {SITE_NAME}
            </div>
            <div style={{ marginTop: 28, color: "#828f9d", fontSize: 30, lineHeight: 1.3 }}>
              Private goals, milestones, sessions, and notes in a local JSON file.
            </div>
          </div>
          <div style={{ color: "#5a6573", fontSize: 22 }}>
            {SITE_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            marginLeft: 56,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 22,
            border: "2px solid #2a3645",
            borderRadius: 28,
            background: "#171f29",
            padding: 34,
          }}
        >
          {[
            ["Active Goals", "04", "#4fa89a"],
            ["Milestones This Week", "08", "#c98a4f"],
            ["Sessions Logged", "32", "#bd7b82"],
          ].map(([label, value, color]) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: `6px solid ${color}`,
                borderRadius: 18,
                background: "#1d2733",
                padding: 26,
              }}
            >
              <div style={{ color: "#828f9d", fontSize: 22, letterSpacing: 3, textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 54, fontWeight: 800 }}>{value}</div>
            </div>
          ))}
          <div style={{ marginTop: "auto", color: "#4fa89a", fontSize: 24 }}>
            No backend. No account. User-owned data.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
