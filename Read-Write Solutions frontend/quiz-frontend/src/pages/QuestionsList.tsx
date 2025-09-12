import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Question } from '../types';
import { Link } from "react-router-dom";

const empty = { text: '', options: ['', '', '', ''], correctIndex: 0 };

export default function QuestionsList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get<Question[]>('/api/questions');
    setQuestions(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/api/questions', {
      text: form.text,
      options: form.options.map((text, i) => ({ text, isCorrect: i === form.correctIndex })),
    });
    setForm(empty);
    await load();
  };

  const update = async (q: Question) => {
    await api.put(`/api/questions/${q.id}`, q);
    await load();
  };

  const remove = async (id: number) => {
    await api.delete(`/api/questions/${id}`);
    await load();
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Questions</h1>
        
        <Link className="underline" to="/quiz">Take Quiz →</Link>

      </header>

      {/* Create */}
      <form onSubmit={create} className="mt-6 border rounded-lg p-4 grid gap-3">
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Question text"
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          required
        />
        {form.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="border rounded-md px-3 py-2 w-full"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const copy = [...form.options];
                copy[i] = e.target.value;
                setForm((f) => ({ ...f, options: copy }));
              }}
              required
            />
            <label className="text-sm flex items-center gap-1">
              <input
                type="radio"
                checked={form.correctIndex === i}
                onChange={() => setForm((f) => ({ ...f, correctIndex: i }))}
              />
              Correct
            </label>
          </div>
        ))}
        <button className="bg-black text-white rounded-md px-4 py-2 w-fit">Add question</button>
      </form>

      {/* List */}
      <ul className="mt-8 grid gap-4">
        {questions.map((q) => (
          <li key={q.id} className="border rounded-lg p-4">
            <div className="font-medium">{q.text}</div>
            <ol className="list-decimal ml-6 mt-2">
              {q.options.map((o, idx) => (
                <li key={idx}>
                  {o.text} {o.isCorrect ? <span className="text-green-600">(correct)</span> : null}
                </li>
              ))}
            </ol>
            <div className="mt-3 flex gap-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => update(q)}
                title="(For brevity, edit UI not implemented—wire inputs if you want inline editing)"
              >
                Edit (stub)
              </button>
              <button
                className="px-3 py-1 border rounded text-red-600"
                onClick={() => remove(q.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
