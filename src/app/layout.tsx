import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdventureBuildr AI — Interactive Storytelling Platform",
  description:
    "Create branching narratives with AI. Visual canvas editor, cinematic reader, world bible consistency. The future of interactive fiction.",
  openGraph: {
    title: "AdventureBuildr AI",
    description: "Create branching narratives with AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-white font-body antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
