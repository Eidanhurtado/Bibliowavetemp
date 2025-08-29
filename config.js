// Configuración de la aplicación
const CONFIG = {
    // Credenciales de Stripe (reemplazar con las tuyas)
    stripe: {
        // Clave pública de Stripe (segura para el frontend)
        publicKey: 'pk_live_51RgSxhH8lUWRe8kSiXZ5ZQLd97mKaKWEUkdGZsW1y1Ig8jBqNyySElabg5eHQayO85DTmUzz02STX9zW7lICrWub00yYPci4nP',
        // Para producción usar: pk_live_...
    },
    
    // Configuración de productos
    currency: 'EUR',
    defaultPrice: 4.99,
    
    // URLs del servidor (cuando tengas un backend)
    api: {
        baseUrl: 'https://tu-servidor.com/api', // CAMBIAR POR TU SERVIDOR
        endpoints: {
            createPayment: '/create-payment-intent',
            confirmPayment: '/confirm-payment',
            sendDownloadLinks: '/send-download-links'
        }
    },
    
    // Configuración de email
    email: {
        supportEmail: 'soporte@tu-dominio.com', // CAMBIAR POR TU EMAIL
        fromName: 'Formaciones Premium'
    },
    
    // Configuración de analytics
    analytics: {
        googleAnalyticsId: 'G-XXXXXXXXXX', // CAMBIAR POR TU ID DE GA4
        enableTracking: true
    },
    
    // Configuración de la aplicación
    app: {
        name: 'Formaciones Premium',
        version: '1.0.0',
        environment: 'development' // 'development' o 'production'
    }
};

// Función para obtener la configuración actual
function getConfig() {
    return CONFIG;
}

// Función para actualizar configuración
function updateConfig(newConfig) {
    Object.assign(CONFIG, newConfig);
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Instrucciones para configuración:
/*
PASOS PARA CONFIGURAR TUS CREDENCIALES:

1. STRIPE:
   - Ve a https://dashboard.stripe.com/
   - Crea una cuenta o inicia sesión
   - Ve a "Developers" > "API keys"
   - Copia tu "Publishable key" (pk_test_... o pk_live_...)
   - Reemplaza 'pk_test_TYooMQauvdEDq54NiTphI7jx' con tu clave real

2. SERVIDOR:
   - Si no tienes servidor backend, puedes usar:
     - Vercel Functions
     - Netlify Functions
     - Cloudflare Workers
     - Un servidor Node.js simple
   
3. EMAIL:
   - Configura un servicio de email como:
     - SendGrid
     - Mailgun
     - Amazon SES
     - O usar mailto: para desarrollo

4. DOMINIO:
   - Reemplaza las URLs de ejemplo con tu dominio real
   - Actualiza los emails con tu dominio real

5. GOOGLE ANALYTICS (opcional):
   - Ve a https://analytics.google.com/
   - Crea una propiedad
   - Copia tu Measurement ID (G-XXXXXXXXXX)
   - Reemplaza en la configuración
*/ 