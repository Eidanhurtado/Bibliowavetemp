#!/bin/bash

# 🚀 Script de Despliegue Automatizado para E-books Landing Page
# Este script configura y despliega tu landing page para recibir pagos reales

echo "🚀 Iniciando despliegue de E-books Landing Page..."
echo "==============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅ ÉXITO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️ ATENCIÓN]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌ ERROR]${NC} $1"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "index.html" ] || [ ! -f "package.json" ]; then
    print_error "No estás en el directorio correcto. Asegúrate de estar en la carpeta del proyecto."
    exit 1
fi

print_success "Archivos del proyecto encontrados"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Instálalo desde https://nodejs.org/"
    exit 1
fi

print_success "Node.js está instalado: $(node --version)"

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

print_success "npm está instalado: $(npm --version)"

# Instalar dependencias
print_status "Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencias instaladas correctamente"
else
    print_error "Error instalando dependencias"
    exit 1
fi

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI no está instalado. Instalando..."
    npm install -g vercel
    
    if [ $? -eq 0 ]; then
        print_success "Vercel CLI instalado correctamente"
    else
        print_error "Error instalando Vercel CLI"
        exit 1
    fi
else
    print_success "Vercel CLI ya está instalado: $(vercel --version)"
fi

# Verificar configuración de Stripe
print_status "Verificando configuración de Stripe..."

if grep -q "pk_live_TU_CLAVE_PUBLICA_AQUI" script.js; then
    print_warning "¡IMPORTANTE! Debes actualizar tu clave pública de Stripe en script.js"
    print_warning "Busca la línea: const STRIPE_PUBLIC_KEY = 'pk_live_TU_CLAVE_PUBLICA_AQUI';"
    print_warning "Y reemplázala con tu clave real de Stripe"
    echo ""
    read -p "¿Ya actualizaste tu clave de Stripe? (y/n): " stripe_updated
    
    if [ "$stripe_updated" != "y" ] && [ "$stripe_updated" != "Y" ]; then
        print_error "Por favor actualiza tu clave de Stripe antes de continuar"
        exit 1
    fi
fi

print_success "Configuración de Stripe verificada"

# Login a Vercel
print_status "Verificando login de Vercel..."
vercel whoami &> /dev/null

if [ $? -ne 0 ]; then
    print_warning "No estás logueado en Vercel. Iniciando login..."
    vercel login
    
    if [ $? -eq 0 ]; then
        print_success "Login exitoso en Vercel"
    else
        print_error "Error en el login de Vercel"
        exit 1
    fi
else
    print_success "Ya estás logueado en Vercel: $(vercel whoami)"
fi

# Desplegar
print_status "Desplegando proyecto en Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    print_success "¡Despliegue exitoso!"
    echo ""
    echo "🎉 ¡Tu landing page está lista!"
    echo "==============================================="
    
    # Obtener URL del proyecto
    PROJECT_URL=$(vercel ls --scope $(vercel whoami) | grep $(basename "$PWD") | awk '{print $2}' | head -1)
    
    if [ ! -z "$PROJECT_URL" ]; then
        echo "🌐 URL de tu landing page: https://$PROJECT_URL"
        echo "📄 Página de descarga: https://$PROJECT_URL/descarga.html"
        echo "🧪 Demo: https://$PROJECT_URL/demo.html"
    fi
    
    echo ""
    echo "📋 PRÓXIMOS PASOS IMPORTANTES:"
    echo "==============================================="
    echo "1. 🔑 Configura las variables de entorno en Vercel:"
    echo "   - Ve a tu proyecto en vercel.com"
    echo "   - Settings → Environment Variables"
    echo "   - Añade: STRIPE_SECRET_KEY = tu_clave_secreta"
    echo ""
    echo "2. 🧪 Prueba el sistema:"
    echo "   - Usa tarjeta de prueba: 4242 4242 4242 4242"
    echo "   - Verifica que los pagos lleguen a tu Stripe Dashboard"
    echo ""
    echo "3. 💰 Para pagos reales:"
    echo "   - Cambia a claves live en vez de test"
    echo "   - Activa tu cuenta de Stripe"
    echo ""
    echo "4. 📧 Configura webhooks (opcional):"
    echo "   - En Stripe: Developers → Webhooks"
    echo "   - URL: https://$PROJECT_URL/api/webhook"
    echo ""
    print_success "¡Todo listo para empezar a vender!"
    
else
    print_error "Error en el despliegue"
    echo ""
    echo "💡 Posibles soluciones:"
    echo "- Verifica tu conexión a internet"
    echo "- Asegúrate de estar logueado en Vercel"
    echo "- Revisa que no haya errores en el código"
    exit 1
fi

echo ""
echo "📚 Documentación disponible:"
echo "- README.md - Información general"
echo "- DESPLIEGUE.md - Guía detallada de despliegue"
echo "- FUNCIONAMIENTO.md - Cómo funciona el sistema"
echo ""
print_success "¡Despliegue completado! 🎉" 