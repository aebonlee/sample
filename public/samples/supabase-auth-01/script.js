// Supabase 인증 데모 (Google + Kakao OAuth)
// supabase-js를 CDN에서 직접 import — 빌드 도구 없이 동작합니다.
// 자격증명은 브라우저 localStorage에만 저장합니다 — 코드에 하드코딩하지 마세요.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STORAGE_KEY = 'sample-supabase-config';

const dom = {
  statusDot:    document.getElementById('status-dot'),
  loggedOut:    document.getElementById('logged-out'),
  loggedIn:     document.getElementById('logged-in'),
  btnGoogle:    document.getElementById('btn-google'),
  btnKakao:     document.getElementById('btn-kakao'),
  btnLogout:    document.getElementById('btn-logout'),
  btnConfig:    document.getElementById('btn-config'),
  configHint:   document.getElementById('config-hint'),
  avatar:       document.getElementById('profile-avatar'),
  name:         document.getElementById('profile-name'),
  email:        document.getElementById('profile-email'),
  provider:     document.getElementById('profile-provider'),
  id:           document.getElementById('profile-id'),
  time:         document.getElementById('profile-time'),
};

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveConfig(cfg) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

function setStatus(level, hint) {
  dom.statusDot.classList.remove('status--unknown', 'status--ok', 'status--warn', 'status--err');
  dom.statusDot.classList.add(`status--${level}`);
  dom.statusDot.title = hint || '';
}

function promptConfig() {
  const current = loadConfig() || {};
  const url = prompt('Supabase Project URL\n(예: https://xxxx.supabase.co)', current.url || '');
  if (!url) return null;
  const anonKey = prompt('Supabase anon key\n(public anon key — service_role 키는 절대 입력하지 마세요)', current.anonKey || '');
  if (!anonKey) return null;
  const cfg = { url: url.trim(), anonKey: anonKey.trim() };
  saveConfig(cfg);
  return cfg;
}

function disabledMode(message) {
  setStatus('warn', message);
  dom.configHint.textContent = message;
  dom.btnGoogle.disabled = true;
  dom.btnKakao.disabled = true;
}

const config = loadConfig();
let supabase = null;

if (!config) {
  disabledMode('Supabase 자격증명이 설정되지 않았습니다. "⚙ Supabase 설정 입력" 버튼을 눌러 시작하세요.');
} else {
  try {
    supabase = createClient(config.url, config.anonKey);
    setStatus('ok', 'Supabase 클라이언트 준비됨');
  } catch (err) {
    disabledMode(`설정이 올바르지 않습니다: ${err.message}`);
  }
}

dom.btnConfig.addEventListener('click', () => {
  const cfg = promptConfig();
  if (cfg) location.reload();
});

async function renderSession() {
  if (!supabase) return;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    setStatus('err', error.message);
    return;
  }
  if (!session) {
    dom.loggedOut.hidden = false;
    dom.loggedIn.hidden = true;
    return;
  }
  const user = session.user;
  dom.loggedOut.hidden = true;
  dom.loggedIn.hidden = false;
  dom.avatar.src = user.user_metadata?.avatar_url
    || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.email || user.id)}`;
  dom.name.textContent = user.user_metadata?.full_name || user.user_metadata?.name || '사용자';
  dom.email.textContent = user.email || '';
  dom.provider.textContent = user.app_metadata?.provider || '—';
  dom.id.textContent = user.id;
  dom.time.textContent = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString('ko-KR')
    : '—';
}

async function signIn(provider) {
  if (!supabase) {
    alert('먼저 Supabase 설정을 입력하세요.');
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.href },
  });
  if (error) alert(`로그인 실패: ${error.message}`);
}

async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
  await renderSession();
}

dom.btnGoogle.addEventListener('click', () => signIn('google'));
dom.btnKakao.addEventListener('click', () => signIn('kakao'));
dom.btnLogout.addEventListener('click', signOut);

if (supabase) {
  supabase.auth.onAuthStateChange(() => renderSession());
  renderSession();
}
