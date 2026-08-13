import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { QueryProvider } from "@/components/providers";
import { defaultMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/queries/public";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSettings();
    return defaultMetadata(settings);
  } catch {
    return defaultMetadata(null);
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable}`}>
      <body className="min-h-screen antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
