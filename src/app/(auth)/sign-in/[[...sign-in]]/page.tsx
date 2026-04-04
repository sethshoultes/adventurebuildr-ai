import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50/30">
      <SignIn />
    </div>
  );
}
