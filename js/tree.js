/* tree.js — canvas renderer for the official GGG PoE2 tree export (slimmed).
   Features: pan/zoom, hover tooltips, click = allocate shortest path from your
   current selection, right-click = unallocate, search highlighting. */
(function () {
  "use strict";
  const App = window.App;

  const canvas = document.getElementById("tree-canvas");
  const ctx = canvas.getContext("2d");
  const tooltip = document.getElementById("tree-tooltip");
  const wrap = canvas.parentElement;

  const COLORS = {
    edge: "rgba(122, 85, 168, 0.18)",
    edgeAlloc: "#a01e26",
    small: "#4a3f52",
    smallAlloc: "#d4353f",
    notable: "#c2a15e",
    notableRing: "#6b5836",
    keystone: "#d4353f",
    jewel: "#7f9fd0",
    asc: "#a07fd0",
    search: "#e9dfd1",
  };
  const R = { small: 22, notable: 42, keystone: 58, jewel: 40 };

  const view = { x: 0, y: 0, scale: 0.045 }; // world -> screen: (wx-view.x)*scale + w/2
  let nodes = {}, ids = [], searchHits = new Set(), hoverId = null;
  let ascCentroid = { x: 0, y: 0 };

  // ---------- data ----------
  fetch("data/tree.min.json")
    .then((r) => r.json())
    .then((data) => {
      nodes = data.nodes;
      ids = Object.keys(nodes);
      // undirected neighbor map for pathing
      ids.forEach((id) => (nodes[id].nb = new Set(nodes[id].o)));
      ids.forEach((id) => nodes[id].o.forEach((t) => nodes[t] && nodes[t].nb.add(id)));
      // Blood Mage centroid for the focus button
      let ax = 0, ay = 0, ac = 0;
      ids.forEach((id) => { const n = nodes[id]; if (n.a) { ax += n.x; ay += n.y; ac++; } });
      if (ac) ascCentroid = { x: ax / ac, y: ay / ac };
      App.tree = { nodes, resize };
      resize();
      draw();
      App.renderBuildSummary();
    })
    .catch(() => {
      const hint = document.querySelector(".tree-hint");
      if (hint) hint.textContent = "Could not load data/tree.min.json — run scripts/build-tree-data.py (see README) and redeploy.";
    });

  // ---------- transforms ----------
  function toScreen(wx, wy) {
    return [(wx - view.x) * view.scale + canvas.width / 2, (wy - view.y) * view.scale + canvas.height / 2];
  }
  function toWorld(sx, sy) {
    return [(sx - canvas.width / 2) / view.scale + view.x, (sy - canvas.height / 2) / view.scale + view.y];
  }

  function resize() {
    const rect = wrap.getBoundingClientRect();
    canvas.width = Math.max(300, rect.width);
    canvas.height = Math.max(300, rect.height);
    draw();
  }
  window.addEventListener("resize", resize);

  // ---------- drawing ----------
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!ids.length) return;
    const alloc = allocSet();

    // edges
    ctx.lineWidth = Math.max(1, 60 * view.scale);
    ids.forEach((id) => {
      const n = nodes[id];
      const [x1, y1] = toScreen(n.x, n.y);
      if (offscreen(x1, y1, 400)) return;
      n.o.forEach((t) => {
        const m = nodes[t];
        if (!m) return;
        const [x2, y2] = toScreen(m.x, m.y);
        ctx.strokeStyle = alloc.has(id) && alloc.has(t) ? COLORS.edgeAlloc : COLORS.edge;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      });
    });

    // nodes
    ids.forEach((id) => {
      const n = nodes[id];
      const [x, y] = toScreen(n.x, n.y);
      if (offscreen(x, y, 80)) return;
      const r = R[n.k] * view.scale * 10;
      const isAlloc = alloc.has(id);

      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.5, r), 0, Math.PI * 2);
      ctx.fillStyle = isAlloc
        ? (n.k === "small" ? COLORS.smallAlloc : COLORS.keystone)
        : n.a ? COLORS.asc
        : n.k === "notable" ? COLORS.notable
        : n.k === "keystone" ? COLORS.keystone
        : n.k === "jewel" ? COLORS.jewel
        : COLORS.small;
      ctx.fill();

      if (isAlloc || id === hoverId || searchHits.has(id)) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = searchHits.has(id) ? COLORS.search : isAlloc ? COLORS.notable : COLORS.search;
        ctx.stroke();
      }

      // labels for big nodes when zoomed in
      if (view.scale > 0.09 && (n.k === "notable" || n.k === "keystone") && n.n) {
        ctx.fillStyle = "rgba(233,223,209,.85)";
        ctx.font = Math.round(120 * view.scale) + "px 'IBM Plex Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(n.n, x, y - r - 6);
      }
    });
    updateCounters();
  }
  function offscreen(x, y, pad) {
    return x < -pad || y < -pad || x > canvas.width + pad || y > canvas.height + pad;
  }
  function allocSet() {
    const s = new Set(App.state.allocated);
    App.state.ascAllocated.forEach((id) => s.add(id));
    return s;
  }

  // ---------- hit testing ----------
  function nodeAt(sx, sy) {
    const [wx, wy] = toWorld(sx, sy);
    let best = null, bestD = Infinity;
    ids.forEach((id) => {
      const n = nodes[id];
      const dx = n.x - wx, dy = n.y - wy;
      const d = dx * dx + dy * dy;
      const hitR = R[n.k] * 12;
      if (d < hitR * hitR && d < bestD) { best = id; bestD = d; }
    });
    return best;
  }

  // ---------- allocation with shortest-path (BFS) ----------
  function allocate(id) {
    const n = nodes[id];
    const set = n.a ? App.state.ascAllocated : App.state.allocated;
    const domain = (x) => !!nodes[x] && !!nodes[x].a === !!n.a;
    if (set.has(id)) return;
    if (set.size === 0) { set.add(id); App.changed(); draw(); return; }
    // BFS from any allocated node in the same domain to the target
    const prev = {}; const q = [...set]; const seen = new Set(q);
    let found = null;
    while (q.length) {
      const cur = q.shift();
      if (cur === id) { found = cur; break; }
      for (const nb of nodes[cur].nb) {
        if (!domain(nb) || seen.has(nb)) continue;
        seen.add(nb); prev[nb] = cur; q.push(nb);
      }
    }
    if (found === null) { set.add(id); } // disconnected pocket — allow, user is planning
    else {
      let cur = id;
      while (cur !== undefined && !set.has(cur)) { set.add(cur); cur = prev[cur]; }
    }
    App.changed(); draw();
  }
  function unallocate(id) {
    const n = nodes[id];
    const set = n.a ? App.state.ascAllocated : App.state.allocated;
    if (set.delete(id)) { App.changed(); draw(); }
  }

  function updateCounters() {
    const pt = document.getElementById("pt-count");
    const ac = document.getElementById("asc-count");
    if (pt) pt.textContent = App.state.allocated.size;
    if (ac) ac.textContent = App.state.ascAllocated.size;
  }

  // ---------- interaction ----------
  let dragging = false, moved = false, last = null;

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true; moved = false; last = [e.clientX, e.clientY];
    canvas.classList.add("dragging");
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    if (dragging && last) {
      const dx = e.clientX - last[0], dy = e.clientY - last[1];
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      view.x -= dx / view.scale; view.y -= dy / view.scale;
      last = [e.clientX, e.clientY];
      draw(); hideTip();
      return;
    }
    const id = nodeAt(sx, sy);
    if (id !== hoverId) { hoverId = id; draw(); }
    if (id) showTip(id, sx, sy); else hideTip();
  });
  canvas.addEventListener("pointerup", (e) => {
    canvas.classList.remove("dragging");
    dragging = false;
    if (moved) return;
    const rect = canvas.getBoundingClientRect();
    const id = nodeAt(e.clientX - rect.left, e.clientY - rect.top);
    if (!id) return;
    if (e.button === 2) unallocate(id);
    else if (allocSet().has(id)) unallocate(id);
    else allocate(id);
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.addEventListener("pointerleave", () => { hoverId = null; hideTip(); draw(); });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const [wx, wy] = toWorld(sx, sy);
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    view.scale = Math.min(0.6, Math.max(0.012, view.scale * factor));
    // keep the point under the cursor fixed
    view.x = wx - (sx - canvas.width / 2) / view.scale;
    view.y = wy - (sy - canvas.height / 2) / view.scale;
    draw(); hideTip();
  }, { passive: false });

  // ---------- tooltip ----------
  function showTip(id, sx, sy) {
    const n = nodes[id];
    if (!n.n && !n.s.length) { hideTip(); return; }
    tooltip.innerHTML =
      '<div class="tt-name ' + (n.k === "keystone" ? "keystone" : n.a ? "asc" : "") + '">' + App.esc(n.n || "(unnamed)") + "</div>" +
      n.s.map((s) => '<div class="tt-stat">' + App.esc(s) + "</div>").join("") +
      '<div class="tt-kind">' + (n.a ? "blood mage · " : "") + n.k + "</div>";
    tooltip.hidden = false;
    const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
    let tx = sx + 18, ty = sy + 18;
    if (tx + tw > canvas.width - 8) tx = sx - tw - 18;
    if (ty + th > canvas.height - 8) ty = sy - th - 18;
    tooltip.style.left = Math.max(4, tx) + "px";
    tooltip.style.top = Math.max(4, ty) + "px";
  }
  function hideTip() { tooltip.hidden = true; }

  // ---------- toolbar ----------
  document.getElementById("btn-focus-asc").addEventListener("click", () => {
    view.x = ascCentroid.x; view.y = ascCentroid.y; view.scale = 0.22; draw();
  });
  document.getElementById("btn-focus-center").addEventListener("click", () => {
    view.x = 0; view.y = 0; view.scale = 0.045; draw();
  });
  document.getElementById("btn-reset-tree").addEventListener("click", () => {
    App.state.allocated.clear(); App.state.ascAllocated.clear();
    App.changed(); draw();
  });
  document.getElementById("tree-search").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    searchHits.clear();
    if (q.length >= 3) {
      ids.forEach((id) => {
        const n = nodes[id];
        if ((n.n && n.n.toLowerCase().includes(q)) || n.s.some((s) => s.toLowerCase().includes(q))) {
          searchHits.add(id);
        }
      });
    }
    draw();
  });
})();
