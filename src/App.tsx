import { Link, NavLink, Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">S</span>
            <span className="brand-text">Sample Gallery</span>
          </Link>
          <nav className="site-nav">
            <NavLink to="/" end>샘플</NavLink>
            <NavLink to="/about">소개</NavLink>
            <a href="https://github.com/aebonlee/sample" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
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
    </div>
  );
}
