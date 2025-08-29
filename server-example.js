// Ejemplo de servidor Node.js/Express para manejar pagos de Stripe
// Este archivo es solo un ejemplo - úsalo cuando necesites implementar pagos reales

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir archivos estáticos

// Configuración de email (ejemplo con Gmail)
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Productos disponibles (debe coincidir con el frontend)
const PRODUCTS = {
    'ia-que-vende': {
        id: 'ia-que-vende',
        name: 'IA que Vende',
        price: 499, // en centavos (€4.99)
        file: 'ia-que-vende-ebook.pdf'
    },
    'aprende-ia': {
        id: 'aprende-ia',
        name: 'Aprende IA',
        price: 499,
        file: 'aprende-ia-ebook.pdf'
    },
    'arte-dinero': {
        id: 'arte-dinero',
        name: 'El Arte del Dinero',
        price: 499,
        file: 'El ARTE DEL DINERO E-book.pdf'
    },
    'entrena-dinero': {
        id: 'entrena-dinero',
        name: 'Entrena tu Dinero',
        price: 499,
        file: 'ENTRENA TU DINERO E-book.pdf'
    }
};

// Ruta para crear Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { items, email } = req.body;

        // Validar que los productos existen y calcular el total
        let totalAmount = 0;
        const validItems = [];

        for (const item of items) {
            const product = PRODUCTS[item.id];
            if (!product) {
                return res.status(400).json({ error: `Producto no válido: ${item.id}` });
            }
            totalAmount += product.price;
            validItems.push(product);
        }

        // Crear Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'eur',
            receipt_email: email,
            metadata: {
                items: JSON.stringify(validItems.map(item => ({ id: item.id, name: item.name }))),
                customer_email: email
            }
        });

        res.json({
            client_secret: paymentIntent.client_secret,
            amount: totalAmount
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook de Stripe para confirmación de pagos
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar el evento
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await handleSuccessfulPayment(paymentIntent);
            break;
        
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            await handleFailedPayment(failedPayment);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

// Manejar pago exitoso
async function handleSuccessfulPayment(paymentIntent) {
    try {
        const { customer_email, items } = paymentIntent.metadata;
        const purchasedItems = JSON.parse(items);

        console.log(`Pago exitoso para ${customer_email}:`, purchasedItems);

        // Generar enlaces de descarga seguros (implementar según tus necesidades)
        const downloadLinks = await generateDownloadLinks(purchasedItems);

        // Enviar email con enlaces de descarga
        await sendDownloadEmail(customer_email, purchasedItems, downloadLinks);

        // Registrar la compra en base de datos (opcional)
        // await recordPurchase(customer_email, purchasedItems, paymentIntent.id);

    } catch (error) {
        console.error('Error handling successful payment:', error);
    }
}

// Manejar pago fallido
async function handleFailedPayment(paymentIntent) {
    const { customer_email } = paymentIntent.metadata;
    console.log(`Pago fallido para ${customer_email}`);
    
    // Opcional: Enviar email de notificación de pago fallido
    // await sendPaymentFailedEmail(customer_email);
}

// Generar enlaces de descarga seguros
async function generateDownloadLinks(items) {
    const links = {};
    
    for (const item of items) {
        // Generar token único para descarga segura
        const downloadToken = generateSecureToken();
        
        // Guardar token en base de datos con expiración (ej: 7 días)
        // await storeDownloadToken(downloadToken, item.id, Date.now() + 7*24*60*60*1000);
        
        // Crear enlace de descarga
        links[item.id] = `${process.env.BASE_URL}/download/${downloadToken}`;
    }
    
    return links;
}

// Enviar email con enlaces de descarga
async function sendDownloadEmail(email, items, downloadLinks) {
    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${item.name}</strong>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <a href="${downloadLinks[item.id]}" 
                   style="background: #6366f1; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">
                   Descargar
                </a>
            </td>
        </tr>
    `).join('');

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@tu-dominio.com',
        to: email,
        subject: '📚 Tus E-books - Enlaces de Descarga',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6366f1;">¡Gracias por tu compra!</h2>
                
                <p>Hola,</p>
                
                <p>Tu pago ha sido procesado exitosamente. Aquí tienes los enlaces de descarga de tus e-books:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 10px; text-align: left;">E-book</th>
                            <th style="padding: 10px; text-align: left;">Descarga</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">📱 Instrucciones de Descarga:</h3>
                    <ul>
                        <li>Los enlaces están disponibles por 7 días</li>
                        <li>Puedes descargar cada e-book hasta 3 veces</li>
                        <li>Los archivos están en formato PDF</li>
                        <li>Son compatibles con todos los dispositivos</li>
                    </ul>
                </div>
                
                <p>Si tienes algún problema con la descarga, no dudes en contactarnos.</p>
                
                <p>¡Disfruta de tu lectura!</p>
                
                <hr style="margin: 30px 0;">
                
                <p style="color: #666; font-size: 12px;">
                    E-books Premium - Transformando conocimiento en resultados<br>
                    Si no solicitaste este email, puedes ignorarlo.
                </p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de descarga enviado a ${email}`);
}

// Ruta para descarga segura
app.get('/download/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        // Verificar token en base de datos
        // const downloadData = await verifyDownloadToken(token);
        
        // Por ahora, simulamos la verificación
        const downloadData = { valid: true, file: 'example.pdf', productId: 'ia-que-vende' };
        
        if (!downloadData.valid) {
            return res.status(404).send('Enlace de descarga no válido o expirado');
        }
        
        // Buscar producto
        const product = Object.values(PRODUCTS).find(p => p.id === downloadData.productId);
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }
        
        // Servir archivo (implementar según tu estructura de archivos)
        const filePath = `./files/${product.file}`;
        res.download(filePath, product.file);
        
        // Actualizar contador de descargas
        // await incrementDownloadCount(token);
        
    } catch (error) {
        console.error('Error in download:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Generar token seguro
function generateSecureToken() {
    return require('crypto').randomBytes(32).toString('hex');
}

// Ruta de salud del servidor
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Salud del servidor: http://localhost:${PORT}/health`);
});

// Exportar para testing
module.exports = app;

/* 
VARIABLES DE ENTORNO REQUERIDAS:

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=noreply@tu-dominio.com
BASE_URL=https://tu-dominio.com
PORT=3001

COMANDOS PARA INSTALAR DEPENDENCIAS:

npm init -y
npm install express cors stripe nodemailer dotenv
npm install --save-dev nodemon

COMANDO PARA EJECUTAR:

npm run dev  # con nodemon
npm start    # producción

ARCHIVO package.json:
{
    "scripts": {
        "start": "node server-example.js",
        "dev": "nodemon server-example.js"
    }
}
*/ 