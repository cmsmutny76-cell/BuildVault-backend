$projectRoot = Split-Path -Parent $PSScriptRoot
$targetPath = Join-Path $projectRoot 'buildvault-start-web-platform.bat'
$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath 'BuildVault Internet Platform.lnk'

if (-not (Test-Path $targetPath)) {
    Write-Error "Launcher not found: $targetPath"
    exit 1
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.WorkingDirectory = $projectRoot
$shortcut.IconLocation = "$env:SystemRoot\System32\SHELL32.dll,220"
$shortcut.Description = 'Launch BuildVault internet platform (backend + web)'
$shortcut.Save()

Write-Host "Desktop shortcut created: $shortcutPath"
