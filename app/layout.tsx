import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: "Atlas · Humanity’s Search for Meaning",
  description:
    "A comparative sacred text atlas. Explore primary sources, traditions, timelines and questions with transparent evidence.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
