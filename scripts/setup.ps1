$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
$version = (& node -v)
if ($LASTEXITCODE -ne 0 -or $version -notmatch '^v24\.') { throw "Instala Node.js 24 LTS y abre de nuevo PowerShell." }
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
npm ci
if ($LASTEXITCODE -ne 0) { throw "No se pudieron instalar las dependencias." }
npm run build
if ($LASTEXITCODE -ne 0) { throw "Falló la compilación." }
Write-Host "Listo. Ejecuta npm run dev y abre http://localhost:5173" -ForegroundColor Green
