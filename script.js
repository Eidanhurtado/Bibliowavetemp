// Configuración de productos
const PRODUCTS = {
    'ia-que-vende': {
        id: 'ia-que-vende',
        name: 'IA que Vende',
        price: 4.99,
        image: 'ia-que-vende-portada.png',
        file: 'ia-que-vende-ebook.pdf'
    },
    'aprende-ia': {
        id: 'aprende-ia',
        name: 'Aprende IA',
        price: 4.99,
        image: 'aprende-ia-portada.png',
        file: 'aprende-ia-ebook.pdf'
    },
    'arte-dinero': {
        id: 'arte-dinero',
        name: 'El Arte del Dinero',
        price: 4.99,
        image: 'El arte del dinero web.png',
        file: 'El ARTE DEL DINERO E-book.pdf'
    },
    'entrena-dinero': {
        id: 'entrena-dinero',
        name: 'Entrena tu Dinero',
        price: 4.99,
        image: 'Portada web entrena tu dinero.png',
        file: 'ENTRENA TU DINERO E-book.pdf'
    }
};

// Estado del carrito
let cart = [];
let stripe;
let elements;
let cardElement;

// Configuración de Stripe - MODO LIVE PARA VENDER YA
const STRIPE_PUBLIC_KEY = 'pk_live_51RgSxhH8lUWRe8kSiXZ5ZQLd97mKaKWEUkdGZsW1y1Ig8jBqNyySElabg5eHQayO85DTmUzz02STX9zW7lICrWub00yYPci4nP';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeStripe();
    initializeEventListeners();
    loadCartFromStorage();
    updateCartUI();
    
    // DETECTAR MODO LOCAL
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' || 
                   window.location.protocol === 'file:';
    
    if (isLocal) {
        console.log('🧪 MODO LOCAL DETECTADO');
        // Mostrar notificación después de cargar la página
        setTimeout(() => {
            showNotification('🧪 Modo Local: Los pagos serán simulados para pruebas', 'info');
        }, 2000);
    }
});

// Inicializar Stripe
function initializeStripe() {
    try {
        stripe = Stripe(STRIPE_PUBLIC_KEY);
        elements = stripe.elements();
        
        // Crear elemento de tarjeta
        cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#9e2146',
                },
            },
        });

        // Manejar errores de Stripe
        cardElement.on('change', function(event) {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
        
    } catch (error) {
        console.error('Error inicializando Stripe:', error);
        showNotification('Error al cargar el sistema de pagos', 'error');
    }
}

// Inicializar event listeners
function initializeEventListeners() {
    // Botones "Comprar ahora"
    document.querySelectorAll('.buy-now-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            buyNow(productId);
        });
    });

    // Botones "Añadir al carrito"
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            addToCart(productId);
        });
    });

    // Carrito
    document.getElementById('cartBtn').addEventListener('click', openCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);
    document.getElementById('checkoutBtn').addEventListener('click', openPaymentModal);

    // Modales
    document.getElementById('closePaymentModal').addEventListener('click', closePaymentModal);
    document.getElementById('closeSuccessModal').addEventListener('click', closeSuccessModal);
    document.getElementById('overlay').addEventListener('click', closeAllModals);

    // Formulario de pago
    document.getElementById('payment-form').addEventListener('submit', handlePayment);

    // Scroll suave al hacer clic en el logo
    document.querySelector('.logo').addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Funciones del carrito
function addToCart(productId) {
    const product = PRODUCTS[productId];
    if (!product) return;

    // Verificar si ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        showNotification('Este producto ya está en tu carrito', 'info');
        return;
    }

    cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
    });

    saveCartToStorage();
    updateCartUI();
    showNotification('Producto añadido al carrito', 'success');
    
    // Animar el botón
    animateButton(event.target);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
    showNotification('Producto eliminado del carrito', 'info');
}

