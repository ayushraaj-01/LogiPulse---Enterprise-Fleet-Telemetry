import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "@/styles/globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LogiPulse | Enterprise Logistics & Fleet Management Platform",
    template: "%s | LogiPulse",
  },
  description:
    "Next-generation unified platform for live vehicle tracking, AI multi-stop route optimization, driver safety scorecards, automated maintenance, and customer delivery portals.",
  keywords: [
    "fleet management",
    "logistics software",
    "vehicle tracking",
    "route optimization",
    "telemetry",
    "dispatch software",
    "proof of delivery",
  ],
  authors: [{ name: "LogiPulse Systems" }],
  creator: "LogiPulse Systems",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://logipulse.io",
    title: "LogiPulse | Enterprise Fleet Telemetry & Smart Dispatch",
    description:
      "Sub-second live vehicle telemetry, automated dispatching, and turn-by-turn route optimization.",
    siteName: "LogiPulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "LogiPulse | Enterprise Logistics Platform",
    description:
      "Unified dispatch, live tracking, and driver management for modern high-velocity fleets.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${heading.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            theme="system"
            toastOptions={{
              className: "font-sans text-sm",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
