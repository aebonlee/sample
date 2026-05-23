export default function About() {
  return (
    <section className="container about">
      <h1>Sample Gallery 소개</h1>
      <p className="about__lead">
        Claude를 활용해 빠르게 웹사이트를 만들고 싶은 분들을 위한 디자인 샘플 모음입니다.
        프로젝트 타입별로 그대로 가져다 쓸 수 있는 정적 사이트와, 해당 디자인을 어떻게 만들었는지에
        대한 설명을 함께 제공합니다.
      </p>

      <h2>사용 방법</h2>
      <ol className="about__steps">
        <li>
          <strong>마음에 드는 샘플 고르기</strong> — 홈에서 카테고리를 선택해 원하는 스타일의
          디자인을 찾아보세요.
        </li>
        <li>
          <strong>미리보기 확인</strong> — 상세 페이지에서 데스크탑·태블릿·모바일 뷰포트로 실제
          동작을 확인할 수 있습니다.
        </li>
        <li>
          <strong>소스 복사 또는 다운로드</strong> — 파일별로 소스 코드를 복사하거나, 각 파일을
          다운로드해 자신의 프로젝트에 적용하세요.
        </li>
        <li>
          <strong>Claude에게 변형 요청</strong> — “이 디자인에서 색을 파스텔 톤으로 바꿔줘” 처럼
          claude.ai에 요청해 자신만의 디자인으로 발전시킬 수 있습니다.
        </li>
      </ol>

      <h2>새 샘플 추가하기</h2>
      <p>
        샘플은 <code>public/samples/&lt;id&gt;/</code> 폴더에 독립된 정적 사이트로 들어갑니다.
        새 샘플을 추가하려면:
      </p>
      <ol className="about__steps">
        <li><code>public/samples/&lt;id&gt;/</code> 폴더를 만들고 <code>index.html</code>을 포함해 필요한 파일을 넣습니다.</li>
        <li><code>src/data/samples.ts</code>의 <code>samples</code> 배열에 메타데이터를 추가합니다.</li>
        <li><code>npm run dev</code>로 로컬에서 확인 후 커밋·푸시하면 GitHub Actions가 자동 배포합니다.</li>
      </ol>
    </section>
  );
}
