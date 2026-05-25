/**
 * 한국기술교육대학교(KOREATECH) 재학생용 컴퓨팅 사고 9개 프로젝트
 * - https://koreatech.dreamitbiz.com/assessment/project 와 동일한 CT 7단계 구조
 * - 쉬었음 청년 프로젝트(/projects, Solar LLM 기반)와는 별개 메뉴/구조
 */

export interface CTStepContent {
  ko: string;
}

export interface CTProjectData {
  id: string;
  icon: string;     // FontAwesome class (e.g. 'fa-solid fa-people-group')
  emoji: string;    // 아이콘 라이브러리 없이 표시할 fallback 이모지
  color: string;
  title: string;
  steps: {
    recognition: CTStepContent;    // 문제 인식 (15점)
    definition: CTStepContent;     // 문제 정의 (10점)
    decomposition: CTStepContent;  // 문제 분해 (10점)
    abstraction: CTStepContent;    // 추상화 (20점)
    algorithm: CTStepContent;      // 알고리즘 설계 (20점)
    implementation: CTStepContent; // 구현 (15점, code block)
    presentation?: CTStepContent;  // 결과 시연/발표 (10점, optional)
  };
}

export interface CTStepDef {
  id: keyof CTProjectData['steps'];
  emoji: string;
  labelKo: string;
  color: string;
  score: number;
}

export const CT_STEPS: CTStepDef[] = [
  { id: 'recognition',    emoji: '🔍', labelKo: '문제 인식',     color: '#DC2626', score: 15 },
  { id: 'definition',     emoji: '🎯', labelKo: '문제 정의',     color: '#EA580C', score: 10 },
  { id: 'decomposition',  emoji: '🧩', labelKo: '문제 분해',     color: '#F59E0B', score: 10 },
  { id: 'abstraction',    emoji: '🧪', labelKo: '추상화',        color: '#059669', score: 20 },
  { id: 'algorithm',      emoji: '🔗', labelKo: '알고리즘 설계', color: '#2563EB', score: 20 },
  { id: 'implementation', emoji: '💻', labelKo: '구현',          color: '#7C3AED', score: 15 },
  { id: 'presentation',   emoji: '🎤', labelKo: '결과 시연/발표', color: '#0891B2', score: 10 },
];

export interface RubricItem {
  step: string;
  score: number;
  a: string;
  b: string;
  c: string;
}

export const RUBRIC: RubricItem[] = [
  { step: '문제 인식',     score: 15, a: '실제 상황의 불편함을 명확하고 구체적으로 설명함', b: '문제 상황은 제시되나 맥락 설명이 다소 부족함', c: '문제 상황이 모호하거나 불명확함' },
  { step: '문제 정의',     score: 10, a: '해결 목표가 구체적이며 달성 가능하게 정의됨',   b: '목표는 있으나 다소 포괄적임',                  c: '목표가 불분명하거나 문제와 연결되지 않음' },
  { step: '문제 분해',     score: 10, a: '문제를 논리적으로 2개 이상 명확히 분해함',     b: '문제 분해는 있으나 논리 연결이 약함',         c: '문제 분해가 거의 없거나 형식적임' },
  { step: '추상화',        score: 20, a: '불필요한 요소를 제거하고 핵심 데이터/패턴을 잘 도출함', b: '핵심 요소는 있으나 추상화 수준이 낮음', c: '핵심 요소 도출이 되지 않음' },
  { step: '알고리즘 설계', score: 20, a: '단계별 절차가 명확하며 흐름이 논리적임',       b: '전반적 흐름은 있으나 일부 단계가 불명확함',  c: '절차가 혼란스럽거나 논리성이 부족함' },
  { step: '구현',          score: 15, a: '결과물이 목표에 맞게 정상적으로 동작함',       b: '일부 오류 또는 누락이 있으나 의도 파악 가능함', c: '코드가 불완전하거나 동작하지 않음' },
  { step: '결과 시연/발표', score: 10, a: '주요 핵심을 조리있게 발표',                  b: '일부 기능만 동작하거나 설명에 의존함',         c: '동작불가로 결과 시연 못함' },
];

