/* gear.js — simulated inventory: PoE2-style slots, an item editor,
   and a mod parser that totals common stat lines. */
(function () {
  "use strict";
  const App = window.App;

  const SLOTS = [
    { id: "weapon", name: "Weapon" },
    { id: "helmet", name: "Helmet" },
    { id: "offhand", name: "Off-hand / Focus" },
    { id: "ring1", name: "Ring I" },
    { id: "body", name: "Body Armour" },
    { id: "ring2", name: "Ring II" },
    { id: "gloves", name: "Gloves" },
    { id: "amulet", name: "Amulet" },
    { id: "boots", name: "Boots" },
  ];
  const BELT = [
    { id: "flask1", name: "Life Flask" },
    { id: "flask2", name: "Mana Flask" },
    { id: "charm1", name: "Charm I" },
    { id: "charm2", name: "Charm II" },
    { id: "charm3", name: "Charm III" },
  ];
  const RARITIES = ["Normal", "Magic", "Rare", "Unique"];

  // ---------- mod parser ----------
  // Each rule: regex -> a key in the totals map. Numbers accumulate.
  const RULES = [
    { re: /^\+?(\d+)\s+to maximum life/i, key: "+# to maximum Life" },
    { re: /^\+?(\d+)\s+to maximum mana/i, key: "+# to maximum Mana" },
    { re: /^\+?(\d+)\s+to maximum energy shield/i, key: "+# to maximum Energy Shield" },
    { re: /^(\d+)% increased maximum life/i, key: "% increased maximum Life" },
    { re: /^(\d+)% increased spell damage/i, key: "% increased Spell Damage" },
    { re: /^(\d+)% increased chaos damage/i, key: "% increased Chaos Damage" },
    { re: /^(\d+)% increased cast speed/i, key: "% increased Cast Speed" },
    { re: /^(\d+)% increased critical (hit|strike) chance/i, key: "% increased Critical Hit Chance" },
    { re: /^\+?(\d+)% to critical (damage bonus|strike multiplier)/i, key: "+% Critical Damage Bonus" },
    { re: /^(\d+)% increased critical damage bonus/i, key: "% increased Critical Damage Bonus" },
    { re: /^(\d+)% increased curse effect|^(\d+)% increased effect of your curses/i, key: "% increased Curse Effect" },
    { re: /^(\d+)% increased area of effect/i, key: "% increased Area of Effect" },
    { re: /^\+?(\d+)% to fire resistance/i, key: "+% Fire Resistance" },
    { re: /^\+?(\d+)% to cold resistance/i, key: "+% Cold Resistance" },
    { re: /^\+?(\d+)% to lightning resistance/i, key: "+% Lightning Resistance" },
    { re: /^\+?(\d+)% to chaos resistance/i, key: "+% Chaos Resistance" },
    { re: /^\+?(\d+)% to all elemental resistances/i, key: "+% All Elemental Resistances" },
    { re: /^\+?(\d+)\s+to (strength|intelligence|dexterity)/i, key: null, dyn: (m) => "+# to " + cap(m[2]) },
    { re: /^adds\s+(\d+)\s+to\s+(\d+)\s+chaos damage/i, key: "Added Chaos Damage (avg)", avg: true },
    { re: /^(\d+)% increased movement speed/i, key: "% increased Movement Speed" },
    { re: /^(\d+)% increased (life )?flask recovery rate/i, key: "% increased Flask Recovery Rate" },
    { re: /^(\d+)% (of\s+)?spell damage leeched as life/i, key: "% Spell Damage Leeched as Life" },
    { re: /^(\d+)% increased mana regeneration/i, key: "% increased Mana Regeneration" },
    { re: /^(\d+)% increased spirit/i, key: "% increased Spirit" },
    { re: /^\+?(\d+)\s+to spirit/i, key: "+# to Spirit" },
    { re: /^\+?(\d+)\s+to level of all (spell|chaos) skills/i, key: null, dyn: (m) => "+# to Level of all " + cap(m[2]) + " Skills" },
  ];
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }

  function parseTotals() {
    const totals = {};
    let unparsed = 0;
    Object.values(App.state.gear).forEach((item) => {
      if (!item || !item.mods) return;
      item.mods.forEach((line) => {
        line = line.trim();
        if (!line) return;
        for (const rule of RULES) {
          const m = line.match(rule.re);
          if (m) {
            const key = rule.dyn ? rule.dyn(m) : rule.key;
            let val;
            if (rule.avg) val = (parseInt(m[1], 10) + parseInt(m[2], 10)) / 2;
            else val = parseInt(m[1] || m[2], 10);
            totals[key] = (totals[key] || 0) + val;
            return;
          }
        }
        unparsed++;
      });
    });
    return { totals, unparsed };
  }

  // ---------- rendering ----------
  const dollGrid = document.getElementById("doll-grid");
  const beltGrid = document.getElementById("belt-grid");
  const editorTitle = document.getElementById("editor-title");
  const editorBody = document.getElementById("editor-body");
  let selected = null;

  function slotButton(slot) {
    const btn = document.createElement("button");
    btn.className = "slot-btn";
    btn.dataset.slot = slot.id;
    btn.addEventListener("click", () => openEditor(slot));
    return btn;
  }
  SLOTS.forEach((s) => dollGrid.appendChild(slotButton(s)));
  BELT.forEach((s) => beltGrid.appendChild(slotButton(s)));

  function refreshSlots() {
    document.querySelectorAll(".slot-btn").forEach((btn) => {
      const slot = [...SLOTS, ...BELT].find((s) => s.id === btn.dataset.slot);
      const item = App.state.gear[slot.id];
      btn.classList.toggle("filled", !!item);
      btn.classList.toggle("selected", selected === slot.id);
      btn.innerHTML =
        '<span class="s-name">' + App.esc(slot.name) + "</span>" +
        (item
          ? '<span class="s-item ' + (item.rarity || "").toLowerCase() + '">' + App.esc(item.name || "(unnamed item)") + "</span>" +
            '<span class="s-name">' + item.mods.filter(Boolean).length + " mods</span>"
          : '<span class="s-item" style="color:var(--bone-dim);font-style:italic;">empty</span>');
    });
  }

  function openEditor(slot) {
    selected = slot.id;
    const item = App.state.gear[slot.id] || { name: "", rarity: "Rare", mods: [] };
    editorTitle.textContent = slot.name;
    editorBody.innerHTML = "";

    const nameLabel = el("label", "Item name");
    const nameInput = el("input"); nameInput.type = "text"; nameInput.value = item.name;
    nameInput.placeholder = "e.g. Sanguine Coil";

    const rarLabel = el("label", "Rarity");
    const rarSel = el("select");
    RARITIES.forEach((r) => {
      const o = el("option", r); o.value = r; if (r === item.rarity) o.selected = true; rarSel.appendChild(o);
    });

    const modLabel = el("label", "Modifiers — one per line");
    const modArea = el("textarea");
    modArea.value = item.mods.join("\n");
    modArea.placeholder = "+120 to maximum Life\n35% increased Spell Damage\n+23% to Chaos Resistance\nAdds 12 to 24 Chaos Damage";

    const actions = el("div"); actions.className = "editor-actions";
    const saveBtn = el("button", "Save Item"); saveBtn.className = "btn";
    const clearBtn = el("button", "Clear Slot"); clearBtn.className = "btn danger";
    actions.append(saveBtn, clearBtn);

    saveBtn.addEventListener("click", () => {
      App.state.gear[slot.id] = {
        name: nameInput.value.trim(),
        rarity: rarSel.value,
        mods: modArea.value.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      App.changed();
      refreshAll();
    });
    clearBtn.addEventListener("click", () => {
      delete App.state.gear[slot.id];
      App.changed();
      refreshAll();
    });

    editorBody.append(nameLabel, nameInput, rarLabel, rarSel, modLabel, modArea, actions);
    refreshSlots();
  }

  function el(tag, text) { const e = document.createElement(tag); if (text) e.textContent = text; return e; }

  function renderTotals(target) {
    const { totals, unparsed } = parseTotals();
    target.innerHTML = "";
    const keys = Object.keys(totals).sort();
    if (!keys.length) {
      target.innerHTML = '<div class="empty">No parsed mods yet — add items in the Gear tab.</div>';
      return;
    }
    keys.forEach((k) => {
      const row = el("div"); row.className = "row";
      const kk = el("span", k); kk.className = "k";
      const vv = el("span", formatVal(k, totals[k])); vv.className = "v";
      row.append(kk, vv);
      target.appendChild(row);
    });
    if (unparsed) {
      const note = el("div", unparsed + " line(s) not recognized by the parser — they still count as flavor, just not in totals.");
      note.className = "empty";
      target.appendChild(note);
    }
  }
  function formatVal(key, v) {
    const n = Math.round(v * 10) / 10;
    if (key.startsWith("+#")) return "+" + n;
    if (key.startsWith("+%")) return "+" + n + "%";
    if (key.startsWith("%")) return n + "%";
    return String(n);
  }

  function refreshAll() {
    refreshSlots();
    renderTotals(document.getElementById("gear-totals"));
  }

  window.Gear = { renderTotals };
  App.onChange(refreshAll);
  refreshAll();
})();
