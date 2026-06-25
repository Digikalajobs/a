function drawSimpleQR(canvas, text) {
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const cells = 29;
  const cell = Math.floor(size / cells);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rand(seed) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }

  function finder(x, y) {
    ctx.fillStyle = "#111827";
    ctx.fillRect(x * cell, y * cell, 7 * cell, 7 * cell);
    ctx.fillStyle = "#fff";
    ctx.fillRect((x + 1) * cell, (y + 1) * cell, 5 * cell, 5 * cell);
    ctx.fillStyle = "#111827";
    ctx.fillRect((x + 2) * cell, (y + 2) * cell, 3 * cell, 3 * cell);
  }

  finder(1,1);
  finder(cells-8,1);
  finder(1,cells-8);

  let seed = hash(text || "DG");
  ctx.fillStyle = "#111827";
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const inFinder =
        (x >= 1 && x <= 7 && y >= 1 && y <= 7) ||
        (x >= cells-8 && x <= cells-2 && y >= 1 && y <= 7) ||
        (x >= 1 && x <= 7 && y >= cells-8 && y <= cells-2);
      if (inFinder) continue;
      seed = rand(seed + x * 31 + y * 97);
      if (seed % 3 === 0) ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, size - 6, size - 6);
}
