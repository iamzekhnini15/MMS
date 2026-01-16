# Script PowerShell pour vérifier les logs et le status Azure Web App

$RESOURCE_GROUP = "mms-app"
$WEBAPP_NAME = "mms-staging-app"

Write-Host "=== Checking Web App Status ===" -ForegroundColor Cyan
az webapp show --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --query "state" -o tsv

Write-Host "`n=== Checking Container Settings ===" -ForegroundColor Cyan
az webapp config container show --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP

Write-Host "`n=== Checking Environment Variables ===" -ForegroundColor Cyan
az webapp config appsettings list --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --query "[].{Name:name, Value:value}" -o table

Write-Host "`n=== Fetching Application Logs (last 100 lines) ===" -ForegroundColor Cyan
az webapp log tail --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --logs application

Write-Host "`n=== To stream logs continuously, run: ===" -ForegroundColor Yellow
Write-Host "az webapp log tail --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP"
