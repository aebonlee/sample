// ============================================================
// 자소서 코치 — React 19 + Tiptap 에디터 + Solar STAR
// ============================================================

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

interface Experience { id: string; title: string; raw_text: string; }
interface StarBreakdown { situation: string; task: string; action: string; result: string; competencies: Record<string, number>; }
interface Feedback { overall_score: number; scores: Record<string, number>; suggestions: Array<{ old: string; new: string }>; }

// ── 경험 → STAR 변환 (Solar Edge Function) ───────────────
async function convertToStar(rawText: string, role?: string): Promise<StarBreakdown> {
  const { data, error } = await supabase.functions.invoke('star', {
    body: { raw_text: rawText, target_role: role },
  });
  if (error) throw error;
  return data as StarBreakdown;
}

// ── 자소서 작성 페이지 ───────────────────────────────────
function ExperienceForm() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: exp } = await supabase.from('experiences').insert({
      title: text.slice(0, 30), raw_text: text, target_role: target,
    }).select().single();

    if (exp) {
      const star = await convertToStar(text, target);
      await supabase.from('star_breakdowns').insert({ experience_id: exp.id, ...star });
      navigate(`/star/${exp.id}`);
    }
    setLoading(false);
  }

  return (
    <form className="container" onSubmit={onSubmit}>
      <h1>📝 경험을 자유롭게 들려주세요</h1>
      <textarea value={text} onChange={(e) => setText(e.target.value)} minLength={200} maxLength={2000} />
      <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="지원처 (예: 카카오 백엔드)" />
      <button type="submit" disabled={loading}>{loading ? 'AI 분석 중...' : '✨ STAR로 정리하기'}</button>
    </form>
  );
}

function StarResult() {
  const { id } = useParams<{ id: string }>();
  const [star, setStar] = useState<StarBreakdown | null>(null);

  useEffect(() => {
    supabase.from('star_breakdowns').select('*').eq('experience_id', id).single()
      .then(({ data }) => setStar(data as StarBreakdown));
  }, [id]);

  if (!star) return <p>로딩 중...</p>;
  return (
    <main className="container">
      <h1>⭐ STAR로 정리했어요</h1>
      {(['situation', 'task', 'action', 'result'] as const).map((k, i) => (
        <article key={k} className="star">
          <div className="star__letter">{'STAR'[i]}</div>
          <p>{star[k]}</p>
        </article>
      ))}
      <h3>🎯 추출된 역량</h3>
      <ul>
        {Object.entries(star.competencies).map(([name, score]) => (
          <li key={name}>{name}: {score}</li>
        ))}
      </ul>
      <Link to="/write">✍ 자소서 작성하기 →</Link>
    </main>
  );
}

// ── 피드백 (자동 채점 + 수정 제안) ──────────────────────
async function requestFeedback(resumeQuestionId: string): Promise<Feedback> {
  const { data } = await supabase.functions.invoke('feedback', {
    body: { question_id: resumeQuestionId },
  });
  return data as Feedback;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExperienceForm />} />
        <Route path="/star/:id" element={<StarResult />} />
      </Routes>
    </BrowserRouter>
  );
}
