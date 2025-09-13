// src/pages/Quiz.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';
import type { Question } from '../types';
import { useNavigate } from 'react-router-dom';

type StartResponse = { questions: Question[]; durationSec: number };

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [durationMs, setDurationMs] = useState<number>(0);
  const [remainingMs, setRemainingMs] = useState<number>(0);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const timerRef = useRef<number | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await api.get<StartResponse>('/api/quiz/start');
      setQuestions(res.data.questions);
      const dur = (res.data.durationSec ?? 300) * 1000; // default 5m if not provided
      setDurationMs(dur);
      setRemainingMs(dur);

      const startedAt = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const remain = Math.max(dur - elapsed, 0);
        setRemainingMs(remain);
        if (remain <= 0) {
          clearIntervalIfAny();
          submit(true); // auto-submit on time up
        }
      }, 250);
    })();

    return clearIntervalIfAny;
  }, []);

  const clearIntervalIfAny = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const prettyTime = useMemo(() => {
    const s = Math.ceil(remainingMs / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [remainingMs]);

  const choose = (qId: number, optionId: number) =>
    setAnswers((a) => ({ ...a, [qId]: optionId }));

  const submit = async (auto = false) => {
    // convert stored answers to payload expected by backend
    const payload = {
      answers: Object.entries(answers).map(([qid, optionId]) => ({
        questionId: Number(qid),
        optionId: Number(optionId),
      })),
      elapsedMs: durationMs - remainingMs, // how long user actually took
    };

    try {
      const res = await api.post('/api/quiz/submit', payload);
      nav('/quiz/results', { state: { ...res.data, autoSubmitted: auto } });
    } catch (e) {
      alert('Could not submit quiz. Please try again.');
    }
  };

  const current = questions[idx];
  if (!current) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <div className={`text-sm ${remainingMs <= 15_000 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
          Time left: {prettyTime}
        </div>
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
            <button className="px-3 py-2 bg-black text-white rounded" onClick={() => submit(false)}>
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
