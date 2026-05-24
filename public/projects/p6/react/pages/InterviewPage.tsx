/**
 * InterviewPage — 면접 예상 질문 (12선)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - 기존 interview_questions 가 있으면 재사용, 없으면 AI 생성
 *   - 카테고리 필터 (전체/인성/직무/기술/상황)
 *   - 난이도별 색상
 *   - 펼쳐서 체크 포인트 + 모범 답안 + 녹음 연습
 *
 * 패턴:
 *   - useAsync 로 기존 질문 로드 → 없으면 fallback 으로 generate
 *   - useState 로 카테고리 필터 + 열림 상태
 *   - useLocalStorage 로 "준비 완료" 상태 영속화
 */

import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { generateInterviewQuestions, supabase } from '../supabase';
import { useAsync, useLocalStorage } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { InterviewQuestion, Target } from '../types';

const DIFF_CLASS = {
  easy:  'iq__type--easy',
  mid:   'iq__type--mid',
  hard:  'iq__type--hard',
  xhard: 'iq__type--xhard',
} as const;

const DIFF_LABEL = { easy: '쉬움', mid: '중급', hard: '고급', xhard: '최고난도' };

const CATEGORIES = ['전체', '인성', '직무', '기술', '상황'];

export default function InterviewPage() {
  const { id: resumeId } = useParams<{ id: string }>();
  const [openId, setOpenId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('전체');
  const [readyMap, setReadyMap] = useLocalStorage<Record<string, boolean>>(
    `p6:interview:ready:${resumeId}`, {});

  // ─── 면접 질문 + 지원처 병렬 로드 ─────────────────
  const state = useAsync(async () => {
    if (!resumeId) throw new Error('자소서 ID 가 없어요');

    const [{ data: existing }, { data: r }] = await Promise.all([
      supabase.from('interview_questions').select('*').eq('resume_id', resumeId),
      supabase.from('resumes').select('target:targets(*)').eq('id', resumeId).single(),
    ]);

    const questions = existing && existing.length > 0
      ? existing as InterviewQuestion[]
      : await generateInterviewQuestions(resumeId);

    return { questions, target: (r?.target ?? null) as Target | null };
  }, [resumeId]);

  // ─── 카테고리 필터 ────────────────────────────────
  const filtered = useMemo(() => {
    if (state.status !== 'success') return [];
    if (category === '전체') return state.data.questions;
    return state.data.questions.filter((q) => q.category === category);
  }, [state, category]);

  function toggleReady(qid: string) {
    setReadyMap({ ...readyMap, [qid]: !readyMap[qid] });
  }

  if (state.status === 'loading') return <><Nav /><Spinner label="🤖 면접 질문 준비 중..." /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;

  const { questions, target } = state.data;
  const readyCount = questions.filter((q) => readyMap[q.id]).length;

  return (
    <>
      <Nav />
      <Stepper active={4} />

      <div className="page-head">
        <h1>🎤 예상 면접 질문 {questions.length}선</h1>
        <p>자소서를 기반으로 면접관이 실제로 물을 만한 질문을 AI가 예측했습니다.
          {readyCount > 0 && (
            <strong style={{ marginLeft: 8, color: 'var(--accent)' }}>
              · {readyCount}/{questions.length} 준비 완료
            </strong>
          )}
        </p>
      </div>

      {target && (
        <div className="target">
          <article className="card target__inner">
            <div className="target__logo" style={{ background: target.logo_color }}>
              {target.company[0]}
            </div>
            <div>
              <h2 className="target__title">{target.company} · {target.role}</h2>
              <p className="target__sub">{questions.length}문항 · 예상 60분</p>
            </div>
          </article>
        </div>
      )}

      {/* 카테고리 필터 */}
      <div className="filters" style={{ padding: '12px 24px' }}>
        {CATEGORIES.map((c) => (
          <span key={c}
            className={`chip ${category === c ? 'on' : ''}`}
            onClick={() => setCategory(c)}>{c}</span>
        ))}
      </div>

      <main className="qs">
        {filtered.length === 0 ? (
          <EmptyState
            emoji="🎤"
            title={`"${category}" 질문이 없어요`}
            desc="다른 카테고리를 선택해보세요."
          />
        ) : filtered.map((q) => {
          const isReady = readyMap[q.id];
          const isOpen = openId === q.id;
          return (
            <article
              key={q.id}
              className={`card iq ${isOpen ? 'open' : ''} ${isReady ? 'ready' : ''}`}
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName === 'BUTTON') return;
                setOpenId(isOpen ? null : q.id);
              }}
            >
              <span className="iq__caret">▼</span>
              <span className={`iq__type ${DIFF_CLASS[q.difficulty]}`}>
                {q.category} · {DIFF_LABEL[q.difficulty]}
                {isReady && ' · ✓ 준비완료'}
              </span>
              <h3 className="iq__q">{q.question}</h3>

              {isOpen && (
                <div className="iq__detail">
                  {q.checklist.length > 0 && (
                    <div className="iq__sec">
                      <h5>✅ 답변 시 체크 포인트</h5>
                      <ul>{q.checklist.map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </div>
                  )}
                  {q.model_answer && (
                    <div className="iq__sec">
                      <h5>🎯 모범 답안 예시</h5>
                      <div className="iq__model">{q.model_answer}</div>
                    </div>
                  )}
                  <div className="iq__actions">
                    <button className="iq__action iq__action--rec">🎙 녹음 연습</button>
                    <button className="iq__action">📝 내 답변 작성</button>
                    <button className="iq__action" onClick={() => toggleReady(q.id)}>
                      {isReady ? '◯ 준비 취소' : '✓ 준비 완료'}
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </main>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📝 자소서 코치</div>
      <nav className="nav-links">
        <Link to="/">경험</Link>
        <Link to="/star">STAR</Link>
        <Link to="/write">작성</Link>
        <Link to="/feedback">피드백</Link>
        <Link to="/interview" className="on">면접</Link>
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
