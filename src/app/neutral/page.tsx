export const metadata = { title: "Notes", robots: { index: false, follow: false } };
import Link from "next/link";

// Deliberately plain: no PROHOR name, records or health text. Quick exit lands here; it does not erase history or sign-out.
export default function Neutral() {
  return (
    <div className="pro-shell pro-section max-w-xl">
      <h1 className="text-2xl font-semibold">Notes</h1>
      <p className="pro-muted mt-3">Nothing here yet.</p>
      <p className="mt-8"><Link className="underline" href="/">Continue</Link></p>
    </div>
  );
}
