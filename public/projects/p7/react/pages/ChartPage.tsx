/**
 * ChartPage — 회복 그래프 (회복 점수 + 감정 차트)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - 기간 탭 (7/30/90/365)
 *   - 일별 회복 점수 + 감정 막대
 *   - AI 인사이트 (Edge Function `stats`)
 *   - 이전 기간 대비 변화율 (실제 데이터 비교)
 *
 * 패턴:
 *   - useAsync 로 fetchResilience + stats + 이전 기간 병렬 호출
 *   - range 변경 시 재로드
 *   - useLocalStorage 로 마지막 range 영속화
 *   - useMemo 로 평균/델타 계산
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchResilience, supabase } from '../supabase';
import { useAsync, useLocalStorage } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { ResilienceDay } from '../types';

type Range = 7 | 30 | 90 | 365;

export default function ChartPage() {
  const [range, setRange] = useLocalStorage<Range>('p7:chart:range', 7);

  // ─── 회복 데이터 + AI 인사이트 병렬 로드 ──────────
  // 직전 기간은 fetchResilience(range * 2) 로 한번에 받아 앞/뒤 분할
  const state = useAsync(async () => {
    const [all, ai] = await Promise.all([
      fetchResilience(range * 2),
      supabase.functions.invoke('stats', { body: { days: range } })
        .then(({ data }) => data?.insight as string ?? '꾸준히 좋아지고 있어요.')
        .catch(() => '꾸준히 좋아지고 있어요.'),
    ]);
    // all 이 최신순이라면 앞 range 개가 현재, 뒤 range 개가 직전 기간
    const days     = all.slice(0, range).reverse(); // 시간순 정렬
    const prevDays = all.slice(range, range * 2);
    return { days, prevDays, insight: ai };
  }, [range]);

  // 평균 회복 점수 + 직전 대비 델타
  const stats = useMemo(() => {
    if (state.status !== 'success') return { avg: 0, delta: 0, prevAvg: 0 };
    const { days, prevDays } = state.data;
    const avg = days.length
      ? Math.round(days.reduce((s, d) => s + (d.resilience_score ?? 0), 0) / days.length)
      : 0;
    const prevAvg = prevDays.length
      ? Math.round(prevDays.reduce((s, d) => s + (d.resilience_score ?? 0), 0) / prevDays.length)
      : 0;
    const delta = prevAvg ? Math.round(((avg - prevAvg) / prevAvg) * 100) : 0;
    return { avg, delta, prevAvg };
  }, [state]);

  if (state.status === 'loading') return <div className="phone"><Spinner /></div>;
  if (state.status === 'error')   return <div className="phone"><ErrorBox error={state.error} /></div>;
  if (state.status !== 'success') return null;

  const { days, insight } = state.data;

  return (
    <div className="phone">
      <header className="greet">
        <p>📊 회복력 통계</p>
        <h1>지난 {range === 365 ? '1년' : `${range}일`} 회복 점수</h1>
      </header>

      {/* 기간 탭 */}
      <div className="range-tabs">
        {([7, 30, 90, 365] as Range[]).map((r) => (
          <button
            key={r}
            className={range === r ? 'on' : ''}
            onClick={() => setRange(r)}
          >
            {r === 365 ? '전체' : `${r}일`}
          </button>
        ))}
      </div>

      {/* 평균 회복 점수 카드 */}
      <article className="hero">
        <div className="hero__num">{stats.avg}</div>
        {stats.prevAvg > 0 && (
          <span className="hero__delta" style={{
            color: stats.delta >= 0 ? 'var(--accent)' : 'var(--danger)'
          }}>
            {stats.delta > 0 ? '▲ ' : stats.delta < 0 ? '▼ ' : '— '}
            {Math.abs(stats.delta)}% vs 직전 {range}일
          </span>
        )}
        <p className="hero__lab">평균 회복력 점수 (100점 만점)</p>
      </article>

      {days.length === 0 ? (
        <EmptyState
          emoji="📊"
          title="아직 데이터가 없어요"
          desc="홈 화면에서 오늘의 체크인을 시작해보세요."
        />
      ) : (
        <>
          {/* 일별 막대 그래프 */}
          <article className="card chart">
            <h3>📈 일별 회복 점수</h3>
            <div className="chart-bars">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`chart-bar ${i === days.length - 1 ? 'today' : ''}`}
                  style={{ height: `${d.resilience_score ?? 0}%` }}
                  title={`${d.day}: ${d.resilience_score}`}
                >
                  <span className="chart-bar__num">{d.resilience_score}</span>
                  <span className="chart-bar__day">{getDayLabel(d.day, range)}</span>
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
                    {getDayLabel(d.day, range)} {moodEmoji(d.mood)}
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
        </>
      )}

      <TabBar active="chart" />
    </div>
  );
}

// ─── 유틸 ─────────────────────────────────────────────

function getDayLabel(date: string, range: Range): string {
  if (range === 7) return ['일','월','화','수','목','금','토'][new Date(date).getDay()];
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
