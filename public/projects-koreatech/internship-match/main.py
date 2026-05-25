# 산학협력 인턴십 매칭
students = [
    {"id": "ST1", "major": "CSE", "skills": {"Python", "ML", "TensorFlow"}, "interest": "AI"},
    {"id": "ST2", "major": "EE",  "skills": {"PCB", "C", "RTOS"},           "interest": "Embedded"},
    {"id": "ST3", "major": "CSE", "skills": {"Java", "Spring", "DB"},       "interest": "Web"},
]
companies = [
    {"id": "CoA", "job": "AI 엔지니어",       "need": {"Python", "ML", "PyTorch"}, "major": "CSE", "industry": "AI"},
    {"id": "CoB", "job": "임베디드 엔지니어", "need": {"C", "RTOS", "PCB"},         "major": "EE",  "industry": "Embedded"},
    {"id": "CoC", "job": "백엔드 개발자",     "need": {"Java", "Spring", "DB"},     "major": "CSE", "industry": "Web"},
]

def score(s, c):
    overlap = len(s["skills"] & c["need"]) / max(len(c["need"]), 1)
    major_m = 1 if s["major"] == c["major"] else 0
    int_m   = 1 if s["interest"] == c["industry"] else 0
    return 0.6 * overlap + 0.25 * major_m + 0.15 * int_m

for s in students:
    ranked = sorted(companies, key=lambda c: -score(s, c))
    print(f"\
[{s['id']} ({s['major']})]")
    for c in ranked[:3]:
        print(f"  → {c['id']} {c['job']}: 적합도 {score(s, c):.2f}")
