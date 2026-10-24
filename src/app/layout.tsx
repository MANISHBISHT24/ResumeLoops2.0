import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResumeLoops — AI-Powered Resume Builder",
  description:
    "Publication-quality resume builder engineered with deterministic ATS scoring and editorial elegance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-warm-ivory text-on-surface antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
