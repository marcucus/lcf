import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LCF Auto Performance",
  description: "Garage automobile - Entretien, Réparation, Re-programmation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
