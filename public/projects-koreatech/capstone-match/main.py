# 캡스톤 디자인 팀 매칭
students = [
    {"id": "S01", "major": "CSE", "skills": {"Python", "AI"}, "gpa": 4.2},
    {"id": "S02", "major": "EE",  "skills": {"PCB", "C"},      "gpa": 3.8},
    {"id": "S03", "major": "ME",  "skills": {"CAD", "3D"},     "gpa": 4.0},
    {"id": "S04", "major": "CSE", "skills": {"Web", "DB"},     "gpa": 3.5},
    {"id": "S05", "major": "ID",  "skills": {"UX", "Figma"},   "gpa": 4.1},
    {"id": "S06", "major": "EE",  "skills": {"IoT", "Python"}, "gpa": 3.9},
]
TEAM_SIZE = 3

def tech_diversity(team):
    all_skills = set()
    for s in team: all_skills |= s["skills"]
    return len(all_skills)

def match_teams(students, team_size):
    sorted_s = sorted(students, key=lambda x: -x["gpa"])
    n_teams = len(students) // team_size
    teams = [[] for _ in range(n_teams)]
    for i, s in enumerate(sorted_s):
        teams[i % n_teams].append(s)
    return teams

teams = match_teams(students, TEAM_SIZE)
for i, t in enumerate(teams, 1):
    avg_gpa = sum(s["gpa"] for s in t) / len(t)
    print(f"Team {i}: GPA평균 {avg_gpa:.2f} | 기술수 {tech_diversity(t)}")
    for s in t: print(f"  - {s['id']} ({s['major']})")
