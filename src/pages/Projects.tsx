import { Link } from 'react-router-dom';
import { PROJECT_DATA } from '../data/projectDetails';

export default function Projects() {
  return (
    <section className="container projects-page">
      <header className="projects-page__head">
        <h1>프로젝트 샘플</h1>
        <p>
          Solar LLM을 활용한 7가지 실전 프로젝트 가이드입니다. 각 항목은 시스템 아키텍처,
          데이터 파이프라인, Solar API 활용, 프롬프트, DB 스키마, 배포 계획, 확장 가능성까지
          한 번에 정리되어 있습니다.
        </p>
      </header>

      <div className="proj-grid">
        {PROJECT_DATA.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`} className="proj-card" style={{ borderTopColor: p.color }}>
            <div className="proj-card__head">
              <span className="proj-card__icon" style={{ background: `${p.color}18`, color: p.color }}>
                {p.icon}
              </span>
              <span className="proj-card__num" style={{ color: p.color }}>0{p.id}</span>
            </div>
            <h3 className="proj-card__title">{p.title}</h3>
            <p className="proj-card__sub">{p.subtitle}</p>
            <div className="proj-card__tags">
              {p.solarApi.endpoints.slice(0, 3).map((ep, i) => (
                <span key={i} className="proj-card__tag">{ep.name.split(' (')[0]}</span>
              ))}
            </div>
            <span className="proj-card__more" style={{ color: p.color }}>가이드 보기 →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
