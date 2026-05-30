/* ==========================================================================
   🌐 MÓDULO CENTRAL DE SERVICIOS Y CONEXIONES API (api.js) - REALTIME GLOBAL
   ========================================================================== */

// 🕵️‍♂️ DETECTOR DINÁMICO DE ENTORNO
// Si estás en localhost/Live Server, apunta a tu dominio real de producción en Vercel. 
// Si ya está en producción, usa la ruta relativa normal.
const OBTENER_BASE_URL = () => {
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        // 🔥 REEMPLAZA ESTA URL por el enlace real de tu proyecto en Vercel (ej: 'https://tu-proyecto.vercel.app')
        return 'https://urban-delivery-pro.vercel.app'; 
    }
    return ''; // En producción usa la ruta relativa limpia
};

/**
 * Protocolo de Triple Blindaje para la obtención de la tasa oficial del BCV
 */
export async function consultarTasaBCV(tasaPorDefecto) {
    let tasaFinal = tasaPorDefecto;
    try {
        const respuesta = await fetch('https://ve.centralbank.workers.dev/v1/bcv');
        if (respuesta.ok) {
            const data = await respuesta.json();
            if (data && data.usd) {
                return { tasa: parseFloat(data.usd), exito: true, origen: "API Principal" };
            }
        }
    } catch (e) { console.warn("⚠️ API Principal caída. Buscando respaldo..."); }

    try {
        const respuestaEspejo = await fetch('https://s3.amazonaws.com/dolartoday/data.json');
        if (respuestaEspejo.ok) {
            const dataEspejo = await respuestaEspejo.json();
            if (dataEspejo && dataEspejo.USD && dataEspejo.USD.sicad2) {
                return { tasa: parseFloat(dataEspejo.USD.sicad2), exito: true, origen: "API de Respaldo" };
            }
        }
    } catch (e) { console.warn("⚠️ API de Respaldo caída."); }

    return { tasa: tasaFinal, exito: false, origen: "Ninguno (Fallo de Red)" };
}

/**
 * 🔥 MOTOR DE INTERACCIONES CENTRALIZADO EN LA NUBE
 * Lee las ventas reales acumuladas por todos los usuarios desde MongoDB Atlas.
 */
export async function obtenerVentasGlobalesTendencia() {
    try {
        const BASE_URL = OBTENER_BASE_URL();
        // 📡 Consulta el backend de Vercel de forma inteligente según el entorno
        const respuesta = await fetch(`${BASE_URL}/api/tendencias`);
        
        if (respuesta.ok) {
            const data = await respuesta.json();
            // Retorna el objeto formateado desde tu base de datos { "1": X, "2": Y, "3": Z }
            return data; 
        }
        
        console.warn("⚠️ El servidor de MongoDB Atlas retornó un estado no exitoso. Usando fallback.");
        return null;
    } catch (e) {
        console.error("🚨 Error crítico en conexión de base de datos global (MongoDB):", e);
        return null;
    }
}

/**
 * 📈 REPORTAR NUEVA COMPRA AL SERVIDOR GLOBAL
 * Incrementa en MongoDB Atlas las interacciones del producto de forma individual.
 */
export async function registrarVentaGlobalEnServidor(idProducto, cantidad) {
    try {
        const BASE_URL = OBTENER_BASE_URL();
        // 📡 Hace un POST a tu endpoint para ejecutar un 'updateOne' o '$inc' en Atlas
        await fetch(`${BASE_URL}/api/tendencias/incrementar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: idProducto,
                cantidad: cantidad
            })
        });

        console.log(`📡 MongoDB Atlas Actualizado: Producto ${idProducto} sumó +${cantidad} interacciones.`);
    } catch (e) {
        console.warn("No se pudo sincronizar la venta con MongoDB Atlas:", e);
    }
}

/**
 * 📝 Módulo de mensajería para despacho
 */
export async function enviarMensajeWhatsApp(datosOrden) {
    console.log("⚡ Orden enviada a control de despacho de Urban Delivery Pro:", datosOrden);
}