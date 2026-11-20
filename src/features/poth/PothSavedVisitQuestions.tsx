"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { MessageCircleQuestion, Trash2 } from "lucide-react";
import {
  parseVisitQuestions,
  readVisitQuestionSnapshot,
  removeVisitQuestion,
  subscribeToVisitQuestions,
} from "@/features/shared/visit-questions";
import styles from "./poth.module.css";

const emptySnapshot = () => "[]";

export function PothSavedVisitQuestions() {
  const snapshot = useSyncExternalStore(subscribeToVisitQuestions, readVisitQuestionSnapshot, emptySnapshot);
  const questions = parseVisitQuestions(snapshot);
  const heading = useRef<HTMLHeadingElement>(null);
  const [removal, setRemoval] = useState<"removed" | "failed">();

  return (
    <section aria-labelledby="poth-visit-questions" className={styles.savedQuestions} lang="en">
      <h3 id="poth-visit-questions" ref={heading} tabIndex={-1} className={styles.line}>
        <MessageCircleQuestion size={20} aria-hidden="true" />
        <span>Questions saved from Barta · <span lang="bn">বার্তা থেকে রাখা প্রশ্ন</span></span>
      </h3>
      {snapshot === null ? (
        <p>Saved questions are unavailable in this browser. · <span lang="bn">এই ব্রাউজারে রাখা প্রশ্ন দেখা যাচ্ছে না।</span></p>
      ) : (
        <>
          <p className={styles.meta}>Saved questions stay in this tab. · <span lang="bn">রাখা প্রশ্নগুলো শুধু এই ট্যাবেই থাকবে।</span></p>
          {questions.length === 0 ? (
            <p>No questions saved yet. Ask Barta, then save a question to bring it to your visit. · <span lang="bn">এখনো কোনো প্রশ্ন রাখা হয়নি।</span></p>
          ) : (
            <ul>
              {questions.map((question, index) => (
                <li key={question}>
                  <p dir="auto" lang={/[ঀ-৿]/u.test(question) ? "bn" : "en"}
                    style={{ flex: "1 1 12rem", minWidth: 0 }}>{question}</p>
                  <button type="button" className={styles.textButton}
                    aria-label={`Remove question ${index + 1} · প্রশ্ন সরান ${index + 1}`}
                    onClick={() => {
                      const removed = removeVisitQuestion(question);
                      if (removed) heading.current?.focus();
                      setRemoval(removed ? "removed" : "failed");
                    }}>
                    <Trash2 size={16} aria-hidden="true" />Remove · <span lang="bn">সরান</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <p role="status">
        {removal === "removed" && <>Question removed. · <span lang="bn">প্রশ্নটি সরানো হয়েছে।</span></>}
        {removal === "failed" && <>Could not remove the question. · <span lang="bn">প্রশ্নটি সরানো যায়নি।</span></>}
      </p>
    </section>
  );
}
