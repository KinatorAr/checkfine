#!/bin/bash
set -e
echo "Iniciando pruebas End-to-End (E2E) en el entorno de Staging..."

# 🚨 AJUSTAR ESTE BLOQUE 🚨
# Aquí debe ir el comando para ejecutar tu framework de pruebas E2E.

# Ejemplo con Cypress (ejecutado en el runner de CI/CD):
# export STAGING_API_URL="https://api.staging.tudominio.com"
# npx cypress run --env apiUrl=$STAGING_API_URL --spec 'cypress/e2e/staging_tests/*.cy.js'

# Verifica que el comando de pruebas retorne 0 (éxito)
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Las pruebas E2E fallaron."
    exit 1
else
    echo "✅ Todas las pruebas E2E en Staging pasaron."
fi
