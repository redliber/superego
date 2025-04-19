import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import localFont from 'next/font/local'

import "./globals.css";

const mainFont = Space_Grotesk({
  subsets: ["latin"],
});

const gothicExtended = localFont({
  src: '../../public/fonts/SpecialGothicExpandedOne-Regular.ttf',
  variable: '--font-gothic'
})

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
        className={`${mainFont.className} ${gothicExtended.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
