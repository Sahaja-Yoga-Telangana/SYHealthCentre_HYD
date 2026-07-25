import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Sahaja Yoga Research & Health Centre — Hyderabad",
  description: "Book OPD consultations, day stays, and inpatient accommodation at the Sahaja Yoga Research & Health Centre in Nirmal Nagari, Hyderabad. Treatment through vibratory awareness and Sahaja Yoga meditation.",
  keywords: ["Sahaja Yoga", "Health Centre", "Hyderabad", "Nirmal Nagari", "Vibratory Awareness", "Chakra Therapy", "Meditation"],
  icons: {
    icon: [
      { url: "/icon.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2", type: "image/x-icon" },
    ],
    shortcut: "/icon.png?v=2",
    apple: "/apple-icon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased text-neutral-900 bg-white selection:bg-neutral-900 selection:text-white">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
