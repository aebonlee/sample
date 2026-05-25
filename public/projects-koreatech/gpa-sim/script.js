const GRADE = { "A+":4.5, "A":4.0, "B+":3.5, "B":3.0, "C+":2.5, "C":2.0, "D":1.0, "F":0.0 };
function parseLines(text) {
  return text.trim().split("\n").map(l => {
    const [course, cr, gr] = l.split(",");
    return { course, credit: parseInt(cr, 10), grade: gr.trim() };
  });
}
function calcGPA(courses) {
  const totalCredit = courses.reduce((s, c) => s + c.credit, 0);
  const totalPoint = courses.reduce((s, c) => s + c.credit * (GRADE[c.grade] ?? 0), 0);
  return { gpa: totalPoint / totalCredit, totalCredit, totalPoint };
}
function simulate() {
  const log = [];
  try {
    const completed = parseLines(document.getElementById("completed").value);
    const future = parseLines(document.getElementById("future").value);
    const cur = calcGPA(completed);
    const all = calcGPA([...completed, ...future]);
    const target = parseFloat(document.getElementById("target").value);
    const remain = parseInt(document.getElementById("remain").value, 10);
    const required = ((target * (cur.totalCredit + remain) - cur.totalPoint) / remain).toFixed(2);
    const feasible = required <= 4.5;

    log.push(`[현재] ${cur.totalCredit}학점, GPA ${cur.gpa.toFixed(2)}`);
    log.push(`[예상] 다음 학기 후 GPA ${all.gpa.toFixed(2)} (${all.totalCredit}학점)`);
    log.push(`[목표 ${target}] 남은 ${remain}학점 평균 ${required}/4.5 필요 → ${feasible ? "달성 가능" : "달성 어려움"}`);

    document.getElementById("result").innerHTML = `
      <div class="panel" style="margin:0; padding:18px;">
        <div style="font-size:.78rem; color:var(--text-mute); font-weight:700;">현재 GPA</div>
        <div style="font-size:2rem; font-weight:800; color:#22d3ee;">${cur.gpa.toFixed(2)}</div>
        <div style="font-size:.78rem; color:var(--text-dim);">${cur.totalCredit}학점 이수</div>
      </div>
      <div class="panel" style="margin:0; padding:18px;">
        <div style="font-size:.78rem; color:var(--text-mute); font-weight:700;">다음 학기 후 예상</div>
        <div style="font-size:2rem; font-weight:800; color:#a78bfa;">${all.gpa.toFixed(2)}</div>
        <div style="font-size:.78rem; color:var(--text-dim);">+${future.length}과목 추가</div>
      </div>
      <div class="panel" style="margin:0; padding:18px;">
        <div style="font-size:.78rem; color:var(--text-mute); font-weight:700;">목표 ${target} 달성</div>
        <div style="font-size:2rem; font-weight:800; color:${feasible ? "#10b981" : "#ef4444"};">${required}</div>
        <div style="font-size:.78rem; color:var(--text-dim);">
          남은 ${remain}학점 평균 필요
          <span class="badge ${feasible ? "badge--ok" : "badge--danger"}" style="margin-left:6px;">
            ${feasible ? "가능" : "어려움"}
          </span>
        </div>
      </div>
    `;
    document.getElementById("log").textContent = log.join("\n");
  } catch (e) {
    document.getElementById("log").textContent = "[오류] " + e.message;
  }
}
simulate();
