-- Extract affix spawn weights for crafting cost analysis
-- Run: luajit discover_weights.lua <base> <query>

local M = require("pob_harness")
local env = M.boot(".")

local base = arg[1] or "Attuned Wand"
local query = (arg[2] or ""):lower()

local affixes = env.build:affixesFor(base, 82)
if not affixes then
  error("Unknown base: " .. base)
end

-- Group by text prefix for easier reading
local groups = {}
for _, a in ipairs(affixes) do
  local prefix = a.text:sub(1, 40)
  if not groups[prefix] then
    groups[prefix] = {}
  end
  table.insert(groups[prefix], a)
end

print(string.format("# %s Crafting Data (ilvl 82)\n", base))

-- Filter and display
local function matches(text)
  if query == "" then return true end
  return text:lower():find(query, 1, true) ~= nil
end

for prefix, list in pairs(groups) do
  if matches(prefix) then
    for _, a in ipairs(list) do
      print(string.format("%s | %s | T%d", a.type, a.text, a.level or 1))
    end
  end
end
