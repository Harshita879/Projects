// RootLayout.tsx
'use client'
import { useEffect, useState } from 'react';

import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoginPage, setIsLoginPage] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
      setIsLoginPage(
        location.pathname === '/login' ||
        location.pathname === '/signinvestor' ||
        location.pathname === '/signbusiness' ||
        location.pathname === '/login/verification' ||
        location.pathname === '/signinvestor/verification' ||
        location.pathname === '/signbusiness/verification'
      );
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700&display=swap" />
      </head>
      <body>
        {!(isLoginPage && isMobile) && <Navbar />}
        {children}
      </body>
    </html>
  );
}