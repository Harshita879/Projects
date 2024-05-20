"use client";
import LoginFooter from "@/components/LoginFooter/loginfooter";
import Navbar from "@/components/Navbar/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700&display=swap" />
      </head>
      <body>
        <Navbar /> {/* Include the Navbar component here */}
        {children}
        <LoginFooter /> {/* Assuming this is also part of your layout */}
      </body>
    </html>
  );
}
