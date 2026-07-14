/* Exile Codex — directory page.
   Loads data/guides.json, renders guide cards, and drives client-side
   search + filtering. No framework, no build step. */
(function () {
  "use strict";

  var grid = document.getElementById("card-grid");
  var searchEl = document.getElementById("guide-search");
  var fClass = document.getElementById("filter-class");
  var fArch = document.getElementById("filter-archetype");
  var fDiff = document.getElementById("filter-difficulty");
  var countEl = document.getElementById("dir-count");

  var GUIDES = [];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function uniqueSorted(key) {
    var seen = {};
    GUIDES.forEach(function (g) { if (g[key]) seen[g[key]] = true; });
    return Object.keys(seen).sort();
  }

  function fillSelect(sel, values) {
    values.forEach(function (v) {
      var o = document.createElement("option");
      o.value = v; o.textContent = v;
      sel.appendChild(o);
    });
  }

  function cardHTML(g) {
    var tags = (g.tags || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");
    return (
      '<a class="guide-card" href="guide.html?build=' + encodeURIComponent(g.slug) + '">' +
        '<div class="gc-class">' + esc(g.class) + (g.ascendancy ? " · " + esc(g.ascendancy) : "") + "</div>" +
        "<h2>" + esc(g.title) + "</h2>" +
        '<div class="gc-skill">' + esc(g.skill || g.playstyle || "") + "</div>" +
        '<p class="gc-summary">' + esc(g.summary) + "</p>" +
        '<div class="gc-meta">' +
          (g.damage ? '<span class="chip dmg">' + esc(g.damage) + "</span>" : "") +
          (g.archetype ? '<span class="chip">' + esc(g.archetype) + "</span>" : "") +
          (g.difficulty ? '<span class="chip diff">' + esc(g.difficulty) + "</span>" : "") +
          (g.budget ? '<span class="chip">' + esc(g.budget) + "</span>" : "") +
        "</div>" +
        (tags ? '<div class="gc-tags">' + tags + "</div>" : "") +
      "</a>"
    );
  }

  function matches(g, q) {
    if (fClass.value && g.class !== fClass.value) return false;
    if (fArch.value && g.archetype !== fArch.value) return false;
    if (fDiff.value && g.difficulty !== fDiff.value) return false;
    if (q) {
      var hay = [g.title, g.class, g.ascendancy, g.archetype, g.damage,
                 g.skill, g.playstyle, g.summary, (g.tags || []).join(" ")]
                .join(" ").toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function render() {
    var q = (searchEl.value || "").trim().toLowerCase();
    var shown = GUIDES.filter(function (g) { return matches(g, q); });
    if (!shown.length) {
      grid.innerHTML = '<div class="empty-state">No builds match your filters yet. Try clearing the search or filters.</div>';
    } else {
      grid.innerHTML = shown.map(cardHTML).join("");
    }
    countEl.textContent = shown.length + " of " + GUIDES.length + " build" + (GUIDES.length === 1 ? "" : "s");
  }

  fetch("data/guides.json")
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      GUIDES = data.guides || [];

      if (data.site) {
        if (data.site.patch) document.getElementById("hero-rune").textContent = "Path of Exile 2 · " + data.site.patch;
        var h1 = document.getElementById("hero-title");
        if (data.site.name) h1.innerHTML = esc(data.site.name).replace(/\s+(\S+)$/, " <b>$1</b>");
        if (data.site.blurb) document.getElementById("hero-blurb").textContent = data.site.blurb;
        if (data.site.tagline) document.title = data.site.name + " — " + data.site.tagline;
      }

      fillSelect(fClass, uniqueSorted("class"));
      fillSelect(fArch, uniqueSorted("archetype"));
      fillSelect(fDiff, uniqueSorted("difficulty"));

      render();
    })
    .catch(function (err) {
      grid.innerHTML = '<div class="empty-state">Could not load build guides (' + esc(err.message) + ").</div>";
    });

  [searchEl, fClass, fArch, fDiff].forEach(function (el) {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });
})();
