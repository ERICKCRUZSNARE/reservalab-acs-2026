param([string]$ProjectKey = "reservalab-dev")
$ErrorActionPreference = "Stop"
if (-not $env:SONAR_TOKEN) { throw "Define SONAR_TOKEN como variable de entorno de tu sesión." }
if ($ProjectKey -notmatch '^reservalab-(dev|qa|prod)$') { throw "ProjectKey no válido" }
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
# Docker Desktop utiliza este nombre para llegar al SonarQube del equipo Windows.
$sonarUrl = "http://host.docker.internal:9000"
docker run --rm -e SONAR_TOKEN -v "${root}:/usr/src" sonarsource/sonar-scanner-cli:latest "-Dsonar.host.url=$sonarUrl" "-Dsonar.projectKey=$ProjectKey" "-Dsonar.qualitygate.wait=true"
if ($LASTEXITCODE -ne 0) { throw "SonarScanner o el Quality Gate fallaron ($LASTEXITCODE)." }
