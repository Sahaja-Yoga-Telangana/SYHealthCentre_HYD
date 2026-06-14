import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "International Sahaja Yoga Research & Health Centre — Hyderabad",
  description: "Book OPD consultations, day stays, and inpatient accommodation at the International Sahaja Yoga Research & Health Centre in Nirmal Nagari, Hyderabad. Treatment through vibratory awareness and Sahaja Yoga meditation.",
  keywords: ["Sahaja Yoga", "Health Centre", "Hyderabad", "Nirmal Nagari", "Vibratory Awareness", "Chakra Therapy", "Meditation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
