// ============================================================
// 한국사 마스터 — React 19 + 시대 타임라인 + 적응형 추천
// ============================================================

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

interface Era {
  id: string;
  ord: number;
  name: string;
  start_year: number;
  end_year: number;
  summary: string;
  cover_color: string;
}

interface Question {
  id: string;
  type: 'mc' | 'source' | 'map' | 'image';
  question: string;
  source_text?: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

// ── Hooks ────────────────────────────────────────────────────
function useEras() {
  const [eras, setEras] = useState<Era[]>([]);
  useEffect(() => {
    supabase.from('eras').select('*').order('ord').then(({ data }) => setEras(data ?? []));
  }, []);
  return eras;
}

function useUserProgress() {
  const [progress, setProgress] = useState<Record<string, number>>({});
  useEffect(() => {
    supabase.from('analytics_by_era').select('era_id, rate').then(({ data }) => {
      const map: Record<string, number> = {};
      data?.forEach((r: any) => { map[r.era_id] = r.rate; });
      setProgress(map);
    });
  }, []);
  return progress;
}

// ── Pages ────────────────────────────────────────────────────
function Timeline() {
  const eras = useEras();
  const progress = useUserProgress();

  return (
    <main className="container">
      <h1>📜 시대별 한국사 학습</h1>
      <div className="timeline">
        {eras.map((era) => (
          <Link key={era.id} to={`/study/${era.id}`} className="era">
            <span className="era__dot" />
            <h2>{era.name}</h2>
            <span>{era.start_year > 0 ? era.start_year : `BC ${-era.start_year}`} ~ {era.end_year}</span>
            <p>{era.summary}</p>
            <div className="progress__bar">
              <div className="progress__fill" style={{ width: `${progress[era.id] ?? 0}%` }} />
            </div>
            <span>{progress[era.id] ?? 0}%</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

function Quiz() {
  const { eraId } = useParams<{ eraId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    supabase.from('questions').select('*').eq('era_id', eraId).limit(10)
      .then(({ data }) => setQuestions((data ?? []) as Question[]));
  }, [eraId]);

  async function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const q = questions[idx];
    await supabase.from('attempts').insert({
      question_id: q.id,
      picked_index: i,
      is_correct: i === q.answer_index,
    });
  }

  if (!questions.length) return <p>로딩 중...</p>;
  const q = questions[idx];

  return (
    <main className="quiz">
      <article className="qcard">
        <h2>{q.question}</h2>
        {q.source_text && <div className="source">{q.source_text}</div>}
        <div className="opts">
          {q.options.map((opt, i) => (
            <button
              key={i}
              disabled={picked !== null}
              className={
                picked === i ? 'opt picked'
                : picked !== null && i === q.answer_index ? 'opt correct'
                : 'opt'
              }
              onClick={() => pick(i)}
            >
              <span>{'ABCDE'[i]}</span> {opt}
            </button>
          ))}
        </div>
        {picked !== null && (
          <div className="explain">{q.explanation}</div>
        )}
        {picked !== null && (
          <button onClick={() => { setPicked(null); setIdx(idx + 1); }}>
            다음 →
          </button>
        )}
      </article>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Timeline />} />
        <Route path="/quiz/:eraId" element={<Quiz />} />
      </Routes>
    </BrowserRouter>
  );
}
