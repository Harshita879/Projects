import RectangleComponent from "../components/rectangle-component";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
      <html lang="en">
        <body>
          <main>
            {children}
            <RectangleComponent />
            </main>
        </body>
      </html>
      </>
    );
  }