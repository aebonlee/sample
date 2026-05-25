import { Link, useLocation } from 'react-router-dom';
import { resolveProjectSet } from '../data/projectSets';

export default function Projects() {
  const location = useLocation();
  const set = resolveProjectSet(location.pathname);

  return (
    <section className="container projects-page">
      <header className="projects-page__head">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 999,
            background: 'rgba(0, 70, 200, 0.1)',
            color: '#0046C8',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          <span>👥</span>
          <span>{set.audienceLabel}</span>
        </div>
        <h1>{set.pageTitle}</h1>
        <p>{set.pageDescription}</p>
      </header>

      <div className="proj-grid">
        {set.data.map((p) => (
          <Link
            key={p.id}
            to={`${set.basePath}/${p.id}`}
            className="proj-card"
            style={{ borderTopColor: p.color }}
          >
            <div className="proj-card__head">
              <span
                className="proj-card__icon"
                style={{ background: `${p.color}18`, color: p.color }}
              >
                {p.icon}
              </span>
              <span className="proj-card__num" style={{ color: p.color }}>
                0{p.id}
              </span>
            </div>
            <h3 className="proj-card__title">{p.title}</h3>
            <p className="proj-card__sub">{p.subtitle}</p>
            <div className="proj-card__tags">
              {p.solarApi.endpoints.slice(0, 3).map((ep, i) => (
                <span key={i} className="proj-card__tag">
                  {ep.name.split(' (')[0]}
                </span>
              ))}
            </div>
            <span className="proj-card__more" style={{ color: p.color }}>
              가이드 보기 →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