function buyNow(productId) {
    const product = PRODUCTS[productId];
    if (!product) return;

    // Limpiar carrito y añadir solo este producto
    cart = [{
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
    }];

    saveCartToStorage();
    updateCartUI();
    openPaymentModal();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Actualizar contador
    cartCount.textContent = cart.length;

    // Actualizar items del carrito
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty">Tu carrito está vacío</div>';
        cartTotal.textContent = '0.00';
        checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">€${item.price.toFixed(2)}</div>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotal.textContent = total.toFixed(2);
        checkoutBtn.disabled = false;
    }
}

// Funciones de almacenamiento
function saveCartToStorage() {
    localStorage.setItem('ebooks_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('ebooks_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Funciones de UI
function openCart() {
    document.getElementById('cartSidebar').classList.add('open');
    document.getElementById('overlay').classList.add('show');
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
}

function openPaymentModal() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }

    const modal = document.getElementById('paymentModal');
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');

    // Actualizar resumen del pedido
    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.name}</span>
            <span>€${item.price.toFixed(2)}</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    orderTotal.textContent = total.toFixed(2);

    // Montar elemento de tarjeta solo si no está montado
    try {
        if (cardElement && !cardElement._mounted) {
            cardElement.mount('#card-element');
        }
    } catch (error) {
        console.error('Error montando elemento de tarjeta:', error);
        showNotification('Error al cargar el formulario de pago', 'error');
        return;
    }

    modal.classList.add('show');
    closeCart();
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('show');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
}

function closeAllModals() {
    closeCart();
    closePaymentModal();
    closeSuccessModal();
}

// Manejo de pagos
async function handlePayment(event) {
    event.preventDefault();

    const submitButton = document.getElementById('submit-payment');
    const email = document.getElementById('email').value;

    if (!email) {
        showNotification('Por favor, introduce tu email', 'error');
        return;
    }

    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }

    // Deshabilitar botón y mostrar loading
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

    try {
        // Calcular total
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const amountInCents = Math.round(total * 100);

        // Crear PaymentIntent en el servidor (o simular localmente)
        const paymentIntent = await createPaymentIntent(amountInCents, email);

        // DETECCIÓN DE ENTORNO LOCAL
        const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.protocol === 'file:';

        if (isLocal && paymentIntent.client_secret.includes('test_local')) {
            console.log('🧪 MODO LOCAL - Simulando pago exitoso');
            showNotification('¡Pago simulado exitoso! (Modo local)', 'success');
            
            // Simular delay de procesamiento
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Pago exitoso simulado
            handleSuccessfulPayment();
            return;
        }

        // MODO PRODUCCIÓN - Confirmar pago con Stripe
        const {error} = await stripe.confirmCardPayment(paymentIntent.client_secret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    email: email,
                },
            }
        });

        if (error) {
            throw new Error(error.message);
        }

        // Pago exitoso
        handleSuccessfulPayment();

    } catch (error) {
        showNotification(`Error en el pago: ${error.message}`, 'error');
        console.error('Error:', error);
    } finally {
        // Restaurar botón
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        submitButton.innerHTML = '<i class="fas fa-lock"></i> Pagar de Forma Segura';
    }
}

// Crear PaymentIntent en el servidor
async function createPaymentIntent(amount, email) {
    try {
        console.log('Enviando datos a Netlify:', { items: cart.map(item => ({ id: item.id })), email });
        
        // DETECCIÓN DE ENTORNO LOCAL
        const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.protocol === 'file:';
        
        if (isLocal) {
            console.log('🧪 MODO LOCAL DETECTADO - Simulando Payment Intent');
            // Simular respuesta del servidor para testing local
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
            
            const total = cart.reduce((sum, item) => sum + item.price, 0);
            const amountInCents = Math.round(total * 100);
            
            return {
                client_secret: 'pi_test_local_' + Date.now() + '_secret_test',
                amount: amountInCents,
                currency: 'eur',
                items: cart.map(item => ({ id: item.id, name: item.name, price: Math.round(item.price * 100) }))
            };
        }
        
        // MODO PRODUCCIÓN (Netlify)
        const response = await fetch('/.netlify/functions/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: cart.map(item => ({ id: item.id })),
                email: email
            })
        });

        console.log('Respuesta del servidor:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Error del servidor:', errorData);
            throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);
        return data;

    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error(`No se pudo procesar el pago: ${error.message}`);
    }
}

