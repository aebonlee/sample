import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';
import LoginModal from './components/LoginModal';
import UserMenu from './components/UserMenu';
import { useAuth } from './contexts/AuthContext';
import { platformLabels, type Platform } from './data/samples';

const platformOrder: Platform[] = ['web', 'app', 'ai', 'data', 'game'];

export default function App() {
  const { user, loading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" onClick={() => setMobileNavOpen(false)}>
            <span className="brand-mark">S</span>
            <span className="brand-text">Sample Gallery</span>
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-label="메뉴 열기"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>

          <nav className={`site-nav ${mobileNavOpen ? 'is-open' : ''}`}>
            <NavLink to="/about" onClick={() => setMobileNavOpen(false)}>About</NavLink>
            {platformOrder.map((p) => (
              <NavLink
                key={p}
                to={`/platform/${p}`}
                onClick={() => setMobileNavOpen(false)}
              >
                {platformLabels[p]} 샘플
              </NavLink>
            ))}
            <NavLink to="/community" onClick={() => setMobileNavOpen(false)}>커뮤니티</NavLink>
          </nav>

          <div className="site-actions">
            <ThemeToggle />
            {!loading && (user ? (
              <UserMenu />
            ) : (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => setLoginOpen(true)}
              >
                로그인
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>
            © {new Date().getFullYear()} Sample Gallery · made by{' '}
            <a href="https://dreamitbiz.com" target="_blank" rel="noreferrer">
              DreamIT Biz
            </a>
          </p>
        </div>
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
