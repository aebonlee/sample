# 스마트 캠퍼스 IoT 에너지 모니터링
baselines = {
    "공학관": {9: 320, 12: 280, 15: 340, 18: 200, 22: 90},
    "기숙사": {9: 80,  12: 110, 15: 100, 18: 220, 22: 280},
    "정보관": {9: 410, 12: 360, 15: 420, 18: 240, 22: 80},
}
readings = [
    ("공학관", 22, 180),  # 야간 이상치
    ("기숙사", 22, 290),
    ("정보관", 22, 75),
    ("공학관", 9, 410),   # 주간 이상치
    ("기숙사", 9, 85),
]

THRESHOLD = 0.30

def check(building, hour, current):
    base = baselines[building].get(hour)
    if not base: return
    diff = (current - base) / base
    if diff > THRESHOLD:
        print(f"! [{building}] {hour}시: {current}kW (베이스 {base}kW, +{diff*100:.0f}%) 이상치")
    elif diff < -THRESHOLD:
        print(f"+ [{building}] {hour}시: {current}kW (절감 {-diff*100:.0f}%)")
    else:
        print(f"o [{building}] {hour}시: {current}kW 정상")

for b, h, c in readings: check(b, h, c)
