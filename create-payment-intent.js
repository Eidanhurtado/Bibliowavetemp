// Netlify Function para crear Payment Intent con Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
    // Headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Manejar preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { items, email } = JSON.parse(event.body);

        // Validar datos
        if (!items || !Array.isArray(items) || items.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Items requeridos' })
            };
        }

        if (!email || !email.includes('@')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email válido requerido' })
            };
        }

        // Productos válidos
        const VALID_PRODUCTS = {
            'ia-que-vende': { name: 'IA que Vende', price: 499 },
            'aprende-ia': { name: 'Aprende IA', price: 499 },
            'arte-dinero': { name: 'El Arte del Dinero', price: 499 },
            'entrena-dinero': { name: 'Entrena tu Dinero', price: 499 }
        };

        // Calcular total y validar productos
        let totalAmount = 0;
        const validItems = [];

        for (const item of items) {
            const product = VALID_PRODUCTS[item.id];
            if (!product) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: `Producto no válido: ${item.id}` })
                };
            }
            totalAmount += product.price;
            validItems.push({
                id: item.id,
                name: product.name,
                price: product.price
            });
        }

        // Crear Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'eur',
            receipt_email: email,
            metadata: {
                items: JSON.stringify(validItems),
                customer_email: email,
                source: 'formaciones_netlify'
            },
            description: `Compra de ${validItems.length} formación(es): ${validItems.map(item => item.name).join(', ')}`
        });

        console.log(`Payment Intent creado: ${paymentIntent.id} para ${email}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                client_secret: paymentIntent.client_secret,
                amount: totalAmount,
                currency: 'eur',
                items: validItems
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error interno del servidor: ' + error.message })
        };
    }
}; 