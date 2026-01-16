#!/bin/bash

# Script de test pour la nouvelle API de vérification de conflits
# Usage: ./test-conflict-api.sh

BASE_URL="http://localhost:8080/api"

echo "=== Test de l'API de Vérification de Conflits ==="
echo ""

# Test 1: Vérifier les conflits pour un créneau libre
echo "Test 1: Vérification d'un créneau potentiellement libre"
curl -X POST "${BASE_URL}/timetables/check-conflicts" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": 1,
    "courseId": 1,
    "teacherId": 1,
    "classroomId": 1,
    "timeSlotId": 1
  }' | jq '.'

echo ""
echo "---"
echo ""

# Test 2: Vérifier les conflits pour un professeur déjà occupé
echo "Test 2: Vérification avec conflit de professeur"
curl -X POST "${BASE_URL}/timetables/check-conflicts" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": 2,
    "courseId": 2,
    "teacherId": 1,
    "classroomId": 2,
    "timeSlotId": 1
  }' | jq '.'

echo ""
echo "---"
echo ""

# Test 3: Vérifier les conflits pour une salle déjà occupée
echo "Test 3: Vérification avec conflit de salle"
curl -X POST "${BASE_URL}/timetables/check-conflicts" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": 3,
    "courseId": 3,
    "teacherId": 2,
    "classroomId": 1,
    "timeSlotId": 1
  }' | jq '.'

echo ""
echo "---"
echo ""

# Test 4: Vérifier les disponibilités des professeurs
echo "Test 4: Récupération des disponibilités des professeurs"
curl -X GET "${BASE_URL}/availabilities/teacher" | jq '.'

echo ""
echo "---"
echo ""

# Test 5: Vérifier les disponibilités des salles
echo "Test 5: Récupération des disponibilités des salles"
curl -X GET "${BASE_URL}/availabilities/classroom" | jq '.'

echo ""
echo "=== Fin des tests ==="
