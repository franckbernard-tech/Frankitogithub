<#
Importe un workflow n8n depuis le fichier n8n-workflows/coucou3.json
Usage:
  powershell -File .\scripts\import_workflow.ps1 -ApiUrl "https://votre-n8n" -ApiKey "VOTRE_TOKEN"
Ou définir les variables d'environnement `N8N_API_URL` et `N8N_API_KEY`.
#>

param(
  [string]$ApiUrl = $env:N8N_API_URL,
  [string]$ApiKey = $env:N8N_API_KEY,
  [string]$WorkflowFile = "n8n-workflows/coucou3.json"
)

if (-not $ApiUrl) {
  Write-Error "ApiUrl non défini. Passez -ApiUrl ou définissez N8N_API_URL"
  exit 1
}

if (-not (Test-Path $WorkflowFile)) {
  Write-Error "Fichier workflow introuvable: $WorkflowFile"
  exit 1
}

$workflowJson = Get-Content $WorkflowFile -Raw

$headers = @{
  "Content-Type" = "application/json"
}
if ($ApiKey) {
  $headers.Add("Authorization", "Bearer $ApiKey")
}

$uri = "$ApiUrl/workflows"

Write-Host "Envoi du workflow vers: $uri"
try {
  $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $workflowJson -TimeoutSec 30
  Write-Host "Import OK" -ForegroundColor Green
  Write-Output $response
} catch {
  Write-Error "Erreur lors de l'import: $_"
  exit 2
}
