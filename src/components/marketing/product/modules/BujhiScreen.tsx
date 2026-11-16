"use client";

import { Check, FileCheck2, FileText, Search, Upload } from "lucide-react";
import { useHome } from "../../HomeContext";
import { copy } from "../../home-content";
import { ScreenTitle } from "../ScreenFrame";

export function BujhiScreen() {
  const { t } = useHome();
  return <><ScreenTitle icon={<FileCheck2 size={24} />} small="Bujhi · বুঝি" title={t(copy("Read. Review. Understand.", "পড়ুন। যাচাই করুন। বুঝুন।"))} />
    <div className="story-upload-art"><Upload size={31} aria-hidden="true" /><strong>{t(copy("A report to understand", "বোঝার জন্য একটি রিপোর্ট"))}</strong><span lang="en">visit-report.pdf</span></div>
    <div className="story-extract-row"><span>{t(copy("Document type", "নথির ধরন"))}</span><strong>{t(copy("Visit report", "সাক্ষাতের রিপোর্ট"))}</strong></div>
    <div className="story-extract-row"><span>{t(copy("Record belongs to", "রেকর্ডটি যাঁর"))}</span><strong>{t(copy("Mother · review first", "মা · আগে যাচাই করুন"))}</strong></div>
    <ol className="story-mini-steps"><li><FileText size={18} aria-hidden="true" />{t(copy("Upload", "আপলোড"))}</li><li><Search size={18} aria-hidden="true" />{t(copy("Review", "যাচাই"))}</li><li><Check size={18} aria-hidden="true" />{t(copy("Confirm", "নিশ্চিত"))}</li></ol></>;
}
