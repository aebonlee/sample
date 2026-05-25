function parseStudents(text) {
  return text.trim().split("\n").map(line => {
    const [id, major, skillsStr, gpa] = line.split(",");
    return { id, major, skills: new Set(skillsStr.split("|")), gpa: parseFloat(gpa) };
  });
}
function techDiversity(team) {
  const all = new Set();
  team.forEach(s => s.skills.forEach(sk => all.add(sk)));
  return all.size;
}
function matchTeams(students, size) {
  const sorted = [...students].sort((a, b) => b.gpa - a.gpa);
  const n = Math.floor(students.length / size);
  const teams = Array.from({ length: n }, () => []);
  sorted.forEach((s, i) => teams[i % n].push(s));
  return teams;
}
function runMatch() {
  const text = document.getElementById("studentsInput").value;
  const size = parseInt(document.getElementById("teamSize").value, 10);
  const log = [];
  try {
    const students = parseStudents(text);
    log.push(`[입력] 학생 ${students.length}명, 팀 크기 ${size}`);
    const teams = matchTeams(students, size);
    log.push(`[매칭] ${teams.length}개 팀 생성 완료`);

    const out = document.getElementById("teams");
    out.innerHTML = "";
    teams.forEach((team, i) => {
      const avgGpa = (team.reduce((s, x) => s + x.gpa, 0) / team.length).toFixed(2);
      const div = techDiversity(team);
      log.push(`  Team ${i + 1}: 평균 GPA ${avgGpa} | 기술수 ${div} | ${team.map(s => s.id).join(", ")}`);

      const card = document.createElement("div");
      card.className = "panel";
      card.style.marginBottom = "10px";
      card.style.padding = "14px 16px";
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <b>Team ${i + 1}</b>
          <span>
            <span class="badge badge--info">평균 GPA ${avgGpa}</span>
            <span class="badge badge--ok" style="margin-left:6px;">기술 ${div}종</span>
          </span>
        </div>
        <table class="t"><thead><tr><th>학생</th><th>전공</th><th>기술 스택</th><th>GPA</th></tr></thead>
        <tbody>${team.map(s => `
          <tr><td><b>${s.id}</b></td><td>${s.major}</td><td>${[...s.skills].join(", ")}</td><td>${s.gpa.toFixed(2)}</td></tr>
        `).join("")}</tbody></table>`;
      out.appendChild(card);
    });

    document.getElementById("log").textContent = log.join("\n");
  } catch (e) {
    document.getElementById("log").textContent = "[오류] " + e.message;
  }
}
runMatch();
