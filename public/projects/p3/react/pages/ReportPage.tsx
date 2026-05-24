/**
 * ReportPage — 성적표 & 취약점 리포트
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - analytics_by_era 뷰 (시대별 정답률 자동 집계)
 *   - attempts 집계 → 유형별 정답률
 *   - Edge Function 'recommend' → AI 학습 코스 추천
 *   - 기간 토글 (7일/30일/전체) 로 데이터 범위 조절
 *
 * 시각화:
 *   - 종합 점수: 원형 게이지 (CSS conic-gradient)
 *   - 시대별: 색상 코딩된 막대 차트 (상/중/하)
 *   - 유형별: 도넛 차트 (CSS conic-gradient)
 *   - 추천 코스: 정답률 낮은 시대 우선
 *
 * 패턴:
 *   - useAsync 로 4가지 데이터 병렬 로드
 *   - 등급 자동 계산 (1급/2급/3급/4급/5급/6급)
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, fetchUserProgress } from '../supabase';
import { useAsync, useSession } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';

type Range = 7 | 30 | 0;   // 0 = 전체

interface TypeStat { type: string; total: number; correct: number; rate: number; }
interface Recommendation { eraId: string; eraName: string; expectedGain: number; reason: string; }

export default function ReportPage() {
  const user = useSession();
  const [range, setRange] = useState<Range>(30);

  // ─── 모든 통계 병렬 로드 ─────────────────────────────
  const reportState = useAsync(async () => {
    if (!user) throw new Error('로그인이 필요해요');

    const since = range > 0
      ? new Date(Date.now() - range * 86400000).toISOString()
      : '1970-01-01';

    const [progress, eras, attempts, recs] = await Promise.all([
      fetchUserProgress(),
      supabase.from('eras').select('id, name, ord').order('ord'),
      supabase.from('attempts').select('is_correct, question:questions(type)')
        .gte('attempted_at', since),
      supabase.functions.invoke('recommend', { body: { limit: 3 } })
        .then(({ data }) => (data?.recommendations ?? []) as Recommendation[])
        .catch(() => [] as Recommendation[]),
    ]);

    const eraNames = Object.fromEntries((eras.data ?? []).map((e: any) => [e.id, e.name]));

    // 유형별 통계 계산
    const grouped: Record<string, { total: number; correct: number }> = {};
    (attempts.data ?? []).forEach((a: any) => {
      const t = a.question?.type ?? 'mc';
      grouped[t] ??= { total: 0, correct: 0 };
      grouped[t].total++;
      if (a.is_correct) grouped[t].correct++;
    });
    const typeStats: TypeStat[] = Object.entries(grouped).map(([type, v]) => ({
      type,
      total: v.total,
      correct: v.correct,
      rate: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    }));

    return { progress, eraNames, typeStats, recommendations: recs };
  }, [user?.id, range]);

  // 전체 평균
  const overall = useMemo(() => {
    if (reportState.status !== 'success') return { rate: 0, grade: '-', desc: '' };
    const rates = Object.values(reportState.data.progress).map((p) => p.rate);
    if (rates.length === 0) return { rate: 0, grade: '-', desc: '문제를 풀어보세요' };
    const avg = Math.round(rates.reduce((s, n) => s + n, 0) / rates.length);
    return {
      rate: avg,
      grade: avg >= 80 ? '1급' : avg >= 70 ? '2급' : avg >= 60 ? '3급' : avg >= 50 ? '4급' : avg >= 40 ? '5급' : '6급',
      desc: avg >= 70 ? '안정권' : avg >= 50 ? '발전 중' : '집중 필요',
    };
  }, [reportState]);

  if (reportState.status === 'loading') return <><Nav /><Spinner /></>;
  if (reportState.status === 'error')   return <><Nav /><ErrorBox error={reportState.error} /></>;
  if (reportState.status !== 'success') return null;

  const { progress, eraNames, typeStats, recommendations } = reportState.data;
  const isEmpty = Object.keys(progress).length === 0;

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📊 나의 성적표</h1>
        <p>지난 {range > 0 ? `${range}일` : '전체'} 학습 기록을 기반으로 한 종합 진단입니다.</p>

        {/* 기간 토글 */}
        <div style={{ display: 'inline-flex', gap: 4, marginTop: 12, padding: 4,
                     background: 'var(--surface)', border: '1px solid var(--border)',
                     borderRadius: 8 }}>
          {([7, 30, 0] as Range[]).map((r) => (
            <button key={r}
              onClick={() => setRange(r)}
              style={{ padding: '6px 14px', borderRadius: 6,
                       background: range === r ? 'var(--accent)' : 'transparent',
                       color: range === r ? '#fff' : 'var(--text-dim)',
                       border: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: '.85rem' }}>
              {r === 0 ? '전체' : `${r}일`}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <EmptyState
          emoji="📜"
          title="아직 데이터가 부족해요"
          desc="문제를 10개 이상 풀어보면 상세 분석이 가능해요."
          action={<Link to="/quiz" className="btn btn--primary">문제 풀기 →</Link>}
        />
      ) : (
        <>
          {/* ─── 종합 점수 카드 ─── */}
          <div className="hero-card">
            <div className="hero-card__inner">
              <div className="circle"
                   style={{
                     background: `conic-gradient(#fff 0% ${overall.rate}%, rgba(255,255,255,.2) ${overall.rate}% 100%)`,
                   }}>
                <div className="circle__text">
                  <span className="circle__pct">{overall.rate}</span>
                  <span className="circle__lab">평균 정답률 %</span>
                </div>
              </div>
              <div className="hero-card__info">
                <h2>예상 한능검 등급: <strong>{overall.grade}</strong></h2>
                <p>{overall.desc}. {recommendations.length > 0 && '아래 추천 코스를 따라가시면 다음 등급이 가능합니다.'}</p>
              </div>
            </div>
          </div>

          <main className="layout">
            {/* 시대별 막대 */}
            <article className="card">
              <h3>📈 시대별 정답률</h3>
              {Object.entries(progress)
                .sort(([a], [b]) => (eraNames[a] ?? '').localeCompare(eraNames[b] ?? ''))
                .map(([eraId, p]) => (
                  <EraBar key={eraId} name={eraNames[eraId] ?? '시대'} rate={p.rate} total={p.total} />
                ))}
            </article>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 유형별 도넛 */}
              <article className="card">
                <h3>🎯 유형별 정답률</h3>
                <div className="types-grid">
                  {typeStats.map((t) => <TypeDonut key={t.type} stat={t} />)}
                </div>
                {(() => {
                  const weakest = [...typeStats].sort((a, b) => a.rate - b.rate)[0];
                  return weakest && weakest.rate < 60 ? (
                    <div className="weakness">
                      <strong>🔴 취약점</strong>: <strong>{weakest.type}</strong> 유형이 가장 약합니다 ({weakest.rate}%).
                      이 유형 위주로 30분만 학습해도 큰 향상이 기대됩니다.
                    </div>
                  ) : null;
                })()}
              </article>

              {/* AI 추천 코스 */}
              {recommendations.length > 0 && (
                <article className="card">
                  <h3>📚 AI 추천 학습 코스</h3>
                  {recommendations.map((r) => (
                    <Link key={r.eraId}
                          to={`/study/${r.eraId}`}
                          style={{ display: 'block', padding: 14, background: 'var(--bg)',
                                  borderRadius: 10, marginBottom: 8, textDecoration: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <strong>{r.eraName}</strong>
                        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                          예상 +{r.expectedGain}점
                        </span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '.85rem' }}>{r.reason}</p>
                    </Link>
                  ))}
                </article>
              )}
            </div>
          </main>
        </>
      )}
    </>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

