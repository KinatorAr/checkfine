#!/bin/bash
set -e
# --- 🚨 AJUSTAR VARIABLES AQUÍ 🚨 ---
FIREBASE_APP_ID="REEMPLAZAR_CON_TU_FIREBASE_APP_ID" # Ejemplo: 1:1234567890:ios:abcdef123456
TESTER_GROUPS="qa-team, stakeholders" # Grupos de testers separados por coma

ANDROID_APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
IOS_IPA_PATH="ios/build/YourApp.ipa"

echo "Iniciando distribución a testers (Firebase App Distribution)..."

# Distribución de Android
if [ -f "$ANDROID_APK_PATH" ]; then
    echo "Distribuyendo Android APK..."
    # Se asume que la CLI de Firebase está instalada en el runner de CI/CD
    firebase appdistribution:distribute "$ANDROID_APK_PATH" \
      --app "$FIREBASE_APP_ID" \
      --groups "$TESTER_GROUPS" \
      --release-notes "Build de Staging $CI_COMMIT_SHA para pruebas E2E."
fi

echo "✅ Distribución a Staging completada."
