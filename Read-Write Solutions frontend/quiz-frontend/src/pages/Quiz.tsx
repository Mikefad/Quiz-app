import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";
import type { Question } from "../types";
import { useNavigate } from "react-router-dom";

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  // Map: questionId -> optionId (IMPORTANT: store the option's ID, not the index)
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [elapsedMs, setElapsedMs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await api.get<Question[]>("/api/quiz/start");
        if (!alive) return;
        setQuestions(res.data);
        setLoading(false);
      } catch (e: any) {
        setLoadErr(e?.response?.data?.error || e?.message || "Failed to load quiz");
        setLoading(false);
      }
    })();

    const start = Date.now();
    timerRef.current = window.setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 250);

    return () => {
      alive = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const current = questions[idx];

  const prettyTime = useMemo(() => {
    const s = Math.floor(elapsedMs / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [elapsedMs]);

  // choose by optionId
  const choose = (qId: number, optionId: number) =>
    setAnswers((a) => ({ ...a, [qId]: optionId }));

  const submit = async () => {
    // Build payload that the backend expects
    const built = Object.entries(answers).map(([qid, optionId]) => ({
      questionId: Number(qid),
      optionId: Number(optionId),
    }));

    if (built.length === 0) {
      alert("Please answer at least one question before submitting.");
      return;
    }

    try {
      const res = await api.post("/api/quiz/submit", { answers: built, elapsedMs });
      nav("/quiz/results", { state: res.data });
    } catch (e: any) {
      console.error("submit error", e?.response?.data || e);
      alert(e?.response?.data?.error || "Submit failed. Check console for details.");
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (loadErr) return <div className="p-6 text-red-600">{loadErr}</div>;
  if (!current) return <div className="p-6">No questions available.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">Time: {prettyTime}</div>
        <div className="text-sm">Question {idx + 1} of {questions.length}</div>
      </header>

      <div className="border rounded-lg p-4">
        <div className="font-semibold mb-3">{current.text}</div>
        <div className="grid gap-2">
          {current.options.map((o) => (
            <label key={o.id} className="flex items-center gap-2 border rounded-md p-2 cursor-pointer">
              <input
                type="radio"
                checked={answers[current.id] === o.id}
                onChange={() => choose(current.id, o.id!)}
              />
              <span>{o.text}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={idx === 0}
            className="px-3 py-2 border rounded disabled:opacity-50"
            onClick={() => setIdx((n) => n - 1)}
          >
            Previous
          </button>
          {idx < questions.length - 1 ? (
            <button className="px-3 py-2 border rounded" onClick={() => setIdx((n) => n + 1)}>
              Next
            </button>
          ) : (
            <button className="px-3 py-2 bg-black text-white rounded" onClick={submit}>
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
