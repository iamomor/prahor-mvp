"use client";

import { Info, MessageCircle } from "lucide-react";
import { copy } from "../home-content";
import { useHome } from "../HomeContext";
import { Preview } from "./Preview";
import { SourceTag } from "./SourceTag";

export function BartaPreview() {
  const { t } = useHome();
  return (
    <Preview
      description={t(
        copy(
          "A Bangla question and educational answer, WHO and CDC sources, and an explicit insufficient-evidence fallback. This is a product preview, not a live AI answer.",
          "বাংলা প্রশ্ন ও শিক্ষামূলক উত্তর, বিশ্ব স্বাস্থ্য সংস্থা ও সিডিসির সূত্র এবং প্রমাণ অপর্যাপ্ত হলে তার স্পষ্ট বার্তা। এটি পণ্যের নমুনা, সরাসরি এআই উত্তর নয়।",
        ),
      )}
    >
      <div className="care-conversation">
        <p className="care-question" lang="bn">
          আমার যত্নে আমার পছন্দও কি গুরুত্বপূর্ণ?
        </p>
        <div className="care-answer">
          <span className="care-answer-label font-tag" lang="en">
            <MessageCircle size={15} />
            Barta
          </span>
          <p lang="bn">
            মায়ের শারীরিক ও মানসিক সুস্থতার পাশাপাশি তাঁর অভিজ্ঞতাও গর্ভকালীন
            যত্নের অংশ।
          </p>
        </div>
      </div>
      <div className="care-sources">
        <SourceTag />
        <SourceTag warning />
      </div>
      <p className="care-evidence-note">
        <Info size={18} />
        <span>
          {t(
            copy(
              "Not enough approved evidence? PROHOR says so and suggests asking a clinician.",
              "অনুমোদিত প্রমাণ যথেষ্ট নয়? প্রহর তা জানায় এবং চিকিৎসকের কাছে জানতে পরামর্শ দেয়।",
            ),
          )}
        </span>
      </p>
    </Preview>
  );
}
