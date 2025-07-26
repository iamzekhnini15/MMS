#!/bin/sh

# Attente des services API et Frontend
./wait-for.sh api-prod:3000 -t 60
./wait-for.sh frontend-prod:5172 -t 60

# Lancement des tests Playwright
npx playwright test
