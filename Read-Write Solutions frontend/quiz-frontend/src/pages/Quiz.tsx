import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';
import type { Question } from '../types';
import { useNavigate } from 'react-router-dom';

const QUIZ_SECONDS = 120; // ⬅️ change duration here (in seconds)

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  // answers: questionId -> optionId  (NOT optionIndex)
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_SECONDS);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<number | null>(null);
  const nav = useNavigate();

  // Load questions + start countdown
  useEffect(() => {
    (async () => {
      const res = await api.get<Question[]>('/api/quiz/start');
      setQuestions(res.data);
    })();

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-submit when time hits 0
  useEffect(() => {
    if (secondsLeft === 0 && !submitting) {
      submit(true).catch(() => {/* swallow */});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const current = questions[idx];

  const prettyTime = useMemo(() => {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const ss = String(secondsLeft % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [secondsLeft]);

  const choose = (qId: number, optionId: number) =>
    setAnswers((a) => ({ ...a, [qId]: optionId }));

  const submit = async (auto = false) => {
    try {
      setSubmitting(true);
      // elapsed = total - remaining (ms)
      const elapsedMs = (QUIZ_SECONDS - secondsLeft) * 1000;

      const payload = {
        answers: Object.entries(answers).map(([qid, optionId]) => ({
          questionId: Number(qid),
          optionId: Number(optionId),
        })),
        elapsedMs,
      };

      const res = await api.post('/api/quiz/submit', payload);
      nav('/quiz/results', { state: res.data });
    } catch (e: any) {
      // surface server validation if any
      const msg =
        e?.response?.data?.errors?.[0]?.msg ||
        e?.response?.data?.message ||
        'Could not submit quiz. Please try again';
      if (!auto) alert(msg);
      setSubmitting(false);
    }
  };

  if (!current) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium">Time left: {prettyTime}</div>
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
            disabled={idx === 0 || submitting}
            className="px-3 py-2 border rounded disabled:opacity-50"
            onClick={() => setIdx((n) => n - 1)}
          >
            Previous
          </button>

          {idx < questions.length - 1 ? (
            <button
              className="px-3 py-2 border rounded disabled:opacity-50"
              onClick={() => setIdx((n) => n + 1)}
              disabled={submitting}
            >
              Next
            </button>
          ) : (
            <button
              className="px-3 py-2 bg-black text-white rounded disabled:opacity-50"
              onClick={() => submit(false)}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
