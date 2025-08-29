# 📚 Landing Page de E-books Premium

Una landing page moderna y profesional para vender e-books con carrito de compras integrado y procesamiento de pagos con Stripe.

## ✨ Características

- 🎨 **Diseño moderno y responsive**
- 🛒 **Carrito de compras funcional**
- 💳 **Integración con Stripe para pagos seguros**
- 📱 **Completamente responsive**
- ⚡ **Carga rápida y optimizada**
- 🔒 **Pagos seguros**
- 📧 **Sistema de notificaciones**
- 💾 **Persistencia del carrito en localStorage**

## 🚀 Inicio Rápido

### 1. Estructura de Archivos

```
landing-page/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # JavaScript principal
├── config.js           # Configuración
├── README.md           # Este archivo
└── assets/             # Imágenes de los e-books
    ├── ia-que-vende-portada.png
    ├── aprende-ia-portada.png
    ├── El arte del dinero web.png
    └── Portada web entrena tu dinero.png
```

### 2. Abrir la Landing Page

1. Simplemente abre `index.html` en tu navegador web
2. O usa un servidor local para una mejor experiencia:
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   
   # Con PHP
   php -S localhost:8000
   ```

## ⚙️ Configuración para Producción

### 1. Configurar Stripe

1. **Crear cuenta en Stripe:**
   - Ve a [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
   - Crea una cuenta o inicia sesión

2. **Obtener claves API:**
   - Ve a "Developers" > "API keys"
   - Copia tu **Publishable key** (pk_test_... para pruebas, pk_live_... para producción)

3. **Actualizar configuración:**
   - Abre `script.js`
   - Busca `STRIPE_PUBLIC_KEY`
   - Reemplaza con tu clave real:
   ```javascript
   const STRIPE_PUBLIC_KEY = 'pk_live_tu_clave_real_aqui';
   ```

### 2. Configurar Servidor Backend (Requerido para producción)

Para pagos reales necesitas un servidor backend. Opciones recomendadas:

#### Opción A: Vercel + Serverless Functions
```javascript
// api/create-payment-intent.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { amount, email } = req.body;
            
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'eur',
                receipt_email: email,
            });
            
            res.status(200).json({
                client_secret: paymentIntent.client_secret
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
```

#### Opción B: Netlify Functions
```javascript
// netlify/functions/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
    if (event.httpMethod === 'POST') {
        try {
            const { amount, email } = JSON.parse(event.body);
            
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'eur',
                receipt_email: email,
            });
            
            return {
                statusCode: 200,
                body: JSON.stringify({
                    client_secret: paymentIntent.client_secret
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
};
```

### 3. Variables de Entorno

Crea un archivo `.env` en tu servidor con:

```env
STRIPE_SECRET_KEY=sk_live_tu_clave_secreta_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui
EMAIL_SERVICE_API_KEY=tu_api_key_de_email
```

### 4. Configurar Webhooks de Stripe

1. Ve a Stripe Dashboard > "Developers" > "Webhooks"
2. Añade endpoint: `https://tu-dominio.com/api/stripe-webhook`
3. Selecciona eventos: `payment_intent.succeeded`
4. Copia el signing secret y añádelo a tus variables de entorno

## 📧 Configuración de Email

### Usando SendGrid

```javascript
// En tu servidor
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendDownloadLinks(email, purchasedProducts) {
    const msg = {
        to: email,
        from: 'noreply@tu-dominio.com',
        subject: 'Tus E-books - Enlaces de Descarga',
        html: `
            <h2>¡Gracias por tu compra!</h2>
            <p>Aquí tienes los enlaces de descarga de tus e-books:</p>
            ${purchasedProducts.map(product => `
                <p><strong>${product.name}</strong>: <a href="${product.downloadUrl}">Descargar</a></p>
            `).join('')}
        `
    };
    
    await sgMail.send(msg);
}
```

## 🎨 Personalización

### Cambiar Colores

Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #6366f1;      /* Color principal */
    --secondary-color: #8b5cf6;    /* Color secundario */
    --accent-color: #f59e0b;       /* Color de acento */
    /* ... más variables */
}
```

### Cambiar Productos

Edita el objeto `PRODUCTS` en `script.js`:

```javascript
const PRODUCTS = {
    'tu-ebook': {
        id: 'tu-ebook',
        name: 'Nombre de tu E-book',
        price: 9.99,
        image: 'ruta-a-tu-imagen.png',
        file: 'ruta-a-tu-pdf.pdf'
    }
};
```

### Cambiar Textos

Edita directamente el HTML en `index.html`:

```html
<h1 class="hero-title">Tu Título Personalizado</h1>
<p class="hero-subtitle">Tu descripción personalizada</p>
```

## 🔒 Seguridad

- ✅ **NUNCA** pongas tu clave secreta de Stripe en el frontend
- ✅ Usa HTTPS en producción
- ✅ Valida todos los datos en el servidor
- ✅ Implementa rate limiting
- ✅ Verifica webhooks de Stripe

## 📱 Responsive Design

La landing page está optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1200px+)

## 🚀 Optimización para Producción

### 1. Comprimir Imágenes
```bash
# Usar herramientas como TinyPNG o ImageOptim
# O automatizar con:
npm install -g imagemin-cli
imagemin assets/*.png --out-dir=assets/optimized
```

### 2. Minificar CSS y JS
```bash
# Instalar herramientas
npm install -g uglifycss uglify-js

# Minificar
uglifycss styles.css > styles.min.css
uglifyjs script.js > script.min.js
```

### 3. Configurar CDN
- Usa Cloudflare, AWS CloudFront, o similar
- Configura caché para assets estáticos
- Habilita compresión gzip

## 🐛 Solución de Problemas

### El carrito no se guarda
- Verifica que localStorage esté habilitado
- Comprueba la consola del navegador por errores

### Los pagos no funcionan
- Verifica tu clave pública de Stripe
- Asegúrate de que el servidor backend esté funcionando
- Revisa los webhooks en Stripe Dashboard

### Las imágenes no cargan
- Verifica las rutas de las imágenes
- Asegúrate de que los archivos existen
- Comprueba permisos de archivos

## 📈 Analytics

### Google Analytics 4

1. Crea una propiedad en [Google Analytics](https://analytics.google.com/)
2. Obtén tu Measurement ID (G-XXXXXXXXXX)
3. Añade el código de tracking:

```html
<!-- En el <head> de index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🔄 Actualizaciones Futuras

Características planeadas:
- [ ] Sistema de descuentos/cupones
- [ ] Múltiples idiomas
- [ ] Reviews de productos
- [ ] Sistema de afiliados
- [ ] Dashboard de administración

## 📞 Soporte

Para soporte técnico:
- 📧 Email: soporte@tu-dominio.com
- 💬 Telegram: @tu_usuario
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/tu-repo/issues)

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

**¡Listo para vender tus e-books!** 🚀

Si necesitas ayuda con la configuración, no dudes en contactar. 