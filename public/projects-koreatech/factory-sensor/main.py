# 스마트팩토리 센서 데이터 분석
from statistics import mean, stdev
from collections import deque

class SensorMonitor:
    def __init__(self, sensor_id, window_size=20):
        self.id = sensor_id
        self.window = deque(maxlen=window_size)
        self.anomaly_streak = 0

    def add(self, value):
        if len(self.window) < 5:
            self.window.append(value)
            return "수집중"
        mu = mean(self.window)
        sd = stdev(self.window) or 1
        z = abs(value - mu) / sd
        if z > 2.5:
            self.anomaly_streak += 1
            status = f"! 이상치 (Z={z:.2f}, 연속 {self.anomaly_streak}회)"
            if self.anomaly_streak >= 3:
                status += "  → 예측 정비 필요!"
        else:
            self.anomaly_streak = 0
            self.window.append(value)
            status = f"o 정상 (Z={z:.2f})"
        return status

motor = SensorMonitor("MOTOR-01")
readings = [72, 71, 73, 70, 72, 71, 74, 73, 72, 90, 92, 95, 71, 72]
for v in readings:
    print(f"[MOTOR-01] {v}\u00b0C → {motor.add(v)}")
