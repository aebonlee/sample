/**
 * MockPage — 한능검 모의고사 (50문제 90분)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - 모의고사 50문제 일괄 로드 → 시작 화면 → 진행 화면
 *   - 90분 타이머 (useInterval)
 *   - 답안 객체로 누적 (id → picked_index)
 *   - 제출 시 mock_exams 테이블 INSERT + 결과 페이지로
 *
 * 패턴:
 *   - useAsync 로 문제 로드
 *   - useInterval 로 1초 타이머
 *   - 페이지 이탈 방지 (beforeunload)
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useInterval, useSession } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Question } from '../types';

const EXAM_MIN = 90;

export default function MockPage() {
  const nav = useNavigate();
  const user = useSession();
  const [phase, setPhase]     = useState<'ready' | 'running' | 'submit'>('ready');
  const [idx, setIdx]         = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [remain, setRemain]   = useState(EXAM_MIN * 60);
  const [submitting, setSubmitting] = useState(false);

  // 50문제 일괄 로드 (난이도 분포 고려해 랜덤 추출 — 실제로는 RPC 권장)
  const state = useAsync(async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .limit(50);
    if (error) throw error;
    return (data ?? []) as Question[];
  }, []);

  // 1초 타이머
  useInterval(() => {
    if (phase !== 'running') return;
    setRemain((r) => Math.max(0, r - 1));
  }, phase === 'running' ? 1000 : null);

  // 시간 끝 → 자동 제출
  useEffect(() => {
    if (phase === 'running' && remain === 0) submit();
  }, [remain, phase]);

  // 이탈 방지
  useEffect(() => {
    if (phase !== 'running') return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  function start() {
    setPhase('running'); setIdx(0); setAnswers({}); setRemain(EXAM_MIN * 60);
  }

  async function submit() {
    if (submitting || state.status !== 'success') return;
    setSubmitting(true);
    const questions = state.data;
    const total = questions.length;
    let correct = 0;
    questions.forEach((q) => { if (answers[q.id] === q.answer_index) correct++; });

    try {
      const { data } = await supabase.from('mock_exams').insert({
        user_id: user?.id,
        total,
        correct,
        elapsed_sec: EXAM_MIN * 60 - remain,
        answers,
      }).select().single();

      if (data) nav(`/mock/${data.id}/result`);
      else setPhase('submit');
    } catch {
      setPhase('submit');
    } finally {
      setSubmitting(false);
    }
  }

  if (state.status === 'loading') return <><Nav /><Spinner /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;
  if (state.data.length < 50) {
    return (
      <>
        <Nav />
        <EmptyState
          emoji="📚"
          title="모의고사 문제가 부족해요"
          desc={`현재 ${state.data.length}개 / 50개 필요`}
        />
      </>
    );
  }

  const questions = state.data;

  // ─── 시작 화면 ────────────────────────────────────
  if (phase === 'ready') {
    return (
      <>
        <Nav />
        <div className="page-head">
          <h1>📝 한능검 모의고사</h1>
          <p>실제 시험과 같은 조건으로 풀어보세요. 50문제, 90분.</p>
        </div>
        <main className="quiz">
          <article className="qcard card" style={{ textAlign: 'center', padding: 40 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: 20 }}>🎯 모의고사 1회</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginBottom: 24 }}>
              <Info label="문제" value="50문제" />
              <Info label="시간" value="90분" />
              <Info label="배점" value="100점" />
            </div>
            <p style={{ color: 'var(--text-mute)', marginBottom: 24 }}>
              한번 시작하면 일시정지할 수 없어요.<br />
              시간이 다 되면 자동 제출됩니다.
            </p>
            <button className="btn btn--primary" onClick={start}
                    style={{ padding: '14px 40px', fontSize: '1.1rem' }}>
              ▶️ 시작하기
            </button>
          </article>
        </main>
      </>
    );
  }

  // ─── 제출 (오프라인 폴백) ──────────────────────────
  if (phase === 'submit') {
    const correct = questions.filter((q) => answers[q.id] === q.answer_index).length;
    return (
      <>
        <Nav />
        <main className="quiz">
          <article className="qcard card" style={{ textAlign: 'center', padding: 40 }}>
            <h2>📊 모의고사 결과</h2>
            <p style={{ fontSize: '3rem', margin: '20px 0' }}>{correct} / 50</p>
            <p>정답률 {Math.round((correct / 50) * 100)}%</p>
            <Link to="/" className="btn btn--primary">처음으로</Link>
          </article>
        </main>
      </>
    );
  }

  // ─── 진행 중 ──────────────────────────────────────
  const q = questions[idx];
  const min = Math.floor(remain / 60);
  const sec = remain % 60;

  return (
    <>
      <Nav />
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>📝 모의고사 진행 중</h1>
        <strong style={{ fontSize: '1.5rem', color: remain < 600 ? 'var(--danger)' : 'var(--primary)' }}>
          ⏱️ {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
        </strong>
      </div>

      <main className="quiz">
        <div className="meta">
          <span>{idx + 1} / {questions.length}</span>
          <div className="progress">
            <div className="bar">
              <div className="bar__fill" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
            </div>
          </div>
          <span>답안: {Object.keys(answers).length}</span>
        </div>

        <article className="qcard card">
          <h2 className="qcard__q">{q.question}</h2>
          {q.source_text && <div className="source">"{q.source_text}"</div>}
          <div className="opts">
            {q.options.map((opt, i) => (
              <button key={i}
                className={`opt ${answers[q.id] === i ? 'on' : ''}`}
                onClick={() => setAnswers({ ...answers, [q.id]: i })}>
                <span className="opt__num">{'①②③④⑤'[i]}</span>
                <span className="opt__text">{opt}</span>
              </button>
            ))}
          </div>

          <div className="actions">
            <button className="btn btn--ghost"
              onClick={() => setIdx(Math.max(0, idx - 1))}
              disabled={idx === 0}>← 이전</button>
            {idx < questions.length - 1 ? (
              <button className="btn btn--primary" onClick={() => setIdx(idx + 1)}>다음 →</button>
            ) : (
              <button className="btn btn--primary" onClick={submit}
                      disabled={submitting}>
                {submitting ? '제출 중...' : '✓️ 제출하기'}
              </button>
            )}
          </div>
        </article>
      </main>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: '.85rem', color: 'var(--text-mute)' }}>{label}</p>
      <strong style={{ fontSize: '1.5rem' }}>{value}</strong>
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
        <Link to="/report">성적표</Link>
        <Link to="/mock" className="on">모의고사</Link>
      </nav>
    </header>
  );
}
