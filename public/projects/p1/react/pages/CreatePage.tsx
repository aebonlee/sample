/**
 * CreatePage — 동화 만들기 입력 폼
 * ────────────────────────────────────────────────────────────
 * 5필드 입력 → stories INSERT → generate-story Edge Function → /generating/:id
 *
 * 패턴:
 *   - useLocalStorage 로 폼 자동 임시저장 (이탈/새로고침 시 복구)
 *   - 다중 선택 토글 (가치 태그)
 *   - 제출 중에는 버튼 비활성 + ErrorBox 노출
 */

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useLocalStorage } from '../hooks';
import { ErrorBox } from '../components/Common';
import type { AgeRange, Origin, CreateStoryInput } from '../types';

const AGES: { value: AgeRange; emoji: string; label: string; sub: string }[] = [
  { value: '5-7',   emoji: '🧒', label: '5~7세',   sub: '유아' },
  { value: '8-10',  emoji: '👦', label: '8~10세',  sub: '초등 저학년' },
  { value: '11-12', emoji: '👧', label: '11~12세', sub: '초등 고학년' },
];

const ORIGINS: { value: Origin; emoji: string; label: string }[] = [
  { value: '전래동화', emoji: '🐯', label: '전래동화' },
  { value: '명절',     emoji: '🎎', label: '명절·풍습' },
  { value: '지역설화', emoji: '🏔', label: '지역 설화' },
  { value: '역사인물', emoji: '🏯', label: '역사 인물' },
];

const VALUE_TAGS = ['우정', '용기', '배려', '정직', '호기심', '가족애', '자연 사랑', '도전'];

const DEFAULT_FORM: CreateStoryInput = {
  childName: '',
  ageRange: '8-10',
  origin: '전래동화',
  valueTags: ['우정', '배려'],
  customRequest: '',
};

export default function CreatePage() {
  const navigate = useNavigate();
  const [form, setForm]   = useLocalStorage<CreateStoryInput>('p1:create:draft', DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleValue(tag: string) {
    setForm({
      ...form,
      valueTags: form.valueTags.includes(tag)
        ? form.valueTags.filter((t) => t !== tag)
        : [...form.valueTags, tag],
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (form.valueTags.length === 0) {
      setError('가치를 최소 한 개 선택해 주세요');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      // 1) stories INSERT
      const { data: story, error: insertErr } = await supabase
        .from('stories')
        .insert({
          title: form.childName ? `${form.childName}의 동화` : '새 동화',
          age_range: form.ageRange,
          origin: form.origin,
          values_tags: form.valueTags,
          custom_request: form.customRequest || null,
          status: 'generating',
        })
        .select()
        .single();
      if (insertErr) throw insertErr;

      // 2) Edge Function 호출 (백그라운드)
      supabase.functions.invoke('generate-story', { body: { story_id: story.id } });

      // 3) draft 초기화 + 진행률 페이지로
      setForm(DEFAULT_FORM);
      navigate(`/generating/${story.id}`);
    } catch (err) {
      setError(`동화 생성 실패: ${(err as Error).message}`);
      setSubmitting(false);
    }
  }

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>✨ 어떤 동화를 만들까요?</h1>
        <p>아이의 나이와 좋아하는 것을 알려주면 맞춤형 동화를 만들어드려요.</p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <Field label="① 누구의 동화인가요?" hint="아이의 이름 (선택)">
          <input
            type="text" className="field__input"
            value={form.childName}
            onChange={(e) => setForm({ ...form, childName: e.target.value })}
            placeholder="예) 지우"
          />
        </Field>

        <Field label="② 몇 살의 어휘 수준이 좋을까요?">
          <div className="opt-grid">
            {AGES.map((a) => (
              <label key={a.value} className="opt-tile">
                <input type="radio" name="age"
                  checked={form.ageRange === a.value}
                  onChange={() => setForm({ ...form, ageRange: a.value })} />
                <span className="opt-tile__emoji">{a.emoji}</span>
                <span className="opt-tile__label">{a.label}</span>
                <span className="opt-tile__sub">{a.sub}</span>
              </label>
            ))}
          </div>
        </Field>

        <Field label="③ 어떤 한국적 소재가 좋을까요?">
          <div className="opt-grid">
            {ORIGINS.map((o) => (
              <label key={o.value} className="opt-tile">
                <input type="radio" name="origin"
                  checked={form.origin === o.value}
                  onChange={() => setForm({ ...form, origin: o.value })} />
                <span className="opt-tile__emoji">{o.emoji}</span>
                <span className="opt-tile__label">{o.label}</span>
              </label>
            ))}
          </div>
        </Field>

        <Field label="④ 동화에 담고 싶은 가치"
               hint={`${form.valueTags.length}개 선택됨`}>
          <div className="tags">
            {VALUE_TAGS.map((t) => (
              <span key={t}
                className={`tag ${form.valueTags.includes(t) ? 'is-on' : ''}`}
                onClick={() => toggleValue(t)}>{t}</span>
            ))}
          </div>
        </Field>

        <Field label="⑤ 추가 요청사항" hint="선택">
          <textarea
            className="field__textarea"
            value={form.customRequest}
            onChange={(e) => setForm({ ...form, customRequest: e.target.value })}
            placeholder="예) 주인공이 호기심 많은 다람쥐, 가을 산속 배경, 따뜻한 화해 결말..."
          />
        </Field>

        {error && <ErrorBox error={error} />}

        <div className="actions">
          <Link to="/" className="btn btn--ghost">취소</Link>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? '✨ 생성 시작 중...' : '✨ 동화 만들기'}
          </button>
        </div>

        {form.customRequest && (
          <p style={{ fontSize: '.78rem', color: 'var(--text-mute)', textAlign: 'right', margin: '8px 0 0' }}>
            💾 자동 임시 저장됨
          </p>
        )}
      </form>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="brand"><span className="brand__mark">📚</span> 동화공방</Link>
        <nav className="nav__links">
          <Link to="/">홈</Link>
          <Link to="/create" className="is-on">동화 만들기</Link>
          <Link to="/library">내 동화</Link>
        </nav>
      </div>
    </header>
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
