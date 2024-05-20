import Footer from "@/components/Footer/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
      <html lang="en">
        <body>
          <main>
            {children}
            <Footer />
            </main>
        </body>
      </html>
      </>
    );
  }