import type { Metadata } from "next";
import { AppChrome } from "@/components/layout/AppChrome";

export const metadata: Metadata = {
  title: "My PROHOR | Your care, your way",
};

export default function MotherAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppChrome>{children}</AppChrome>;
}
