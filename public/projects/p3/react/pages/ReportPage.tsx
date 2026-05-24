/**
 * ReportPage — 성적표 & 취약점 리포트
 *
 * 데이터:
 *   - analytics_by_era 뷰 → 시대별 정답률 차트
 *   - attempts 집계 → 유형별 정답률
 *   - Edge Function `recommend` → AI 추천 학습 코스
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, fetchUserProgress } from '../supabase';
import type { EraProgress } from '../types';

interface TypeStats { type: string; total: number; correct: number; rate: number; }

export default function ReportPage() {
  const [progress, setProgress]   = useState<Record<string, EraProgress>>({});
  const [typeStats, setTypeStats] = useState<TypeStats[]>([]);
  const [eraNames, setEraNames]   = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const [pr, eras, attempts] = await Promise.all([
        fetchUserProgress(),
        supabase.from('eras').select('id, name'),
        supabase.from('attempts').select('is_correct, question:questions(type)'),
      ]);
      setProgress(pr);
      setEraNames(Object.fromEntries((eras.data ?? []).map((e: any) => [e.id, e.name])));

      // 유형별 통계
      const grouped: Record<string, { total: number; correct: number }> = {};
      (attempts.data ?? []).forEach((a: any) => {
        const t = a.question?.type ?? 'mc';
        grouped[t] ??= { total: 0, correct: 0 };
        grouped[t].total++;
        if (a.is_correct) grouped[t].correct++;
      });
      setTypeStats(
        Object.entries(grouped).map(([type, v]) => ({
          type,
          total: v.total,
          correct: v.correct,
          rate: v.total ? Math.round((v.correct / v.total) * 100) : 0,
        })),
      );
    })();
  }, []);

  // 전체 평균 정답률
  const overallRate = Object.values(progress).length
    ? Math.round(Object.values(progress).reduce((s, p) => s + p.rate, 0) / Object.values(progress).length)
    : 0;

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📊 나의 성적표</h1>
        <p>지난 30일간의 학습 기록을 기반으로 한 종합 진단입니다.</p>
      </div>

      {/* ─── 종합 점수 카드 ─── */}
      <div className="hero-card">
        <div className="hero-card__inner">
          <div className="circle">
            <div className="circle__text">
              <span className="circle__pct">{overallRate}</span>
              <span className="circle__lab">평균 정답률 %</span>
            </div>
          </div>
          <div className="hero-card__info">
            <h2>예상 한능검 등급: <strong>{overallRate >= 80 ? '1급' : overallRate >= 70 ? '2급' : overallRate >= 60 ? '3급' : '4급'}</strong></h2>
            <p>가장 약한 시대 2개를 집중 학습하면 다음 등급이 가능합니다.</p>
          </div>
        </div>
      </div>

      <main className="layout">
        {/* 시대별 막대 */}
        <article className="card">
          <h3>📈 시대별 정답률</h3>
          <div className="bars">
            {Object.entries(progress).map(([eraId, p]) => (
              <div key={eraId} className="bar-row">
                <span className="bar-row__name">{eraNames[eraId] ?? '시대'}</span>
                <div className="bar-row__bar">
                  <div className={`bar-row__fill ${p.rate < 50 ? 'bar-row__fill--low' : p.rate < 70 ? 'bar-row__fill--mid' : ''}`}
                       style={{ width: `${p.rate}%` }}>{p.rate}</div>
                </div>
                <span className="bar-row__pct">
                  {p.rate >= 80 ? '최상' : p.rate >= 70 ? '상' : p.rate >= 50 ? '중' : '하'}
                </span>
              </div>
            ))}
          </div>
        </article>

        {/* 유형별 도넛 */}
        <article className="card">
          <h3>🎯 유형별 정답률</h3>
          <div className="types-grid">
            {typeStats.map((t) => (
              <div key={t.type} className="donut">
                <div className="donut__ring"
                     style={{ ['--p' as any]: `${t.rate}%`, ['--ring' as any]: t.rate >= 70 ? 'var(--accent)' : t.rate >= 50 ? 'var(--warn)' : 'var(--danger)' }}>
                  <span className="donut__pct">{t.rate}%</span>
                </div>
                <div className="donut__lab">{t.type}</div>
              </div>
            ))}
          </div>
          <div className="weakness">
            <strong>🔴 취약점</strong>: 가장 약한 유형부터 집중 학습하세요.
          </div>
        </article>
      </main>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📜 한국사 마스터</div>
      <nav className="nav-links">
        <Link to="/">타임라인</Link>
        <Link to="/quiz">문제 풀기</Link>
        <Link to="/note">오답 노트</Link>
        <Link to="/report" className="on">성적표</Link>
        <Link to="/mock">모의고사</Link>
      </nav>
    </header>
  );
}
