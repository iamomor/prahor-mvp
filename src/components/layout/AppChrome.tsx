"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Accessibility, House, HeartPulse, MessageCircle, MapPinned, LogIn } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";
import { isPublicMarketingRoute } from "@/lib/routes";
import { PublicNav } from "@/components/marketing/PublicNav";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { QuickExit } from "@/components/layout/QuickExit";

const inAppLinks = [
  { href: "/", label: "Home", icon: House },
  { href: "/app", label: "My health", icon: HeartPulse },
  { href: "/ask", label: "Ask", icon: MessageCircle },
  { href: "/find-care", label: "Find care", icon: MapPinned },
];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isMarketing = isPublicMarketingRoute(path);
  const isAuthPage = path.startsWith("/sign-in") || path.startsWith("/sign-up");
  // Neutral quick-exit page: no PROHOR branding, navigation or footer.
  if (path === "/neutral") return <main id="main-content">{children}</main>;

  // Render dedicated Public Marketing Chrome for all pre-login public pages
  if (isMarketing) {
    return (
      <div className="flex min-h-dvh flex-col bg-pro-bg text-pro-text">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-pro-elevated focus:p-3 focus:text-pro-text focus:shadow-lg focus:outline-3 focus:outline-pro-focus"
        >
          Skip to main content
        </a>
        <QuickExit />
        <PublicNav />
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Render In-App Chrome for authenticated application modules
  return (
    <div className="min-h-dvh bg-pro-bg text-pro-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-pro-elevated focus:p-3 focus:outline-3 focus:outline-pro-focus"
      >
        Skip to main content
      </a>
      <QuickExit />
      <header className="sticky top-0 z-30 border-b border-pro-border bg-pro-bg/95 backdrop-blur-sm">
        <div className="pro-shell flex min-h-17 flex-wrap items-center justify-between gap-3 py-3">
          <Brand />
          <nav aria-label="In-App Primary" className="hidden items-center gap-1 md:flex">
            {inAppLinks.map((x) => (
              <Link
                key={x.href}
                href={x.href}
                aria-current={path === x.href ? "page" : undefined}
                className={`rounded-xl px-3 py-2 text-sm font-semibold hover:bg-pro-surface ${
                  path === x.href ? "bg-pro-surface" : ""
                }`}
              >
                {x.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/accessibility"
              className="pro-btn pro-btn-secondary !min-h-11 !px-3 text-sm"
            >
              <Accessibility size={19} aria-hidden="true" />
              <span className="hidden sm:inline">Adjust access</span>
              <span className="sm:hidden">Access</span>
            </Link>
            <Link
              href="/sign-in"
              aria-label="Sign in"
              className="pro-btn pro-btn-secondary !min-h-11 !px-3 text-sm"
            >
              <LogIn size={19} aria-hidden="true" />
              <span className="hidden lg:inline">Sign in</span>
            </Link>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="pro-bottom-safe">
        {children}
      </main>
      <div className="pro-shell hidden pb-8 md:flex">
        <InstallAppButton />
      </div>
      {!isAuthPage && (
        <nav
          aria-label="Mobile primary"
          className="pro-botnav fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-pro-border bg-pro-elevated md:hidden"
        >
          {inAppLinks.map((x) => {
            const Icon = x.icon;
            return (
              <Link
                key={x.href}
                href={x.href}
                aria-current={path === x.href ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[.75rem] font-semibold ${
                  path === x.href ? "bg-pro-surface" : ""
                }`}
              >
                <Icon aria-hidden="true" size={21} />
                <span>{x.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
