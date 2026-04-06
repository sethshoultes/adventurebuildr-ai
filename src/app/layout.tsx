import type { Metadata } from "next";
import "./globals.css";

const hasClerk = !!process.env.CLERK_SECRET_KEY && process.env.CLERK_SECRET_KEY !== "";

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

function ClerkWrapper({ children }: { children: React.ReactNode }) {
  // Dynamic import only when Clerk is configured
  const { ClerkProvider } = require("@clerk/nextjs");
  return <ClerkProvider>{children}</ClerkProvider>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <html lang="en">
      <body className="min-h-screen bg-white font-body antialiased">
        {children}
      </body>
    </html>
  );

  if (hasClerk) {
    return <ClerkWrapper>{content}</ClerkWrapper>;
  }

  return content;
}
