import { Link } from 'react-router-dom';

export default function About() {
  return (
    <section className="container about">
      <header className="about__hero">
        <span className="section-eyebrow">About Sample Gallery</span>
        <h1>웹사이트 디자인을 가장 빠르게 시작하는 방법</h1>
        <p className="about__lead">
          Claude 와 함께 빠르게 웹사이트를 만들고 싶은 분들을 위한 <strong>디자인 샘플
          모음 + 실전 프로젝트 가이드</strong>입니다. 프로젝트 타입별로 그대로 가져다 쓸 수
          있는 정적 사이트와, 해당 디자인을 어떻게 만들었는지에 대한 설명을 함께 제공합니다.
        </p>
        <div className="about__hero-stats">
          <div><b>45+</b><span>디자인 샘플</span></div>
          <div><b>7</b><span>Solar LLM 프로젝트</span></div>
          <div><b>9</b><span>한기대 CT 프로젝트</span></div>
          <div><b>5</b><span>학습 사이트</span></div>
        </div>
      </header>

      <h2>🎯 어떤 사람들을 위한 사이트인가요?</h2>
      <div className="about__audience">
        <div className="about__audience-card">
          <h3>🚀 빠르게 시작하고 싶은 사람</h3>
          <p>
            "처음부터 디자인하기 부담스러워요" 라고 느낀다면, 마음에 드는 샘플을 골라
            <code>index.html</code> 의 텍스트만 바꾸세요. 한국어 폰트, 다크 모드, 반응형까지
            이미 들어 있습니다.
          </p>
        </div>
        <div className="about__audience-card">
          <h3>🧠 Claude 로 변형하고 싶은 사람</h3>
          <p>
            "이 디자인에서 색을 파스텔 톤으로 바꿔줘", "히어로를 그라데이션 대신 사진으로
            바꿔줘" 같은 요청을 Claude 에 던지세요. 샘플 코드가 바로 컨텍스트가 됩니다.
          </p>
        </div>
        <div className="about__audience-card">
          <h3>🎓 정식 교육 트랙이 필요한 사람</h3>
          <p>
            컴퓨팅 사고 7단계, Solar LLM 시스템 설계, 캡스톤 디자인 같이 본격적인 학습이
            필요하다면 <Link to="/projects">쉬었음 청년 프로젝트</Link>·
            <Link to="/projects-koreatech">한기대 프로젝트</Link>·
            <Link to="/learning">DreamIT 학습 사이트</Link> 로 이어 보세요.
          </p>
        </div>
      </div>

      <h2>📋 사용 방법</h2>
      <ol className="about__steps">
        <li>
          <strong>마음에 드는 샘플 고르기</strong> — 홈 또는 플랫폼별 페이지에서 카테고리를
          선택해 원하는 스타일의 디자인을 찾아보세요. 검색·필터·정렬이 모두 지원됩니다.
        </li>
        <li>
          <strong>미리보기 확인</strong> — 상세 페이지에서 데스크탑·태블릿·모바일 뷰포트로
          실제 동작을 확인할 수 있습니다.
        </li>
        <li>
          <strong>소스 복사 또는 다운로드</strong> — 파일별로 소스 코드를 복사하거나 ZIP 으로
          전체를 받아 자신의 프로젝트에 적용하세요.
        </li>
        <li>
          <strong>Claude 에게 변형 요청</strong> — "이 디자인에서 색을 파스텔 톤으로 바꿔줘"
          처럼 claude.ai 에 요청해 자신만의 디자인으로 발전시킬 수 있습니다.
        </li>
        <li>
          <strong>실전 프로젝트로 연결</strong> — 디자인을 익혔다면 Solar LLM 또는 컴퓨팅 사고
          7단계 실전 가이드로 한 단계 더 깊게 들어갈 수 있습니다.
        </li>
      </ol>

      <h2>🏗️ 프로젝트 카테고리</h2>
      <div className="about__cats">
        <div className="about__cat-card">
          <span className="about__cat-emoji">🌐</span>
          <h3>웹개발</h3>
          <p>개인 포트폴리오, 회사 사이트, 블로그, 랜딩 페이지, 쇼핑몰 등 브라우저에서 동작하는 정적 사이트.</p>
          <Link to="/platform/web" className="about__cat-link">웹개발 샘플 →</Link>
        </div>
        <div className="about__cat-card">
          <span className="about__cat-emoji">📱</span>
          <h3>앱개발</h3>
          <p>폰 프레임 안의 모바일 앱 UI 패턴: 상단바·FAB·바텀 탭·캘린더·핀테크 등.</p>
          <Link to="/platform/app" className="about__cat-link">앱개발 샘플 →</Link>
        </div>
        <div className="about__cat-card">
          <span className="about__cat-emoji">🤖</span>
          <h3>AI</h3>
          <p>이미지 생성, 챗봇, 코드 어시스턴트 같은 AI 서비스의 표준 UI 흐름.</p>
          <Link to="/platform/ai" className="about__cat-link">AI 샘플 →</Link>
        </div>
        <div className="about__cat-card">
          <span className="about__cat-emoji">📊</span>
          <h3>데이터</h3>
          <p>대시보드, 차트, 통계 카드, 필터링 등 데이터를 다루는 화면들.</p>
          <Link to="/platform/data" className="about__cat-link">데이터 샘플 →</Link>
        </div>
        <div className="about__cat-card">
          <span className="about__cat-emoji">🎮</span>
          <h3>게임</h3>
          <p>HTML5 Canvas 와 JS 만으로 만든 작은 게임들. 테트리스, 블랙잭, 스네이크 등.</p>
          <Link to="/platform/game" className="about__cat-link">게임 샘플 →</Link>
        </div>
        <div className="about__cat-card about__cat-card--feature">
          <span className="about__cat-emoji">🎓</span>
          <h3>실전 프로젝트</h3>
          <p>Solar LLM 7 + 한기대 CT 9, 총 16개 실전 프로젝트 가이드. 아키텍처·코드·배포까지.</p>
          <Link to="/projects" className="about__cat-link">프로젝트 →</Link>
        </div>
      </div>

      <h2>🤝 DreamIT Biz 패밀리</h2>
      <p>
        Sample Gallery 는 <a href="https://site.dreamitbiz.com" target="_blank" rel="noreferrer">
        DreamIT Biz</a> 가 운영하는 패밀리 사이트의 한 축입니다. 학습 트랙으로 이어지는 다른
        사이트도 <Link to="/learning">학습 사이트</Link> 에서 확인하세요.
      </p>
      <ul className="about__family">
        <li>🏢 <a href="https://site.dreamitbiz.com" target="_blank" rel="noreferrer">DreamIT Biz</a> — 운영사 본 사이트</li>
        <li>🎓 <a href="https://koreatech.dreamitbiz.com" target="_blank" rel="noreferrer">KOREATECH 컴퓨팅 사고</a> — 한국기술교육대학교 정규 강좌 사이트</li>
        <li>📚 <a href="https://books.dreamitbiz.com" target="_blank" rel="noreferrer">DreamIT Books</a> — 도서/학습 자료 보관소</li>
        <li>💼 <a href="https://wonjunjang.dreamitbiz.com" target="_blank" rel="noreferrer">Wonjun 포트폴리오</a> — 취업 준비 포트폴리오 템플릿 원본</li>
        <li>🎨 <strong>Sample Gallery</strong> (현재) — 디자인 샘플 + 실전 프로젝트 가이드</li>
      </ul>

      <h2>➕ 새 샘플 추가하기</h2>
      <p>
        샘플은 <code>public/samples/&lt;id&gt;/</code> 폴더에 독립된 정적 사이트로 들어갑니다.
        새 샘플을 추가하려면:
      </p>
      <ol className="about__steps">
        <li><code>public/samples/&lt;id&gt;/</code> 폴더를 만들고 <code>index.html</code> 을 포함해 필요한 파일을 넣습니다.</li>
        <li><code>src/data/samples.ts</code> 의 <code>samples</code> 배열에 메타데이터를 추가합니다.</li>
        <li><code>npm run dev</code> 로 로컬에서 확인 후 커밋·푸시하면 자동 배포됩니다.</li>
      </ol>

      <div className="about__cta">
        <h3>📬 제안 / 피드백</h3>
        <p>새 샘플 주제, 제휴 학습 사이트, 발견한 오류·개선점이 있으면 알려주세요.</p>
        <a
          href="mailto:aebon@kyonggi.ac.kr?subject=%5BSample%20Gallery%5D%20%EC%A0%9C%EC%95%88%2F%ED%94%BC%EB%93%9C%EB%B0%B1"
          className="btn btn--primary btn--sm"
        >
          이메일로 보내기 →
        </a>
      </div>
    </section>
  );
}
