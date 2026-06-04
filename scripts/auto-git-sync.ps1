param(
  [int]$IntervalSeconds = 30,
  [string]$Branch = "main",
  [string]$MessagePrefix = "Auto sync"
)

$ErrorActionPreference = "Stop"
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $projectRoot

Write-Host "Auto GitHub sync aktif untuk $projectRoot"
Write-Host "Interval: $IntervalSeconds detik"
Write-Host "Branch: $Branch"
Write-Host "Tekan Ctrl+C untuk berhenti."

while ($true) {
  try {
    $changes = git status --porcelain

    if ($changes) {
      $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
      $message = "$MessagePrefix - $timestamp"

      Write-Host ""
      Write-Host "Perubahan terdeteksi. Commit dan push..."

      git add -A

      $stagedChanges = git diff --cached --name-only
      if ($stagedChanges) {
        git commit -m $message
        git push origin $Branch
        Write-Host "Selesai push: $message"
      } else {
        Write-Host "Tidak ada perubahan yang bisa di-commit."
      }
    }
  } catch {
    Write-Host "Auto-sync gagal: $($_.Exception.Message)"
    Write-Host "Coba lagi pada interval berikutnya."
  }

  Start-Sleep -Seconds $IntervalSeconds
}
