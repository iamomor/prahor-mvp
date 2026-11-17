import type { Metadata } from "next";
import { EmailSignIn } from "@/features/auth/EmailSignIn";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | PROHOR",
  description: "Sign in to access your PROHOR health records and sync accessibility preferences.",
};

export default function SignInPage() {
  return (
    <div className="pro-shell py-12 sm:py-16">
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <Link
            href="/"
            className="pro-btn pro-btn-ghost inline-flex items-center gap-1.5 text-sm text-pro-muted hover:text-pro-text mb-4"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to home</span>
          </Link>
          <h1 className="text-2xl font-bold text-pro-heading">Sign In to PROHOR</h1>
          <p className="mt-1 text-sm text-pro-muted">
            Sign in with email OTP to securely sync your accessibility preferences across devices.
          </p>
        </div>

        <EmailSignIn />
      </div>
    </div>
  );
}
