const companies = [
  { id: "CoA", job: "AI 엔지니어",      need: ["Python","ML","PyTorch","NumPy"], major: "CSE", industry: "AI" },
  { id: "CoB", job: "임베디드 엔지니어", need: ["C","RTOS","PCB"],                  major: "EE",  industry: "Embedded" },
  { id: "CoC", job: "백엔드 개발자",     need: ["Java","Spring","DB","Docker"],    major: "CSE", industry: "Web" },
  { id: "CoD", job: "프론트엔드 개발자", need: ["React","TypeScript","CSS"],       major: "CSE", industry: "Web" },
  { id: "CoE", job: "로봇 엔지니어",     need: ["C++","ROS","Robotics"],          major: "ME",  industry: "Robotics" },
  { id: "CoF", job: "MLOps 엔지니어",   need: ["Python","Docker","Kubernetes","ML"], major: "CSE", industry: "AI" },
];

function match() {
  const major = document.getElementById("sMajor").value;
  const interest = document.getElementById("sInt").value;
  const skills = new Set(document.getElementById("sSkills").value.split(",").map(s => s.trim()).filter(Boolean));
  const log = [`[입력] 전공 ${major} · 관심 ${interest} · 기술 ${[...skills].join(", ")}`];

  const scored = companies.map(c => {
    const overlap = c.need.filter(s => skills.has(s)).length / Math.max(c.need.length, 1);
    const majorM = c.major === major ? 1 : 0;
    const intM = c.industry === interest ? 1 : 0;
    const score = 0.6 * overlap + 0.25 * majorM + 0.15 * intM;
    return { ...c, overlap, majorM, intM, score };
  }).sort((a, b) => b.score - a.score);

  const colors = ["#22d3ee", "#a78bfa", "#fb7185"];
  document.getElementById("top3").innerHTML = scored.slice(0, 3).map((c, i) => `
    <div class="panel" style="margin-bottom:10px; padding:16px 20px; border-left:4px solid ${colors[i]};">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div>
          <span style="font-size:.78rem; color:var(--text-mute);">#${i + 1}</span>
          <b style="font-size:1.05rem; margin-left:6px;">${c.id} · ${c.job}</b>
        </div>
        <span class="badge badge--info" style="font-size:.9rem; padding:6px 12px;">${(c.score * 100).toFixed(0)}점</span>
      </div>
      <div style="font-size:.85rem; color:var(--text-dim); margin-bottom:6px;">
        요구: ${c.need.map(n => skills.has(n) ? `<b style="color:#10b981">${n}</b>` : n).join(", ")}
      </div>
      <div class="meter"><span style="width:${c.score * 100}%; background:${colors[i]};"></span></div>
    </div>
  `).join("");

  document.getElementById("full").innerHTML = scored.map(c => `
    <tr>
      <td><b>${c.id}</b></td>
      <td>${c.job}</td>
      <td>${(c.overlap * 100).toFixed(0)}%</td>
      <td>${c.majorM ? "✓" : "—"}</td>
      <td>${c.intM ? "✓" : "—"}</td>
      <td><b>${(c.score * 100).toFixed(0)}</b></td>
    </tr>`).join("");

  scored.slice(0, 3).forEach((c, i) => log.push(`  #${i+1} ${c.id} ${c.job}: 적합도 ${(c.score*100).toFixed(0)}점 (스킬 ${(c.overlap*100).toFixed(0)}%)`));
  document.getElementById("log").textContent = log.join("\n");
}
match();
