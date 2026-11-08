$ErrorActionPreference = 'Stop'

# Prefer Android Studio's JDK over an unrelated system Java installation.
if (-not $env:JAVA_HOME) {
    $studioJdk = Join-Path $env:ProgramFiles 'Android/Android Studio/jbr'
    if (Test-Path -LiteralPath (Join-Path $studioJdk 'bin/java.exe')) { $env:JAVA_HOME = $studioJdk }
}
if (-not $env:ANDROID_HOME) {
    $installedSdk = Join-Path $env:LOCALAPPDATA 'Android/Sdk'
    if (Test-Path -LiteralPath $installedSdk) { $env:ANDROID_HOME = $installedSdk }
}

Push-Location $PSScriptRoot
try {
    & .\gradlew.bat --no-daemon --console=plain :app:assembleDebug
    if ($LASTEXITCODE -ne 0) { throw 'La compilation Android a échoué.' }
    $apkSource = Join-Path $PSScriptRoot 'app/build/outputs/apk/debug/app-debug.apk'
    $metadata = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'app/build/outputs/apk/debug/output-metadata.json') -Raw | ConvertFrom-Json
    $artifactDirectory = Join-Path (Split-Path $PSScriptRoot -Parent) 'artifacts'
    New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
    $destination = Join-Path $artifactDirectory "Callisthenut-$($metadata.elements[0].versionName)-debug.apk"
    Copy-Item -LiteralPath $apkSource -Destination $destination -Force
    $hash = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant()
    "$hash  $(Split-Path $destination -Leaf)" | Set-Content -LiteralPath "$destination.sha256" -Encoding ascii
    Write-Output "APK prêt : $destination"
} finally { Pop-Location }
