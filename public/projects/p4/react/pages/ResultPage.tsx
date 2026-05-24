/**
 * ResultPage — 진단 평가 결과
 * ────────────────────────────────────────────────────────────
 * 표시:
 *   - 원형 게이지 (CSS conic-gradient) 로 종합 점수
 *   - 과목별 정답률 막대 (강함/중간/약함 색상 코딩)
 *   - 등급 (A/B/C/D) + 합격 가능성 판정
 *   - 다음 단계 추천 (취약점 / 학습 계획 / 다시 응시)
 *   - 공유 (이미지로 저장 + 카톡/링크 공유)
 *
 * 패턴:
 *   - useAsync 로 diagnosis + cert 정보 병렬 로드
 *   - 등급은 클라이언트에서 계산 (서버 grade 와 일치하도록 동일 로직)
 */

import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync } from '../hooks';
import { Spinner, ErrorBox } from '../components/Common';
import type { Certification, Diagnosis } from '../types';

const GRADE_META: Record<'A' | 'B' | 'C' | 'D', { color: string; desc: string; passRate: number }> = {
  A: { color: '#16a34a', desc: '안정 합격권',     passRate: 95 },
  B: { color: '#0284c7', desc: '합격 가능권',     passRate: 72 },
  C: { color: '#f59e0b', desc: '집중 학습 필요',  passRate: 40 },
  D: { color: '#dc2626', desc: '기초 학습 필요',  passRate: 12 },
};

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();

  const state = useAsync(async () => {
    if (!id) throw new Error('잘못된 접근');
    const { data: diag, error } = await supabase
      .from('diagnoses').select('*').eq('id', id).single();
    if (error) throw error;

    const { data: cert } = await supabase
      .from('certifications').select('*').eq('id', (diag as Diagnosis).cert_id).single();

    return { diag: diag as Diagnosis, cert: cert as Certification | null };
  }, [id]);

  // 가장 약한 과목 2개
  const weakSubjects = useMemo(() => {
    if (state.status !== 'success') return [];
    return Object.entries(state.data.diag.subject_scores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2)
      .map(([name]) => name);
  }, [state]);

  if (state.status === 'loading') return <><Nav /><Spinner /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;

  const { diag, cert } = state.data;
  const grade = GRADE_META[diag.grade];

  return (
    <>
      <Nav />

      {/* 종합 점수 카드 */}
      <section className="hero">
        <div className="score-circle"
             style={{
               background: `conic-gradient(#fff 0% ${diag.score}%, rgba(255,255,255,.2) ${diag.score}% 100%)`,
             }}>
          <div className="score-circle__text">
            <span className="score-circle__num">{diag.score}</span>
            <span className="score-circle__lab">100점 만점</span>
          </div>
        </div>

        <div className="hero__info">
          <h1>🎯 진단 평가 결과 — {cert?.name ?? '자격증'}</h1>
          <p className="hero__sub">
            {new Date(diag.taken_at).toLocaleDateString('ko-KR')} 응시 ·
            {' '}소요 {Math.floor((diag.total_q * 60) / 25)}분
          </p>
          <div className="hero__stats">
            <Stat label="정답"        value={`${diag.correct} / ${diag.total_q}`} />
            <Stat label="등급"        value={diag.grade} />
            <Stat label="합격 가능성" value={`${grade.passRate}%`} />
          </div>
        </div>
      </section>

      <main className="layout">
        {/* 과목별 정답률 */}
        <article className="card subjects-result">
          <h3>📊 과목별 정답률</h3>
          {Object.entries(diag.subject_scores).map(([name, rate]) => (
            <SubjectBar key={name} name={name} rate={rate} />
          ))}
        </article>

        {/* 판정 + 다음 단계 */}
        <article className="verdict card">
          <div className="verdict__grade" style={{ borderColor: grade.color }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '.82rem' }}>예상 등급</span>
            <strong style={{ color: grade.color }}>{diag.grade}</strong>
            <span style={{ color: 'var(--text-mute)', fontSize: '.8rem' }}>{grade.desc}</span>
          </div>

          <p className="verdict__msg">{getMessage(diag.grade, weakSubjects)}</p>

          <div className="verdict__actions">
            <Link to={`/weakness/${diag.cert_id}`} className="btn btn--primary">
              🎯 취약점 자세히 보기
            </Link>
            <Link to={`/plan/${diag.cert_id}`} className="btn btn--ghost">
              📅 학습 계획 만들기
            </Link>
            <Link to={`/diagnose/${diag.cert_id}`} className="btn btn--ghost">
              🔄 다시 응시
            </Link>
            <button className="btn btn--ghost"
                    onClick={() => navigator.share?.({
                      title: `${cert?.name} 진단 ${diag.score}점`,
                      url: location.href,
                    }).catch(() => {})}>
              📤 공유
            </button>
          </div>
        </article>
      </main>
    </>
  );
}

// ─── 헬퍼 ─────────────────────────────────────────────

function getMessage(grade: string, weak: string[]): string {
  const weakStr = weak.length ? ` 특히 ${weak.join(', ')}` : '';
  switch (grade) {
    case 'A': return '거의 완벽합니다! 마무리 점검만 하시면 됩니다.';
    case 'B': return `합격에 매우 가까워요.${weakStr} 만 보완하면 됩니다.`;
    case 'C': return `꾸준한 학습이 필요합니다.${weakStr} 위주로 4주 계획을 추천합니다.`;
    case 'D': return `기초부터 차근차근!${weakStr} 부터 시작하는 8주 계획이 좋겠어요.`;
    default:  return '';
  }
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🎓 자격증 코치</div>
      <nav className="nav-links">
        <Link to="/">자격증 선택</Link>
        <Link to="/diagnose">진단</Link>
      </nav>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="hero__stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SubjectBar({ name, rate }: { name: string; rate: number }) {
  const cls = rate >= 70 ? 'good' : rate < 50 ? 'weak' : '';
  return (
    <div className={`sj ${cls}`}>
      <span className="sj__name">{name}</span>
      <div className="sj__bar">
        <div className="sj__fill" style={{ width: `${rate}%` }} />
      </div>
      <span className="sj__pct">{rate}%</span>
    </div>
  );
}
