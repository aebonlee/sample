/**
 * MissionPage — 탐방 미션 (지도 + 미션 카드)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - missions JOIN heritages + mission_progress 로 사용자별 진행 상황
 *   - 가짜 지도 + 핀 위치 (실제로는 Kakao Map SDK)
 *   - "인증하기" → mission_progress INSERT (포인트 자동 적립)
 *   - 잠금 미션: 이전 N개 완료 시 자동 해제
 *
 * 통계:
 *   - 방문 완료 / 획득 포인트 / 다음 보상까지 / 뱃지 자동 계산
 *
 * 패턴:
 *   - useAsync 로 미션 목록 + 진행 상태 병렬 로드
 *   - useMemo 로 통계 캐싱
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useSession } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Mission, Heritage } from '../types';

interface MissionRow extends Mission {
  heritage: Heritage;
  visited_at?: string;
  is_done: boolean;
  is_locked: boolean;
}

const REWARDS = [
  { points: 500,  badge: '🏅 첫 탐방' },
  { points: 1000, badge: '🥈 탐방 마스터' },
  { points: 2000, badge: '🏆 문화재 박사' },
];

export default function MissionPage() {
  const user = useSession();
  const [actingId, setActingId] = useState<string | null>(null);

  // ─── 미션 + 진행 + 좌표 병렬 로드 ───────────────────
  const state = useAsync(async () => {
    if (!user) return [] as MissionRow[];
    const [{ data: missions, error: mErr }, { data: progress }] = await Promise.all([
      supabase
        .from('missions')
        .select('*, heritage:heritages(*)')
        .eq('group_name', '서울 궁궐 5대 탐방')
        .order('unlock_after', { ascending: true }),
      supabase
        .from('mission_progress')
        .select('mission_id, visited_at')
        .eq('user_id', user.id),
    ]);
    if (mErr) throw mErr;

    const progressMap = new Map((progress ?? []).map((p: any) => [p.mission_id, p.visited_at]));
    const completedCount = progressMap.size;

    return (missions ?? []).map((m: any): MissionRow => ({
      ...m,
      heritage: m.heritage as Heritage,
      visited_at: progressMap.get(m.id) as string | undefined,
      is_done: progressMap.has(m.id),
      is_locked: m.unlock_after > 0 && completedCount < m.unlock_after,
    }));
  }, [user?.id]);

  const summary = useMemo(() => {
    if (state.status !== 'success') return { done: 0, total: 0, points: 0, nextReward: 500 };
    const done = state.data.filter((m) => m.is_done).length;
    const points = state.data.filter((m) => m.is_done).reduce((s, m) => s + m.points, 0);
    const nextReward = REWARDS.find((r) => points < r.points)?.points ?? 0;
    return { done, total: state.data.length, points, nextReward };
  }, [state]);

  // ─── 인증 (optimistic) ───────────────────────────────
  async function verify(mission: MissionRow) {
    if (mission.is_done || mission.is_locked || !user) return;
    setActingId(mission.id);

    // 실제로는 사진 업로드 등 거치지만 여기선 단순화
    try {
      await supabase.from('mission_progress').insert({
        mission_id: mission.id,
        visited_at: new Date().toISOString(),
      });
      alert('🎉 미션 인증 완료!');
      location.reload();
    } catch (err) {
      alert(`인증 실패: ${(err as Error).message}`);
    } finally {
      setActingId(null);
    }
  }

  if (state.status === 'loading') return <><Nav /><Spinner /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;

  if (state.data.length === 0) {
    return (
      <>
        <Nav />
        <EmptyState
          emoji="🗺"
          title="현재 진행 중인 탐방 미션이 없어요"
          desc="새로운 미션이 곧 추가될 예정입니다."
        />
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📍 서울 궁궐 5대 탐방</h1>
        <p>5개 궁궐을 모두 방문하면 ‘조선의 길’ 뱃지를 획득합니다.</p>
      </div>

      {/* ─── 통계 ─── */}
      <div className="stats">
        <Stat label="방문 완료"      value={`${summary.done} / ${summary.total}`} />
        <Stat label="획득 포인트"    value={`${summary.points} pts`} />
        <Stat label="다음 보상까지"  value={summary.nextReward > 0 ? `${summary.nextReward - summary.points} pts` : '🏆 만점'} />
        <Stat label="획득 뱃지"      value={`🏅 ${REWARDS.filter((r) => summary.points >= r.points).length}개`} />
      </div>

      <main className="layout">
        {/* 가짜 지도 */}
        <div className="card" style={{ padding: 14 }}>
          <div className="map">
            {state.data.map((m, i) => (
              <Pin
                key={m.id}
                left={`${20 + (i * 12) % 50}%`}
                top={`${35 + (i * 8) % 30}%`}
                emoji={m.heritage.emoji}
                label={m.heritage.name}
                status={m.is_locked ? 'locked' : m.is_done ? 'done' : 'planned'}
              />
            ))}
          </div>
          <p style={{ color: 'var(--text-mute)', fontSize: '.78rem', marginTop: 10, textAlign: 'center' }}>
            실제 구현 시 Kakao Map SDK 로 교체. <code>schema.sql</code> 에 lat/lng 컬럼 사용.
          </p>
        </div>

        {/* 미션 카드 목록 */}
        <aside className="missions">
          <h3>미션 목록</h3>
          {state.data.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              isActing={actingId === m.id}
              onVerify={() => verify(m)}
            />
          ))}
        </aside>
      </main>
    </>
  );
}

// ─── 보조 ─────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong></div>;
}

function Pin({ left, top, emoji, label, status }: {
  left: string; top: string; emoji: string; label: string;
  status: 'done' | 'planned' | 'locked';
}) {
  return (
    <div className={`pin pin--${status}`} style={{ left, top }}>
      <div className="pin__icon"><span>{emoji}</span></div>
      <div className="pin__label">{label} {status === 'done' && '✓'}</div>
    </div>
  );
}

function MissionCard({ mission, isActing, onVerify }: {
  mission: MissionRow; isActing: boolean; onVerify: () => void;
}) {
  const cls = mission.is_done ? 'done' : mission.is_locked ? 'locked' : '';
  return (
    <article className={`mission card ${cls}`}>
      <div className="mission__head">
        <h4 className="mission__title">{mission.heritage.emoji} {mission.heritage.name}</h4>
        <span className="mission__pts">+{mission.points}</span>
      </div>
      <p className="mission__meta">
        📍 {mission.heritage.location_address}
        {mission.visited_at && ` · ${new Date(mission.visited_at).toLocaleDateString('ko-KR')} 방문`}
      </p>
      <button
        className="mission__btn"
        disabled={mission.is_locked || isActing}
        onClick={onVerify}>
        {isActing ? '저장 중...'
          : mission.is_done ? '📜 인증 사진 보기'
          : mission.is_locked ? `🔒 ${mission.unlock_after}곳 완료 시 해제`
          : '📷 인증하기'}
      </button>
    </article>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🏛 우리<span>문화재</span></div>
      <nav className="nav-links">
        <Link to="/">검색</Link>
        <Link to="/mission" className="on">탐방 미션</Link>
        <Link to="/history">학습 기록</Link>
        <Link to="/fav">즐겨찾기</Link>
      </nav>
    </header>
  );
}
