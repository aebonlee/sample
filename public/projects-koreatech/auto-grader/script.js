const cases = [
  { input: [1, 2], expected: 3, pts: 30 },
  { input: [0, 0], expected: 0, pts: 20 },
  { input: [-5, 5], expected: 0, pts: 20 },
  { input: [100, 200], expected: 300, pts: 30 },
];
function loadBuggy() {
  document.getElementById("code").value = `function sum(a, b) {\n  return a - b;  // 버그: 빼기로 잘못 구현\n}`;
  grade();
}
function grade() {
  const code = document.getElementById("code").value;
  let fn;
  const log = [];
  try {
    fn = new Function(code + "\nreturn sum;")();
  } catch (e) {
    log.push(`[컴파일 오류] ${e.message}`);
    document.getElementById("score").innerHTML = `<span class="badge badge--danger">컴파일 실패 → 0점</span>`;
    document.getElementById("cases").innerHTML = "";
    document.getElementById("log").textContent = log.join("\n");
    return;
  }
  let total = 0;
  const maxTotal = cases.reduce((s, c) => s + c.pts, 0);
  const rows = cases.map((c, i) => {
    let actual, pass = false, err = null;
    try { actual = fn(...c.input); pass = actual === c.expected; }
    catch (e) { err = e.message; }
    if (pass) total += c.pts;
    if (pass) log.push(`  ✓ Case ${i + 1}: ${c.pts}점`);
    else log.push(`  ✗ Case ${i + 1}: 입력=${JSON.stringify(c.input)} → 기대=${c.expected}, 실제=${err ? "[예외] "+err : actual}`);
    return `<tr>
      <td>${i + 1}</td>
      <td><code>(${c.input.join(", ")})</code></td>
      <td>${c.expected}</td>
      <td>${err ? `<span class="badge badge--danger">예외</span>` : actual}</td>
      <td>${pass ? c.pts : 0} / ${c.pts}</td>
      <td>${pass ? `<span class="badge badge--ok">통과</span>` : `<span class="badge badge--danger">실패</span>`}</td>
    </tr>`;
  });
  document.getElementById("cases").innerHTML = rows.join("");
  const rate = total / maxTotal;
  const badge = rate >= 0.8 ? "badge--ok" : rate >= 0.4 ? "badge--warn" : "badge--danger";
  document.getElementById("score").innerHTML = `
    <span class="badge ${badge}" style="font-size:1rem; padding:8px 16px;">총점 ${total} / ${maxTotal}</span>`;
  document.getElementById("log").textContent = log.join("\n");
}
grade();