export const KOREATECH_PROJECTS: CTProjectData[] = [
  {
    id: 'capstone-match',
    icon: 'fa-solid fa-people-group',
    emoji: '🎓',
    color: '#0046C8',
    title: '캡스톤 디자인 팀 매칭 시스템',
    steps: {
      recognition: { ko: '캡스톤 디자인 수업에서 학생들이 팀을 자유 구성하면 전공 역량과 관심 분야의 균형이 맞지 않아 특정 팀에 우수 인력이 몰리거나, 역량이 부족한 팀이 발생한다. 교수가 수십 개 팀을 일일이 조율하기 어렵다.' },
      definition:  { ko: '학생별 전공·기술 스택·GPA·관심 주제를 입력받아, 팀당 역량이 균형 잡히도록 자동 매칭하는 시스템을 구축한다. 목표: 팀당 평균 GPA 편차 ±0.3 이내, 기술 다양성 점수 80% 이상.' },
      decomposition: { ko: '1) 학생 프로필 입력 (전공, 기술, GPA, 관심 주제)\n2) 팀 균형 점수 산출 모듈 (GPA 분산 + 기술 다양성)\n3) 매칭 알고리즘 (탐욕적 그리디 + 스왑 최적화)\n4) 팀 구성 결과 시각화\n5) 매칭 결과 CSV 내보내기' },
      abstraction: { ko: '핵심 변수: 학생ID, 전공코드, 기술스택(set), GPA(float), 관심주제(list)\n불필요한 요소 제거: 출신지, 동아리, 학년 등은 매칭 기준에서 제외\n패턴: "팀 균형 = α·GPA균형 + β·기술다양성 + γ·관심도 일치" 가중합 모델' },
      algorithm: { ko: '1. 학생 프로필 리스트 수집\n2. GPA 기준 내림차순 정렬 → 팀 수만큼 라운드 로빈 배정\n3. 팀별 기술 다양성 점수 계산 (고유 기술 수 / 전체 기술 수)\n4. 점수 낮은 팀에 대해 다른 팀과 스왑하며 점수 개선 시도 (최대 100회)\n5. 최종 팀 구성 + 균형 점수 리포트 출력' },
      implementation: { ko: '```python\n# 캡스톤 디자인 팀 매칭\nstudents = [\n    {"id": "S01", "major": "CSE", "skills": {"Python", "AI"}, "gpa": 4.2},\n    {"id": "S02", "major": "EE",  "skills": {"PCB", "C"},      "gpa": 3.8},\n    {"id": "S03", "major": "ME",  "skills": {"CAD", "3D"},     "gpa": 4.0},\n    {"id": "S04", "major": "CSE", "skills": {"Web", "DB"},     "gpa": 3.5},\n    {"id": "S05", "major": "ID",  "skills": {"UX", "Figma"},   "gpa": 4.1},\n    {"id": "S06", "major": "EE",  "skills": {"IoT", "Python"}, "gpa": 3.9},\n]\nTEAM_SIZE = 3\n\ndef tech_diversity(team):\n    all_skills = set()\n    for s in team: all_skills |= s["skills"]\n    return len(all_skills)\n\ndef match_teams(students, team_size):\n    sorted_s = sorted(students, key=lambda x: -x["gpa"])\n    n_teams = len(students) // team_size\n    teams = [[] for _ in range(n_teams)]\n    for i, s in enumerate(sorted_s):\n        teams[i % n_teams].append(s)\n    return teams\n\nteams = match_teams(students, TEAM_SIZE)\nfor i, t in enumerate(teams, 1):\n    avg_gpa = sum(s["gpa"] for s in t) / len(t)\n    print(f"Team {i}: GPA평균 {avg_gpa:.2f} | 기술수 {tech_diversity(t)}")\n    for s in t: print(f"  - {s[\'id\']} ({s[\'major\']})")\n```' },
    },
  },
  {
    id: '3d-printer-queue',
    icon: 'fa-solid fa-print',
    emoji: '🖨️',
    color: '#7C3AED',
    title: '3D 프린터 출력 큐 관리 시스템',
    steps: {
      recognition: { ko: '실습실의 3D 프린터는 수량이 한정되어 있는데 학생들의 출력 요청은 많아 대기가 길어진다. 누가 언제 어떤 파일을 출력 중인지 불투명하고, 긴 출력물이 큐를 막아 짧은 과제도 늦어진다.' },
      definition:  { ko: '학생이 출력 요청을 제출하면 예상 소요 시간·우선순위(과제 마감일)·재료를 기준으로 최적의 프린터에 자동 배정하는 큐 관리 시스템을 구축한다. 평균 대기 시간 30% 단축이 목표.' },
      decomposition: { ko: '1) 프린터 등록 (장비ID, 지원 재료, 현재 상태)\n2) 출력 요청 접수 (파일명, 예상 시간, 마감일, 재료)\n3) 우선순위 점수 산출 (마감일 임박 + 출력 시간 짧음)\n4) 프린터 매칭 (재료 호환 + 가용성)\n5) 진행률 표시 및 완료 알림' },
      abstraction: { ko: '핵심 변수: 작업ID, 학생ID, 예상시간(분), 마감일, 재료, 프린터 상태(idle/busy)\n단순화: 출력물 품질, 색상, 후처리 작업 등은 제외\n패턴: 모든 작업은 "접수 → 우선순위 산출 → 큐 삽입 → 프린터 배정 → 출력 → 완료" 흐름' },
      algorithm: { ko: '1. 출력 요청 입력 → 우선순위 점수 = (10000 / 남은시간) - (예상시간 / 60)\n2. 우선순위 큐(힙)에 삽입\n3. 가용 프린터 탐색 (재료 호환)\n4. 매칭되면 작업 시작, 큐에서 제거\n5. 완료 시 다음 작업 자동 배정\n6. 평균 대기 시간 통계 출력' },
      implementation: { ko: '```python\n# 3D 프린터 출력 큐 관리\nimport heapq\n\nprinters = [\n    {"id": "P1", "material": "PLA", "busy": False},\n    {"id": "P2", "material": "ABS", "busy": False},\n    {"id": "P3", "material": "PLA", "busy": False},\n]\nqueue = []  # (우선순위, job)\n\ndef submit_job(student, est_min, deadline_h, material, file):\n    priority = -(10000 / max(deadline_h, 1) - est_min / 60)  # 음수=높은 우선순위\n    job = {"student": student, "est": est_min, "mat": material, "file": file}\n    heapq.heappush(queue, (priority, file, job))\n    print(f"[접수] {student} | {file} | {material} | 예상 {est_min}분")\n\ndef dispatch():\n    while queue:\n        _, _, job = heapq.heappop(queue)\n        for p in printers:\n            if not p["busy"] and p["material"] == job["mat"]:\n                p["busy"] = True\n                print(f"[배정] {job[\'file\']} → 프린터 {p[\'id\']} ({job[\'est\']}분)")\n                break\n        else:\n            print(f"[대기] {job[\'file\']}: 호환 프린터 부재")\n\nsubmit_job("학생A", 120, 6,  "PLA", "drone_arm.stl")\nsubmit_job("학생B", 30,  2,  "PLA", "bracket.stl")\nsubmit_job("학생C", 180, 24, "ABS", "housing.stl")\ndispatch()\n```' },
    },
  },
  {
    id: 'lab-safety',
    icon: 'fa-solid fa-helmet-safety',
    emoji: '⛑️',
    color: '#DC2626',
    title: '실험실 안전 점검 자동화 시스템',
    steps: {
      recognition: { ko: '공학 실습실에는 절단기·용접기·고전압 장비 등 위험 요소가 다수 존재한다. 매일 수기로 안전 점검 체크리스트를 작성하지만 누락·허위 기재가 발생하고, 사고 발생 시 점검 이력 추적이 어렵다.' },
      definition:  { ko: '실습실별 점검 항목을 디지털로 관리하고, 미점검 항목을 자동 감지·알림하며, 모든 점검 이력을 추적 가능한 안전 점검 자동화 시스템을 구현한다.' },
      decomposition: { ko: '1) 실습실/점검 항목 마스터 (실험실명, 위험요소, 점검 주기)\n2) 점검 기록 입력 (점검자, 시각, 상태)\n3) 미점검 자동 감지 (마지막 점검 시각 기준)\n4) 위험 등급별 알림 (정상/주의/위험)\n5) 점검 이력 통계 및 리포트' },
      abstraction: { ko: '핵심 변수: 실험실ID, 항목ID, 점검주기(시간), 마지막점검시각, 상태(OK/WARN/FAIL)\n단순화: 점검자 자격 검증, CCTV 연동 등 제외\n패턴: "현재시각 - 마지막점검시각 > 점검주기 → 미점검 알림"' },
      algorithm: { ko: '1. 실험실별 점검 항목 등록\n2. 점검 시 상태 기록 (OK/WARN/FAIL) + 시각 저장\n3. 매 시간 스캔: 현재시각 - 마지막점검시각 > 주기 → 미점검 처리\n4. 위험 등급 계산:\n   - FAIL 1개 이상 → "위험" (즉시 알림)\n   - WARN 2개 이상 → "주의"\n   - 그 외 → "정상"\n5. 일일/주간 점검률 리포트 자동 생성' },
      implementation: { ko: '```python\n# 실험실 안전 점검 자동화\nfrom datetime import datetime, timedelta\n\nlabs = {\n    "기계실습실": [\n        {"item": "환기 시스템",   "last": datetime.now() - timedelta(hours=2),  "status": "OK",   "freq": 8},\n        {"item": "비상정지 버튼", "last": datetime.now() - timedelta(hours=10), "status": "OK",   "freq": 8},\n        {"item": "절단기 칼날",   "last": datetime.now() - timedelta(hours=1),  "status": "WARN", "freq": 24},\n    ],\n    "전기실습실": [\n        {"item": "누전 차단기", "last": datetime.now() - timedelta(hours=3),  "status": "OK",   "freq": 12},\n        {"item": "절연 장갑",   "last": datetime.now() - timedelta(hours=20), "status": "FAIL", "freq": 24},\n    ],\n}\n\ndef inspect(lab_name):\n    now = datetime.now()\n    print(f"\\n[{lab_name}] 점검 결과")\n    fail_count = warn_count = miss_count = 0\n    for chk in labs[lab_name]:\n        hours_passed = (now - chk["last"]).total_seconds() / 3600\n        if hours_passed > chk["freq"]:\n            miss_count += 1\n            print(f"  ! {chk[\'item\']}: 미점검 ({hours_passed:.1f}h 경과)")\n        elif chk["status"] == "FAIL":\n            fail_count += 1\n            print(f"  x {chk[\'item\']}: 불량")\n        elif chk["status"] == "WARN":\n            warn_count += 1\n            print(f"  ~ {chk[\'item\']}: 주의")\n        else:\n            print(f"  o {chk[\'item\']}: 정상")\n    level = "위험" if fail_count or miss_count else "주의" if warn_count >= 2 else "정상"\n    print(f"→ 위험도: [{level}]")\n\nfor lab in labs: inspect(lab)\n```' },
    },
  },
  {
    id: 'classroom-util',
    icon: 'fa-solid fa-chalkboard-user',
    emoji: '🏫',
    color: '#EA580C',
    title: '강의실 활용도 분석 시스템',
    steps: {
      recognition: { ko: '한기대 캠퍼스의 강의실은 시간대·요일에 따라 사용률 격차가 크다. 일부 강의실은 비어 있는데 다른 곳은 예약이 꽉 차서 동아리·스터디룸 신청 시 충돌이 발생한다. 학사 운영팀이 수기로 분석하기엔 데이터가 너무 많다.' },
      definition:  { ko: '강의 시간표 및 예약 데이터를 분석하여 강의실별/시간대별 활용률을 산출하고, 저활용 강의실을 자유 사용 공간으로 추천하는 시스템을 구축한다.' },
      decomposition: { ko: '1) 강의실 마스터 데이터 (호실, 수용인원, 설비)\n2) 시간표·예약 데이터 입력\n3) 시간대별·요일별 활용률 계산\n4) 저활용 강의실 식별 (활용률 < 30%)\n5) 활용률 히트맵 및 추천 리포트 출력' },
      abstraction: { ko: '핵심 변수: 호실ID, 요일, 교시(1~10), 사용여부(bool), 수용인원, 실제인원\n단순화: 강의 난이도, 교수 평점, 강의 카테고리 등 제외\n패턴: "활용률 = 사용 슬롯 수 / 전체 슬롯 수 × 100"' },
      algorithm: { ko: '1. 강의실 × 요일 × 교시 매트릭스 초기화 (5 × 10 = 50 슬롯)\n2. 시간표 데이터 입력 시 해당 슬롯을 사용으로 마킹\n3. 강의실별 활용률 = 사용 슬롯 / 50 × 100\n4. 활용률 < 30% → "저활용" 분류 → 자유 사용 후보\n5. 시간대별 평균 활용률 출력 (어느 시간대가 한산한지)' },
      implementation: { ko: '```python\n# 강의실 활용도 분석\nclassrooms = {\n    "공학관-101": [[False]*10 for _ in range(5)],\n    "공학관-202": [[False]*10 for _ in range(5)],\n    "정보관-305": [[False]*10 for _ in range(5)],\n}\n\nschedules = [\n    ("공학관-101", 0, 1), ("공학관-101", 0, 2), ("공학관-101", 1, 3),\n    ("공학관-101", 2, 1), ("공학관-101", 2, 2), ("공학관-101", 3, 4),\n    ("공학관-202", 0, 1),\n    ("정보관-305", 1, 5), ("정보관-305", 2, 5), ("정보관-305", 3, 6), ("정보관-305", 4, 6),\n]\n\nfor room, day, period in schedules:\n    classrooms[room][day][period] = True\n\ndef analyze():\n    print(f"{\'강의실\':<12} {\'활용률\':>6} {\'상태\':>8}")\n    for room, matrix in classrooms.items():\n        used = sum(sum(row) for row in matrix)\n        rate = used / 50 * 100\n        status = "저활용" if rate < 30 else "보통" if rate < 70 else "포화"\n        print(f"{room:<12} {rate:>5.1f}% {status:>8}")\n\nanalyze()\n```' },
    },
  },
  {
    id: 'iot-energy',
    icon: 'fa-solid fa-bolt',
    emoji: '⚡',
    color: '#F59E0B',
    title: '스마트 캠퍼스 IoT 에너지 모니터링',
    steps: {
      recognition: { ko: '캠퍼스 내 강의동·기숙사·실험동의 전력 사용량이 건물별로 다르고, 야간·휴일 불필요한 전력 낭비가 발생한다. 전기 요금 고지서를 받기 전까지는 어디서 얼마나 쓰는지 알 수 없다.' },
      definition:  { ko: '각 건물에 설치된 IoT 전력 센서 데이터를 1분 단위로 수집·분석하여 시간대별 전력 패턴을 시각화하고, 평소보다 30% 이상 초과 사용 시 경고를 발생시키는 모니터링 시스템을 구축한다.' },
      decomposition: { ko: '1) 센서 등록 (건물ID, 위치, 정격용량)\n2) 실시간 데이터 수집 (1분 단위 kW)\n3) 시간대별 평균 계산 (24시간 베이스라인)\n4) 이상치 감지 (베이스라인 ±30%)\n5) 경고 알림 + 일일 사용량 리포트' },
      abstraction: { ko: '핵심 변수: 센서ID, 시각, kW, 베이스라인kW, 임계비율\n단순화: 기상 데이터, 학사일정, 전압 변동 등 제외\n패턴: "현재값 > 베이스라인 × (1 + 임계비율) → 경고" 단순 규칙 기반 이상치 감지' },
      algorithm: { ko: '1. 건물별 시간대(0~23시) 평균 kW를 베이스라인으로 저장\n2. 매 1분 데이터 수신 시:\n   - 현재 시간대의 베이스라인 조회\n   - 차이율 = (현재값 - 베이스라인) / 베이스라인 × 100\n3. 차이율 > 30% → 경고\n4. 일일 누적 kWh = ∑(현재값 × 1/60)\n5. 건물별 비교 차트 + Top 3 절감 대상 출력' },
      implementation: { ko: '```python\n# 스마트 캠퍼스 IoT 에너지 모니터링\nbaselines = {\n    "공학관": {9: 320, 12: 280, 15: 340, 18: 200, 22: 90},\n    "기숙사": {9: 80,  12: 110, 15: 100, 18: 220, 22: 280},\n    "정보관": {9: 410, 12: 360, 15: 420, 18: 240, 22: 80},\n}\nreadings = [\n    ("공학관", 22, 180),  # 야간 이상치\n    ("기숙사", 22, 290),\n    ("정보관", 22, 75),\n    ("공학관", 9, 410),   # 주간 이상치\n    ("기숙사", 9, 85),\n]\n\nTHRESHOLD = 0.30\n\ndef check(building, hour, current):\n    base = baselines[building].get(hour)\n    if not base: return\n    diff = (current - base) / base\n    if diff > THRESHOLD:\n        print(f"! [{building}] {hour}시: {current}kW (베이스 {base}kW, +{diff*100:.0f}%) 이상치")\n    elif diff < -THRESHOLD:\n        print(f"+ [{building}] {hour}시: {current}kW (절감 {-diff*100:.0f}%)")\n    else:\n        print(f"o [{building}] {hour}시: {current}kW 정상")\n\nfor b, h, c in readings: check(b, h, c)\n```' },
    },
  },
  {
    id: 'auto-grader',
    icon: 'fa-solid fa-code-compare',
    emoji: '🧮',
    color: '#059669',
    title: '코딩 과제 자동 채점 시스템',
    steps: {
      recognition: { ko: '프로그래밍 수업에서 100명 이상의 학생이 제출한 파이썬 과제를 조교가 수기로 채점하는 데 며칠이 걸린다. 채점 기준이 일관되지 않고, 학생들은 결과 피드백을 늦게 받아 학습 효과가 떨어진다.' },
      definition:  { ko: '학생이 제출한 파이썬 코드를 입력/출력 테스트 케이스 기준으로 자동 실행하여 정답 여부와 부분 점수를 산출하고, 즉시 피드백을 제공하는 채점 시스템을 구현한다.' },
      decomposition: { ko: '1) 과제 등록 (문제 ID, 테스트 케이스, 배점)\n2) 코드 제출 입력 (파일 또는 텍스트)\n3) 샌드박스 실행 (타임아웃 + 메모리 제한)\n4) 출력 비교 + 부분 점수 계산\n5) 피드백 생성 (오답 케이스 + 힌트)' },
      abstraction: { ko: '핵심 변수: 과제ID, 학생ID, 코드(str), 테스트케이스(input/expected), 실제출력, 점수\n단순화: 코드 스타일, 변수명, 주석 등 평가 제외 (기능 정확성에만 집중)\n패턴: 모든 채점은 "코드 실행 → 출력 비교 → 점수 합산" 동일 구조' },
      algorithm: { ko: '1. 과제별 테스트 케이스 N개 + 케이스별 배점\n2. 학생 코드를 함수로 래핑\n3. 각 테스트 케이스 실행:\n   - 예외 발생 → 0점\n   - 타임아웃(2초) → 0점\n   - 출력 일치 → 배점 만점\n4. 총점 = 케이스별 점수 합\n5. 오답 케이스 입력값을 피드백으로 출력' },
      implementation: { ko: '```python\n# 코딩 과제 자동 채점\ndef grade(student_func, test_cases):\n    total = 0\n    max_total = sum(tc["pts"] for tc in test_cases)\n    feedback = []\n    for i, tc in enumerate(test_cases, 1):\n        try:\n            result = student_func(*tc["input"])\n            if result == tc["expected"]:\n                total += tc["pts"]\n                feedback.append(f"  o Case {i}: {tc[\'pts\']}점")\n            else:\n                feedback.append(f"  x Case {i}: 입력={tc[\'input\']} → 기대={tc[\'expected\']}, 실제={result}")\n        except Exception as e:\n            feedback.append(f"  x Case {i}: 예외 발생 - {type(e).__name__}")\n    return total, max_total, feedback\n\n# 문제: 두 수의 합\ndef student_sum(a, b):\n    return a + b\n\ncases = [\n    {"input": (1, 2),     "expected": 3,   "pts": 30},\n    {"input": (0, 0),     "expected": 0,   "pts": 20},\n    {"input": (-5, 5),    "expected": 0,   "pts": 20},\n    {"input": (100, 200), "expected": 300, "pts": 30},\n]\nscore, max_s, fb = grade(student_sum, cases)\nprint(f"[학생 채점] {score}/{max_s}점")\nfor line in fb: print(line)\n```' },
    },
  },
  {
    id: 'gpa-sim',
    icon: 'fa-solid fa-chart-line',
    emoji: '📈',
    color: '#2563EB',
    title: '학점/GPA 시뮬레이션 시스템',
    steps: {
      recognition: { ko: '한기대 학생들은 졸업 학점 충족, 장학금 GPA 컷, 대학원/취업 GPA 등 다양한 목표가 있는데, 학기 중 어떤 과목을 얼마나 잘 받아야 목표를 달성할 수 있는지 직관적으로 알기 어렵다.' },
      definition:  { ko: '현재까지의 이수 학점·성적과 향후 수강 예정 과목을 입력하면, 졸업 시점 누적 GPA를 예측하고 목표 GPA 달성을 위해 필요한 최소 학점을 역산하는 시스템을 구축한다.' },
      decomposition: { ko: '1) 이수 과목 입력 (과목명, 학점, 성적)\n2) 4.5 학점제 환산 테이블 (A+=4.5, A=4.0, B+=3.5 ...)\n3) 누적 GPA 계산 모듈\n4) 미래 과목 시뮬레이션 (가정 성적 입력)\n5) 목표 GPA 역산 (필요 평균 학점 계산)' },
      abstraction: { ko: '핵심 변수: 과목명, 학점(int), 성적코드, 학점값(float), 누적학점합, 누적평점합\n단순화: 재수강 처리, P/F 과목, 교양/전공 비율 등 제외\n패턴: "GPA = ∑(학점×성적값) / ∑학점" 가중평균 모델' },
      algorithm: { ko: '1. 성적 코드 → 4.5 환산 (A+=4.5, A=4.0, B+=3.5, B=3.0 등)\n2. 누적 GPA = ∑(학점 × 성적값) / ∑학점\n3. 향후 과목 시뮬레이션: 추가 학점/성적 합산 → 새 GPA\n4. 목표 GPA 역산:\n   - 남은 학점 N개, 목표 GPA = T\n   - 필요 평균 성적값 = (T × (현재학점합 + N) - 현재평점합) / N\n5. 결과 출력 (현재 / 시뮬레이션 / 목표 달성 가능 여부)' },
      implementation: { ko: '```python\n# 학점/GPA 시뮬레이션\nGRADE = {"A+": 4.5, "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D": 1.0, "F": 0.0}\n\ncompleted = [\n    {"course": "프로그래밍기초", "credit": 3, "grade": "A"},\n    {"course": "선형대수",       "credit": 3, "grade": "B+"},\n    {"course": "컴퓨팅사고",     "credit": 2, "grade": "A+"},\n    {"course": "전공기초실험",   "credit": 1, "grade": "A"},\n]\n\ndef calc_gpa(courses):\n    total_credit = sum(c["credit"] for c in courses)\n    total_point  = sum(c["credit"] * GRADE[c["grade"]] for c in courses)\n    return total_point / total_credit, total_credit, total_point\n\ndef need_for_target(curr_credit, curr_point, future_credit, target):\n    required = (target * (curr_credit + future_credit) - curr_point) / future_credit\n    return round(required, 2)\n\ngpa, tc, tp = calc_gpa(completed)\nprint(f"[현재] GPA: {gpa:.2f} ({tc}학점)")\n\nfuture = [{"credit": 3, "grade": "A"}, {"credit": 3, "grade": "B+"}]\nnew_gpa, _, _ = calc_gpa(completed + future)\nprint(f"[예상] 다음 학기 후 GPA: {new_gpa:.2f}")\n\nneeded = need_for_target(tc, tp, 9, 4.0)\nprint(f"[목표 4.0] 남은 9학점 평균 {needed}/4.5 필요")\n```' },
    },
  },
  {
    id: 'internship-match',
    icon: 'fa-solid fa-briefcase',
    emoji: '💼',
    color: '#0891B2',
    title: '산학협력 인턴십 매칭 시스템',
    steps: {
      recognition: { ko: '한기대는 산학협력이 강점인데, 학생들은 어느 기업이 자신의 전공/스킬에 맞는지 일일이 검색해야 하고, 기업들도 적합한 학생을 찾는 데 시간이 오래 걸린다. 결과적으로 매칭이 비효율적이다.' },
      definition:  { ko: '학생의 전공·기술 스택·희망 분야와 기업의 직무·요구 스킬을 양방향 매칭하여 적합도 점수가 높은 순으로 추천하는 인턴십 매칭 시스템을 구축한다.' },
      decomposition: { ko: '1) 학생 프로필 등록 (전공, 스킬셋, 관심 산업)\n2) 기업 직무 공고 등록 (직무명, 요구 스킬, 우대 전공)\n3) 적합도 점수 계산 (스킬 일치율 + 전공 일치 + 관심 일치)\n4) 양방향 추천 (학생→기업 Top5, 기업→학생 Top5)\n5) 매칭 통계 대시보드' },
      abstraction: { ko: '핵심 변수: 학생/기업 ID, 스킬셋(set), 전공코드, 가중치(α, β, γ)\n단순화: 학점 컷, 어학 성적, 자격증 가산점 등 제외\n패턴: "점수 = α·스킬일치율 + β·전공일치(0/1) + γ·관심일치(0/1)"' },
      algorithm: { ko: '1. 학생 스킬셋 ∩ 기업 요구스킬 → 일치율 = |교집합| / |기업요구|\n2. 학생 전공 == 기업 우대 전공 → 1, 아니면 0\n3. 학생 관심 산업 == 기업 산업 → 1, 아니면 0\n4. 적합도 = 0.6 × 스킬일치율 + 0.25 × 전공일치 + 0.15 × 관심일치\n5. 학생별 Top5 기업, 기업별 Top5 학생 출력' },
      implementation: { ko: '```python\n# 산학협력 인턴십 매칭\nstudents = [\n    {"id": "ST1", "major": "CSE", "skills": {"Python", "ML", "TensorFlow"}, "interest": "AI"},\n    {"id": "ST2", "major": "EE",  "skills": {"PCB", "C", "RTOS"},           "interest": "Embedded"},\n    {"id": "ST3", "major": "CSE", "skills": {"Java", "Spring", "DB"},       "interest": "Web"},\n]\ncompanies = [\n    {"id": "CoA", "job": "AI 엔지니어",       "need": {"Python", "ML", "PyTorch"}, "major": "CSE", "industry": "AI"},\n    {"id": "CoB", "job": "임베디드 엔지니어", "need": {"C", "RTOS", "PCB"},         "major": "EE",  "industry": "Embedded"},\n    {"id": "CoC", "job": "백엔드 개발자",     "need": {"Java", "Spring", "DB"},     "major": "CSE", "industry": "Web"},\n]\n\ndef score(s, c):\n    overlap = len(s["skills"] & c["need"]) / max(len(c["need"]), 1)\n    major_m = 1 if s["major"] == c["major"] else 0\n    int_m   = 1 if s["interest"] == c["industry"] else 0\n    return 0.6 * overlap + 0.25 * major_m + 0.15 * int_m\n\nfor s in students:\n    ranked = sorted(companies, key=lambda c: -score(s, c))\n    print(f"\\n[{s[\'id\']} ({s[\'major\']})]")\n    for c in ranked[:3]:\n        print(f"  → {c[\'id\']} {c[\'job\']}: 적합도 {score(s, c):.2f}")\n```' },
    },
  },
  {
    id: 'factory-sensor',
    icon: 'fa-solid fa-industry',
    emoji: '🏭',
    color: '#475569',
    title: '스마트팩토리 센서 데이터 분석',
    steps: {
      recognition: { ko: '한기대 메카트로닉스/생산실습장에서 가동되는 생산 라인의 센서(온도·진동·압력) 데이터를 수동으로 점검하면 이상 징후를 놓쳐 설비 고장으로 이어진다. 사후 대응은 비용이 크다.' },
      definition:  { ko: '생산 라인 센서 데이터를 실시간 수집·분석하여 표준편차 기반 이상치를 자동 감지하고, 이상 패턴이 누적되면 예측 정비(Predictive Maintenance) 알림을 발생시키는 시스템을 구축한다.' },
      decomposition: { ko: '1) 센서 데이터 입력 (시각, 센서ID, 측정값)\n2) 통계 모듈 (평균, 표준편차 계산)\n3) 이상치 탐지 (Z-score > 2.5)\n4) 시간 누적 분석 (이상치 3회 연속 시 경고)\n5) 예측 정비 알림 + 로그 저장' },
      abstraction: { ko: '핵심 변수: 센서ID, 시각, 값, 평균(μ), 표준편차(σ), Z-score\n단순화: 센서 종류별 단위 변환, 노이즈 필터링 등 제외\n패턴: "|값 - μ| / σ > 임계치 → 이상" Z-score 기반 통계적 이상 탐지' },
      algorithm: { ko: '1. 최근 50개 측정값 슬라이딩 윈도우 유지\n2. 윈도우의 평균(μ), 표준편차(σ) 계산\n3. 새 측정값 X 입력 시:\n   - Z = |X - μ| / σ\n   - Z > 2.5 → 이상치 카운트 +1\n   - Z ≤ 2.5 → 카운트 리셋\n4. 카운트 ≥ 3 → "예측 정비 필요" 알림\n5. 정상치는 윈도우 누적, 이상치는 별도 로그' },
      implementation: { ko: '```python\n# 스마트팩토리 센서 데이터 분석\nfrom statistics import mean, stdev\nfrom collections import deque\n\nclass SensorMonitor:\n    def __init__(self, sensor_id, window_size=20):\n        self.id = sensor_id\n        self.window = deque(maxlen=window_size)\n        self.anomaly_streak = 0\n\n    def add(self, value):\n        if len(self.window) < 5:\n            self.window.append(value)\n            return "수집중"\n        mu = mean(self.window)\n        sd = stdev(self.window) or 1\n        z = abs(value - mu) / sd\n        if z > 2.5:\n            self.anomaly_streak += 1\n            status = f"! 이상치 (Z={z:.2f}, 연속 {self.anomaly_streak}회)"\n            if self.anomaly_streak >= 3:\n                status += "  → 예측 정비 필요!"\n        else:\n            self.anomaly_streak = 0\n            self.window.append(value)\n            status = f"o 정상 (Z={z:.2f})"\n        return status\n\nmotor = SensorMonitor("MOTOR-01")\nreadings = [72, 71, 73, 70, 72, 71, 74, 73, 72, 90, 92, 95, 71, 72]\nfor v in readings:\n    print(f"[MOTOR-01] {v}\\u00b0C → {motor.add(v)}")\n```' },
    },
  },
];
