# 실험실 안전 점검 자동화
from datetime import datetime, timedelta

labs = {
    "기계실습실": [
        {"item": "환기 시스템",   "last": datetime.now() - timedelta(hours=2),  "status": "OK",   "freq": 8},
        {"item": "비상정지 버튼", "last": datetime.now() - timedelta(hours=10), "status": "OK",   "freq": 8},
        {"item": "절단기 칼날",   "last": datetime.now() - timedelta(hours=1),  "status": "WARN", "freq": 24},
    ],
    "전기실습실": [
        {"item": "누전 차단기", "last": datetime.now() - timedelta(hours=3),  "status": "OK",   "freq": 12},
        {"item": "절연 장갑",   "last": datetime.now() - timedelta(hours=20), "status": "FAIL", "freq": 24},
    ],
}

def inspect(lab_name):
    now = datetime.now()
    print(f"\
[{lab_name}] 점검 결과")
    fail_count = warn_count = miss_count = 0
    for chk in labs[lab_name]:
        hours_passed = (now - chk["last"]).total_seconds() / 3600
        if hours_passed > chk["freq"]:
            miss_count += 1
            print(f"  ! {chk['item']}: 미점검 ({hours_passed:.1f}h 경과)")
        elif chk["status"] == "FAIL":
            fail_count += 1
            print(f"  x {chk['item']}: 불량")
        elif chk["status"] == "WARN":
            warn_count += 1
            print(f"  ~ {chk['item']}: 주의")
        else:
            print(f"  o {chk['item']}: 정상")
    level = "위험" if fail_count or miss_count else "주의" if warn_count >= 2 else "정상"
    print(f"→ 위험도: [{level}]")

for lab in labs: inspect(lab)
