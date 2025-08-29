# 🚀 Guía de Despliegue para Recibir Pagos Reales

## 📋 **Checklist Previo**

Antes de desplegar, asegúrate de tener:
- ✅ Cuenta de Stripe verificada
- ✅ Claves API de Stripe (pública y secreta)
- ✅ Cuenta de Vercel (gratis)
- ✅ Los archivos de tu landing page

---

## 🔑 **Paso 1: Configurar Stripe**

### **1.1 Obtener tus Claves:**
1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com/)
2. Ve a **Developers → API keys**
3. Copia tu **Publishable key** (pk_live_...)
4. Copia tu **Secret key** (sk_live_...)

### **1.2 Actualizar el Frontend:**
Edita `script.js` línea 7:
```javascript
const STRIPE_PUBLIC_KEY = 'pk_live_TU_CLAVE_PUBLICA_AQUI';
```

---

## 🌐 **Paso 2: Desplegar en Vercel**

### **2.1 Instalar Vercel CLI:**
```bash
npm install -g vercel
```

### **2.2 Inicializar el proyecto:**
```bash
# En tu carpeta del proyecto
npm install
vercel login
```

### **2.3 Desplegar:**
```bash
vercel --prod
```

### **2.4 Configurar Variables de Entorno:**
En el dashboard de Vercel:
1. Ve a tu proyecto
2. **Settings → Environment Variables**
3. Añade:
   - `STRIPE_SECRET_KEY` = `sk_live_tu_clave_secreta`
   - `NODE_ENV` = `production`

---

## 📧 **Paso 3: Configurar Webhooks (Opcional pero Recomendado)**

### **3.1 Crear Webhook en Stripe:**
1. En Stripe Dashboard: **Developers → Webhooks**
2. **+ Add endpoint**
3. URL: `https://tu-dominio.vercel.app/api/webhook`
4. Eventos: `payment_intent.succeeded`

### **3.2 Añadir Secret del Webhook:**
En Vercel Environment Variables:
- `STRIPE_WEBHOOK_SECRET` = `whsec_tu_webhook_secret`

---

## 🧪 **Paso 4: Probar el Sistema**

### **4.1 Tarjetas de Prueba:**
Para probar con tarjetas reales en modo test:
```
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura
CVC: Cualquier 3 dígitos
```

### **4.2 Verificar Flujo Completo:**
1. ✅ Landing page carga correctamente
2. ✅ Carrito funciona
3. ✅ Modal de pago se abre
4. ✅ Pago se procesa
5. ✅ Redirige a página de descarga
6. ✅ Archivos se pueden descargar

---

## 💰 **Paso 5: Activar Pagos Reales**

### **5.1 Cambiar a Modo Live:**
En `script.js`, asegúrate de usar:
```javascript
const STRIPE_PUBLIC_KEY = 'pk_live_...'; // No pk_test_
```

### **5.2 Verificar en Stripe Dashboard:**
- Ve a **Payments** para ver pagos reales
- **Balance** para ver tu dinero
- **Transfers** para transferencias automáticas

---

## 🔄 **Comandos Útiles**

### **Desarrollo Local:**
```bash
vercel dev  # Servidor local con functions
```

### **Actualizar Despliegue:**
```bash
vercel --prod  # Redespliega cambios
```

### **Ver Logs:**
```bash
vercel logs tu-proyecto  # Ver logs del servidor
```

---

## 🛡️ **Seguridad Importante**

### **✅ Hacer:**
- Usar HTTPS (Vercel lo hace automáticamente)
- Mantener secret keys en variables de entorno
- Validar todos los datos en el servidor
- Usar webhooks para confirmación de pagos

### **❌ NO Hacer:**
- Nunca poner secret keys en el código frontend
- No procesar pagos solo en el cliente
- No confiar solo en el frontend para validaciones

---

## 📊 **Monitoreo y Analytics**

### **Dashboard de Stripe:**
- **Payments**: Ver todos los pagos
- **Analytics**: Métricas de ventas
- **Events**: Log de todos los eventos

### **Vercel Analytics:**
- **Functions**: Rendimiento de APIs
- **Usage**: Uso de recursos

---

## 🆘 **Solución de Problemas**

### **Error: "Invalid API Key"**
- Verifica que uses `pk_live_` en frontend
- Verifica que `sk_live_` esté en variables de entorno

### **Error: "CORS"**
- Verifica que el endpoint `/api/create-payment-intent` esté funcionando
- Comprueba que las variables de entorno estén configuradas

### **Error: "Payment failed"**
- Revisa logs en Vercel: `vercel logs`
- Verifica en Stripe Dashboard > Events

### **Los PDFs no se descargan:**
- Verifica que los archivos PDF estén en la carpeta raíz
- Comprueba permisos de archivos

---

## 🎯 **URLs de tu Proyecto**

Después del despliegue tendrás:
- **Landing Page**: `https://tu-proyecto.vercel.app`
- **API Payments**: `https://tu-proyecto.vercel.app/api/create-payment-intent`
- **Descarga**: `https://tu-proyecto.vercel.app/descarga.html`

---

## 📈 **Próximos Pasos Recomendados**

1. **Configurar dominio personalizado**
2. **Añadir Google Analytics**
3. **Configurar email automatizado**
4. **Implementar sistema de cupones**
5. **Añadir más métodos de pago**

---

## 💬 **Soporte**

Si tienes problemas:
1. **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
2. **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)
3. **GitHub Issues**: Para reportar problemas específicos

**¡Tu landing page está lista para recibir pagos reales!** 💰🎉 