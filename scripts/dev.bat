@echo off
REM Script de développement pour Windows
REM Usage: scripts\dev.bat [command]

setlocal enabledelayedexpansion

REM Vérifier que Docker est en cours d'exécution
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker n'est pas en cours d'execution. Veuillez demarrer Docker Desktop.
    exit /b 1
)

REM Créer le fichier .env s'il n'existe pas
if not exist .env (
    echo [INFO] Creation du fichier .env a partir de .env.example...
    copy .env.example .env >nul
    echo [WARNING] Veuillez modifier le fichier .env avec vos propres valeurs.
)

REM Traitement des commandes
if "%1"=="build" goto build
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="status" goto status
if "%1"=="logs" goto logs
if "%1"=="clean" goto clean
if "%1"=="reset-db" goto reset_db
goto help

:build
echo [INFO] Construction des images Docker...
docker-compose build --no-cache
echo [SUCCESS] Images construites avec succes !
goto end

:start
echo [INFO] Demarrage des services...
docker-compose up -d
echo [SUCCESS] Services demarres !
echo [INFO] Attente du demarrage des services...
timeout /t 10 /nobreak >nul
goto status

:stop
echo [INFO] Arret des services...
docker-compose down
echo [SUCCESS] Services arretes !
goto end

:restart
echo [INFO] Redemarrage des services...
call :stop
call :start
goto end

:status
echo [INFO] Etat des services :
docker-compose ps
echo.
echo [INFO] Verification de l'etat des services :

REM Vérifier les services
curl -sf http://localhost:3000/actuator/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] API : KO
) else (
    echo [SUCCESS] API : OK
)

curl -sf http://localhost:80/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Frontend : KO
) else (
    echo [SUCCESS] Frontend : OK
)
goto end

:logs
if "%2"=="" (
    echo [INFO] Logs de tous les services :
    docker-compose logs -f
) else (
    echo [INFO] Logs du service %2 :
    docker-compose logs -f %2
)
goto end

:clean
echo [WARNING] Nettoyage des conteneurs, images et volumes...
docker-compose down -v --rmi all --remove-orphans
docker system prune -f
echo [SUCCESS] Nettoyage termine !
goto end

:reset_db
echo [WARNING] Reinitialisation de la base de donnees...
docker-compose stop database
docker-compose rm -f database
docker volume rm mms_postgres_data 2>nul
docker-compose up -d database
echo [SUCCESS] Base de donnees reinitialisee !
goto end

:help
echo Usage: %0 [command]
echo.
echo Commandes disponibles :
echo   build     - Construire les images Docker
echo   start     - Demarrer tous les services
echo   stop      - Arreter tous les services
echo   restart   - Redemarrer tous les services
echo   status    - Afficher l'etat des services
echo   logs      - Afficher les logs (optionnel: nom du service)
echo   clean     - Nettoyer conteneurs, images et volumes
echo   reset-db  - Reinitialiser la base de donnees
echo   help      - Afficher cette aide

:end
endlocal
