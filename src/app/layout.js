import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import PWARegistry from "@/components/PWARegistry";
import InstallPrompt from "@/components/InstallPrompt";

export const metadata = {
  title: "AuraQuest - Gamified PWA Journal & Mood Analytics",
  description: "Journal your daily adventures, track your emotional patterns with AI insights, connect with friends, and level up your mindfulness quest.",
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
