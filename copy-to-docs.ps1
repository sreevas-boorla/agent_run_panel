$src = Join-Path $PSScriptRoot '.'
$dest = Join-Path $env:USERPROFILE 'Documents\agent-run-panel'
Write-Host "Copying project from: $src to: $dest"
if (Test-Path $dest) {
  Write-Host "Destination exists; removing old copy..."
  Remove-Item $dest -Recurse -Force
}
New-Item -ItemType Directory -Path $dest -Force | Out-Null
Get-ChildItem -Path $src -Force | ForEach-Object {
  $target = Join-Path $dest $_.Name
  if ($_.PSIsContainer) {
    Copy-Item -Path $_.FullName -Destination $target -Recurse -Force
  } else {
    Copy-Item -Path $_.FullName -Destination $target -Force
  }
}
Write-Host "Copy complete."
