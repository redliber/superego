import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import localFont from 'next/font/local'

import "./globals.css";
import { SWRConfig } from "swr";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json())


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SWRConfig 
      // value={{fetcher: fetcher}}
    >
      <html>
        <body
          className={`${mainFont.className} ${gothicExtended.variable} antialiased`}
        >
            {children}
        </body>
      </html>
    </SWRConfig>
  );
}
