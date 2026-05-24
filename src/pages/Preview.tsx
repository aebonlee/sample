import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSample } from '../data/samples';

type Viewport = 'desktop' | 'tablet' | 'mobile';

const viewportLabel: Record<Viewport, string> = {
  desktop: '데스크탑',
  tablet: '태블릿',
  mobile: '모바일',
};

export default function Preview() {
  const { id } = useParams<{ id: string }>();
  const sample = id ? getSample(id) : undefined;
  const [viewport, setViewport] = useState<Viewport>('desktop');

  useEffect(() => {
    if (sample) document.title = `${sample.title} — 미리보기`;
  }, [sample]);

  if (!id || !sample) {
    return (
      <div className="preview-empty">
        <p>샘플을 찾을 수 없습니다.</p>
        <Link to="/">갤러리로 →</Link>
      </div>
    );
  }

  const rawUrl = `${import.meta.env.BASE_URL}samples/${id}/index.html`;

  return (
    <div className={`preview-page preview-page--${viewport}`}>
      <header className="preview-bar">
        <div className="preview-bar__left">
          <Link to={`/samples/${id}`} className="preview-bar__back">
            ← 상세로
          </Link>
          <span className="preview-bar__title">{sample.title}</span>
        </div>

        <div className="preview-bar__viewports" role="tablist" aria-label="뷰포트">
          {(['desktop', 'tablet', 'mobile'] as Viewport[]).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={viewport === v}
              className={`preview-bar__vp ${viewport === v ? 'is-active' : ''}`}
              onClick={() => setViewport(v)}
              title={viewportLabel[v]}
            >
              {v === 'desktop' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                </svg>
              )}
              {v === 'tablet' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M11 19h2"/>
                </svg>
              )}
              {v === 'mobile' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 19h2"/>
                </svg>
              )}
              <span>{viewportLabel[v]}</span>
            </button>
          ))}
        </div>

        <div className="preview-bar__right">
          <a href={rawUrl} target="_blank" rel="noreferrer" className="preview-bar__raw">
            원본 ↗️
          </a>
        </div>
      </header>

      <main className="preview-stage">
        <div className={`preview-frame preview-frame--${viewport}`}>
          <iframe
            src={rawUrl}
            title={`${sample.title} 미리보기`}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </main>
    </div>
  );
}
