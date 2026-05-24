/**
 * WeaknessPage — 취약점 분석 대시보드
 *
 * 데이터:
 *   - weakness_by_topic 뷰 (자동 집계)
 *   - SVG 레이더 차트로 과목별 균형도 시각화
 *   - AI 인사이트 (Edge Function)
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchWeakness, supabase } from '../supabase';
import type { WeaknessTopic } from '../types';

interface Insight { icon: string; title: string; body: string; pin: string; }

export default function WeaknessPage() {
  const { certId } = useParams<{ certId: string }>();
  const [topics, setTopics] = useState<WeaknessTopic[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (!certId) return;
    fetchWeakness(certId, 5).then(setTopics);

    // AI 인사이트 (Edge Function)
    supabase.functions.invoke('insights', { body: { cert_id: certId } })
      .then(({ data }) => setInsights(data?.insights ?? []));
  }, [certId]);

  // 과목별 평균 정답률 (레이더 데이터)
  const subjectRates: Record<string, number> = {};
  topics.forEach((t) => {
    if (!subjectRates[t.subject_name]) subjectRates[t.subject_name] = t.accuracy;
    else subjectRates[t.subject_name] = (subjectRates[t.subject_name] + t.accuracy) / 2;
  });

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>🎯 취약점 분석 대시보드</h1>
        <p>마지막 업데이트 {new Date().toLocaleString('ko-KR')}</p>
      </div>

      <main className="layout">
        {/* 레이더 차트 */}
        <article className="card radar">
          <h3>📡 과목별 균형도</h3>
          <RadarChart values={Object.values(subjectRates)} labels={Object.keys(subjectRates)} />
          <p style={{ color: 'var(--text-dim)', fontSize: '.85rem', marginTop: 14 }}>
            균형이 좋을수록 오각형이 정 5각형에 가까워집니다.
          </p>
        </article>

        {/* 약점 단원 TOP 5 */}
        <article className="card topics">
          <h3>🔴 가장 약한 단원 TOP 5</h3>
          {topics.map((t) => (
            <div key={t.topic_id} className={`topic ${t.accuracy < 40 ? '' : 'topic--mid'}`}>
              <div className="topic__head">
                <span className="topic__name">{t.topic_name} ({t.subject_name})</span>
                <span className="topic__rate">정답률 {t.accuracy}%</span>
              </div>
              <p className="topic__meta">{t.attempts}문제 시도 · 평균 {t.avg_sec}초</p>
              <div className="topic__bar">
                <div className="topic__fill" style={{ width: `${t.accuracy}%` }} />
              </div>
              <button className="topic__btn">집중 학습 시작 →</button>
            </div>
          ))}
        </article>

        {/* AI 인사이트 */}
        <article className="card insights">
          <h3>💡 AI 진단 인사이트</h3>
          <div className="insights__grid">
            {insights.map((ins, i) => (
              <div key={i} className="insight">
                <div className="insight__ico">{ins.icon}</div>
                <h4 className="insight__title">{ins.title}</h4>
                <p className="insight__body">{ins.body}</p>
                <span className="insight__pin">{ins.pin}</span>
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

// ─── SVG 레이더 차트 (간단 구현) ────────────────────────

function RadarChart({ values, labels }: { values: number[]; labels: string[] }) {
  if (values.length < 3) return null;
  const n = values.length;
  const cx = 160, cy = 160, r = 120;

  // 각 꼭지점 좌표 (12시 방향부터 시계 방향)
  const point = (val: number, idx: number) => {
    const angle = (Math.PI * 2 * idx / n) - Math.PI / 2;
    const radius = (val / 100) * r;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  };

  const polygon = values.map(point).map(([x, y]) => `${x},${y}`).join(' ');
  const axisLines = Array.from({ length: n }, (_, i) => {
    const [x, y] = point(100, i);
    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#bae6fd" strokeWidth={1} />;
  });

  return (
    <svg className="radar__svg" viewBox="0 0 320 320">
      {/* 배경 다각형 */}
      {[0.25, 0.5, 0.75, 1].map((pct) => {
        const pts = Array.from({ length: n }, (_, i) => point(pct * 100, i));
        return <polygon key={pct} points={pts.map(([x, y]) => `${x},${y}`).join(' ')}
                       stroke="#bae6fd" strokeWidth={1} fill="none" />;
      })}
      {axisLines}
      {/* 데이터 다각형 */}
      <polygon points={polygon} fill="rgba(2,132,199,.25)" stroke="#0284c7" strokeWidth={2} />
      {values.map((v, i) => {
        const [x, y] = point(v, i);
        return <circle key={i} cx={x} cy={y} r={4} fill="#0284c7" />;
      })}
      {/* 라벨 */}
      {labels.map((l, i) => {
        const [x, y] = point(115, i);
        return <text key={i} x={x} y={y} fontSize={11} fill="#0c4a6e" textAnchor="middle">{l}</text>;
      })}
    </svg>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🎓 자격증 코치</div>
      <nav className="nav-links">
        <Link to="/">자격증 선택</Link>
        <Link to="/weakness" className="on">취약점</Link>
        <Link to="/plan">학습 계획</Link>
      </nav>
    </header>
  );
}
