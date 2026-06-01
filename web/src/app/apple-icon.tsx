import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Ícone para iOS/iPadOS (home screen). Mesmo lockup do favicon, em PNG.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1b3aa0",
          color: "#ffffff",
          fontSize: 110,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
        }}
      >
        G
      </div>
    ),
    { ...size },
  );
}
