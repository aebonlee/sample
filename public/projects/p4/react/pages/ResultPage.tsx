/**
 * ResultPage — 진단 평가 결과
 *
 * 표시:
 *   - 총점 (원형 게이지)
 *   - 과목별 정답률 (막대 차트)
 *   - 등급 (A/B/C/D) + 합격 가능성
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Diagnosis } from '../types';

const GRADE_COLORS = {
  A: { color: '#16a34a', desc: '안정 합격권' },
  B: { color: '#0284c7', desc: '합격 가능권' },
  C: { color: '#f59e0b', desc: '집중 학습 필요' },
  D: { color: '#dc2626', desc: '기초 학습 필요' },
} as const;

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [diag, setDiag] = useState<Diagnosis | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from('diagnoses').select('*').eq('id', id).single()
      .then(({ data }) => setDiag(data as Diagnosis));
  }, [id]);

  if (!diag) return <p style={{ padding: 40 }}>로딩 중...</p>;

  const gradeInfo = GRADE_COLORS[diag.grade];
  const subjects = Object.entries(diag.subject_scores);

  return (
    <>
      <Nav />

      {/* 종합 점수 */}
      <section className="hero">
        <div className="score-circle">
          <div className="score-circle__text">
            <span className="score-circle__num">{diag.score}</span>
            <span className="score-circle__lab">100점 만점</span>
          </div>
        </div>
        <div className="hero__info">
          <h1>🎯 진단 평가 결과</h1>
          <p className="hero__sub">
            {new Date(diag.taken_at).toLocaleDateString('ko-KR')} 응시
          </p>
          <div className="hero__stats">
            <div className="hero__stat"><span>정답</span><strong>{diag.correct} / {diag.total_q}</strong></div>
            <div className="hero__stat"><span>등급</span><strong>{diag.grade}</strong></div>
            <div className="hero__stat"><span>판정</span><strong>{gradeInfo.desc}</strong></div>
          </div>
        </div>
      </section>

      <main className="layout">
        <article className="card subjects-result">
          <h3>📊 과목별 정답률</h3>
          {subjects.map(([name, rate]) => {
            const cls = rate >= 70 ? 'good' : rate < 50 ? 'weak' : '';
            return (
              <div key={name} className={`sj ${cls}`}>
                <span className="sj__name">{name}</span>
                <div className="sj__bar">
                  <div className="sj__fill" style={{ width: `${rate}%` }} />
                </div>
                <span className="sj__pct">{rate}%</span>
              </div>
            );
          })}
        </article>

        <article className="verdict card">
          <div className="verdict__grade" style={{ borderColor: gradeInfo.color }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '.82rem' }}>예상 등급</span>
            <strong style={{ color: gradeInfo.color }}>{diag.grade}</strong>
            <span style={{ color: 'var(--text-mute)', fontSize: '.8rem' }}>{gradeInfo.desc}</span>
          </div>
          <p className="verdict__msg">
            {diag.grade === 'A' && '거의 완벽합니다! 마무리 점검만 하시면 됩니다.'}
            {diag.grade === 'B' && '합격에 매우 가까워요. 약한 과목 2개만 보완하면 됩니다.'}
            {diag.grade === 'C' && '꾸준한 학습이 필요합니다. AI가 맞춤 계획을 만들어드릴게요.'}
            {diag.grade === 'D' && '기초부터 차근차근! 4-8주 학습 계획을 추천합니다.'}
          </p>
          <div className="verdict__actions">
            <Link to={`/weakness/${diag.cert_id}`} className="btn btn--primary">🎯 취약점 자세히 보기</Link>
            <Link to={`/plan/${diag.cert_id}`} className="btn btn--ghost">📅 학습 계획 만들기</Link>
            <Link to={`/diagnose/${diag.cert_id}`} className="btn btn--ghost">🔄 다시 응시</Link>
          </div>
        </article>
      </main>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🎓 자격증 코치</div>
      <nav className="nav-links">
        <Link to="/">자격증 선택</Link>
        <Link to="/diagnose">진단</Link>
      </nav>
    </header>
  );
}
