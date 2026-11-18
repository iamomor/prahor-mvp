"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import {
  parseVisitQuestions,
  readVisitQuestionSnapshot,
  removeVisitQuestion,
  subscribeToVisitQuestions,
} from "@/features/shared/visit-questions";

const emptySnapshot = () => "[]";

export function PothSavedVisitQuestions() {
  const snapshot = useSyncExternalStore(subscribeToVisitQuestions, readVisitQuestionSnapshot, emptySnapshot);
  const questions = parseVisitQuestions(snapshot);
  const heading = useRef<HTMLHeadingElement>(null);
  const [removal, setRemoval] = useState<"removed" | "failed">();

  return (
    <section aria-labelledby="poth-visit-questions" className="mb-5" lang="en">
      <h3 id="poth-visit-questions" ref={heading} tabIndex={-1} className="text-lg font-bold">
        Questions saved from Barta · <span lang="bn">বার্তা থেকে রাখা প্রশ্ন</span>
      </h3>
      {snapshot === null ? (
        <p>Saved questions are unavailable in this browser. · <span lang="bn">এই ব্রাউজারে রাখা প্রশ্ন দেখা যাচ্ছে না।</span></p>
      ) : (
        <>
          <p>Saved questions stay in this tab. · <span lang="bn">রাখা প্রশ্নগুলো শুধু এই ট্যাবেই থাকবে।</span></p>
          {questions.length === 0 ? (
            <p>No questions saved yet. · <span lang="bn">এখনো কোনো প্রশ্ন রাখা হয়নি।</span></p>
          ) : (
            <ul className="mt-2 grid gap-2">
              {questions.map((question, index) => (
                <li key={question} className="flex flex-wrap items-start gap-2 rounded-xl border border-pro-border bg-pro-elevated p-3">
                  <p dir="auto" lang={/[\u0980-\u09ff]/u.test(question) ? "bn" : "en"}
                    className="min-w-0 flex-1 basis-48 wrap-anywhere">{question}</p>
                  <button type="button" className="pro-btn pro-btn-secondary"
                    aria-label={`Remove question ${index + 1} · প্রশ্ন সরান ${index + 1}`}
                    onClick={() => {
                      const removed = removeVisitQuestion(question);
                      if (removed) heading.current?.focus();
                      setRemoval(removed ? "removed" : "failed");
                    }}>
                    Remove · <span lang="bn">সরান</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <p role="status">
        {removal === "removed" && <>Question removed. · <span lang="bn">প্রশ্নটি সরানো হয়েছে।</span></>}
        {removal === "failed" && <>Could not remove the question. · <span lang="bn">প্রশ্নটি সরানো যায়নি।</span></>}
      </p>
    </section>
  );
}
