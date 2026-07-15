-- make_build.lua — CLI over pob_harness. Invoked by run.ps1 (CWD = PoB2 install).
--
-- Usage:
--   luajit make_build.lua build   <specFile> <outXml> <outStatsJson>
--   luajit make_build.lua discover nodes  <query> [class] [ascendancy]
--   luajit make_build.lua discover gems   <query> [support|active]
--   luajit make_build.lua discover bases  <query> [baseType]
--
-- All file paths are passed as short/ASCII paths by run.ps1 (LuaJIT cannot open the
-- accented install/repo paths directly).

local here = (arg[0]:gsub("[/\\][^/\\]+$", ""))
local M = dofile(here .. "/pob_harness.lua")

local function jesc(s) return tostring(s):gsub("\\", "\\\\"):gsub('"', '\\"') end

local cmd = arg[1]

if cmd == "discover" then
  local kind, query = arg[2], arg[3] or ""
  local env = M.boot(here)
  if kind == "nodes" then
    local class, asc = arg[4] or "Witch", arg[5]
    local r = M.findNodes(env, { contains = query, type = "Notable", class = class, ascendancy = asc })
    print(string.format("# %d notable(s) matching '%s' (class %s), nearest first:", #r, query, class))
    for i = 1, math.min(#r, 80) do
      local n = r[i]
      print(string.format("%d\tpd=%s\t%s%s\t::\t%s", n.id, tostring(n.pathDist),
        n.ascendancy and ("["..n.ascendancy.."] ") or "", n.name, n.stats))
    end
  elseif kind == "gems" then
    local filt = arg[4]
    local support = (filt == "support" and true) or (filt == "active" and false) or nil
    local r = M.findGems(env, { contains = query, support = support })
    print(string.format("# %d gem(s) matching '%s':", #r, query))
    for _, g in ipairs(r) do
      print(string.format("%s\t%s\treqInt=%s", g.name, g.support and "SUPPORT" or "ACTIVE", tostring(g.reqInt)))
    end
  elseif kind == "bases" then
    local btype = arg[4]
    local r = M.findBases(env, { contains = query, type = btype })
    print(string.format("# %d base(s) matching '%s'%s:", #r, query, btype and (" type="..btype) or ""))
    for _, b in ipairs(r) do print(string.format("%s\t%s%s", b.type, b.name, b.sub)) end
  elseif kind == "affixes" then
    -- query = base name; lists the REAL craftable affixes (weight-checked) for it.
    local b = M.newBuild(env, "disc")
    local list, err = b:affixesFor(query, 82)
    if not list then print("ERROR: " .. tostring(err)); return end
    table.sort(list, function(a, c) return (a.type .. (a.text or "")) < (c.type .. (c.text or "")) end)
    print(string.format("# %d craftable affix(es) on '%s' (ilvl 82):", #list, query))
    for _, a in ipairs(list) do print(string.format("%s\t%s", a.type, a.text)) end
  else
    print("unknown discover kind: " .. tostring(kind))
  end
  return
end

if cmd == "build" then
  local specPath, outXml, outStats = arg[2], arg[3], arg[4]
  assert(specPath and outXml and outStats, "usage: build <spec> <outXml> <outStats>")
  local spec = assert(loadfile(specPath))()

  local env = M.boot(here)
  local b = M.newBuild(env, spec.name or "AI Build")
  b:selectClass(spec.class)
   :selectAscendancy(spec.ascendancy)
   :setLevel(spec.level or 82)
  if spec.ascendancyNodes then b:allocAscendancy(spec.ascendancyNodes) end
  b:allocTree(spec.treeNodes or {}, spec.treeBudget or 100)
  for _, s in ipairs(spec.skills or {}) do b:addSkillGroup(s.slot, s.gems, s.main) end
  -- Gear: each entry is either a craft table {base, name, wants[, quality]} (preferred —
  -- rolls real in-range affixes) or a raw PoB item-text string.
  for _, g in ipairs(spec.gear or {}) do
    if type(g) == "string" then b:addItem(g)
    else b:craftItem(g.base, g.name or g.base, g.wants or {}, { quality = g.quality }) end
  end
  -- Jewels: {socket, base, name, wants[, quality]} craft, or {socket, raw}.
  for _, j in ipairs(spec.jewels or {}) do
    if j.wants then b:craftItem(j.base, j.name or j.base, j.wants, { quality = j.quality, jewelSocket = j.socket })
    else b:addJewel(j.socket, j.raw) end
  end
  b:recompute()

  local st = b:stats()
  local xml = b:saveXML()
  local fx = assert(io.open(outXml, "w")); fx:write(xml); fx:close()

  local sj = assert(io.open(outStats, "w"))
  sj:write("{")
  local keys = { "DPS","CritChance","Life","ES","Mana","Int","Str","Dex",
                 "FireRes","ColdRes","LightningRes","ChaosRes","treePoints","ascendPoints" }
  for _, k in ipairs(keys) do sj:write(string.format('"%s":%s,', k, tostring(st[k] or 0))) end
  sj:write('"warnings":[')
  for i, l in ipairs(b.log) do sj:write((i > 1 and "," or "") .. '"' .. jesc(l) .. '"') end
  sj:write("]}")
  sj:close()

  print(string.format("BUILD OK  DPS=%s  Crit=%s%%  Life=%s  ES=%s  Res=%s/%s/%s/%s  tree=%s/8asc",
    tostring(st.DPS), tostring(st.CritChance), tostring(st.Life), tostring(st.ES),
    tostring(st.FireRes), tostring(st.ColdRes), tostring(st.LightningRes), tostring(st.ChaosRes),
    tostring(st.treePoints)))
  if #b.log > 0 then print("WARNINGS: " .. table.concat(b.log, " | ")) end
  return
end

print("usage: luajit make_build.lua build|discover ...  (see header)")
