"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";

type AppDialogProps = {
  open: boolean;
  onClose: () => void;
  /** The id of the heading element that labels this dialog. */
  labelledBy: string;
  children: ReactNode;
  className?: string;
};

/**
 * AppDialog — an accessible modal dialog using the native <dialog> element.
 *
 * Behaviour:
 * - Opens with showModal() — browsers create a focus trap and render over the top layer.
 * - Closes on Escape (native dialog behaviour).
 * - Prevents body scroll while open.
 * - Returns focus to the trigger element when closed.
 * - Scroll-locks body to prevent background interaction on mobile.
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   const triggerRef = useRef<HTMLButtonElement>(null);
 *   <button ref={triggerRef} onClick={() => setOpen(true)}>Open</button>
 *   <AppDialog open={open} onClose={() => setOpen(false)} labelledBy="dialog-title">
 *     <h2 id="dialog-title">Settings</h2>
 *     ...
 *   </AppDialog>
 */
export function AppDialog({
  open,
  onClose,
  labelledBy,
  children,
  className = "",
}: AppDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      // Remember where focus was before opening
      returnFocusRef.current = document.activeElement;
      dialog.showModal();
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
        dialog.close();
        // Return focus to the trigger element
        if (
          returnFocusRef.current &&
          typeof (returnFocusRef.current as HTMLElement).focus === "function"
        ) {
          (returnFocusRef.current as HTMLElement).focus();
        }
      };
    }
  }, [open]);

  function handleCancel(e: React.SyntheticEvent<HTMLDialogElement>) {
    // Native Escape key fires cancel; we intercept to run our close handler
    e.preventDefault();
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    // Click on the <dialog> element itself (not its contents) = backdrop click
    if (e.target === dialogRef.current) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      aria-modal="true"
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className={[
        // Base dialog reset
        "m-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-hero border border-pro-border",
        "bg-pro-elevated p-0 text-pro-text shadow-pro-3",
        // Backdrop via native ::backdrop
        "backdrop:bg-pro-scrim backdrop:backdrop-blur-sm",
        // Open animation respects reduced motion
        "open:animate-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </dialog>
  );
}
