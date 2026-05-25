# 학점/GPA 시뮬레이션
GRADE = {"A+": 4.5, "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D": 1.0, "F": 0.0}

completed = [
    {"course": "프로그래밍기초", "credit": 3, "grade": "A"},
    {"course": "선형대수",       "credit": 3, "grade": "B+"},
    {"course": "컴퓨팅사고",     "credit": 2, "grade": "A+"},
    {"course": "전공기초실험",   "credit": 1, "grade": "A"},
]

def calc_gpa(courses):
    total_credit = sum(c["credit"] for c in courses)
    total_point  = sum(c["credit"] * GRADE[c["grade"]] for c in courses)
    return total_point / total_credit, total_credit, total_point

def need_for_target(curr_credit, curr_point, future_credit, target):
    required = (target * (curr_credit + future_credit) - curr_point) / future_credit
    return round(required, 2)

gpa, tc, tp = calc_gpa(completed)
print(f"[현재] GPA: {gpa:.2f} ({tc}학점)")

future = [{"credit": 3, "grade": "A"}, {"credit": 3, "grade": "B+"}]
new_gpa, _, _ = calc_gpa(completed + future)
print(f"[예상] 다음 학기 후 GPA: {new_gpa:.2f}")

needed = need_for_target(tc, tp, 9, 4.0)
print(f"[목표 4.0] 남은 9학점 평균 {needed}/4.5 필요")
