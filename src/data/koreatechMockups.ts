/**
 * 한기대 프로젝트 구현 페이지(mockup)용 메타데이터.
 * - 각 프로젝트는 public/projects-koreatech/<id>/ 에
 *   index.html (인터랙티브 데모) + style.css + script.js +
 *   main.py (파이썬 소스) 를 갖는다 (자기 완결 구조).
 */
export interface KTMockup {
  projectId: string;       // KOREATECH_PROJECTS 의 id
  baseDir: string;         // /projects-koreatech/<id>
  demoFile: string;        // index.html
  cssFile: string;         // style.css
  jsFile: string;          // script.js
  pyFile: string;          // main.py
  demoTitle: string;
  expectedOutput: string;  // 파이썬 실행 시 예상 콘솔 출력
}

export const KOREATECH_MOCKUPS: KTMockup[] = [
  {
    projectId: 'capstone-match',
    baseDir: '/projects-koreatech/capstone-match',
    demoFile: 'index.html',
    cssFile: 'style.css',
    jsFile: 'script.js',
    pyFile: 'main.py',
    demoTitle: '팀 매칭 인터랙티브',
    expectedOutput:
`Team 1: GPA평균 4.20 | 기술수 4
  - S01 (CSE)
  - S04 (CSE)
Team 2: GPA평균 4.05 | 기술수 4
  - S05 (ID)
  - S06 (EE)
Team 3: GPA평균 3.90 | 기술수 4
  - S03 (ME)
  - S02 (EE)`,
  },
  {
    projectId: '3d-printer-queue',
    baseDir: '/projects-koreatech/3d-printer-queue',
    demoFile: 'index.html',
    cssFile: 'style.css',
    jsFile: 'script.js',
    pyFile: 'main.py',
    demoTitle: '출력 큐 디스패치',
    expectedOutput:
`[접수] 학생A | drone_arm.stl | PLA | 예상 120분
[접수] 학생B | bracket.stl | PLA | 예상 30분
[접수] 학생C | housing.stl | ABS | 예상 180분
[배정] bracket.stl → 프린터 P1 (30분)
[배정] drone_arm.stl → 프린터 P3 (120분)
[배정] housing.stl → 프린터 P2 (180분)`,
  },
  {
    projectId: 'lab-safety',
    baseDir: '/projects-koreatech/lab-safety',
    demoFile: 'index.html',
    cssFile: 'style.css',
    jsFile: 'script.js',
    pyFile: 'main.py',
    demoTitle: '실험실 점검 자동화',
    expectedOutput:
`[기계실습실] 점검 결과
  o 환기 시스템: 정상
  o 비상정지 버튼: 정상
  ~ 절단기 칼날: 주의
→ 위험도: [정상]

[전기실습실] 점검 결과
  o 누전 차단기: 정상
  x 절연 장갑: 불량
→ 위험도: [위험]`,
  },
  {
    projectId: 'classroom-util',
    baseDir: '/projects-koreatech/classroom-util',
    demoFile: 'index.html',
    cssFile: 'style.css',
    jsFile: 'script.js',
    pyFile: 'main.py',
    demoTitle: '강의실 활용도 분석',
    expectedOutput:
`강의실         활용률     상태
공학관-101    12.0%   저활용
공학관-202     2.0%   저활용
정보관-305     8.0%   저활용`,
  },
  {
    projectId: 'iot-energy',
    baseDir: '/projects-koreatech/iot-energy',
    demoFile: 'index.html',
    cssFile: 'style.css',
    jsFile: 'script.js',
    pyFile: 'main.py',
    demoTitle: 'IoT 에너지 실시간 모니터',
    expectedOutput:
`! [공학관] 22시: 180kW (베이스 90kW, +100%) 이상치
+ [기숙사] 22시: 290kW (베이스 280kW, +4%) 정상
o [정보관] 22시: 75kW (베이스 80kW, -6%) 정상
o [공학관] 9시: 410kW (베이스 320kW, +28%) 정상
o [기숙사] 9시: 85kW (베이스 80kW, +6%) 정상`,
  },
  {
    projectId: 'auto-grader',
    baseDir: '/projects-koreatech/auto-grader',
    demoFile: 'index.html',
    cssFile: 'style.css',
    jsFile: 'script.js',
    pyFile: 'main.py',
    demoTitle: '코딩 과제 자동 채점',
    expectedOutput:
`[학생 채점] 100/100점
  o Case 1: 30점
  o Case 2: 20점
  o Case 3: 20점
  o Case 4: 30점`,
  },
  {
    projectId: 'gpa-sim',
    baseDir: '/projects-koreatech/gpa-sim',
    demoFile: 'index.html',
    cssFile: 'style.css',
    jsFile: 'script.js',
    pyFile: 'main.py',
    demoTitle: 'GPA 시뮬레이션',
    expectedOutput:
`[현재] GPA: 3.94 (9학점)
[예상] 다음 학기 후 GPA: 3.87
[목표 4.0] 남은 9학점 평균 4.06/4.5 필요`,
  },
  {
    projectId: 'internship-match',
    baseDir: '/projects-koreatech/internship-match',
    demoFile: 'index.html',
    cssFile: 'style.css',
    jsFile: 'script.js',
    pyFile: 'main.py',
    demoTitle: '산학협력 매칭',
    expectedOutput:
`[ST1 (CSE)]
  → CoA AI 엔지니어: 적합도 0.80
  → CoC 백엔드 개발자: 적합도 0.25
  → CoB 임베디드 엔지니어: 적합도 0.00

[ST2 (EE)]
  → CoB 임베디드 엔지니어: 적합도 1.00

[ST3 (CSE)]
  → CoC 백엔드 개발자: 적합도 1.00`,
  },
  {
    projectId: 'factory-sensor',
    baseDir: '/projects-koreatech/factory-sensor',
    demoFile: 'index.html',
    cssFile: 'style.css',
    jsFile: 'script.js',
    pyFile: 'main.py',
    demoTitle: '스마트팩토리 센서 분석',
    expectedOutput:
`[MOTOR-01] 72°C → 수집중
[MOTOR-01] 71°C → 수집중
[MOTOR-01] 73°C → 수집중
[MOTOR-01] 70°C → 수집중
[MOTOR-01] 72°C → 수집중
[MOTOR-01] 71°C → o 정상 (Z=0.18)
[MOTOR-01] 74°C → o 정상 (Z=1.27)
[MOTOR-01] 73°C → o 정상 (Z=0.83)
[MOTOR-01] 90°C → ! 이상치 (Z=12.65, 연속 1회)
[MOTOR-01] 92°C → ! 이상치 (Z=14.32, 연속 2회)
[MOTOR-01] 95°C → ! 이상치 (Z=17.00, 연속 3회)  → 예측 정비 필요!`,
  },
];

export const getKoreatechMockup = (projectId: string): KTMockup | undefined =>
  KOREATECH_MOCKUPS.find((m) => m.projectId === projectId);
