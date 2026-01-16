# Script pour résoudre rapidement le 502 sur Azure

$RESOURCE_GROUP = "mms-app"
$WEBAPP_NAME = "mms-staging-app"

Write-Host "=== 🔧 DIAGNOSTIC ET RÉSOLUTION 502 BAD GATEWAY ===" -ForegroundColor Cyan

# 1. Vérifier le statut
Write-Host "`n📊 Statut de l'application:" -ForegroundColor Yellow
az webapp show --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --query "{State:state, DefaultHostName:defaultHostName}" -o table

# 2. Vérifier les variables d'environnement
Write-Host "`n🔐 Variables d'environnement actuelles:" -ForegroundColor Yellow
$settings = az webapp config appsettings list --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP | ConvertFrom-Json

$required = @("SPRING_DATASOURCE_URL", "SPRING_DATASOURCE_USERNAME", "SPRING_DATASOURCE_PASSWORD")
$missing = @()

foreach ($var in $required) {
    $exists = $settings | Where-Object { $_.name -eq $var }
    if ($exists) {
        Write-Host "  ✅ $var : CONFIGURÉ" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $var : MANQUANT" -ForegroundColor Red
        $missing += $var
    }
}

if ($missing.Count -gt 0) {
    Write-Host "`n⚠️  PROBLÈME DÉTECTÉ: Variables manquantes!" -ForegroundColor Red
    Write-Host "Vous devez configurer:" -ForegroundColor Yellow
    foreach ($var in $missing) {
        Write-Host "  - $var" -ForegroundColor Red
    }
    Write-Host "`nCommande pour les configurer:" -ForegroundColor Yellow
    Write-Host "az webapp config appsettings set --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --settings SPRING_DATASOURCE_URL='jdbc:postgresql://VOTRE-SERVER.postgres.database.azure.com:5432/mms_staging_db?sslmode=require' SPRING_DATASOURCE_USERNAME='votre_username' SPRING_DATASOURCE_PASSWORD='votre_password'" -ForegroundColor Cyan
}

# 3. Activer les logs
Write-Host "`n📝 Activation des logs détaillés..." -ForegroundColor Yellow
az webapp log config --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --application-logging filesystem --detailed-error-messages true --failed-request-tracing true --web-server-logging filesystem --only-show-errors

# 4. Redémarrer l'application
Write-Host "`n🔄 Voulez-vous redémarrer l'application? (O/N)" -ForegroundColor Yellow
$restart = Read-Host

if ($restart -eq "O" -or $restart -eq "o") {
    Write-Host "Redémarrage en cours..." -ForegroundColor Cyan
    az webapp restart --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP
    Write-Host "✅ Application redémarrée!" -ForegroundColor Green
    Write-Host "Attendez 30-60 secondes que les conteneurs démarrent..." -ForegroundColor Yellow
}

# 5. Voir les logs
Write-Host "`n📋 Voulez-vous voir les logs en temps réel? (O/N)" -ForegroundColor Yellow
$showLogs = Read-Host

if ($showLogs -eq "O" -or $showLogs -eq "o") {
    Write-Host "Affichage des logs (Ctrl+C pour arrêter)..." -ForegroundColor Cyan
    az webapp log tail --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP
}

Write-Host "`n=== ✅ PROCHAINES ÉTAPES ===" -ForegroundColor Green
Write-Host "1. Testez votre application: https://$WEBAPP_NAME-fkc3avdseqhbe7a4.centralus-01.azurewebsites.net"
Write-Host "2. Si le problème persiste, consultez: TROUBLESHOOTING-502.md"
Write-Host "3. Pour accéder à la BD: consultez AZURE-DATABASE-ACCESS.md"
