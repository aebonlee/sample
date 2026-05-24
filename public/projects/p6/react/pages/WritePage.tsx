/**
 * WritePage — 자소서 작성 (3컬럼: 사이드/에디터/AI 코칭)
 *
 * 좌측: 문항 목록 (resume_questions)
 * 중앙: 선택된 문항의 에디터 (Tiptap 권장)
 * 우측: 실시간 AI 코칭
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Resume, ResumeQuestion } from '../types';

export default function WritePage() {
  const { id: resumeId } = useParams<{ id: string }>();
  const [resume, setResume]       = useState<Resume | null>(null);
  const [questions, setQuestions] = useState<ResumeQuestion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [body, setBody]           = useState('');

  // ─── 자소서 + 문항 로드 ─────────────────────────────
  useEffect(() => {
    if (!resumeId) return;
    (async () => {
      const [{ data: r }, { data: qs }] = await Promise.all([
        supabase.from('resumes').select('*').eq('id', resumeId).single(),
        supabase.from('resume_questions').select('*').eq('resume_id', resumeId).order('ord'),
      ]);
      setResume(r as Resume);
      const list = (qs ?? []) as ResumeQuestion[];
      setQuestions(list);
      if (list[0]) {
        setSelectedId(list[0].id);
        setBody(list[0].answer_text ?? '');
      }
    })();
  }, [resumeId]);

  function selectQuestion(qid: string) {
    setSelectedId(qid);
    const q = questions.find((x) => x.id === qid);
    setBody(q?.answer_text ?? '');
  }

  // ─── 자동 저장 (debounce) ───────────────────────────
  useEffect(() => {
    if (!selectedId) return;
    const t = setTimeout(() => {
      supabase.from('resume_questions').update({
        answer_text: body,
        status: body.length > 100 ? 'draft' : 'empty',
      }).eq('id', selectedId);
    }, 800);
    return () => clearTimeout(t);
  }, [body, selectedId]);

  const current = questions.find((q) => q.id === selectedId);
  const charCount = body.length;

  return (
    <>
      <Nav />
      <Stepper active={2} />

      <main className="layout">
        {/* 좌측: 문항 목록 */}
        <aside className="side">
          <h4>📋 {resume?.title ?? '자소서'}</h4>
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`side__item ${q.status} ${selectedId === q.id ? 'on' : ''}`}
              onClick={() => selectQuestion(q.id)}
            >
              <span className="side__item__no">{i + 1}</span>
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
                  <p className="editor__q__label">문항 {(questions.indexOf(current) + 1)} · {current.max_chars}자 이내</p>
                  <p className="editor__q__text">{current.question_text}</p>
                </div>
              </div>

              <div className="toolbar">
                <button>B 굵게</button>
                <button>I 기울임</button>
                <button>📋 STAR 적용</button>
                <button>✨ AI 다듬기</button>
              </div>

              <textarea
                className="editor__area"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={current.max_chars}
              />

              <div className="editor__foot">
                <span className="count">
                  <strong>{charCount}</strong> / {current.max_chars.toLocaleString()}자
                </span>
                <div className="actions">
                  <button className="btn btn--ghost">💾 임시저장</button>
                  <Link to={`/feedback/${resumeId}`} className="btn btn--primary">✓ 작성 완료</Link>
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
              {charCount < 100 && '더 구체적인 사례를 추가해 보세요.'}
              {charCount >= 100 && charCount < 500 && '잘 진행되고 있어요. 정량적 결과도 포함하면 좋아요.'}
              {charCount >= 500 && '훌륭합니다. AI에게 다듬어달라 요청해보세요.'}
            </p>
            <button className="ai-card__action">✨ AI 다듬기</button>
          </div>

          <div className="card ai-card">
            <h4>📊 글 분석</h4>
            <p>
              가독성: <strong>중</strong><br/>
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
