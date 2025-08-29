const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { items, email } = JSON.parse(event.body);

        // Validar datos básicos
        if (!items || !email) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Items y email requeridos' })
            };
        }

        // Productos válidos
        const PRODUCTS = {
            'ia-que-vende': { name: 'IA que Vende', price: 499 },
            'aprende-ia': { name: 'Aprende IA', price: 499 },
            'arte-dinero': { name: 'El Arte del Dinero', price: 499 },
            'entrena-dinero': { name: 'Entrena tu Dinero', price: 499 }
        };

        // Calcular total
        let total = 0;
        const validItems = [];
        
        for (const item of items) {
            const product = PRODUCTS[item.id];
            if (product) {
                total += product.price;
                validItems.push({ id: item.id, name: product.name, price: product.price });
            }
        }

        // Crear Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total,
            currency: 'eur',
            receipt_email: email,
            description: `Compra: ${validItems.map(item => item.name).join(', ')}`
        });

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                client_secret: paymentIntent.client_secret,
                amount: total,
                currency: 'eur'
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Error: ' + error.message })
        };
    }
}; 