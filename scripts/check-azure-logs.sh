#!/bin/bash
# Script to check Azure Web App logs and status

RESOURCE_GROUP="mms-app"
WEBAPP_NAME="mms-staging-app"

echo "=== Checking Web App Status ==="
az webapp show --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --query "state" -o tsv

echo -e "\n=== Checking Container Settings ==="
az webapp config container show --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP

echo -e "\n=== Fetching Application Logs (last 100 lines) ==="
az webapp log tail --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --logs application

echo -e "\n=== Checking Environment Variables ==="
az webapp config appsettings list --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --query "[].{Name:name, Value:value}" -o table

echo -e "\n=== To stream logs continuously, run: ==="
echo "az webapp log tail --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP"
