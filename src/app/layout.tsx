import type { Metadata } from "next";
import { IBM_Plex_Serif, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";
import { PostHogProvider } from "./providers";
import PostHogPageView from "./PostHogPageView";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-brand-serif",
});

export const metadata: Metadata = {
  title: "ForgeBot — Turn Any Object Into a Startup",
  description:
    "Upload a photo of any object and get a full startup in seconds: concept, landing page, marketing campaign, and business plan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "font-sans antialiased",
        inter.variable,
        ibmPlexSerif.variable
      )}
    >
      <body>
        <PostHogProvider>
          <PostHogPageView />
          {children}
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