function EraBar({ name, rate, total }: { name: string; rate: number; total: number }) {
  const cls = rate < 50 ? 'bar-row__fill--low' : rate < 70 ? 'bar-row__fill--mid' : '';
  const grade = rate >= 80 ? '최상' : rate >= 70 ? '상' : rate >= 50 ? '중' : '하';
  return (
    <div className="bar-row" title={`${total}문제 시도`}>
      <span className="bar-row__name">{name}</span>
      <div className="bar-row__bar">
        <div className={`bar-row__fill ${cls}`} style={{ width: `${rate}%` }}>{rate}</div>
      </div>
      <span className="bar-row__pct">{grade}</span>
    </div>
  );
}

function TypeDonut({ stat }: { stat: TypeStat }) {
  const color = stat.rate >= 70 ? 'var(--accent)' : stat.rate >= 50 ? 'var(--warn)' : 'var(--danger)';
  return (
    <div className="donut" title={`${stat.correct} / ${stat.total} 문제`}>
      <div className="donut__ring"
           style={{
             ['--p' as any]: `${stat.rate}%`,
             ['--ring' as any]: color,
             background: `conic-gradient(${color} 0% ${stat.rate}%, var(--bg) ${stat.rate}% 100%)`,
           }}>
        <span className="donut__pct">{stat.rate}%</span>
      </div>
      <div className="donut__lab">{stat.type === 'mc' ? '객관식' : stat.type === 'source' ? '사료' : stat.type === 'map' ? '지도' : '이미지'}</div>
    </div>
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
