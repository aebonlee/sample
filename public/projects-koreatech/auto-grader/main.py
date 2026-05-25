# 코딩 과제 자동 채점
def grade(student_func, test_cases):
    total = 0
    max_total = sum(tc["pts"] for tc in test_cases)
    feedback = []
    for i, tc in enumerate(test_cases, 1):
        try:
            result = student_func(*tc["input"])
            if result == tc["expected"]:
                total += tc["pts"]
                feedback.append(f"  o Case {i}: {tc['pts']}점")
            else:
                feedback.append(f"  x Case {i}: 입력={tc['input']} → 기대={tc['expected']}, 실제={result}")
        except Exception as e:
            feedback.append(f"  x Case {i}: 예외 발생 - {type(e).__name__}")
    return total, max_total, feedback

# 문제: 두 수의 합
def student_sum(a, b):
    return a + b

cases = [
    {"input": (1, 2),     "expected": 3,   "pts": 30},
    {"input": (0, 0),     "expected": 0,   "pts": 20},
    {"input": (-5, 5),    "expected": 0,   "pts": 20},
    {"input": (100, 200), "expected": 300, "pts": 30},
]
score, max_s, fb = grade(student_sum, cases)
print(f"[학생 채점] {score}/{max_s}점")
for line in fb: print(line)
