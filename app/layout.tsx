import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kalloosante Chayakkada | കല്ലൂസന്റെ ചായക്കട",
  description:
    "A satirical Malayali comedy character who finds the negative angle in whatever you say. Pure Kottayam tea-shop roast humor.",
  keywords: ["kalloosan", "chayakkada", "malayalam roast", "kerala humor", "manglish"],
  authors: [{ name: "Kalloosante Chayakkada" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>☕</text></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0c0e0d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col antialiased selection:bg-chai-500/30 selection:text-chai-200">
        <div className="kerala-bg-pattern" aria-hidden="true" />
        <div className="relative z-10 flex flex-col flex-1">{children}</div>
      </body>
    </html>
  );
}
