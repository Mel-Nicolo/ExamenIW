import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "./provider";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <Provider>
        <body className="relative min-h-screen">
          <Navbar />
          {children}
        </body>
      </Provider>
    </html>
  );
}