import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "This could've been a bio — Lộc",
  description: "Bình thường thì quá nhàm chán, nên tôi tạo ra cái này.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
