/* app.js — shell: tabs, shared state, persistence, build codes */
(function () {
  "use strict";

  // ---------- shared state ----------
  const STORE_KEY = "sanguine-detonation-build-v1";

  const App = (window.App = {
    state: {
      allocated: new Set(), // node ids (main tree)
      ascAllocated: new Set(), // node ids (Blood Mage)
      gear: {}, // slotId -> {name, rarity, mods:[...]}
    },
    tree: null, // filled by tree.js after data load
    listeners: [],
    onChange(fn) { this.listeners.push(fn); },
    changed() {
      save();
      this.listeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    },
  });

  // ---------- persistence (guarded: degrades gracefully if unavailable) ----------
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(serialize()));
    } catch (e) { /* private mode etc. — session-only */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) deserialize(JSON.parse(raw));
    } catch (e) { /* ignore */ }
  }
  function serialize() {
    return {
      v: 1,
      t: [...App.state.allocated],
      a: [...App.state.ascAllocated],
      g: App.state.gear,
    };
  }
  function deserialize(obj) {
    if (!obj || obj.v !== 1) return;
    App.state.allocated = new Set(obj.t || []);
    App.state.ascAllocated = new Set(obj.a || []);
    App.state.gear = obj.g || {};
  }
  App.serialize = serialize;
  App.deserialize = (o) => { deserialize(o); App.changed(); };
  load();

  // ---------- tabs ----------
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
      document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
      // canvas needs a resize when its panel becomes visible
      if (btn.dataset.tab === "tree" && App.tree) App.tree.resize();
      if (btn.dataset.tab === "build") renderBuildSummary();
    });
  });

  // ---------- build code (base64url of the serialized state) ----------
  function toCode() {
    const json = JSON.stringify(serialize());
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function fromCode(code) {
    const b64 = code.trim().replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  }

  const shareBox = document.getElementById("share-box");
  document.getElementById("btn-export").addEventListener("click", async () => {
    const code = toCode();
    shareBox.value = code;
    try { await navigator.clipboard.writeText(code); } catch (e) { shareBox.select(); }
  });
  document.getElementById("btn-import").addEventListener("click", () => {
    const code = shareBox.value.trim();
    if (!code) { shareBox.placeholder = "Paste a build code here first, then press Import."; return; }
    try {
      App.deserialize(fromCode(code));
      renderBuildSummary();
    } catch (e) {
      shareBox.value = "";
      shareBox.placeholder = "That code could not be read — check it was copied completely.";
    }
  });

  // ---------- build summary ----------
  function renderBuildSummary() {
    const wrap = document.getElementById("build-notables");
    wrap.innerHTML = "";
    if (!App.tree) { wrap.innerHTML = '<p class="dim">Tree data is still loading…</p>'; return; }
    const nodes = App.tree.nodes;
    const picked = [];
    const collect = (set) => {
      set.forEach((id) => {
        const n = nodes[id];
        if (n && (n.k === "notable" || n.k === "keystone")) picked.push({ id, n });
      });
    };
    collect(App.state.ascAllocated);
    collect(App.state.allocated);
    if (!picked.length) {
      wrap.innerHTML = '<p class="dim">Nothing allocated yet. Open the Passive Tree tab and start clicking — notables and keystones you take will be listed here.</p>';
    } else {
      picked.sort((a, b) => (b.n.a - a.n.a) || (a.n.k === "keystone" ? -1 : 1));
      picked.forEach(({ n }) => {
        const card = document.createElement("div");
        card.className = "notable-card" + (n.a ? " asc" : "") + (n.k === "keystone" ? " keystone" : "");
        card.innerHTML =
          '<div class="n-name">' + esc(n.n) + (n.a ? " · Blood Mage" : "") + "</div>" +
          n.s.map((s) => '<div class="n-stat">' + esc(s) + "</div>").join("");
        wrap.appendChild(card);
      });
    }
    if (window.Gear) window.Gear.renderTotals(document.getElementById("build-totals"));
  }
  App.renderBuildSummary = renderBuildSummary;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  App.esc = esc;
})();
