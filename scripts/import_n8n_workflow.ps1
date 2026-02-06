<#
.SYNOPSIS
Import N8N workflow via REST API
Essaie plusieurs endpoints pour trouver celui qui fonctionne

.EXAMPLE
.\import_n8n_workflow.ps1 -WorkflowFile "n8n-workflows/coucou3.json" -ApiUrl "https://n8n.srv1289936.hstgr.cloud" -ApiKey "YOUR_JWT_TOKEN"
#>

param(
  [string]$WorkflowFile = "n8n-workflows/coucou3.json",
  [string]$ApiUrl = $env:N8N_API_URL,
  [string]$ApiKey = $env:N8N_API_KEY
)

if (-not $ApiUrl) {
  Write-Error "ApiUrl non défini. Passez -ApiUrl ou définissez N8N_API_URL"
  exit 1
}

if (-not $ApiKey) {
  Write-Error "ApiKey non défini. Passez -ApiKey ou définissez N8N_API_KEY"
  exit 1
}

if (-not (Test-Path $WorkflowFile)) {
  Write-Error "Fichier workflow introuvable: $WorkflowFile"
  exit 1
}

# Charger le workflow
$workflowJson = Get-Content -Raw $WorkflowFile
$workflowData = $workflowJson | ConvertFrom-Json

Write-Host "[WORKFLOW] $($workflowData.name)" -ForegroundColor Cyan
Write-Host "[API URL] $ApiUrl" -ForegroundColor Cyan
Write-Host "[TOKEN] $(($ApiKey.Substring(0,20)))..." -ForegroundColor Yellow

# Headers de base
$headers = @{
  "Content-Type"  = "application/json"
  "Authorization" = "Bearer $ApiKey"
}

# Endpoints à essayer (dans l'ordre)
$endpoints = @(
  "/api/v1/workflows/import",
  "/api/workflows/import",
  "/workflows/import",
  "/rest/api/v1/workflows",
  "/rest/workflows",
  "/workflows"
)

$success = $false
$lastError = ""

foreach ($endpoint in $endpoints) {
  $uri = $ApiUrl + $endpoint
  Write-Host "`n[TRY] POST $uri" -ForegroundColor Yellow
  
  try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $workflowJson -TimeoutSec 30
    
    if ($response.id -or $response.name -or $response.success -eq $true) {
      Write-Host "[SUCCESS] Import reussi!" -ForegroundColor Green
      Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Green
      $success = $true
      break
    } else {
      $lastError = $response | ConvertTo-Json -Depth 1
      Write-Host "[WARNING] Response received but unexpected format: $lastError" -ForegroundColor Yellow
    }
  } catch {
    $lastError = $_.Exception.Message
    Write-Host "[ERROR] $lastError" -ForegroundColor Red
  }
}

if (-not $success) {
  Write-Host "`n[WARNING] Impossible d'importer via API." -ForegroundColor Yellow
  Write-Host "`nAlternative: Import manuel via l'interface web:" -ForegroundColor Cyan
  Write-Host "1. Open $ApiUrl/editor"
  Write-Host "2. Click on 'Import from file'"
  Write-Host "3. Select file: $(Resolve-Path $WorkflowFile)"
  Write-Host "`nOr copy/paste the JSON directly from this file."
  
  Write-Host "`nWorkflow content (for manual copy):" -ForegroundColor Cyan
  Write-Host $workflowJson -ForegroundColor Gray
  
  exit 1
} else {
  Write-Host "`n[SUCCESS] Workflow '$($workflowData.name)' imported successfully!" -ForegroundColor Green
  exit 0
}
