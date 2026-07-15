<#
.SYNOPSIS
  Build or update a PoB2 build from a declarative spec, using the real headless PoB2
  engine. Produces a pob.cool/pobb.in import code and (optionally) writes it into a guide.

.EXAMPLE
  # Build a spec, print stats, write the code into a guide JSON:
  ./run.ps1 -Spec specs/sanguine-detonation.lua -Slug sanguine-detonation

.EXAMPLE
  # Discover real data to author a spec (no build):
  ./run.ps1 -Discover nodes   -Query "chaos"            # notables (Witch, nearest first)
  ./run.ps1 -Discover gems    -Query "curse"            # gems
  ./run.ps1 -Discover bases   -Query "wand"             # item bases
  ./run.ps1 -Discover affixes -Query "Amethyst Ring"    # REAL craftable affixes on a base

.NOTES
  Prereqs (one-time):  winget install DEVCOM.LuaJIT   and Path of Building 2 installed.
  The engine + repo live under paths with non-ASCII chars, which LuaJIT's file IO can't
  open; this script passes 8.3 short paths to LuaJIT and does all Unicode IO in PowerShell.
#>
[CmdletBinding()]
param(
  [string]$Spec,
  [string]$Slug,
  [ValidateSet('nodes','gems','bases','affixes')][string]$Discover,
  [string]$Query = "",
  [string]$Class = "Witch"
)
$ErrorActionPreference = "Stop"
$toolDir = $PSScriptRoot
if ($Spec) { $Spec = (Resolve-Path $Spec).Path }  # absolute before we change CWD

# --- locate engine + luajit -------------------------------------------------
$install = Join-Path $env:APPDATA "Path of Building Community (PoE2)"
if (-not (Test-Path (Join-Path $install "Launch.lua"))) {
  throw "PoB2 (PoE2) not found at '$install'. Install Path of Building 2 first."
}
$luajit = Join-Path $env:LOCALAPPDATA "Programs\LuaJIT\bin\luajit.exe"
if (-not (Test-Path $luajit)) { throw "LuaJIT not found. Run:  winget install DEVCOM.LuaJIT" }

# --- short-path helper (LuaJIT can't open non-ASCII paths) ------------------
$fso = New-Object -ComObject Scripting.FileSystemObject
function Get-ShortPath([string]$p) {
  if (Test-Path $p -PathType Container) { return $fso.GetFolder($p).ShortPath }
  return $fso.GetFile($p).ShortPath
}

$cache = Join-Path $toolDir ".cache"
New-Item -ItemType Directory -Force -Path $cache | Out-Null
$mbShort    = Get-ShortPath (Join-Path $toolDir "make_build.lua")
$cacheShort = Get-ShortPath $cache

Set-Location $install   # CWD must be the install dir for relative module loading

# --- discovery mode ---------------------------------------------------------
if ($Discover) {
  & $luajit $mbShort discover $Discover $Query $Class
  return
}

# --- build mode -------------------------------------------------------------
if (-not $Spec) { throw "Provide -Spec <file> to build, or -Discover <kind> -Query <q>." }
if (-not (Test-Path $Spec)) { throw "Spec not found: $Spec" }

# Copy spec into the ASCII cache so LuaJIT can read it.
Copy-Item $Spec (Join-Path $cache "spec.lua") -Force
$specShort  = Get-ShortPath (Join-Path $cache "spec.lua")
$xmlShort   = "$cacheShort\build.xml"
$statsShort = "$cacheShort\stats.json"

& $luajit $mbShort build $specShort $xmlShort $statsShort
if (-not (Test-Path (Join-Path $cache "build.xml"))) { throw "Build failed (no XML produced). See output above." }

# Encode XML -> pob.cool/pobb.in code (URL-safe base64 of zlib-deflated XML).
$xmlPath  = Join-Path $cache "build.xml"
$codePath = Join-Path $cache "code.txt"
$code = python -c "import zlib,base64,sys; d=open(sys.argv[1],'rb').read(); print(base64.b64encode(zlib.compress(d,9)).decode().replace('+','-').replace('/','_'))" "$xmlPath"
Set-Content -Path $codePath -Value $code -NoNewline -Encoding ascii
Write-Host ("`nCODE ready ({0} chars) -> {1}" -f $code.Length, $codePath)

# Show stats.
if (Test-Path (Join-Path $cache "stats.json")) {
  Write-Host "`nStats:"; Get-Content (Join-Path $cache "stats.json")
}

# Optionally write the code into a guide JSON's pobCode field.
if ($Slug) {
  $guide = Join-Path $toolDir "..\..\data\guides\$Slug.json"
  if (-not (Test-Path $guide)) { throw "Guide not found: $guide" }
  python -c "import json,sys; p=sys.argv[1]; d=json.load(open(p,encoding='utf-8')); d['pobCode']=open(sys.argv[2],encoding='utf-8').read().strip(); json.dump(d,open(p,'w',encoding='utf-8'),indent=2,ensure_ascii=False); print('guide updated:', p)" "$guide" "$codePath"
}
