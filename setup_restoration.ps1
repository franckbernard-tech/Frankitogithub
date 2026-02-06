# Script de Restauration Configuration IA
# Exécuter sur un nouveau PC pour restaurer l'environnement Frankito-IA
# Usage: .\setup_restoration.ps1

param(
    [switch]$Verbose = $false
)

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = $ScriptPath

Write-Host "=== Restauration Configuration Frankito-IA ===" -ForegroundColor Cyan
Write-Host "Chemin Projet: $ProjectRoot" -ForegroundColor Yellow

# Fonction utilitaire
function Write-Status {
    param([string]$Message, [string]$Status = "Info")
    $Colors = @{
        "Success" = "Green"
        "Error" = "Red"
        "Warning" = "Yellow"
        "Info" = "Cyan"
    }
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Colors[$Status]
}

# 1. Vérifier la structure des dossiers
Write-Status "Vérification de la structure..." "Info"
$RequiredFolders = @("n8n-skills", ".claude", ".git")
$RequiredFiles = @("AI_CONFIG.json", "README.md", "CLAUDE.md", ".mcp.json")

$FoldersOK = $true
foreach ($folder in $RequiredFolders) {
    $FolderPath = Join-Path $ProjectRoot $folder
    if (Test-Path $FolderPath) {
        Write-Status "✓ Dossier trouvé: $folder" "Success"
    } else {
        Write-Status "✗ Dossier manquant: $folder" "Warning"
        $FoldersOK = $false
    }
}

$FilesOK = $true
foreach ($file in $RequiredFiles) {
    $FilePath = Join-Path $ProjectRoot $file
    if (Test-Path $FilePath) {
        Write-Status "✓ Fichier trouvé: $file" "Success"
    } else {
        Write-Status "✗ Fichier manquant: $file" "Warning"
        $FilesOK = $false
    }
}

# 2. Charger la configuration AI_CONFIG.json
Write-Status "Chargement de la configuration..." "Info"
$ConfigPath = Join-Path $ProjectRoot "AI_CONFIG.json"
if (Test-Path $ConfigPath) {
    $Config = Get-Content $ConfigPath | ConvertFrom-Json
    Write-Status "Configuration chargée avec succès" "Success"
    Write-Status "Plateforme IA: $($Config.ai_configuration.name)" "Info"
} else {
    Write-Status "Impossible de charger AI_CONFIG.json" "Error"
}

# 3. Vérifier Git
Write-Status "Vérification Git..." "Info"
$GitPath = Join-Path $ProjectRoot ".git"
if (Test-Path $GitPath) {
    $GitBranch = git -C $ProjectRoot branch --show-current
    Write-Status "Repository Git activé (branche: $GitBranch)" "Success"
} else {
    Write-Status "Git repository non trouvé" "Warning"
}

# 4. Vérifier les fichiers de configuration critiques
Write-Status "Vérification fichiers de configuration..." "Info"
$MCPConfigPath = Join-Path $ProjectRoot ".mcp.json"
if (Test-Path $MCPConfigPath) {
    Write-Status "Configuration MCP trouvée" "Success"
} else {
    Write-Status "Configuration MCP manquante - création basique" "Warning"
    # Création d'une configuration MCP basique
    $MCPConfig = @{
        version = "1.0"
        workspace = $ProjectRoot
        timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }
    $MCPConfig | ConvertTo-Json | Set-Content -Path $MCPConfigPath
    Write-Status "Configuration MCP créée" "Info"
}

# 5. Résumé
Write-Host "`n=== Résumé de la Restauration ===" -ForegroundColor Cyan
Write-Host "Dossiers: $(if($FoldersOK) { '✓ OK' } else { '✗ Problèmes détectés' })" -ForegroundColor $(if($FoldersOK) { 'Green' } else { 'Yellow' })
Write-Host "Fichiers: $(if($FilesOK) { '✓ OK' } else { '✗ Problèmes détectés' })" -ForegroundColor $(if($FilesOK) { 'Green' } else { 'Yellow' })

Write-Host "`n=== Prochaines Étapes ===" -ForegroundColor Cyan
Write-Host "1. Ajouter les clés API/tokens dans .env (non versionné)"
Write-Host "2. Ouvrir le projet dans VS Code: code ."
Write-Host "3. Installer les extensions VS Code recommandées"
Write-Host "4. Tester la connexion avec l'IA"
Write-Host "5. Vérifier les workflows N8N"

Write-Status "Restauration complétée" "Success"
