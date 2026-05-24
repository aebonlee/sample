/**
 * SettingPage — 설정 (알림 + 보안 + 데이터)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - notification_settings + profiles 로드
 *   - 토글 변경 시 옵티미스틱 업데이트 + Supabase upsert
 *   - 알림 시간 칩 (morning_at) 선택
 *   - 데이터 내보내기 (CSV) / 로그아웃 / 계정 삭제
 *
 * 패턴:
 *   - useAsync 로 설정 + 프로필 병렬 로드
 *   - useState 로 로컬 settings + 변경 시 즉시 반영
 *   - 저장 시각 표시
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useSession } from '../hooks';
import { Spinner, ErrorBox } from '../components/Common';

interface Settings {
  all_notifications: boolean;
  morning_checkin: boolean;
  evening_reflect: boolean;
  routine_reminder: boolean;
  weekly_report: boolean;
  morning_at?: string;
}

const DEFAULT_SETTINGS: Settings = {
  all_notifications: true,
  morning_checkin: true,
  evening_reflect: true,
  routine_reminder: true,
  weekly_report: false,
  morning_at: '07:00',
};

export default function SettingPage() {
  const user = useSession();
  const nav = useNavigate();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [savedAt, setSavedAt]   = useState<Date | null>(null);

  // ─── 설정 + 프로필 로드 ───────────────────────────
  const state = useAsync(async () => {
    const [{ data: setting }, { data: profile }] = await Promise.all([
      supabase.from('notification_settings').select('*').maybeSingle(),
      user
        ? supabase.from('profiles').select('name, email').eq('id', user.id).maybeSingle()
            .then(({ data }) => data as { name: string; email: string } | null)
        : Promise.resolve(null),
    ]);
    return { setting: (setting ?? null) as Settings | null, profile };
  }, [user?.id]);

  useEffect(() => {
    if (state.status === 'success' && state.data.setting) {
      setSettings({ ...DEFAULT_SETTINGS, ...state.data.setting });
    }
  }, [state.status]);

  // ─── 토글 (옵티미스틱) ────────────────────────────
  async function toggle(key: keyof Settings) {
    const prev = settings;
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    const { error } = await supabase.from('notification_settings').upsert(next);
    if (error) setSettings(prev);
    else setSavedAt(new Date());
  }

  async function setMorningTime(t: string) {
    const prev = settings;
    const next = { ...settings, morning_at: t };
    setSettings(next);
    const { error } = await supabase.from('notification_settings').upsert(next);
    if (error) setSettings(prev);
    else setSavedAt(new Date());
  }

  async function logout() {
    if (!confirm('정말 로그아웃하시겠어요?')) return;
    await supabase.auth.signOut();
    nav('/');
  }

  async function exportCSV() {
    const { data: comps } = await supabase.from('completions')
      .select('completed_at, routine:routines(name, category)').limit(1000);
    const rows = ['completed_at,routine,category'];
    (comps ?? []).forEach((c: any) => {
      rows.push(`${c.completed_at},${c.routine?.name},${c.routine?.category}`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `resilience-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  if (state.status === 'loading') return <div className="phone"><Spinner /></div>;
  if (state.status === 'error')   return <div className="phone"><ErrorBox error={state.error} /></div>;

  const profile = state.status === 'success' ? state.data.profile : null;

  return (
    <div className="phone">
      <header className="greet">
        <p>⚙ 설정 {savedAt && (
          <small style={{ color: 'var(--accent)' }}>
            · 💾 {savedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} 저장됨
          </small>
        )}</p>
        <h1>나에게 맞게 조정해요</h1>
      </header>

      {/* 프로필 */}
      <article className="card profile-card">
        <div className="profile-card__avatar">{profile?.name?.[0] ?? 'U'}</div>
        <div>
          <div className="profile-card__name">{profile?.name ?? '익명 사용자'}</div>
          <div className="profile-card__meta">{profile?.email ?? user?.email ?? '—'}</div>
        </div>
        <button className="profile-card__edit"
          onClick={() => nav('/profile/edit')}>✏ 편집</button>
      </article>

      {/* 알림 */}
      <div className="group">
        <p className="group__title">🔔 알림</p>
        <div className="group__inner">
          <Row icon="📲" title="전체 알림" desc="모든 푸시 알림을 켜고 끕니다"
               on={settings.all_notifications} onToggle={() => toggle('all_notifications')} />
          <Row icon="☀️" title="아침 체크인 알림" desc="감정 점수 매일 기록 도움"
               on={settings.morning_checkin}
               onToggle={() => toggle('morning_checkin')}
               disabled={!settings.all_notifications} />
          <Row icon="🌙" title="취침 전 회고 알림"
               on={settings.evening_reflect}
               onToggle={() => toggle('evening_reflect')}
               disabled={!settings.all_notifications} />
          <Row icon="🌿" title="루틴 시간 알림"
               on={settings.routine_reminder}
               onToggle={() => toggle('routine_reminder')}
               disabled={!settings.all_notifications} />
          <Row icon="📊" title="주간 리포트"
               on={settings.weekly_report}
               onToggle={() => toggle('weekly_report')}
               disabled={!settings.all_notifications} />
        </div>

        {/* 알림 시간 칩 */}
        {settings.morning_checkin && (
          <div className="time-chips">
            <span style={{ fontSize: '.85rem', color: 'var(--text-mute)', marginRight: 8 }}>
              아침 알림 시간:
            </span>
            {['06:00', '07:00', '08:00', '09:00'].map((t) => (
              <span
                key={t}
                className={`time-chip ${settings.morning_at === t ? 'on' : ''}`}
                onClick={() => setMorningTime(t)}
              >{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* 보안 */}
      <div className="group">
        <p className="group__title">🔒 보안 & 데이터</p>
        <div className="group__inner">
          <Row icon="🔐" title="앱 잠금" desc="Face ID로 보호" on={true} onToggle={() => {}} />
          <Row icon="📤" title="데이터 내보내기" desc="CSV 형식" link onClick={exportCSV} />
          <Row icon="📋" title="개인정보처리방침" link />
        </div>
      </div>

      <button className="destructive" onClick={logout}>🚪 로그아웃</button>
      <button className="destructive" style={{ marginTop: 8 }}
        onClick={() => alert('계정 삭제는 고객센터를 통해 진행됩니다.')}>
        🗑 계정 삭제
      </button>

      <p className="app-info">© 2026 회복탄력성 코치 · 모든 데이터는 본인만 접근 가능합니다.</p>

      <TabBar active="setting" />
    </div>
  );
}

function Row({ icon, title, desc, on, onToggle, link, onClick, disabled }: {
  icon: string; title: string; desc?: string;
  on?: boolean; onToggle?: () => void; link?: boolean;
  onClick?: () => void; disabled?: boolean;
}) {
  return (
    <div className={`row ${disabled ? 'row--disabled' : ''}`} onClick={link ? onClick : undefined}>
      <div className="row__ico">{icon}</div>
      <div className="row__body">
        <p className="row__title">{title}</p>
        {desc && <p className="row__desc">{desc}</p>}
      </div>
      {link ? (
        <div className="row__right">→</div>
      ) : (
        <div className={`toggle ${on ? 'on' : ''} ${disabled ? 'off' : ''}`}
             onClick={disabled ? undefined : onToggle} />
      )}
    </div>
  );
}

function TabBar({ active }: { active: string }) {
  return (
    <nav className="tabbar">
      <Link to="/" className={`tab ${active === 'home' ? 'on' : ''}`}><span>🏠</span>홈</Link>
      <Link to="/routine" className={`tab ${active === 'routine' ? 'on' : ''}`}><span>🌿</span>루틴</Link>
      <Link to="/journal" className={`tab ${active === 'journal' ? 'on' : ''}`}><span>📓</span>저널</Link>
      <Link to="/chart" className={`tab ${active === 'chart' ? 'on' : ''}`}><span>📊</span>그래프</Link>
      <Link to="/setting" className={`tab ${active === 'setting' ? 'on' : ''}`}><span>⚙</span>설정</Link>
    </nav>
  );
}
