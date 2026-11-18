import Link from "next/link";
import { AuthShell } from "@/features/auth/AuthShell";
export default function AccessDenied() {
  return <AuthShell><h1 className="text-3xl">Access denied / <span lang="bn">প্রবেশাধিকার নেই</span></h1><Link href="/sign-in" className="pro-btn pro-btn-secondary">Sign in / <span lang="bn">সাইন ইন</span></Link></AuthShell>;
}
