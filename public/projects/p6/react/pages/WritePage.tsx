/**
 * WritePage — 자소서 작성 (3컬럼: 사이드/에디터/AI 코칭)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - 좌측: 문항 목록 (resume_questions, 진행 상태 표시)
 *   - 중앙: 선택된 문항의 에디터 (자동 저장 + 글자수 카운터)
 *   - 우측: 실시간 AI 코칭 + 글 분석
 *
 * 패턴:
 *   - useAsync 로 resume + questions 로드
 *   - useDebounce 로 800ms 후 자동 저장 (네트워크 절약)
 *   - 저장 시각 표시 ("12:34 저장됨")
 *   - AI 다듬기 → Edge Function 호출
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useDebounce } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Resume, ResumeQuestion } from '../types';

export default function WritePage() {
  const { id: resumeId } = useParams<{ id: string }>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [body, setBody]             = useState('');
  const [savedAt, setSavedAt]       = useState<Date | null>(null);
  const [polishing, setPolishing]   = useState(false);
  const [questions, setQuestions]   = useState<ResumeQuestion[]>([]);

  // ─── resume + questions 로드 ───────────────────────
  const state = useAsync(async () => {
    if (!resumeId) throw new Error('자소서 ID 가 없어요');
    const [{ data: r }, { data: qs }] = await Promise.all([
      supabase.from('resumes').select('*').eq('id', resumeId).single(),
      supabase.from('resume_questions').select('*').eq('resume_id', resumeId).order('ord'),
    ]);
    return { resume: r as Resume | null, questions: (qs ?? []) as ResumeQuestion[] };
  }, [resumeId]);

  // 첫 문항 자동 선택 + 로컬 questions 동기화
  useEffect(() => {
    if (state.status !== 'success') return;
    setQuestions(state.data.questions);
    if (!selectedId && state.data.questions[0]) {
      setSelectedId(state.data.questions[0].id);
      setBody(state.data.questions[0].answer_text ?? '');
    }
  }, [state.status]);

  function selectQuestion(qid: string) {
    // 현재 body 를 questions 에 반영해두기 (탭 전환 시 잃지 않도록)
    setQuestions((qs) => qs.map((q) => q.id === selectedId ? { ...q, answer_text: body } : q));
    setSelectedId(qid);
    const q = questions.find((x) => x.id === qid);
    setBody(q?.answer_text ?? '');
  }

  // ─── 자동 저장 (800ms debounce) ─────────────────────
  const debouncedBody = useDebounce(body, 800);
  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      const { error } = await supabase.from('resume_questions').update({
        answer_text: debouncedBody,
        status: debouncedBody.length > 100 ? 'draft' : 'empty',
      }).eq('id', selectedId);
      if (!error) {
        setSavedAt(new Date());
        setQuestions((qs) => qs.map((q) => q.id === selectedId
          ? { ...q, answer_text: debouncedBody, status: debouncedBody.length > 100 ? 'draft' : 'empty' }
          : q));
      }
    })();
  }, [debouncedBody, selectedId]);

  // ─── AI 다듬기 ──────────────────────────────────────
  async function polish() {
    if (!selectedId || polishing) return;
    setPolishing(true);
    try {
      const { data } = await supabase.functions.invoke('polish', {
        body: { text: body, question: questions.find((q) => q.id === selectedId)?.question_text },
      });
      if (data?.polished) setBody(data.polished);
    } finally {
      setPolishing(false);
    }
  }

  if (state.status === 'loading') return <><Nav /><Spinner /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;

  if (questions.length === 0) {
    return (
      <>
        <Nav />
        <EmptyState
          emoji="📝"
          title="아직 문항이 없어요"
          desc="자소서에 문항을 먼저 추가해주세요."
        />
      </>
    );
  }

  const current = questions.find((q) => q.id === selectedId);
  const charCount = body.length;

  return (
    <>
      <Nav />
      <Stepper active={2} />

      <main className="layout">
        {/* 좌측: 문항 목록 */}
        <aside className="side">
          <h4>📋 {state.data.resume?.title ?? '자소서'}</h4>
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`side__item ${q.status} ${selectedId === q.id ? 'on' : ''}`}
              onClick={() => selectQuestion(q.id)}
            >
              <span className="side__item__no">{q.status === 'done' ? '✓️' : i + 1}</span>
              {q.question_text.slice(0, 20)}...
            </div>
          ))}
        </aside>

        {/* 중앙: 에디터 */}
        <section className="card editor">
          {current && (
            <>
              <div className="editor__head">
                <div className="editor__q">
                  <p className="editor__q__label">
                    문항 {(questions.indexOf(current) + 1)} · {current.max_chars}자 이내
                    {savedAt && (
                      <small style={{ marginLeft: 12, color: 'var(--accent)' }}>
                        💾 {savedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 자동 저장됨
                      </small>
                    )}
                  </p>
                  <p className="editor__q__text">{current.question_text}</p>
                </div>
              </div>

              <div className="toolbar">
                <button onClick={() => setBody((b) => `**${b}**`)}>B 굵게</button>
                <button onClick={() => setBody((b) => `*${b}*`)}>I 기울임</button>
                <button onClick={polish} disabled={polishing}>
                  {polishing ? '✨️ 다듬는 중...' : '✨️ AI 다듬기'}
                </button>
              </div>

              <textarea
                className="editor__area"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={current.max_chars}
                placeholder="여기에 답변을 작성하세요. 자동으로 저장됩니다."
              />

              <div className="editor__foot">
                <span className="count" style={{ color: charCount > current.max_chars * 0.9 ? 'var(--danger)' : undefined }}>
                  <strong>{charCount}</strong> / {current.max_chars.toLocaleString()}자
                </span>
                <div className="actions">
                  <button className="btn btn--ghost"
                    onClick={async () => {
                      await supabase.from('resume_questions')
                        .update({ status: 'done' }).eq('id', selectedId!);
                      setQuestions((qs) => qs.map((q) =>
                        q.id === selectedId ? { ...q, status: 'done' } : q));
                    }}>
                    ✓️ 이 문항 완료
                  </button>
                  <Link to={`/feedback/${resumeId}`} className="btn btn--primary">
                    📊 AI 피드백 받기
                  </Link>
                </div>
              </div>
            </>
          )}
        </section>

        {/* 우측: AI 코칭 */}
        <aside className="ai-side">
          <div className="card ai-card">
            <h4>🤖 AI 실시간 코칭</h4>
            <p>
              {charCount === 0 && '첫 문장을 시작해보세요. 어떤 상황이었나요?'}
              {charCount > 0 && charCount < 100 && '더 구체적인 사례를 추가해 보세요. 숫자, 결과, 배운 점.'}
              {charCount >= 100 && charCount < 500 && '잘 진행되고 있어요. 정량적 결과도 포함하면 좋아요.'}
              {charCount >= 500 && '훌륭합니다. AI에게 다듬어달라 요청해보세요.'}
            </p>
            <button className="ai-card__action" onClick={polish} disabled={polishing}>
              {polishing ? '다듬는 중...' : '✨️ AI 다듬기'}
            </button>
          </div>

          <div className="card ai-card">
            <h4>📊 글 분석</h4>
            <p>
              가독성: <strong>{charCount > 300 ? '높음' : '중'}</strong><br/>
              문장 평균: <strong>{Math.round(body.length / (body.split(/[.!?]/).length || 1))}자</strong><br/>
              STAR 점수: <strong>—</strong>
            </p>
          </div>
        </aside>
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
        <Link to="/write" className="on">작성</Link>
        <Link to="/feedback">피드백</Link>
        <Link to="/interview">면접</Link>
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
