"use client";
import LoginFooter from "@/components/LoginFooter/loginfooter";
import Navbar from "@/components/Navbar/Navbar";
import { useState, useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust the breakpoint as needed
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700&display=swap" />
      </head>
      <body >
        {!isMobile && <Navbar />}
        {children}
        <LoginFooter />
      </body>
    </html>
  );
}
