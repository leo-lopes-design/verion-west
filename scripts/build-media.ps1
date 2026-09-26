# Optional maintainer tool, Windows only. Not part of the build.
#
# Regenerates the JPEGs in public/media from full-size image masters kept
# outside the repository (mockups/, gitignored). The derived JPEGs are
# committed, so a clone never needs this script or the masters.
#
#   powershell -NoProfile -File scripts/build-media.ps1

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'public\media'
New-Item -ItemType Directory -Force -Path $out | Out-Null

# Each target carries the size the markup declares, so an <img width/height>
# and the file behind it cannot drift apart.
#   1600x1073 — the marketing bands (app/site/page.tsx)
#   1200x805  — the casting strip (app/personas/page.tsx)
#   512x512   — the persona avatars
#
# C6-doorway serves both pages, so it is built once at the larger size; both
# use object-fit: cover, and width/height only reserve space.
$targets = @(
  @{ src = 'mockups\batch-02\C6-doorway.png'; name = 'C6-doorway.jpg'; w = 1600; h = 1073 },
  @{ src = 'mockups\batch-02\C7-window.png';  name = 'C7-window.jpg';  w = 1600; h = 1073 },
  @{ src = 'mockups\batch-02\C8-market.png';  name = 'C8-market.jpg';  w = 1200; h = 805 },
  @{ src = 'mockups\batch-02\C7b-window.png'; name = 'C7b-window.jpg'; w = 1200; h = 805 },
  @{ src = 'mockups\batch-02\C5-kitchen.png'; name = 'C5-kitchen.jpg'; w = 1200; h = 805 },
  @{ src = 'mockups\avatars\marcos.png';      name = 'avatar-marcos.jpg'; w = 512; h = 512 },
  @{ src = 'mockups\avatars\alzira.png';      name = 'avatar-alzira.jpg'; w = 512; h = 512 },
  @{ src = 'mockups\avatars\joana.png';       name = 'avatar-joana.jpg';  w = 512; h = 512 }
)

# Quality 82 keeps the whole set near 1 MB; raise it if a flat band posterises.
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality, 82L)

$total = 0
foreach ($t in $targets) {
  $srcPath = Join-Path $root $t.src
  if (-not (Test-Path $srcPath)) { throw "missing master: $($t.src)" }

  $img = [System.Drawing.Image]::FromFile($srcPath)
  $bmp = New-Object System.Drawing.Bitmap($t.w, $t.h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  # HighQualityBicubic: the default resampler aliases on a >2x downscale
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.DrawImage($img, 0, 0, $t.w, $t.h)

  $dest = Join-Path $out $t.name
  $bmp.Save($dest, $codec, $params)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()

  $kb = (Get-Item $dest).Length / 1KB
  $total += $kb
  '{0,-22} {1,4}x{2,-4} {3,7:N0} KB' -f $t.name, $t.w, $t.h, $kb
}
''
'{0} files, {1:N0} KB' -f $targets.Count, $total
