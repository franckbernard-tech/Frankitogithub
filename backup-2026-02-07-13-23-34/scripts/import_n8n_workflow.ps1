<#
.SYNOPSIS
Import N8N workflow via REST API using X-N8N-API-KEY header

.EXAMPLE
.\import_n8n_workflow.ps1 -WorkflowFile "n8n-workflows/coucou3.json" -ApiUrl "https://n8n.srv1289936.hstgr.cloud" -ApiKey "YOUR_JWT_TOKEN"
#>

param(
  [string]$WorkflowFile = "n8n-workflows/coucou3.json",
  [string]$ApiUrl = $env:N8N_API_URL,
  [string]$ApiKey = $env:N8N_API_KEY
)

if (-not $ApiUrl) {
  Write-Error "ApiUrl non defini. Passez -ApiUrl ou definissez N8N_API_URL"
  exit 1
}

if (-not $ApiKey) {
  Write-Error "ApiKey non defini. Passez -ApiKey ou definissez N8N_API_KEY"
  exit 1
}

if (-not (Test-Path $WorkflowFile)) {
  Write-Error "Fichier workflow introuvable: $WorkflowFile"
  exit 1
}

# Charger le workflow
Write-Host "[LOAD] Chargement du workflow: $WorkflowFile" -ForegroundColor Cyan
$workflowData = Get-Content $WorkflowFile | ConvertFrom-Json

Write-Host "[WORKFLOW] $($workflowData.name)" -ForegroundColor Cyan
Write-Host "[API URL] $ApiUrl/api/v1/workflows" -ForegroundColor Cyan
Write-Host "[TOKEN] $(($ApiKey.Substring(0,20)))..." -ForegroundColor Yellow

# Preparer le payload pour l'API n8n
# Retirer la propriete "active" (read-only)
$workflowData.PSObject.Properties.Remove("active")

# Ajouter les settings (requis par l'API)
$workflowData | Add-Member -NotePropertyName "settings" -NotePropertyValue @{} -Force

# Convertir en JSON
$payloadJson = $workflowData | ConvertTo-Json -Depth 10

# Headers avec X-N8N-API-KEY
$headers = @{
  "X-N8N-API-KEY" = $ApiKey
  "Content-Type"  = "application/json"
}

# Envoyer le workflow
$uri = "$ApiUrl/api/v1/workflows"

Write-Host "`n[SEND] Envoi du workflow vers $uri" -ForegroundColor Yellow

try {
  $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $payloadJson -TimeoutSec 30
  
  if ($response.id) {
    Write-Host "[SUCCESS] Workflow publie avec succes!" -ForegroundColor Green
    Write-Host "ID Workflow: $($response.id)" -ForegroundColor Green
    Write-Host "Nom: $($response.name)" -ForegroundColor Green
    Write-Host "Statut: $(if($response.active) { 'ACTIF' } else { 'INACTIF' })" -ForegroundColor Green
    Write-Host "URL: $ApiUrl/editor/$($response.id)" -ForegroundColor Cyan
    exit 0
  } else {
    Write-Host "[ERROR] Reponse inattendue: $($response | ConvertTo-Json)" -ForegroundColor Red
    exit 1
  }
} catch {
  $errorMsg = $_.Exception.Message
  Write-Host "[ERROR] Echec de l'envoi: $errorMsg" -ForegroundColor Red
  
  # Afficher les details de l'erreur si disponibles
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "[ERROR DETAILS] $errorBody" -ForegroundColor Red
  }
  
  exit 1
}
