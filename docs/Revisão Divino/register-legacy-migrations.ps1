param(
  [Parameter(Mandatory = $true)]
  [string]$DatabaseUrl,

  [Parameter(Mandatory = $true)]
  [ValidateSet("IBEMA")]
  [string]$ConfirmTarget
)

$ErrorActionPreference = "Stop"

if ($ConfirmTarget -ne "IBEMA") {
  throw "Use -ConfirmTarget IBEMA para confirmar o banco de destino."
}

if (-not (Test-Path -LiteralPath "prisma/migrations")) {
  throw "Execute este script na raiz do repositorio CeleriFlow."
}

$env:DATABASE_URL = $DatabaseUrl
$env:DATABASE_URL_UNPOOLED = $DatabaseUrl

$migrations = Get-ChildItem -LiteralPath "prisma/migrations" -Directory |
  Sort-Object -Property Name

foreach ($migration in $migrations) {
  Write-Host "Registrando $($migration.Name)..."
  & npx prisma migrate resolve --applied $migration.Name
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao registrar $($migration.Name)."
  }
}

& npx prisma migrate status
if ($LASTEXITCODE -ne 0) {
  throw "O historico foi registrado, mas prisma migrate status encontrou erro."
}

Write-Host "Historico legado registrado no banco de Ibema."
