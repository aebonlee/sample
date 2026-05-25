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

// 메인에서 강조할 대표 샘플 (선별 8개). 카테고리·난이도가 골고루 섞이도록 직접 선정.
const FEATURED_IDS = [
  'portfolio-02',  // 사진작가 — 사진 SVG 적용
  'personal-04',   // 취업 이력 — 사진 SVG 적용
  'portfolio-01',  // 스튜디오 — Unsplash 사진 적용
  'landing-02',    // SaaS 랜딩
  'shop-01',       // 커피 쇼핑
  'ai-01',         // 이미지 생성 UI
  'app-04',        // 캘린더 앱
  'blog-01',       // 편집형 블로그
];
const featuredSamples = FEATURED_IDS
  .map((id) => samples.find((s) => s.id === id))
  .filter((s): s is NonNullable<typeof s> => Boolean(s));

export default function Home() {
  return (
    <>
      {/* 1) HERO — 풍성한 비주얼 */}
      <section className="hero hero--v2">
        <div className="hero__bg" aria-hidden="true">
          <span className="hero__orb hero__orb--a" />
          <span className="hero__orb hero__orb--b" />
          <span className="hero__orb hero__orb--c" />
          <span className="hero__grid" />
        </div>
        <div className="container hero__inner">
          <div className="hero__text">
            <span className="hero__badge">
              <span className="hero__badge-dot" />
              45+ 디자인 샘플 · 16개 실전 프로젝트 · 5개 학습 사이트
            </span>
            <h1 className="hero__title">
              그대로 가져다 쓰는 <br/>
              <span className="hero__accent">디자인 샘플 갤러리</span>
            </h1>
            <p className="hero__lead">
              개인 포트폴리오 · 회사 사이트 · 학습 사이트 · 블로그 등 프로젝트 타입별 디자인 샘플과
              소스코드를 제공합니다. 마음에 드는 디자인을 골라 그대로 가져다 쓰거나, Claude 에게
              변형을 부탁해 자신만의 사이트로 빠르게 발전시켜 보세요.
            </p>
            <div className="hero__cta">
              <Link className="btn btn--primary" to="/platform/web">웹개발 샘플 보기</Link>
              <Link className="btn btn--ghost" to="/projects-koreatech">한기대 프로젝트 →</Link>
            </div>
            <ul className="hero__points">
              <li>✓ HTML · CSS · JS 정적 사이트</li>
              <li>✓ 다크 모드 · 반응형 기본 탑재</li>
              <li>✓ ZIP 다운로드 & Claude 변형 가이드</li>
            </ul>
          </div>

          {/* 우측 미니 미리보기 콜라주 (실제 샘플 SVG 4장) */}
          <div className="hero__collage" aria-hidden="true">
            <div className="hero__tile hero__tile--1">
              <img src={`${import.meta.env.BASE_URL}samples/portfolio-02/preview.svg`} alt="" loading="lazy"/>
            </div>
            <div className="hero__tile hero__tile--2">
              <img src={`${import.meta.env.BASE_URL}samples/personal-04/preview.svg`} alt="" loading="lazy"/>
            </div>
            <div className="hero__tile hero__tile--3">
              <div className="hero__stat-card">
                <span className="hero__stat-num">45+</span>
                <span className="hero__stat-label">디자인 샘플</span>
              </div>
              <div className="hero__stat-card hero__stat-card--alt">
                <span className="hero__stat-num">16</span>
                <span className="hero__stat-label">실전 프로젝트</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2) 샘플 소개 (플랫폼) */}
      <section className="container platforms">
        <div className="section-head">
          <span className="section-eyebrow">Sample Platforms</span>
          <h2 className="section-title">샘플 플랫폼</h2>
          <p className="section-lead">
            5개 카테고리로 정리된 디자인 샘플 모음. 클릭해서 해당 카테고리의 전체 샘플과 미리보기를
            확인하세요.
          </p>
        </div>
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

      {/* 3) 프로젝트 소개 (샘플 소개 다음) */}
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

      {/* 4) Featured 샘플 (전체가 아닌 선별 8개) */}
      <section id="featured" className="container gallery">
        <div className="section-head section-head--inline">
          <div>
            <span className="section-eyebrow">Featured Samples</span>
            <h2 className="section-title">대표 샘플</h2>
            <p className="section-lead">
              사진 적용·인터랙션·디자인이 가장 잘 드러나는 대표 샘플 {featuredSamples.length}개입니다.
              전체 {samples.length}개는 카테고리 페이지에서 확인하세요.
            </p>
          </div>
          <Link to="/platform/web" className="btn btn--ghost btn--sm gallery__see-all">
            전체 샘플 보기 →
          </Link>
        </div>
        <div className="gallery__grid">
          {featuredSamples.map((s) => (
            <SampleCard key={s.id} sample={s} />
          ))}
        </div>
        <div className="gallery__more">
          <Link to="/platform/web" className="btn btn--primary">
            45+ 전체 샘플 둘러보기 →
          </Link>
        </div>
      </section>
    </>
  );
}
