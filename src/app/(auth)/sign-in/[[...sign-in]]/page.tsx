import { redirect } from "next/navigation";

const hasClerk = !!process.env.CLERK_SECRET_KEY && process.env.CLERK_SECRET_KEY !== "";

export default function SignInPage() {
  if (!hasClerk) {
    redirect("/dashboard");
  }

  // Dynamic require to avoid crash when Clerk is not installed
  const { SignIn } = require("@clerk/nextjs");

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50/30">
      <SignIn />
    </div>
  );
}
