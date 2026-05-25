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
                {platformLabels[p]}
              </NavLink>
            ))}
            <NavLink to="/projects" onClick={() => setMobileNavOpen(false)}>쉬었음 청년 프로젝트</NavLink>
            <NavLink to="/projects-koreatech" onClick={() => setMobileNavOpen(false)}>한기대 프로젝트</NavLink>
            <NavLink to="/learning" onClick={() => setMobileNavOpen(false)}>학습사이트</NavLink>
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
        <div className="container site-footer__inner">
          <div className="site-footer__col site-footer__col--brand">
            <Link to="/" className="brand">
              <span className="brand-mark">S</span>
              <span className="brand-text">Sample Gallery</span>
            </Link>
            <p>
              프로젝트 타입별 웹사이트 디자인 샘플과 소스코드를 제공하는 갤러리.
              Claude로 디자인을 변형해 자신만의 사이트로 빠르게 발전시킬 수 있습니다.
            </p>
            <div className="site-footer__badges">
              <a
                href="mailto:aebon@kyonggi.ac.kr"
                aria-label="이메일"
                title="이메일"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>
                </svg>
              </a>
              <a
                href="https://dreamitbiz.com"
                target="_blank"
                rel="noreferrer"
                aria-label="DreamIT Biz"
                title="DreamIT Biz"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="site-footer__col site-footer__col--site">
            <h4>사이트</h4>
            <ul className="site-footer__links--2col">
              <li><Link to="/platform/web">웹개발</Link></li>
              <li><Link to="/platform/app">앱개발</Link></li>
              <li><Link to="/platform/ai">AI</Link></li>
              <li><Link to="/platform/data">데이터</Link></li>
              <li><Link to="/platform/game">게임</Link></li>
              <li><Link to="/community">커뮤니티</Link></li>
              <li><Link to="/projects">쉬었음 청년 프로젝트</Link></li>
              <li><Link to="/projects-koreatech">한기대 프로젝트</Link></li>
              <li><Link to="/learning">학습사이트</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h4>문의 & 리소스</h4>
            <ul className="site-footer__info">
              <li>
                <span>이메일</span>
                <a href="mailto:aebon@kyonggi.ac.kr">aebon@kyonggi.ac.kr</a>
              </li>
              <li>
                <span>웹사이트</span>
                <a href="https://dreamitbiz.com" target="_blank" rel="noreferrer">dreamitbiz.com</a>
              </li>
              <li>
                <span>도메인</span>sample.dreamitbiz.com
              </li>
              <li>
                <span>제안</span>
                <a href="mailto:aebon@kyonggi.ac.kr?subject=%5BSample%20Gallery%5D%20%EC%83%88%20%EC%83%98%ED%94%8C%20%EC%A0%9C%EC%95%88">새 샘플 / 피드백</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="container site-footer__bottom">
          <p>
            © {new Date().getFullYear()} <strong>DreamIT Biz</strong> · Sample Gallery.
            All rights reserved.
          </p>
          <nav className="site-footer__legal" aria-label="법적 고지">
            <Link to="/about">About</Link>
            <a href="mailto:aebon@kyonggi.ac.kr">개인정보 문의</a>
          </nav>
        </div>
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
