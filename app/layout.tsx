import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "거제반석교회 | 반석 위에 굳게 서는 교회",
  description: "대한예수교 장로회 합동측 소속, 거제시 연초면에 위치한 반석교회입니다. 반석 위에 세워진 공동체로서 예배, 교제, 선교에 힘쓰고 있습니다.",
  keywords: "반석교회, 거제반석교회, 거제교회, 거제시교회, 연초면교회, 대한예수교장로회, 이주민목사",
  openGraph: {
    title: "거제반석교회 | 은혜 위에 바로 서는 교회",
    description: "대한예수교 장로회 합동측 소속, 거제시 연초면에 위치한 반석교회 홈페이지입니다.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
