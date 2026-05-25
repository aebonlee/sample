import { Link } from 'react-router-dom';
import SampleCard from '../components/SampleCard';
import {
  platformDescriptions,
  platformLabels,
  samples,
  samplesByPlatform,
  type Platform,
} from '../data/samples';

const platformOrder: Platform[] = ['web', 'app', 'ai', 'data', 'game'];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="hero__title">
            웹사이트 디자인 <span className="hero__accent">샘플 갤러리</span>
          </h1>
          <p className="hero__lead">
            개인 포트폴리오 · 회사 사이트 · 학습 사이트 · 블로그 등 프로젝트 타입별 디자인 샘플과
            소스코드를 제공합니다. 마음에 드는 디자인을 골라 그대로 가져다 쓰거나, 제작 방법을
            보고 직접 만들어 보세요.
          </p>
          <div className="hero__cta">
            <Link className="btn btn--primary" to="/platform/web">웹개발 샘플 보기</Link>
            <Link className="btn btn--ghost" to="/about">About 보기</Link>
          </div>
        </div>
      </section>

      <section className="container project-spot">
        <div className="section-head">
          <span className="section-eyebrow">실전 프로젝트 가이드</span>
          <h2 className="section-title">두 가지 트랙, 두 가지 깊이</h2>
          <p className="section-lead">
            교육 대상에 맞춰 분리된 프로젝트 가이드입니다. 디자인 샘플로 시작했다면, 다음
            단계로 실제 아키텍처·알고리즘·구현까지 이어 보세요.
          </p>
        </div>
        <div className="project-spot__grid">
          <Link to="/projects" className="project-spot__card project-spot__card--neet">
            <div className="project-spot__head">
              <span className="project-spot__icon">🌱</span>
              <span className="project-spot__count">7개 프로젝트</span>
            </div>
            <h3 className="project-spot__title">쉬었음 청년 프로젝트</h3>
            <p className="project-spot__desc">
              구직 활동을 잠시 멈춘 청년이 다시 한 걸음 떼는 데 도움이 되는 일상·서비스형
              Solar LLM 프로젝트 7개. 아키텍처 · 데이터 파이프라인 · Solar API · 프롬프트 ·
              DB 스키마 · 배포 계획까지 한 번에 정리되어 있습니다.
            </p>
            <ul className="project-spot__tags">
              <li>AI 동화책</li>
              <li>감정 일기 챗봇</li>
              <li>맞춤 정책 매칭</li>
              <li>+4</li>
            </ul>
            <span className="project-spot__cta">7개 프로젝트 살펴보기 →</span>
          </Link>

          <Link to="/projects-koreatech" className="project-spot__card project-spot__card--koreatech">
            <div className="project-spot__head">
              <span className="project-spot__icon">🎓</span>
              <span className="project-spot__count">9개 프로젝트</span>
            </div>
            <h3 className="project-spot__title">한기대 프로젝트 (CT 7단계)</h3>
            <p className="project-spot__desc">
              한국기술교육대학교 재학생을 위한 공학·전공 심화 9개 프로젝트. 컴퓨팅 사고
              7단계(문제 인식 → 정의 → 분해 → 추상화 → 알고리즘 → 구현 → 발표) 와
              브라우저에서 바로 실행 가능한 HTML/CSS/JS 데모, 파이썬 소스, ZIP 다운로드 포함.
            </p>
            <ul className="project-spot__tags">
              <li>캡스톤 팀 매칭</li>
              <li>3D 프린터 큐</li>
              <li>IoT 에너지 모니터링</li>
              <li>+6</li>
            </ul>
            <span className="project-spot__cta">9개 프로젝트 살펴보기 →</span>
          </Link>
        </div>
      </section>

      <section className="container platforms">
        <h2 className="section-title">샘플 플랫폼</h2>
        <div className="platforms__grid">
          {platformOrder.map((p) => {
            const count = samplesByPlatform(p).length;
            return (
              <Link key={p} to={`/platform/${p}`} className="platform-card">
                <div className="platform-card__head">
                  <span className="platform-card__label">{platformLabels[p]}</span>
                  <span className="platform-card__count">{count}</span>
                </div>
                <p className="platform-card__desc">{platformDescriptions[p]}</p>
                <span className="platform-card__cta">살펴보기 →</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="all" className="container gallery">
        <h2 className="section-title">전체 샘플 ({samples.length})</h2>
        <div className="gallery__grid">
          {samples.map((s) => (
            <SampleCard key={s.id} sample={s} />
          ))}
        </div>
      </section>
    </>
  );
}
