/**
 * MyPage — 내 자소서 관리
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - resumes (with target) 로드 → 카드 그리드
 *   - 상태 뱃지 (작성/검토/제출/합격/탈락)
 *   - 필터: 전체/상태별/즐겨찾기
 *   - 즐겨찾기 토글 (옵티미스틱)
 *
 * 패턴:
 *   - useAsync 로 로드 + 로컬 state 로 즐겨찾기 토글
 *   - useMemo 로 필터 결과
 *   - useLocalStorage 로 마지막 필터 영속화
 */

import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useLocalStorage } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Resume, Target } from '../types';

type ResumeWithTarget = Resume & { target: Target };

const STATUS_LABEL: Record<string, string> = {
  draft: '📝 작성 중',
  reviewing: '🔍 피드백 검토 중',
  submitted: '📤 제출 완료',
  passed: '✅️ 서류 합격',
  rejected: '❌ 불합격',
};

const STATUS_CLASS: Record<string, string> = {
  draft: 'status--draft',
  reviewing: 'status--review',
  submitted: 'status--submitted',
  passed: 'status--pass',
  rejected: 'status--rejected',
};

export default function MyPage() {
  const [filter, setFilter] = useLocalStorage<string>('p6:my:filter', '전체');
  const [resumes, setResumes] = useState<ResumeWithTarget[]>([]);

  // ─── 자소서 로드 ─────────────────────────────────
  const state = useAsync(async () => {
    const { data, error } = await supabase
      .from('resumes')
      .select('*, target:targets(*)')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ResumeWithTarget[];
  }, []);

  useEffect(() => {
    if (state.status === 'success') setResumes(state.data);
  }, [state.status]);

  // ─── 즐겨찾기 토글 (옵티미스틱) ────────────────────
  async function toggleFav(r: ResumeWithTarget) {
    const newVal = !r.is_favorite;
    setResumes((arr) => arr.map((x) => x.id === r.id ? { ...x, is_favorite: newVal } : x));
    const { error } = await supabase.from('resumes').update({ is_favorite: newVal }).eq('id', r.id);
    if (error) {
      // 롤백
      setResumes((arr) => arr.map((x) => x.id === r.id ? { ...x, is_favorite: !newVal } : x));
    }
  }

  // ─── 필터 적용 ───────────────────────────────────
  const filtered = useMemo(() => {
    if (filter === '전체') return resumes;
    if (filter === '⭐️') return resumes.filter((r) => r.is_favorite);
    return resumes.filter((r) => r.status === filter);
  }, [resumes, filter]);

  if (state.status === 'loading') return <><Nav /><Spinner /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;

  const passedCount = resumes.filter((r) => r.status === 'passed').length;
  const submittedCount = resumes.filter((r) => r.status === 'submitted' || r.status === 'passed').length;
  const passRate = submittedCount > 0 ? Math.round((passedCount / submittedCount) * 100) : 0;

  return (
    <>
      <Nav />
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>📂 내 자소서 관리</h1>
          <p>지원처별로 자소서를 모아서 관리하고 합격률을 추적해보세요.</p>
        </div>
        <Link to="/" className="btn btn--primary">+ 새 자소서</Link>
      </div>

      <div className="stats">
        <Stat label="총 자소서"  value={resumes.length}      suffix="개" />
        <Stat label="제출 완료"  value={submittedCount}      suffix="건" />
        <Stat label="서류 합격"  value={passedCount}         suffix="건" />
        <Stat label="합격률"     value={passRate}            suffix="%" />
      </div>

      <div className="filters">
        {[
          { key: '전체',      label: `전체 (${resumes.length})` },
          { key: 'draft',     label: '📝 작성 중' },
          { key: 'reviewing', label: '🔍 검토 중' },
          { key: 'submitted', label: '📤 제출' },
          { key: 'passed',    label: '✅️ 합격' },
          { key: '⭐️',        label: '⭐️ 즐겨찾기' },
        ].map(({ key, label }) => (
          <span key={key}
            className={`chip ${filter === key ? 'on' : ''}`}
            onClick={() => setFilter(key)}>
            {label}
          </span>
        ))}
      </div>

      <main className="list">
        {filtered.length === 0 ? (
          <EmptyState
            emoji="📂"
            title={filter === '전체' ? '아직 자소서가 없어요' : `"${filter}" 자소서가 없어요`}
            desc="새 자소서를 시작하면 5단계로 진행됩니다."
          />
        ) : (
          <>
            {filtered.map((r) => <ResumeCard key={r.id} resume={r} onToggleFav={() => toggleFav(r)} />)}
            <Link to="/" className="new-doc card">
              <div>
                <div className="new-doc__plus">＋</div>
                <div className="new-doc__title">새 자소서 시작</div>
                <div className="new-doc__sub">경험 입력부터 5단계로 진행</div>
              </div>
            </Link>
          </>
        )}
      </main>
    </>
  );
}

function ResumeCard({ resume, onToggleFav }: { resume: ResumeWithTarget; onToggleFav: () => void }) {
  return (
    <article className="card doc-item">
      <button
        className={`doc-item__star ${resume.is_favorite ? 'on' : ''}`}
        onClick={onToggleFav}>
        {resume.is_favorite ? '★️' : '☆️'}
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
      {resume.overall_score !== null && resume.overall_score !== undefined && (
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
        <Link to={`/write/${resume.id}`} className="doc-item__btn">✏️ 편집</Link>
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
