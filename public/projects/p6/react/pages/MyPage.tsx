/**
 * MyPage — 내 자소서 관리
 *
 * 회사별 자소서를 카드로 표시. 상태 뱃지 (작성/검토/제출/합격/탈락).
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Resume, Target } from '../types';

type ResumeWithTarget = Resume & { target: Target };

const STATUS_LABEL = {
  draft: '📝 작성 중',
  reviewing: '🔍 피드백 검토 중',
  submitted: '📤 제출 완료',
  passed: '✅ 서류 합격',
  rejected: '❌ 불합격',
};

const STATUS_CLASS = {
  draft: 'status--draft',
  reviewing: 'status--review',
  submitted: 'status--submitted',
  passed: 'status--pass',
  rejected: 'status--rejected',
};

export default function MyPage() {
  const [resumes, setResumes] = useState<ResumeWithTarget[]>([]);
  const [filter, setFilter]   = useState<string>('전체');

  useEffect(() => {
    supabase.from('resumes').select('*, target:targets(*)').then(({ data }) => {
      setResumes((data ?? []) as ResumeWithTarget[]);
    });
  }, []);

  const filtered = useMemo(() => {
    if (filter === '전체') return resumes;
    if (filter === '⭐') return resumes.filter((r) => r.is_favorite);
    return resumes.filter((r) => r.status === filter);
  }, [resumes, filter]);

  return (
    <>
      <Nav />
      <div className="page-head">
        <div>
          <h1>📂 내 자소서 관리</h1>
          <p>지원처별로 자소서를 모아서 관리하고 합격률을 추적해보세요.</p>
        </div>
        <Link to="/" className="btn btn--primary">+ 새 자소서</Link>
      </div>

      <div className="stats">
        <Stat label="총 자소서" value={resumes.length} suffix="개" />
        <Stat label="제출 완료" value={resumes.filter((r) => r.status === 'submitted' || r.status === 'passed').length} suffix="건" />
        <Stat label="서류 합격" value={resumes.filter((r) => r.status === 'passed').length} suffix="건" />
        <Stat label="평균 점수"
              value={resumes.length
                ? Math.round(resumes.reduce((s, r) => s + (r.overall_score ?? 0), 0) / resumes.length)
                : 0}
              suffix="" />
      </div>

      <div className="filters">
        <span className={`chip ${filter === '전체' ? 'on' : ''}`} onClick={() => setFilter('전체')}>
          전체 ({resumes.length})
        </span>
        <span className={`chip ${filter === 'draft' ? 'on' : ''}`} onClick={() => setFilter('draft')}>📝 작성 중</span>
        <span className={`chip ${filter === 'reviewing' ? 'on' : ''}`} onClick={() => setFilter('reviewing')}>🔍 검토 중</span>
        <span className={`chip ${filter === 'submitted' ? 'on' : ''}`} onClick={() => setFilter('submitted')}>📤 제출</span>
        <span className={`chip ${filter === 'passed' ? 'on' : ''}`} onClick={() => setFilter('passed')}>✅ 합격</span>
        <span className={`chip ${filter === '⭐' ? 'on' : ''}`} onClick={() => setFilter('⭐')}>⭐ 즐겨찾기</span>
      </div>

      <main className="list">
        {filtered.map((r) => <ResumeCard key={r.id} resume={r} />)}
        <Link to="/" className="new-doc card">
          <div>
            <div className="new-doc__plus">＋</div>
            <div className="new-doc__title">새 자소서 시작</div>
            <div className="new-doc__sub">경험 입력부터 5단계로 진행</div>
          </div>
        </Link>
      </main>
    </>
  );
}

function ResumeCard({ resume }: { resume: ResumeWithTarget }) {
  return (
    <article className="card doc-item">
      <button className={`doc-item__star ${resume.is_favorite ? 'on' : ''}`}>
        {resume.is_favorite ? '★' : '☆'}
      </button>
      <div className="doc-item__company">
        <div className="doc-item__logo" style={{ background: resume.target.logo_color }}>
          {resume.target.company[0]}
        </div>
        <div>
          <div className="doc-item__company-name">{resume.target.company}</div>
          <div className="doc-item__role">{resume.target.role}</div>
        </div>
      </div>
      <span className={`doc-item__status ${STATUS_CLASS[resume.status]}`}>
        {STATUS_LABEL[resume.status]}
      </span>
      <h3 className="doc-item__title">{resume.title}</h3>
      {resume.overall_score && (
        <div className="doc-item__score">
          <div className="doc-item__score-num">{resume.overall_score}</div>
          <div style={{ flex: 1 }}>
            <div className="doc-item__score-bar">
              <div className="doc-item__score-fill" style={{ width: `${resume.overall_score}%` }} />
            </div>
          </div>
        </div>
      )}
      <div className="doc-item__actions">
        <Link to={`/write/${resume.id}`} className="doc-item__btn">✏ 편집</Link>
        <Link to={`/feedback/${resume.id}`} className="doc-item__btn">📊 피드백</Link>
        <Link to={`/interview/${resume.id}`} className="doc-item__btn">🎤 면접</Link>
      </div>
    </article>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return <div className="stat"><span>{label}</span><strong>{value}{suffix}</strong></div>;
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📝 자소서 코치</div>
      <nav className="nav-links">
        <Link to="/">경험</Link>
        <Link to="/my" className="on">내 자소서</Link>
      </nav>
    </header>
  );
}
