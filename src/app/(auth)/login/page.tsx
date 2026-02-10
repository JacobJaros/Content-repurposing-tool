import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - ContentForge",
  description: "Sign in to your ContentForge account",
};

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Login</h1>
      {/* Auth implementation will go here */}
    </div>
  );
}
