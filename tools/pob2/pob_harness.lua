-- pob_harness.lua — reusable library to drive the REAL headless PoB2 (PoE2) engine.
--
-- Boots Path of Building 2 under LuaJIT, exposes a fluent Builder for assembling a
-- character (class, ascendancy, tree, gems, gear, jewels) and computing real stats,
-- plus discovery helpers (find nodes/gems/bases) so an AI can look up real IDs/names.
--
-- IMPORTANT: the process CWD must already be the PoB2 install dir before boot()
-- (run.ps1 handles that). Module paths are kept CWD-relative on purpose — the install
-- path contains accented characters that LuaJIT's ANSI file IO cannot open directly.
--
-- See tools/pob2/README.md for the full workflow and gotchas.

local M = {}

local function readfile(p)
  local f = assert(io.open(p, "r"), "cannot open "..p)
  local s = f:read("*a"); f:close(); return s
end

--- Boot the headless engine. `harnessDir` is the folder containing HeadlessWrapper.lua
--- (i.e. this tools/pob2 dir, passed as a short/ASCII path by run.ps1).
--- Returns an env table { main = <PoB main object> }.
function M.boot(harnessDir)
  -- CWD-relative module resolution (CWD = PoB2 install root). ?/init.lua is required
  -- for package dirs like lua/sha1.
  package.path  = "./?.lua;./?/init.lua;./lua/?.lua;./lua/?/init.lua;"..package.path
  package.cpath = "./?.dll;./runtime/?.dll;"..package.cpath

  -- Load only the stub PREFIX of HeadlessWrapper (everything before it dofiles
  -- Launch.lua), and promote its `local mainObject` to a global so we can reach the
  -- engine. Then we run the real startup ourselves (no blocking io.read tail).
  local wtext = readfile(harnessDir .. "/HeadlessWrapper.lua")
  local cut = assert(wtext:find('dofile%("Launch%.lua"%)'), "HeadlessWrapper marker not found")
  local prefix = wtext:sub(1, cut - 1):gsub("local mainObject", "mainObject = nil")
  assert(loadstring(prefix, "stubs"))()

  GetTime = function() return math.floor(os.clock() * 1000) end

  assert(pcall(function() dofile("Launch.lua") end))
  runCallback("OnInit")
  runCallback("OnFrame")
  if mainObject.promptMsg then
    error("PoB startup prompt (something failed): " .. tostring(mainObject.promptMsg))
  end
  return { main = mainObject.main }
end

-- Engine class IDs (NOT tree.json order). Verified from spec.tree.classes.
M.CLASS_IDS = {
  Witch = 1, Ranger = 2, Warrior = 6, Sorceress = 7,
  Huntress = 8, Mercenary = 9, Monk = 10, Druid = 11,
}

----------------------------------------------------------------------
-- Builder
----------------------------------------------------------------------
local Builder = {}
Builder.__index = Builder

--- Create a fresh BUILD in the engine. Returns a Builder.
function M.newBuild(env, name)
  env.main:SetMode("BUILD", false, name or "AI Build")
  runCallback("OnFrame")
  local build = env.main.modes["BUILD"]
  return setmetatable({ env = env, build = build, spec = build.spec, log = {} }, Builder)
end

