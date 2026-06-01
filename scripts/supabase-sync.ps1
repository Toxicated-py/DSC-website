param(
  [ValidateSet("status", "local-reset", "pull-schema", "push-schema", "dump-public-data", "restore-public-data")]
  [string]$Mode = "status",
  [switch]$Yes
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

function Invoke-Supabase {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$SupabaseArgs)

  & npx supabase @SupabaseArgs
  if ($LASTEXITCODE -ne 0) {
    throw "Supabase command failed: supabase $($SupabaseArgs -join ' ')"
  }
}

function Confirm-Action {
  param(
    [string]$Message,
    [string]$Expected
  )

  if ($Yes) {
    return
  }

  Write-Host ""
  Write-Host $Message -ForegroundColor Yellow
  $answer = Read-Host "Type '$Expected' to continue"
  if ($answer -ne $Expected) {
    throw "Cancelled."
  }
}

function Get-LocalDbContainer {
  $containerId = docker ps --filter "name=supabase_db_" --format "{{.ID}}" | Select-Object -First 1
  if (-not $containerId) {
    throw "Local Supabase database container is not running. Run npm run supabase:start first."
  }
  return $containerId
}

$dataDumpPath = Join-Path $root "supabase\.temp\remote-public-data.sql"

switch ($Mode) {
  "status" {
    Invoke-Supabase status
  }

  "local-reset" {
    Invoke-Supabase start
    Invoke-Supabase db reset
    Invoke-Supabase status
    Write-Host ""
    Write-Host "Local database is rebuilt from committed migrations and seed.sql." -ForegroundColor Green
  }

  "pull-schema" {
    Invoke-Supabase link --project-ref oiqsxwzlgdfyselcpnco
    $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Invoke-Supabase db pull "remote_schema_sync_$stamp"
    Invoke-Supabase db reset
    Write-Host ""
    Write-Host "Pulled remote schema into a new migration and rebuilt local Supabase." -ForegroundColor Green
  }

  "push-schema" {
    Confirm-Action `
      -Message "This will apply local migration files to the linked hosted Supabase project. It does not push local data." `
      -Expected "PUSH SCHEMA"

    Invoke-Supabase link --project-ref oiqsxwzlgdfyselcpnco
    Invoke-Supabase db push
  }

  "dump-public-data" {
    Confirm-Action `
      -Message "This will copy data from the hosted public schema into supabase/.temp. Do not use real private user data for local testing." `
      -Expected "DUMP PUBLIC DATA"

    New-Item -ItemType Directory -Force -Path (Split-Path $dataDumpPath) | Out-Null
    Invoke-Supabase link --project-ref oiqsxwzlgdfyselcpnco
    Invoke-Supabase db dump --linked --data-only --schema public --file $dataDumpPath
    Write-Host ""
    Write-Host "Remote public data dumped to $dataDumpPath" -ForegroundColor Green
    Write-Host "Run npm run sync:restore-public-data to load it into local Supabase."
  }

  "restore-public-data" {
    if (-not (Test-Path $dataDumpPath)) {
      throw "No data dump found at $dataDumpPath. Run npm run sync:dump-public-data first."
    }

    Confirm-Action `
      -Message "This will import supabase/.temp/remote-public-data.sql into the running local Supabase database." `
      -Expected "RESTORE PUBLIC DATA"

    $containerId = Get-LocalDbContainer
    Get-Content -Raw $dataDumpPath | docker exec -i $containerId psql -U postgres -d postgres -v ON_ERROR_STOP=1
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to restore public data into local Supabase."
    }

    Write-Host ""
    Write-Host "Public data restored into local Supabase." -ForegroundColor Green
  }
}
