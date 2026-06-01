import { ImageResponse } from "next/og";

export const alt = "GGP — Ensino de Física · UFG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagem de compartilhamento padrão (placeholder bem-feito). Trocar pela arte
// oficial quando disponível — paleta da marca (brand-700) + nome institucional.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #1b3aa0 0%, #0f1f57 100%)",
          color: "#ffffff",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 20,
              background: "#ffffff",
              color: "#1b3aa0",
              fontSize: 60,
              fontWeight: 700,
            }}
          >
            G
          </div>
          <div style={{ fontSize: 30, letterSpacing: 2, opacity: 0.85 }}>GGP</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>
            Grande Grupo de Pesquisa
          </div>
          <div style={{ fontSize: 34, opacity: 0.9, fontFamily: "Arial, sans-serif" }}>
            Pesquisa e educação em Ensino de Física
          </div>
        </div>

        <div style={{ fontSize: 26, opacity: 0.8, fontFamily: "Arial, sans-serif" }}>
          Universidade Federal de Goiás
        </div>
      </div>
    ),
    { ...size },
  );
}
