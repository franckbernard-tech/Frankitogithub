<#
.SYNOPSIS
Script de déploiement du bot Telegram sur VPS Hostinger

.DESCRIPTION
Déploie bot.js sur le VPS et redémarre le service

.PARAMETER VpsHost
Adresse du VPS (ex: vps-xxxxx.vps.ovh.net ou IP)

.PARAMETER VpsUser
Nom d'utilisateur SSH (généralement 'root' ou votre user)

.PARAMETER BotPath
Chemin distant où déployer le bot (défaut: /root/frankito-bot)

.EXAMPLE
.\deploy_bot.ps1 -VpsHost "123.45.67.89" -VpsUser "root"

.EXAMPLE
.\deploy_bot.ps1 -VpsHost "vps.example.com" -VpsUser "frankito" -BotPath "/home/frankito/bot"
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$VpsHost = $env:VPS_HOST,

    [Parameter(Mandatory=$false)]
    [string]$VpsUser = $env:VPS_USER,

    [Parameter(Mandatory=$false)]
    [string]$BotPath = "/root/frankito-bot",

    [Parameter(Mandatory=$false)]
    [string]$ServiceName = "frankito-bot"
)

# Vérifications
if (-not $VpsHost) {
    Write-Host "❌ VPS Host non défini" -ForegroundColor Red
    Write-Host "Usage: .\deploy_bot.ps1 -VpsHost <IP_OR_HOSTNAME> -VpsUser <USERNAME>" -ForegroundColor Yellow
    Write-Host "Ou définir les variables d'environnement VPS_HOST et VPS_USER" -ForegroundColor Yellow
    exit 1
}

if (-not $VpsUser) {
    Write-Host "❌ VPS User non défini" -ForegroundColor Red
    Write-Host "Usage: .\deploy_bot.ps1 -VpsHost <IP_OR_HOSTNAME> -VpsUser <USERNAME>" -ForegroundColor Yellow
    exit 1
}

$LocalBotPath = "n8n-skills/bot.js"
$LocalEnvPath = ".env"

if (-not (Test-Path $LocalBotPath)) {
    Write-Host "❌ Fichier bot.js introuvable: $LocalBotPath" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Déploiement du bot sur VPS" -ForegroundColor Cyan
Write-Host "📡 Host: $VpsHost" -ForegroundColor Cyan
Write-Host "👤 User: $VpsUser" -ForegroundColor Cyan
Write-Host "📁 Path: $BotPath" -ForegroundColor Cyan
Write-Host ""

# Vérifier si SSH fonctionne
Write-Host "[1/5] Test de connexion SSH..." -ForegroundColor Yellow
$sshTest = ssh -o ConnectTimeout=5 -o BatchMode=yes "$VpsUser@$VpsHost" "echo 'OK'" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Impossible de se connecter au VPS" -ForegroundColor Red
    Write-Host "Assurez-vous que:" -ForegroundColor Yellow
    Write-Host "  1. Votre clé SSH est configurée" -ForegroundColor Yellow
    Write-Host "  2. Le VPS est accessible" -ForegroundColor Yellow
    Write-Host "  3. Les credentials sont corrects" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Connexion SSH réussie" -ForegroundColor Green

# Créer le dossier distant si nécessaire
Write-Host "[2/5] Création du dossier distant..." -ForegroundColor Yellow
ssh "$VpsUser@$VpsHost" "mkdir -p $BotPath"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la création du dossier" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dossier créé/vérifié" -ForegroundColor Green

# Copier bot.js
Write-Host "[3/5] Upload de bot.js..." -ForegroundColor Yellow
scp $LocalBotPath "$VpsUser@$VpsHost`:$BotPath/bot.js"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'upload de bot.js" -ForegroundColor Red
    exit 1
}

Write-Host "✅ bot.js uploadé" -ForegroundColor Green

# Copier .env si existe
if (Test-Path $LocalEnvPath) {
    Write-Host "[4/5] Upload de .env..." -ForegroundColor Yellow
    scp $LocalEnvPath "$VpsUser@$VpsHost`:$BotPath/.env"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ .env uploadé" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Erreur lors de l'upload de .env (non critique)" -ForegroundColor Yellow
    }
} else {
    Write-Host "[4/5] Pas de .env local (skip)" -ForegroundColor Yellow
}

# Redémarrer le service
Write-Host "[5/5] Redémarrage du service..." -ForegroundColor Yellow

# Essayer plusieurs méthodes de redémarrage
$restartCommands = @(
    "pm2 restart $ServiceName",
    "pm2 restart bot",
    "systemctl restart $ServiceName",
    "cd $BotPath && pm2 restart bot.js",
    "killall node && cd $BotPath && nohup node bot.js &"
)

$serviceRestarted = $false

foreach ($cmd in $restartCommands) {
    Write-Host "  Tentative: $cmd" -ForegroundColor Gray
    ssh "$VpsUser@$VpsHost" $cmd 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Service redémarré avec succès" -ForegroundColor Green
        $serviceRestarted = $true
        break
    }
}

if (-not $serviceRestarted) {
    Write-Host "⚠️ Le service n'a pas pu être redémarré automatiquement" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Connectez-vous au VPS et redémarrez manuellement:" -ForegroundColor Yellow
    Write-Host "  ssh $VpsUser@$VpsHost" -ForegroundColor Cyan
    Write-Host "  cd $BotPath" -ForegroundColor Cyan
    Write-Host "  pm2 restart bot" -ForegroundColor Cyan
    Write-Host "  # ou" -ForegroundColor Cyan
    Write-Host "  node bot.js" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host ""
Write-Host "🎉 Déploiement terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "Pour vérifier les logs:" -ForegroundColor Cyan
Write-Host "  ssh $VpsUser@$VpsHost 'pm2 logs $ServiceName'" -ForegroundColor White
Write-Host ""
Write-Host "Pour vérifier le statut:" -ForegroundColor Cyan
Write-Host "  ssh $VpsUser@$VpsHost 'pm2 status'" -ForegroundColor White
