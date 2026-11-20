import Link from "next/link";

// Static, server-rendered and bilingual so the cached copy needs no JavaScript or account data.
export default function Offline() {
  return (
    <div className="pro-shell pro-section max-w-2xl">
      <p className="pro-eyebrow mb-3">
        <span lang="en">No internet connection</span> · <span lang="bn">ইন্টারনেট সংযোগ নেই</span>
      </p>
      <h1 className="pro-editorial text-4xl">
        <span lang="en">You&apos;re offline.</span>
        <span lang="bn" className="mt-2 block">আপনি এখন অফলাইনে আছেন।</span>
      </h1>

      <section aria-labelledby="offline-emergency" className="mt-6 rounded-card border border-pro-danger p-5">
        <h2 id="offline-emergency" className="text-xl font-bold">
          <span lang="en">Urgent help — phone calls work without this app</span>
          <span lang="bn" className="mt-1 block">জরুরি সাহায্য — এই অ্যাপ ছাড়াই ফোনে কল করা যায়</span>
        </h2>
        <ul className="mt-4 grid gap-3">
          <li>
            <a className="pro-btn pro-btn-primary w-full" href="tel:999">
              <span lang="en">Call 999 (emergency)</span> · <span lang="bn">৯৯৯-এ কল করুন (জরুরি)</span>
            </a>
          </li>
          <li>
            <a className="pro-btn pro-btn-secondary w-full" href="tel:16263">
              <span lang="en">Call 16263 (health service information)</span> · <span lang="bn">১৬২৬৩-এ কল করুন (স্বাস্থ্যসেবা তথ্য)</span>
            </a>
          </li>
        </ul>
        <p className="mt-4">
          <Link href="/safety" className="font-semibold underline">
            <span lang="en">Open safety information</span> · <span lang="bn">নিরাপত্তা তথ্য খুলুন</span>
          </Link>
          {" "}
          <span className="pro-muted">
            <span lang="en">(shown only if this device saved it earlier; otherwise use the text version)</span>
            <span lang="bn"> (এই ডিভাইসে আগে সংরক্ষিত থাকলেই দেখা যাবে; না হলে লেখা সংস্করণ দেখুন)</span>
          </span>
        </p>
        <p className="mt-2">
          <a href="/offline-safety.txt" lang="en" className="font-semibold underline">Emergency contacts as plain text / জরুরি যোগাযোগ (লেখা)</a>
        </p>
      </section>

      <section aria-labelledby="offline-limits" className="mt-6">
        <h2 id="offline-limits" className="text-xl font-bold">
          <span lang="en">What does not work offline</span> · <span lang="bn">অফলাইনে যা কাজ করে না</span>
        </h2>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li>
            <span lang="en">Barta answers need the internet. Nothing here is a live or personal answer.</span>{" "}
            <span lang="bn">বার্তার উত্তর পেতে ইন্টারনেট লাগে। এখানে কোনো সরাসরি বা ব্যক্তিগত উত্তর নেই।</span>
          </li>
          <li>
            <span lang="en">Your records, care requests and care workers cannot be reached. No care request has been sent, and nothing has been synced.</span>{" "}
            <span lang="bn">আপনার রেকর্ড, সেবার অনুরোধ ও সেবাকর্মীদের কাছে পৌঁছানো যাচ্ছে না। কোনো অনুরোধ পাঠানো হয়নি এবং কিছুই সিঙ্ক হয়নি।</span>
          </li>
          <li>
            <span lang="en">Do not wait for this app if you have a danger sign. Call 999 or go to the nearest emergency care.</span>{" "}
            <span lang="bn">বিপদচিহ্ন থাকলে এই অ্যাপের জন্য অপেক্ষা করবেন না। ৯৯৯-এ কল করুন বা নিকটতম জরুরি সেবায় যান।</span>
          </li>
        </ul>
      </section>

      <p className="mt-6">
        <Link className="pro-btn pro-btn-primary" href="/">
          <span lang="en">Try opening PROHOR again</span> · <span lang="bn">আবার প্রহর খুলুন</span>
        </Link>
      </p>
      <p className="pro-muted mt-3">
        <span lang="en">This page opens normally once your connection returns.</span>{" "}
        <span lang="bn">সংযোগ ফিরলে এই পাতা স্বাভাবিকভাবে খুলবে।</span>
      </p>
    </div>
  );
}
