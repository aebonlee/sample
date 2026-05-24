/**
 * InterviewPage — 면접 예상 질문 (12선)
 *
 * generateInterviewQuestions() 로 자소서 기반 예상 질문 생성.
 * 각 질문은 접었다 펴는 디테일 (모범 답안 + 체크포인트).
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { generateInterviewQuestions, supabase } from '../supabase';
import type { InterviewQuestion, Target } from '../types';

const DIFF_CLASS = {
  easy:  'iq__type--easy',
  mid:   'iq__type--mid',
  hard:  'iq__type--hard',
  xhard: 'iq__type--xhard',
} as const;

const DIFF_LABEL = {
  easy:  '쉬움',
  mid:   '중급',
  hard:  '고급',
  xhard: '최고난도',
};

export default function InterviewPage() {
  const { id: resumeId } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [target, setTarget]       = useState<Target | null>(null);
  const [openId, setOpenId]       = useState<string | null>(null);

  useEffect(() => {
    if (!resumeId) return;
    (async () => {
      // 기존 면접 질문 또는 새로 생성
      const { data: existing } = await supabase
        .from('interview_questions').select('*').eq('resume_id', resumeId);
      const qs = existing && existing.length > 0
        ? existing as InterviewQuestion[]
        : await generateInterviewQuestions(resumeId);
      setQuestions(qs);

      // 지원처 정보
      const { data: r } = await supabase
        .from('resumes').select('target:targets(*)').eq('id', resumeId).single();
      if (r?.target) setTarget(r.target as Target);
    })();
  }, [resumeId]);

  return (
    <>
      <Nav />
      <Stepper active={4} />

      <div className="page-head">
        <h1>🎤 예상 면접 질문 {questions.length}선</h1>
        <p>자소서를 기반으로 면접관이 실제로 물을 만한 질문을 AI가 예측했습니다.</p>
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

      <main className="qs">
        {questions.map((q) => (
          <article
            key={q.id}
            className={`card iq ${openId === q.id ? 'open' : ''}`}
            onClick={() => setOpenId(openId === q.id ? null : q.id)}
          >
            <span className="iq__caret">▼</span>
            <span className={`iq__type ${DIFF_CLASS[q.difficulty]}`}>
              {q.category} · {DIFF_LABEL[q.difficulty]}
            </span>
            <h3 className="iq__q">{q.question}</h3>

            {openId === q.id && (
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
                  <button className="iq__action">✓ 준비 완료</button>
                </div>
              </div>
            )}
          </article>
        ))}
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