function handleSuccessfulPayment() {
    // Obtener productos del carrito antes de limpiarlo
    const purchasedItems = [...cart];
    
    // Limpiar carrito
    cart = [];
    saveCartToStorage();
    updateCartUI();

    // Cerrar modal de pago
    closePaymentModal();

    // Redirigir a página de descarga con los productos comprados
    redirectToDownloadPage(purchasedItems);
}

// Función para redirigir a la página de descarga
function redirectToDownloadPage(purchasedItems) {
    // Crear URL con los productos comprados
    const params = new URLSearchParams();
    params.set('items', JSON.stringify(purchasedItems.map(item => ({ id: item.id }))));
    params.set('success', 'true');
    params.set('timestamp', Date.now());
    
    // Redirigir a la página de descarga
    window.location.href = `descarga.html?${params.toString()}`;
}

// Funciones de utilidad
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    // Añadir estilos si no existen
    if (!document.querySelector('.notification-styles')) {
        const styles = document.createElement('style');
        styles.className = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                min-width: 300px;
                overflow: hidden;
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification-content {
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .notification-success { border-left: 4px solid #10b981; }
            .notification-error { border-left: 4px solid #ef4444; }
            .notification-info { border-left: 4px solid #3b82f6; }
            .notification-success i { color: #10b981; }
            .notification-error i { color: #ef4444; }
            .notification-info i { color: #3b82f6; }
        `;
        document.head.appendChild(styles);
    }

    // Añadir al DOM
    document.body.appendChild(notification);

    // Mostrar
    setTimeout(() => notification.classList.add('show'), 100);

    // Ocultar y eliminar
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'info': return 'info-circle';
        default: return 'info-circle';
    }
}

function animateButton(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

// Manejar errores de Stripe
function handleStripeErrors() {
    cardElement.on('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
}

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos que deben animarse
    document.querySelectorAll('.product-card, .feature').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Inicializar animaciones cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeScrollAnimations, 500);
});

// Manejo de responsive para el menú
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        document.getElementById('cartSidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('show');
    }
});

// Smooth scroll para navegación
function smoothScrollTo(elementId) {
    document.getElementById(elementId).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Preloader (opcional)
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Configuración adicional para el entorno de desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Modo de desarrollo activado');
    
    // En desarrollo, simular pagos exitosos siempre
    window.DEV_MODE = true;
}

// Funciones para testing (solo en desarrollo)
if (window.DEV_MODE) {
    window.testFunctions = {
        addAllToCart: () => {
            Object.keys(PRODUCTS).forEach(id => addToCart(id));
        },
        clearCart: () => {
            cart = [];
            saveCartToStorage();
            updateCartUI();
        },
        simulatePayment: () => {
            handleSuccessfulPayment();
        }
    };
}

// Analytics simulado (reemplazar con Google Analytics real)
function trackEvent(action, category, label) {
    if (window.gtag) {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    } else {
        console.log(`Analytics: ${category} - ${action} - ${label}`);
    }
}

// Tracking de eventos importantes
document.addEventListener('DOMContentLoaded', function() {
    // Track page view
    trackEvent('page_view', 'engagement', 'landing_page');
    
    // Track button clicks
    document.querySelectorAll('.buy-now-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            trackEvent('buy_now_click', 'ecommerce', productId);
        });
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            trackEvent('add_to_cart', 'ecommerce', productId);
        });
    });
});

// Manejo de errores globales
window.addEventListener('error', function(event) {
    console.error('Error global:', event.error);
    // En producción, enviar a servicio de logging
});

// Service Worker para PWA (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registrado exitosamente');
            })
            .catch(function(registrationError) {
                console.log('SW falló al registrarse');
            });
    });
} 