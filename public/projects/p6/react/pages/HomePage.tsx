/**
 * ExperiencePage — 경험 입력 (5단계 파이프라인 시작)
 *
 * 흐름:
 *   1) 자유 텍스트로 경험 작성 (최소 200자)
 *   2) 지원처와 강조하고 싶은 역량 입력 (선택)
 *   3) 제출 → saveExperience() → convertToStar() → /star/:id 로 이동
 *
 * UX 포인트:
 *   - 글자 수 카운터 (실시간)
 *   - 200자 미만이면 버튼 비활성
 *   - AI 분석 중에는 버튼에 로딩 상태
 */

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveExperience, convertToStar } from '../supabase';

export default function ExperiencePage() {
  const navigate = useNavigate();
  const [title, setTitle]         = useState('');
  const [rawText, setRawText]     = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [emphasis, setEmphasis]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const charCount = rawText.length;
  const isValid = charCount >= 200 && charCount <= 2000;

  // ─── 제출 ─────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setError(null);
    try {
      // 1) experiences 테이블에 저장
      const exp = await saveExperience({
        title: title.trim() || rawText.slice(0, 30) + '...',
        raw_text: rawText.trim(),
        target_role: targetRole.trim() || undefined,
        emphasis: emphasis.split(',').map((x) => x.trim()).filter(Boolean),
        user_id: '',           // RLS 정책에서 자동 채워짐
      });

      // 2) STAR 변환 (Edge Function → Solar Chat → DB 저장)
      await convertToStar(exp.id);

      // 3) 결과 페이지로 이동
      navigate(`/star/${exp.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 대학교 캡스톤 프로젝트 리더 경험"
            />
          </Field>

          <Field label="② 경험을 자유롭게 적어주세요"
                 hint={`${charCount} / 2,000자 · 최소 200자`}>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              minLength={200}
              maxLength={2000}
              placeholder="언제, 어디서, 누구와, 어떤 상황이었고, 무엇을 했고, 어떤 결과가 있었는지..."
              required
            />
          </Field>

          <Field label="③ 강조하고 싶은 역량 (쉼표로 구분)">
            <input
              type="text"
              value={emphasis}
              onChange={(e) => setEmphasis(e.target.value)}
              placeholder="예) 리더십, 문제해결, 협업"
            />
          </Field>

          <Field label="④ 지원처 (선택)">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="예) 카카오 백엔드 개발자"
            />
          </Field>

          {error && (
            <div style={{ padding: 12, background: '#fee', borderRadius: 8, color: '#c00' }}>
              ❌ {error}
            </div>
          )}

          <div className="actions">
            <button type="submit" className="btn btn--primary" disabled={!isValid || loading}>
              {loading ? '✨ AI 분석 중...' : '✨ STAR로 정리하기'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📝 자소서 코치</div>
      <nav>
        <Link to="/" className="on">경험 입력</Link>
        <Link to="/my">내 자소서</Link>
      </nav>
    </header>
  );
}

function Stepper({ active }: { active: number }) {
  const steps = ['경험', 'STAR', '작성', '피드백', '면접'];
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <span key={i} className={i === active ? 'step-dot on' : i < active ? 'step-dot done' : 'step-dot'}>
          {i + 1}
        </span>
      ))}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="field__label">{label}{hint && <span className="field__hint"> {hint}</span>}</label>
      {children}
    </div>
  );
}
