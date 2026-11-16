"use client";

import { ArrowUpRight, CheckCircle2, Clock3, Phone, ShieldCheck } from "lucide-react";
import { copy } from "../home-content";
import { useHome } from "../HomeContext";
import { Preview } from "./Preview";
import { SourceTag } from "./SourceTag";

export function ShonketPreview() {
  const { t } = useHome();
  const statuses = [
    copy("Submitted", "জমা হয়েছে"),
    copy("Delivered", "পৌঁছেছে"),
    copy("Acknowledged", "প্রাপ্তি স্বীকার"),
    copy("Responded", "উত্তর এসেছে"),
  ];
  return (
    <Preview
      description={t(
        copy(
          "Reviewed-warning-signs layout with three CDC examples, a sample Call 999 button, and request tracking. Only Submitted is complete; Delivered, Acknowledged and Responded are pending. No care request has been sent.",
          "সিডিসির তিনটি সতর্কসংকেতের নমুনা, কল ৯৯৯ বোতাম ও অনুরোধের অগ্রগতি। শুধু জমা হয়েছে ধাপটি সম্পূর্ণ; পৌঁছানো, প্রাপ্তি স্বীকার ও উত্তর অপেক্ষমাণ। কোনো অনুরোধ পাঠানো হয়নি।",
        ),
      )}
    >
      <strong className="care-screen-heading">
        {t(copy("Warning signs, reviewed", "পর্যালোচিত সতর্কসংকেত"))}
      </strong>
      <ul className="care-warning-list">
        {[
          copy("A severe headache that persists", "তীব্র মাথাব্যথা যা কমছে না"),
          copy("Trouble breathing", "শ্বাস নিতে কষ্ট"),
          copy("Heavy bleeding", "অতিরিক্ত রক্তপাত"),
        ].map((item) => (
          <li key={item.en}>
            <ShieldCheck size={17} />
            <span>{t(item)}</span>
          </li>
        ))}
      </ul>
      <div className="care-help-actions">
        <SourceTag warning />
        <button type="button" className="care-call">
          <Phone size={18} />
          {t(copy("Call 999", "কল ৯৯৯"))}
          <ArrowUpRight size={17} />
        </button>
      </div>
      <ol className="care-request-steps">
        {statuses.map((status, index) => (
          <li key={status.en} data-complete={index === 0}>
            <span className="care-request-node">
              {index === 0 ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
            </span>
            <span className="font-tag">{t(status)}</span>
            <span className="font-tag care-request-state">
              {t(
                index === 0
                  ? copy("Complete", "সম্পূর্ণ")
                  : copy("Pending", "অপেক্ষমাণ"),
              )}
            </span>
          </li>
        ))}
      </ol>
      <p className="care-status-caption">
        {t(
          copy(
            "A request is never shown as delivered until it is.",
            "সত্যি না পৌঁছানো পর্যন্ত অনুরোধ পৌঁছেছে দেখানো হয় না।",
          ),
        )}
      </p>
    </Preview>
  );
}
