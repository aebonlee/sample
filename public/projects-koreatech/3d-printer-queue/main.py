# 3D 프린터 출력 큐 관리
import heapq

printers = [
    {"id": "P1", "material": "PLA", "busy": False},
    {"id": "P2", "material": "ABS", "busy": False},
    {"id": "P3", "material": "PLA", "busy": False},
]
queue = []  # (우선순위, job)

def submit_job(student, est_min, deadline_h, material, file):
    priority = -(10000 / max(deadline_h, 1) - est_min / 60)  # 음수=높은 우선순위
    job = {"student": student, "est": est_min, "mat": material, "file": file}
    heapq.heappush(queue, (priority, file, job))
    print(f"[접수] {student} | {file} | {material} | 예상 {est_min}분")

def dispatch():
    while queue:
        _, _, job = heapq.heappop(queue)
        for p in printers:
            if not p["busy"] and p["material"] == job["mat"]:
                p["busy"] = True
                print(f"[배정] {job['file']} → 프린터 {p['id']} ({job['est']}분)")
                break
        else:
            print(f"[대기] {job['file']}: 호환 프린터 부재")

submit_job("학생A", 120, 6,  "PLA", "drone_arm.stl")
submit_job("학생B", 30,  2,  "PLA", "bracket.stl")
submit_job("학생C", 180, 24, "ABS", "housing.stl")
dispatch()
