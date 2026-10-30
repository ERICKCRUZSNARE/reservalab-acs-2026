param([string]$ProjectKey = "reservalab-dev")
$ErrorActionPreference = "Stop"
if (-not $env:SONAR_TOKEN) { throw "Define SONAR_TOKEN como variable de entorno de tu sesión." }
if ($ProjectKey -notmatch '^reservalab-(dev|qa|prod)$') { throw "ProjectKey no válido" }
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
# El scanner corre en Windows; solo el servidor SonarQube permanece en Docker.
$sonarUrl = $env:SONAR_HOST_URL
if (-not $sonarUrl) { $sonarUrl = "http://localhost:9000" }
Push-Location $root
try {
  & npx.cmd --yes '@sonar/scan@5.0.2' "-Dsonar.host.url=$sonarUrl" "-Dsonar.projectKey=$ProjectKey" "-Dsonar.qualitygate.wait=true"
  if ($LASTEXITCODE -ne 0) { throw "SonarScanner o el Quality Gate fallaron ($LASTEXITCODE)." }
} finally {
  Pop-Location
}
