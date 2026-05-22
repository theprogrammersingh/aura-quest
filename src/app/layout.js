import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import PWARegistry from "@/components/PWARegistry";
import InstallPrompt from "@/components/InstallPrompt";

export const metadata = {
  title: {
    default: "AuraQuest - Gamified PWA Journal & Mood Analytics",
    template: "%s | AuraQuest"
  },
  description: "Journal your daily reflections, track emotional patterns using advanced Google Gemini AI insights, connect with friends, and level up your mindfulness quest.",
  keywords: ["journaling", "gamified journal", "mood tracker", "AI journal", "mindfulness app", "PWA journal", "emotion analytics", "AuraQuest"],
  authors: [{ name: "AuraQuest Team" }],
  creator: "AuraQuest",
  publisher: "AuraQuest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://auraquest.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AuraQuest - Gamified PWA Journal & Mood Analytics",
    description: "Journal your daily reflections, track emotional patterns using advanced Google Gemini AI insights, connect with friends, and level up your mindfulness quest.",
    url: "https://auraquest.app",
    siteName: "AuraQuest",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AuraQuest Cosmic Gamified AI Journal Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraQuest - Gamified PWA Journal & Mood Analytics",
    description: "Journal your daily reflections, track emotional patterns using advanced Google Gemini AI insights, connect with friends, and level up your mindfulness quest.",
    images: ["/og-image.png"],
    creator: "@auraquest",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AuraQuest",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0b0c16" />
        <link rel="apple-touch-icon" href="/pwa-512x512.svg" />
      </head>
      <body>
        <AuthProvider>
          <PWARegistry />
          <Navbar />
          <main style={{ padding: "0 24px 24px 24px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            {children}
          </main>
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
