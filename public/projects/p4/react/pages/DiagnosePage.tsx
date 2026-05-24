/**
 * DiagnosePage — 진단 평가 시작 화면 + 평가 진행
 * ────────────────────────────────────────────────────────────
 * 두 가지 화면이 한 컴포넌트에 있어요:
 *   - 시작 전: 자격증 정보 + 평가 개요 + "시작" 버튼
 *   - 시작 후: 25문항 풀이 화면 + 진행률 + 타이머
 *
 * 흐름:
 *   1) 자격증 + 과목 정보 로드 (joined query)
 *   2) "시작" → 3초 카운트다운 → Edge Function 'diagnose' 호출 → 문제 25개 선별
 *   3) 한 문제씩 답 선택 → answers 배열에 저장
 *   4) "제출" → grade Edge Function → ResultPage 이동
 *
 * 패턴:
 *   - useInterval 로 타이머 + 카운트다운
 *   - useLocalStorage 로 진행 중 답안 자동 저장 (이탈 시 복구)
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useInterval, useLocalStorage } from '../hooks';
import { Spinner, ErrorBox } from '../components/Common';
import type { Certification, Question, Subject } from '../types';

const DURATION_MIN = 30;
const TOTAL_Q = 25;

type Phase = 'intro' | 'countdown' | 'taking' | 'submitting';

export default function DiagnosePage() {
  const { certId } = useParams<{ certId: string }>();
  const navigate = useNavigate();
  const [phase, setPhase]       = useState<Phase>('intro');
  const [countdown, setCountdown] = useState(3);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers]   = useLocalStorage<Record<string, number>>(`p4:diag:${certId}`, {});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION_MIN * 60);

  // ─── 자격증 + 과목 ─────────────────────────────────
  const certState = useAsync(async () => {
    if (!certId) throw new Error('잘못된 접근');
    const { data, error } = await supabase
      .from('certifications')
      .select('*, subjects(*)')
      .eq('id', certId)
      .single();
    if (error) throw error;
    return data as Certification & { subjects: Subject[] };
  }, [certId]);

  // ─── 카운트다운 → 시작 ─────────────────────────────
  useInterval(() => {
    if (phase !== 'countdown') return;
    setCountdown((c) => {
      if (c <= 1) {
        startTaking();
        return 0;
      }
      return c - 1;
    });
  }, phase === 'countdown' ? 800 : null);

  // ─── 시험 타이머 (1초 카운트다운) ───────────────────
  useInterval(() => {
    if (phase !== 'taking') return;
    setTimeLeft((s) => {
      if (s <= 1) { submit(); return 0; }
      return s - 1;
    });
  }, phase === 'taking' ? 1000 : null);

  async function startTaking() {
    setPhase('taking');
    setTimeLeft(DURATION_MIN * 60);

    // 실제: Edge Function 'diagnose' 호출
    const { data } = await supabase.functions.invoke('diagnose', {
      body: { cert_id: certId, count: TOTAL_Q },
    });
    setQuestions(((data?.questions) ?? []) as Question[]);
  }

  async function submit() {
    setPhase('submitting');
    // grade Edge Function
    const { data } = await supabase.functions.invoke('grade', {
      body: { cert_id: certId, answers },
    });
    setAnswers({});   // 진행 답안 초기화
    navigate(`/result/${data?.diagnosis_id ?? 'sample'}`);
  }

  function pickAnswer(qId: string, optIdx: number) {
    setAnswers({ ...answers, [qId]: optIdx });
  }

  if (certState.status === 'loading') return <><Nav /><Spinner /></>;
  if (certState.status === 'error')   return <><Nav /><ErrorBox error={certState.error} /></>;
  if (certState.status !== 'success') return null;
  const cert = certState.data;

  // ─── 카운트다운 화면 ─────────────────────────────
  if (phase === 'countdown') {
    return (
      <>
        <Nav />
        <div className="timer-modal">
          <div className="timer-modal__panel">
            <div className="timer-modal__count">{countdown}</div>
            <p style={{ margin: 0, color: 'var(--text-dim)' }}>곧 시작됩니다…</p>
          </div>
        </div>
      </>
    );
  }

  // ─── 시작 전 화면 ────────────────────────────────
  if (phase === 'intro') {
    return (
      <>
        <Nav />
        <div className="page-head">
          <span className="badge">{cert.name}</span>
          <h1>🩺 진단 평가</h1>
          <p>현재 실력을 정확히 파악한 후 맞춤 학습 계획을 만들어드립니다.</p>
        </div>

        <main className="intro">
          <article className="info card">
            <div className="info__head">
              <div className="info__ico">💻</div>
              <div>
                <h2 className="info__title">{cert.name} — 종합 진단</h2>
                <p className="info__sub">{TOTAL_Q}문항 · 약 {DURATION_MIN}분 소요</p>
              </div>
            </div>
            <div className="info__grid">
              <div><span>총 문항</span><strong>{TOTAL_Q}문제</strong></div>
              <div><span>제한 시간</span><strong>{DURATION_MIN}분</strong></div>
              <div><span>난이도</span><strong>★️★️★️☆️☆️</strong></div>
            </div>

            {/* 과목별 출제 비중 */}
            {cert.subjects.length > 0 && (
              <>
                <h3 style={{ marginTop: 20, fontSize: '.9rem', color: 'var(--text-mute)' }}>📚 평가 과목</h3>
                <div className="subjects">
                  {cert.subjects.map((s, i) => (
                    <div key={s.id} className="subj">
                      <span className="subj__no">{i + 1}</span>
                      <span className="subj__name">{s.name}</span>
                      <span className="subj__cnt">{Math.round(TOTAL_Q / cert.subjects.length)}문항</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ background: 'rgba(245,158,11,.08)', borderLeft: '3px solid var(--warn)',
                         padding: '12px 14px', borderRadius: '0 10px 10px 0', fontSize: '.85rem' }}>
              💡 <strong>안내</strong>: 진단 평가는 횟수 제한 없이 다시 볼 수 있어요. 한 번 풀면 결과가 자동 저장됩니다.
              진행 중에 종료해도 답안이 임시 저장되어 다음 방문 시 이어서 풀 수 있어요.
            </div>
          </article>

          <div className="card start" style={{ marginTop: 16 }}>
            <p className="start__big">준비되셨나요?</p>
            <p className="start__sub">진단을 시작하면 {DURATION_MIN}분 타이머가 자동으로 작동합니다.</p>
            <button className="btn btn--primary"
                    onClick={() => { setPhase('countdown'); setCountdown(3); }}>
              🩺 진단 시작 →
            </button>
          </div>
        </main>
      </>
    );
  }

  // ─── 제출 중 ────────────────────────────────────
  if (phase === 'submitting') {
    return <><Nav /><Spinner label="🤖 채점 중..." /></>;
  }

  // ─── 시험 진행 화면 ───────────────────────────────
  const q = questions[currentIdx];
  if (!q) return <><Nav /><Spinner label="문제를 불러오는 중..." /></>;

  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  const answered = Object.keys(answers).length;

  return (
    <>
      <Nav />

      {/* 타이머 + 진행률 */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--surface)',
                   borderBottom: '1px solid var(--border)', padding: '12px 24px',
                   display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
        <span>문항 {currentIdx + 1} / {TOTAL_Q}</span>
        <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden', margin: '0 16px' }}>
          <div style={{ height: '100%', width: `${(answered / TOTAL_Q) * 100}%`,
                       background: 'var(--accent)' }} />
        </div>
        <span style={{ color: timeLeft < 300 ? 'var(--danger)' : 'var(--text-dim)', fontFamily: 'monospace' }}>
          ⏱️ {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
        </span>
      </div>

      {/* 문제 */}
      <main style={{ maxWidth: 760, margin: '24px auto', padding: '0 24px' }}>
        <article className="card" style={{ padding: 28 }}>
          <h2 style={{ marginTop: 0, fontSize: '1.05rem', lineHeight: 1.7 }}>{q.question}</h2>
          {q.code_snippet && (
            <pre style={{ background: '#1e1e2e', color: '#e0e0e0', padding: '12px 14px',
                         borderRadius: 8, overflowX: 'auto', fontSize: '.85rem' }}>
              {q.code_snippet}
            </pre>
          )}
          <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
            {q.options?.map((opt, i) => (
              <button key={i}
                onClick={() => pickAnswer(q.id, i)}
                style={{
                  padding: '12px 16px', borderRadius: 10, textAlign: 'left',
                  border: '2px solid ' + (answers[q.id] === i ? 'var(--accent)' : 'var(--border)'),
                  background: answers[q.id] === i ? 'rgba(2,132,199,.06)' : 'var(--surface)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '.92rem',
                }}>
                <strong style={{ marginRight: 10, color: answers[q.id] === i ? 'var(--accent)' : 'var(--text-mute)' }}>
                  {'①②③④⑤'[i]}
                </strong>
                {opt}
              </button>
            ))}
          </div>
        </article>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <button className="btn btn--ghost"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(currentIdx - 1)}>← 이전</button>
          {currentIdx === TOTAL_Q - 1 ? (
            <button className="btn btn--primary" onClick={submit}>제출 →</button>
          ) : (
            <button className="btn btn--primary"
                    onClick={() => setCurrentIdx(currentIdx + 1)}>다음 →</button>
          )}
        </div>
      </main>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🎓 자격증 코치</div>
      <nav className="nav-links">
        <Link to="/">자격증 선택</Link>
        <Link to="/diagnose" className="on">진단</Link>
      </nav>
    </header>
  );
}
