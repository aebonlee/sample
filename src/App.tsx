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
                href="https://github.com/aebonlee/sample"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                title="GitHub"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.01c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.67 0-1.25.44-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.93 10.93 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.07 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z"/>
                </svg>
              </a>
              <a
                href="mailto:aebon@kyonggi.ac.kr"
                aria-label="이메일"
                title="이메일"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="site-footer__col">
            <h4>사이트</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/platform/web">웹개발 샘플</Link></li>
              <li><Link to="/platform/app">앱개발 샘플</Link></li>
              <li><Link to="/platform/ai">AI 샘플</Link></li>
              <li><Link to="/platform/data">데이터 샘플</Link></li>
              <li><Link to="/platform/game">게임 샘플</Link></li>
              <li><Link to="/community">커뮤니티</Link></li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h4>리소스</h4>
            <ul>
              <li>
                <a href="https://github.com/aebonlee/sample" target="_blank" rel="noreferrer">
                  GitHub 저장소
                </a>
              </li>
              <li>
                <a href="https://github.com/aebonlee/sample/issues" target="_blank" rel="noreferrer">
                  이슈 / 제안
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/aebonlee/sample/blob/main/README.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  문서 / 가이드
                </a>
              </li>
              <li>
                <a href="https://claude.ai" target="_blank" rel="noreferrer">
                  Claude (디자인 변형)
                </a>
              </li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h4>문의</h4>
            <ul className="site-footer__info">
              <li><span>운영사</span>DreamIT Biz</li>
              <li>
                <span>대표 이메일</span>
                <a href="mailto:aebon@kyonggi.ac.kr">aebon@kyonggi.ac.kr</a>
              </li>
              <li>
                <span>웹사이트</span>
                <a href="https://dreamitbiz.com" target="_blank" rel="noreferrer">
                  dreamitbiz.com
                </a>
              </li>
              <li><span>도메인</span>sample.dreamitbiz.com</li>
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
            <a
              href="https://github.com/aebonlee/sample/blob/main/README.md"
              target="_blank"
              rel="noreferrer"
            >
              이용 안내
            </a>
            <a href="mailto:aebon@kyonggi.ac.kr">개인정보 문의</a>
          </nav>
        </div>
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
