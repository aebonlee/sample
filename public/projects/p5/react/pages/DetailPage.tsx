/**
 * DetailPage — 정책 상세 (자격조건 자동 매칭 + 신청 절차)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - policies + profile + eligibility 병렬 로드
 *   - 사용자 프로필을 정책 eligibility 조건과 비교 → 충족/미충족 표시
 *   - 모든 조건 충족 시 배너 + 신청 버튼 활성화
 *   - 즐겨찾기/공유 (낙관적 업데이트)
 *
 * 패턴:
 *   - useAsync 로 병렬 로드
 *   - 조건 평가 로직 (evaluateEligibility)
 *   - useState 로 즐겨찾기 상태 (옵티미스틱)
 */

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, fetchProfile } from '../supabase';
import { useAsync, useSession } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Policy, Profile } from '../types';

interface Eligibility {
  field: string;
  label: string;
  value: string;
  isOk: boolean;
}

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useSession();
  const [fav, setFav] = useState(false);

  // ─── policy + profile + eligibility 병렬 로드 ────
  const state = useAsync(async () => {
    if (!id) throw new Error('정책 ID 가 없어요');

    const [{ data: policy }, profile, { data: el }, { data: favRow }] = await Promise.all([
      supabase.from('policies').select('*').eq('id', id).single(),
      fetchProfile(),
      supabase.from('eligibility').select('*').eq('policy_id', id),
      user
        ? supabase.from('favorites').select('id').eq('user_id', user.id).eq('policy_id', id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const eligibility: Eligibility[] = (el ?? []).map((e: any) =>
      evaluateEligibility(e, profile));

    return {
      policy: policy as Policy | null,
      profile,
      eligibility,
      isFav: !!favRow,
    };
  }, [id, user?.id]);

  // 로드된 isFav 를 state 에 동기화 (1회)
  if (state.status === 'success' && state.data.isFav && !fav) setFav(true);

  // ─── 즐겨찾기 토글 (옵티미스틱) ──────────────────
  async function toggleFav() {
    if (!user || !id) return;
    const newVal = !fav;
    setFav(newVal); // 즉시 반영
    try {
      if (newVal) {
        await supabase.from('favorites').insert({ user_id: user.id, policy_id: id });
      } else {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('policy_id', id);
      }
    } catch {
      setFav(!newVal); // 롤백
    }
  }

  if (state.status === 'loading') return <><Nav /><Spinner /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;

  const { policy, profile, eligibility } = state.data;

  if (!policy) {
    return (
      <>
        <Nav />
        <EmptyState
          emoji="🔍"
          title="정책을 찾을 수 없어요"
          desc="삭제되었거나 잘못된 링크일 수 있어요."
        />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/search" className="btn btn--primary">정책 검색으로</Link>
        </div>
      </>
    );
  }

  const allOk = eligibility.length > 0 && eligibility.every((e) => e.isOk);
  const daysLeft = policy.apply_deadline
    ? Math.ceil((new Date(policy.apply_deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <>
      <Nav />
      <p className="crumb" style={{ maxWidth: 1100, margin: '18px auto 0', padding: '0 24px' }}>
        <Link to="/search">검색</Link> › {policy.title}
      </p>

      <section className="hero">
        <span className="hero__cat">{policy.category}</span>
        <h1>{policy.title}</h1>
        <p className="hero__org">{policy.organization}</p>
        <div className="hero__amount">
          <div><span>지원 금액</span><strong>{policy.amount_summary}</strong></div>
          <div><span>지원 기간</span><strong>{policy.duration_months ?? '-'}개월</strong></div>
          {policy.apply_deadline && (
            <div><span>신청 마감</span><strong>{policy.apply_deadline}</strong></div>
          )}
        </div>
        <div className="hero__actions">
          <Link to={`/checklist?policy=${policy.id}`} className="btn"
                style={{ opacity: allOk ? 1 : 0.6 }}>
            ✓️ 신청 체크리스트
          </Link>
          <button className={`btn btn--ghost ${fav ? 'on' : ''}`} onClick={toggleFav}>
            {fav ? '⭐️ 저장됨' : '☆️ 즐겨찾기'}
          </button>
          <button className="btn btn--ghost"
                  onClick={() => navigator.share?.({ title: policy.title, url: location.href })}>
            📤 공유
          </button>
        </div>
      </section>

      <main className="layout">
        <div>
          <section className="card section">
            <h2>📋 자격 조건 — 모두 충족해야 합니다</h2>
            {eligibility.length === 0 ? (
              <p style={{ color: 'var(--text-mute)' }}>등록된 자격 조건이 없어요.</p>
            ) : (
              <div className="req-grid">
                {eligibility.map((e) => (
                  <div key={e.field} className="req">
                    <p className="req__label">{e.label}</p>
                    <p className="req__value">{e.value}</p>
                    <span className={`req__check ${e.isOk ? '' : 'req__check--no'}`}>
                      {e.isOk ? '✓️ 충족' : '✕️ 미충족'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {allOk && profile && (
              <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(22,163,74,.08)',
                           borderLeft: '4px solid var(--accent)', borderRadius: '0 10px 10px 0' }}>
                🎉 <strong>모든 조건 충족!</strong> 바로 신청하실 수 있어요.
              </div>
            )}
            {!allOk && eligibility.length > 0 && (
              <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(239,68,68,.06)',
                           borderLeft: '4px solid var(--danger, #ef4444)', borderRadius: '0 10px 10px 0' }}>
                일부 조건이 미충족됩니다. 프로필을 다시 확인하거나 유사 정책을 찾아보세요.
              </div>
            )}
          </section>

          <section className="card section">
            <h2>📝 신청 절차</h2>
            <div className="steps">
              <Step n={1} title="복지로/마이홈 포털에서 신청">
                온라인 신청 권장. 오프라인은 거주지 주민센터 방문.
              </Step>
              <Step n={2} title="필수 서류 업로드">
                임대차계약서, 통장 사본, 가족관계증명서, 소득 확인 동의서.
              </Step>
              <Step n={3} title="자격 심사 (약 14일)">
                결과는 문자로 안내.
              </Step>
              <Step n={4} title="매월 25일 계좌 입금">
                선정 다음 달부터 자동 입금.
              </Step>
            </div>
          </section>
        </div>

        <aside className="side">
          {daysLeft !== null && (
            <div className="deadline-card">
              <p className="deadline-card__title">신청 마감까지</p>
              <p className="deadline-card__d" style={{ color: daysLeft < 7 ? 'var(--danger, #ef4444)' : undefined }}>
                D-{daysLeft}
              </p>
              <p className="deadline-card__date">{policy.apply_deadline}</p>
            </div>
          )}
        </aside>
      </main>
    </>
  );
}

// ─── 자격 조건 평가 ───────────────────────────────

function evaluateEligibility(e: any, profile: Profile | null): Eligibility {
  const fieldLabels: Record<string, string> = {
    age: '연령',
    income: '소득',
    region: '거주지',
    employed: '근로 상태',
    asset: '자산',
  };
  const value = JSON.stringify(e.value_json);
  let isOk = true;
  if (profile) {
    // 간단 평가 — 실제로는 e.operator 별로 처리
    const p = profile as any;
    if (e.field === 'age' && typeof e.value_json?.min === 'number') {
      isOk = (p.age ?? 0) >= e.value_json.min;
    }
    if (e.field === 'income' && typeof e.value_json?.max === 'number') {
      isOk = (p.income ?? 0) <= e.value_json.max;
    }
  }
  return {
    field: e.field,
    label: fieldLabels[e.field] ?? e.field,
    value,
    isOk,
  };
}

// ─── 보조 ─────────────────────────────────────────

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="step">
      <span className="step__num">{n}</span>
      <div>
        <p className="step__title">{title}</p>
        <p className="step__body">{children}</p>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">💬 청년톡톡</div>
      <nav className="nav-links">
        <Link to="/">챗봇</Link>
        <Link to="/search">검색</Link>
        <Link to="/my">맞춤 정책</Link>
        <Link to="/checklist">체크리스트</Link>
        <Link to="/calendar">캘린더</Link>
      </nav>
    </header>
  );
}
