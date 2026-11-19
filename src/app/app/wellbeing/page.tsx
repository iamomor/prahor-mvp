import { redirect } from "next/navigation";

/** Compatibility path; the parent /app layout enforces the mother workspace guard. */
export default function WellbeingCompatibilityPage(): never {
  redirect("/app/shusthota");
}
