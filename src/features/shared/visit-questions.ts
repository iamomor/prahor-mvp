const storageKey = "prohor-visit-questions";
const changeEvent = "prohor-visit-questions-change";
const maxQuestions = 20;
const maxQuestionLength = 1200;

export const visitQuestionsHref = "/poth#poth-visit-questions";

export function readVisitQuestionSnapshot() {
  try {
    return window.sessionStorage.getItem(storageKey) ?? "[]";
  } catch {
    return null;
  }
}

export function parseVisitQuestions(snapshot: string | null): string[] {
  if (!snapshot) return [];
  try {
    const items: unknown = JSON.parse(snapshot);
    if (!Array.isArray(items)) return [];
    return items
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0 && item.length <= maxQuestionLength)
      .slice(0, maxQuestions);
  } catch {
    return [];
  }
}

export function subscribeToVisitQuestions(onChange: () => void) {
  window.addEventListener(changeEvent, onChange);
  return () => window.removeEventListener(changeEvent, onChange);
}

function writeVisitQuestions(questions: string[]) {
  try {
    if (questions.length) window.sessionStorage.setItem(storageKey, JSON.stringify(questions));
    else window.sessionStorage.removeItem(storageKey);
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(changeEvent));
  return true;
}

export function saveVisitQuestion(question: string) {
  const text = question.trim();
  const snapshot = readVisitQuestionSnapshot();
  if (!text || text.length > maxQuestionLength || snapshot === null) return "unavailable";
  const questions = parseVisitQuestions(snapshot);
  if (questions.includes(text)) return "saved";
  if (questions.length >= maxQuestions) return "full";
  return writeVisitQuestions([...questions, text]) ? "saved" : "unavailable";
}

export function removeVisitQuestion(question: string) {
  const snapshot = readVisitQuestionSnapshot();
  return snapshot !== null && writeVisitQuestions(parseVisitQuestions(snapshot).filter((item) => item !== question));
}
