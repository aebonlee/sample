// ============================================================
// 자격증 코치 — React 19 + Chart.js + 적응형 학습
// ============================================================

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

interface Cert { id: string; name: string; category: string; pass_rate: number; }
interface WeakTopic { topic_id: string; topic_name: string; subject_name: string; accuracy: number; attempts: number; }

// ── Pages ────────────────────────────────────────────────────
function CertList() {
  const [certs, setCerts] = useState<Cert[]>([]);
  useEffect(() => {
    supabase.from('certifications').select('*').then(({ data }) => setCerts((data ?? []) as Cert[]));
  }, []);
  return (
    <main className="container">
      <h1>🎓 어떤 자격증을 준비하시나요?</h1>
      <div className="grid">
        {certs.map((c) => (
          <Link key={c.id} to={`/diagnose/${c.id}`} className="cert">
            <h3>{c.name}</h3>
            <p>{c.category} · 합격률 {c.pass_rate}%</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

function Weakness({ certId }: { certId: string }) {
  const [topics, setTopics] = useState<WeakTopic[]>([]);

  useEffect(() => {
    supabase
      .from('weakness_by_topic')
      .select('*')
      .eq('cert_id', certId)
      .order('accuracy')
      .limit(5)
      .then(({ data }) => setTopics((data ?? []) as WeakTopic[]));
  }, [certId]);

  // 레이더 차트 렌더링
  useEffect(() => {
    const ctx = document.getElementById('radar') as HTMLCanvasElement | null;
    if (!ctx) return;
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['설계', '개발', 'DB', '언어', '시스템'],
        datasets: [{
          label: '내 정답률',
          data: [80, 60, 40, 80, 40],
          backgroundColor: 'rgba(2,132,199,0.2)',
          borderColor: '#0284c7',
        }],
      },
      options: { scales: { r: { suggestedMax: 100 } } },
    });
  }, []);

  return (
    <main className="container">
      <h1>🎯 취약점 분석</h1>
      <canvas id="radar" width={400} height={400} />
      <ul className="topics">
        {topics.map((t) => (
          <li key={t.topic_id}>
            <strong>{t.topic_name}</strong> ({t.subject_name})
            <span>정답률 {t.accuracy}%</span>
            <Link to={`/study/${t.topic_id}`}>집중 학습 →</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

// ── Plan generation (Edge Function 호출) ─────────────────────
async function generateStudyPlan(certId: string, examDate: string) {
  const { data } = await supabase.functions.invoke('plan', {
    body: { cert_id: certId, exam_date: examDate, weekly_hours: 10 },
  });
  return data.schedule;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CertList />} />
        <Route path="/weakness/:certId" element={<Weakness certId="" />} />
      </Routes>
    </BrowserRouter>
  );
}
