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
