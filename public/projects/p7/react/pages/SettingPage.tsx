/**
 * SettingPage — 설정 (알림 + 보안 + 데이터)
 *
 * 데이터: notification_settings + profiles 테이블.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

interface Settings {
  all_notifications: boolean;
  morning_checkin: boolean;
  evening_reflect: boolean;
  routine_reminder: boolean;
  weekly_report: boolean;
}

export default function SettingPage() {
  const [settings, setSettings] = useState<Settings>({
    all_notifications: true,
    morning_checkin: true,
    evening_reflect: true,
    routine_reminder: true,
    weekly_report: false,
  });
  const [morningTime, setMorningTime] = useState('07:00');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('notification_settings').select('*').single();
      if (data) setSettings(data as Settings);
    })();
  }, []);

  async function toggle(key: keyof Settings) {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    await supabase.from('notification_settings').upsert(next);
  }

  return (
    <div className="phone">
      <header className="greet">
        <p>⚙ 설정</p>
        <h1>나에게 맞게 조정해요</h1>
      </header>

      {/* 프로필 */}
      <article className="card profile-card">
        <div className="profile-card__avatar">JL</div>
        <div>
          <div className="profile-card__name">이지수</div>
          <div className="profile-card__meta">aebon@kyonggi.ac.kr</div>
        </div>
        <button className="profile-card__edit">✏ 편집</button>
      </article>

      {/* 알림 */}
      <div className="group">
        <p className="group__title">🔔 알림</p>
        <div className="group__inner">
          <Row icon="📲" title="전체 알림" desc="모든 푸시 알림을 켜고 끕니다"
               on={settings.all_notifications} onToggle={() => toggle('all_notifications')} />
          <Row icon="☀️" title="아침 체크인 알림" desc="감정 점수 매일 기록 도움"
               on={settings.morning_checkin} onToggle={() => toggle('morning_checkin')} />
          <Row icon="🌙" title="취침 전 회고 알림"
               on={settings.evening_reflect} onToggle={() => toggle('evening_reflect')} />
          <Row icon="🌿" title="루틴 시간 알림"
               on={settings.routine_reminder} onToggle={() => toggle('routine_reminder')} />
          <Row icon="📊" title="주간 리포트"
               on={settings.weekly_report} onToggle={() => toggle('weekly_report')} />
        </div>

        {/* 알림 시간 칩 */}
        <div className="time-chips">
          {['06:00', '07:00', '08:00', '09:00'].map((t) => (
            <span
              key={t}
              className={`time-chip ${morningTime === t ? 'on' : ''}`}
              onClick={() => setMorningTime(t)}
            >{t}</span>
          ))}
        </div>
      </div>

      {/* 보안 */}
      <div className="group">
        <p className="group__title">🔒 보안</p>
        <div className="group__inner">
          <Row icon="🔐" title="앱 잠금" desc="Face ID로 보호" on={true} onToggle={() => {}} />
          <Row icon="📤" title="데이터 내보내기" desc="CSV / PDF 형식" link />
          <Row icon="📋" title="개인정보처리방침" link />
        </div>
      </div>

      <button className="destructive">🚪 로그아웃</button>
      <button className="destructive" style={{ marginTop: 8 }}>🗑 계정 삭제</button>

      <p className="app-info">© 2026 회복탄력성 코치 · 모든 데이터는 본인만 접근 가능합니다.</p>

      <TabBar active="setting" />
    </div>
  );
}

function Row({ icon, title, desc, on, onToggle, link }: {
  icon: string; title: string; desc?: string;
  on?: boolean; onToggle?: () => void; link?: boolean;
}) {
  return (
    <div className="row">
      <div className="row__ico">{icon}</div>
      <div className="row__body">
        <p className="row__title">{title}</p>
        {desc && <p className="row__desc">{desc}</p>}
      </div>
      {link ? (
        <div className="row__right">→</div>
      ) : (
        <div className={`toggle ${on ? 'on' : ''}`} onClick={onToggle} />
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
