import type { Metadata } from "next";
import { Sora, Spectral } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Catalyst Creations | Build Better Spaces",
  description:
    "Catalyst Creations is a design and construction partner for residential, commercial, and multi-site projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
            className={`${sora.variable} ${spectral.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
