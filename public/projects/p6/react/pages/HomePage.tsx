/**
 * HomePage — 자소서 코치 (경험 입력)
 * ────────────────────────────────────────────────────────────
 * 5단계 파이프라인의 첫 단계.
 *
 * 흐름:
 *   1) 자유 텍스트로 경험 작성 (최소 200자, 권장 500자+)
 *   2) 지원처와 강조하고 싶은 역량 입력 (선택)
 *   3) 제출 → saveExperience() → convertToStar() (AI 분석) → /star/:id 이동
 *
 * 패턴:
 *   - 글자수 카운터 (200/2000)
 *   - 형식 검증 (최소 200자)
 *   - useLocalStorage 로 임시 저장 (이탈 시 복구)
 *   - 제출 중에는 버튼 비활성 + 로딩 표시
 *   - 예시 보기 토글
 */

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveExperience, convertToStar } from '../supabase';
import { useLocalStorage } from '../hooks';
import { ErrorBox } from '../components/Common';

const EXAMPLES = [
  {
    title: '캡스톤 디자인 팀장 경험',
    text: '대학교 4학년 캡스톤 프로젝트에서 5명 팀의 팀장을 맡았다. 첫 4주간 의견 충돌로 진척이 없었는데...',
  },
  {
    title: '인턴십 데이터 분석',
    text: '여름 인턴 6주간 마케팅팀에서 GA4 데이터 분석을 담당했다. 처음엔 SQL도 잘 몰랐지만...',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useLocalStorage('p6:exp:draft', {
    title: '', rawText: '', targetRole: '', emphasis: '',
  });
  const [showExamples, setShowExamples] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = draft.rawText.length;
  const isValid = charCount >= 200 && charCount <= 2000;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    setError(null);

    try {
      // 1) 경험 저장
      const exp = await saveExperience({
        title: draft.title.trim() || draft.rawText.slice(0, 30) + '...',
        raw_text: draft.rawText.trim(),
        target_role: draft.targetRole.trim() || undefined,
        emphasis: draft.emphasis.split(',').map((x) => x.trim()).filter(Boolean),
        user_id: '',   // RLS 정책에서 자동
      });

      // 2) AI STAR 분석 (Edge Function)
      await convertToStar(exp.id);

      // 3) 임시 저장 초기화 + 결과 페이지로
      setDraft({ title: '', rawText: '', targetRole: '', emphasis: '' });
      navigate(`/star/${exp.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function loadExample(ex: typeof EXAMPLES[number]) {
    setDraft({ ...draft, title: ex.title, rawText: ex.text });
    setShowExamples(false);
  }

  return (
    <>
      <Nav />
      <Stepper active={0} />

      <div className="page-head">
        <h1>📝 가장 자랑스러운 경험을 들려주세요</h1>
        <p>자유롭게 적어주시면 AI가 STAR 구조로 정리해 자소서 문항에 활용할 수 있게 만들어드립니다.</p>
      </div>

      <main className="container">
        <form className="card" onSubmit={handleSubmit}>

          <Field label="① 경험의 제목">
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="예) 대학교 캡스톤 프로젝트 리더 경험"
            />
          </Field>

          <Field
            label="② 경험을 자유롭게 적어주세요"
            hint={`${charCount} / 2,000자 · 최소 200자`}
            error={charCount > 0 && charCount < 200 ? '최소 200자 이상 적어주세요' : null}
          >
            <textarea
              value={draft.rawText}
              onChange={(e) => setDraft({ ...draft, rawText: e.target.value })}
              minLength={200}
              maxLength={2000}
              placeholder="언제, 어디서, 누구와, 어떤 상황이었고, 무엇을 했고, 어떤 결과가 있었는지..."
              required
            />
            <button type="button"
                    onClick={() => setShowExamples(!showExamples)}
                    style={{ marginTop: 8, background: 'transparent', border: 0,
                            color: 'var(--accent)', cursor: 'pointer', fontSize: '.85rem' }}>
              {showExamples ? '예시 닫기 ▲' : '✨ 예시 보기 ▼'}
            </button>
            {showExamples && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {EXAMPLES.map((ex, i) => (
                  <button key={i} type="button" onClick={() => loadExample(ex)}
                          style={{ padding: 10, background: 'var(--bg)',
                                  borderRadius: 8, textAlign: 'left',
                                  border: '1px solid var(--border)', cursor: 'pointer' }}>
                    <strong style={{ fontSize: '.85rem' }}>{ex.title}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '.78rem', color: 'var(--text-dim)' }}>
                      {ex.text.slice(0, 80)}...
                    </p>
                  </button>
                ))}
              </div>
            )}
          </Field>

          <Field label="③ 강조하고 싶은 역량 (쉼표로 구분)">
            <input
              type="text"
              value={draft.emphasis}
              onChange={(e) => setDraft({ ...draft, emphasis: e.target.value })}
              placeholder="예) 리더십, 문제해결, 협업"
            />
          </Field>

          <Field label="④ 지원처 (선택)">
            <input
              type="text"
              value={draft.targetRole}
              onChange={(e) => setDraft({ ...draft, targetRole: e.target.value })}
              placeholder="예) 카카오 백엔드 개발자"
            />
          </Field>

          {error && <ErrorBox error={error} />}

          <div className="actions">
            <button type="submit" className="btn btn--primary" disabled={!isValid || loading}>
              {loading ? '✨ AI 분석 중...' : '✨ STAR로 정리하기'}
            </button>
          </div>

          {draft.rawText && (
            <p style={{ fontSize: '.78rem', color: 'var(--text-mute)', textAlign: 'right', margin: '8px 0 0' }}>
              💾 자동 임시 저장됨 (브라우저)
            </p>
          )}
        </form>
      </main>
    </>
  );
}

// ─── 보조 ─────────────────────────────────────────

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📝 자소서 코치</div>
      <nav className="nav-links">
        <Link to="/" className="on">경험 입력</Link>
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

function Field({ label, hint, error, children }: {
  label: string; hint?: string; error?: string | null; children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label className="field__label">
        {label}
        {hint && <span className="field__hint"> {hint}</span>}
      </label>
      {children}
      {error && <p style={{ color: 'var(--danger)', fontSize: '.8rem', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}
