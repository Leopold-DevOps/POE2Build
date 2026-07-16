/* Exile Codex — guide page.
   Reads ?build=<slug>, loads data/guides/<slug>.json, and renders the
   written guide plus an embedded pobb.in build (interactive passive tree +
   hoverable gear). The section HTML is authored by us (trusted content). */
(function () {
  "use strict";

  var root = document.getElementById("guide-root");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function getParam(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
  }

  function boldLastWord(title) {
    return esc(title).replace(/\s+(\S+)$/, ' <b>$1</b>');
  }

  function chip(cls, val) {
    return val ? '<span class="chip ' + cls + '">' + esc(val) + "</span>" : "";
  }

  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }

  // Key build stats shown as a strip above the PoB frame. Values come from the
  // real engine (written into the guide by tools/pob2/run.ps1).
  function statStripHTML(s) {
    if (!s) return "";
    var cells = [];
    function cell(k, v, cls) {
      if (v === undefined || v === null || v === "") return;
      cells.push('<div class="s"><div class="k">' + esc(k) + '</div><div class="v ' +
        (cls || "") + '">' + esc(v) + "</div></div>");
    }
    function num(n) {
      n = Number(n);
      if (!isFinite(n)) return null;
      return n >= 1000 ? Math.round(n).toLocaleString() : Math.round(n * 10) / 10;
    }
    cell("DPS", num(s.DPS), "red");
    cell("Crit", s.CritChance != null ? Math.round(s.CritChance) + "%" : null, "purp");
    cell("Life", num(s.Life));
    cell("Energy Shield", num(s.ES));
    if (s.FireRes != null) {
      var capped = s.FireRes >= 75 && s.ColdRes >= 75 && s.LightningRes >= 75;
      cell("Resistances", s.FireRes + "/" + s.ColdRes + "/" + s.LightningRes,
        capped ? "good" : "red");
    }
    cell("Level", s.level || null);
    return cells.length ? '<div class="pob-stats">' + cells.join("") + "</div>" : "";
  }

  function embedHTML(g) {
    // The interactive view is a full Path of Building running in-browser
    // (pob.cool / pob-web). The build is passed as a raw PoB2 export code in
    // the URL hash — rendered entirely client-side, no share-host round trip.
    var game = g.pobGame || "poe2";
    var pobUrl = g.pobCode
      ? "https://pob.cool/" + game + "#build=" + g.pobCode
      : "";

    var openBtn = pobUrl
      ? '<a class="btn primary" href="' + pobUrl +
        '" target="_blank" rel="noopener">Open in Path of Building ↗</a>'
      : "";
    var copyBtn = g.pobCode
      ? '<button class="btn" id="copy-pob" type="button">Copy PoB2 code</button>'
      : "";

    var shell;
    if (g.pobCode) {
      shell =
        '<div class="embed-shell">' +
          '<iframe title="Interactive Path of Building view of ' + esc(g.title) +
          '" src="' + pobUrl +
          '" loading="lazy" allowfullscreen referrerpolicy="no-referrer"></iframe>' +
        "</div>";
    } else {
      shell =
        '<div class="embed-shell"><div class="embed-fallback">' +
          "No interactive build attached to this guide yet." +
        "</div></div>";
    }

    var note = g.pobbNote
      ? '<div class="embed-note"><span class="warn-dot">⚠</span><span>' + esc(g.pobbNote) + "</span></div>"
      : '<div class="embed-note"><span>Full Path of Building running in your browser — switch between Tree, Items, Skills and Notes inside the frame. Hover any node or item for its real tooltip.</span></div>';

    return (
      '<section class="build-embed">' +
        '<div class="frame wide">' +
          '<div class="be-head">' +
            "<h2>The Build</h2>" +
            '<div class="be-actions">' + copyBtn + openBtn + "</div>" +
          "</div>" +
          statStripHTML(g.pobStats) +
          shell +
          note +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- gem chips: hover tooltips from the real PoB2 gem DB ---------- */
  var gemDB = null, gemTip = null;

  function ensureTip() {
    if (gemTip) return gemTip;
    gemTip = document.createElement("div");
    gemTip.id = "gem-tip";
    document.body.appendChild(gemTip);
    return gemTip;
  }

  function showTip(el) {
    var name = el.getAttribute("data-gem");
    var g = gemDB && gemDB[name];
    if (!g) return;
    var tip = ensureTip();
    var isSup = g.s === 1;
    tip.className = isSup ? "support" : "";
    tip.innerHTML =
      '<div class="gt-name">' + esc(name) + "</div>" +
      '<div class="gt-kind">' + (isSup ? "Support Gem" : "Active Skill") + "</div>" +
      '<div class="gt-desc">' + esc(g.d) + "</div>" +
      (g.t ? '<div class="gt-tags">' + esc(g.t) + "</div>" : "") +
      (g.i ? '<div class="gt-req">Requires ' + esc(g.i) + " Int · max level " + esc(g.lv) + "</div>" : "");
    // position near the chip, flipped/clamped to stay on screen
    var r = el.getBoundingClientRect();
    tip.classList.add("show");
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var left = Math.min(Math.max(8, r.left), window.innerWidth - tw - 8);
    var top = r.top - th - 10;
    if (top < 8) top = r.bottom + 10;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }

  function hideTip() { if (gemTip) gemTip.classList.remove("show"); }

  function wireGems(scope) {
    var chips = scope.querySelectorAll("[data-gem]");
    if (!chips.length) return;
    // lazy-load the gem DB only when a page actually references gems
    fetch("data/gems.json")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (db) {
        gemDB = db || {};
        Array.prototype.forEach.call(chips, function (el) {
          var g = gemDB[el.getAttribute("data-gem")];
          if (!g) { el.setAttribute("data-missing", "1"); return; }
          el.setAttribute("data-kind", g.s === 1 ? "support" : "active");
          el.setAttribute("tabindex", "0");
          el.addEventListener("mouseenter", function () { showTip(el); });
          el.addEventListener("focus", function () { showTip(el); });
          el.addEventListener("mouseleave", hideTip);
          el.addEventListener("blur", hideTip);
        });
      })
      .catch(function () { /* tooltips are progressive enhancement */ });
    window.addEventListener("scroll", hideTip, { passive: true });
  }

  function tocHTML(sections) {
    var links = sections.map(function (s, i) {
      var label = s.kicker ? s.kicker.replace(/^Chapter\s+/i, "") + " · " + s.heading : s.heading;
      return '<a href="#' + esc(s.id || "s" + i) + '">' + esc(label) + "</a>";
    }).join("");
    return '<nav class="toc" aria-label="Guide sections"><div class="inner">' + links + "</div></nav>";
  }

  function sectionsHTML(sections) {
    var body = sections.map(function (s, i) {
      var id = s.id || "s" + i;
      var kicker = s.kicker
        ? '<div class="kicker ' + esc(s.kickerClass || "") + '">' + esc(s.kicker) + "</div>"
        : "";
      var heading = s.heading ? "<h2>" + esc(s.heading) + "</h2>" : "";
      return '<section id="' + esc(id) + '">' + kicker + heading + (s.html || "") + "</section>";
    }).join("");
    return '<div class="guide-body"><div class="frame">' + body + "</div></div>";
  }

  function render(g) {
    document.title = g.title + " — Exile Codex";

    var hero =
      '<section class="guide-hero"><div class="frame">' +
        (g.runeLine ? '<div class="rune-line">' + esc(g.runeLine) + "</div>" : "") +
        "<h1>" + boldLastWord(g.title) + "</h1>" +
        (g.subtitle ? '<p class="sub">' + esc(g.subtitle) + "</p>" : "") +
        '<div class="meta-row">' +
          chip("", g.class + (g.ascendancy ? " · " + g.ascendancy : "")) +
          chip("dmg", g.damage) +
          chip("", g.archetype) +
          chip("diff", g.difficulty) +
          chip("", g.budget) +
          chip("", g.patch) +
        "</div>" +
      "</div></section>";

    root.innerHTML = hero + embedHTML(g) + tocHTML(g.sections || []) + sectionsHTML(g.sections || []);
    wireGems(root);

    var copyBtn = document.getElementById("copy-pob");
    if (copyBtn && g.pobCode) {
      copyBtn.addEventListener("click", function () {
        navigator.clipboard.writeText(g.pobCode).then(
          function () { toast("PoB2 code copied to clipboard"); },
          function () { toast("Copy failed — select the code manually"); }
        );
      });
    }
  }

  function fail(msg) {
    root.innerHTML =
      '<div class="frame"><div class="state-msg">' + esc(msg) +
      '<br><br><a class="btn" href="index.html">← Back to all builds</a></div></div>';
  }

  var slug = getParam("build");
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    fail("No build specified.");
    return;
  }

  fetch("data/guides/" + slug + ".json")
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(render)
    .catch(function (err) {
      fail("Could not load this build guide (" + esc(err.message) + ").");
    });
})();
