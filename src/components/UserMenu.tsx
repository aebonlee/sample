import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) return null;

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    '사용자';
  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const initial = (name?.[0] ?? '?').toUpperCase();

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {avatar ? (
          <img src={avatar} alt="" />
        ) : (
          <span className="user-menu__initial">{initial}</span>
        )}
      </button>
      {open && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__head">
            <strong>{name}</strong>
            {user.email && <span>{user.email}</span>}
          </div>
          <button
            type="button"
            className="user-menu__item"
            onClick={async () => {
              setOpen(false);
              await signOut();
            }}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
