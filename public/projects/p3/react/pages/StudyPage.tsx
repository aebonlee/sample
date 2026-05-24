/**
 * StudyPage — 시대별 학습 (수준 토글 + 본문)
 *
 * 핵심:
 *   - 사이드바: 10개 시대 (완료/현재/잠금)
 *   - 메인: 시대 개관 + 수준 토글(기본/심화/한능검 1급) + 본문
 *   - lessons 테이블에서 level 별 콘텐츠 로드
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, fetchEras } from '../supabase';
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
  const [eras, setEras]     = useState<Era[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [level, setLevel]   = useState<Level>('advanced');

  useEffect(() => { fetchEras().then(setEras); }, []);

  useEffect(() => {
    if (!eraId) return;
    supabase
      .from('lessons')
      .select('*')
      .eq('era_id', eraId)
      .eq('level', level)
      .single()
      .then(({ data }) => setLesson(data as Lesson | null));
  }, [eraId, level]);

  const era = eras.find((e) => e.id === eraId);

  return (
    <div className="layout">
      {/* 사이드바: 시대 목록 */}
      <aside className="side">
        <h4>시대별 학습</h4>
        <ol>
          {eras.map((e) => (
            <li key={e.id} className={e.id === eraId ? 'on' : ''}>
              <Link to={`/study/${e.id}`}>{e.name}</Link>
            </li>
          ))}
        </ol>
      </aside>

      <div className="main">
        <Nav />
        <p className="crumb"><Link to="/">타임라인</Link> › {era?.name}</p>

        <header className="hero">
          <p className="hero__cat">
            {era && (era.start_year > 0 ? era.start_year : `BC ${-era.start_year}`)} ~ {era?.end_year}
          </p>
          <h1>{era?.name}</h1>
          <p>{era?.summary}</p>
        </header>

        {/* 수준 토글 */}
        <div className="level">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              className={level === l.value ? 'on' : ''}
              onClick={() => setLevel(l.value)}
            >{l.label}</button>
          ))}
        </div>

        {/* 본문 */}
        {lesson ? (
          <>
            <section className="card section">
              <h2>🌟 시대 개관</h2>
              <div dangerouslySetInnerHTML={{ __html: lesson.body_md }} />
            </section>

            <section className="card section">
              <h2>⏰ 핵심 연표</h2>
              <div className="timeline-mini">
                <ul>
                  {lesson.timeline.map((t, i) => (
                    <li key={i}><strong>{t.year}</strong><span>{t.event}</span></li>
                  ))}
                </ul>
              </div>
            </section>

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

            <section className="card section">
              <h2>📚 시험 출제 포인트</h2>
              {lesson.exam_points.map((p, i) => (
                <p key={i}><strong>{i + 1})</strong> {p}</p>
              ))}
            </section>
          </>
        ) : (
          <p style={{ color: 'var(--text-mute)' }}>📜 학습 콘텐츠를 불러오는 중...</p>
        )}

        <div className="actions">
          <Link to={`/quiz/${eraId}`} className="btn btn--primary">🎯 이 시대 문제 풀기</Link>
          <Link to="/" className="btn btn--ghost">← 다른 시대</Link>
        </div>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📜 한국사 마스터</div>
      <nav className="nav-links">
        <Link to="/">타임라인</Link>
        <Link to={`/study/${''}`} className="on">학습</Link>
        <Link to="/quiz">문제 풀기</Link>
        <Link to="/note">오답 노트</Link>
        <Link to="/report">성적표</Link>
        <Link to="/mock">모의고사</Link>
      </nav>
    </header>
  );
}
