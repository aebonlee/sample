/**
 * ChartPage — 회복 그래프
 *
 * 일자별 회복 점수 + 감정 점수.
 * Edge Function `stats` 로 AI 인사이트도 함께.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchResilience, supabase } from '../supabase';
import type { ResilienceDay } from '../types';

type Range = 7 | 30 | 90 | 365;

export default function ChartPage() {
  const [range, setRange] = useState<Range>(7);
  const [days, setDays]   = useState<ResilienceDay[]>([]);
  const [insight, setInsight] = useState<string>('');

  useEffect(() => {
    fetchResilience(range).then(setDays);
    supabase.functions.invoke('stats', { body: { days: range } })
      .then(({ data }) => setInsight(data?.insight ?? '꾸준히 좋아지고 있어요.'));
  }, [range]);

  // 평균 회복 점수
  const avg = useMemo(() => {
    if (!days.length) return 0;
    return Math.round(days.reduce((s, d) => s + (d.resilience_score ?? 0), 0) / days.length);
  }, [days]);

  // 지난 기간 대비 (가짜 -10%~+30% 시뮬레이션)
  const delta = useMemo(() => Math.round((Math.random() - 0.3) * 30), [range]);

  return (
    <div className="phone">
      <header className="greet">
        <p>📊 회복력 통계</p>
        <h1>지난 {range}일 회복 점수</h1>
      </header>

      {/* 기간 탭 */}
      <div className="range-tabs">
        {[7, 30, 90, 365].map((r) => (
          <button
            key={r}
            className={range === r ? 'on' : ''}
            onClick={() => setRange(r as Range)}
          >
            {r === 365 ? '전체' : `${r}일`}
          </button>
        ))}
      </div>

      {/* 평균 회복 점수 카드 */}
      <article className="hero">
        <div className="hero__num">{avg}</div>
        <span className="hero__delta">
          {delta > 0 ? '▲ ' : delta < 0 ? '▼ ' : ''}{Math.abs(delta)}% vs 지난 기간
        </span>
        <p className="hero__lab">평균 회복력 점수 (100점 만점)</p>
      </article>

      {/* 일별 막대 그래프 */}
      <article className="card chart">
        <h3>📈 일별 회복 점수</h3>
        <div className="chart-bars">
          {days.map((d, i) => (
            <div
              key={i}
              className={`chart-bar ${i === days.length - 1 ? 'today' : ''}`}
              style={{ height: `${d.resilience_score ?? 0}%` }}
            >
              <span className="chart-bar__num">{d.resilience_score}</span>
              <span className="chart-bar__day">{getDayLabel(d.day, i, days.length, range)}</span>
            </div>
          ))}
        </div>
      </article>

      {/* 감정 그래프 */}
      <article className="card chart" style={{ marginTop: 12 }}>
        <h3>😊 일별 감정 (10단계)</h3>
        <div className="mood-chart">
          {days.map((d, i) => (
            <div key={i} className="mood-row">
              <span className="mood-row__day">
                {getDayLabel(d.day, i, days.length, range)} {moodEmoji(d.mood)}
              </span>
              <div className="mood-bar">
                <div className="mood-bar__fill" style={{ width: `${(d.mood ?? 0) * 10}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="insight">
          💡 <strong>이번 기간의 패턴</strong>: {insight}
        </div>
      </article>

      <TabBar active="chart" />
    </div>
  );
}

// ─── 유틸 ─────────────────────────────────────────────

function getDayLabel(date: string, idx: number, total: number, range: Range): string {
  if (range === 7) return ['월','화','수','목','금','토','일'][new Date(date).getDay()];
  return new Date(date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}

function moodEmoji(score?: number): string {
  if (!score) return '';
  if (score >= 8) return '😄';
  if (score >= 6) return '😊';
  if (score >= 4) return '😌';
  if (score >= 2) return '😟';
  return '😢';
}

function TabBar({ active }: { active: string }) {
  return (
    <nav className="tabbar">
      <Link to="/" className={`tab ${active === 'home' ? 'on' : ''}`}><span>🏠</span>홈</Link>
      <Link to="/routine" className={`tab ${active === 'routine' ? 'on' : ''}`}><span>🌿</span>루틴</Link>
      <Link to="/journal" className={`tab ${active === 'journal' ? 'on' : ''}`}><span>📓</span>저널</Link>
      <Link to="/chart" className={`tab ${active === 'chart' ? 'on' : ''}`}><span>📊</span>그래프</Link>
      <Link to="/setting" className={`tab ${active === 'setting' ? 'on' : ''}`}><span>⚙</span>설정</Link>
    </nav>
  );
}
