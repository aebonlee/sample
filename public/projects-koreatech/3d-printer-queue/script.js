let printers, queue, log;
function reset() {
  printers = [
    { id: "P1", material: "PLA", busy: false, job: null },
    { id: "P2", material: "ABS", busy: false, job: null },
    { id: "P3", material: "PLA", busy: false, job: null },
    { id: "P4", material: "PETG", busy: false, job: null },
  ];
  queue = [];
  log = [];
  seed();
  render();
}
function seed() {
  // 초기 작업 3개
  [
    ["학생A", "drone_arm.stl", 120, 6, "PLA"],
    ["학생B", "bracket.stl", 30, 2, "PLA"],
    ["학생C", "housing.stl", 180, 24, "ABS"],
  ].forEach(([s, f, e, d, m]) => insertJob({ student: s, file: f, est: e, deadline: d, mat: m }));
}
function priority(j) { return 10000 / Math.max(j.deadline, 1) - j.est / 60; }
function insertJob(j) {
  j.priority = priority(j);
  queue.push(j);
  queue.sort((a, b) => b.priority - a.priority);
  log.push(`[접수] ${j.student} | ${j.file} | ${j.mat} | 예상 ${j.est}분 | 마감 ${j.deadline}h | priority=${j.priority.toFixed(1)}`);
}
function addJob() {
  insertJob({
    student: document.getElementById("f-student").value || "익명",
    file: document.getElementById("f-file").value || "model.stl",
    est: parseInt(document.getElementById("f-est").value, 10) || 60,
    deadline: parseInt(document.getElementById("f-deadline").value, 10) || 12,
    mat: document.getElementById("f-mat").value,
  });
  render();
}
function dispatch() {
  let assigned = 0;
  for (let i = queue.length - 1; i >= 0; i--) {
    const j = queue[i];
    const p = printers.find(pr => !pr.busy && pr.material === j.mat);
    if (p) {
      p.busy = true; p.job = j;
      queue.splice(queue.indexOf(j), 1);
      log.push(`[배정] ${j.file} → 프린터 ${p.id} (${j.est}분)`);
      assigned++;
    }
  }
  if (assigned === 0) log.push(`[대기] 가용 호환 프린터 없음 (큐 ${queue.length}건)`);
  render();
}
function render() {
  const pE = document.getElementById("printers");
  pE.innerHTML = printers.map(p => `
    <div class="panel" style="margin:0; padding:14px 16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <b>${p.id}</b>
        <span class="badge ${p.busy ? "badge--warn" : "badge--ok"}">${p.busy ? "BUSY" : "IDLE"}</span>
      </div>
      <div style="margin-top:8px; font-size:.85rem; color:var(--text-dim);">재료: ${p.material}</div>
      ${p.job ? `<div style="margin-top:6px; font-size:.8rem; color:var(--text-mute);">${p.job.student} · ${p.job.file}</div>` : ""}
    </div>
  `).join("");
  document.getElementById("queue").innerHTML = queue.map(j => `
    <tr>
      <td><b>${j.priority.toFixed(1)}</b></td>
      <td>${j.student}</td><td>${j.file}</td>
      <td><span class="badge badge--info">${j.mat}</span></td>
      <td>${j.est}분</td>
      <td>${j.deadline}h</td>
    </tr>`).join("") || `<tr><td colspan="6" style="text-align:center;color:var(--text-mute);">큐가 비어 있습니다</td></tr>`;
  document.getElementById("log").textContent = log.slice(-12).join("\n");
}
reset();
