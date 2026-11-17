# Import independently reviewed official directory rows into Poth.
# Not a scraper: uses an explicit CSV supplied by project team. No auto-verification.
param(
  [Parameter(Mandatory=$true)][string]$CsvPath
)
$ErrorActionPreference = "Stop"
$repo = (git rev-parse --show-toplevel).Trim()
if (!$repo) { throw "Not inside a Git repository" }
if ((git branch --show-current).Trim() -ne "iftee") { throw "Wrong branch. Expected iftee." }
Set-Location $repo
$csvFull = (Resolve-Path -LiteralPath $CsvPath).Path
$rows = @(Import-Csv -LiteralPath $csvFull -Encoding UTF8)
if ($rows.Count -lt 1) { throw "CSV has no rows. Nothing changed." }
$required = @("id","name","district","address","sourceUrl","lastReviewedAt")
foreach ($column in $required) {
  if (!($rows[0].PSObject.Properties.Name -contains $column)) { throw "Missing CSV column: $column" }
}
$districtData = Get-Content "src\features\poth\bdDistricts.ts" -Raw -Encoding UTF8
$validDistricts = @()
foreach ($match in [regex]::Matches($districtData, '"([^"]+)"')) {
  $validDistricts += $match.Groups[1].Value
}
$validDistricts = @($validDistricts | Select-Object -Unique)
$items = @()
$seen = @{}
foreach ($row in $rows) {
  $id = ([string]$row.id).Trim()
  $name = ([string]$row.name).Trim()
  $district = ([string]$row.district).Trim()
  $address = ([string]$row.address).Trim()
  $source = ([string]$row.sourceUrl).Trim()
  $reviewed = ([string]$row.lastReviewedAt).Trim()
  $uuid = [guid]::Empty
  if (![guid]::TryParse($id, [ref]$uuid) -or $uuid -eq [guid]::Empty) { throw "Invalid UUID: $id" }
  if ($seen.ContainsKey($id)) { throw "Duplicate record: $id" }
  $seen[$id] = $true
  if ($name.Length -lt 1 -or $name.Length -gt 300) { throw "Invalid name for $id" }
  if ($address.Length -lt 1 -or $address.Length -gt 500) { throw "Invalid address for $id" }
  if (!($validDistricts -contains $district)) { throw "Invalid district '$district' for $id" }
  $u = $null
  if (![Uri]::TryCreate($source, [UriKind]::Absolute, [ref]$u) -or $u.Scheme -ne "https") {
    throw "Invalid HTTPS source for $id"
  }
  $d = [datetimeoffset]::MinValue
  if (![datetimeoffset]::TryParse($reviewed, [ref]$d)) { throw "Invalid timestamp for $id" }
  $items += [ordered]@{
    id = $id
    name = $name
    district = $district
    address = $address
    sourceUrl = $source
    lastReviewedAt = $d.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    services = @()
    accessibility = @()
    contacts = @()
    bookingIntegration = "not_integrated"
  }
}
$outputFile = "src\features\poth\facilities.json"
$backup = "$outputFile.bak"
if (Test-Path $outputFile) { Copy-Item $outputFile $backup -Force }
$json = ConvertTo-Json -InputObject $items -Depth 12
[System.IO.File]::WriteAllText((Join-Path $repo $outputFile), $json + "`n", (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Imported $($items.Count) source-linked facility directory rows." -ForegroundColor Green
Write-Host "Services, accessibility and contacts intentionally left unverified."
Write-Host "Next: npm run typecheck; npm run lint; preview /api/poth/facilities"
