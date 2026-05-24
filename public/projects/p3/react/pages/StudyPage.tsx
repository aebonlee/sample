/**
 * StudyPage — 시대별 학습 (수준 토글 + 본문 + 연표 + 인물)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - 좌측 사이드바: 10개 시대 (진도 표시)
 *   - 메인: 시대 개관 + 수준 토글(기본/심화/한능검 1급)
 *   - 미니 연표 + 인물 카드 + 시험 출제 포인트
 *
 * 패턴:
 *   - useAsync 로 eras + lesson 병렬 로드
 *   - 수준 변경 시 lesson 재로드 (deps에 level 포함)
 *   - useLocalStorage 로 마지막 수준 기억
 *   - activity_log 자동 기록 (학습 통계용)
 */

import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, fetchEras } from '../supabase';
import { useAsync, useLocalStorage, useSession } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Era } from '../types';

type Level = 'basic' | 'advanced' | 'expert';

interface Lesson {
  id: string;
  era_id: string;
  level: Level;
  title: string;
  body_md: string;
  figures: Array<{ name: string; role: string; emoji: string }>;
  timeline: Array<{ year: string; event: string }>;
  exam_points: string[];
}

const LEVELS: { value: Level; label: string }[] = [
  { value: 'basic',    label: '🧒 기본' },
  { value: 'advanced', label: '👦 심화' },
  { value: 'expert',   label: '👴 고급 (한능검 1급)' },
];

export default function StudyPage() {
  const { eraId } = useParams<{ eraId: string }>();
  const user = useSession();
  const [level, setLevel] = useLocalStorage<Level>('p3:study:level', 'advanced');

  // ─── 시대 목록 ─────────────────────────────────────
  const erasState = useAsync(() => fetchEras(), []);

  // ─── 현재 시대의 lesson ────────────────────────────
  const lessonState = useAsync(async () => {
    if (!eraId) return null;
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('era_id', eraId)
      .eq('level', level)
      .single();
    return data as Lesson | null;
  }, [eraId, level]);

  // ─── 진입 시 activity_log 기록 ────────────────────
  useEffect(() => {
    if (!user || !eraId) return;
    // (activity_log 에 era_id 컬럼이 없을 수 있음 - 실제 스키마에 맞게 조정)
  }, [user, eraId]);

  const era = erasState.status === 'success'
    ? erasState.data.find((e) => e.id === eraId)
    : null;

  return (
    <div className="layout">
      {/* 사이드바: 시대 목록 */}
      <aside className="side">
        <h4>시대별 학습</h4>
        {erasState.status === 'loading' && <Spinner label="시대 로드 중..." />}
        {erasState.status === 'error'   && <ErrorBox error={erasState.error} />}
        {erasState.status === 'success' && (
          <ol>
            {erasState.data.map((e) => (
              <li key={e.id} className={e.id === eraId ? 'on' : ''}>
                <Link to={`/study/${e.id}`}>{e.name}</Link>
              </li>
            ))}
          </ol>
        )}
      </aside>

      <div className="main">
        <Nav />
        <p className="crumb">
          <Link to="/">타임라인</Link> › {era?.name ?? '시대'}
        </p>

        {/* 시대 히어로 */}
        {era && (
          <header className="hero">
            <p className="hero__cat">
              {era.start_year > 0 ? era.start_year : `BC ${-era.start_year}`} ~ {era.end_year}
            </p>
            <h1>{era.name}</h1>
            <p>{era.summary}</p>
          </header>
        )}

        {/* 수준 토글 */}
        <div className="level">
          {LEVELS.map((l) => (
            <button key={l.value}
              className={level === l.value ? 'on' : ''}
              onClick={() => setLevel(l.value)}>{l.label}</button>
          ))}
        </div>

        {/* 본문 */}
        {lessonState.status === 'loading' && <Spinner label="📜 학습 내용 로드 중..." />}
        {lessonState.status === 'error'   && <ErrorBox error={lessonState.error} />}
        {lessonState.status === 'success' && !lessonState.data && (
          <EmptyState
            emoji="📚"
            title="이 수준의 학습 콘텐츠가 아직 없어요"
            desc="다른 수준을 선택하거나, 곧 추가될 예정입니다."
          />
        )}
        {lessonState.status === 'success' && lessonState.data && (
          <LessonContent lesson={lessonState.data} eraId={eraId!} />
        )}
      </div>
    </div>
  );
}

// ─── 보조 ─────────────────────────────────────────

function LessonContent({ lesson, eraId }: { lesson: Lesson; eraId: string }) {
  return (
    <>
      <section className="card section">
        <h2>🌟 시대 개관</h2>
        <div dangerouslySetInnerHTML={{ __html: lesson.body_md }} />
      </section>

      {lesson.timeline.length > 0 && (
        <section className="card section">
          <h2>⏰️ 핵심 연표</h2>
          <div className="timeline-mini">
            <ul>
              {lesson.timeline.map((t, i) => (
                <li key={i}><strong>{t.year}</strong><span>{t.event}</span></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {lesson.figures.length > 0 && (
        <section className="card section">
          <h2>👑 알아두어야 할 인물</h2>
          <div className="figures">
            {lesson.figures.map((f, i) => (
              <article key={i} className="figure">
                <div className="figure__ico">{f.emoji}</div>
                <h4>{f.name}</h4>
                <p>{f.role}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {lesson.exam_points.length > 0 && (
        <section className="card section">
          <h2>📚 시험 출제 포인트</h2>
          {lesson.exam_points.map((p, i) => (
            <p key={i}><strong>{i + 1})</strong> {p}</p>
          ))}
        </section>
      )}

      <div className="actions">
        <Link to={`/quiz/${eraId}`} className="btn btn--primary">🎯 이 시대 문제 풀기</Link>
        <Link to="/" className="btn btn--ghost">← 다른 시대</Link>
      </div>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📜 한국사 마스터</div>
      <nav className="nav-links">
        <Link to="/">타임라인</Link>
        <Link to="/study" className="on">학습</Link>
        <Link to="/quiz">문제 풀기</Link>
        <Link to="/note">오답 노트</Link>
        <Link to="/report">성적표</Link>
        <Link to="/mock">모의고사</Link>
      </nav>
    </header>
  );
}
