"use client";

// Local neutral page (no third-party request). Replacing the current entry hides this page from Back,
// but it does NOT clear browser history, caches, cookies or the signed-in session.
const NEUTRAL_URL = "/neutral";

export function QuickExit() {
  return (
    <div className="border-b border-pro-border bg-pro-surface">
      <div className="pro-shell flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5 text-sm">
        <p className="text-pro-muted">
          <span lang="en">Sharing this phone? Leave quickly.</span>{" "}
          <span lang="bn">ফোন অন্য কেউ ব্যবহার করলে দ্রুত বেরিয়ে যান।</span>
        </p>
        <a
          href={NEUTRAL_URL}
          aria-describedby="quick-exit-note"
          onClick={(event) => {
            event.preventDefault();
            window.location.replace(NEUTRAL_URL);
          }}
          className="pro-btn pro-btn-secondary !min-h-11 !px-3 text-sm"
        >
          <span lang="en">Quick exit</span> · <span lang="bn">দ্রুত বের হোন</span>
        </a>
      </div>
      <p id="quick-exit-note" className="pro-shell pb-1.5 text-xs text-pro-muted">
        <span lang="en">Opens a plain page. It does not delete browser history, saved data or your sign-in. Open PROHOR again any time.</span>{" "}
        <span lang="bn">একটি সাধারণ পাতা খুলবে। ব্রাউজার ইতিহাস, সংরক্ষিত তথ্য বা সাইন-ইন মুছবে না। যেকোনো সময় আবার প্রহর খুলতে পারবেন।</span>
      </p>
    </div>
  );
}
