#!/bin/sh

# Attente des services API et Frontend
wait-for api-prod:3000 -t 60
wait-for frontend-prod:5172 -t 60

# Lancement des tests Playwright
npx playwright test
