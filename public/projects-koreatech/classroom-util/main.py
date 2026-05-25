# 강의실 활용도 분석
classrooms = {
    "공학관-101": [[False]*10 for _ in range(5)],
    "공학관-202": [[False]*10 for _ in range(5)],
    "정보관-305": [[False]*10 for _ in range(5)],
}

schedules = [
    ("공학관-101", 0, 1), ("공학관-101", 0, 2), ("공학관-101", 1, 3),
    ("공학관-101", 2, 1), ("공학관-101", 2, 2), ("공학관-101", 3, 4),
    ("공학관-202", 0, 1),
    ("정보관-305", 1, 5), ("정보관-305", 2, 5), ("정보관-305", 3, 6), ("정보관-305", 4, 6),
]

for room, day, period in schedules:
    classrooms[room][day][period] = True

def analyze():
    print(f"{'강의실':<12} {'활용률':>6} {'상태':>8}")
    for room, matrix in classrooms.items():
        used = sum(sum(row) for row in matrix)
        rate = used / 50 * 100
        status = "저활용" if rate < 30 else "보통" if rate < 70 else "포화"
        print(f"{room:<12} {rate:>5.1f}% {status:>8}")

analyze()
