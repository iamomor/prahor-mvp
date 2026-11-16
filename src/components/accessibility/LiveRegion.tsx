"use client";

import { useEffect, useRef } from "react";

type LiveRegionProps = {
  /** The message to announce. Changing this value triggers an announcement. */
  message: string;
  /** "polite" (default) queues after current speech; "assertive" interrupts. */
  politeness?: "polite" | "assertive";
  /** Additional class names. */
  className?: string;
};

/**
 * LiveRegion — announces status messages to screen readers via an ARIA live region.
 *
 * Usage:
 *   const [message, setMessage] = useState("");
 *   <LiveRegion message={message} />
 *   // Later: setMessage("Preferences saved.");
 *
 * The region is visually hidden; it only exists to push announcements.
 * Changing `message` to the same value twice won't re-announce — set it to ""
 * and then back if you need to repeat.
 */
export function LiveRegion({
  message,
  politeness = "polite",
  className,
}: LiveRegionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Briefly clear then set to reliably trigger re-announcement
    if (ref.current && message) {
      ref.current.textContent = "";
      const id = setTimeout(() => {
        if (ref.current) ref.current.textContent = message;
      }, 50);
      return () => clearTimeout(id);
    }
  }, [message]);

  return (
    <div
      ref={ref}
      role={politeness === "assertive" ? "alert" : "status"}
      aria-live={politeness}
      aria-atomic="true"
      className={className}
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    />
  );
}

/**
 * InlineLiveRegion — a visible status message that also announces to screen readers.
 * Use for form submission results, preference confirmation, etc.
 */
export function InlineLiveRegion({
  message,
  politeness = "polite",
  className = "",
}: LiveRegionProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (ref.current && message) {
      ref.current.textContent = "";
      const id = setTimeout(() => {
        if (ref.current) ref.current.textContent = message;
      }, 50);
      return () => clearTimeout(id);
    }
  }, [message]);

  return (
    <p
      ref={ref}
      role={politeness === "assertive" ? "alert" : "status"}
      aria-live={politeness}
      aria-atomic="true"
      className={["min-h-5 text-sm text-pro-muted", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