function Builder:_log(s) self.log[#self.log + 1] = s end

function Builder:selectClass(nameOrId)
  local id = type(nameOrId) == "number" and nameOrId or M.CLASS_IDS[nameOrId]
  assert(id, "unknown class: " .. tostring(nameOrId))
  self.spec:SelectClass(id)
  self.spec:BuildAllDependsAndPaths()
  return self
end

function Builder:selectAscendancy(nameOrId)
  local id = nameOrId
  if type(nameOrId) == "string" then
    local cls = self.spec.tree.classes[self.spec.curClassId]
    for aid, a in pairs(cls.classes or {}) do
      if a.name and a.name:lower() == nameOrId:lower() then id = aid break end
    end
  end
  assert(type(id) == "number", "unknown ascendancy: " .. tostring(nameOrId))
  self.spec:SelectAscendClass(id)
  self.spec:BuildAllDependsAndPaths()
  return self
end

function Builder:setLevel(n)
  self.build.characterLevel = n
  self.build.characterLevelAutoMode = false
  return self
end

-- Resolve a passive node by numeric id or by (case-insensitive) display name.
-- When multiple nodes share a name, the nearest to the current tree wins.
-- ascendancyOnly restricts to (true) ascendancy nodes / (false) regular nodes.
function Builder:_resolveNode(nameOrId, ascendancyOnly)
  if type(nameOrId) == "number" then return self.spec.nodes[nameOrId] end
  local best
  for _, node in pairs(self.spec.nodes) do
    if type(node) == "table" and node.dn and node.dn:lower() == nameOrId:lower() then
      local isAsc = node.ascendancyName ~= nil
      if (ascendancyOnly and isAsc) or (not ascendancyOnly and not isAsc) then
        if not best or (node.pathDist or 9999) < (best.pathDist or 9999) then best = node end
      end
    end
  end
  return best
end

-- Allocate ascendancy notables (by name or id), honouring the 8-point cap.
function Builder:allocAscendancy(list)
  for _, n in ipairs(list) do
    local node = self:_resolveNode(n, true)
    if not node then
      self:_log("ASC MISS " .. tostring(n))
    elseif not node.alloc then
      self.spec:BuildAllDependsAndPaths(); self.spec:AllocNode(node); self.spec:BuildAllDependsAndPaths()
      local _, asc = self.spec:CountAllocNodes()
      if asc >= 8 then self:_log("ascendancy 8-point cap reached"); break end
    end
  end
  return self
end

-- Allocate regular tree nodes/sockets in PRIORITY ORDER until `budget` normal points
-- are spent. Each entry may be a notable name, a node id, or a jewel-socket id.
-- Pathing (travel nodes) is handled by the engine.
function Builder:allocTree(list, budget)
  budget = budget or 100
  for _, n in ipairs(list) do
    local used = self.spec:CountAllocNodes()
    if used >= budget then self:_log("tree budget " .. budget .. " reached at " .. used); break end
    local node = self:_resolveNode(n, false)
    if not node then
      self:_log("NODE MISS " .. tostring(n))
    elseif not node.alloc then
      self.spec:BuildAllDependsAndPaths(); self.spec:AllocNode(node); self.spec:BuildAllDependsAndPaths()
    end
  end
  return self
end

-- Add a linked skill group in `slot` (e.g. "Weapon 1", "Gloves", "Boots").
-- `gems` is a list of gem/support names (resolved against the real gem DB).
function Builder:addSkillGroup(slot, gems, isMain)
  local g = { label = "", enabled = true, slot = slot, gemList = {} }
  for _, x in ipairs(gems) do
    table.insert(g.gemList, { nameSpec = x, level = 20, quality = 20, enabled = true, new = true })
  end
  table.insert(self.build.skillsTab.socketGroupList, g)
  self.build.skillsTab:ProcessSocketGroup(g)
  if isMain then self.build.mainSocketGroup = #self.build.skillsTab.socketGroupList end
  for _, gi in ipairs(g.gemList) do
    if not gi.gemData then self:_log("GEM ERR '" .. gi.nameSpec .. "': " .. tostring(gi.errMsg)) end
  end
  return self
end

-- Add an item from PoB raw text. Explicit mods may be tagged {crafted} / {rune} /
-- {fractured}. Base type must be a real PoE2 base (see discover bases). Auto-equips
-- to the item's primary slot (Focus is redirected to the Weapon 2 / off-hand slot).
-- Pass `jewelSocket` (allocated socket node id) to slot a jewel instead.
function Builder:addItem(raw, jewelSocket)
  local it = new("Item", raw)
  if not it.base then
    self:_log("ITEM BASE FAIL: " .. (raw:match("\n([^\n]+)\n[^\n]+\nItem Level") or raw:sub(1, 40)))
    return self
  end
  -- Items authored with Prefix:/Suffix: affix ids must be Craft()ed to roll the real
  -- mod values from the affix pool. Free-text items store mods directly, so skip.
  if (it.prefixes and #it.prefixes > 0) or (it.suffixes and #it.suffixes > 0) then it:Craft() end
  it:NormaliseQuality(); it:BuildModList()
  self.build.itemsTab:AddItem(it, true)
  self.build.itemsTab:PopulateSlots()
  local slotName = jewelSocket and ("Jewel " .. jewelSocket) or it:GetPrimarySlot()
  local slot = self.build.itemsTab.slots[slotName]
  if not slot and slotName == "Focus" then slot = self.build.itemsTab.slots["Weapon 2"] end
  if slot then slot:SetSelItemId(it.id) else self:_log("NO SLOT '" .. tostring(slotName) .. "'") end
  return self
end

function Builder:addJewel(socket, raw)
  if not self.spec.allocNodes[socket] then
    self:_log("jewel socket " .. socket .. " not allocated; jewel skipped")
    return self
  end
  return self:addItem(raw, socket)
end

-- Return the list of REAL craftable affixes for a base at itemLevel.
-- Each entry: { modId, level, type="Prefix"/"Suffix", text=<roll text>, group }.
-- Only affixes with spawn weight > 0 on this base and level <= ilvl are returned,
-- so everything here can actually roll on the item in-game.
function Builder:affixesFor(baseName, ilvl)
  ilvl = ilvl or 82
  local it = new("Item", "Rarity: RARE\nX\n" .. baseName .. "\nItem Level: " .. ilvl .. "\n")
  if not it.base then return nil, "unknown base '" .. baseName .. "'" end
  it:BuildModList()
  local out = {}
  for modId, md in pairs(it.affixes or {}) do
    local w = it.GetModSpawnWeight and it:GetModSpawnWeight(md) or 1
    if w and w > 0 and (md.level or 1) <= ilvl and md[1] then
      out[#out + 1] = { modId = modId, level = md.level or 1, type = md.type, text = md[1], group = md.group }
    end
  end
  return out
end

-- Craft a REAL rare from a base + a list of desired mod text substrings ("wants").
-- Each want is matched (case-insensitive substring) against the base's real affix
-- pool; the highest-tier matching affix from an unused mod group is chosen, capped at
-- 3 prefixes + 3 suffixes. The engine rolls the actual value at `quality` (0..1).
-- Unmatched wants are logged (so you know if a mod can't roll on that base).
-- Example: b:craftItem("Attuned Wand","Doom Whisper",
--   {"increased Chaos Damage","increased Spell Damage",
--    "Critical Hit Chance for Spells","Critical Spell Damage Bonus","increased Cast Speed"})
function Builder:craftItem(baseName, itemName, wants, opts)
  opts = opts or {}
  local quality = opts.quality or 0.9
  local ilvl = opts.ilvl or 82
  local jewelSocket = opts.jewelSocket
  local valid, err = self:affixesFor(baseName, ilvl)
  if not valid then self:_log("CRAFT " .. tostring(err)); return self end

  local usedGroup, pre, suf = {}, {}, {}
  for _, want in ipairs(wants) do
    local wl = want:lower()
    local best
    for _, a in ipairs(valid) do
      if a.text:lower():find(wl, 1, true) and not usedGroup[a.group or a.modId] then
        local room = (a.type == "Prefix" and #pre < 3) or (a.type == "Suffix" and #suf < 3)
        if room and (not best or a.level > best.level) then best = a end
      end
    end
    if best then
      usedGroup[best.group or best.modId] = true
      if best.type == "Prefix" then pre[#pre + 1] = best else suf[#suf + 1] = best end
    else
      self:_log("CRAFT '" .. baseName .. "': no craftable affix for '" .. want .. "'")
    end
  end

  -- Roll each chosen affix to a concrete in-range value. The wording is the real
  -- affix text, so PoB parses it into the real stat and the value is craftable.
  local lines = { "Rarity: RARE", itemName, baseName, "Item Level: " .. ilvl }
  local function roll(a)
    return (a.text:gsub("%(([%d%.]+)%-([%d%.]+)%)", function(lo, hi)
      lo, hi = tonumber(lo), tonumber(hi)
      local v = lo + quality * (hi - lo)
      if lo == math.floor(lo) and hi == math.floor(hi) then
        v = math.floor(v + 0.5)
      else
        v = math.floor(v * 10 + 0.5) / 10
      end
      return tostring(v)
    end))
  end
  for _, a in ipairs(pre) do lines[#lines + 1] = roll(a) end
  for _, a in ipairs(suf) do lines[#lines + 1] = roll(a) end
  return self:addItem(table.concat(lines, "\n"), jewelSocket)
end

function Builder:recompute()
  self.build.buildFlag = true
  runCallback("OnFrame")
  self.build.calcsTab:BuildOutput()
  runCallback("OnFrame")
  return self
end

-- Snapshot of the key computed stats.
function Builder:stats()
  local o = self.build.calcsTab.mainOutput or {}
  local u, a = self.spec:CountAllocNodes()
  return {
    Int = o.Int, Str = o.Str, Dex = o.Dex,
    Life = o.Life, ES = o.EnergyShield, Mana = o.ManaUnreserved or o.Mana,
    FireRes = o.FireResist, ColdRes = o.ColdResist, LightningRes = o.LightningResist, ChaosRes = o.ChaosResist,
    CritChance = o.CritChance, DPS = o.TotalDPS or o.CombinedDPS or o.FullDPS,
    treePoints = u, ascendPoints = a,
  }
end

function Builder:saveXML() return self.build:SaveDB("export") end

----------------------------------------------------------------------
-- Discovery helpers (query the real engine data)
----------------------------------------------------------------------
local function ensureBuild(env)
  local b = env.main.modes["BUILD"]
  if not b then env.main:SetMode("BUILD", false, "disc"); runCallback("OnFrame"); b = env.main.modes["BUILD"] end
  return b
end

-- Find passive nodes. opt = { contains=<substr>, type="Notable"|"Keystone"|nil,
--   class="Witch", ascendancy="Blood Mage" }. Sorted by pathDist from the class start.
function M.findNodes(env, opt)
  opt = opt or {}
  local build = ensureBuild(env)
  local spec = build.spec
  spec:SelectClass(M.CLASS_IDS[opt.class or "Witch"] or 1)
  if opt.ascendancy then
    for aid, a in pairs(spec.tree.classes[spec.curClassId].classes or {}) do
      if a.name and a.name:lower() == opt.ascendancy:lower() then spec:SelectAscendClass(aid) break end
    end
  end
  spec:BuildAllDependsAndPaths()
  local q = (opt.contains or ""):lower()
  local res = {}
  for id, node in pairs(spec.nodes) do
    if type(node) == "table" and node.dn then
      local sd = node.sd and table.concat(node.sd, " / ") or ""
      local typeOk = (not opt.type) or node.type == opt.type or (opt.type == "Notable" and node.isNotable)
      if typeOk and (q == "" or (node.dn .. " " .. sd):lower():find(q, 1, true)) then
        res[#res + 1] = { id = id, name = node.dn, stats = sd, pathDist = node.pathDist, ascendancy = node.ascendancyName }
      end
    end
  end
  table.sort(res, function(a, b) return (a.pathDist or 9999) < (b.pathDist or 9999) end)
  return res
end

-- Find gems. opt = { contains=<substr>, support=true|false|nil }
function M.findGems(env, opt)
  opt = opt or {}
  local build = ensureBuild(env)
  local q = (opt.contains or ""):lower()
  local res = {}
  for _, g in pairs(build.data.gems) do
    local isSupport = g.grantedEffect and g.grantedEffect.support and true or false
    if (opt.support == nil or opt.support == isSupport) and g.name and (q == "" or g.name:lower():find(q, 1, true)) then
      res[#res + 1] = { name = g.name, support = isSupport, reqInt = g.reqInt, reqStr = g.reqStr, reqDex = g.reqDex }
    end
  end
  table.sort(res, function(a, b) return a.name < b.name end)
  return res
end

-- Find item bases. opt = { contains=<substr>, type=<base type e.g. "Wand"> }
function M.findBases(env, opt)
  opt = opt or {}
  local build = ensureBuild(env)
  local q = (opt.contains or ""):lower()
  local res = {}
  for name, base in pairs(build.data.itemBases) do
    local t = base.type or "?"
    local sub = base.subType and (" [" .. base.subType .. "]") or ""
    if (not opt.type or t == opt.type) and (q == "" or name:lower():find(q, 1, true)) then
      res[#res + 1] = { name = name, type = t, sub = sub }
    end
  end
  table.sort(res, function(a, b) return (a.type .. a.name) < (b.type .. b.name) end)
  return res
end

return M
