/**
 * StarPage — STAR 구조화 결과
 *
 * 데이터: star_breakdowns 테이블 (experience_id 기준)
 * 4개 카드 + 자동 추출된 역량 점수 막대.
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import type { StarBreakdown, Experience } from '../types';

const LETTERS = [
  { key: 'situation', letter: 'S', title: 'Situation — 상황', sub: '언제, 어디서, 어떤 환경이었나' },
  { key: 'task',      letter: 'T', title: 'Task — 과제',      sub: '내가 해결해야 했던 핵심 과제' },
  { key: 'action',    letter: 'A', title: 'Action — 행동',    sub: '구체적으로 무엇을 했나 (가장 중요!)' },
  { key: 'result',    letter: 'R', title: 'Result — 결과',    sub: '정량적 성과 + 정성적 인정' },
] as const;

export default function StarPage() {
  const { id } = useParams<{ id: string }>();
  const [exp, setExp]   = useState<Experience | null>(null);
  const [star, setStar] = useState<StarBreakdown | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: e }, { data: s }] = await Promise.all([
        supabase.from('experiences').select('*').eq('id', id).single(),
        supabase.from('star_breakdowns').select('*').eq('experience_id', id).single(),
      ]);
      setExp(e as Experience);
      setStar(s as StarBreakdown);
    })();
  }, [id]);

  if (!exp || !star) return <p style={{ padding: 40 }}>🤖 AI 분석 중...</p>;

  return (
    <>
      <Nav />
      <Stepper active={1} />

      <div className="page-head">
        <h1>⭐ STAR로 정리했어요</h1>
        <p>입력하신 경험을 면접·자소서에 바로 쓸 수 있는 4가지 구조로 분해했습니다.</p>
      </div>

      <main className="body">
        {/* 원문 */}
        <article className="original">
          <div className="original__head">
            <h3>📝 입력 원문</h3>
            <small>
              {new Date(exp.created_at).toLocaleDateString('ko-KR')} · {exp.raw_text.length}자
            </small>
          </div>
          <p className="original__text">{exp.raw_text}</p>
        </article>

        {/* STAR 4단 */}
        <div className="stars">
          {LETTERS.map((L) => (
            <article key={L.key} className="card star">
              <div className="star__head">
                <div className="star__letter">{L.letter}</div>
                <div>
                  <h3 className="star__title">{L.title}</h3>
                  <span className="star__sub">{L.sub}</span>
                </div>
              </div>
              <p className="star__body">{star[L.key]}</p>
            </article>
          ))}
        </div>

        {/* 역량 점수 */}
        <article className="card competencies">
          <h3>🎯 자동 추출된 역량</h3>
          <div className="comp-grid">
            {Object.entries(star.competencies)
              .sort(([, a], [, b]) => b - a)
              .map(([name, score]) => (
                <div key={name} className="comp">
                  <span className="comp__score">{score}</span>
                  <span className="comp__name">{name}</span>
                  <div className="comp__bar">
                    <div className="comp__fill" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </article>

        <div className="actions">
          <Link to="/" className="btn btn--ghost">← 경험 다시 입력</Link>
          <Link to={`/write/${id}`} className="btn btn--primary">✍ 자소서 작성하기 →</Link>
        </div>
      </main>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📝 자소서 코치</div>
      <nav className="nav-links">
        <Link to="/">경험 입력</Link>
        <Link to="/star" className="on">STAR</Link>
        <Link to="/write">작성</Link>
        <Link to="/feedback">피드백</Link>
        <Link to="/interview">면접</Link>
        <Link to="/my">내 자소서</Link>
      </nav>
    </header>
  );
}

function Stepper({ active }: { active: number }) {
  return (
    <div className="stepper">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`step-dot ${i < active ? 'done' : i === active ? 'on' : ''}`}>{i + 1}</span>
      ))}
    </div>
  );
}
