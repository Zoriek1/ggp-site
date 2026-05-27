import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // O <html lang> é definido em [lang]/layout.tsx via <head> e atributo via dangerously,
  // mas Next exige um <html> aqui. O middleware garante que sempre estamos em /<lang>/...
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
