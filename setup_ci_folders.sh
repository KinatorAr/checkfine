#!/bin/bash
# Este script crea la estructura de carpetas necesaria para el CI/CD.

echo "Creando estructura de carpetas para CI/CD..."

# 1. Crear el directorio principal de los scripts
mkdir -p CI-CD/{environment-setup,tests,deployment-scripts}

# 2. Crear los archivos de scripts vacíos (para llenarlos después)
touch CI-CD/environment-setup/provision_staging.sh
touch CI-CD/tests/run_e2e_tests.sh
touch CI-CD/deployment-scripts/distribute_staging.sh

# 3. Dar permisos de ejecución a los scripts
chmod +x CI-CD/environment-setup/provision_staging.sh
chmod +x CI-CD/tests/run_e2e_tests.sh
chmod +x CI-CD/deployment-scripts/distribute_staging.sh

# 4. Crear el directorio para GitHub Actions
mkdir -p .github/workflows

# 5. Crear el archivo del pipeline (vacío por ahora)
touch .github/workflows/main-ci-cd.yml

echo "✅ Estructura creada con éxito."
echo "Recuerda llenar los archivos .sh y .yml con el contenido que te compartí."
