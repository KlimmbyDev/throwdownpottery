import { ImageResponse } from "next/og";

// Fallback link-preview image for pages without a photo of their own.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#6B3A4A",
          color: "#FDFCF8",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: "#A2B6A1", marginBottom: 24 }}>
          A COLLECTIVE OF ARTISTS
        </div>
        <div style={{ display: "flex", fontSize: 110, fontWeight: 700 }}>
          Throw Down&nbsp;<span style={{ color: "#A2B6A1" }}>Pottery</span>
        </div>
        <div style={{ fontSize: 32, marginTop: 32, color: "#E2B4BD" }}>
          Handcrafted pieces, made to last.
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
