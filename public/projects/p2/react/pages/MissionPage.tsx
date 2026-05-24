/**
 * MissionPage — 탐방 미션 (지도 + 미션 카드)
 * ────────────────────────────────────────────────────────────
 * 실제 구현 시 카카오/네이버 지도 SDK 사용 권장.
 * 이 예시는 SVG/CSS 로 시뮬레이션.
 *
 * 데이터:
 *   - missions 테이블 (그룹별 미션 목록)
 *   - mission_progress 테이블 (사용자의 방문 기록)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Mission, Heritage } from '../types';

interface MissionWithStatus extends Mission {
  heritage: Heritage;
  visited_at?: string;
  is_done: boolean;
}

export default function MissionPage() {
  const [missions, setMissions] = useState<MissionWithStatus[]>([]);

  useEffect(() => {
    (async () => {
      // missions + heritages 조인 + mission_progress
      const { data } = await supabase
        .from('missions')
        .select('*, heritage:heritages(*)')
        .eq('group_name', '서울 궁궐 5대 탐방');

      const { data: progress } = await supabase
        .from('mission_progress')
        .select('mission_id, visited_at');

      const progressMap = new Map((progress ?? []).map((p: any) => [p.mission_id, p.visited_at]));

      const merged: MissionWithStatus[] = (data ?? []).map((m: any) => ({
        ...m,
        visited_at: progressMap.get(m.id),
        is_done: progressMap.has(m.id),
      }));

      setMissions(merged);
    })();
  }, []);

  const doneCount = missions.filter((m) => m.is_done).length;
  const totalPoints = missions.filter((m) => m.is_done).reduce((s, m) => s + m.points, 0);

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📍 서울 궁궐 5대 탐방</h1>
        <p>5개 궁궐을 모두 방문하면 ‘조선의 길’ 뱃지를 획득합니다.</p>
      </div>

      {/* ─── 통계 ─── */}
      <div className="stats">
        <Stat label="방문 완료" value={`${doneCount} / ${missions.length}`} />
        <Stat label="획득 포인트" value={`${totalPoints} pts`} />
        <Stat label="다음 보상까지" value={`${Math.max(0, 500 - totalPoints)} pts`} />
        <Stat label="획득 뱃지" value="🏅 3개" />
      </div>

      <main className="layout">
        {/* ─── 가짜 지도 (실제로는 Kakao Map) ─── */}
        <div className="card" style={{ padding: 14 }}>
          <div className="map">
            {missions.map((m, i) => (
              <Pin
                key={m.id}
                left={`${20 + (i * 12) % 50}%`}
                top={`${35 + (i * 8) % 30}%`}
                emoji={m.heritage.emoji}
                label={m.heritage.name}
                status={m.is_done ? 'done' : 'planned'}
              />
            ))}
          </div>
        </div>

        {/* ─── 미션 카드 목록 ─── */}
        <aside className="missions">
          <h3>미션 목록</h3>
          {missions.map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </aside>
      </main>
    </>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Pin({ left, top, emoji, label, status }: {
  left: string; top: string; emoji: string; label: string; status: 'done' | 'planned' | 'locked';
}) {
  return (
    <div className={`pin pin--${status}`} style={{ left, top }}>
      <div className="pin__icon"><span>{emoji}</span></div>
      <div className="pin__label">{label} {status === 'done' && '✓'}</div>
    </div>
  );
}

function MissionCard({ mission }: { mission: MissionWithStatus }) {
  return (
    <article className={`mission card ${mission.is_done ? 'done' : ''}`}>
      <div className="mission__head">
        <h4 className="mission__title">{mission.heritage.emoji} {mission.heritage.name}</h4>
        <span className="mission__pts">+{mission.points}</span>
      </div>
      <p className="mission__meta">
        📍 {mission.heritage.location_address}
        {mission.visited_at && ` · ${new Date(mission.visited_at).toLocaleDateString('ko-KR')} 방문`}
      </p>
      <button className="mission__btn">
        {mission.is_done ? '📜 인증 사진 보기' : '📷 인증하기'}
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
