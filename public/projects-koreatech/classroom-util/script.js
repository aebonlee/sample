const DAYS = ["월","화","수","목","금"];

function analyze() {
  const lines = document.getElementById("schedule").value.trim().split("\n");
  const rooms = {};
  lines.forEach(line => {
    const [room, day, period] = line.split(",");
    if (!rooms[room]) rooms[room] = Array.from({length:5}, () => Array(10).fill(false));
    rooms[room][parseInt(day)][parseInt(period)] = true;
  });

  const log = [`[입력] 시간표 ${lines.length}건, 강의실 ${Object.keys(rooms).length}개`];

  // 활용률 테이블
  const tbody = document.getElementById("usageTable");
  tbody.innerHTML = "";
  Object.entries(rooms).forEach(([room, matrix]) => {
    const used = matrix.flat().filter(x => x).length;
    const rate = (used / 50 * 100);
    let badge = "badge--ok", status = "보통";
    if (rate < 30) { badge = "badge--warn"; status = "저활용"; }
    else if (rate >= 70) { badge = "badge--danger"; status = "포화"; }
    tbody.innerHTML += `<tr>
      <td><b>${room}</b></td>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="meter" style="flex:1;"><span style="width:${rate}%"></span></div>
          <span style="min-width:50px;text-align:right;">${rate.toFixed(1)}%</span>
        </div>
      </td>
      <td>${used} / 50</td>
      <td><span class="badge ${badge}">${status}</span></td>
    </tr>`;
    log.push(`  ${room.padEnd(14)} ${rate.toFixed(1)}% (${used}/50) → ${status}`);
  });

  // 히트맵 (각 강의실)
  const heat = document.getElementById("heatmap");
  heat.innerHTML = "";
  Object.entries(rooms).forEach(([room, matrix]) => {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "16px";
    wrap.innerHTML = `<div style="font-weight:700;margin-bottom:6px;">${room}</div>`;
    const grid = document.createElement("div");
    grid.className = "heatmap";
    grid.innerHTML = `<div class="cell hd"></div>` + Array.from({length:10}, (_, i) => `<div class="cell hd">${i+1}교시</div>`).join("");
    matrix.forEach((row, di) => {
      grid.innerHTML += `<div class="cell hd">${DAYS[di]}</div>` + row.map(cell =>
        cell
          ? `<div class="cell" style="background:#0046C8;">●</div>`
          : `<div class="cell" style="background:#1e293b;"></div>`
      ).join("");
    });
    wrap.appendChild(grid);
    heat.appendChild(wrap);
  });

  document.getElementById("log").textContent = log.join("\n");
}
analyze();
