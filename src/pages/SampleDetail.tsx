import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SourceViewer from '../components/SourceViewer';
import { categoryLabels, getSample } from '../data/samples';

export default function SampleDetail() {
  const { id } = useParams<{ id: string }>();
  const sample = id ? getSample(id) : undefined;
  const [activeFile, setActiveFile] = useState<string>(sample?.files[0] ?? '');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!sample) {
    return (
      <section className="container detail">
        <h2>샘플을 찾을 수 없습니다</h2>
        <p>
          <Link to="/">← 갤러리로 돌아가기</Link>
        </p>
      </section>
    );
  }

  const previewUrl = `${import.meta.env.BASE_URL}samples/${sample.id}/index.html`;

  return (
    <section className="container detail">
      <nav className="breadcrumb">
        <Link to="/">샘플</Link>
        <span>›</span>
        <span>{categoryLabels[sample.category]}</span>
        <span>›</span>
        <span aria-current="page">{sample.title}</span>
      </nav>

      <header className="detail__header">
        <div>
          <h1 className="detail__title">{sample.title}</h1>
          <p className="detail__desc">{sample.description}</p>
          <div className="detail__chips">
            {sample.stack.map((s) => (
              <span key={s} className="tag">
                {s}
              </span>
            ))}
            {sample.tags.map((t) => (
              <span key={t} className="tag tag--outline">
                #{t}
              </span>
            ))}
          </div>
        </div>
        <div className="detail__actions">
          <a className="btn btn--primary" href={previewUrl} target="_blank" rel="noreferrer">
            새 탭에서 열기 ↗
          </a>
        </div>
      </header>

      <div className="detail__preview-card">
        <div className="detail__viewport-toggle" role="tablist" aria-label="뷰포트">
          {(['desktop', 'tablet', 'mobile'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={viewport === v}
              className={`viewport-btn ${viewport === v ? 'is-active' : ''}`}
              onClick={() => setViewport(v)}
            >
              {v === 'desktop' ? '데스크탑' : v === 'tablet' ? '태블릿' : '모바일'}
            </button>
          ))}
        </div>
        <div className={`detail__preview detail__preview--${viewport}`}>
          <iframe
            src={previewUrl}
            title={`${sample.title} 미리보기`}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>

      {sample.guide && (
        <div className="detail__guide">
          <h2>제작 방법</h2>
          <p>{sample.guide}</p>
        </div>
      )}

      <div className="detail__source">
        <h2>소스 코드</h2>
        <div className="file-tabs" role="tablist" aria-label="파일">
          {sample.files.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={activeFile === f}
              className={`file-tab ${activeFile === f ? 'is-active' : ''}`}
              onClick={() => setActiveFile(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <SourceViewer sampleId={sample.id} filename={activeFile} />
      </div>
    </section>
  );
}
