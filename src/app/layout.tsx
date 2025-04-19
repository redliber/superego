import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const mainFont = Space_Grotesk({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Superego",
  description: "Pomodoro Session Tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body
        className={`${mainFont.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
