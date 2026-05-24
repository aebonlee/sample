/**
 * 공통 hooks — 모든 페이지에서 재사용
 * ────────────────────────────────────────────────────────────
 * 이 파일에는 비동기 페치·디바운싱·세션 등 자주 쓰는 패턴이 모여 있습니다.
 * 각 페이지에서 `import { useAsync, useDebounce } from '../hooks';` 형태로 사용.
 */

import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';

// ────────────────────────────────────────────────────────────
// useAsync — 비동기 함수의 loading/error/data 3-state 관리
// ────────────────────────────────────────────────────────────

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

/**
 * 비동기 작업의 표준 패턴.
 *
 * 사용:
 *   const stories = useAsync(() => fetchStories(), [userId]);
 *   if (stories.status === 'loading') return <Spinner />;
 *   if (stories.status === 'error')   return <ErrorBox e={stories.error} />;
 *   return <List items={stories.data} />;
 */
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = [],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    asyncFn()
      .then((data) => { if (!cancelled) setState({ status: 'success', data }); })
      .catch((err)  => { if (!cancelled) setState({ status: 'error', error: err as Error }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

// ────────────────────────────────────────────────────────────
// useDebounce — 입력값을 N ms 지연시켜 자동 저장/검색에 사용
// ────────────────────────────────────────────────────────────

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ────────────────────────────────────────────────────────────
// useSession — 현재 로그인 사용자
// ────────────────────────────────────────────────────────────

export function useSession() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email } : null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return user;
}

// ────────────────────────────────────────────────────────────
// useInterval — 1초 카운트다운 등에 사용
// ────────────────────────────────────────────────────────────

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// ────────────────────────────────────────────────────────────
// useLocalStorage — 브라우저 영속화 (필터 상태 등)
// ────────────────────────────────────────────────────────────

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}
