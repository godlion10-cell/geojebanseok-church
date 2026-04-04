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
  keywords: "반석교회, 거제반석교회, 거제교회, 거제시교회, 연초면교회, 대한예수교장로회, 이주민목사, 거제도교회",
  metadataBase: new URL("https://xn--v69aqqx86a40e24jyrw.com"),
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "JEzC3GCq3zG5hbMts1pdyw7NTD11GJrWJP9yWPB16e4",
    other: {
      "naver-site-verification": "803d43b3d2fbdd442330fbe7cd4330b321f25f35",
    },
  },
  openGraph: {
    title: "거제반석교회 | 은혜 위에 바로 서는 교회",
    description: "대한예수교 장로회 합동측 소속, 거제시 연초면에 위치한 반석교회 홈페이지입니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "거제반석교회",
    url: "https://xn--v69aqqx86a40e24jyrw.com",
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
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5b272f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="반석교회" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registered:', reg.scope);
                  }).catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
