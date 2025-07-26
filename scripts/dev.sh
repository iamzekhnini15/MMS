#!/bin/bash

# Script de développement pour MMS
# Usage: ./scripts/dev.sh [command]

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Docker est en cours d'exécution
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop."
        exit 1
    fi
}

# Créer le fichier .env s'il n'existe pas
setup_env() {
    if [ ! -f .env ]; then
        log_info "Création du fichier .env à partir de .env.example..."
        cp .env.example .env
        log_warning "Veuillez modifier le fichier .env avec vos propres valeurs."
    fi
}

# Build des images
build() {
    log_info "Construction des images Docker..."
    docker-compose build --no-cache
    log_success "Images construites avec succès !"
}

# Démarrage des services
start() {
    log_info "Démarrage des services..."
    docker-compose up -d
    log_success "Services démarrés !"
    
    log_info "Attente du démarrage des services..."
    sleep 10
    
    # Vérifier l'état des services
    status
}

# Arrêt des services
stop() {
    log_info "Arrêt des services..."
    docker-compose down
    log_success "Services arrêtés !"
}

# Redémarrage des services
restart() {
    log_info "Redémarrage des services..."
    stop
    start
}

# État des services
status() {
    log_info "État des services :"
    docker-compose ps
    
    echo ""
    log_info "Vérification de l'état des services :"
    
    # Vérifier la base de données
    if docker-compose exec -T database pg_isready -U mms_user -d mms > /dev/null 2>&1; then
        log_success "Base de données : OK"
    else
        log_error "Base de données : KO"
    fi
    
    # Vérifier l'API
    if curl -sf http://localhost:3000/actuator/health > /dev/null 2>&1; then
        log_success "API : OK"
    else
        log_error "API : KO"
    fi
    
    # Vérifier le frontend
    if curl -sf http://localhost:80/health > /dev/null 2>&1; then
        log_success "Frontend : OK"
    else
        log_error "Frontend : KO"
    fi
}

# Logs des services
logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        log_info "Logs du service $service :"
        docker-compose logs -f "$service"
    else
        log_info "Logs de tous les services :"
        docker-compose logs -f
    fi
}

# Nettoyage
clean() {
    log_warning "Nettoyage des conteneurs, images et volumes..."
    docker-compose down -v --rmi all --remove-orphans
    docker system prune -f
    log_success "Nettoyage terminé !"
}

# Réinitialisation de la base de données
reset_db() {
    log_warning "Réinitialisation de la base de données..."
    docker-compose stop database
    docker-compose rm -f database
    docker volume rm mms_postgres_data 2>/dev/null || true
    docker-compose up -d database
    log_success "Base de données réinitialisée !"
}

# Aide
help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commandes disponibles :"
    echo "  build     - Construire les images Docker"
    echo "  start     - Démarrer tous les services"
    echo "  stop      - Arrêter tous les services"
    echo "  restart   - Redémarrer tous les services"
    echo "  status    - Afficher l'état des services"
    echo "  logs      - Afficher les logs (optionnel: nom du service)"
    echo "  clean     - Nettoyer conteneurs, images et volumes"
    echo "  reset-db  - Réinitialiser la base de données"
    echo "  help      - Afficher cette aide"
}

# Main
main() {
    check_docker
    setup_env
    
    case "${1:-help}" in
        build)
            build
            ;;
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        status)
            status
            ;;
        logs)
            logs "$2"
            ;;
        clean)
            clean
            ;;
        reset-db)
            reset_db
            ;;
        help|*)
            help
            ;;
    esac
}

main "$@"
